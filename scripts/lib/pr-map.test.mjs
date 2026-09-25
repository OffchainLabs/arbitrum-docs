import assert from 'node:assert/strict';
import test from 'node:test';

import {
  GLOSSARY_JSON,
  addedGlossaryTerms,
  insertIntoPages,
  isAssetPath,
  mapPrPath,
  navInsertFor,
  stripOrderPrefixes,
  syntheticDest,
} from './pr-map.mjs';
import { buildTreeIndex } from './tree-compare.mjs';

/** A miniature destination tree, enough to exercise every branch of the classifier. */
const DEST = [
  'content/docs/how-arbitrum-works/deep-dives/sequencer.mdx',
  'content/docs/how-arbitrum-works/inside-arbitrum-nitro.mdx',
  'content/docs/arbitrum-essentials/how-to-estimate-gas.mdx',
  'content/docs/run-a-node/nitro/node-tuning-and-monitoring.mdx',
  'content/glossary/eip-1559.mdx',
  'content/partials/run-a-node/_pruning-note.mdx',
  'public/img/haw-geth-sandwich.svg',
];

function ctx() {
  const strip = (prefix) =>
    DEST.filter((p) => p.startsWith(`${prefix}/`)).map((p) => p.slice(prefix.length + 1));
  return {
    docsIndex: buildTreeIndex(strip('content/docs')),
    partialsIndex: buildTreeIndex(strip('content/partials')),
    destFiles: new Set(DEST),
  };
}

test('stripOrderPrefixes removes the Docusaurus NN- prefix from every segment', () => {
  assert.equal(stripOrderPrefixes('docs/01-a/02-b.mdx'), 'docs/a/b.mdx');
  assert.equal(stripOrderPrefixes('docs/a/b.mdx'), 'docs/a/b.mdx');
  assert.equal(stripOrderPrefixes('docs/eip-1559/x.mdx'), 'docs/eip-1559/x.mdx');
});

test('an existing page maps through resolveLegacyPath', () => {
  const m = mapPrPath({
    legacy: 'docs/how-arbitrum-works/deep-dives/sequencer.mdx',
    status: 'M',
    ctx: ctx(),
  });
  assert.equal(m.role, 'content');
  assert.equal(m.kind, 'doc');
  assert.equal(m.dest, 'content/docs/how-arbitrum-works/deep-dives/sequencer.mdx');
  assert.equal(m.synthetic, false);
});

test('a page upstream moved still maps, via the unambiguous bare-slug fallback', () => {
  const m = mapPrPath({
    legacy: 'docs/build-decentralized-apps/02-how-to-estimate-gas.mdx',
    status: 'M',
    ctx: ctx(),
  });
  assert.equal(m.dest, 'content/docs/arbitrum-essentials/how-to-estimate-gas.mdx');
  assert.equal(m.synthetic, false);
});

test('a page upstream adds gets a synthesised destination, flagged as such', () => {
  const m = mapPrPath({
    legacy: 'docs/how-arbitrum-works/priority-gas-auction/pga.md',
    status: 'A',
    ctx: ctx(),
  });
  assert.equal(m.role, 'content');
  assert.equal(m.dest, 'content/docs/how-arbitrum-works/priority-gas-auction/pga.mdx');
  assert.equal(m.synthetic, true);
});

test('a synthesised doc destination drops ordering prefixes and maps renamed sections', () => {
  assert.deepEqual(syntheticDest('docs/run-arbitrum-node/nitro/07-new-page.mdx'), {
    dest: 'content/docs/run-a-node/nitro/new-page.mdx',
    kind: 'doc',
  });
});

test('a new glossary term is named by its `key` frontmatter, not its filename', () => {
  const src = '---\nkey: fast-feed\ntitle: Fast feed\n---\n\nbody\n';
  const m = mapPrPath({
    legacy: 'docs/partials/glossary/_fast-feed.mdx',
    status: 'A',
    source: src,
    ctx: ctx(),
  });
  assert.equal(m.kind, 'glossary');
  assert.equal(m.dest, 'content/glossary/fast-feed.mdx');
  assert.equal(m.synthetic, true);
});

test('an existing glossary term resolves without synthesis', () => {
  const src = '---\nkey: eip-1559\ntitle: EIP-1559\n---\n';
  const m = mapPrPath({
    legacy: 'docs/partials/glossary/_eip-1559.mdx',
    status: 'A',
    source: src,
    ctx: ctx(),
  });
  assert.equal(m.dest, 'content/glossary/eip-1559.mdx');
  assert.equal(m.synthetic, false);
});

test('sidebars.js and static/glossary.json get their own roles', () => {
  assert.equal(mapPrPath({ legacy: 'sidebars.js', status: 'M', ctx: ctx() }).role, 'nav');
  assert.equal(mapPrPath({ legacy: GLOSSARY_JSON, status: 'M', ctx: ctx() }).role, 'glossary-json');
});

test('site plumbing is out-of-scope, never unmapped', () => {
  for (const p of [
    'package.json',
    'vercel.json',
    'redirects.config.js',
    'src/theme/x.js',
    'scripts/gen.ts',
  ]) {
    assert.equal(mapPrPath({ legacy: p, status: 'M', ctx: ctx() }).role, 'out-of-scope', p);
  }
});

test('the glossary partial superseded by <ReferenceList> is dropped, not unmapped', () => {
  const m = mapPrPath({ legacy: 'docs/partials/_glossary-partial.mdx', status: 'M', ctx: ctx() });
  assert.equal(m.role, 'drop');
});

test('assets swap prefix whether or not they already exist here', () => {
  assert.equal(
    mapPrPath({ legacy: 'static/img/haw-geth-sandwich.svg', status: 'M', ctx: ctx() }).dest,
    'public/img/haw-geth-sandwich.svg',
  );
  const added = mapPrPath({ legacy: 'static/img/haw-pga-new.svg', status: 'A', ctx: ctx() });
  assert.equal(added.role, 'asset');
  assert.equal(added.dest, 'public/img/haw-pga-new.svg');
  assert.equal(added.synthetic, true);
});

test('isAssetPath distinguishes media from MDX', () => {
  assert.equal(isAssetPath('static/img/a.svg'), true);
  assert.equal(isAssetPath('static/img/a.mp4'), true);
  assert.equal(isAssetPath('docs/a.mdx'), false);
});

test('addedGlossaryTerms reports only terms the head adds', () => {
  const base = JSON.stringify({ a: { title: 'A', text: '<p>a</p>' } });
  const head = JSON.stringify({
    a: { title: 'A', text: '<p>a</p>' },
    searcher: { title: 'Searcher', text: '<p>s</p>' },
  });
  assert.deepEqual(addedGlossaryTerms(base, head), [
    { id: 'searcher', title: 'Searcher', text: '<p>s</p>', dest: 'content/glossary/searcher.mdx' },
  ]);
});

test('addedGlossaryTerms survives unparseable JSON on either side', () => {
  assert.deepEqual(addedGlossaryTerms('{oops', '{oops'), []);
});

test('navInsertFor is a no-op when the rest operator is present', () => {
  const meta = { pages: ['a', 'b', '...'] };
  const r = navInsertFor('content/docs/x/c.mdx', () => meta);
  assert.equal(r.action, 'none');
  assert.equal(r.slug, 'c');
});

test('navInsertFor inserts into a closed allowlist', () => {
  const r = navInsertFor('content/docs/x/c.mdx', () => ({ pages: ['a', 'b'] }));
  assert.equal(r.action, 'insert');
  assert.equal(r.dir, 'content/docs/x');
});

test('navInsertFor is a no-op with no meta.json and with no pages key', () => {
  assert.equal(navInsertFor('content/docs/x/c.mdx', () => null).action, 'none');
  assert.equal(navInsertFor('content/docs/x/c.mdx', () => ({ title: 'X' })).action, 'none');
});

test('insertIntoPages puts the new slug before the external-link tail', () => {
  const meta = { pages: ['a', 'b', '---Sep---', '[Chain info](/docs/chain-info)'] };
  assert.deepEqual(insertIntoPages(meta, 'c').pages, [
    'a',
    'b',
    'c',
    '---Sep---',
    '[Chain info](/docs/chain-info)',
  ]);
});
