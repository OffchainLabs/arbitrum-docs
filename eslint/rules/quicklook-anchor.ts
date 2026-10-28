/** A Docusaurus `<a data-quicklook-from="…">` glossary anchor. It renders with no link and no hover. */
import { type MdxRuleDefinition, maskedText } from '../shared.ts';

const rule: MdxRuleDefinition<'quicklook'> = {
  meta: {
    type: 'problem',
    docs: { description: 'Docusaurus quicklook anchor renders with no link or hover' },
    messages: {
      quicklook:
        'Docusaurus quicklook anchor renders with no link or hover; write <Term id="…">…</Term> instead',
    },
  },
  create(context) {
    const { sourceCode } = context;
    return {
      root() {
        for (const m of maskedText(sourceCode).matchAll(/data-quicklook-from/g)) {
          context.report({ loc: sourceCode.getLocFromIndex(m.index), messageId: 'quicklook' });
        }
      },
    };
  },
};

export default rule;
