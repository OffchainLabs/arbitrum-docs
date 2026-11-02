/**
 * A `<Var name="…">` or `{var:name}` that names no key in `content/vars.json`. A missing key
 * renders the literal string `undefined`, and nothing else sees it, since MDX is not type-checked.
 * Reads the whole file text, code included, so a `<Var>` wrapped across lines is still read.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { VAR_PLACEHOLDER } from '../../lib/var-links.ts';
import { type MdxRuleDefinition, REPO_ROOT } from '../shared.ts';

type Options = [{ vars?: Record<string, unknown> }?];

let fileVars: Record<string, unknown> | undefined;

function defaultVars(): Record<string, unknown> {
  fileVars ??= JSON.parse(readFileSync(path.join(REPO_ROOT, 'content', 'vars.json'), 'utf8'));
  return fileVars!;
}

const rule: MdxRuleDefinition<'unknown' | 'noName', Options> = {
  meta: {
    type: 'problem',
    docs: { description: 'a variable reference names no key in content/vars.json' },
    messages: {
      unknown: '"{{name}}" is not a key in content/vars.json',
      noName: '<Var> without a static name',
    },
    schema: [
      {
        type: 'object',
        properties: { vars: { type: 'object' } },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const { sourceCode } = context;
    const vars = context.options[0]?.vars ?? defaultVars();
    return {
      root() {
        const { text } = sourceCode;
        for (const m of text.matchAll(/<Var\b([^>]*)>/g)) {
          const name = /\bname\s*=\s*["']([^"']+)["']/.exec(m[1])?.[1];
          const loc = sourceCode.getLocFromIndex(m.index);
          if (name === undefined) context.report({ loc, messageId: 'noName' });
          else if (!Object.hasOwn(vars, name))
            context.report({ loc, messageId: 'unknown', data: { name } });
        }
        for (const m of text.matchAll(VAR_PLACEHOLDER)) {
          if (!Object.hasOwn(vars, m[1])) {
            context.report({
              loc: sourceCode.getLocFromIndex(m.index),
              messageId: 'unknown',
              data: { name: m[1] },
            });
          }
        }
      },
    };
  },
};

export default rule;
