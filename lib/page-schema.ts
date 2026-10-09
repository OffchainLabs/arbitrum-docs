import { pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

/**
 * Frontmatter contract for every page under `content/docs`. The docs collection in
 * `source.config.ts` applies it when a page compiles (`next dev`, `next build`), and
 * `scripts/frontmatter-check.ts` applies it to every page up front, because `fumadocs-mdx` (what
 * `types:check` runs) only lists the files. In its own module because `source.config.ts` may only
 * export collections.
 *
 * Every page needs a title and a description; `sidebar_label`, `user_story` and `content_type` are optional.
 * `content_type` is an editorial label nothing renders, kept to one enum so values stay comparable.
 * `target_audience` and `user_story` preserve optional authoring context; neither renders.
 */
export const arbitrumPageSchema = pageSchema.extend({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  sidebar_label: z.string().trim().optional(),
  user_story: z.string().optional(),
  content_type: z
    .enum(['how-to', 'concept', 'quickstart', 'tutorial', 'reference', 'troubleshooting', 'faq'])
    .optional(),
  author: z.string().optional(),
  sme: z.string().optional(),
  third_party_content_owner: z.string().optional(),
  target_audience: z.string().optional(),
});
