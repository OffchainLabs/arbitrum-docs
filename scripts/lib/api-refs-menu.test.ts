/**
 * The "API Refs" footer menu (`components/sidebar-resource-links.tsx`) is built from the generated
 * `content/docs/json-rpc-spike/meta.json`, so every entry must be a real page. Same tripwire shape
 * as `shared.test.ts`.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { apiRefsLinks } from '../../lib/api-refs-menu.ts';
import { buildIndex } from './doc-links.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const meta = JSON.parse(
  readFileSync(path.join(repoRoot, 'content/docs/json-rpc-spike/meta.json'), 'utf8'),
);

test('lists the pages of meta.json in order, skipping the separators', () => {
  const links = apiRefsLinks({ pages: ['---a_---', 'a_one', 'a_two', '---b_---', 'b_one'] }, '/x');
  assert.deepEqual(links, [
    { text: 'a_one', url: '/x/a_one' },
    { text: 'a_two', url: '/x/a_two' },
    { text: 'b_one', url: '/x/b_one' },
  ]);
});

test('every menu entry of the real meta.json resolves to a page under content/docs', () => {
  const { byUrl } = buildIndex(repoRoot);
  const links = apiRefsLinks(meta, '/json-rpc-spike');
  assert.ok(links.length >= 10, 'the reference has at least ten methods');
  const missing = links.map((link) => link.url).filter((url) => !byUrl.has(url));
  assert.deepEqual(missing, []);
});
