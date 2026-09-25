import { glossary } from 'collections/server';
import type { MDXContent } from 'mdx/types';

import { docsRoute } from './shared';

/**
 * Registry for the inline hover-reference system (see
 * .claude/docs/superpowers/specs/2026-07-10-references-glossary-design.md).
 *
 * Each reference collection is a `defineCollections` doc collection (schema `{ id, title, sortAs? }`,
 * body = the definition). To add a reference type: define the collection in `source.config.ts` and
 * add one entry here. `<Reference>`, `<ReferenceList>`, and the definitions all read this registry.
 * The build-time validator (`scripts/references-check.mjs`) reads the collection files directly, so
 * it does not depend on this module.
 */
/**
 * The fields we use from a reference collection entry. Declared explicitly rather than derived from
 * the generated collection, whose module is emitted with `@ts-nocheck` (its export would type as
 * `any` and defeat `noImplicitAny`). Matches `referenceSchema` frontmatter + the compiled MDX body.
 */
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
