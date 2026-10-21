/**
 * A capitalised JSX tag that `components/mdx.tsx` does not register, that is not a Fumadocs
 * default and that the file neither imports nor exports. MDX throws at render for an undefined
 * component. Register it.
 */
import {
  type MdxRuleDefinition,
  defaultKnownComponents,
  jsxElements,
  localNames,
} from '../shared.ts';

type Options = [{ components?: string[] }?];

const rule: MdxRuleDefinition<'unknown', Options> = {
  meta: {
    type: 'problem',
    docs: { description: 'JSX component is not registered, so the page throws at render' },
    messages: { unknown: '<{{name}}> is not registered; add it to components/mdx.tsx' },
    schema: [
      {
        type: 'object',
        properties: { components: { type: 'array', items: { type: 'string' } } },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const { sourceCode } = context;
    const override = context.options[0]?.components;
    const known = override ? new Set(override) : defaultKnownComponents();
    return {
      root(root) {
        const local = localNames(root);
        for (const element of jsxElements(sourceCode)) {
          const rootName = element.name.split('.')[0];
          if (/^[A-Z]/.test(rootName) && !known.has(rootName) && !local.has(rootName)) {
            context.report({
              loc: sourceCode.getLocFromIndex(element.offset),
              messageId: 'unknown',
              data: { name: rootName },
            });
          }
        }
      },
    };
  },
};

export default rule;
