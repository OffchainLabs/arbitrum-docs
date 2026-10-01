import assert from 'node:assert/strict';
import { test } from 'node:test';

import { markdownTwins, markdownUrl } from '../../lib/markdown-redirects.ts';

const entry = (source: string, destination: string, permanent = false) => ({
  source,
  destination,
  permanent,
});

test('a redirect into /docs gets a .md twin with the same permanence', () => {
  assert.deepEqual(markdownTwins([entry('/stylus/quickstart', '/docs/stylus/quickstart', true)]), [
    entry('/stylus/quickstart.md', '/docs/stylus/quickstart.md', true),
    entry('/index.md', '/docs.md', true),
  ]);
});

test('the docs landing and a fragment destination map to the mirror URL', () => {
  assert.equal(markdownUrl('/docs'), '/docs.md');
  assert.equal(markdownUrl('/docs/a/b#section'), '/docs/a/b.md');
  assert.equal(markdownUrl('/docs/a/'), '/docs/a.md');
});

test('external, non-docs, pattern and .md sources get no twin', () => {
  const twins = markdownTwins([
    entry('/aep', 'https://docs.arbitrum.foundation/calculate-aep-fees'),
    entry('/img/a.png', '/img/a.svg'),
    entry('/docsish', '/docsfoo'),
    entry('/assets/files/:name([^/]+)-:hash([0-9a-f]{32}).pdf', '/docs/audit-reports'),
    entry('/already.md', '/docs/x'),
    entry('/', '/docs'),
  ]);
  assert.deepEqual(twins, [entry('/index.md', '/docs.md', true)]);
});

test('a trailing slash on the source does not produce "/.md"', () => {
  assert.equal(markdownTwins([entry('/a/', '/docs/a')])[0].source, '/a.md');
});
