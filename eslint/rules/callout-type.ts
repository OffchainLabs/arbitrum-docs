/**
 * `<Callout type>` outside `info|warn|error|idea|success`, the five spellings the house style and
 * CLAUDE.md name. Fumadocs also accepts `warning` and `tip` as aliases, but an unknown type renders
 * silently with no icon and the muted colour, so the gate keeps to one list.
 */
import { type MdxRuleDefinition, jsxElements, stringAttribute } from '../shared.ts';

export const CALLOUT_TYPES: readonly string[] = ['info', 'warn', 'error', 'idea', 'success'];

const rule: MdxRuleDefinition<'calloutType'> = {
  meta: {
    type: 'problem',
    docs: { description: 'Callout type is not one of the five house types' },
    messages: { calloutType: 'Callout type="{{type}}" is not a house type; use one of {{types}}' },
  },
  create(context) {
    const { sourceCode } = context;
    return {
      root() {
        for (const element of jsxElements(sourceCode)) {
          if (element.name !== 'Callout') continue;
          const type = stringAttribute(element, 'type');
          if (type !== undefined && !CALLOUT_TYPES.includes(type)) {
            context.report({
              loc: sourceCode.getLocFromIndex(element.offset),
              messageId: 'calloutType',
              data: { type, types: CALLOUT_TYPES.join(', ') },
            });
          }
        }
      },
    };
  },
};

export default rule;
