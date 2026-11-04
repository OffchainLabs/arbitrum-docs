/**
 * A JSX component (`<Var>`, `<Term>`, …) in a heading. Fumadocs compiles heading text into the
 * table of contents as JSX with no component in scope, so `next build` fails with "X is not
 * defined". Move it below.
 */
import { type MdxRuleDefinition, jsxElements } from '../shared.ts';

const rule: MdxRuleDefinition<'inHeading'> = {
  meta: {
    type: 'problem',
    docs: { description: 'a JSX component in a heading breaks the table of contents at build' },
    messages: {
      inHeading:
        'a JSX component in a heading breaks the table of contents at build; move <{{name}}> out of the heading text',
    },
  },
  create(context) {
    const { sourceCode } = context;
    return {
      root() {
        const reported = new Set<number>();
        for (const element of jsxElements(sourceCode)) {
          const { headingOffset } = element;
          if (headingOffset === undefined || reported.has(headingOffset)) continue;
          if (!/^[A-Z]/.test(element.name.split('.')[0])) continue;
          reported.add(headingOffset);
          context.report({
            loc: sourceCode.getLocFromIndex(headingOffset),
            messageId: 'inHeading',
            data: { name: element.name },
          });
        }
      },
    };
  },
};

export default rule;
