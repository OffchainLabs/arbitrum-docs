/** Root documentation URLs coexist with the home page, machine routes, and public files. */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { buildIndex } from './doc-links.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { byUrl } = buildIndex(repoRoot);

test('root article URLs do not collide with machine routes or public files', () => {
  const reserved =
    /^(?:\/(?:api|og|llms\.mdx|_next|\.well-known)(?:\/|$)|\/(?:llms\.txt|llms-full\.txt|sitemap\.xml|robots\.txt)$)/;
  const collisions = [...byUrl.keys()].filter((url) => {
    const file = path.join(repoRoot, 'public', url);
    return reserved.test(url) || (existsSync(file) && statSync(file).isFile());
  });
  assert.deepEqual(collisions, []);
  assert.ok(byUrl.has('/'), 'the root overview remains available to markdown consumers');
});

test('markdown rewrite accepts root page paths and leaves direct machine mirrors intact', () => {
  const config = readFileSync(path.join(repoRoot, 'next.config.ts'), 'utf8');
  const source = config.match(/source: '([^']*\(\?!llms[^']*)'/)?.[1];
  assert.ok(source, 'missing machine-route exclusion in markdown rewrite');
  // Decode JavaScript string escaping before using Next's actual matcher.
  const pattern = source.replace(/\\\\/g, '\\');
  const { match } = createRequire(import.meta.url)('next/dist/compiled/path-to-regexp');
  const matches = match(pattern);
  assert.equal(matches('/llms.mdx/docs/content.md'), false);
  assert.equal(matches('/llms.mdx/docs/stylus/quickstart/content.md'), false);
  assert.equal(matches('/stylus/quickstart.md').params.path, 'stylus/quickstart');
  assert.equal(matches('/chain-info.md').params.path, 'chain-info');
});
