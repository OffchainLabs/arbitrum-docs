import { docsVersions } from 'collections/server';
import type { TOCItemType } from 'fumadocs-core/toc';
import type { MDXContent } from 'mdx/types';

import { LATEST_ID, LATEST_LABEL, canonicalSlug, versionSources } from '@/lib/versions-constants';
import type { VersionOption } from '@/lib/versions-constants';

export {
  LATEST_ID,
  LATEST_LABEL,
  VERSION_PARAM,
  archiveParams,
  canonicalSlug,
  isArchiveId,
} from '@/lib/versions-constants';
export type { VersionOption } from '@/lib/versions-constants';

/**
 * Partial page versioning (see
 * .claude/docs/superpowers/specs/2026-07-17-partial-versioning-design.md).
 *
 * A hand-picked set of pages expose a version dropdown: **Latest** (the live page in the routed
 * `docs` collection) plus one or more archived versions. Archived versions are compiled by the
 * separate, non-routed `docsVersions` collection (option #2: `content/_versions/<id>/…`
 * subfolders) and looked up here by their virtual path. The docs page renders the selected version;
 * everything else is untouched.
 *
 * The registry itself lives in `lib/versions-constants.ts`, which imports nothing, because
 * `proxy.ts` and the client-side switcher both need it and this module drags the whole compiled
 * docs corpus in behind `collections/server`.
 *
 * To version another page: add `content/_versions/<id>/<slug>.mdx` and one entry to `VERSIONED`.
 */

/**
 * The fields we use from a `docsVersions` entry. Declared explicitly rather than derived from the
 * generated collection, whose module is emitted with `@ts-nocheck` (its export would type as `any`
 * and defeat `noImplicitAny`). Matches `arbitrumPageSchema` frontmatter + the compiled MDX runtime.
 */
export interface VersionedEntry {
  title: string;
  description: string;
  version?: string;
  body: MDXContent;
  toc: TOCItemType[];
  info: { path: string; fullPath: string };
  /**
   * The archive's own text. `'processed'` is the post-remark markdown the collection embeds under
   * `postprocess.includeProcessedMarkdown` in source.config.ts, and is what the archive's markdown
   * mirror serves (FS-2711). It rejects rather than resolving when that option is off, so the two
   * belong together.
   */
  getText: (type: 'raw' | 'processed') => Promise<string>;
  /**
   * Last git commit that touched the archive file, from the collection's `lastModified` option.
   * Absent when the checkout has no full git history (see `hasFullGitHistory` in source.config.ts).
   */
  lastModified?: Date;
}

const archives = docsVersions as VersionedEntry[];

/**
 * Repo-relative root of the `docsVersions` collection dir — the only storage-strategy-specific value
 * in this module. Option #2 (version subfolders) roots archives outside the routed tree; the
 * alternate sibling-file strategy keeps them in `content/docs`. `entry.info.path` is relative to
 * this dir.
 */
const ARCHIVE_ROOT = 'content/_versions';

/** Repo-relative path of an archive file, for building its GitHub "edit" link. */
export function archiveRepoPath(entry: VersionedEntry): string {
  return `${ARCHIVE_ROOT}/${entry.info.path}`;
}

function findArchive(path: string): VersionedEntry | undefined {
  return archives.find((entry) => entry.info.path === path);
}

/**
 * The version options for `slug`, latest first, or `undefined` if the page is not versioned.
 * Archive labels come from each file's `version` frontmatter, falling back to the version id.
 */
export function getVersions(slug: string): VersionOption[] | undefined {
  const sources = versionSources(slug);
  if (!sources) return undefined;

  return sources.map((source) => {
    if (!source.archivePath) return { id: source.id, label: LATEST_LABEL };
    const entry = findArchive(source.archivePath);
    return { id: source.id, label: entry?.version ?? source.id };
  });
}

/**
 * The archived entry for version `id` of `slug`, or `undefined` when `id` is missing, `latest`, or
 * not a registered archive (callers fall back to the live page).
 *
 * `slug` reaches here straight off the URL, via the markdown route as well as the docs page
 * (FS-2711), so the registry lookup goes through `versionSources` for its own-property guard. A
 * plain index read answers a slug like `constructor` with a function off `Object.prototype`, and
 * `?.find` on that throws rather than short-circuiting.
 */
export function getArchive(slug: string, id: string | undefined): VersionedEntry | undefined {
  if (!id || id === LATEST_ID) return undefined;
  const source = versionSources(slug)?.find(
    (candidate) => candidate.id === id && candidate.archivePath,
  );
  return source?.archivePath ? findArchive(source.archivePath) : undefined;
}

/** An archive resolved from a routed path whose last segment names a version id. */
export interface ResolvedArchive {
  /** Slug segments of the live page this archive belongs to. */
  pageSlug: string[];
  /** The archive's version id, i.e. the final path segment. */
  id: string;
  entry: VersionedEntry;
}

/**
 * Reads `/docs/<slug>/<id>` as version `<id>` of the page at `<slug>`, or `undefined` when the last
 * segment names no registered archive of its parent.
 *
 * Callers must try `source.getPage(slug)` first: a real page always wins over this reinterpretation,
 * so a child page can never be shadowed by an archive id (see the collision test named on
 * `VERSIONED`).
 */
export function resolveArchiveSlug(slug: string[] | undefined): ResolvedArchive | undefined {
  if (!slug || slug.length < 2) return undefined;

  const id = slug[slug.length - 1];
  const pageSlug = slug.slice(0, -1);
  const entry = getArchive(canonicalSlug(pageSlug), id);

  return entry ? { pageSlug, id, entry } : undefined;
}
