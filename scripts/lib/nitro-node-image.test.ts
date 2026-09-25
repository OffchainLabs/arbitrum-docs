import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { optsIntoSync, rewriteImage, syncImageInContent } from './nitro-node-image.ts';

const OLD = 'offchainlabs/nitro-node:v3.11.3-beb2108';
const NEW = 'offchainlabs/nitro-node:v3.12.0-abc1234';
const MARKER = '{/* sync-with-var: latestNitroNodeImage */}\n';

test('rewriteImage replaces every occurrence and counts them', () => {
  const src = `docker run ${OLD} keygen\n\nimage: ${OLD}\n`;
  const { text, count } = rewriteImage(src, OLD, NEW);
  assert.equal(count, 2);
  assert.ok(!text.includes(OLD));
  assert.equal(text.split(NEW).length - 1, 2);
});

test('rewriteImage leaves an older pinned tag alone', () => {
  const src = 'image: offchainlabs/nitro-node:v3.9.9-6b0af88\n';
  assert.deepEqual(rewriteImage(src, OLD, NEW), { text: src, count: 0 });
});

test('rewriteImage is a no-op when the value did not move', () => {
  const src = `docker run ${OLD} keygen\n`;
  assert.deepEqual(rewriteImage(src, OLD, OLD), { text: src, count: 0 });
  assert.deepEqual(rewriteImage(src, undefined, NEW), { text: src, count: 0 });
});

test('optsIntoSync recognises the marker and tolerates whitespace', () => {
  assert.ok(optsIntoSync('{/* sync-with-var: latestNitroNodeImage */}'));
  assert.ok(optsIntoSync('{ /*   sync-with-var:   latestNitroNodeImage   */ }'));
  assert.ok(!optsIntoSync('text with no marker'));
  assert.ok(!optsIntoSync('{/* sync-with-var: nitroVersionTag */}'));
});

test('syncImageInContent rewrites only opted-in files and reports what changed', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'nitro-image-'));
  mkdirSync(path.join(root, 'content', 'docs', 'nested'), { recursive: true });

  const hit = path.join(root, 'content', 'docs', 'a.mdx');
  const nested = path.join(root, 'content', 'docs', 'nested', 'b.mdx');
  const miss = path.join(root, 'content', 'docs', 'c.mdx');
  writeFileSync(hit, `${MARKER}\n\`\`\`shell\ndocker run ${OLD} keygen\n\`\`\`\n`);
  writeFileSync(nested, `${MARKER}Runs on ${OLD}, twice: ${OLD}.\n`);
  writeFileSync(miss, `${MARKER}image: offchainlabs/nitro-node:v3.9.9-6b0af88\n`);

  const changed = syncImageInContent(root, OLD, NEW);

  assert.deepEqual(changed.map((c) => c.rel).sort(), [
    'content/docs/a.mdx',
    'content/docs/nested/b.mdx',
  ]);
  assert.equal(changed.find((c) => c.rel.endsWith('b.mdx'))?.count, 2);
  assert.ok(readFileSync(hit, 'utf8').includes(NEW));
  assert.ok(readFileSync(nested, 'utf8').includes(NEW));
  assert.ok(readFileSync(miss, 'utf8').includes('v3.9.9-6b0af88'));
});

test('syncImageInContent leaves a historical version page alone when it has no marker', () => {
  // content/docs/run-a-node/arbos-releases/arbos61.mdx is the real case: it states the minimum
  // Nitro version for ArbOS 61, which equals the current image only until the next release.
  // Rewriting it would make the page claim ArbOS 61 requires a build published after it.
  const root = mkdtempSync(path.join(tmpdir(), 'nitro-image-'));
  mkdirSync(path.join(root, 'content', 'docs'), { recursive: true });

  const historical = path.join(root, 'content', 'docs', 'arbos61.mdx');
  const fact = `The minimum Nitro version is \`${OLD}\`.\n`;
  writeFileSync(historical, fact);

  assert.deepEqual(syncImageInContent(root, OLD, NEW), []);
  assert.equal(readFileSync(historical, 'utf8'), fact);
});

test('syncImageInContent leaves the frozen _versions archive alone even when marked', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'nitro-image-'));
  mkdirSync(path.join(root, 'content', '_versions', 'v1'), { recursive: true });
  mkdirSync(path.join(root, 'content', 'partials'), { recursive: true });

  const archived = path.join(root, 'content', '_versions', 'v1', 'old.mdx');
  const partial = path.join(root, 'content', 'partials', '_live.mdx');
  const frozen = `${MARKER}docker run ${OLD} keygen\n`;
  writeFileSync(archived, frozen);
  writeFileSync(partial, frozen);

  const changed = syncImageInContent(root, OLD, NEW);

  assert.deepEqual(changed, [{ rel: 'content/partials/_live.mdx', count: 1 }]);
  assert.equal(readFileSync(archived, 'utf8'), frozen);
  assert.ok(readFileSync(partial, 'utf8').includes(NEW));
});

test('syncImageInContent with write:false reports without touching disk', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'nitro-image-'));
  mkdirSync(path.join(root, 'content'), { recursive: true });
  const file = path.join(root, 'content', 'a.mdx');
  const before = `${MARKER}docker run ${OLD} keygen\n`;
  writeFileSync(file, before);

  const changed = syncImageInContent(root, OLD, NEW, { write: false });

  assert.deepEqual(changed, [{ rel: 'content/a.mdx', count: 1 }]);
  assert.equal(readFileSync(file, 'utf8'), before);
});
