/**
 * An `import … from '@site/…'` or `'@theme/…'` line. Those are Docusaurus aliases and do not
 * resolve here, so the build fails. Use an `<include>` or a component registered in
 * `components/mdx.tsx`.
 */
import { type MdxRuleDefinition, maskedText } from '../shared.ts';

const rule: MdxRuleDefinition<'siteImport'> = {
  meta: {
    type: 'problem',
    docs: { description: 'Docusaurus @site/@theme import does not resolve' },
    messages: {
      siteImport:
        '{{specifier}} is a Docusaurus alias and does not resolve; use <include> or a registered component',
    },
  },
  create(context) {
    const { sourceCode } = context;
    return {
      root() {
        const pattern = /(?:from|import)\s+['"](@(?:site|theme)\/[^'"]*)['"]/g;
        for (const m of maskedText(sourceCode).matchAll(pattern)) {
          context.report({
            loc: sourceCode.getLocFromIndex(m.index),
            messageId: 'siteImport',
            data: { specifier: m[1] },
          });
        }
      },
    };
  },
};

export default rule;
