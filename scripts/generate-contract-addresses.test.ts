/**
 * Tests for the contract-address partial renderer, and for the two pieces of the runner that
 * decide what `--check` reports: the stale-file comparison and the printed line diff.
 *
 * Fixture networks stand in for `@arbitrum/sdk` so the assertions stay pinned to the markdown
 * shape rather than to whatever addresses the SDK ships today: a bumped SDK should show up as a
 * diff in the generated partial, never as a red test. For the same reason nothing here imports
 * the runner itself, which would drag the SDK and a repo-root cwd into the suite; the runner is
 * a dozen lines of wiring over the halves tested below.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import type { Options as PrettierOptions } from 'prettier';

import {
  type Chain,
  type ContractAddressData,
  type NetworkAddresses,
  buildContent,
  cell,
  table,
} from './lib/contract-addresses.ts';
import { StaleFileError, writeOrCheck } from './lib/generated-partial.ts';
import { diffSummary, lineDiff } from './lib/line-diff.ts';

/** One chain, so a rendered table has exactly one address column. */
const CHAINS: Chain[] = [{ key: 'demo', label: 'Demo Chain', childId: 42161, parentId: 1 }];

/** Minimal stand-in for an `ArbitrumNetwork`, using the fields the renderer reads. */
const NETWORKS: Record<string, NetworkAddresses> = {
  demo: {
    ethBridge: {
      rollup: '0x4dceb440657f21083db8add07665f8ddbe1dcfc0',
      sequencerInbox: '0x1c479675ad559DC151F6Ec7ed3FbF8ceE79582B6',
      inbox: '0x4Dbd4fc535Ac27206064B68FfCf827b0A60BAB3f',
      bridge: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
      outbox: '0x0B9857ae2D4A3DBe74ffE1d7DF045bb7F96E4840',
      classicOutboxes: {
        '0x667e23ABd27E623c11d4CC00ca3EC4d0bD63337a': 0,
        '0x760723CD2e632826c38Fef8CD438A4CC7E7E1A40': 30,
      },
    },
    tokenBridge: {
      parentGatewayRouter: '0x72Ce9c846789fdB6fC1f34aC4AD25Dd9ef7031ef',
      parentErc20Gateway: '0xa3A7B6F88361F48403514059F1F16C8E78d60EeC',
      parentCustomGateway: '0xcEe284F754E854890e311e3280b767F80797180d',
      parentWethGateway: '0xd92023E9d9911199a6711321D1277285e6d4e2db',
      parentWeth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      parentProxyAdmin: '0x9aD46fac0Cf7f790E5be05A0F15223935A0c0aDa',
      childGatewayRouter: '0x5288c571Fd7aD117beA99bF60FE0846C4E84F933',
      childErc20Gateway: '0x09e9222E96E7B4AE2a407B98d48e330053351EEe',
      childCustomGateway: '0x096760F208390250649E3e8763348E783AEF5562',
      childWethGateway: '0x6c411aD3E74De3E7Bd422b94A27770f5B86C623B',
      childWeth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      childProxyAdmin: '0xd570aCE65C43af47101fC6250FD6fC63D1c22a86',
      childMultiCall: '0x842eC2c7D803033Edf55E478F461FC547Bc54EB2',
    },
  },
};

const DATA: ContractAddressData = {
  coreProxyAdmin: { demo: '0x554723262467F125Ac9e1cDFa9Ce15cc53822dbD' },
  fraudProof: { ChallengeManager: { demo: '0xA5565d266c3c3Ee90B16Be8A5b13d587ef559fB0' } },
  // Deliberately empty: the renderer must emit a blank cell rather than fail.
  resourceConstraintManager: {},
  factories: { RollupCreator: { demo: '0xB90e53fd945Cd28Ec4728cBfB566981dD571eB8b' } },
  precompiles: [['ArbSys', '0x0000000000000000000000000000000000000064']],
};

describe('cell', () => {
  it('normalises a lowercase address to its EIP-55 checksum', () => {
    assert.equal(
      cell('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 1),
      '<AEL address="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" chainID={1} shortenAddress={true} />',
    );
  });

  it('normalises an uppercase address to its EIP-55 checksum', () => {
    assert.equal(
      cell('0xC02AAA39B223FE8D0A0E5C4F27EAD9083C756CC2', 1),
      '<AEL address="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" chainID={1} shortenAddress={true} />',
    );
  });

  it('leaves an already-checksummed address unchanged', () => {
    const address = '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a';
    assert.match(cell(address, 42161), new RegExp(`address="${address}"`));
  });

  it('renders an empty cell for a missing address', () => {
    assert.equal(cell(undefined, 1), '');
  });

  it('throws on an address that is not 20 bytes of hex', () => {
    assert.throws(() => cell('0xnope', 1));
  });
});

describe('table', () => {
  it('emits a header, a divider, and one row per entry', () => {
    assert.equal(
      table(
        'Function',
        [
          ['Rollup', 'a'],
          ['Bridge', 'b'],
        ],
        CHAINS,
      ),
      ['| Function | Demo Chain |', '| --- | --- |', '| Rollup | a |', '| Bridge | b |'].join('\n'),
    );
  });
});

describe('buildContent', () => {
  const content = buildContent({ chains: CHAINS, networks: NETWORKS, data: DATA });

  it('keeps the partial frontmatter and the do-not-edit marker', () => {
    assert.match(content, /^---\npartial_type: reference\n/);
    assert.match(
      content,
      /\{\/\* AUTOGENERATED\. Do not edit by hand\. Run `pnpm contracts:generate`/,
    );
  });

  it('renders the core contracts block against the parent chain id', () => {
    assert.match(
      content,
      /\| Rollup \| <AEL address="0x4DCeB440657f21083db8aDd07665f8ddBe1DCfc0" chainID=\{1\} shortenAddress=\{true\} \/> \|/,
    );
    assert.match(
      content,
      /\| CoreProxyAdmin \| <AEL address="0x554723262467F125Ac9e1cDFa9Ce15cc53822dbD" chainID=\{1\} shortenAddress=\{true\} \/> \|/,
    );
  });

  it('renders token bridge child rows against the child chain id', () => {
    assert.match(
      content,
      /\| L2 Weth \| <AEL address="0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" chainID=\{42161\} shortenAddress=\{true\} \/> \|/,
    );
  });

  it('stacks classic outboxes newest version first', () => {
    assert.match(
      content,
      /\| Classic Outbox\\\*\\\*\\\* \| <AEL address="0x760723CD2e632826c38Fef8CD438A4CC7E7E1A40"[^|]*<br \/> <AEL address="0x667e23ABd27E623c11d4CC00ca3EC4d0bD63337a"/,
    );
  });

  it('renders precompiles against the child chain id', () => {
    assert.match(
      content,
      /\| ArbSys \| <AEL address="0x0000000000000000000000000000000000000064" chainID=\{42161\} shortenAddress=\{true\} \/> \|/,
    );
  });

  it('leaves a blank cell where an address is not deployed', () => {
    assert.match(content, /\| `ResourceConstraintManager` \|\s*\|/);
  });

  it('links canonical factory contracts at this site’s /docs-prefixed URL', () => {
    assert.match(content, /\(\/docs\/launch-arbitrum-chain\/deploy\/canonical-factory-contracts\)/);
  });
});

describe('lineDiff', () => {
  it('reports nothing for identical text', () => {
    assert.deepEqual(lineDiff('a\nb\nc', 'a\nb\nc'), { changed: 0, lines: [] });
  });

  it('reports only the inserted line, not every line after it', () => {
    // The regression this function exists for: a positional comparison reported the insertion
    // plus every following line as changed, which on the real 112-line partial meant 53 lines
    // for a two-line edit.
    const before = ['a', 'b', 'c', 'd', 'e'].join('\n');
    const after_ = ['a', 'b', 'NEW', 'c', 'd', 'e'].join('\n');
    assert.deepEqual(lineDiff(before, after_), { changed: 1, lines: ['  + NEW'] });
  });

  it('reports only the deleted line', () => {
    const before = ['a', 'b', 'c', 'd'].join('\n');
    const after_ = ['a', 'c', 'd'].join('\n');
    assert.deepEqual(lineDiff(before, after_), { changed: 1, lines: ['  - b'] });
  });

  it('reports a substitution as a removal paired with an addition', () => {
    const before = ['a', '0xold', 'c'].join('\n');
    const after_ = ['a', '0xnew', 'c'].join('\n');
    assert.deepEqual(lineDiff(before, after_), {
      changed: 2,
      lines: ['  - 0xold', '  + 0xnew'],
    });
  });

  it('handles an empty side, which is what a missing file looks like', () => {
    assert.deepEqual(lineDiff('', 'a\nb'), { changed: 3, lines: ['  - ', '  + a', '  + b'] });
  });

  it('separates an address change from the formatting churn around it', () => {
    // The stated purpose of the printed summary: a reviewer of the weekly refresh PR has to be
    // able to see which line is the address and which is the table widening around it.
    const before = ['| Rollup | 0xaaa |', '| Inbox  | 0xbbb |'].join('\n');
    const after_ = ['| Rollup   | 0xaaa |', '| Inbox    | 0xccc |'].join('\n');
    const { changed } = lineDiff(before, after_);
    assert.equal(changed, 4);
  });
});

describe('diffSummary', () => {
  it('heads the block with the changed-line count and the marker legend', () => {
    const summary = diffSummary('a\nb', 'a\nB');
    assert.equal(
      summary,
      ['2 line(s) differ (- committed, + generated):', '  - b', '  + B'].join('\n'),
    );
  });
});

describe('writeOrCheck', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'contract-addresses-'));
  const file = path.join(dir, 'partial.mdx');
  const overrides: PrettierOptions = {
    parser: 'mdx',
    printWidth: 9999,
    proseWrap: 'preserve',
    plugins: [],
  };

  after(() => fs.rmSync(dir, { recursive: true, force: true }));

  it('writes the formatted content when not in check mode', async () => {
    const wrote = await writeOrCheck(file, 'Generated body.\n', { check: false, overrides });
    assert.equal(wrote, true);
    assert.equal(fs.readFileSync(file, 'utf-8'), 'Generated body.\n');
  });

  it('passes check mode when the file is current', async () => {
    assert.equal(await writeOrCheck(file, 'Generated body.\n', { check: true, overrides }), false);
  });

  it('throws StaleFileError in check mode when the file was hand-edited', async () => {
    fs.writeFileSync(file, 'Hand-edited body.\n');
    await assert.rejects(
      () => writeOrCheck(file, 'Generated body.\n', { check: true, overrides }),
      StaleFileError,
    );
  });

  it('carries the formatted text on the error, so the caller need not format again', async () => {
    fs.writeFileSync(file, 'Hand-edited body.\n');
    const error = await writeOrCheck(file, 'Generated body.\n', { check: true, overrides }).catch(
      (e: unknown) => e,
    );
    assert.ok(error instanceof StaleFileError);
    assert.ok(error.formatted !== undefined);
    assert.equal(error.formatted, 'Generated body.\n');
    assert.equal(
      diffSummary(fs.readFileSync(file, 'utf-8'), error.formatted),
      [
        '2 line(s) differ (- committed, + generated):',
        '  - Hand-edited body.',
        '  + Generated body.',
      ].join('\n'),
    );
  });
});
