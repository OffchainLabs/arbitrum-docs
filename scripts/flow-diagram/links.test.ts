import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { PROJECT } from '../../components/widgets/FlowDiagram/flows.generated.ts';
import { codeUrl as codeUrlIn } from '../../components/widgets/FlowDiagram/links.ts';
import type { CodeRef } from '../../components/widgets/FlowDiagram/model.ts';

const codeUrl = (ref: CodeRef, values: Record<string, unknown>) =>
  codeUrlIn(ref, PROJECT.repos, values);

const pins = {
  nitroRepositorySlug: 'nitro',
  nitroVersionTag: 'v3.12.2',
  nitroContractsCommit: '4341b132cfbdcc980ead03765ca5224ff6cb5d97',
};

test('a nitro ref links to the pinned release tag', () => {
  assert.equal(
    codeUrl({ repo: 'nitro', path: 'arbnode/batch_poster.go' }, pins),
    'https://github.com/OffchainLabs/nitro/blob/v3.12.2/arbnode/batch_poster.go',
  );
});

test('a nitro ref with a line adds an L anchor', () => {
  assert.equal(
    codeUrl({ repo: 'nitro', path: 'arbnode/batch_poster.go', line: 42 }, pins),
    'https://github.com/OffchainLabs/nitro/blob/v3.12.2/arbnode/batch_poster.go#L42',
  );
});

test('a nitro ref uses the repository slug var', () => {
  assert.equal(
    codeUrl({ repo: 'nitro', path: 'a.go' }, { ...pins, nitroRepositorySlug: 'nitro-x' }),
    'https://github.com/OffchainLabs/nitro-x/blob/v3.12.2/a.go',
  );
});

test('a nitro-contracts ref links to the pinned commit', () => {
  assert.equal(
    codeUrl({ repo: 'nitro-contracts', path: 'src/bridge/SequencerInbox.sol' }, pins),
    'https://github.com/OffchainLabs/nitro-contracts/blob/' +
      '4341b132cfbdcc980ead03765ca5224ff6cb5d97/src/bridge/SequencerInbox.sol',
  );
});

test('a nitro-contracts ref with a line adds an L anchor', () => {
  assert.equal(
    codeUrl({ repo: 'nitro-contracts', path: 'src/bridge/SequencerInbox.sol', line: 7 }, pins),
    'https://github.com/OffchainLabs/nitro-contracts/blob/' +
      '4341b132cfbdcc980ead03765ca5224ff6cb5d97/src/bridge/SequencerInbox.sol#L7',
  );
});

test('an undeclared repo throws', () => {
  assert.throws(() => codeUrl({ repo: 'nope', path: 'a.go' }, pins), /Unknown repo "nope"/);
});

test('every repo code link fills from content/vars.json', () => {
  const values = JSON.parse(readFileSync('content/vars.json', 'utf8')) as Record<string, unknown>;
  for (const repo of Object.keys(PROJECT.repos)) {
    assert.doesNotThrow(() => codeUrl({ repo, path: 'a' }, values), repo);
  }
});
