import assert from 'node:assert/strict';
import { test } from 'node:test';

import { codeUrl } from '../../components/widgets/NitroTxFlow/links.ts';

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
