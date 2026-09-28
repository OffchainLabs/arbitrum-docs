import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { defineCollections, defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { execFileSync } from 'node:child_process';
import { z } from 'zod';

import { mdxOptions } from './lib/mdx-options.ts';
import { referenceSchema } from './lib/reference-schema';

// A shallow clone reports its oldest commit as adding every file, which would stamp most pages
// with one wrong date, so no date is resolved without full history. Vercel clones shallow unless
// `VERCEL_DEEP_CLONE=true` is set.
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

// Never `false`: fumadocs-mdx types `page.data.lastModified` only while the option is truthy, so
// the fallback is a resolver that returns no date.
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
    lastModified,
  },
  meta: {
    schema: metaSchema,
  },
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
