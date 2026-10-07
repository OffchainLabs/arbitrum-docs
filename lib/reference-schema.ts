import { z } from 'zod';

/**
 * Frontmatter schema for every reference collection (the glossary today). The MDX body is the
 * definition. In its own module because `source.config.ts` may only export collections.
 */
export const referenceSchema = z.object({
  id: z.string(),
  title: z.string(),
  sortAs: z.string().optional(),
});
