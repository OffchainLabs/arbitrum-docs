/**
 * Docs link index — the filesystem layer the codemod CLIs share.
 *
 * Builds a bidirectional map between doc file paths and the site URLs Docusaurus serves
 * them at, then resolves every link occurrence in the tree to the file it points at. This
 * is what lets `inventory-links` size a restructure's blast radius and `move-doc` find the
 * references it must rewrite.
 *
 * The pure parsing/splicing primitives live in `mdx-link-codemod`; everything that touches
 * the filesystem lives here.
 */

import { glob } from 'glob';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

import {
  resolveDocUrl,
  extractLinkRefs,
  isExternalOrFragment,
  normalizeUrl,
  type LinkRef,
} from './mdx-link-codemod';

/** A doc file loaded from disk, with its frontmatter-derived site URL (null for partials). */
export interface DocFile {
  /** Absolute path. */
  abs: string;
  /** Path relative to the repo root, e.g. `docs/foo/bar.mdx`. */
  rel: string;
  content: string;
  isPartial: boolean;
  /** Site URL, or `null` for partials (imported, not routed) and excluded files. */
  url: string | null;
}

/** The resolved index for a docs tree. */
export interface DocsIndex {
  repoRoot: string;
  docsRoot: string;
  files: DocFile[];
  /** Absolute file path → site URL (routable files only). */
  fileToUrl: Map<string, string>;
  /** Site URL → absolute file path (routable files only). */
  urlToFile: Map<string, string>;
}

/** One link occurrence, resolved to the file it targets. */
export interface LinkRecord {
  /** Absolute path of the file containing the link. */
  fromFile: string;
  ref: LinkRef;
  /** Absolute path the link resolves to, or `null` if external or unresolvable. */
  toFile: string | null;
  /** 1-based line of the link in `fromFile`, or `null` when the URL token was not located. */
  line: number | null;
}

/** A file the parser could not read, so its links were not analyzed. */
export interface UnparsedFile {
  file: string;
  reason: string;
}

/** The result of scanning the tree: resolved links plus any files that failed to parse. */
export interface ScanResult {
  records: LinkRecord[];
  unparsed: UnparsedFile[];
}

const DOC_GLOB = '**/*.{md,mdx}';
// Mirrors `docs.exclude` in docusaurus.config.js (`**/api/**`); PDFs are not md/mdx.
const IGNORE = ['api/**', '**/api/**'];

/** True when a file is a content partial (underscore-prefixed), which is imported, not routed. */
export function isPartial(absPath: string): boolean {
  return path.basename(absPath).startsWith('_');
}

/**
 * Load every doc file under `docs/` and resolve its site URL.
 *
 * @param repoRoot Absolute path to the repository root.
 * @returns A fully populated {@link DocsIndex}.
 */
export async function buildDocsIndex(repoRoot: string): Promise<DocsIndex> {
  const docsRoot = path.join(repoRoot, 'docs');
  const relPaths = await glob(DOC_GLOB, { cwd: docsRoot, ignore: IGNORE, nodir: true });

  const files: DocFile[] = [];
  const fileToUrl = new Map<string, string>();
  const urlToFile = new Map<string, string>();

  for (const relFromDocs of relPaths) {
    const abs = path.join(docsRoot, relFromDocs);
    const content = await readFile(abs, 'utf8');
    const partial = isPartial(abs);
    let url: string | null = null;

    if (!partial) {
      const frontmatter = matter(content).data as Record<string, unknown>;
      url = resolveDocUrl(path.join('docs', relFromDocs), frontmatter);
      const existing = urlToFile.get(url);
      if (existing && existing !== abs) {
        console.warn(`warning: URL collision ${url}\n  ${existing}\n  ${abs}`);
      }
      fileToUrl.set(abs, url);
      urlToFile.set(url, abs);
    }

    files.push({ abs, rel: path.join('docs', relFromDocs), content, isPartial: partial, url });
  }

  return { repoRoot, docsRoot, files, fileToUrl, urlToFile };
}

/** Split a raw URL into its path part and the trailing `#anchor`/`?query` suffix. */
export function splitSuffix(rawUrl: string): { pathPart: string; suffix: string } {
  const match = rawUrl.match(/[#?]/);
  if (!match || match.index === undefined) return { pathPart: rawUrl, suffix: '' };
  return { pathPart: rawUrl.slice(0, match.index), suffix: rawUrl.slice(match.index) };
}

/** The written form of a link, preserved across a rewrite. */
export type LinkStyle = 'atSite' | 'fileAbs' | 'fileRel' | 'urlAbs' | 'urlRel';

/** Classify how a link's path part is written, so a rewrite can reproduce the same form. */
export function detectLinkStyle(pathPart: string): LinkStyle {
  if (pathPart.startsWith('@site/')) return 'atSite';
  if (/\.mdx?$/.test(pathPart)) return pathPart.startsWith('/') ? 'fileAbs' : 'fileRel';
  return pathPart.startsWith('/') ? 'urlAbs' : 'urlRel';
}

function toPosix(p: string): string {
  return p.replace(/\\/g, '/');
}

/** Ensure a relative path is explicitly relative (`./x`, not `x`). */
function dotSlash(rel: string): string {
  return rel.startsWith('.') ? rel : './' + rel;
}

/**
 * Render a link to `target` from `container`, in the given style.
 *
 * @param style The original link's written form.
 * @param target Absolute path and site URL of the destination (`url` may be `null` for partials).
 * @param container Absolute path and site URL of the file the link lives in.
 * @param index The docs index (for repo/docs roots).
 * @returns The rewritten path part, or `null` when the style cannot be rendered (e.g. a
 *   URL-relative link whose container has no URL).
 */
export function renderRef(
  style: LinkStyle,
  target: { abs: string; url: string | null },
  container: { abs: string; url: string | null },
  index: DocsIndex,
): string | null {
  switch (style) {
    case 'atSite':
      return '@site/' + toPosix(path.relative(index.repoRoot, target.abs));
    case 'fileAbs':
      return '/' + toPosix(path.relative(index.docsRoot, target.abs));
    case 'fileRel':
      return dotSlash(toPosix(path.relative(path.dirname(container.abs), target.abs)));
    case 'urlAbs':
      return target.url;
    case 'urlRel':
      if (!container.url || !target.url) return null;
      return dotSlash(path.posix.relative(path.posix.dirname(container.url), target.url));
  }
}

/**
 * Resolve a link's raw URL to the absolute doc file it points at.
 *
 * Handles every form the repo uses: `@site/docs/...` ESM specifiers, relative and absolute
 * file-style links (`../foo.mdx`), and URL-style links (`/section/page`, `../page`) which are
 * mapped back to a file via the URL index. Returns `null` for external links, fragments, and
 * URLs that resolve to no indexed route.
 *
 * @param rawUrl The destination exactly as written.
 * @param fromFileAbs Absolute path of the file the link lives in.
 * @param index The docs index.
 * @returns Absolute target file path, or `null`.
 */
export function resolveRefToFile(
  rawUrl: string,
  fromFileAbs: string,
  index: DocsIndex,
): string | null {
  const { pathPart } = splitSuffix(rawUrl);
  if (isExternalOrFragment(pathPart)) return null;

  if (pathPart.startsWith('@site/')) {
    return path.resolve(index.repoRoot, pathPart.slice('@site/'.length));
  }

  if (/\.mdx?$/.test(pathPart)) {
    if (pathPart.startsWith('/')) return path.resolve(index.docsRoot, '.' + pathPart);
    return path.resolve(path.dirname(fromFileAbs), pathPart);
  }

  // URL-style link (no extension): map back to a file via the URL index.
  let urlPath: string;
  if (pathPart.startsWith('/')) {
    urlPath = normalizeUrl(pathPart);
  } else {
    const fromUrl = index.fileToUrl.get(fromFileAbs);
    if (!fromUrl) return null; // partials have no stable URL to resolve relative links against
    urlPath = normalizeUrl(path.posix.join(path.posix.dirname(fromUrl), pathPart));
  }
  return index.urlToFile.get(urlPath) ?? null;
}

/** 1-based line number of a byte offset within `content`. */
function lineAt(content: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset && i < content.length; i++) {
    if (content[i] === '\n') line++;
  }
  return line;
}

/**
 * Resolve every link in the tree to the file it targets.
 *
 * A file that fails to parse is recorded in `unparsed` rather than aborting the scan, so a
 * single malformed file never silently drops the whole inventory. Callers must surface
 * `unparsed` — those files may contain references the codemod could not see.
 *
 * @param index The docs index.
 * @returns Resolved {@link LinkRecord}s and any {@link UnparsedFile}s.
 */
export function scanLinks(index: DocsIndex): ScanResult {
  const records: LinkRecord[] = [];
  const unparsed: UnparsedFile[] = [];
  for (const file of index.files) {
    let refs: LinkRef[];
    try {
      refs = extractLinkRefs(file.content);
    } catch (error) {
      unparsed.push({
        file: file.abs,
        reason: error instanceof Error ? error.message : String(error),
      });
      continue;
    }
    for (const ref of refs) {
      records.push({
        fromFile: file.abs,
        ref,
        toFile: resolveRefToFile(ref.rawUrl, file.abs, index),
        line: ref.range ? lineAt(file.content, ref.range[0]) : null,
      });
    }
  }
  return { records, unparsed };
}
