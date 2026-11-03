/**
 * `<Var>` inside a fence or inline code span. MDX does not evaluate components in code, so the
 * reader sees the literal tag. The one rule that looks inside code.
 */
import type { Code, InlineCode } from 'mdast';

import type { MdxRuleDefinition } from '../shared.ts';

const rule: MdxRuleDefinition<'varInCode'> = {
  meta: {
    type: 'problem',
    docs: { description: '<Var> inside code renders as a literal tag' },
    messages: { varInCode: '<Var> inside code renders as a literal tag: {{tag}}' },
  },
  create(context) {
    const { sourceCode } = context;
    const check = (node: Code | InlineCode): void => {
      const start = node.position?.start.offset;
      const end = node.position?.end.offset;
      if (start === undefined || end === undefined) return;
      for (const m of sourceCode.text.slice(start, end).matchAll(/<Var\b[^>]*>/g)) {
        context.report({
          loc: sourceCode.getLocFromIndex(start + m.index),
          messageId: 'varInCode',
          data: { tag: m[0] },
        });
      }
    };
    return { code: check, inlineCode: check };
  },
};

export default rule;
