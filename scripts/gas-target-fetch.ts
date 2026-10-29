/**
 * gas-target-fetch: read the gas targets of the public Arbitrum chains from the `ArbGasInfo`
 * precompile and write the snapshot scripts/data/gas-target.json.
 *
 * Usage:
 *   pnpm gas-target:fetch       # three public RPCs, no credentials
 *
 * This is the only step that talks to a chain. It never writes a partial; run
 * `pnpm gas-target:generate` afterwards. A chain on the multi-constraint pricer answers
 * `getGasPricingConstraints()` with `[target, window, backlog]` rows; the backlog is live state
 * and is dropped. A chain on the single-target pricer answers with no rows, and its
 * `speedLimitPerSecond` is read from `getGasAccountingParams()` instead. An RPC failure names the
 * chain and exits 1. A run with no content change writes nothing.
 */
import path from 'node:path';
import { createPublicClient, http, parseAbi } from 'viem';

import { type ChainKey, chains } from './data/gas-target.data.ts';
import {
  type Chain,
  type ChainGasTargets,
  type GasTargetsSnapshot,
  SNAPSHOT_PATH,
  validateSnapshot,
} from './lib/gas-target.ts';
import { runScript, writeOrCheck } from './lib/generated-partial.ts';

const ARB_GAS_INFO = '0x000000000000000000000000000000000000006C';

const abi = parseAbi([
  'function getGasPricingConstraints() view returns (uint64[3][])',
  'function getGasAccountingParams() view returns (uint256, uint256, uint256)',
]);

async function readChain(chain: Chain): Promise<ChainGasTargets> {
  const client = createPublicClient({ transport: http(chain.rpcUrl) });
  try {
    const constraints = await client.readContract({
      address: ARB_GAS_INFO,
      abi,
      functionName: 'getGasPricingConstraints',
    });
    if (constraints.length > 0) {
      return {
        constraints: constraints.map(([target, window]) => [Number(target), Number(window)]),
      };
    }
    const [speedLimit] = await client.readContract({
      address: ARB_GAS_INFO,
      abi,
      functionName: 'getGasAccountingParams',
    });
    return { speedLimit: Number(speedLimit) };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`${chain.label} (${chain.rpcUrl}): ArbGasInfo read failed: ${reason}`, {
      cause: error,
    });
  }
}

async function main(): Promise<void> {
  const read = {} as GasTargetsSnapshot<ChainKey>;
  for (const chain of chains) read[chain.key] = await readChain(chain);
  const snapshot = validateSnapshot(read, chains);

  const changed = await writeOrCheck(
    path.join(process.cwd(), SNAPSHOT_PATH),
    JSON.stringify(snapshot, null, 2) + '\n',
    { check: false },
  );
  const outcome = changed ? 'changed' : 'unchanged';
  console.log(`gas-target-fetch: ${chains.length} chain(s) read; snapshot ${outcome}.`);
}

runScript(main);
