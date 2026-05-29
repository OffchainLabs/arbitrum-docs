/**
 * MDX link codemod primitives.
 *
 * Shared building blocks for the doc-restructure tooling. Two responsibilities:
 *
 * 1. `resolveDocUrl` — map a doc file path to the site URL Docusaurus serves it at,
 *    honoring numeric directory prefixes, `index`/`README` folder roots, and `slug:`
 *    frontmatter overrides.
 * 2. `extractLinkRefs` — parse an MDX source string and return the byte ranges of every
 *    link URL across the four surfaces this repo uses (markdown links, `<Link to>` /
 *    `<a href>` JSX attributes, and ESM partial imports).
 *
 * Rewrites are applied by `applyRewrites`, which splices only the URL byte ranges and
 * leaves every other byte untouched. This keeps doc diffs surgical rather than reformatting
 * whole files through a remark stringify round-trip.
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkMath from 'remark-math';
import { visit } from 'unist-util-visit';
import path from 'node:path';

const EXTENSION = /\.mdx?$/;
const NUMERIC_PREFIX = /^\d+-/;
const FRONTMATTER = /^---\r?\n[\s\S]*?\n---\r?\n?/;
const EXTERNAL_OR_PROTOCOL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
const HTML_COMMENT = /<!--[\s\S]*?-->/g;
// Docusaurus heading-id syntax (`## Title {#id}`). Strict MDX reads `{#id}` as an expression
// and acorn rejects the leading `#`. It carries no link, so it is blanked before parsing.
const HEADING_ID = /\{#[A-Za-z0-9_-]+\}/g;

/** Which MDX surface a link was found on. */
export type LinkSurface = 'markdown' | 'jsx-attr' | 'esm-import';

/** A single link occurrence located in an MDX source string. */
export interface LinkRef {
  surface: LinkSurface;
  /** The destination exactly as written, including any `#anchor` or `?query`. */
  rawUrl: string;
  /** Byte range `[start, end)` of the URL token in the source, or `null` when it cannot be safely spliced. */
  range: [number, number] | null;
  /** Set when the link cannot be auto-rewritten; describes why (for manual-review reporting). */
  skipped?: string;
  /** JSX element name, e.g. `Link` or `a` (only for `jsx-attr`). */
  elementName?: string;
  /** JSX attribute name, e.g. `to` or `href` (only for `jsx-attr`). */
  attrName?: string;
}

/** A byte-range replacement to apply to a source string. */
export interface Rewrite {
  range: [number, number];
  newText: string;
}

/** Collapse duplicate slashes and drop a trailing slash (except for the root `/`). */
export function normalizeUrl(url: string): string {
  let result = url.replace(/\/{2,}/g, '/');
  if (result.length > 1) result = result.replace(/\/$/, '');
  return result === '' ? '/' : result;
}

/** A non-empty string `id:` frontmatter value, or null. Docusaurus disallows slashes in `id`. */
function frontmatterId(frontmatter?: Record<string, unknown>): string | null {
  const id = frontmatter?.id;
  return typeof id === 'string' && id.length > 0 ? id : null;
}

/** Strip everything up to and including the `docs/` segment, yielding a docs-relative path. */
function toDocsRelative(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  const match = normalized.match(/(?:^|\/)docs\/(.*)$/);
  return match ? match[1] : normalized.replace(/^\//, '');
}

/**
 * Split a docs-relative path into the segments shared by both the URL and the doc id: drop the
 * file extension from the last segment and strip the numeric ordering prefix (`02-`) from every
 * segment. {@link resolveDocUrl} and {@link resolveDocId} share this step, then diverge on
 * slug/index handling — keep the segment transform here so the two can never drift apart.
 */
function normalizeDocSegments(filePath: string): string[] {
  return toDocsRelative(filePath)
    .split('/')
    .filter(Boolean)
    .map((segment, index, all) =>
      index === all.length - 1 ? segment.replace(EXTENSION, '') : segment,
    )
    .map((segment) => segment.replace(NUMERIC_PREFIX, ''));
}

/**
 * Resolve the site URL Docusaurus serves a doc file at.
 *
 * `docs/` is mounted at the site root (`routeBasePath: '/'`). Numeric directory prefixes
 * (`02-foo`) are stripped from every segment, `index`/`README` files resolve to their
 * folder root, and a `slug:` frontmatter value overrides the path-derived URL — absolute
 * (`/x`) replacing it entirely, relative (`x`) resolving against the doc's directory. With no
 * `slug`, an `id:` frontmatter value replaces the final URL segment (Docusaurus derives the
 * permalink from the doc id, so an id override moves the URL too).
 *
 * @param filePath Doc file path (absolute or repo-relative).
 * @param frontmatter Parsed frontmatter; `slug` then `id` are consulted.
 * @returns The site URL path, with no trailing slash (matching `trailingSlash: false`).
 */
export function resolveDocUrl(filePath: string, frontmatter?: Record<string, unknown>): string {
  const segments = normalizeDocSegments(filePath);

  // `index`/`README` resolve to the folder root (drop the trailing segment).
  if (segments.length > 0 && /^(?:index|readme)$/i.test(segments[segments.length - 1])) {
    segments.pop();
  }

  const slug = frontmatter?.slug;
  if (typeof slug === 'string' && slug.length > 0) {
    if (slug.startsWith('/')) return normalizeUrl(slug);
    const directory = '/' + segments.slice(0, -1).join('/');
    return normalizeUrl(path.posix.join(directory, slug));
  }

  const id = frontmatterId(frontmatter);
  if (id !== null && segments.length > 0) segments[segments.length - 1] = id;

  return normalizeUrl('/' + segments.join('/'));
}

/**
 * Resolve the Docusaurus document id for a doc file.
 *
 * The id is the docs-relative path without extension and with numeric directory prefixes
 * stripped from every segment — the form referenced in `sidebars.js`. An `id:` frontmatter
 * value replaces the final segment (e.g. `oracles/01-overview.mdx` with `id: overview-oracles`
 * resolves to `oracles/overview-oracles`). Unlike {@link resolveDocUrl}, it ignores `slug`
 * frontmatter and does not collapse `index`/`README` to the folder root.
 *
 * @param filePath Doc file path (absolute or repo-relative).
 * @param frontmatter Parsed frontmatter; only `id` is consulted.
 * @returns The document id, e.g. `how-arbitrum-works/inside-arbitrum-nitro`.
 */
export function resolveDocId(filePath: string, frontmatter?: Record<string, unknown>): string {
  // Same segment transform as the URL, but no slug override and no index/README collapse.
  const segments = normalizeDocSegments(filePath);
  const id = frontmatterId(frontmatter);
  if (id !== null && segments.length > 0) segments[segments.length - 1] = id;
  return segments.join('/');
}

/** Locate the destination token of a markdown `[text](dest)` / `[text](dest "title")` link. */
function locateMarkdownDestination(
  source: string,
  start: number,
  end: number,
): { url: string; start: number; end: number } | null {
  const slice = source.slice(start, end);
  const open = slice.indexOf('](');
  if (open === -1) return null;

  let cursor = open + 2;
  while (cursor < slice.length && /\s/.test(slice[cursor])) cursor++;

  const angled = slice[cursor] === '<';
  if (angled) cursor++;
  const destStart = cursor;

  if (angled) {
    while (cursor < slice.length && slice[cursor] !== '>') cursor++;
  } else {
    while (cursor < slice.length && !/[\s)]/.test(slice[cursor])) cursor++;
  }

  const url = slice.slice(destStart, cursor);
  if (url.length === 0) return null;
  return { url, start: start + destStart, end: start + cursor };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Locate the value token of a JSX string attribute (`name="value"` / `name='value'`). */
function locateAttributeValue(
  source: string,
  start: number,
  end: number,
  name: string,
  value: string,
): { start: number; end: number } | null {
  const slice = source.slice(start, end);
  for (const quote of ['"', "'"]) {
    const pattern = new RegExp(
      escapeRegExp(name) + '\\s*=\\s*' + quote + escapeRegExp(value) + quote,
    );
    const match = pattern.exec(slice);
    if (!match) continue;
    const valueStart = match.index + match[0].length - value.length - 1;
    return { start: start + valueStart, end: start + valueStart + value.length };
  }
  return null;
}

/** Locate every module specifier string inside an ESM import block. */
function locateEsmSpecifiers(
  base: number,
  value: string,
): Array<{ url: string; start: number; end: number }> {
  const specifiers: Array<{ url: string; start: number; end: number }> = [];
  const pattern = /(?:from|import)\s+(['"])([^'"]*)\1/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(value)) !== null) {
    const quote = match[1];
    const specifier = match[2];
    const specifierStart = match.index + match[0].indexOf(quote) + 1;
    specifiers.push({
      url: specifier,
      start: base + specifierStart,
      end: base + specifierStart + specifier.length,
    });
  }
  return specifiers;
}

/** Read the raw source text of an expression-valued JSX attribute, for manual-review reporting. */
function expressionText(value: unknown): string {
  if (value && typeof value === 'object' && 'value' in value) {
    return String((value as { value: unknown }).value ?? '');
  }
  return String(value ?? '');
}

/**
 * Extract every link reference from an MDX source string.
 *
 * Frontmatter is sliced off before parsing (MDX is strict and frontmatter may contain
 * characters that look like JSX), and all returned byte ranges are offset back into the
 * original source so they can be spliced directly.
 *
 * @param source Raw MDX file contents.
 * @returns One `LinkRef` per link occurrence across all four surfaces.
 */
export function extractLinkRefs(source: string): LinkRef[] {
  const frontmatter = source.match(FRONTMATTER);
  const offset = frontmatter ? frontmatter[0].length : 0;
  // Blank HTML comments (`<!-- -->`) to equal-length whitespace before parsing: strict MDX
  // rejects them but this repo's `.mdx` files use them and Docusaurus tolerates them. Newlines
  // are preserved so byte offsets stay aligned with the original source, and links commented
  // out in the source are correctly ignored rather than rewritten.
  const body = source
    .slice(offset)
    .replace(HTML_COMMENT, (match) => match.replace(/[^\n]/g, ' '))
    .replace(HEADING_ID, (match) => ' '.repeat(match.length));

  // `remark-parse`, `remark-math`, and `remark-mdx` resolve their own nested copies of `unified`
  // in the Docusaurus dependency tree, so their plugin types reference a structurally-distinct
  // `Processor`. The pipeline is correct at runtime; cast to sidestep the duplicate-types
  // artifact rather than force a repo-wide `unified` resolution that could disturb the build.
  // `remark-math` matches Docusaurus's own pipeline so `$…$` math is not misread as MDX.
  const processor = unified()
    .use(remarkParse as never)
    .use(remarkMath as never)
    .use(remarkMdx as never);
  const tree = processor.parse(body);
  const refs: LinkRef[] = [];

  // `node` is typed `any`: typing it precisely would mean importing and unioning every
  // remark-mdx node type, which is noise for tooling that only branches on `node.type`.
  visit(tree, (node: any) => {
    const position = node.position;
    if (!position || position.start.offset == null || position.end.offset == null) return;
    const start = position.start.offset + offset;
    const end = position.end.offset + offset;

    if (node.type === 'link') {
      const located = locateMarkdownDestination(source, start, end);
      if (located) {
        refs.push({
          surface: 'markdown',
          rawUrl: located.url,
          range: [located.start, located.end],
        });
      } else {
        refs.push({
          surface: 'markdown',
          rawUrl: node.url ?? '',
          range: null,
          skipped: 'unparsed-destination',
        });
      }
      return;
    }

    if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
      for (const attr of node.attributes ?? []) {
        if (attr.type !== 'mdxJsxAttribute') continue;
        if (attr.name !== 'to' && attr.name !== 'href') continue;

        if (typeof attr.value !== 'string') {
          refs.push({
            surface: 'jsx-attr',
            rawUrl: expressionText(attr.value),
            range: null,
            skipped: 'expression',
            elementName: node.name ?? undefined,
            attrName: attr.name,
          });
          continue;
        }

        const located = locateAttributeValue(source, start, end, attr.name, attr.value);
        refs.push({
          surface: 'jsx-attr',
          rawUrl: attr.value,
          range: located ? [located.start, located.end] : null,
          skipped: located ? undefined : 'attr-not-located',
          elementName: node.name ?? undefined,
          attrName: attr.name,
        });
      }
      return;
    }

    if (node.type === 'mdxjsEsm') {
      // Scan the original source slice (not `node.value`): the parsed value comes from the
      // comment/heading-id-blanked body, so searching the real source guarantees the specifier
      // offsets line up with what `applyRewrites` will splice.
      for (const specifier of locateEsmSpecifiers(start, source.slice(start, end))) {
        refs.push({
          surface: 'esm-import',
          rawUrl: specifier.url,
          range: [specifier.start, specifier.end],
        });
      }
    }
  });

  return refs;
}

/** True when a raw URL points outside the docs tree (protocol, scheme-relative, or fragment-only). */
export function isExternalOrFragment(rawUrl: string): boolean {
  return rawUrl.length === 0 || rawUrl.startsWith('#') || EXTERNAL_OR_PROTOCOL.test(rawUrl);
}

/**
 * Apply URL byte-range replacements to a source string.
 *
 * Rewrites are applied from the end of the file backward so earlier replacements never
 * shift the offsets of later ones.
 *
 * @param source Original source string.
 * @param rewrites Byte-range replacements; ranges must not overlap.
 * @returns The rewritten source.
 */
export function applyRewrites(source: string, rewrites: Rewrite[]): string {
  const ordered = [...rewrites].sort((a, b) => b.range[0] - a.range[0]);
  let result = source;
  for (const { range, newText } of ordered) {
    result = result.slice(0, range[0]) + newText + result.slice(range[1]);
  }
  return result;
}
