/**
 * Rendering and validation for the gas-target reference partial.
 *
 * Kept separate from the two runners so the markdown can be exercised against fixture snapshots
 * in `scripts/generate-gas-target.test.ts` without a network. `scripts/gas-target-fetch.ts`
 * reads the chains and writes the snapshot; `scripts/generate-gas-target.ts` reads the snapshot
 * and writes the partial. Everything here is pure.
 */
import { assertInertMdx, generatedMarker } from './generated-partial.ts';

/** One rendered chain. `K` is the key the snapshot is indexed by. */
export interface Chain<K extends string = string> {
  key: K;
  label: string;
  rpcUrl: string;
}

/**
 * What `ArbGasInfo` reports for one chain. A chain on the multi-constraint pricer carries its
 * `getGasPricingConstraints()` rows as `[gasTargetPerSecond, adjustmentWindowSeconds]`; the third
 * onchain element, the backlog, is live state and is never stored. A chain on the single-target
 * pricer returns no constraints, and carries the `speedLimitPerSecond` of
 * `getGasAccountingParams()` instead.
 */
export type ChainGasTargets =
  { constraints: Array<[target: number, window: number]> } | { speedLimit: number };

/** The shape of `scripts/data/gas-target.json`, keyed by `chain.key`. */
export type GasTargetsSnapshot<K extends string = string> = Record<K, ChainGasTargets>;

export const SNAPSHOT_PATH = 'scripts/data/gas-target.json';

export const GAS_TARGETS_MARKER = generatedMarker(
  'pnpm gas-target:generate',
  'running pnpm gas-target:fetch',
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertPositiveInteger(value: unknown, context: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new Error(`${context}: expected an integer, got ${JSON.stringify(value)}`);
  }
  if (value <= 0) throw new Error(`${context}: expected a positive integer, got ${value}`);
}

function validateChain(key: string, value: unknown): ChainGasTargets {
  if (!isRecord(value)) {
    throw new Error(
      `gas-target snapshot: ${key}: expected an object, got ${JSON.stringify(value)}`,
    );
  }
  const hasConstraints = 'constraints' in value;
  const hasSpeedLimit = 'speedLimit' in value;
  if (hasConstraints && hasSpeedLimit) {
    throw new Error(
      `gas-target snapshot: ${key}: has both constraints and speedLimit; a chain runs one pricer`,
    );
  }
  if (hasSpeedLimit) {
    assertPositiveInteger(value.speedLimit, `gas-target snapshot: ${key}: speedLimit`);
    return { speedLimit: value.speedLimit };
  }
  if (!hasConstraints) {
    throw new Error(`gas-target snapshot: ${key}: has neither constraints nor speedLimit`);
  }
  const { constraints } = value;
  if (!Array.isArray(constraints) || constraints.length === 0) {
    throw new Error(`gas-target snapshot: ${key}: constraints must be a non-empty array`);
  }
  return {
    constraints: constraints.map((row: unknown, i) => {
      const context = `gas-target snapshot: ${key}: constraints[${i}]`;
      if (!Array.isArray(row) || row.length !== 2) {
        throw new Error(`${context}: expected [target, window], got ${JSON.stringify(row)}`);
      }
      const [target, window] = row as unknown[];
      assertPositiveInteger(target, `${context}: target`);
      assertPositiveInteger(window, `${context}: window`);
      return [target, window];
    }),
  };
}

/**
 * Check a parsed snapshot against the chain list and return it typed. Throws, naming the chain
 * and the field, on a missing chain, a value that is not a positive integer, an empty constraint
 * list, or a chain that carries both pricers or neither.
 */
export function validateSnapshot<K extends string>(
  value: unknown,
  chains: ReadonlyArray<Chain<K>>,
): GasTargetsSnapshot<K> {
  if (!isRecord(value)) throw new Error('gas-target snapshot: expected an object at the top level');
  const snapshot = {} as GasTargetsSnapshot<K>;
  for (const chain of chains) {
    if (!(chain.key in value)) throw new Error(`gas-target snapshot: ${chain.key}: missing`);
    snapshot[chain.key] = validateChain(chain.key, value[chain.key]);
  }
  return snapshot;
}

const thousands = new Intl.NumberFormat('en-US');

/** `60000000` renders as `60`, `7500000` as `7.5`, to match the hand-written table it replaces. */
export function formatMgas(gasPerSecond: number): string {
  const mgas = gasPerSecond / 1_000_000;
  return Number.isInteger(mgas) ? String(mgas) : mgas.toFixed(1);
}

function renderChain(chain: Chain, targets: ChainGasTargets): string {
  if ('speedLimit' in targets) {
    return (
      `${chain.label} uses a single gas target of ${thousands.format(targets.speedLimit)} gas/s ` +
      `(${formatMgas(targets.speedLimit)} Mgas/s) and no adjustment windows.`
    );
  }
  const rows = targets.constraints.map(
    ([target, window]) => `| **${formatMgas(target)}** | ${thousands.format(window)} |`,
  );
  return ['| Gas target (Mgas/s) | Adjustment window (seconds) |', '| --- | --- |', ...rows].join(
    '\n',
  );
}

/**
 * Build the full partial body: the do-not-edit marker, then one `###` section per chain in
 * `chains` order. No `##` heading, so the including partial keeps its own anchor. The result is
 * checked with `assertInertMdx` allowing no element at all, since nothing here is JSX.
 */
export function buildContent<K extends string>(
  snapshot: GasTargetsSnapshot<K>,
  chains: ReadonlyArray<Chain<K>>,
  context = 'gas-target partial',
): string {
  const sections = chains.map((c) => `### ${c.label}\n\n${renderChain(c, snapshot[c.key])}\n`);
  const content = [`${GAS_TARGETS_MARKER}\n`, ...sections].join('\n');
  assertInertMdx(content, { context, allowedElements: [] });
  return content;
}
