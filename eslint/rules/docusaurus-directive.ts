/** A `:::note` line. Nothing converts it, so the reader sees the colons. */
import { type MdxRuleDefinition, maskedText } from '../shared.ts';

const rule: MdxRuleDefinition<'directive'> = {
  meta: {
    type: 'problem',
    docs: { description: 'unconverted Docusaurus ::: directive renders as literal text' },
    messages: { directive: 'Docusaurus ::: directive renders as literal text: {{text}}' },
  },
  create(context) {
    const { sourceCode } = context;
    return {
      root() {
        for (const m of maskedText(sourceCode).matchAll(/^[ \t]*:::+[^\n]*/gm)) {
          context.report({
            loc: sourceCode.getLocFromIndex(m.index),
            messageId: 'directive',
            data: { text: m[0].trim().slice(0, 60) },
          });
        }
      },
    };
  },
};

export default rule;
