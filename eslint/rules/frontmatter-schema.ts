/**
 * A page's frontmatter breaks the contract in `lib/page-schema.ts`. `types:check` does not see
 * frontmatter: `fumadocs-mdx` only writes the file list, and the schema runs when a page compiles
 * in `next dev` or `next build`. This parses it the way Fumadocs does and validates it with the
 * same schema, so a missing `title` or an unknown `content_type` fails in seconds. Enabled for
 * `content/docs/**` only; partials and glossary entries carry no page contract.
 */
import { frontmatter } from 'fumadocs-core/content/md/frontmatter';

import { arbitrumPageSchema } from '../../lib/page-schema.ts';
import type { MdxRuleDefinition } from '../shared.ts';

const rule: MdxRuleDefinition<'invalid' | 'unparsable'> = {
  meta: {
    type: 'problem',
    docs: { description: 'page frontmatter breaks the contract in lib/page-schema.ts' },
    messages: {
      invalid: '{{field}}: {{message}} (the contract is in lib/page-schema.ts)',
      unparsable: 'frontmatter: {{message}}',
    },
  },
  create(context) {
    const { sourceCode } = context;
    return {
      root(root) {
        const first = root.children[0];
        const loc =
          first?.type === 'yaml' && first.position ? first.position : { line: 1, column: 1 };
        let data: unknown;
        try {
          data = frontmatter(sourceCode.text).data;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          context.report({ loc, messageId: 'unparsable', data: { message } });
          return;
        }
        const result = arbitrumPageSchema.safeParse(data);
        if (result.success) return;
        for (const issue of result.error.issues) {
          const field = issue.path.length ? issue.path.join('.') : '(frontmatter)';
          context.report({ loc, messageId: 'invalid', data: { field, message: issue.message } });
        }
      },
    };
  },
};

export default rule;
