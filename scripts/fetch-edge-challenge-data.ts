/**
 * fetch-edge-challenge-data — refresh public/data/edge-challenge-flow.json.
 *
 * Usage:
 *   pnpm edge-challenge:fetch
 *
 * Fetches every `EdgeAdded` / `EdgeBisected` / `EdgeConfirmedByOneStepProof` log the
 * BoLD `ChallengeManager` contract has emitted on Arbitrum Sepolia, backfills the
 * `EdgeAdded` event for any edge only ever referenced (never directly logged) by a
 * later event, resolves the staker address behind each `EdgeAdded` transaction, and
 * writes the result as static JSON. `components/mdx/EdgeChallengeFlow` renders the
 * committed snapshot; nothing in the build calls this script.
 *
 * No `--check` mode: unlike `generate-contract-addresses.ts` or
 * `generate-cli-reference.ts`, this has no pinned, deterministic input to compare
 * against. Its source is live chain state that keeps changing as new challenges open
 * and existing ones bisect further, so a second run against the same contract
 * legitimately produces a different (superset) result from the first — there is no
 * "stale" to detect, only "older". A `--check` here could only ever fail once any
 * challenge activity happens on Sepolia after the snapshot was taken, which is not a
 * signal anyone should gate a build on. Re-run by hand when the rendered flow looks
 * out of date, review the diff, and commit it deliberately.
 *
 * Ported from arbitrum-docs `scripts/fetch-edge-challenge-data.mjs`.
 */
import fs from 'node:fs';
import path from 'node:path';

import { runScript } from './lib/generated-partial.ts';

const OUTPUT_PATH = path.join('public', 'data', 'edge-challenge-flow.json');

const RPC_URL = 'https://sepolia-rollup.arbitrum.io/rpc';
const CHALLENGE_MANAGER = '0x108977eBa2d1Cf66f8B11668A2434026E518d163';

const EDGE_ADDED_TOPIC = '0xaa4b66b1ce938c06e2a3f8466bae10ef62e747630e3859889f4719fc6427b5a4';
const EDGE_BISECTED_TOPIC = '0x7340510d24b7ec9b5c100f5500d93429d80d00d46f0d18e4e85d0c4cc22b9924';
const EDGE_OSP_TOPIC = '0xe11db4b27bc8c6ea5943ecbb205ae1ca8d56c42c719717aaf8a53d43d0cee7c2';

/** A log as `eth_getLogs` returns it, reduced to the fields this script reads. */
interface RpcLog {
  topics?: string[];
  data?: string;
  blockNumber: string;
  logIndex: string;
  transactionHash?: string;
}

interface EventBase {
  blockNumber: number;
  logIndex: number;
  txHash: string;
}

interface UnknownEvent extends EventBase {
  type: 'Unknown';
}

interface EdgeAddedEvent extends EventBase {
  type: 'EdgeAdded';
  edgeId: string;
  mutualId: string;
  originId: string;
  claimId: string;
  length: string;
  level: number;
  hasRival: boolean;
  isLayerZero: boolean;
}

interface EdgeBisectedEvent extends EventBase {
  type: 'EdgeBisected';
  edgeId: string;
  lowerChildId: string;
  upperChildId: string;
  lowerChildAlreadyExists: boolean;
}

interface EdgeConfirmedByOneStepProofEvent extends EventBase {
  type: 'EdgeConfirmedByOneStepProof';
  edgeId: string;
  mutualId: string;
}

type DecodedEvent =
  UnknownEvent | EdgeAddedEvent | EdgeBisectedEvent | EdgeConfirmedByOneStepProofEvent;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isOptionalString = (value: unknown): boolean =>
  value === undefined || typeof value === 'string';

/** Narrow one entry of an `eth_getLogs` result, checking every field {@link RpcLog} declares. */
function isRpcLog(value: unknown): value is RpcLog {
  return (
    isRecord(value) &&
    typeof value.blockNumber === 'string' &&
    typeof value.logIndex === 'string' &&
    isOptionalString(value.data) &&
    isOptionalString(value.transactionHash) &&
    (value.topics === undefined ||
      (Array.isArray(value.topics) && value.topics.every((t) => typeof t === 'string')))
  );
}

/** Narrow an `eth_getLogs` result, throwing on a shape the decoder cannot read. */
function asLogs(result: unknown): RpcLog[] {
  if (!Array.isArray(result) || !result.every(isRpcLog)) {
    throw new Error('eth_getLogs returned an unexpected result shape');
  }
  return result;
}

const normalizeHex = (value: unknown): string =>
  `0x${String(value || '')
    .replace(/^0x/, '')
    .toLowerCase()}`;
const strip0x = (value: unknown): string => String(value || '').replace(/^0x/, '');

function chunks32(data: unknown): string[] {
  const hex = strip0x(data);
  const result: string[] = [];
  for (let i = 0; i < hex.length; i += 64) {
    const part = hex.slice(i, i + 64);
    if (part) result.push(part);
  }
  return result;
}

const decodeUint = (word: string | undefined): string =>
  word ? BigInt(`0x${word}`).toString() : '0';
const decodeBool = (word: string | undefined): boolean =>
  word ? BigInt(`0x${word}`) !== 0n : false;

async function rpcCall(method: string, params: unknown[]): Promise<unknown> {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const payload: unknown = await response.json();
  if (!isRecord(payload)) throw new Error('RPC error');
  if (payload.error) {
    const message = isRecord(payload.error) ? payload.error.message : undefined;
    throw new Error((typeof message === 'string' && message) || 'RPC error');
  }
  return payload.result;
}

function decodeLog(log: RpcLog): DecodedEvent {
  const topic0 = normalizeHex(log.topics?.[0]);
  const base: UnknownEvent = {
    type: 'Unknown',
    blockNumber: parseInt(log.blockNumber, 16),
    logIndex: parseInt(log.logIndex, 16),
    txHash: normalizeHex(log.transactionHash),
  };
  const topics = (log.topics || []).map(normalizeHex);
  const dataWords = chunks32(log.data);

  if (topic0 === EDGE_ADDED_TOPIC) {
    return {
      ...base,
      type: 'EdgeAdded',
      edgeId: topics[1],
      mutualId: topics[2],
      originId: topics[3],
      claimId: dataWords[0] ? `0x${dataWords[0]}` : '0x',
      length: decodeUint(dataWords[1]),
      level: Number(decodeUint(dataWords[2])),
      hasRival: decodeBool(dataWords[3]),
      isLayerZero: decodeBool(dataWords[4]),
    };
  }
  if (topic0 === EDGE_BISECTED_TOPIC) {
    return {
      ...base,
      type: 'EdgeBisected',
      edgeId: topics[1],
      lowerChildId: topics[2],
      upperChildId: topics[3],
      lowerChildAlreadyExists: decodeBool(dataWords[0]),
    };
  }
  if (topic0 === EDGE_OSP_TOPIC) {
    return {
      ...base,
      type: 'EdgeConfirmedByOneStepProof',
      edgeId: topics[1],
      mutualId: topics[2],
    };
  }
  return base;
}

async function fetchEdgeAddedLog(edgeId: string): Promise<EdgeAddedEvent | null> {
  const id = normalizeHex(edgeId);
  const result = await rpcCall('eth_getLogs', [
    {
      fromBlock: '0x0',
      toBlock: 'latest',
      address: CHALLENGE_MANAGER,
      topics: [EDGE_ADDED_TOPIC, id],
    },
  ]);
  if (!result) return null;
  const logs = asLogs(result);
  if (logs.length === 0) return null;
  logs.sort(
    (a, b) =>
      parseInt(a.blockNumber, 16) - parseInt(b.blockNumber, 16) ||
      parseInt(a.logIndex, 16) - parseInt(b.logIndex, 16),
  );
  const decoded = decodeLog(logs[0]);
  return decoded?.type === 'EdgeAdded' ? decoded : null;
}

async function fetchTxFrom(txHash: string): Promise<string | null> {
  const result = await rpcCall('eth_getTransactionByHash', [normalizeHex(txHash)]);
  if (!isRecord(result) || !result.from) return null;
  return normalizeHex(result.from);
}

/** Run `count` copies of `worker` concurrently against a shared cursor into `items`. */
async function runPool<T>(
  items: readonly T[],
  count: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  async function pull(): Promise<void> {
    while (cursor < items.length) {
      const item = items[cursor];
      cursor += 1;
      await worker(item);
    }
  }
  await Promise.all(Array.from({ length: count }, pull));
}

async function main(): Promise<void> {
  console.log(`Fetching logs from ${CHALLENGE_MANAGER} on ${RPC_URL}...`);

  const logs = asLogs(
    await rpcCall('eth_getLogs', [
      { fromBlock: '0x0', toBlock: 'latest', address: CHALLENGE_MANAGER },
    ]),
  );

  const filtered = logs.filter((log) => {
    const topic0 = normalizeHex(log.topics?.[0]);
    return (
      topic0 === EDGE_ADDED_TOPIC || topic0 === EDGE_BISECTED_TOPIC || topic0 === EDGE_OSP_TOPIC
    );
  });

  filtered.sort(
    (a, b) =>
      parseInt(a.blockNumber, 16) - parseInt(b.blockNumber, 16) ||
      parseInt(a.logIndex, 16) - parseInt(b.logIndex, 16),
  );

  const events = filtered.map(decodeLog);
  console.log(`Decoded ${events.length} events`);

  // Build edgeAddedById map
  const edgeAddedById = new Map<string, EdgeAddedEvent>();
  events.forEach((ev) => {
    if (ev.type === 'EdgeAdded' && ev.edgeId) {
      edgeAddedById.set(normalizeHex(ev.edgeId), ev);
    }
  });

  // Collect all referenced edge IDs and find missing EdgeAdded events. A bisection or
  // OSP-confirmation event references edges (children, the edge itself) that may have
  // been added before the fromBlock window this scan happened to cover, or whose
  // EdgeAdded log this pass filtered out for an unrelated reason — so those need their
  // own direct lookup rather than being left absent from the map.
  const referenced = new Set<string>();
  events.forEach((ev) => {
    if (ev.type === 'Unknown') return;
    if (ev.edgeId) referenced.add(normalizeHex(ev.edgeId));
    if (ev.type !== 'EdgeBisected') return;
    if (ev.lowerChildId) referenced.add(normalizeHex(ev.lowerChildId));
    if (ev.upperChildId) referenced.add(normalizeHex(ev.upperChildId));
  });
  const missingIds = Array.from(referenced).filter((id) => !edgeAddedById.has(id));
  console.log(`Backfilling ${missingIds.length} missing EdgeAdded events...`);

  await runPool(missingIds, 4, async (id) => {
    try {
      const ev = await fetchEdgeAddedLog(id);
      if (ev) edgeAddedById.set(normalizeHex(ev.edgeId), ev);
    } catch (err) {
      console.warn(`Failed to backfill ${id}: ${err instanceof Error ? err.message : err}`);
    }
  });

  // Fetch tx.from (staker) for all EdgeAdded events
  const txHashes = new Set<string>();
  edgeAddedById.forEach((ev) => {
    if (ev?.txHash) txHashes.add(normalizeHex(ev.txHash));
  });
  const txHashList = Array.from(txHashes);
  console.log(`Fetching staker addresses for ${txHashList.length} transactions...`);

  const txFromByHash = new Map<string, string | null>();
  await runPool(txHashList, 6, async (hash) => {
    try {
      txFromByHash.set(hash, await fetchTxFrom(hash));
    } catch {
      txFromByHash.set(hash, null);
    }
  });

  // Attach staker to edgeAddedById
  const edgeAddedByIdObj: Record<string, EdgeAddedEvent & { staker: string | null }> = {};
  edgeAddedById.forEach((ev, id) => {
    const txHash = ev?.txHash ? normalizeHex(ev.txHash) : null;
    const staker = txHash ? txFromByHash.get(txHash) || null : null;
    edgeAddedByIdObj[id] = { ...ev, staker };
  });

  const output = {
    meta: {
      challengeManager: CHALLENGE_MANAGER,
      chain: 'arbitrum-sepolia',
      fetchedAt: new Date().toISOString(),
    },
    events,
    edgeAddedById: edgeAddedByIdObj,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`wrote ${OUTPUT_PATH}`);
}

runScript(main);
