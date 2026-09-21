import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isHistorical, pinnedImage, staleTags } from './lib/pinned-image.mjs';

const PIN = 'v3.11.4-7d5ac27';

test('staleTags reports a tag that contradicts the pin, with its line', () => {
  const source = [
    '# Run a node',
    '',
    '```bash',
    'docker run offchainlabs/nitro-node:v3.11.3-beb2108',
    '```',
  ].join('\n');
  assert.deepEqual(staleTags(source, PIN), [{ line: 4, tag: 'v3.11.3-beb2108' }]);
});

test('staleTags accepts the pinned tag and its published variants', () => {
  const source = [
    `docker run offchainlabs/nitro-node:${PIN} \\`,
    `docker run offchainlabs/nitro-node:${PIN}-validator \\`,
  ].join('\n');
  assert.deepEqual(staleTags(source, PIN), []);
});

test('staleTags accepts a floating tag and an elided command', () => {
  const source = 'offchainlabs/nitro-node:latest\noffchainlabs/nitro-node:...';
  assert.deepEqual(staleTags(source, PIN), []);
});

test('staleTags reports every occurrence on a line, not just the first', () => {
  const source = 'a offchainlabs/nitro-node:v1.0.0 b offchainlabs/nitro-node:v2.0.0';
  assert.deepEqual(staleTags(source, PIN), [
    { line: 1, tag: 'v1.0.0' },
    { line: 1, tag: 'v2.0.0' },
  ]);
});

test('pages describing a past release are exempt', () => {
  const source = 'offchainlabs/nitro-node:v2.2.0-f7dc9de';
  assert.ok(isHistorical('content/docs/run-a-node/arbos-releases/arbos11.mdx'));
  assert.ok(isHistorical('content/docs/notices/arbos51-upgrade-notice.mdx'));
  assert.deepEqual(
    staleTags(source, PIN, 'content/docs/run-a-node/arbos-releases/arbos11.mdx'),
    [],
  );
  // …but an ordinary page carrying the same tag is not.
  assert.equal(staleTags(source, PIN, 'content/docs/run-a-node/run-full-node.mdx').length, 1);
});

test('a listed exception is exempt and an unlisted page is not', () => {
  const rel = 'content/docs/launch-arbitrum-chain/operate/arbos-upgrade.mdx';
  assert.ok(isHistorical(rel));
  assert.equal(isHistorical('content/docs/launch-arbitrum-chain/operate/other.mdx'), false);
});

test('pinnedImage reads the tag from content/vars.json', () => {
  const { image, tag } = pinnedImage();
  assert.ok(image.startsWith('offchainlabs/nitro-node:'));
  assert.equal(image, `offchainlabs/nitro-node:${tag}`);
});
