/**
 * The chains whose gas targets `scripts/gas-target-fetch.ts` reads and
 * `scripts/generate-gas-target.ts` renders, in rendering order.
 *
 * Every RPC is public and read-only. The values themselves are not here: they live in the
 * snapshot `scripts/data/gas-target.json`, which only the fetch writes.
 */
import type { Chain } from '../lib/gas-target.ts';

/** The keys the snapshot is indexed by. */
export type ChainKey = 'arbOne' | 'nova' | 'sepolia';

export const chains: ReadonlyArray<Chain<ChainKey>> = [
  { key: 'arbOne', label: 'Arbitrum One', rpcUrl: 'https://arb1.arbitrum.io/rpc' },
  { key: 'nova', label: 'Arbitrum Nova', rpcUrl: 'https://nova.arbitrum.io/rpc' },
  { key: 'sepolia', label: 'Arbitrum Sepolia', rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc' },
];
