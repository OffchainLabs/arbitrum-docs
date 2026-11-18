/**
 * `<Var>` inside a link destination or an `href`/`to`/`src` attribute, or a `{var:…}` placeholder
 * whose name is not an identifier. The tag holds spaces and quotes, so the link never parses (or
 * the attribute is cut short). A `{var:name}` placeholder is the working form.
 */
import { MALFORMED_VAR_PLACEHOLDER } from '../../lib/var-links.ts';
import { type MdxRuleDefinition, maskedText } from '../shared.ts';

const rule: MdxRuleDefinition<'destination' | 'attribute' | 'malformed'> = {
  meta: {
    type: 'problem',
    docs: { description: '<Var> in a link destination never substitutes' },
    messages: {
      destination:
        '<Var> in a link destination never substitutes; use a {var:name} placeholder in the destination instead',
      attribute:
        '<Var> in a URL attribute never substitutes; use a {var:name} placeholder in the attribute instead',
      malformed: '{{text}} is not a placeholder; the name must be a variable key',
    },
  },
  create(context) {
    const { sourceCode } = context;
    return {
      root() {
        const text = maskedText(sourceCode);
        for (const m of text.matchAll(/\]\([^)\n]*<Var\b/g)) {
          context.report({ loc: sourceCode.getLocFromIndex(m.index), messageId: 'destination' });
        }
        for (const m of text.matchAll(/\b(?:href|to|src)\s*=\s*["'][^"'<>]*<Var\b/g)) {
          context.report({ loc: sourceCode.getLocFromIndex(m.index), messageId: 'attribute' });
        }
        for (const m of text.matchAll(MALFORMED_VAR_PLACEHOLDER)) {
          context.report({
            loc: sourceCode.getLocFromIndex(m.index),
            messageId: 'malformed',
            data: { text: m[0] },
          });
        }
      },
    };
  },
};

export default rule;
