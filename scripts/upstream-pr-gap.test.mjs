import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  changedLinesByFile,
  collectVarMarkers,
  isDroppedRedirect,
  normalizeRedirectSource,
  parseNavIds,
  parseRedirectEntries,
} from './lib/config-surfaces.mjs';
import { proseProbe } from './upstream-pr-gap.mjs';

test('proseProbe survives the dialect transforms it has to match across', () => {
  const legacy =
    'If you self-host the Ethereum node, you need both an execution layer client and a [Prysm client](https://www.offchainlabs.com/prysm/docs).';
  const ported =
    'If you self-host the Ethereum node, you need both an execution layer client and a [Prysm client](/docs/run-a-node/prysm).';
  assert.equal(proseProbe(legacy), proseProbe(ported));
});

test('proseProbe ignores lines carrying no prose', () => {
  assert.equal(proseProbe('```shell'), null);
  assert.equal(proseProbe('| --- | --- |'), null);
  assert.equal(proseProbe('--parent-chain.blob-client.beacon-url=<URL>'), null);
  assert.equal(proseProbe('title: Run a full node'), null, 'too short to be distinctive');
});

test('proseProbe picks the longest sentence, so the probe is the specific one', () => {
  // Both runs clear the length floor; the longer one is the less likely to collide.
  const shorter = 'This sentence is long enough to be a candidate probe';
  const longer =
    'The blob data is required for these chains to sync up correctly after being offline';
  assert.ok(shorter.length >= 45 && longer.length > shorter.length);
  assert.equal(proseProbe(`${shorter}. ${longer}.`), longer);
});

test('proseProbe strips components, so an admonition rewrite is not a false miss', () => {
  const before =
    ':::info Try it out\nThe Prysm client software is a great choice for the consensus layer.';
  const after =
    '<VanillaAdmonition type="tip">The Prysm client software is a great choice for the consensus layer.';
  assert.equal(
    proseProbe(after),
    'The Prysm client software is a great choice for the consensus layer',
  );
  assert.ok(proseProbe(before).includes('great choice for the consensus layer'));
});

test('changedLinesByFile splits additions and removals per file', () => {
  const diff = [
    'diff --git a/docs/a.mdx b/docs/a.mdx',
    '--- a/docs/a.mdx',
    '+++ b/docs/a.mdx',
    '@@ -1,2 +1,3 @@',
    ' context line',
    '-removed from a',
    '+added to a',
    'diff --git a/docs/b.mdx b/docs/b.mdx',
    '--- a/docs/b.mdx',
    '+++ b/docs/b.mdx',
    '@@ -1 +1 @@',
    '+added to b',
  ].join('\n');

  const out = changedLinesByFile(diff);
  assert.deepEqual([...out.keys()], ['docs/a.mdx', 'docs/b.mdx']);
  assert.deepEqual(out.get('docs/a.mdx'), { added: ['added to a'], removed: ['removed from a'] });
  assert.deepEqual(out.get('docs/b.mdx'), { added: ['added to b'], removed: [] });
});

test('changedLinesByFile does not mistake the +++/--- headers for changed lines', () => {
  const diff = ['--- a/docs/a.mdx', '+++ b/docs/a.mdx', '+real addition', '-real removal'].join(
    '\n',
  );
  assert.deepEqual(changedLinesByFile(diff).get('docs/a.mdx'), {
    added: ['real addition'],
    removed: ['real removal'],
  });
});

test('parseRedirectEntries pairs each source with its destination', () => {
  const changed = {
    added: ['      "source": "/new-path",', '      "destination": "/x",'],
    removed: ['      "source": "/(sdk-docs/a/?)",', '      "destination": "/sdk/a",'],
  };
  assert.deepEqual(parseRedirectEntries(changed), {
    added: [{ source: '/new-path', destination: '/x' }],
    removed: [{ source: '/(sdk-docs/a/?)', destination: '/sdk/a' }],
  });
});

test('parseRedirectEntries drops entries unchanged by a reformat', () => {
  const line = (k, v) => `      "${k}": "${v}",`;
  const changed = {
    added: [
      line('source', '/moved'),
      line('destination', '/x'),
      line('source', '/real-new'),
      line('destination', '/y'),
    ],
    removed: [
      line('source', '/moved'),
      line('destination', '/x'),
      line('source', '/real-gone'),
      line('destination', '/z'),
    ],
  };
  const out = parseRedirectEntries(changed);
  assert.deepEqual(out.added, [{ source: '/real-new', destination: '/y' }]);
  assert.deepEqual(out.removed, [{ source: '/real-gone', destination: '/z' }]);
});

test('isDroppedRedirect covers the unported /sdk section and nothing adjacent', () => {
  assert.equal(isDroppedRedirect('/sdk'), true);
  assert.equal(isDroppedRedirect('/sdk/assetbridger/erc20bridger'), true);
  assert.equal(isDroppedRedirect('/sdk-docs/assetBridger'), false, 'a source, not a destination');
  assert.equal(isDroppedRedirect('/stylus/quickstart'), false);
});

test('normalizeRedirectSource unwraps path-to-regexp groups so both sides compare', () => {
  assert.equal(normalizeRedirectSource('/(sdk-docs/assetBridger/?)'), '/sdk-docs/assetBridger');
  assert.equal(normalizeRedirectSource('/stylus/using-cli'), '/stylus/using-cli');
  assert.equal(normalizeRedirectSource('/trailing/'), '/trailing');
  assert.equal(normalizeRedirectSource('/'), '/');
});

test('parseNavIds drops ids that appear on both sides of a re-indent', () => {
  const changed = {
    added: ["              id: 'a/new-page',", "              id: 'a/moved',"],
    removed: ["            id: 'a/moved',", "            id: 'a/deleted',"],
  };
  assert.deepEqual(parseNavIds(changed), { added: ['a/new-page'], removed: ['a/deleted'] });
});

test('collectVarMarkers recovers the name from the legacy name=value marker', () => {
  const text = 'stylus-sdk = "@@stylusSdkVersion=0.10.7@@" and @@latestNitroNodeImage=v3.1@@';
  assert.deepEqual(collectVarMarkers(text), ['stylusSdkVersion', 'latestNitroNodeImage']);
});

test('collectVarMarkers deduplicates and tolerates a bare marker', () => {
  assert.deepEqual(collectVarMarkers('@@a=1@@ @@a=2@@ @@b@@'), ['a', 'b']);
  assert.deepEqual(collectVarMarkers('no markers here'), []);
});
