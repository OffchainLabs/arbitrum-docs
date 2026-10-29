/**
 * `<Tabs defaultValue={null}>`, a Docusaurus-era prop. Fumadocs takes it as the selected tab, so
 * every panel is hidden until a click. Delete it.
 */
import { type MdxRuleDefinition, isNullAttribute, jsxElements } from '../shared.ts';

const rule: MdxRuleDefinition<'nullDefault'> = {
  meta: {
    type: 'problem',
    docs: { description: 'Tabs defaultValue={null} hides every panel' },
    messages: {
      nullDefault:
        'Tabs defaultValue={null} hides every panel; delete it, the first tab is then selected',
    },
  },
  create(context) {
    const { sourceCode } = context;
    return {
      root() {
        for (const element of jsxElements(sourceCode)) {
          if (element.name === 'Tabs' && isNullAttribute(element, 'defaultValue')) {
            context.report({
              loc: sourceCode.getLocFromIndex(element.offset),
              messageId: 'nullDefault',
            });
          }
        }
      },
    };
  },
};

export default rule;
