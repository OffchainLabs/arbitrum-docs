/**
 * A block component (`<Callout>`, `<Tabs>`, `<Cards>`, …) in a paragraph whose contents prevent
 * Fumadocs from removing its paragraph wrapper. MDX puts it inside a `<p>`, the browser closes the
 * `<p>` at its `<div>`, and React hydration fails. Put the tags on their own lines, with a blank
 * line before and after.
 */
import { type MdxRuleDefinition, jsxElements } from '../shared.ts';

/** Components that render a block element, so MDX must not put them inside a paragraph. */
const BLOCK_COMPONENTS = new Set([
  'Callout',
  'Accordions',
  'Accordion',
  'Tabs',
  'Tab',
  'Cards',
  'Card',
  'Steps',
  'Step',
]);

const rule: MdxRuleDefinition<'inParagraph'> = {
  meta: {
    type: 'problem',
    docs: { description: 'block component glued to text renders inside <p> and breaks hydration' },
    messages: {
      inParagraph:
        '<{{name}}> is inside a paragraph, which breaks hydration; put its tags on their own lines with a blank line before and after',
    },
  },
  create(context) {
    const { sourceCode } = context;
    return {
      root() {
        for (const element of jsxElements(sourceCode)) {
          if (element.inParagraph && BLOCK_COMPONENTS.has(element.name)) {
            context.report({
              loc: sourceCode.getLocFromIndex(element.offset),
              messageId: 'inParagraph',
              data: { name: element.name },
            });
          }
        }
      },
    };
  },
};

export default rule;
