import { docsVersions } from 'collections/server';
import type { TOCItemType } from 'fumadocs-core/toc';
import type { MDXContent } from 'mdx/types';

import { LATEST_ID, LATEST_LABEL, type VersionOption } from '@/lib/versions-constants';

export { LATEST_ID, LATEST_LABEL, VERSION_PARAM } from '@/lib/versions-constants';
export type { VersionOption } from '@/lib/versions-constants';

/**
 * Partial page versioning registry (see
 * .claude/docs/superpowers/specs/2026-07-17-partial-versioning-design.md).
 *
 * A hand-picked set of pages expose a version dropdown: **Latest** (the live page in the routed
 * `docs` collection) plus one or more archived versions. Archived versions are compiled by the
 * separate, non-routed `docsVersions` collection (option #2: `content/_versions/<id>/…`
 * subfolders) and looked up here by their virtual path. The docs page renders the selected version;
 * everything else is untouched.
 *
 * To version another page: add `content/_versions/<id>/<slug>.mdx` and one entry to
 * `VERSIONED` below.
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

interface VersionSource {
  /** Stable id used in the `?v=` URL. */
  id: string;
  /** Virtual path of the archive entry in `docsVersions`; omitted for the live page. */
  archivePath?: string;
}

/**
 * Canonical slug (a page's `slugs` joined with `/`) → ordered versions, latest first.
 * Only a hand-picked set of pages is versioned; everything else always renders Latest.
 */
const VERSIONED: Record<string, VersionSource[]> = {
  'run-a-node/start-here': [
    { id: LATEST_ID },
    { id: 'v1', archivePath: 'v1/run-a-node/start-here.mdx' },
  ],
  'run-a-node/run-batch-poster': [
    { id: LATEST_ID },
    { id: 'v1', archivePath: 'v1/run-a-node/run-batch-poster.mdx' },
  ],
  'run-a-node/nitro/build-nitro-locally': [
    { id: LATEST_ID },
    { id: 'v1', archivePath: 'v1/run-a-node/nitro/build-nitro-locally.mdx' },
  ],
};

function findArchive(path: string): VersionedEntry | undefined {
  return archives.find((entry) => entry.info.path === path);
}

/** Canonical slug for a page's slug segments. */
export function canonicalSlug(slug: string[] | undefined): string {
  return (slug ?? []).join('/');
}

/**
 * The version options for `slug`, latest first, or `undefined` if the page is not versioned.
 * Archive labels come from each file's `version` frontmatter, falling back to the version id.
 */
export function getVersions(slug: string): VersionOption[] | undefined {
  const sources = VERSIONED[slug];
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
 */
export function getArchive(slug: string, id: string | undefined): VersionedEntry | undefined {
  if (!id || id === LATEST_ID) return undefined;
  const source = VERSIONED[slug]?.find((candidate) => candidate.id === id && candidate.archivePath);
  return source?.archivePath ? findArchive(source.archivePath) : undefined;
}
