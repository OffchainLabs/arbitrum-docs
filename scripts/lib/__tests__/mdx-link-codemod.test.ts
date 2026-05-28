import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import {
  resolveDocUrl,
  resolveDocId,
  extractLinkRefs,
  applyRewrites,
  isExternalOrFragment,
} from '../mdx-link-codemod';

const fixture = readFileSync(
  path.join(import.meta.dirname, 'fixtures', 'links-sample.mdx'),
  'utf8',
);

test('resolveDocUrl strips numeric prefixes from every segment', () => {
  assert.equal(resolveDocUrl('docs/02-how-arbitrum-works/03-foo.mdx'), '/how-arbitrum-works/foo');
});

test('resolveDocUrl resolves index and README to the folder root', () => {
  assert.equal(resolveDocUrl('docs/intro/index.mdx'), '/intro');
  assert.equal(resolveDocUrl('docs/get-started/README.md'), '/get-started');
});

test('resolveDocUrl maps the docs root index to /', () => {
  assert.equal(resolveDocUrl('docs/index.mdx'), '/');
});

test('resolveDocUrl accepts absolute filesystem paths', () => {
  assert.equal(
    resolveDocUrl('/Users/x/repo/docs/get-started/quickstart.mdx'),
    '/get-started/quickstart',
  );
});

test('resolveDocUrl: absolute slug overrides the path entirely', () => {
  assert.equal(
    resolveDocUrl('docs/02-how-arbitrum-works/03-foo.mdx', { slug: '/custom/url' }),
    '/custom/url',
  );
});

test('resolveDocUrl: relative slug resolves against the doc directory', () => {
  assert.equal(resolveDocUrl('docs/a/b/c.mdx', { slug: 'renamed' }), '/a/b/renamed');
});

test('resolveDocId strips numeric prefixes and extension, keeps index', () => {
  assert.equal(
    resolveDocId('docs/02-how-arbitrum-works/01-inside-arbitrum-nitro.mdx'),
    'how-arbitrum-works/inside-arbitrum-nitro',
  );
  assert.equal(resolveDocId('docs/foo/index.mdx'), 'foo/index');
});

test('extractLinkRefs locates every URL token exactly', () => {
  const refs = extractLinkRefs(fixture);
  // Every non-skipped range must slice back to exactly the raw URL — the invariant
  // that makes splice-based rewrites surgical.
  for (const ref of refs) {
    if (ref.range) {
      assert.equal(fixture.slice(ref.range[0], ref.range[1]), ref.rawUrl, JSON.stringify(ref));
    }
  }
});

test('extractLinkRefs finds all four surfaces', () => {
  const refs = extractLinkRefs(fixture);
  const urls = refs.map((r) => r.rawUrl);

  // markdown links (including titled and anchored)
  assert.ok(urls.includes('/how-arbitrum-works/foo'));
  assert.ok(urls.includes('/get-started/quickstart')); // title is excluded from the range
  assert.ok(urls.includes('/sdk/intro#section')); // anchor kept in raw url
  // Exact-match rather than `.includes('https://example.com')`: this is array membership in a
  // test, not URL validation, but the substring form trips CodeQL's incomplete-url-sanitization rule.
  assert.ok(urls.some((u) => u === 'https://example.com'));

  // JSX attributes
  const link = refs.find(
    (r) => r.surface === 'jsx-attr' && r.rawUrl === '/build-decentralized-apps/intro',
  );
  assert.ok(link && link.elementName === 'Link' && link.attrName === 'to');
  const anchor = refs.find(
    (r) => r.surface === 'jsx-attr' && r.rawUrl === '/run-arbitrum-node/overview',
  );
  assert.ok(anchor && anchor.elementName === 'a' && anchor.attrName === 'href');

  // ESM imports (both specifiers in one consecutive-import block)
  const esm = refs.filter((r) => r.surface === 'esm-import').map((r) => r.rawUrl);
  assert.deepEqual(esm.sort(), ['../partials/_bar.mdx', '@site/docs/partials/_foo.mdx']);
});

test('extractLinkRefs flags expression-valued attributes for manual review', () => {
  const refs = extractLinkRefs(fixture);
  const computed = refs.find((r) => r.skipped === 'expression');
  assert.ok(computed, 'expected the {expression} Link to be flagged');
  assert.equal(computed?.range, null);
});

test('isExternalOrFragment classifies non-doc destinations', () => {
  assert.equal(isExternalOrFragment('https://example.com'), true);
  assert.equal(isExternalOrFragment('mailto:x@y.com'), true);
  assert.equal(isExternalOrFragment('#section'), true);
  assert.equal(isExternalOrFragment('//cdn.example.com/x'), true);
  assert.equal(isExternalOrFragment('/how-arbitrum-works/foo'), false);
  assert.equal(isExternalOrFragment('../partials/_bar.mdx'), false);
});

test('applyRewrites splices only the targeted ranges', () => {
  const refs = extractLinkRefs(fixture);
  const md = refs.find((r) => r.rawUrl === '/how-arbitrum-works/foo')!;
  const esm = refs.find((r) => r.rawUrl === '@site/docs/partials/_foo.mdx')!;

  const output = applyRewrites(fixture, [
    { range: md.range!, newText: '/how-it-works/foo' },
    { range: esm.range!, newText: '@site/docs/shared/_foo.mdx' },
  ]);

  assert.ok(output.includes('[markdown link](/how-it-works/foo)'));
  assert.ok(output.includes("import Partial from '@site/docs/shared/_foo.mdx';"));
  // Untouched links are byte-identical.
  assert.ok(output.includes('<a href="/run-arbitrum-node/overview">node</a>'));
  // Same length delta as the two replacements, nothing else moved.
  const expectedDelta =
    '/how-it-works/foo'.length -
    '/how-arbitrum-works/foo'.length +
    '@site/docs/shared/_foo.mdx'.length -
    '@site/docs/partials/_foo.mdx'.length;
  assert.equal(output.length, fixture.length + expectedDelta);
});
