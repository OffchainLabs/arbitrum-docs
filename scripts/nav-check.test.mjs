import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkDir, classifyEntry } from './lib/nav.mjs';

test('classifyEntry recognises every meta.json entry form', () => {
  assert.equal(classifyEntry('my-page').kind, 'page');
  assert.equal(classifyEntry('...').kind, 'rest');
  assert.equal(classifyEntry('z...a').kind, 'rest');
  assert.equal(classifyEntry('[Chain info](/docs/chain-info)').kind, 'link');
  assert.equal(classifyEntry('---Section---').kind, 'separator');
  assert.equal(classifyEntry('!hidden-page').kind, 'exclude');
});

test('checkDir flags entries with no file on disk as ghosts', () => {
  const result = checkDir({
    dir: 'configuration',
    meta: { pages: ['layer-leap', 'core'] },
    entries: [
      { name: 'core', isDir: true },
      { name: 'index.mdx', isDir: false },
    ],
  });
  assert.deepEqual(result.ghosts, ['layer-leap']);
});

test('checkDir flags on-disk pages absent from pages[] when no rest operator', () => {
  const result = checkDir({
    dir: 'operate',
    meta: { pages: ['arbos-upgrade'] },
    entries: [
      { name: 'arbos-upgrade.mdx', isDir: false },
      { name: 'gas-target.mdx', isDir: false },
      { name: 'index.mdx', isDir: false },
    ],
  });
  assert.deepEqual(result.hidden, ['gas-target']);
  assert.equal(result.hasRest, false);
});

test('rest operator means nothing is hidden', () => {
  const result = checkDir({
    dir: 'operate',
    meta: { pages: ['arbos-upgrade', '...'] },
    entries: [
      { name: 'arbos-upgrade.mdx', isDir: false },
      { name: 'gas-target.mdx', isDir: false },
    ],
  });
  assert.deepEqual(result.hidden, []);
  assert.equal(result.hasRest, true);
});

test('index.mdx is never reported as hidden', () => {
  const result = checkDir({
    dir: 'x',
    meta: { pages: ['a'] },
    entries: [
      { name: 'a.mdx', isDir: false },
      { name: 'index.mdx', isDir: false },
    ],
  });
  assert.deepEqual(result.hidden, []);
});

test('index may legally be listed in pages and is not a ghost', () => {
  const result = checkDir({
    dir: 'x',
    meta: { pages: ['index', 'a'] },
    entries: [
      { name: 'a.mdx', isDir: false },
      { name: 'index.mdx', isDir: false },
    ],
  });
  assert.deepEqual(result.ghosts, []);
});
