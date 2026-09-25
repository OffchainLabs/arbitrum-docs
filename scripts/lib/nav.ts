/**
 * nav — detect meta.json navigation defects.
 *
 * Fumadocs treats `pages` as an allowlist: when present, on-disk siblings that are not listed are
 * excluded from the sidebar unless the `"..."` rest operator appears. Entries naming a page that does
 * not exist are silently ignored. Both failure modes are invisible at build time, so we check them here.
 *
 * It also reads the editorial navigation manifest, `lib/docs-navigation.json`: `checkSections`
 * below compares its `sourceFolders` arrays against the content tree, and `duplicateManifestPages`
 * reports a page URL claimed twice. That second rule lives in `lib/docs-navigation-rules.ts` so
 * the gate and the transformer apply the same copy of it.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import type { NavigationEntry, NavigationSection } from '../../lib/docs-navigation-rules.ts';

/**
 * A parsed `meta.json`. Only `pages` is read here, and it stays `unknown` until a caller narrows
 * it: Fumadocs accepts non-string entries without complaint, and `classifyEntry` reports them.
 */
export interface MetaJson {
  readonly pages?: unknown;
  readonly [key: string]: unknown;
}

/** One entry of a directory listing, as `checkDir` reads it. */
export interface DirEntry {
  name: string;
  isDir: boolean;
}

/** The kinds of entry a `pages` array can hold. */
export type EntryKind = 'unknown' | 'rest' | 'link' | 'separator' | 'exclude' | 'page';

export interface ClassifiedEntry {
  kind: EntryKind;
  name: string;
}

/** One directory's meta.json defects. `dir` is whatever the caller passed in. */
export interface DirCheck {
  dir: string;
  ghosts: string[];
  hidden: string[];
  hasRest: boolean;
}

/**
 * A content tree as plain data: docs-relative directory path (`''` is `content/docs`) to its
 * parsed meta.json, or `undefined` where the directory has none, plus every page path.
 */
export interface ContentTree {
  dirs: Map<string, MetaJson | undefined>;
  pages: Set<string>;
}

/** What `checkSections` reads of a manifest section: its `id`, and `sourceFolders` if any. */
export type CoverageSection = Pick<NavigationSection, 'id'> & Partial<NavigationSection>;

export interface MissingFolder {
  section: string;
  folder: string;
}

export interface SharedFolder {
  folder: string;
  sections: string[];
  count: number;
}

export interface ShadowLink {
  dir: string;
  entry: string;
  page: string;
}

export interface SectionCheck {
  missingFolders: MissingFolder[];
  sharedFolders: SharedFolder[];
  uncoveredFolders: string[];
  unsectioned: string[];
  shadowLinks: ShadowLink[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Parse a meta.json's text. A file that parses to something other than an object is read as an
 * empty one: every rule below reads only `pages`, and a non-object has none, so the answer is the
 * same either way. The directory still counts as having a meta.json.
 */
function parseMeta(text: string): MetaJson {
  const value: unknown = JSON.parse(text);
  return isRecord(value) ? value : {};
}

/** A meta.json's `pages` array, or `null` when it has none. */
function metaPages(meta: MetaJson | undefined): readonly unknown[] | null {
  const pages = meta?.pages;
  return Array.isArray(pages) ? pages : null;
}

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const optional = (value: unknown, type: 'string' | 'boolean'): boolean =>
  value === undefined || typeof value === type;

function isNavigationEntry(value: unknown): value is NavigationEntry {
  if (!isRecord(value)) return false;
  return (
    optional(value.name, 'string') &&
    optional(value.page, 'string') &&
    optional(value.href, 'string') &&
    optional(value.folder, 'string') &&
    optional(value.flatten, 'boolean') &&
    optional(value.defaultOpen, 'boolean') &&
    (value.children === undefined ||
      (Array.isArray(value.children) && value.children.every(isNavigationEntry)))
  );
}

function isNavigationSection(value: unknown): value is NavigationSection {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    isStringArray(value.sourceFolders) &&
    Array.isArray(value.children) &&
    value.children.every(isNavigationEntry)
  );
}

/**
 * Read the sections out of the navigation manifest.
 *
 * Separate from the `meta.json` checks below because it reads a different file: `meta.json` still
 * describes the content folders, while the manifest arranges those pages into the editorial
 * hierarchy the sidebar actually renders. Two rules need it, `duplicateManifestPages` (in
 * `lib/docs-navigation-rules.ts`, shared with the transformer) and `checkSections`, so the gate
 * reads the file once and hands the same array to both.
 *
 * Throws when `sections` does not have the manifest's shape, naming the file, rather than handing
 * the rules a value they would misread.
 */
export function readSections(manifestPath: string): NavigationSection[] {
  const manifest: unknown = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const sections = isRecord(manifest) ? manifest.sections : undefined;
  if (!Array.isArray(sections) || !sections.every(isNavigationSection)) {
    throw new Error(`${manifestPath}: "sections" is not an array of navigation sections`);
  }
  return sections;
}

/**
 * Fumadocs' own link-entry regex, copied verbatim from
 * `node_modules/fumadocs-core/dist/dynamic-lx_V4971.js:261` (fumadocs-core 16.15.9) so that the two
 * cannot drift. Three forms build a link node, not one: `[Name](/url)`, `[Icon][Name](/url)` and
 * `external:[Name](/url)`. `resolveLink` turns every match into a `type: "page"` node carrying the
 * literal `url` (the `external` group sets a flag and leaves `url` untouched), so all three shadow
 * a real page in exactly the same way. Recognising only the first left this gate with a hole shaped
 * like the bug it exists to catch.
 */
const LINK_ENTRY =
  /^(?<external>external:)?(?:\[(?<icon>[^\]]+)])?\[(?<name>[^\]]+)]\((?<url>[^)]+)\)$/;

/** Classify a single `pages` entry. */
export function classifyEntry(entry: unknown): ClassifiedEntry {
  if (typeof entry !== 'string') return { kind: 'unknown', name: String(entry) };
  if (entry === '...' || entry === 'z...a') return { kind: 'rest', name: entry };
  // `startsWith('[')` stays as a catch-all so a malformed bracket entry is still reported as a
  // link rather than as a missing page; LINK_ENTRY adds the `external:` form, which starts with a
  // letter and would otherwise be read as a page name.
  if (entry.startsWith('[') || LINK_ENTRY.test(entry)) return { kind: 'link', name: entry };
  if (entry.startsWith('---')) return { kind: 'separator', name: entry };
  if (entry.startsWith('!')) return { kind: 'exclude', name: entry.slice(1) };
  return { kind: 'page', name: entry };
}

/** Compare one directory's meta.json against its on-disk entries. */
export function checkDir({
  dir,
  meta,
  entries,
}: {
  dir: string;
  meta: MetaJson | undefined;
  entries: readonly DirEntry[];
}): DirCheck {
  const pages = metaPages(meta);
  if (!pages) return { dir, ghosts: [], hidden: [], hasRest: true };

  const classified = pages.map(classifyEntry);
  const hasRest = classified.some((c) => c.kind === 'rest');

  // `index.mdx` may legally be listed in `pages`, so it counts as on-disk for the ghost check —
  // but it is attached as the folder's own index regardless, so it can never be "hidden".
  const onDisk = new Set<string>();
  const hideable = new Set<string>();
  for (const e of entries) {
    if (e.isDir) {
      onDisk.add(e.name);
      hideable.add(e.name);
    } else if (e.name.endsWith('.mdx')) {
      const slug = e.name.replace(/\.mdx$/, '');
      onDisk.add(slug);
      if (e.name !== 'index.mdx') hideable.add(slug);
    }
  }

  const listed = new Set(
    classified.filter((c) => c.kind === 'page' || c.kind === 'exclude').map((c) => c.name),
  );

  const ghosts = [...listed].filter((name) => !onDisk.has(name) && !name.includes('/'));
  const hidden = hasRest ? [] : [...hideable].filter((name) => !listed.has(name));

  return { dir, ghosts: ghosts.sort(), hidden: hidden.sort(), hasRest };
}

/** Walk a content tree and check every directory that has a meta.json. */
export function checkTree(root: string): DirCheck[] {
  const results: DirCheck[] = [];
  const walk = (abs: string): void => {
    const entries = readdirSync(abs, { withFileTypes: true }).map((d) => ({
      name: d.name,
      isDir: d.isDirectory(),
    }));
    const metaPath = path.join(abs, 'meta.json');
    if (entries.some((e) => e.name === 'meta.json')) {
      const meta = parseMeta(readFileSync(metaPath, 'utf8'));
      const result = checkDir({ dir: abs, meta, entries });
      if (result.ghosts.length || result.hidden.length) results.push(result);
    }
    for (const e of entries) if (e.isDir) walk(path.join(abs, e.name));
  };
  walk(root);
  return results;
}

/**
 * Section coverage: the second navigation defect this module detects.
 *
 * Since PR #73 the rendered sidebar is built by `lib/docs-navigation.ts` from the manifest, and
 * what decides whether a page lands inside a section is that section's `sourceFolders` array. The
 * transformer places every explicitly claimed page, then sweeps each section's source folders for
 * leftovers and appends them to that section under "Additional guides". A page no source folder
 * reaches is still emitted, but beside the sections rather than inside one, so it renders above
 * them with no section sidebar of its own. That is invisible to `types:check` and to `build`
 * (FS-2751).
 *
 * The `"root": true` flags this rule used to read are gone. They decided nothing a reader saw: the
 * transformer overwrites `root` on every folder node it emits, so deleting all twelve left the
 * rendered tree structurally identical. See INTERNALS, "The sidebar and its roots".
 *
 * Three things can leave a page outside every section:
 *
 * 1. Its top-level directory is named in no section's `sourceFolders`.
 * 2. It is a loose page at the top of `content/docs` that no directory's `pages` array claims.
 *    `content/docs/resources/meta.json` is what claims the four that exist today, through
 *    `"../chain-info"`-style references.
 * 3. A `pages` link entry elsewhere points at the page's own URL. A link entry becomes a real page
 *    node in the content tree, so the transformer indexes it by URL alongside the real node and can
 *    both rename the page and pull it into the linking directory's section. Every root folder used
 *    to carry `"[Chain info](/docs/chain-info)"`, which is how `/docs/chain-info` came to be
 *    labelled "Third-party docs" (FS-2716). Measured again under the manifest: the same shape still
 *    moves a page between sections and still overwrites its label.
 */

/** The docs landing page belongs to no section by design: its sidebar is the section list itself. */
export const SECTIONLESS_BY_DESIGN: readonly string[] = ['index'];

/** Resolve a `pages` reference against the directory holding the meta.json, Fumadocs-style. */
export function resolveRef(dir: string, name: string): string {
  const out: string[] = [];
  for (const seg of `${dir}/${name}`.split('/')) {
    if (seg === '..') out.pop();
    else if (seg !== '' && seg !== '.') out.push(seg);
  }
  return out.join('/');
}

/** The docs-relative directory a docs-relative page path sits in (`''` for the docs root). */
function parentOf(p: string): string {
  const i = p.lastIndexOf('/');
  return i === -1 ? '' : p.slice(0, i);
}

/** The top-level directory a docs-relative path sits under (`''` for the docs root itself). */
function topLevelOf(p: string): string {
  const i = p.indexOf('/');
  return i === -1 ? p : p.slice(0, i);
}

/**
 * Compare the manifest's `sourceFolders` against the content tree, and find shadowing link entries.
 *
 * Takes the tree as plain data so it can be unit-tested without a filesystem:
 * - `dirs`: docs-relative directory path (`''` is `content/docs`) to its parsed meta.json, or
 *   `undefined` where the directory has none.
 * - `pages`: docs-relative page paths with no extension (`'chain-info'`, `'get-started/index'`).
 * - `sections`: the manifest sections, as read by `readSections`.
 *
 * Ownership mirrors `buildFolder` in fumadocs-core: an explicit `pages` entry claims a page or a
 * folder for the directory that lists it (the first claim wins, as in `own()`), and anything
 * unclaimed belongs to the directory it sits in. A directory is covered when that chain of claims
 * reaches a directory some section names in `sourceFolders`, which is exactly the set of folders
 * `buildDocsNavigation` sweeps for leftovers.
 *
 * Returns, in the order a report should read them:
 * - `missingFolders`: a `sourceFolders` entry that will not resolve to a folder node. The
 *   transformer throws on this, so it is a broken dev server rather than a wrong sidebar, but the
 *   gate names the section and the entry instead of leaving a stack trace to read. It tests for what
 *   the transformer needs rather than for a directory on disk, because fumadocs-core's `buildFolder`
 *   returns nothing when `storage.readDir` finds no file, and that storage holds only `.mdx` and
 *   `meta.json`. Measured: a `content/docs/empty-zone/` holding one `.txt` and named in a
 *   `sourceFolders` array passed the disk test while `pnpm dev` threw
 *   `Navigation source folder does not exist: empty-zone`.
 * - `sharedFolders`: a folder named more than once across the sections' `sourceFolders` arrays,
 *   whether by two sections or twice by one. Sections are swept in manifest order and the first
 *   listing takes every leftover, so the later one does nothing.
 * - `uncoveredFolders`: a top-level directory no section covers.
 * - `unsectioned`: a page no section covers, skipping pages whose top-level directory is already in
 *   `uncoveredFolders` so that one root cause produces one message. In practice what is left is a
 *   loose page at the top of `content/docs` that no directory claims.
 * - `shadowLinks`: a `pages` link entry pointing at a real page in this repo.
 */
export function checkSections({
  dirs,
  pages,
  sections,
  exempt = SECTIONLESS_BY_DESIGN,
}: ContentTree & {
  sections?: readonly CoverageSection[];
  exempt?: readonly string[];
}): SectionCheck {
  const pageOwner = new Map<string, string>();
  const folderOwner = new Map<string, string>();
  const shadowLinks: ShadowLink[] = [];

  for (const [dir, meta] of dirs) {
    const entries = metaPages(meta);
    if (!entries) continue;
    for (const entry of entries) {
      const { kind, name } = classifyEntry(entry);
      if (kind === 'link') {
        const target = linkTarget(name);
        const shadowed = target && (pages.has(target) ? target : null);
        const viaIndex =
          target && !shadowed && pages.has(`${target}/index`) ? `${target}/index` : null;
        // `name` rather than `entry`: a link is always a string entry, and `classifyEntry` returns
        // it unchanged as `name`, so the two are the same value with `name` already typed.
        const page = shadowed || viaIndex;
        if (page) shadowLinks.push({ dir, entry: name, page });
        continue;
      }
      // `...name` extracts a folder's children into this one; it claims no page of its own.
      if (kind !== 'page' || name.startsWith('...')) continue;
      const target = resolveRef(dir, name);
      if (pages.has(target)) {
        if (!pageOwner.has(target)) pageOwner.set(target, dir);
      } else if (dirs.has(target) && !folderOwner.has(target)) {
        folderOwner.set(target, dir);
      }
    }
  }

  // What `buildDocsNavigation` looks up is a folder node, which fumadocs-core builds only for a
  // directory whose storage holds at least one file, and that storage holds only `.mdx` pages and
  // `meta.json`. A directory of images, or one left empty mid-edit, has neither and gets no node.
  const hasFolderNode = (dir: string): boolean => {
    if (!dirs.has(dir)) return false;
    if (dirs.get(dir) !== undefined) return true;
    const prefix = `${dir}/`;
    for (const page of pages) if (page.startsWith(prefix)) return true;
    for (const [other, meta] of dirs)
      if (meta !== undefined && other.startsWith(prefix)) return true;
    return false;
  };

  const claims = new Map<string, string[]>();
  const missingFolders: MissingFolder[] = [];
  for (const section of sections ?? []) {
    for (const folder of section.sourceFolders ?? []) {
      if (!hasFolderNode(folder)) missingFolders.push({ section: section.id, folder });
      claims.set(folder, [...(claims.get(folder) ?? []), section.id]);
    }
  }
  const sharedFolders = [...claims]
    .filter(([, ids]) => ids.length > 1)
    .map(([folder, ids]) => ({ folder, sections: [...new Set(ids)], count: ids.length }));

  const covered = new Map<string, boolean>();
  const isCovered = (dir: string, seen = new Set<string>()): boolean => {
    const known = covered.get(dir);
    if (known !== undefined) return known;
    if (seen.has(dir)) return false;
    seen.add(dir);
    let value: boolean;
    if (claims.has(dir)) value = true;
    else if (dir === '') value = false;
    else value = isCovered(folderOwner.get(dir) ?? parentOf(dir), seen);
    covered.set(dir, value);
    return value;
  };

  const uncoveredFolders = [...dirs.keys()]
    .filter((dir) => dir !== '' && !dir.includes('/') && !isCovered(dir))
    .sort();

  const reported = new Set(uncoveredFolders);
  const exemptSet = new Set(exempt);
  const unsectioned: string[] = [];
  for (const page of pages) {
    if (exemptSet.has(page)) continue;
    const owner = pageOwner.get(page) ?? parentOf(page);
    if (!isCovered(owner) && !reported.has(topLevelOf(owner))) unsectioned.push(page);
  }

  return {
    missingFolders,
    sharedFolders,
    uncoveredFolders,
    unsectioned: unsectioned.sort(),
    shadowLinks,
  };
}

/** The docs-relative page path a link entry points at, or `null` for anything else. */
function linkTarget(entry: string): string | null {
  const url = LINK_ENTRY.exec(entry)?.groups?.url;
  if (!url || !url.startsWith('/docs/')) return null;
  return url.slice('/docs/'.length).split(/[#?]/)[0].replace(/\/$/, '');
}

/** Read a content tree into the plain `{ dirs, pages }` shape `checkSections` takes. */
export function readTree(root: string): ContentTree {
  const dirs = new Map<string, MetaJson | undefined>();
  const pages = new Set<string>();
  const walk = (abs: string, rel: string): void => {
    const entries = readdirSync(abs, { withFileTypes: true });
    const metaPath = path.join(abs, 'meta.json');
    dirs.set(
      rel,
      entries.some((e) => e.name === 'meta.json')
        ? parseMeta(readFileSync(metaPath, 'utf8'))
        : undefined,
    );
    for (const e of entries) {
      if (e.isDirectory()) walk(path.join(abs, e.name), rel ? `${rel}/${e.name}` : e.name);
      else if (e.name.endsWith('.mdx')) {
        const slug = e.name.replace(/\.mdx$/, '');
        pages.add(rel ? `${rel}/${slug}` : slug);
      }
    }
  };
  walk(root, '');
  return { dirs, pages };
}
