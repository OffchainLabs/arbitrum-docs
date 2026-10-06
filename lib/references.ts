import { glossary } from 'collections/server';
import type { MDXContent } from 'mdx/types';

import { docsRoute } from './shared';

/**
 * Registry for the glossary hover references. A reference collection is a `defineCollections` doc
 * collection (`{ id, title, sortAs? }` plus the definition body); to add one, define it in
 * `source.config.ts` and add an entry here. `scripts/references-check.ts` reads the files directly.
 */
/** Declared explicitly: the generated collection module is `@ts-nocheck` and types as `any`. */
export interface ReferenceEntry {
  id: string;
  title: string;
  sortAs?: string;
  body: MDXContent;
}

interface ReferenceCollection {
  entries: ReferenceEntry[];
  /** Route of the full index page for this collection, if one exists. */
  route?: string;
}

export const references = {
  glossary: { entries: glossary as ReferenceEntry[], route: `${docsRoute}/glossary` },
} satisfies Record<string, ReferenceCollection>;

export type ReferenceCollectionName = keyof typeof references;

/** The reference entry for `id` in `collection`, or undefined if absent. */
export function getReference(
  collection: ReferenceCollectionName,
  id: string,
): ReferenceEntry | undefined {
  return references[collection].entries.find((entry) => entry.id === id);
}

/** All entries in `collection`, sorted by `sortAs` (falling back to `title`). */
export function listReferences(collection: ReferenceCollectionName): ReferenceEntry[] {
  return [...references[collection].entries].sort((a, b) =>
    (a.sortAs ?? a.title).localeCompare(b.sortAs ?? b.title),
  );
}
