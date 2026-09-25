import { z } from 'zod';

/**
 * Shared frontmatter schema for every reference collection (glossary, and future types like
 * precompiles or config params). The MDX body is the definition. Kept in its own module because
 * `source.config.ts` may only export collections — see
 * .claude/docs/superpowers/specs/2026-07-10-references-glossary-design.md.
 */
export const referenceSchema = z.object({
  id: z.string(),
  title: z.string(),
  sortAs: z.string().optional(),
});
