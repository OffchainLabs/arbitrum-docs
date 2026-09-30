import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  findMissingUpstreamPaths,
  nitroPathPins,
  nitroSourcePaths,
} from './nitro-upstream-paths.ts';

const VARS = {
  nitroRepositorySlug: 'nitro',
  nitroVersionTag: 'v3.11.4',
  nitroPathToArbos: 'arbos',
  nitroPathToStorage: 'arbos/storage',
};

test('nitroPathPins returns every nitroPathTo* key in file order and nothing else', () => {
  assert.deepEqual(nitroPathPins({ ...VARS, unrelated: 'x', nitroPrecompilesCommit: 'abc' }), [
    { key: 'nitroPathToArbos', path: 'arbos' },
    { key: 'nitroPathToStorage', path: 'arbos/storage' },
  ]);
  assert.deepEqual(nitroPathPins({ nitroVersionTag: 'v1' }), []);
});

test('nitroPathPins throws naming a pin whose value is not a string', () => {
  assert.throws(() => nitroPathPins({ ...VARS, nitroPathToArbos: 3 }), /nitroPathToArbos/);
});

const PAGE = [
  '# Title',
  '[md](https://github.com/OffchainLabs/{var:nitroRepositorySlug}/blob/{var:nitroVersionTag}/arbos/block_processor.go)',
  '<a href="https://github.com/OffchainLabs/nitro/blob/v3.11.4/{var:nitroPathToArbos}/arbostypes/">dir</a>',
  '[frag](https://github.com/OffchainLabs/{var:nitroRepositorySlug}/blob/{var:nitroVersionTag}/execution/nodeinterface/node_interface.go#L128)',
  '[other repo](https://github.com/OffchainLabs/nitro-contracts/blob/v3.11.4/src/x.sol)',
  '[other tag](https://github.com/OffchainLabs/nitro/blob/v3.11.3/arbos/old.go)',
  '[unknown](https://github.com/OffchainLabs/{var:nitroRepositorySlug}/blob/{var:nitroVersionTag}/{var:nope}/x.go)',
  '[dup](https://github.com/OffchainLabs/nitro/blob/v3.11.4/arbos/block_processor.go?plain=1)',
  '<include cwd>content/partials/_x.mdx</include>',
].join('\n');

const OTHER =
  '[again](https://github.com/OffchainLabs/nitro/blob/v3.11.4/arbos/block_processor.go)\n';

test('nitroSourcePaths keeps only links into the pinned Nitro tag, deduped by path', () => {
  const files = [
    { rel: 'content/page.mdx', source: PAGE },
    { rel: 'content/other.mdx', source: OTHER },
  ];
  assert.deepEqual(nitroSourcePaths(files, VARS), [
    { path: 'arbos/block_processor.go', rel: 'content/page.mdx', line: 2 },
    { path: 'arbos/arbostypes', rel: 'content/page.mdx', line: 3 },
    { path: 'execution/nodeinterface/node_interface.go', rel: 'content/page.mdx', line: 4 },
  ]);
});

test('nitroSourcePaths throws when the repository or tag pin is not a string', () => {
  const { nitroVersionTag, ...rest } = VARS;
  assert.throws(() => nitroSourcePaths([], rest), /nitroVersionTag/);
});

test('findMissingUpstreamPaths returns the labels of absent paths, looking each path up once', async () => {
  const calls: string[] = [];
  const exists = async (p: string): Promise<boolean> => {
    calls.push(p);
    return p !== 'gone';
  };
  const missing = await findMissingUpstreamPaths(
    [
      { path: 'arbos', label: 'A' },
      { path: 'gone', label: 'B' },
      { path: 'arbos', label: 'C' },
      { path: 'gone', label: 'D' },
    ],
    exists,
  );
  assert.deepEqual(missing, ['B', 'D']);
  assert.deepEqual(calls, ['arbos', 'gone']);
});

test('findMissingUpstreamPaths runs lookups one at a time', async () => {
  const calls: string[] = [];
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => (release = resolve));
  const pending = findMissingUpstreamPaths(
    [
      { path: 'a', label: 'a' },
      { path: 'b', label: 'b' },
    ],
    async (p) => {
      calls.push(p);
      await gate;
      return true;
    },
  );
  assert.deepEqual(calls, ['a']);
  release();
  assert.deepEqual(await pending, []);
  assert.deepEqual(calls, ['a', 'b']);
});

test('findMissingUpstreamPaths propagates a lookup failure', async () => {
  await assert.rejects(
    findMissingUpstreamPaths([{ path: 'x', label: 'x' }], async () => {
      throw new Error('GitHub API contents/x failed with status 403');
    }),
    /status 403/,
  );
});
