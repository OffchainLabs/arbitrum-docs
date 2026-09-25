/**
 * doc-links — the shared filesystem + link layer for the doc-restructure CLIs.
 *
 * Builds a bidirectional map between doc files and the URLs Fumadocs serves them at, extracts every
 * internal link occurrence (dependency-free, offset-preserving), resolves each to the file it points
 * at, and re-renders a link preserving its written form. `move-doc`, `inventory-links`,
 * `check-links`, and `restructure` are thin CLIs over these primitives.
 *
 * Fumadocs specifics (vs. the Docusaurus original this ports): content lives directly under
 * `content/docs/…` (baseUrl `/docs`, single locale); slugs are the path minus extension with a
 * trailing `index` dropped (no numeric prefixes, no `slug:` frontmatter override); navigation order
 * lives in per-directory `meta.json` `pages` arrays.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import { expandVarPlaceholders, readVars } from '../../lib/var-links.ts';
import { isPartial } from './partials.ts';
import { maskRegions } from './strip-code.ts';

const posix = path.posix;

/** Where a link was written: a markdown link or definition, a JSX `href`/`to`, or an `<include>`. */
export type RefSurface = 'markdown' | 'jsx-attr' | 'include';

/**
 * One link occurrence in a source file. `range` indexes the original source for splicing; it is
 * `null` for a reference that must never be rewritten (a JSX expression attribute, or a
 * root-anchored `cwd` include), and `skipped` then says which.
 */
export type LinkRef =
  | { surface: RefSurface; rawUrl: string; range: [number, number]; skipped?: undefined }
  | { surface: RefSurface; rawUrl: string; range: null; skipped: 'expression' | 'cwd' };

/** How a link is written, so a rewrite reproduces the same form. */
export type LinkStyle = 'include' | 'fileAbs' | 'fileRel' | 'urlAbs' | 'urlRel';

/** A doc file's identity, derived from its path alone. `url` is `null` for a partial. */
export interface FileMeta {
  slug: string;
  url: string | null;
  partial: boolean;
}

/** One indexed `.md`/`.mdx` file under `content/docs`. */
export interface DocFile {
  abs: string;
  rel: string;
  slug: string;
  url: string | null;
  content: string;
  partial: boolean;
}

/** The docs index `buildIndex` returns. */
export interface DocIndex {
  repoRoot: string;
  docsRoot: string;
  files: DocFile[];
  byAbs: Set<string>;
  slugByAbs: Map<string, string>;
  urlByAbs: Map<string, string>;
  byUrl: Map<string, string>;
}

/** One byte-range replacement for `applyRewrites`. */
export interface Rewrite {
  range: [number, number];
  newText: string;
}

/** One broken internal link, as `findBrokenLinks` reports it. */
export interface BrokenLink {
  file: string;
  rel: string;
  line: number;
  url: string;
}

/** A parsed `meta.json` and where it lives. `data` is whatever the JSON held. */
export interface MetaFile {
  path: string;
  data: unknown;
}

/**
 * The variable values the site builds with, read once. `scripts/lib/doc-anchors.ts` already imports
 * from `lib/` for the same reason: a checker that does not share the site's transforms checks a
 * different document than the one the reader gets.
 */
let varValues: Record<string, unknown> | undefined;

/**
 * Resolve a raw link URL the way the reader's browser will see it, by expanding any `{var:name}`
 * placeholder the way `remarkVarLinks` does at build (FS-2725). Every consumer that *resolves* a
 * link has to go through this, or a placeholder in an internal destination is reported broken even
 * though the built page carries a working URL. Rewriting consumers must not: the written form is
 * what belongs in the file.
 */
export function expandRefUrl(rawUrl: string): string {
  if (typeof rawUrl !== 'string' || !rawUrl.includes('{var:')) return rawUrl;
  varValues ??= readVars();
  return expandVarPlaceholders(rawUrl, varValues);
}

export const CONTENT_DIR = path.join('content', 'docs');

/** Convert an OS path to posix separators. */
export function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

/** Collapse duplicate slashes and drop a trailing slash (except the root `/`). */
export function normalizeUrl(url: string): string {
  let result = url.replace(/\/{2,}/g, '/');
  if (result.length > 1) result = result.replace(/\/$/, '');
  return result === '' ? '/' : result;
}

/** Ensure a relative path is explicitly relative (`./x`, not `x`). */
function dotSlash(rel: string): string {
  if (rel === '') return './';
  return rel.startsWith('.') ? rel : './' + rel;
}

/** Split a raw URL into its path part and the trailing `#anchor`/`?query` suffix. */
export function splitSuffix(rawUrl: string): { pathPart: string; suffix: string } {
  const i = rawUrl.search(/[#?]/);
  return i < 0
    ? { pathPart: rawUrl, suffix: '' }
    : { pathPart: rawUrl.slice(0, i), suffix: rawUrl.slice(i) };
}

/** True when a link points outside the docs tree (protocol, scheme-relative, or fragment-only). */
export function isExternalOrFragment(pathPart: string): boolean {
  return (
    pathPart.length === 0 ||
    pathPart.startsWith('#') ||
    /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(pathPart)
  );
}

/**
 * True when a file is a content partial (underscore-prefixed): imported via `<include>`, not routed.
 *
 * Re-exported from `partials.ts` so there is one definition. This module used to carry a looser
 * copy that matched any `_`-prefixed basename, including `_diagram.png`; `partials.ts` also
 * requires a `.md`/`.mdx` extension. Both were live — `move-doc` read this one while
 * `partials-check` read the other — so the answer depended on the caller's import.
 */
export { isPartial };

/** Slug segments for a doc: path minus extension, trailing `index` dropped. */
function computeSlug(pathSegs: string[]): string {
  const segs = pathSegs.slice();
  if (segs.length === 0) return '';
  segs[segs.length - 1] = segs[segs.length - 1].replace(/\.mdx?$/i, '');
  if (segs.length > 0 && /^index$/i.test(segs[segs.length - 1])) segs.pop();
  return segs.join('/');
}

/** The site URL for a slug. */
function buildUrl(slug: string): string {
  return normalizeUrl('/docs' + (slug ? '/' + slug : ''));
}

/**
 * Derive a doc file's slug, URL, and partial flag from its path — works for a file that does not
 * exist yet (a move target), so callers can compute the destination's identity up front.
 */
export function computeFileMeta(docsRoot: string, abs: string): FileMeta {
  const segs = toPosix(path.relative(docsRoot, abs)).split('/').filter(Boolean);
  const slug = computeSlug(segs);
  const partial = isPartial(abs);
  return { slug, url: partial ? null : buildUrl(slug), partial };
}

/**
 * Build the docs index for a repo.
 *
 * @param repoRoot Absolute repo root.
 * @returns index with `files[]`, `byAbs`, `slugByAbs`, `urlByAbs`, `byUrl`.
 */
export function buildIndex(repoRoot: string): DocIndex {
  const docsRoot = path.join(repoRoot, CONTENT_DIR);
  const rels = readdirSync(docsRoot, { recursive: true, encoding: 'utf8' })
    .map((r) => toPosix(r))
    .filter((r) => /\.mdx?$/i.test(r));

  const files: DocFile[] = [];
  const byAbs = new Set<string>();
  const slugByAbs = new Map<string, string>();
  const urlByAbs = new Map<string, string>();
  const byUrl = new Map<string, string>();

  for (const relFromDocs of rels) {
    const abs = path.join(docsRoot, relFromDocs);
    const { slug, url } = computeFileMeta(docsRoot, abs);
    const partial = url === null;
    const content = readFileSync(abs, 'utf8');

    byAbs.add(abs);
    slugByAbs.set(abs, slug);
    if (url !== null) {
      urlByAbs.set(abs, url);
      const existing = byUrl.get(url);
      if (existing && existing !== abs) {
        console.warn(
          `warning: URL collision ${url}\n  ${toPosix(path.relative(repoRoot, existing))}\n  ${toPosix(path.relative(repoRoot, abs))}`,
        );
      }
      byUrl.set(url, abs);
    }

    files.push({
      abs,
      rel: toPosix(path.relative(repoRoot, abs)),
      slug,
      url,
      content,
      partial,
    });
  }

  return {
    repoRoot,
    docsRoot,
    files,
    byAbs,
    slugByAbs,
    urlByAbs,
    byUrl,
  };
}

/**
 * Extract every internal link occurrence from an MDX source string.
 *
 * Surfaces: markdown inline links, markdown link definitions, JSX `href`/`to` string attributes,
 * and `<include>` directives. JSX expression attrs (`href={…}`) are flagged (range `null`), not
 * rewritten. ESM imports are ignored — they reference code modules, never docs.
 */
export function extractRefs(source: string): LinkRef[] {
  const masked = maskRegions(source);
  const refs: LinkRef[] = [];

  const mdInline = /\]\(\s*(<[^>\n]*>|[^)\s]+)(?:\s+"[^"\n]*"|\s+'[^'\n]*')?\s*\)/g;
  for (let m; (m = mdInline.exec(masked));) {
    let raw = m[1];
    let start = m.index + m[0].indexOf(raw, 2);
    let end = start + raw.length;
    if (raw.startsWith('<') && raw.endsWith('>')) {
      raw = raw.slice(1, -1);
      start += 1;
      end -= 1;
    }
    refs.push({ surface: 'markdown', rawUrl: raw, range: [start, end] });
  }

  // `(?!\^)` excludes GFM footnote definitions (`[^2]: Although …`), whose label is not a link label —
  // without it the first word of every footnote is reported as a broken target.
  const mdDef = /^[ \t]*\[(?!\^)[^\]\n]+\]:[ \t]+(\S+)/gm;
  for (let m; (m = mdDef.exec(masked));) {
    const raw = m[1];
    const start = m.index + m[0].lastIndexOf(raw);
    refs.push({ surface: 'markdown', rawUrl: raw, range: [start, start + raw.length] });
  }

  const jsxAttr = /\b(href|to)\s*=\s*("[^"\n]*"|'[^'\n]*'|\{)/g;
  for (let m; (m = jsxAttr.exec(masked));) {
    const value = m[2];
    if (value === '{') {
      refs.push({ surface: 'jsx-attr', rawUrl: '', range: null, skipped: 'expression' });
      continue;
    }
    const inner = value.slice(1, -1);
    const start = m.index + m[0].lastIndexOf(value) + 1;
    refs.push({ surface: 'jsx-attr', rawUrl: inner, range: [start, start + inner.length] });
  }

  const include = /<include\b([^>]*)>([\s\S]*?)<\/include>/g;
  for (let m; (m = include.exec(masked));) {
    const raw = m[2].trim();
    if (raw === '') continue;
    // `cwd` includes are root-anchored (partials-check validates them); they must never be rewritten
    // on move, so surface them with a null range like an unrewritable expression attr.
    if (/\bcwd\b/.test(m[1])) {
      refs.push({ surface: 'include', rawUrl: raw, range: null, skipped: 'cwd' });
      continue;
    }
    const innerStart = m.index + m[0].indexOf('>') + 1;
    const lead = m[2].length - m[2].trimStart().length;
    const start = innerStart + lead;
    refs.push({ surface: 'include', rawUrl: raw, range: [start, start + raw.length] });
  }

  return refs;
}

/** The three lookups `resolveRefToFile` reads, so a caller can pass a stand-in without the rest. */
export type RefResolutionIndex = Pick<DocIndex, 'byAbs' | 'urlByAbs' | 'byUrl'>;

/**
 * Resolve a link's raw URL to the absolute doc file it points at, or `null` if external/unresolvable.
 *
 * `fromAbs` may be `null` when the link has no page of its own (the announcement banner renders on
 * every route); only a relative URL needs it, and such a caller has already rejected those.
 */
export function resolveRefToFile(
  rawUrl: string,
  fromAbs: string | null,
  index: RefResolutionIndex,
): string | null {
  const { pathPart } = splitSuffix(expandRefUrl(rawUrl));
  if (isExternalOrFragment(pathPart)) return null;

  if (!pathPart.startsWith('/')) {
    if (fromAbs === null) return null;
    if (/\.mdx?$/i.test(pathPart)) {
      const abs = path.resolve(path.dirname(fromAbs), pathPart);
      return index.byAbs.has(abs) ? abs : null;
    }
    const fromUrl = index.urlByAbs.get(fromAbs);
    if (!fromUrl) return null;
    const target = normalizeUrl(posix.join(posix.dirname(fromUrl), pathPart));
    return index.byUrl.get(target) ?? null;
  }

  if (!/^\/docs(?=\/|$)/.test(pathPart)) return null;
  const slug = pathPart
    .replace(/^\/docs\/?/, '')
    .replace(/\.mdx?$/i, '')
    .replace(/\/$/, '');
  return index.byUrl.get(buildUrl(slug)) ?? null;
}

/**
 * Does a root-absolute link path point at a real file under `public/`?
 *
 * Next serves static bytes from `public/`, so `/audit-reports/x.pdf` is the correct URL for
 * `public/audit-reports/x.pdf`. The docs index only knows `content/docs`, so without this check
 * every asset link — PDFs, images — looks broken.
 *
 * Relative paths are excluded deliberately: they resolve against the page's own URL inside the docs
 * route tree, never against the static root, so `audit-reports/x.pdf` written on `/docs/audit-reports`
 * really is a 404 and must keep being reported.
 */
export function resolvesToPublicAsset(pathPart: string, repoRoot: string): boolean {
  if (!pathPart.startsWith('/')) return false;

  const publicRoot = path.join(repoRoot, 'public');
  const abs = path.resolve(publicRoot, `.${pathPart}`);

  // Refuse anything that escapes `public/` — such a URL is not servable regardless of what is there.
  const rel = path.relative(publicRoot, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return false;

  return existsSync(abs) && statSync(abs).isFile();
}

/** Classify how a link is written, so a rewrite reproduces the same form. */
export function detectStyle(pathPart: string, surface: RefSurface): LinkStyle {
  if (surface === 'include') return 'include';
  const abs = pathPart.startsWith('/');
  if (/\.mdx?$/i.test(pathPart)) return abs ? 'fileAbs' : 'fileRel';
  return abs ? 'urlAbs' : 'urlRel';
}

/**
 * Render a link to `targetAbs` from `containerAbs` in `style`, preserving the written form.
 * Returns `null` when the style cannot be rendered (e.g. a relative URL link with no container URL).
 */
export function renderRef(
  style: LinkStyle,
  targetAbs: string,
  containerAbs: string,
  originalPathPart: string,
  index: Pick<DocIndex, 'docsRoot' | 'urlByAbs'>,
): string | null {
  switch (style) {
    case 'include':
    case 'fileRel':
      return dotSlash(toPosix(path.relative(path.dirname(containerAbs), targetAbs)));
    case 'fileAbs': {
      // `detectStyle` returns `fileAbs` only for a path ending in `.md`/`.mdx`, so this always
      // matches; the throw stands where indexing a null match used to throw a TypeError.
      const ext = originalPathPart.match(/\.mdx?$/i)?.[0];
      if (ext === undefined) throw new Error(`renderRef: not a file link: ${originalPathPart}`);
      const { url } = computeFileMeta(index.docsRoot, targetAbs);
      return url === null ? null : url + ext;
    }
    case 'urlAbs':
      return computeFileMeta(index.docsRoot, targetAbs).url;
    case 'urlRel': {
      const curl = index.urlByAbs.get(containerAbs);
      const turl = index.urlByAbs.get(targetAbs);
      if (!curl || !turl) return null;
      return dotSlash(posix.relative(posix.dirname(curl), turl));
    }
    default:
      return null;
  }
}

/** Apply byte-range replacements to a source string, back-to-front so offsets stay valid. */
export function applyRewrites(source: string, rewrites: readonly Rewrite[]): string {
  const ordered = [...rewrites].sort((a, b) => b.range[0] - a.range[0]);
  let result = source;
  for (const { range, newText } of ordered) {
    result = result.slice(0, range[0]) + newText + result.slice(range[1]);
  }
  return result;
}

/** 1-based line number of a byte offset. */
export function lineAt(content: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset && i < content.length; i++) if (content[i] === '\n') line++;
  return line;
}

/**
 * Find every broken internal link in the tree: an internal ref (not external/fragment/expression)
 * that resolves to no existing file, or that carries a literal `.md`/`.mdx` suffix (always 404s at
 * runtime even though it resolves once the extension is stripped — see the inline comment below).
 * Relative-URL links inside partials are skipped (no fixed URL).
 */
export function findBrokenLinks(
  index: Pick<DocIndex, 'files' | 'repoRoot' | 'byAbs' | 'urlByAbs' | 'byUrl'>,
): BrokenLink[] {
  const broken: BrokenLink[] = [];
  for (const file of index.files) {
    for (const ref of extractRefs(file.content)) {
      if (ref.range === null) continue;
      const { pathPart } = splitSuffix(expandRefUrl(ref.rawUrl));
      if (isExternalOrFragment(pathPart)) continue;
      // A literal `.md`/`.mdx` suffix always 404s at runtime: `proxy.ts` only rewrites a bare `.md`
      // suffix, so the URL falls through to Fumadocs with an extension no page owns. `<include>`
      // directives are exempt — they splice a partial at build time and never become a URL.
      if (ref.surface !== 'include' && /\.mdx?$/i.test(pathPart)) {
        broken.push({
          file: file.abs,
          rel: file.rel,
          line: lineAt(file.content, ref.range[0]),
          url: ref.rawUrl,
        });
        continue;
      }
      if (resolveRefToFile(ref.rawUrl, file.abs, index) !== null) continue;
      // Static assets live outside the docs index: `/audit-reports/x.pdf` is served from
      // `public/audit-reports/x.pdf`. Without this the checker reports every asset link as broken.
      if (resolvesToPublicAsset(pathPart, index.repoRoot)) continue;
      if (isPartial(file.abs) && !pathPart.startsWith('/') && !/\.mdx?$/i.test(pathPart)) continue;
      broken.push({
        file: file.abs,
        rel: file.rel,
        line: lineAt(file.content, ref.range[0]),
        url: ref.rawUrl,
      });
    }
  }
  return broken;
}

/** Read a directory's `meta.json`, or `null` if absent/unparseable. */
export function readMeta(dirAbs: string): MetaFile | null {
  const metaPath = path.join(dirAbs, 'meta.json');
  if (!existsSync(metaPath)) return null;
  try {
    return { path: metaPath, data: JSON.parse(readFileSync(metaPath, 'utf8')) };
  } catch {
    return null;
  }
}

/** True when a `pages` array delegates to the rest-glob `...` (order is not fully explicit). */
export function pagesHasRest(pages: unknown): boolean {
  return Array.isArray(pages) && pages.some((p) => p === '...' || p === 'z...a');
}

/** Serialize meta data with 2-space indent + trailing newline (matches repo style). */
export function stringifyMeta(data: unknown): string {
  return JSON.stringify(data, null, 2) + '\n';
}
