/**
 * A `<tr>` directly inside `<table>`. The browser inserts a `<tbody>` the server HTML lacks, so
 * React hydration fails.
 */
import { type MdxRuleDefinition, maskedText } from '../shared.ts';

const rule: MdxRuleDefinition<'trInTable'> = {
  meta: {
    type: 'problem',
    docs: { description: '<tr> is a direct child of <table>' },
    messages: {
      trInTable: '<tr> is a direct child of <table>; wrap the rows in <thead>, <tbody> or <tfoot>',
    },
  },
  create(context) {
    const { sourceCode } = context;
    return {
      root() {
        for (const table of maskedText(sourceCode).matchAll(/<table[\s>][\s\S]*?<\/table>/g)) {
          let depth = 0;
          for (const tok of table[0].matchAll(/<(\/?)(thead|tbody|tfoot|tr)\b/gi)) {
            const [, closing, name] = tok;
            if (name.toLowerCase() !== 'tr') depth += closing ? -1 : 1;
            else if (depth === 0 && !closing) {
              context.report({
                loc: sourceCode.getLocFromIndex(table.index + tok.index),
                messageId: 'trInTable',
              });
            }
          }
        }
      },
    };
  },
};

export default rule;
