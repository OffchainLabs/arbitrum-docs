/**
 * A top-level `import` or `export`. Pages compile on demand (dynamic collections), where Fumadocs
 * supports neither: a relative import fails at request time and a package import escapes the
 * bundler. Use an `<include>` or a component registered in `components/mdx.tsx`. A Docusaurus
 * `@site/` or `@theme/` alias gets a hint in the message.
 */
import type { MdxRuleDefinition } from '../shared.ts';

const rule: MdxRuleDefinition<'alias' | 'esm'> = {
  meta: {
    type: 'problem',
    docs: { description: 'top-level import or export; a page cannot bring modules into scope' },
    messages: {
      alias: '{{specifier}} is a Docusaurus alias; use <include> or a registered component',
      esm: 'pages compile on demand and cannot import or export; use a registered component or <include>',
    },
  },
  create(context) {
    const { sourceCode } = context;
    return {
      root(root) {
        for (const node of root.children) {
          if (node.type !== 'mdxjsEsm') continue;
          const loc = sourceCode.getLocFromIndex(node.position?.start.offset ?? 0);
          const specifier = /['"](@(?:site|theme)\/[^'"]*)['"]/.exec(node.value)?.[1];
          if (specifier) context.report({ loc, messageId: 'alias', data: { specifier } });
          else context.report({ loc, messageId: 'esm' });
        }
      },
    };
  },
};

export default rule;
