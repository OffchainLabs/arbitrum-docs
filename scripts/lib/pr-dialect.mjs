/**
 * pr-dialect — the six mechanical Docusaurus→Fumadocs source transforms, as pure functions.
 *
 * Every function takes MDX source text plus a context object and returns new source text. None of
 * them touch the filesystem, so the same transforms drive both the one-shot history reconstruction
 * (`scripts/reconstruct-history.mjs`) and a later PR-replay tool that must apply the same dialect
 * shift to an upstream patch before it can land here.
 *
 * "Mechanical" is the hard constraint: these are form-only rewrites. A transform must never decide
 * what a page *says* — only how the same statement is spelled in the new dialect. Anything that
 * needs a judgement call is left alone for a human (or a later editorial commit) to handle, because
 * these commits are listed in `.git-blame-ignore-revs` and `git blame` will attribute their lines to
 * whoever wrote the line before them.
 *
 * The six:
 *   remapFrontmatter        legacy frontmatter -> the Zod contract in source.config.ts
 *   rewriteInternalLinks    `](/x/y.mdx)` -> `](/docs/x/y)`, relatives resolved to absolute
 *   quicklooksToTerms       `<a data-quicklook-from="k">T</a>` -> `<Term id="k">T</Term>`
 *   admonitionsToComponents `:::note … :::` -> `<VanillaAdmonition>`, `<details>` -> `<Accordions>`
 *   partialImportsToIncludes  ESM partial import + `<P />` -> `<include cwd>…</include>`
 *   inlineVars              `@@name=value@@` -> `<Var name="name" />` or the literal value
 */
import path from 'node:path';

/** Legacy `content_type` values that are not in the Fumadocs enum, and what they become. */
export const CONTENT_TYPE_ALIASES = {
  'gentle-introduction': 'concept',
  'overview': 'concept',
  'notice': 'concept',
  'interactive-visualization': 'concept',
  'get-started': 'quickstart',
};

/** The closed enum in source.config.ts. Anything outside it must be aliased or defaulted. */
export const CONTENT_TYPES = [
  'how-to',
  'concept',
  'quickstart',
  'tutorial',
  'reference',
  'troubleshooting',
  'faq',
];

/** Frontmatter keys Docusaurus needed that the Fumadocs contract has no place for. */
export const DROPPED_KEYS = [
  'id',
  'slug',
  'sidebar_position',
  'displayed_sidebar',
  'custom_edit_url',
  'hide_table_of_contents',
  'keywords',
  'target_audience',
];

/** Canonical key order for a page's frontmatter; unlisted keys keep their original order after. */
const KEY_ORDER = [
  'title',
  'description',
  'sidebar_label',
  'user_story',
  'content_type',
  'author',
  'sme',
];

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/;

/**
 * Split a frontmatter block into `{ key, text }` entries. `text` is the raw source of the entry,
 * including any continuation lines (block scalars, wrapped lists), so a value is never reformatted.
 * Lines before the first key (there are none in practice) are kept under a null key.
 */
export function parseFrontmatterEntries(block) {
  const entries = [];
  for (const line of block.split('\n')) {
    const m = /^([A-Za-z_][\w-]*):(?:\s|$)/.exec(line);
    if (m) entries.push({ key: m[1], text: line });
    else if (entries.length) entries[entries.length - 1].text += '\n' + line;
    else entries.push({ key: null, text: line });
  }
  return entries;
}

/** The scalar value of a single-line entry, unquoted. Returns null for block/multi-line values. */
export function frontmatterValue(entry) {
  if (entry.text.includes('\n')) return null;
  const raw = entry.text.slice(entry.key.length + 1).trim();
  const q = /^(['"])([\s\S]*)\1$/.exec(raw);
  return q ? q[2] : raw;
}

/**
 * Rewrite a file's frontmatter into the destination contract.
 *
 * `kind: 'doc'` applies the page contract: the `content_type` enum, required `author`/`sme`, the
 * dropped Docusaurus keys, and the canonical key order.
 * `kind: 'glossary'` applies the reference contract: `key` becomes `id`, `titleforSort` becomes
 * `sortAs` (dropped when it merely repeats the title), and nothing else survives.
 *
 * `synthesizeAuthorship: false` performs every other change but leaves `author`/`sme` absent when
 * the source has none. The history reconstruction uses it to split this transform in two: the form
 * half is listed in `.git-blame-ignore-revs`, the half that invents a name is not. An ignored commit
 * does not vanish from blame — its lines are reassigned to the previous commit that touched them —
 * so hiding synthesised authorship would credit an invented claim to a real author. Everything else
 * here rewrites form and is safe to skip. Defaults to true, which is the whole transform, because
 * every other caller (`pr-replay`) needs frontmatter that satisfies the schema.
 *
 * Files with no frontmatter (every partial) are returned untouched.
 */
export function remapFrontmatter(
  source,
  { kind = 'doc', defaultAuthor = 'gblanchemain', synthesizeAuthorship = true } = {},
) {
  const m = FRONTMATTER_RE.exec(source);
  if (!m) return source;
  const entries = parseFrontmatterEntries(m[1]);
  const body = source.slice(m[0].length);
  const rebuilt =
    kind === 'glossary'
      ? glossaryFrontmatter(entries)
      : docFrontmatter(entries, defaultAuthor, synthesizeAuthorship);
  if (rebuilt === null) return source;
  return `---\n${rebuilt.join('\n')}\n---\n${body}`;
}

function docFrontmatter(entries, defaultAuthor, synthesizeAuthorship = true) {
  const kept = entries.filter((e) => e.key && !DROPPED_KEYS.includes(e.key));
  const byKey = new Map(kept.map((e) => [e.key, e]));

  const rawType = byKey.has('content_type') ? frontmatterValue(byKey.get('content_type')) : '';
  const type = normalizeContentType(rawType);
  const typeEntry = { key: 'content_type', text: `content_type: '${type}'` };
  if (byKey.has('content_type')) Object.assign(byKey.get('content_type'), typeEntry);
  else {
    kept.push(typeEntry);
    byKey.set('content_type', typeEntry);
  }

  const author = byKey.has('author') ? frontmatterValue(byKey.get('author')) : null;
  if (synthesizeAuthorship) {
    if (!byKey.has('author')) {
      const e = { key: 'author', text: `author: ${defaultAuthor}` };
      kept.push(e);
      byKey.set('author', e);
    }
    if (!byKey.has('sme')) {
      const e = { key: 'sme', text: `sme: ${author || defaultAuthor}` };
      kept.push(e);
      byKey.set('sme', e);
    }
  }

  const rank = (e) => {
    const i = KEY_ORDER.indexOf(e.key);
    return i === -1 ? KEY_ORDER.length : i;
  };
  return kept
    .map((e, i) => ({ e, i }))
    .sort((a, b) => rank(a.e) - rank(b.e) || a.i - b.i)
    .map(({ e }) => e.text);
}

function glossaryFrontmatter(entries) {
  const byKey = new Map(entries.filter((e) => e.key).map((e) => [e.key, e]));
  const title = byKey.has('title') ? frontmatterValue(byKey.get('title')) : null;
  const id = byKey.has('key') ? frontmatterValue(byKey.get('key')) : null;
  if (title === null || id === null) return null;
  const sortAs = byKey.has('titleforSort') ? frontmatterValue(byKey.get('titleforSort')) : null;
  const out = [`id: ${id}`, `title: '${title.replace(/'/g, "''")}'`];
  if (sortAs !== null && sortAs !== title) out.push(`sortAs: '${sortAs.replace(/'/g, "''")}'`);
  return out;
}

/** Map a legacy `content_type` onto the closed enum. An empty or unknown value becomes `concept`. */
export function normalizeContentType(value) {
  const v = (value ?? '').trim();
  if (CONTENT_TYPES.includes(v)) return v;
  return CONTENT_TYPE_ALIASES[v] ?? 'concept';
}

/**
 * Rewrite internal markdown link targets to destination URLs.
 *
 * `resolveUrl(legacyKey)` takes an extension-less, repo-root-relative legacy path (for example
 * `docs/arbitrum-bridge/03-troubleshooting`) and returns the destination URL, or null when the
 * target is not a migrated page. A target that does not resolve is left exactly as it was — a
 * half-guessed link is worse than an obviously stale one, and the editorial commit can fix it.
 */
export function rewriteInternalLinks(source, { fromLegacyPath, resolveUrl }) {
  return source.replace(/\]\(([^)\s]+)\)/g, (full, target) => {
    const url = resolveLinkTarget(target, fromLegacyPath, resolveUrl);
    return url === null ? full : `](${url})`;
  });
}

/** The URL for one link target, or null when it is external, an anchor, or not a migrated page. */
export function resolveLinkTarget(target, fromLegacyPath, resolveUrl) {
  if (target.startsWith('#') || target.startsWith('<')) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(target)) return null; // http:, mailto:, ipfs:, …
  if (target.startsWith('//')) return null;

  const hash = target.indexOf('#');
  const bare = hash === -1 ? target : target.slice(0, hash);
  const suffix = hash === -1 ? '' : target.slice(hash);
  if (bare === '') return null;

  const fromDir = path.posix.dirname(fromLegacyPath);
  const abs = bare.startsWith('/')
    ? path.posix.normalize('docs' + bare)
    : path.posix.normalize(path.posix.join(fromDir, bare));
  const key = abs.replace(/\.mdx?$/i, '').replace(/\/$/, '');

  const url = resolveUrl(key);
  return url === null || url === undefined ? null : url + suffix;
}

// `&quot;`-delimited quicklook links live inside a JSX string attribute, where a component is
// illegal; they are unwrapped to their plain text (a knowingly accepted loss of the hover).
const QUICKLOOK_NESTED_RE =
  /<a\s+data-quicklook-from\s*=\s*&quot;([^&]+)&quot;\s*>([\s\S]*?)<\/a>/g;
const QUICKLOOK_FLOW_RE =
  /<a\s+data-quicklook-from\s*=\s*(?:"([^"]+)"|'([^']+)')\s*>([\s\S]*?)<\/a>/g;

/**
 * Convert legacy glossary anchors to `<Term>`. With `unwrap: true` every link is reduced to its
 * plain text instead — the shape used for files compiled outside the docs pipeline.
 */
export function quicklooksToTerms(source, { unwrap = false } = {}) {
  const out = source.replace(QUICKLOOK_NESTED_RE, (_full, _id, text) => text);
  if (unwrap) return out.replace(QUICKLOOK_FLOW_RE, (_full, _dq, _sq, text) => text);
  return out.replace(
    QUICKLOOK_FLOW_RE,
    (_full, dq, sq, text) => `<Term id="${(dq ?? sq).trim()}">${text}</Term>`,
  );
}

const ADMONITION_RE = /^(:{3,})([a-z][a-z-]*)?[ \t]*(.*)$/;
const FENCE_RE = /^\s*(`{3,}|~{3,})(.*)$/;

/**
 * Convert Docusaurus block syntax to the MDX components this site registers:
 *   `:::type Title … :::`            -> `<VanillaAdmonition type="type" title="Title">…</…>`
 *   `<details><summary>S</summary>…` -> `<Accordions><Accordion title="S">…</…></Accordions>`
 *
 * Nested admonitions (`::::` wrapping `:::`) are handled by matching each closer against the
 * opener of the same marker length, as Docusaurus does. Anything that does not balance — a stray
 * closer, an opener that is never closed, a code fence left hanging — returns the source unchanged:
 * guessing at the intended nesting is exactly the judgement call these transforms must not make.
 */
export function admonitionsToComponents(source) {
  const open = [];
  let fence = null;
  const out = [];
  for (const line of source.split('\n')) {
    const f = FENCE_RE.exec(line);
    if (f) {
      if (fence === null) fence = { char: f[1][0], len: f[1].length };
      else if (f[1][0] === fence.char && f[1].length >= fence.len && f[2].trim() === '')
        fence = null;
    }
    if (fence !== null) {
      out.push(line);
      continue;
    }
    const m = ADMONITION_RE.exec(line);
    if (m && m[2]) {
      open.push(m[1].length);
      const title = m[3].trim();
      const attrs = title ? ` type="${m[2]}" title="${escapeAttr(title)}"` : ` type="${m[2]}"`;
      out.push(`<VanillaAdmonition${attrs}>`);
    } else if (m && m[3].trim() === '') {
      if (open[open.length - 1] !== m[1].length) return source;
      open.pop();
      out.push('</VanillaAdmonition>');
    } else {
      out.push(line);
    }
  }
  if (open.length !== 0 || fence !== null) return source;

  return detailsToAccordions(out.join('\n'));
}

function detailsToAccordions(source) {
  let balanced = 0;
  const converted = source.replace(
    /<details>\s*\n\s*<summary>([\s\S]*?)<\/summary>/g,
    (_full, summary) => {
      balanced++;
      return `<Accordions>\n<Accordion title="${escapeAttr(summary.trim())}">`;
    },
  );
  if (balanced === 0) return source;
  const closed = converted.replace(/<\/details>/g, () => {
    balanced--;
    return '</Accordion>\n</Accordions>';
  });
  return balanced === 0 ? closed : source;
}

function escapeAttr(text) {
  return text.replace(/"/g, '&quot;');
}

const PARTIAL_IMPORT_RE = /^import\s+(\w+)\s+from\s+['"]([^'"]+\.mdx)['"];?[ \t]*\r?\n?/gm;

/**
 * Replace ESM partial imports and their JSX usages with `<include>` directives.
 *
 * `resolvePartial(legacyPath)` maps a repo-root-relative legacy partial path to its destination
 * path, or null. Imports that do not resolve are left in place together with their usages, so a
 * partial that was never migrated stays visibly broken rather than silently vanishing.
 *
 * Doc→partial includes are emitted root-anchored (`<include cwd>`) so moving the page cannot break
 * them; partial→partial includes are emitted file-relative, because a partial can be compiled
 * outside the docs pipeline where fumadocs-mdx's `cwd` context is undefined.
 */
export function partialImportsToIncludes(source, { fromLegacyPath, toDestPath, resolvePartial }) {
  const resolved = new Map();
  let out = source.replace(PARTIAL_IMPORT_RE, (full, name, specifier) => {
    const legacy = resolveSpecifier(specifier, fromLegacyPath);
    const dest = legacy === null ? null : resolvePartial(legacy);
    if (!dest) return full;
    resolved.set(name, dest);
    return '';
  });

  for (const [name, dest] of resolved) {
    const directive = includeDirective(toDestPath, dest);
    const usage = new RegExp(`<${name}\\s*/>|<${name}\\s*>\\s*</${name}\\s*>`, 'g');
    out = out.replace(usage, directive);
  }
  return out;
}

/** Repo-root-relative legacy path for an import specifier, or null when it is not a file path. */
export function resolveSpecifier(specifier, fromLegacyPath) {
  if (specifier.startsWith('@site/')) return path.posix.normalize(specifier.slice('@site/'.length));
  if (!specifier.startsWith('.')) return null;
  return path.posix.normalize(path.posix.join(path.posix.dirname(fromLegacyPath), specifier));
}

/** The `<include>` form appropriate to the including file: root-anchored for docs, relative else. */
export function includeDirective(fromDestPath, targetDestPath) {
  if (fromDestPath.startsWith('content/partials/')) {
    const rel = path.posix.relative(path.posix.dirname(fromDestPath), targetDestPath);
    return `<include>${rel.startsWith('.') ? rel : './' + rel}</include>`;
  }
  return `<include cwd>${targetDestPath}</include>`;
}

const VAR_RE = /@@([A-Za-z0-9_]+)=((?:[^@]|@(?!@))*)@@/g;

/**
 * Resolve the legacy `@@name=value@@` inline-variable syntax.
 *
 * A name that `content/vars.json` still carries becomes `<Var name="…" />`, so the value keeps
 * being maintained in one place. A name that was dropped from the registry collapses to the literal
 * value that was already baked into the legacy text — no new fact is introduced either way.
 */
export function inlineVars(source, { knownVars = new Set() } = {}) {
  return source.replace(VAR_RE, (_full, name, value) =>
    knownVars.has(name) ? `<Var name="${name}" />` : value,
  );
}
