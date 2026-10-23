/**
 * A `<Term id>` or `<Reference collection id>` that resolves to no collection entry, or names a
 * collection that is not registered. An unknown term would otherwise render plainly with a
 * runtime warning. `scripts/references-check.ts` keeps the whole-repo checks: an entry with no
 * `id`, a duplicate id, and a partial with a `<Term>` that a file ESM-imports.
 *
 * `<Reference collection id>` is matched although `components/mdx.tsx` registers only `<Term>`
 * today, so a future collection gets the same check without a change here.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { walk } from '../../scripts/lib/partials.ts';
import { type MdxRuleDefinition, REPO_ROOT } from '../shared.ts';

// Keep in sync with lib/references.ts (the registry the app uses).
const COLLECTION_DIRS: Readonly<Record<string, string>> = { glossary: 'content/glossary' };

type Collections = Readonly<Record<string, ReadonlySet<string>>>;
type Options = [{ collections?: Record<string, string[]> }?];

let fileCollections: Collections | undefined;

/** Every entry id of every collection, read from the entries' `id` frontmatter. */
function defaultCollections(): Collections {
  if (fileCollections) return fileCollections;
  const out: Record<string, Set<string>> = {};
  for (const [name, dir] of Object.entries(COLLECTION_DIRS)) {
    const ids = (out[name] = new Set<string>());
    for (const abs of walk(path.join(REPO_ROOT, dir), (p) => /\.mdx?$/i.test(p))) {
      const m = /^---\n([\s\S]*?)\n---/.exec(readFileSync(abs, 'utf8'));
      const id =
        m &&
        /^id:\s*(.+)$/m
          .exec(m[1])?.[1]
          ?.trim()
          .replace(/^['"]|['"]$/g, '');
      if (id) ids.add(id);
    }
  }
  return (fileCollections = out);
}

const rule: MdxRuleDefinition<'noEntry' | 'noCollection', Options> = {
  meta: {
    type: 'problem',
    docs: { description: 'a glossary reference resolves to no entry' },
    messages: {
      noEntry: 'no "{{collection}}" entry for id "{{id}}"',
      noCollection: 'unknown reference collection "{{collection}}"',
    },
    schema: [
      {
        type: 'object',
        properties: {
          collections: {
            type: 'object',
            additionalProperties: { type: 'array', items: { type: 'string' } },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const { sourceCode } = context;
    const override = context.options[0]?.collections;
    const collections: Collections = override
      ? Object.fromEntries(Object.entries(override).map(([k, v]) => [k, new Set(v)]))
      : defaultCollections();
    const check = (index: number, collection: string, id: string): void => {
      const loc = sourceCode.getLocFromIndex(index);
      if (!collections[collection]) {
        context.report({ loc, messageId: 'noCollection', data: { collection } });
      } else if (!collections[collection].has(id)) {
        context.report({ loc, messageId: 'noEntry', data: { collection, id } });
      }
    };
    return {
      root() {
        const { text } = sourceCode;
        for (const m of text.matchAll(/<Term\s+id="([^"]+)"/g)) check(m.index, 'glossary', m[1]);
        for (const m of text.matchAll(/<Reference\b([^>]*?)>/g)) {
          const collection = /collection="([^"]+)"/.exec(m[1])?.[1];
          const id = /id="([^"]+)"/.exec(m[1])?.[1];
          if (collection && id) check(m.index, collection, id);
        }
      },
    };
  },
};

export default rule;
