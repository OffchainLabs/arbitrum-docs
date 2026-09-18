import assert from 'node:assert/strict';
import { test } from 'node:test';

import { proseDiff, proseSet } from './prose-diff.mjs';

const SENTENCE =
  'The gas target is measured in gas per second and is used as a threshold for pricing';

test('proseSet drops frontmatter, which is metadata and differs by design', () => {
  const withFm = `---\ntitle: 'A page'\ncontent_type: 'how-to'\n---\n\n${SENTENCE}.\n`;
  assert.deepEqual([...proseSet(withFm)], [...proseSet(`${SENTENCE}.\n`)]);
});

test('a dialect-only port reports no loss', () => {
  const legacy = `See the [sequencer](/run-arbitrum-node/sequencer.mdx). ${SENTENCE}.`;
  const ported = `See the [sequencer](/docs/run-a-node/sequencer). ${SENTENCE}.`;
  assert.deepEqual(proseDiff(legacy, ported), { lost: [], added: [] });
});

test('an include whose path gained a content/ prefix is not loss', () => {
  const legacy = '<include>/partials/_reference-arbitrum-rpc-endpoints-partial.mdx</include>';
  const ported =
    '<include cwd>content/partials/_reference-arbitrum-rpc-endpoints-partial.mdx</include>';
  assert.deepEqual(proseDiff(legacy, ported).lost, []);
});

test('an ESM import rewritten as an include is not loss', () => {
  // chain-info.mdx is built almost entirely out of these two forms of the same pointer.
  const legacy =
    "import ArbitrumRpcEndpoints from '../../partials/_reference-arbitrum-rpc-endpoints-partial.mdx';";
  const ported =
    '<include cwd>content/partials/_reference-arbitrum-rpc-endpoints-partial.mdx</include>';
  assert.deepEqual(proseDiff(legacy, ported), { lost: [], added: [] });
});

test('a dropped section is reported as lost', () => {
  const legacy = `${SENTENCE}.\n\nYou set the gas target by calling the precompile ArbOwner at its address.`;
  const ported = `${SENTENCE}.`;
  const { lost, added } = proseDiff(legacy, ported);
  assert.equal(lost.length, 1);
  assert.match(lost[0], /calling the precompile ArbOwner/);
  assert.deepEqual(added, []);
});

test('local-only prose is reported separately, so a re-port does not silently destroy it', () => {
  const legacy = SENTENCE + '.';
  const ported = `${SENTENCE}.\n\nWebsocket connections to feed endpoints may occasionally be reset by providers.`;
  const { lost, added } = proseDiff(legacy, ported);
  assert.deepEqual(lost, []);
  assert.equal(added.length, 1);
  assert.match(added[0], /reset by providers/);
});

test('identical pages are in sync in both directions', () => {
  const page = `# Heading\n\n${SENTENCE}.\n`;
  assert.deepEqual(proseDiff(page, page), { lost: [], added: [] });
});
