/**
 * A link or bare URL in a heading. Fumadocs wraps heading content in its own anchor, so the page
 * serves `<a>` inside `<a>` and React hydration fails. `[#custom-id]` and images are fine.
 */
import { type MdxRuleDefinition, maskedText } from '../shared.ts';

const LINK_IN_BRACKETS = /(?<!!)\[(?:[^[\]]|\[[^[\]]*\])*\](?:\([^)]*\)|\[[^[\]]*\])/;
const ANY_LINK = /!?\[(?:[^[\]]|\[[^[\]]*\])*\](?:\([^)]*\)|\[[^[\]]*\])/g;
const TAG = /<\/?[A-Za-z][A-Za-z0-9.-]*(?:\s[^>]*)?\/?>/g;

const rule: MdxRuleDefinition<'linkInHeading'> = {
  meta: {
    type: 'problem',
    docs: { description: 'link inside a heading nests <a> inside <a>' },
    messages: { linkInHeading: 'heading contains {{problems}}, which nests <a> inside <a>' },
  },
  create(context) {
    const { sourceCode } = context;
    return {
      root() {
        for (const m of maskedText(sourceCode).matchAll(/^#{1,6}[ \t]+([^\n]*)$/gm)) {
          const heading = m[1];
          const problems: string[] = [];
          if (LINK_IN_BRACKETS.test(heading)) problems.push('a markdown link');
          if (/<a[\s>]/i.test(heading)) problems.push('an <a> element');
          const rest = heading.replace(ANY_LINK, ' ').replace(TAG, ' ');
          if (/(?:https?:\/\/|\bwww\.)\S/i.test(rest)) problems.push('a bare URL');
          if (problems.length) {
            context.report({
              loc: sourceCode.getLocFromIndex(m.index),
              messageId: 'linkInHeading',
              data: { problems: problems.join(' + ') },
            });
          }
        }
      },
    };
  },
};

export default rule;
