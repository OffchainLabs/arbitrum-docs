/** A Docusaurus `@@name@@` or `@@name=value@@` token. Nothing substitutes it. */
import { type MdxRuleDefinition, maskedText } from '../shared.ts';

const rule: MdxRuleDefinition<'token'> = {
  meta: {
    type: 'problem',
    docs: { description: 'Docusaurus @@variable@@ token renders as literal text' },
    messages: {
      token:
        'Docusaurus token {{token}} renders as literal text; write <Var name="{{name}}" /> instead',
    },
  },
  create(context) {
    const { sourceCode } = context;
    return {
      root() {
        for (const m of maskedText(sourceCode).matchAll(/@@\w+(?:=[^@\n]*)?@@/g)) {
          context.report({
            loc: sourceCode.getLocFromIndex(m.index),
            messageId: 'token',
            data: { token: m[0], name: /@@(\w+)/.exec(m[0])?.[1] ?? '' },
          });
        }
      },
    };
  },
};

export default rule;
