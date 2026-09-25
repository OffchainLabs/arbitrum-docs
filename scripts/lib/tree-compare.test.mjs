import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  TreeMapCollisionError,
  assetTarget,
  buildMigrationMap,
  buildTreeIndex,
  glossaryTarget,
  normalizeSlug,
  partialTargetPath,
  resolveLegacyPath,
  resolvePartialTarget,
  resolveTreeBMatch,
} from './tree-compare.mjs';

/** A minimal destination tree: real paths from this repo, enough of them to exercise the fallbacks. */
const DEST_FILES = [
  'content/docs/run-a-node/overview.mdx',
  'content/docs/launch-arbitrum-chain/run-a-node/batch-poster.mdx',
  'content/docs/how-arbitrum-works/deep-dives/batchposter.mdx',
  'content/docs/arbitrum-bridge/quickstart.mdx',
  'content/glossary/dapp.mdx',
  'content/glossary/arbos.mdx',
  'content/partials/run-a-node/_dao-chains-example.mdx',
  'content/partials/precompile-tables/_ArbSys.mdx',
  'content/partials/stylus/_setup-foundry.mdx',
  'public/img/apps-pull-oracle.svg',
  'public/audit-reports/2024_06_10_trail_of_bits_security_audit_stylus.pdf',
];

const ctx = () => ({
  docsIndex: buildTreeIndex(
    DEST_FILES.filter((p) => p.startsWith('content/docs/')).map((p) => p.slice(13)),
  ),
  partialsIndex: buildTreeIndex(
    DEST_FILES.filter((p) => p.startsWith('content/partials/')).map((p) => p.slice(17)),
  ),
  destFiles: new Set(DEST_FILES),
});

test('normalizeSlug strips the Docusaurus NN- ordering prefix', () => {
  assert.equal(normalizeSlug('docs/arbitrum-bridge/01-quickstart.mdx'), 'quickstart');
  assert.equal(normalizeSlug('docs/run-arbitrum-node/01-overview.mdx'), 'overview');
});

test('resolveTreeBMatch pairs an NN- prefixed page through the section map', () => {
  assert.equal(
    resolveTreeBMatch(ctx().docsIndex, 'run-arbitrum-node/01-overview.mdx'),
    'run-a-node/overview.mdx',
  );
});

test('glossaryTarget names the term by the `key` field, not the filename', () => {
  // _app.mdx declares key: dapp — the filename and the reference id genuinely disagree.
  const source = '---\ntitle: dApp\nkey: dapp\ntitleforSort: dApp\n---\n\nA decentralized app.\n';
  assert.equal(
    glossaryTarget('docs/partials/glossary/_app.mdx', source),
    'content/glossary/dapp.mdx',
  );
});

test('glossaryTarget returns null without a `key`, so the term is reported rather than guessed at', () => {
  assert.equal(glossaryTarget('docs/partials/glossary/_app.mdx', '---\ntitle: dApp\n---\n'), null);
});

test('glossaryTarget ignores files outside the legacy glossary directory', () => {
  assert.equal(glossaryTarget('docs/partials/_client-flags.mdx', '---\nkey: x\n---\n'), null);
});

test('partialTargetPath drops every partials/ segment and maps the section prefix', () => {
  assert.equal(
    partialTargetPath('docs/run-arbitrum-node/partials/run-full-node/_dao-chains-example.mdx'),
    'run-a-node/run-full-node/_dao-chains-example.mdx',
  );
  assert.equal(
    partialTargetPath('docs/stylus/partials/_setup-foundry.mdx'),
    'stylus/_setup-foundry.mdx',
  );
});

test('resolvePartialTarget falls back to the bare slug when the port regrouped a partial', () => {
  // run-full-node/ was flattened away, and precompile-tables/ was hoisted out of for-devs/.
  assert.equal(
    resolvePartialTarget(
      ctx().partialsIndex,
      'docs/run-arbitrum-node/partials/run-full-node/_dao-chains-example.mdx',
    ),
    'content/partials/run-a-node/_dao-chains-example.mdx',
  );
  assert.equal(
    resolvePartialTarget(
      ctx().partialsIndex,
      'docs/for-devs/dev-tools-and-resources/partials/precompile-tables/_ArbSys.mdx',
    ),
    'content/partials/precompile-tables/_ArbSys.mdx',
  );
});

test('assetTarget swaps the prefix for both flat asset trees', () => {
  assert.equal(assetTarget('static/img/apps-pull-oracle.svg'), 'public/img/apps-pull-oracle.svg');
  assert.equal(
    assetTarget(
      'docs/hosted-pdfs/audit-reports/2024_06_10_trail_of_bits_security_audit_stylus.pdf',
    ),
    'public/audit-reports/2024_06_10_trail_of_bits_security_audit_stylus.pdf',
  );
  assert.equal(assetTarget('static/fonts/Aeonik-Regular.otf'), null);
});

test('resolveLegacyPath labels each rule family', () => {
  const c = ctx();
  assert.partialDeepStrictEqual(resolveLegacyPath('docs/arbitrum-bridge/01-quickstart.mdx', c), {
    dest: 'content/docs/arbitrum-bridge/quickstart.mdx',
    kind: 'doc',
  });
  assert.partialDeepStrictEqual(
    resolveLegacyPath('docs/partials/glossary/_arbos.mdx', {
      ...c,
      source: '---\nkey: arbos\n---\n',
    }),
    { dest: 'content/glossary/arbos.mdx', kind: 'glossary' },
  );
  assert.partialDeepStrictEqual(resolveLegacyPath('docs/stylus/partials/_setup-foundry.mdx', c), {
    dest: 'content/partials/stylus/_setup-foundry.mdx',
    kind: 'partial',
  });
  assert.partialDeepStrictEqual(resolveLegacyPath('static/img/apps-pull-oracle.svg', c), {
    dest: 'public/img/apps-pull-oracle.svg',
    kind: 'asset',
  });
});

test('resolveLegacyPath drops the glossary partial and the merged batch-poster stub', () => {
  const c = ctx();
  const gloss = resolveLegacyPath('docs/partials/_glossary-partial.mdx', c);
  assert.equal(gloss.kind, 'drop');
  assert.equal(gloss.dest, null);
  assert.match(gloss.reason, /ReferenceList/);

  const stub = resolveLegacyPath(
    'docs/launch-arbitrum-chain/chain-config/batch-poster/config-batch-poster.mdx',
    c,
  );
  assert.equal(stub.kind, 'drop');
  assert.match(stub.reason, /merged into/);
});

test('resolveLegacyPath drops Docusaurus scaffolding', () => {
  const c = ctx();
  for (const p of [
    'docs/stylus/reference/_category_.yml',
    'docs/stylus-by-example/applications/sidebar.js',
    'docs/.nojekyll',
  ]) {
    assert.partialDeepStrictEqual(resolveLegacyPath(p, c), { dest: null, kind: 'drop' });
  }
});

test('resolveLegacyPath reports an unmapped file rather than inventing a destination', () => {
  const r = resolveLegacyPath('docs/how-arbitrum-works/bold/bold-faq.mdx', ctx());
  assert.equal(r.dest, null);
  assert.equal(r.kind, 'doc');
});

test('buildMigrationMap maps a small tree and records orphans', () => {
  const result = buildMigrationMap({
    legacyFiles: ['docs/run-arbitrum-node/01-overview.mdx', 'static/img/apps-pull-oracle.svg'],
    destFiles: [
      'content/docs/run-a-node/overview.mdx',
      'public/img/apps-pull-oracle.svg',
      'public/img/orphan.svg',
    ],
    readSource: () => '',
  });
  assert.deepEqual(
    result.entries.map((e) => e.dest),
    ['content/docs/run-a-node/overview.mdx', 'public/img/apps-pull-oracle.svg'],
  );
  assert.deepEqual(result.orphans, ['public/img/orphan.svg']);
});

test('buildMigrationMap throws on a duplicate destination and names every colliding group', () => {
  // Two glossary terms declaring the same `key` both land on one reference file.
  const sources = {
    'docs/partials/glossary/_app.mdx': '---\nkey: dapp\n---\n',
    'docs/partials/glossary/_dapp.mdx': '---\nkey: dapp\n---\n',
  };
  let err;
  try {
    buildMigrationMap({
      legacyFiles: Object.keys(sources),
      destFiles: ['content/glossary/dapp.mdx'],
      readSource: (rel) => sources[rel],
    });
  } catch (caught) {
    err = caught;
  }
  assert.ok(err instanceof TreeMapCollisionError, 'expected a TreeMapCollisionError');
  assert.deepEqual(err.collisions, [
    { dest: 'content/glossary/dapp.mdx', sources: Object.keys(sources) },
  ]);
  assert.match(err.message, /docs\/partials\/glossary\/_app\.mdx/);
  assert.match(err.message, /docs\/partials\/glossary\/_dapp\.mdx/);
  // The complete map still rides along so a caller can report on it instead of just the failure.
  assert.equal(err.result.entries.length, 2);
});
