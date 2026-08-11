import { test } from 'node:test';
import assert from 'node:assert/strict';

import { detectLinkStyle, splitSuffix, renderRef, type DocsIndex } from '../docs-link-index';

const stubIndex: DocsIndex = {
  repoRoot: '/repo',
  docsRoot: '/repo/docs',
  files: [],
  fileToUrl: new Map(),
  urlToFile: new Map(),
};

test('detectLinkStyle classifies each written form', () => {
  assert.equal(detectLinkStyle('@site/docs/x.mdx'), 'atSite');
  assert.equal(detectLinkStyle('/x/y.mdx'), 'fileAbs');
  assert.equal(detectLinkStyle('../x.mdx'), 'fileRel');
  assert.equal(detectLinkStyle('./x.md'), 'fileRel');
  assert.equal(detectLinkStyle('/x/y'), 'urlAbs');
  assert.equal(detectLinkStyle('../y'), 'urlRel');
  // A bare relative file link is classified fileRel; renderRef normalizes it to `./page.mdx`.
  assert.equal(detectLinkStyle('page.mdx'), 'fileRel');
});

test('splitSuffix separates anchor and query', () => {
  assert.deepEqual(splitSuffix('/a/b#c'), { pathPart: '/a/b', suffix: '#c' });
  assert.deepEqual(splitSuffix('/a/b?q=1'), { pathPart: '/a/b', suffix: '?q=1' });
  assert.deepEqual(splitSuffix('/a/b'), { pathPart: '/a/b', suffix: '' });
});

test('renderRef reproduces each style pointing at the moved target', () => {
  const target = { abs: '/repo/docs/c/b.mdx', url: '/c/b' };

  assert.equal(
    renderRef('atSite', target, { abs: '/repo/docs/a/x.mdx', url: '/a/x' }, stubIndex),
    '@site/docs/c/b.mdx',
  );
  assert.equal(
    renderRef('fileAbs', target, { abs: '/repo/docs/a/x.mdx', url: '/a/x' }, stubIndex),
    '/c/b.mdx',
  );
  assert.equal(
    renderRef('fileRel', target, { abs: '/repo/docs/a/x.mdx', url: '/a/x' }, stubIndex),
    '../c/b.mdx',
  );
  assert.equal(
    renderRef('urlAbs', target, { abs: '/repo/docs/a/x.mdx', url: '/a/x' }, stubIndex),
    '/c/b',
  );
  assert.equal(
    renderRef('urlRel', target, { abs: '/repo/docs/a/x.mdx', url: '/a/x' }, stubIndex),
    '../c/b',
  );
});

test('renderRef prefixes ./ for a same-directory file link', () => {
  const target = { abs: '/repo/docs/a/b.mdx', url: '/a/b' };
  assert.equal(
    renderRef('fileRel', target, { abs: '/repo/docs/a/x.mdx', url: '/a/x' }, stubIndex),
    './b.mdx',
  );
});

test('renderRef returns null for a url-relative link with no container url', () => {
  const target = { abs: '/repo/docs/c/b.mdx', url: '/c/b' };
  assert.equal(
    renderRef('urlRel', target, { abs: '/repo/docs/partials/_p.mdx', url: null }, stubIndex),
    null,
  );
});
