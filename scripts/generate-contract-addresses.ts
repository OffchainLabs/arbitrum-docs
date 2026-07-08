/**
 * Generates the contract-address reference partial rendered on the "Chain info"
 * page (docs/for-devs/dev-tools-and-resources/chain-info.mdx).
 *
 * Source of truth:
 * - `@arbitrum/sdk` for protocol-core and token-bridge addresses (rollup,
 *   inbox, sequencerInbox, bridge, outbox, classic outboxes, gateways, WETH,
 *   proxy admins, multicall). These update automatically when the SDK is bumped.
 * - `scripts/contract-addresses.data.ts` for the contracts the SDK does not
 *   expose (core proxy admin, fraud-proof contracts, resource constraint
 *   manager, canonical factories) and the constant precompile addresses.
 *
 * Every address is normalized to its EIP-55 checksum so the checksum-strict
 * <AddressExplorerLink> component never throws.
 *
 * Usage:
 *   yarn generate-contract-addresses          # write the partial
 *   yarn generate-contract-addresses --check  # fail if the partial is stale (CI)
 */

import path from 'path';
import { getAddress } from '@ethersproject/address';
import { getArbitrumNetwork, type ArbitrumNetwork } from '@arbitrum/sdk';
import {
  coreProxyAdmin,
  fraudProof,
  resourceConstraintManager,
  factories,
  precompiles,
  type ChainKey,
} from './contract-addresses.data';
import { writeOrCheck, isCheckMode, runScript } from './lib/generated-partial';

const OUTPUT_PATH = path.resolve(
  __dirname,
  '../docs/partials/_reference-arbitrum-contract-addresses-partial.mdx',
);

type Chain = { key: ChainKey; label: string; childId: number; parentId: number };

const CHAINS: Chain[] = [
  { key: 'arbOne', label: 'Arbitrum One', childId: 42161, parentId: 1 },
  { key: 'nova', label: 'Arbitrum Nova', childId: 42170, parentId: 1 },
  { key: 'sepolia', label: 'Arbitrum Sepolia', childId: 421614, parentId: 11155111 },
];

const networks = Object.fromEntries(
  CHAINS.map((c) => [c.key, getArbitrumNetwork(c.childId)]),
) as Record<ChainKey, ArbitrumNetwork>;

/** Renders a single <AddressExplorerLink> cell, or an empty cell for a missing address. */
function cell(address: string | undefined, chainId: number): string {
  if (!address) return '';
  return `<AEL address="${getAddress(address)}" chainID={${chainId}} shortenAddress={true} />`;
}

/** Renders a markdown table. `rows` is [rowLabel, ...cellsPerChain]. */
function table(cornerLabel: string, rows: string[][]): string {
  const header = `| ${cornerLabel} | ${CHAINS.map((c) => c.label).join(' | ')} |`;
  const divider = `| ${Array(CHAINS.length + 1)
    .fill('---')
    .join(' | ')} |`;
  const body = rows.map((r) => `| ${r.join(' | ')} |`).join('\n');
  return [header, divider, body].join('\n');
}

/** A row whose per-chain address is read from the SDK network object. */
function sdkRow(
  label: string,
  pick: (n: ArbitrumNetwork) => string | undefined,
  chainId: (c: Chain) => number,
): string[] {
  return [label, ...CHAINS.map((c) => cell(pick(networks[c.key]), chainId(c)))];
}

/** A row whose per-chain address is read from the manual data file. */
function dataRow(
  label: string,
  values: Partial<Record<ChainKey, string>>,
  chainId: (c: Chain) => number,
): string[] {
  return [label, ...CHAINS.map((c) => cell(values[c.key], chainId(c)))];
}

const onParent = (c: Chain) => c.parentId;
const onChild = (c: Chain) => c.childId;

/** Classic outboxes are a { address: version } map; render them stacked, newest version first. */
function classicOutboxRow(): string[] {
  const cells = CHAINS.map((c) => {
    const outboxes = networks[c.key].ethBridge.classicOutboxes;
    if (!outboxes) return '';
    return Object.entries(outboxes)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .map(([address]) => cell(address, c.parentId))
      .join(' <br /> ');
  });
  return ['Classic Outbox\\*\\*\\*', ...cells];
}

function buildContent(): string {
  const coreContracts = table('', [
    sdkRow('Rollup', (n) => n.ethBridge.rollup, onParent),
    sdkRow('Sequencer Inbox', (n) => n.ethBridge.sequencerInbox, onParent),
    dataRow('CoreProxyAdmin', coreProxyAdmin, onParent),
  ]);

  const crossChainContracts = table('', [
    sdkRow('Delayed Inbox', (n) => n.ethBridge.inbox, onParent),
    sdkRow('Bridge', (n) => n.ethBridge.bridge, onParent),
    sdkRow('Outbox', (n) => n.ethBridge.outbox, onParent),
    classicOutboxRow(),
  ]);

  const fraudProofContracts = table(
    '',
    Object.entries(fraudProof).map(([name, values]) => dataRow(name, values, onParent)),
  );

  const tokenBridgeL1 = table('', [
    sdkRow('L1 Gateway Router', (n) => n.tokenBridge?.parentGatewayRouter, onParent),
    sdkRow('L1 ERC20 Gateway', (n) => n.tokenBridge?.parentErc20Gateway, onParent),
    sdkRow('L1 Arb-Custom Gateway', (n) => n.tokenBridge?.parentCustomGateway, onParent),
    sdkRow('L1 Weth Gateway', (n) => n.tokenBridge?.parentWethGateway, onParent),
    sdkRow('L1 Weth', (n) => n.tokenBridge?.parentWeth, onParent),
    sdkRow('L1 Proxy Admin', (n) => n.tokenBridge?.parentProxyAdmin, onParent),
  ]);

  const tokenBridgeL2 = table('', [
    sdkRow('L2 Gateway Router', (n) => n.tokenBridge?.childGatewayRouter, onChild),
    sdkRow('L2 ERC20 Gateway', (n) => n.tokenBridge?.childErc20Gateway, onChild),
    sdkRow('L2 Arb-Custom Gateway', (n) => n.tokenBridge?.childCustomGateway, onChild),
    sdkRow('L2 Weth Gateway', (n) => n.tokenBridge?.childWethGateway, onChild),
    sdkRow('L2 Weth', (n) => n.tokenBridge?.childWeth, onChild),
    sdkRow('L2 Proxy Admin', (n) => n.tokenBridge?.childProxyAdmin, onChild),
  ]);

  const precompilesTable = table(
    '',
    precompiles.map(([name, address]) => [name, ...CHAINS.map((c) => cell(address, c.childId))]),
  );

  const miscTable = table('Function', [
    sdkRow('L2 Multicall', (n) => n.tokenBridge?.childMultiCall, onChild),
    dataRow('`ResourceConstraintManager`', resourceConstraintManager, onChild),
  ]);

  const factoriesTable = table(
    '',
    Object.entries(factories).map(([name, values]) => dataRow(`\`${name}\``, values, onChild)),
  );

  return `---
partial_type: reference
title: 'Arbitrum Contract Addresses Reference'
description: 'Smart contract addresses for Arbitrum protocol, bridges, and precompiles'
author: anegg0
---

{/* AUTOGENERATED — do not edit by hand. Run \`yarn generate-contract-addresses\` after bumping @arbitrum/sdk or editing scripts/contract-addresses.data.ts. */}

import { AddressExplorerLink as AEL } from '@site/src/components/AddressExplorerLink';

The following information may be useful to those building on Arbitrum. We list the addresses of the smart contracts related to the protocol, the token bridge and precompiles of the different Arbitrum chains.

## Protocol smart contracts

### Core contracts

The following contracts are deployed on Ethereum (L1)

${coreContracts}

### Cross-chain messaging contracts

The following contracts are deployed on Ethereum (L1)

${crossChainContracts}

\\*\\*\\*Migrated Network Only

### Fraud proof contracts

The following contracts are deployed on Ethereum (L1)

${fraudProofContracts}

## Token bridge smart contracts

### Core contracts

The following contracts are deployed on Ethereum (L1)

${tokenBridgeL1}

The following contracts are deployed on the corresponding L2 chain

${tokenBridgeL2}

## Precompiles

The following precompiles are deployed on every L2 chain and always have the same address

${precompilesTable}

## Misc

The following contracts are deployed on the corresponding L2 chain

${miscTable}

## Canonical factory contracts

The following factory contracts are deployed on the corresponding chain and are used to deploy new Arbitrum chains (\`RollupCreator\`) and their token bridges (\`TokenBridgeCreator\`). For factory contracts on additional chains (Ethereum, Base, and testnets) and deployment instructions, see [Canonical factory contracts](/launch-arbitrum-chain/deploy/canonical-factory-contracts.mdx).

${factoriesTable}
`;
}

runScript(() => writeOrCheck(OUTPUT_PATH, buildContent(), { check: isCheckMode() }));
