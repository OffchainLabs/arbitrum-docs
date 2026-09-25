/**
 * Rendering for the contract-address reference partial.
 *
 * Kept separate from `scripts/generate-contract-addresses.ts` so the markdown can be exercised
 * against fixture networks in `scripts/generate-contract-addresses.test.ts` without reaching
 * into `@arbitrum/sdk`. The runner supplies the real network objects; everything here is pure.
 *
 * Ported from arbitrum-docs `scripts/generate-contract-addresses.ts`.
 */
import type { ArbitrumNetwork } from '@arbitrum/sdk';
import { getAddress } from '@ethersproject/address';

import { generatedMarker } from './generated-partial.ts';

/**
 * One rendered column. `childId` is the Arbitrum chain, `parentId` the chain its protocol
 * contracts are deployed on. `K` is the key the networks and the hand-maintained data are indexed
 * by (`ChainKey` in `scripts/data/contract-addresses.data.ts`; tests use their own).
 */
export interface Chain<K extends string = string> {
  key: K;
  label: string;
  childId: number;
  parentId: number;
}

type EthBridge = ArbitrumNetwork['ethBridge'];
type TokenBridge = NonNullable<ArbitrumNetwork['tokenBridge']>;

/**
 * The part of an `@arbitrum/sdk` `ArbitrumNetwork` the renderer reads. Narrower than the SDK type
 * so a test fixture only has to supply these fields; a real `ArbitrumNetwork` satisfies it.
 */
export interface NetworkAddresses {
  ethBridge: Pick<
    EthBridge,
    'rollup' | 'sequencerInbox' | 'inbox' | 'bridge' | 'outbox' | 'classicOutboxes'
  >;
  tokenBridge?: Pick<
    TokenBridge,
    | 'parentGatewayRouter'
    | 'parentErc20Gateway'
    | 'parentCustomGateway'
    | 'parentWethGateway'
    | 'parentWeth'
    | 'parentProxyAdmin'
    | 'childGatewayRouter'
    | 'childErc20Gateway'
    | 'childCustomGateway'
    | 'childWethGateway'
    | 'childWeth'
    | 'childProxyAdmin'
    | 'childMultiCall'
  >;
}

/** One address per chain key. A missing key renders an empty cell. */
export type AddressesByChain<K extends string = string> = Partial<Record<K, string>>;

/** The hand-maintained addresses, the shape of `scripts/data/contract-addresses.data.ts`. */
export interface ContractAddressData<K extends string = string> {
  coreProxyAdmin: AddressesByChain<K>;
  /** Key order is row order. */
  fraudProof: Record<string, AddressesByChain<K>>;
  resourceConstraintManager: AddressesByChain<K>;
  /** Key order is row order. */
  factories: Record<string, AddressesByChain<K>>;
  precompiles: ReadonlyArray<readonly [name: string, address: string]>;
}

/** Which chain id a row's cells link to: the parent chain (L1) or the Arbitrum chain itself. */
type ChainIdOf = (chain: Chain) => number;

/**
 * Render one `<AEL>` cell, or an empty cell when the address is missing.
 *
 * Every address is normalised to its EIP-55 checksum: `<AddressExplorerLink>` throws on a
 * mis-checksummed address, and the SDK returns some addresses fully lowercased (`parentWeth`,
 * for one), so passing them through unchanged would break the page at render time rather than
 * here. `getAddress` also rejects anything that is not a 20-byte hex address.
 */
export function cell(address: string | undefined, chainId: number): string {
  if (!address) return '';
  return `<AEL address="${getAddress(address)}" chainID={${chainId}} shortenAddress={true} />`;
}

/**
 * Render a markdown table. `rows` is `[rowLabel, ...cellsPerChain]`, one cell per chain in
 * `chains` order. Column widths are left to Prettier, which the generator runs over the result.
 *
 * @param cornerLabel text for the top-left header cell, usually empty
 */
export function table(cornerLabel: string, rows: string[][], chains: ReadonlyArray<Chain>): string {
  const header = `| ${cornerLabel} | ${chains.map((c) => c.label).join(' | ')} |`;
  const divider = `| ${Array(chains.length + 1)
    .fill('---')
    .join(' | ')} |`;
  const body = rows.map((r) => `| ${r.join(' | ')} |`).join('\n');
  return [header, divider, body].join('\n');
}

/** Column chain id for a contract deployed on the parent chain (L1). */
const onParent: ChainIdOf = (chain) => chain.parentId;

/** Column chain id for a contract deployed on the Arbitrum chain itself. */
const onChild: ChainIdOf = (chain) => chain.childId;

/** Input to {@link buildContent}. */
export interface BuildContentInput<K extends string> {
  /** Column order. */
  chains: ReadonlyArray<Chain<K>>;
  /** `@arbitrum/sdk` network objects, keyed by `chain.key`. */
  networks: Readonly<Record<string, NetworkAddresses>>;
  /** The hand-maintained addresses from `scripts/data/contract-addresses.data.ts`. */
  data: ContractAddressData<K>;
}

/**
 * Build the full partial body.
 */
export function buildContent<K extends string>({
  chains,
  networks,
  data,
}: BuildContentInput<K>): string {
  const { coreProxyAdmin, fraudProof, resourceConstraintManager, factories, precompiles } = data;

  /** A row whose per-chain address is read from the SDK network object. */
  const sdkRow = (
    label: string,
    pick: (network: NetworkAddresses) => string | undefined,
    chainId: ChainIdOf,
  ): string[] => [label, ...chains.map((c) => cell(pick(networks[c.key]), chainId(c)))];

  /** A row whose per-chain address is read from the hand-maintained data file. */
  const dataRow = (label: string, values: AddressesByChain<K>, chainId: ChainIdOf): string[] => [
    label,
    ...chains.map((c) => cell(values[c.key], chainId(c))),
  ];

  /**
   * Classic outboxes are an `{ address: version }` map; stack them, newest version first.
   *
   * Two outboxes can share a version, and the sort leaves those in the SDK's own key order.
   * That tie-break is what makes the rendered block byte-stable across runs, and it is
   * guaranteed rather than incidental: `Array.prototype.sort` has been required to be stable
   * since ES2019.
   */
  const classicOutboxRow = (): string[] => [
    'Classic Outbox\\*\\*\\*',
    ...chains.map((c) => {
      const outboxes = networks[c.key].ethBridge.classicOutboxes;
      if (!outboxes) return '';
      return Object.entries(outboxes)
        .sort((a, b) => b[1] - a[1])
        .map(([address]) => cell(address, c.parentId))
        .join(' <br /> ');
    }),
  ];

  const coreContracts = table(
    '',
    [
      sdkRow('Rollup', (n) => n.ethBridge.rollup, onParent),
      sdkRow('Sequencer Inbox', (n) => n.ethBridge.sequencerInbox, onParent),
      dataRow('CoreProxyAdmin', coreProxyAdmin, onParent),
    ],
    chains,
  );

  const crossChainContracts = table(
    '',
    [
      sdkRow('Delayed Inbox', (n) => n.ethBridge.inbox, onParent),
      sdkRow('Bridge', (n) => n.ethBridge.bridge, onParent),
      sdkRow('Outbox', (n) => n.ethBridge.outbox, onParent),
      classicOutboxRow(),
    ],
    chains,
  );

  const fraudProofContracts = table(
    '',
    Object.entries(fraudProof).map(([name, values]) => dataRow(name, values, onParent)),
    chains,
  );

  const tokenBridgeParent = table(
    '',
    [
      sdkRow('L1 Gateway Router', (n) => n.tokenBridge?.parentGatewayRouter, onParent),
      sdkRow('L1 ERC20 Gateway', (n) => n.tokenBridge?.parentErc20Gateway, onParent),
      sdkRow('L1 Arb-Custom Gateway', (n) => n.tokenBridge?.parentCustomGateway, onParent),
      sdkRow('L1 Weth Gateway', (n) => n.tokenBridge?.parentWethGateway, onParent),
      sdkRow('L1 Weth', (n) => n.tokenBridge?.parentWeth, onParent),
      sdkRow('L1 Proxy Admin', (n) => n.tokenBridge?.parentProxyAdmin, onParent),
    ],
    chains,
  );

  const tokenBridgeChild = table(
    '',
    [
      sdkRow('L2 Gateway Router', (n) => n.tokenBridge?.childGatewayRouter, onChild),
      sdkRow('L2 ERC20 Gateway', (n) => n.tokenBridge?.childErc20Gateway, onChild),
      sdkRow('L2 Arb-Custom Gateway', (n) => n.tokenBridge?.childCustomGateway, onChild),
      sdkRow('L2 Weth Gateway', (n) => n.tokenBridge?.childWethGateway, onChild),
      sdkRow('L2 Weth', (n) => n.tokenBridge?.childWeth, onChild),
      sdkRow('L2 Proxy Admin', (n) => n.tokenBridge?.childProxyAdmin, onChild),
    ],
    chains,
  );

  const precompilesTable = table(
    '',
    precompiles.map(([name, address]) => [name, ...chains.map((c) => cell(address, c.childId))]),
    chains,
  );

  const miscTable = table(
    'Function',
    [
      sdkRow('L2 Multicall', (n) => n.tokenBridge?.childMultiCall, onChild),
      dataRow('`ResourceConstraintManager`', resourceConstraintManager, onChild),
    ],
    chains,
  );

  const factoriesTable = table(
    '',
    Object.entries(factories).map(([name, values]) => dataRow(`\`${name}\``, values, onChild)),
    chains,
  );

  return `---
partial_type: reference
title: 'Arbitrum Contract Addresses Reference'
description: 'Smart contract addresses for Arbitrum protocol, bridges, and precompiles'
author: anegg0
---

${generatedMarker(
  'pnpm contracts:generate',
  'bumping @arbitrum/sdk or editing scripts/data/contract-addresses.data.ts',
)}

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

${tokenBridgeParent}

The following contracts are deployed on the corresponding L2 chain

${tokenBridgeChild}

## Precompiles

The following precompiles are deployed on every L2 chain and always have the same address

${precompilesTable}

## Misc

The following contracts are deployed on the corresponding L2 chain

${miscTable}

## Canonical factory contracts

The following factory contracts are deployed on the corresponding chain and are used to deploy new Arbitrum chains (\`RollupCreator\`) and their token bridges (\`TokenBridgeCreator\`). For factory contracts on additional chains (Ethereum, Base, and testnets) and deployment instructions, see [Canonical factory contracts](/docs/launch-arbitrum-chain/deploy/canonical-factory-contracts).

${factoriesTable}
`;
}
