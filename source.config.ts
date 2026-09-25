import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { defineCollections, defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { execFileSync } from 'node:child_process';
import { z } from 'zod';

import { mdxOptions } from './lib/mdx-options.ts';
import { referenceSchema } from './lib/reference-schema';

/**
 * Whether git can answer "when was this file last changed?" truthfully.
 *
 * `lastModified: true` makes fumadocs-mdx run `git log --name-only -- <dir>` once and stamp each
 * file with the newest commit that touched it. In a **shallow** clone that answer is wrong, not
 * missing: the oldest commit in the truncated history is grafted as a parentless root, so git
 * diffs it against the empty tree and reports it as *adding every file in its tree*. Measured on
 * this repo at `--depth=10` (Vercel's default clone depth): 430 of ~450 pages came back stamped
 * with one boundary commit that in full history touched zero files under `content/docs`.
 *
 * A wrong "Last updated" date is worse than none, so no date is resolved unless the history is
 * complete (see `lastModified` below for how that is expressed without changing the collection's
 * type). Vercel clones at depth 10, so production shows no dates until `VERCEL_DEEP_CLONE=true` is
 * set in the project's environment variables.
 *
 * `git` missing entirely, or a non-repo checkout, lands in the `catch` and also omits the date.
 */
function hasFullGitHistory(): boolean {
  try {
    const out = execFileSync('git', ['rev-parse', '--is-shallow-repository'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    return out.trim() === 'false';
  } catch {
    return false;
  }
}

/**
 * The `lastModified` option for both doc collections.
 *
 * Deliberately **never `false`**. The option is part of the collection's type contract, not just
 * its behaviour: fumadocs-mdx only adds `lastModified?: Date` to the generated `DocData` when the
 * option is truthy, so switching it off would delete the field from the type and
 * `page.data.lastModified` would stop compiling. That would make `types:check` pass or fail
 * depending on how the repository happened to be cloned, and it did: CI checks out shallow, so the
 * first version of this change was green locally and red in CI.
 *
 * So the guard picks between two truthy values. With full history, `true` uses fumadocs-mdx's own
 * batched `git log`. Without it, a resolver that answers "unknown" for every file keeps the field
 * typed and simply yields no dates, which the page renders as no line at all.
 *
 * It has to be decided here rather than at render time: pages are rendered on demand in a
 * serverless runtime that has neither git nor the repository.
 */
const lastModified = hasFullGitHistory() ? true : async () => undefined;

/**
 * Per PRD §4.1, every doc page requires:
 *   title, description, content_type, author, sme
 * Optional:
 *   sidebar_label, user_story, draft
 *
 * The PRD's frontmatter contract is enforced at build time by Zod.
 * Build/validate fails on any MDX file missing a required field.
 */
const arbitrumPageSchema = pageSchema.extend({
  description: z.string(),
  sidebar_label: z.string().optional(),
  user_story: z.string().optional(),
  content_type: z.enum([
    'how-to',
    'concept',
    'quickstart',
    'tutorial',
    'reference',
    'troubleshooting',
    'faq',
  ]),
  author: z.string(),
  sme: z.string(),
  draft: z.boolean().default(false),
  /**
   * Free-form label for an archived version of a page (e.g. "ArbOS 20 (v1)"). Only set on the
   * archived MDX files consumed by the `docsVersions` collection; live pages leave it unset.
   * See .claude/docs/superpowers/specs/2026-07-17-partial-versioning-design.md.
   */
  version: z.string().optional(),
});

/**
 * Partials live in `content/partials/` — outside the doc collection `dir` entirely — so they can
 * never be routed and need no glob exclusion here. They are inlined via `<include cwd>…</include>`.
 * `scripts/partials-check.ts` enforces that no `_`-prefixed file reappears under content/docs.
 */
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: arbitrumPageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
    // Exposes `page.data.lastModified` (a `Date`) for the "Last updated on …" line in
    // app/docs/[[...slug]]/page.tsx, matching upstream Docusaurus' `showLastUpdateTime`.
    // Guarded, see `hasFullGitHistory` above.
    lastModified,
  },
  meta: {
    schema: metaSchema,
  },
});

/**
 * Archived page versions for partial versioning (option #2, version subfolders).
 *
 * A separate, non-routed doc collection (same idiom as `glossary` below). Its content lives
 * **outside** `content/docs` — at `content/_versions/<id>/…`, mirroring how
 * `content/partials/` sits outside the routed tree — so the router never sees it (picomatch array
 * globs are OR and can't exclude a subfolder inside the routed dir). `lib/versions.ts` indexes these
 * by file path and the docs page renders the selected one.
 * See .claude/docs/superpowers/specs/2026-07-17-partial-versioning-design.md.
 */
export const docsVersions = defineCollections({
  type: 'doc',
  dir: 'content/_versions',
  files: ['**/*.mdx'],
  schema: arbitrumPageSchema,
  postprocess: {
    // The same flag the `docs` collection sets, and it has to be set twice: the option is per
    // collection, so that one covers live pages only. It is what makes `getText('processed')`
    // resolve on an archive, which is how an archive gets the markdown mirror every live page has
    // (`/docs/<slug>/<id>.md` and the two other shapes, FS-2711). Drop it and those URLs fail at
    // request time, a long way from here.
    includeProcessedMarkdown: true,
  },
  // An archived page carries its own date: the last time the archive file itself changed, not the
  // live page's. Same guard as the docs collection.
  lastModified,
});

/**
 * Reference collections back the inline hover-reference system (see
 * .claude/docs/superpowers/specs/2026-07-10-references-glossary-design.md). Every entry shares
 * `referenceSchema` ({ id, title, sortAs? }); the MDX body is the definition. The glossary is the
 * first consumer; new reference types (precompiles, config params, …) add a collection with this
 * schema + one registry entry in `lib/references.ts`. These are a separate collection, so they do
 * NOT carry the docs page contract. (source.config may only export collections, hence the schema
 * lives in lib/reference-schema.)
 */
export const glossary = defineCollections({
  type: 'doc',
  dir: 'content/glossary',
  schema: referenceSchema,
});

export default defineConfig({ mdxOptions });
