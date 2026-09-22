import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { defineCollections, defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { transformerTwoslash } from 'fumadocs-twoslash';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { z } from 'zod';

import { referenceSchema } from './lib/reference-schema';
import { remarkVarUrls } from './lib/remark-var-urls';

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
 * `scripts/partials-check.mjs` enforces that no `_`-prefixed file reappears under content/docs.
 */
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: arbitrumPageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
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

export default defineConfig({
  mdxOptions: {
    // Fumadocs-mdx already wires `remark-include` internally (verified in
    // dist/build-mdx-*.js). The `<include>` MDX directive works out of the box
    // — no additional remark plugins required for partial inclusion.
    //
    // remark-math + rehype-katex render the LaTeX math ($…$ / $$…$$) used across
    // the ported docs (mirrors the Docusaurus setup). KaTeX CSS is imported in
    // app/layout.tsx.
    //
    // remarkVarUrls resolves `@@varName@@` inside link destinations, the one place `<Var>` cannot
    // reach (a destination admits neither JSX nor whitespace). Order against remarkMath is
    // irrelevant — they touch disjoint node types.
    remarkPlugins: [remarkMath, remarkVarUrls],
    rehypePlugins: (v) => [rehypeKatex, ...v],
    //
    // twoslash only activates on ```ts twoslash blocks (TypeScript). Other
    // languages (shell, Rust, Solidity) fall through to the default transformers.
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      transformers: [...(rehypeCodeDefaultOptions.transformers ?? []), transformerTwoslash()],
    },
    //
    // fumadocs-mdx applies `remarkImage` to every collection whether or not it is configured here,
    // and its default `onError: 'error'` throws when it cannot read a remote image's dimensions.
    // Because the plugin runs at build time, one unreachable third-party URL fails the whole render:
    // every docs route returns 500 in dev and `next build` fails, which fails the Vercel deploy.
    // That happened on 2026-09-17 when the 7 googleusercontent images in third-party-docs/TheGraph
    // started returning 404.
    //
    // `external: false` addresses the cause rather than the symptom: the plugin stops probing
    // remote images altogether, so compilation makes no network request and is deterministic and
    // offline. A third-party host going down can no longer affect a build, rather than affecting it
    // and having the failure swallowed.
    //
    // `onError` therefore returns to its default `error`. That is a smaller change than it sounds:
    // a missing *local* image is already caught twice over, by `check-links` and by module
    // resolution ("Can't resolve ../../public/img/…"), neither of which `onError` governs. The
    // default is restored because nothing needs it relaxed, not because it catches something new.
    //
    // Safe because no page uses markdown image syntax with a remote src. A markdown remote image
    // would reach `next/image` without a width and render as a 500; `<ImageZoom src="https://…" />`
    // and plain `<img>` are unaffected, and that is how every remote image here is written.
    remarkImageOptions: { external: false },
  },
});
