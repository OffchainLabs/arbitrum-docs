/**
 * The "API Refs" footer menu (`components/sidebar-resource-links.tsx`) is built from the generated
 * `content/docs/json-rpc-spike/meta.json`, so every entry must be a real page and every page must
 * sit under a `---group---` separator. Same tripwire shape as `shared.test.ts`.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { apiRefsMenu } from '../../lib/api-refs-menu.ts';
import { buildIndex } from './doc-links.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const meta = JSON.parse(
  readFileSync(path.join(repoRoot, 'content/docs/json-rpc-spike/meta.json'), 'utf8'),
);

test('groups the entries of meta.json under their separators, in order', () => {
  const menu = apiRefsMenu({ pages: ['---a_---', 'a_one', 'a_two', '---b_---', 'b_one'] }, '/x');
  assert.deepEqual(menu, [
    {
      label: 'a_',
      items: [
        { text: 'a_one', url: '/x/a_one' },
        { text: 'a_two', url: '/x/a_two' },
      ],
    },
    { label: 'b_', items: [{ text: 'b_one', url: '/x/b_one' }] },
  ]);
});

test('throws for a page before the first separator', () => {
  assert.throws(
    () => apiRefsMenu({ pages: ['a_one', '---a_---'] }, '/x'),
    /before any ---group---/,
  );
});

test('every menu entry of the real meta.json resolves to a page under content/docs', () => {
  const { byUrl } = buildIndex(repoRoot);
  const menu = apiRefsMenu(meta, '/json-rpc-spike');
  assert.ok(menu.length >= 2, 'the reference has at least two namespaces');
  const missing = menu.flatMap((g) => g.items.map((i) => i.url)).filter((url) => !byUrl.has(url));
  assert.deepEqual(missing, []);
});
