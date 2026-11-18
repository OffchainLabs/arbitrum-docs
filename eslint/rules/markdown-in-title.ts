/**
 * Markdown (`**`, `_x_`, `*x*`, backticks, a `[link](…)`) in the `title` of a `<Callout>` or
 * `<Accordion>`. The title is a plain string, so the reader sees the asterisks.
 */
import { type MdxRuleDefinition, jsxElements, stringAttribute } from '../shared.ts';

/** What markdown a plain-string title holds, if any. */
function markdownIn(title: string): string[] {
  const found: string[] = [];
  if (/\*\*|__/.test(title)) found.push('bold');
  else if (/(^|[\s(])([*_])(?=\S)[^*_]*\S\2(?=$|[\s).,:;!?])/.test(title)) found.push('emphasis');
  if (title.includes('`')) found.push('code');
  if (/\[[^\]]*\]\(/.test(title)) found.push('a link');
  return found;
}

const rule: MdxRuleDefinition<'markdownInTitle'> = {
  meta: {
    type: 'problem',
    docs: { description: 'markdown in a title attribute renders as literal text' },
    messages: {
      markdownInTitle:
        '<{{name}}> title holds {{kinds}}, which renders literally; write it as plain text',
    },
  },
  create(context) {
    const { sourceCode } = context;
    return {
      root() {
        for (const element of jsxElements(sourceCode)) {
          if (element.name !== 'Callout' && element.name !== 'Accordion') continue;
          const title = stringAttribute(element, 'title');
          const kinds = title === undefined ? [] : markdownIn(title);
          if (kinds.length) {
            context.report({
              loc: sourceCode.getLocFromIndex(element.offset),
              messageId: 'markdownInTitle',
              data: { name: element.name, kinds: kinds.join(' + ') },
            });
          }
        }
      },
    };
  },
};

export default rule;
