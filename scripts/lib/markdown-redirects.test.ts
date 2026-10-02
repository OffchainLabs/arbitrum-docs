import assert from 'node:assert/strict';
import { test } from 'node:test';

import { markdownTwins, markdownUrl } from '../../lib/markdown-redirects.ts';

const entry = (source: string, destination: string, permanent = false) => ({
  source,
  destination,
  permanent,
});

const docUrls = new Set(['/', '/stylus/quickstart', '/a/b', '/a', '/x']);

test('a redirect into a known doc page gets a .md twin with the same permanence', () => {
  assert.deepEqual(markdownTwins([entry('/old-quickstart', '/stylus/quickstart', true)], docUrls), [
    entry('/old-quickstart.md', '/stylus/quickstart.md', true),
  ]);
});

test('the docs landing and a fragment destination map to the mirror URL', () => {
  assert.equal(markdownUrl('/'), '/index.md');
  assert.equal(markdownUrl('/a/b#section'), '/a/b.md');
  assert.equal(markdownUrl('/a/'), '/a.md');
  assert.deepEqual(markdownTwins([entry('/old-home', '/')], docUrls), [
    entry('/old-home.md', '/index.md'),
  ]);
  assert.deepEqual(markdownTwins([entry('/old-section', '/a/b#section')], docUrls), [
    entry('/old-section.md', '/a/b.md'),
  ]);
});

test('external, unknown, asset, pattern and .md sources get no twin', () => {
  const twins = markdownTwins(
    [
      entry('/aep', 'https://docs.arbitrum.foundation/calculate-aep-fees'),
      entry('/img/a.png', '/img/a.svg'),
      entry('/not-a-doc', '/unknown'),
      entry('/assets/files/:name([^/]+)-:hash([0-9a-f]{32}).pdf', '/a'),
      entry('/already.md', '/x'),
      entry('/', '/x'),
    ],
    docUrls,
  );
  assert.deepEqual(twins, []);
});

test('an empty redirect list adds no redirect for the live root mirror', () => {
  assert.deepEqual(markdownTwins([], docUrls), []);
});

test('a trailing slash on the source does not produce "/.md"', () => {
  assert.equal(markdownTwins([entry('/old-a/', '/a')], docUrls)[0].source, '/old-a.md');
});
