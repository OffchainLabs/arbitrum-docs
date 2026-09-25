/**
 * Turn one `offchainlabs/stylus-by-example` `page.mdx` into one page of this site.
 *
 * Everything here is a pure string transform over the source text, so the suite can pin each
 * rule to a named case instead of diffing nineteen rendered pages. The runner
 * (`scripts/generate-stylus-examples.ts`) owns the clone, the writes and `--check`.
 *
 * Ported from the content-transformation half of arbitrum-docs `scripts/sync-stylus-content.js`.
 */
import { extractRefs } from './doc-links.ts';

/** What {@link parseObjectLiteral} can return: JSON's value space, nothing more. */
export type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;
export interface JsonObject {
  [key: string]: JsonValue;
}

/** The two fields a page's frontmatter takes from upstream's `metadata` export. */
export interface StylusMetadata {
  title: string;
  description: string;
}

/** A published section: its directory under the output root and its pages, in sidebar order. */
export interface SectionPages {
  dir: string;
  pages: readonly string[];
}

const isJsonObject = (value: JsonValue): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * The `export const metadata = { … };` block every upstream page opens with. Non-greedy up to the
 * first `};`, which is upstream's own rule: the object is a flat pair of string literals, and a
 * nested object would be a shape this generator has never seen and should not guess at.
 *
 * A `};` inside a string value would truncate the capture. That is not a silent failure: the
 * parser below then stops on an unterminated string and names the file.
 */
const METADATA_PATTERN = /export\s+const\s+metadata\s*=\s*({[\s\S]*?});/;

/** A same-directory markdown destination, e.g. `[ABI Encode](./abi_encode)`. */
const RELATIVE_LINK_PATTERN = /^\.\/([\w-]+)$/;

/** The fence that opens the first Rust snippet, and the anchor for the banner. */
const RUST_FENCE = '```rust';

/** The only bare words the literal grammar accepts. Anything else identifier-shaped is a call. */
const KEYWORDS = new Map<string, JsonValue>([
  ['true', true],
  ['false', false],
  ['null', null],
]);

/** The escape sequences a string value may use. A Map, so no prototype key resolves by accident. */
const STRING_ESCAPES = new Map<string, string>([
  ["'", "'"],
  ['"', '"'],
  ['\\', '\\'],
  ['/', '/'],
  ['b', '\b'],
  ['f', '\f'],
  ['n', '\n'],
  ['r', '\r'],
  ['t', '\t'],
]);

/** Sticky, so each `exec` matches at the cursor or not at all. Reset `lastIndex` before every use. */
const IDENTIFIER = /[A-Za-z_$][A-Za-z0-9_$]*/y;
const NUMBER = /-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/y;

/**
 * Parse a JavaScript object literal without executing it.
 *
 * The grammar is deliberately smaller than JavaScript: an object or array of strings, numbers,
 * `true`, `false` and `null`, with bare or quoted property names and an optional trailing comma.
 * That is JSON plus the four things upstream's `metadata` blocks actually use — single quotes,
 * unquoted keys, trailing commas, and values wrapped onto the next line — and nothing else.
 * Every other token stops the run: an identifier that is not a keyword, a template literal, a
 * parenthesis, an operator, a comment. There is no fallback to evaluation.
 *
 * This replaces a `new Function(\`return ${literal}\`)()`. The distinction matters because the
 * literal comes out of a third-party repository that this generator clones unpinned, on a weekly
 * cron in a job holding `contents: write`, and on a maintainer's own machine whenever they run
 * `pnpm stylus:generate`. Cloning a repository copies bytes; evaluating one of them runs them, at
 * whatever privilege the run has. Reading them as data is the whole point here.
 *
 * @param text the literal, starting at `{` or `[`
 * @param context a path, for the error message
 */
export function parseObjectLiteral(text: string, context: string): JsonValue {
  let cursor = 0;

  // A declaration rather than an arrow, so a call to it narrows like a `throw` would.
  function fail(message: string): never {
    const line = text.slice(0, cursor).split('\n').length;
    const near = JSON.stringify(text.slice(cursor, cursor + 24));
    throw new Error(`${context}: ${message} (line ${line} of the literal, near ${near})`);
  }

  const skipSpace = () => {
    while (cursor < text.length && /\s/.test(text[cursor])) cursor++;
  };

  const parseString = (): string => {
    const quote = text[cursor++];
    let out = '';
    while (cursor < text.length) {
      const char = text[cursor];
      if (char === quote) {
        cursor++;
        return out;
      }
      if (char === '\n' || char === '\r') fail('a literal newline inside a quoted string');
      if (char !== '\\') {
        out += char;
        cursor++;
        continue;
      }
      cursor++;
      const escape = text[cursor];
      if (escape === undefined) fail('the literal ends inside an escape sequence');
      if (escape === 'u' || escape === 'x') {
        const width = escape === 'u' ? 4 : 2;
        const digits = text.slice(cursor + 1, cursor + 1 + width);
        if (!new RegExp(`^[0-9a-fA-F]{${width}}$`).test(digits)) {
          fail(`a malformed \\${escape} escape`);
        }
        out += String.fromCharCode(parseInt(digits, 16));
        cursor += 1 + width;
        continue;
      }
      const unescaped = STRING_ESCAPES.get(escape);
      if (unescaped === undefined) fail(`an unsupported escape sequence \`\\${escape}\``);
      out += unescaped;
      cursor++;
    }
    return fail('an unterminated string');
  };

  const parsePropertyName = (): string => {
    if (text[cursor] === "'" || text[cursor] === '"') return parseString();
    IDENTIFIER.lastIndex = cursor;
    const match = IDENTIFIER.exec(text);
    if (!match) fail('expected a property name');
    cursor = IDENTIFIER.lastIndex;
    return match[0];
  };

  const parseObject = (): JsonObject => {
    cursor++; // past `{`
    // Null-prototype, so a `__proto__` or `constructor` key is an ordinary own property rather
    // than a write to the prototype chain. The spread at the end hands back a plain object.
    const result: JsonObject = Object.create(null);
    skipSpace();
    if (text[cursor] === '}') {
      cursor++;
      return { ...result };
    }
    for (;;) {
      skipSpace();
      const key = parsePropertyName();
      if (key in result) fail(`a duplicate property \`${key}\``);
      skipSpace();
      if (text[cursor] !== ':') fail(`expected \`:\` after the property name \`${key}\``);
      cursor++;
      result[key] = parseValue();
      skipSpace();
      if (text[cursor] === ',') {
        cursor++;
        skipSpace();
      } else if (text[cursor] !== '}') {
        fail('expected `,` or `}` after a property value');
      }
      if (text[cursor] === '}') {
        cursor++;
        return { ...result };
      }
    }
  };

  const parseArray = (): JsonValue[] => {
    cursor++; // past `[`
    const result: JsonValue[] = [];
    skipSpace();
    if (text[cursor] === ']') {
      cursor++;
      return result;
    }
    for (;;) {
      result.push(parseValue());
      skipSpace();
      if (text[cursor] === ',') {
        cursor++;
        skipSpace();
      } else if (text[cursor] !== ']') {
        fail('expected `,` or `]` after an array element');
      }
      if (text[cursor] === ']') {
        cursor++;
        return result;
      }
    }
  };

  function parseValue(): JsonValue {
    skipSpace();
    if (cursor >= text.length) fail('the literal ends where a value was expected');
    const char = text[cursor];
    if (char === '{') return parseObject();
    if (char === '[') return parseArray();
    if (char === "'" || char === '"') return parseString();
    if (char === '-' || (char >= '0' && char <= '9')) {
      NUMBER.lastIndex = cursor;
      const match = NUMBER.exec(text);
      if (!match) fail('a malformed number');
      cursor = NUMBER.lastIndex;
      return Number(match[0]);
    }
    IDENTIFIER.lastIndex = cursor;
    const word = IDENTIFIER.exec(text);
    const keyword = word ? KEYWORDS.get(word[0]) : undefined;
    if (keyword !== undefined) {
      cursor = IDENTIFIER.lastIndex;
      return keyword;
    }
    return fail('expected a string, number, `true`, `false`, `null`, array or object');
  }

  const value = parseValue();
  skipSpace();
  if (cursor < text.length) fail('unexpected text after the end of the literal');
  return value;
}

/**
 * Read the metadata object literal.
 *
 * It is a JavaScript expression, not JSON — upstream wraps long descriptions across lines, mixes
 * single and double quotes, and leaves a trailing comma — so `JSON.parse` will not do. It is read
 * with {@link parseObjectLiteral}, which accepts exactly that grammar as **data** and throws on
 * anything outside it. It is never evaluated: see that function for why the difference matters
 * when the input is an unpinned third-party repository read on a weekly cron.
 *
 * `title` and `description` are whitespace-normalized (runs of whitespace collapsed to one space,
 * ends trimmed) before being returned. This is a generator-level fix for FS-2747's A14
 * `content:lint` rule, not an editorial one: upstream's own metadata strings occasionally carry a
 * stray doubled space or trailing space (e.g. `basic_examples/variables.mdx`'s description), which
 * is noise rather than a wording choice, and normalizing it here means it stays fixed across every
 * future `stylus:generate` run instead of needing a hand-edit upstream would just overwrite.
 *
 * The object comes back whole, any other key upstream wrote included, with the two fields
 * normalized in place.
 *
 * @param source the full text of an upstream `page.mdx`
 * @param context a path, for the error message
 */
export function parseMetadata(source: string, context: string): JsonObject & StylusMetadata {
  const match = source.match(METADATA_PATTERN);
  if (!match?.[1]) {
    throw new Error(`${context}: no \`export const metadata\` block; cannot build frontmatter`);
  }

  const parsed = parseObjectLiteral(match[1], `${context}: could not read the metadata object`);
  // The pattern captures from a `{`, so the literal is always an object; an empty one stands in
  // for the impossible case and fails on `title` below, as indexing a non-object did before.
  const metadata: JsonObject = isJsonObject(parsed) ? parsed : {};

  const normalized = (field: keyof StylusMetadata): string => {
    const value = metadata[field];
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`${context}: metadata.${field} is missing or not a string`);
    }
    return value.replace(/\s+/g, ' ').trim();
  };
  const title = normalized('title');
  const description = normalized('description');
  return Object.assign(metadata, { title, description });
}

/**
 * Quote a value as a single-quoted YAML scalar, doubling any apostrophe.
 *
 * Prettier re-quotes the frontmatter afterwards (a value containing an apostrophe comes out
 * double-quoted, which is what the committed pages look like), so this only has to be valid
 * YAML, not canonical YAML.
 */
export function yamlScalar(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/**
 * Render the frontmatter block for a page.
 *
 * `title` and `description` come from the source; the rest are constants, and are emitted
 * unquoted because that is the scalar style the committed pages use and Prettier preserves a
 * plain scalar rather than quoting it.
 */
export function renderFrontmatter(
  metadata: StylusMetadata,
  defaults: Readonly<Record<string, string>>,
): string {
  return [
    '---',
    `title: ${yamlScalar(metadata.title)}`,
    `description: ${yamlScalar(metadata.description)}`,
    ...Object.entries(defaults).map(([key, value]) =>
      key === 'content_type' ? `${key}: ${yamlScalar(value)}` : `${key}: ${value}`,
    ),
    '---',
  ].join('\n');
}

/**
 * Rewrite upstream's same-directory links onto this site's URLs.
 *
 * Upstream hardcodes `/stylus-by-example/basic_examples/<slug>` as the destination, which is only
 * right because the one relative link in the published set happens to sit in `basic_examples`.
 * Resolving the slug against the published set instead gets the same answer for that link and the
 * right answer for one written from an `applications` page. A slug that resolves nowhere throws:
 * a link to an example this site does not publish would otherwise ship as a 404 that only
 * `check-links` would catch, and only after the page had been committed.
 */
export function rewriteRelativeLinks(
  content: string,
  {
    sections,
    baseUrl,
    context,
  }: { sections: readonly SectionPages[]; baseUrl: string; context: string },
): string {
  // The shared scanner excludes frontmatter and code. Work backwards through its original
  // offsets so replacing one destination cannot shift any of the remaining destinations.
  // `extractRefs` types `range` as nullable because a JSX expression attribute has none; a
  // markdown ref always has one, so the `range` test drops nothing and only narrows the type.
  const links = extractRefs(content)
    .filter(
      (ref): ref is typeof ref & { range: [number, number] } =>
        ref.surface === 'markdown' && ref.range !== null && RELATIVE_LINK_PATTERN.test(ref.rawUrl),
    )
    .sort((a, b) => b.range[0] - a.range[0]);
  for (const {
    rawUrl,
    range: [start, end],
  } of links) {
    const slug = rawUrl.slice(2);
    const owners = sections.filter((section) => section.pages.includes(slug));
    if (owners.length !== 1) {
      throw new Error(
        `${context}: the link \`${rawUrl}\` points at \`${slug}\`, which ` +
          (owners.length === 0
            ? 'this site does not publish. Add it to scripts/data/stylus-examples.data.ts, or ' +
              'get the link changed upstream.'
            : `appears in ${owners.length} sections, so the destination is ambiguous.`),
      );
    }
    const [owner] = owners;
    if (!owner) continue; // unreachable: exactly one owner was checked above
    content = content.slice(0, start) + `${baseUrl}/${owner.dir}/${slug}` + content.slice(end);
  }
  return content;
}

/**
 * Splice the not-for-production banner in ahead of the first Rust snippet.
 *
 * Position is upstream's: two lines above the opening fence, so the banner lands under the
 * heading that introduces the snippet rather than between the heading and its prose. The extra
 * blank lines are deliberate — Prettier collapses them, and emitting them here means the
 * insertion cannot weld the banner onto the line above it.
 *
 * A page with no Rust snippet keeps its content and reports itself, because the banner is a
 * safety notice and silently dropping one should not look like success.
 */
export function insertNotForProductionBanner(
  content: string,
  include: string,
): { content: string; inserted: boolean } {
  const fence = content.indexOf(RUST_FENCE);
  if (fence === -1) return { content, inserted: false };

  const before = content.slice(0, fence).split('\n');
  before.splice(before.length - 2, 0, `\n${include}\n`);
  return { content: before.join('\n') + content.slice(fence), inserted: true };
}

export interface BuildPageOptions {
  /** The upstream file's text. */
  source: string;
  /** The upstream path, for error messages. */
  context: string;
  /** The do-not-edit comment. */
  marker: string;
  frontmatterDefaults: Readonly<Record<string, string>>;
  sections: readonly SectionPages[];
  baseUrl: string;
  /** The not-for-production `<include>` directive. */
  include: string;
}

/** Build one page from one upstream `page.mdx`. */
export function buildPage({
  source,
  context,
  marker,
  frontmatterDefaults,
  sections,
  baseUrl,
  include,
}: BuildPageOptions): { content: string; metadata: StylusMetadata; banner: boolean } {
  const metadata = parseMetadata(source, context);
  const frontmatter = renderFrontmatter(metadata, frontmatterDefaults);

  // Replacing the metadata export in place, rather than rebuilding the file around the body,
  // keeps everything upstream puts after it — the `{/* Begin Content */}` marker included —
  // exactly where upstream put it.
  // A callback inserts literal text: a replacement string would expand `$1`, `$$`, etc.
  let content = source.replace(METADATA_PATTERN, () => `${frontmatter}\n\n${marker}`);
  content = rewriteRelativeLinks(content, { sections, baseUrl, context });

  const banner = insertNotForProductionBanner(content, include);
  return { content: banner.content, metadata, banner: banner.inserted };
}

/**
 * The `meta.json` for one section: the sidebar title, the published pages in the order the data
 * file lists them, and the `'...'` catch-all the committed files carry so an unlisted sibling
 * still appears rather than disappearing from the sidebar.
 */
export function buildSectionMeta({ title, pages }: { title: string; pages: readonly string[] }): {
  title: string;
  pages: string[];
} {
  return { title, pages: [...pages, '...'] };
}
