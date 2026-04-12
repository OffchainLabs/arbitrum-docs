#!/usr/bin/env node

/**
 * Fetch edge challenge flow data from Arbitrum Sepolia and save as static JSON.
 * Usage: node scripts/fetch-edge-challenge-data.mjs
 */

const RPC_URL = 'https://sepolia-rollup.arbitrum.io/rpc';
const CHALLENGE_MANAGER = '0x108977eBa2d1Cf66f8B11668A2434026E518d163';

const EDGE_ADDED_TOPIC =
  '0xaa4b66b1ce938c06e2a3f8466bae10ef62e747630e3859889f4719fc6427b5a4';
const EDGE_BISECTED_TOPIC =
  '0x7340510d24b7ec9b5c100f5500d93429d80d00d46f0d18e4e85d0c4cc22b9924';
const EDGE_OSP_TOPIC =
  '0xe11db4b27bc8c6ea5943ecbb205ae1ca8d56c42c719717aaf8a53d43d0cee7c2';

const normalizeHex = (value) => `0x${String(value || '').replace(/^0x/, '').toLowerCase()}`;
const strip0x = (value) => String(value || '').replace(/^0x/, '');

function chunks32(data) {
  const hex = strip0x(data);
  const result = [];
  for (let i = 0; i < hex.length; i += 64) {
    const part = hex.slice(i, i + 64);
    if (part) result.push(part);
  }
  return result;
}

const decodeUint = (word) => (word ? BigInt(`0x${word}`).toString() : '0');
const decodeBool = (word) => (word ? BigInt(`0x${word}`) !== 0n : false);

async function rpcCall(method, params) {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const payload = await response.json();
  if (payload.error) throw new Error(payload.error.message || 'RPC error');
  return payload.result;
}

function decodeLog(log) {
  const topic0 = normalizeHex(log.topics?.[0]);
  const base = {
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

async function fetchEdgeAddedLog(edgeId) {
  const id = normalizeHex(edgeId);
  const logs = await rpcCall('eth_getLogs', [
    {
      fromBlock: '0x0',
      toBlock: 'latest',
      address: CHALLENGE_MANAGER,
      topics: [EDGE_ADDED_TOPIC, id],
    },
  ]);
  if (!logs || logs.length === 0) return null;
  logs.sort(
    (a, b) =>
      parseInt(a.blockNumber, 16) - parseInt(b.blockNumber, 16) ||
      parseInt(a.logIndex, 16) - parseInt(b.logIndex, 16),
  );
  const decoded = decodeLog(logs[0]);
  return decoded?.type === 'EdgeAdded' ? decoded : null;
}

async function fetchTxFrom(txHash) {
  const result = await rpcCall('eth_getTransactionByHash', [normalizeHex(txHash)]);
  if (!result || !result.from) return null;
  return normalizeHex(result.from);
}

async function main() {
  console.log(`Fetching logs from ${CHALLENGE_MANAGER} on ${RPC_URL}...`);

  const logs = await rpcCall('eth_getLogs', [
    { fromBlock: '0x0', toBlock: 'latest', address: CHALLENGE_MANAGER },
  ]);

  const filtered = logs.filter((log) => {
    const topic0 = normalizeHex(log.topics?.[0]);
    return topic0 === EDGE_ADDED_TOPIC || topic0 === EDGE_BISECTED_TOPIC || topic0 === EDGE_OSP_TOPIC;
  });

  filtered.sort(
    (a, b) =>
      parseInt(a.blockNumber, 16) - parseInt(b.blockNumber, 16) ||
      parseInt(a.logIndex, 16) - parseInt(b.logIndex, 16),
  );

  const events = filtered.map(decodeLog);
  console.log(`Decoded ${events.length} events`);

  // Build edgeAddedById map
  const edgeAddedById = new Map();
  events.forEach((ev) => {
    if (ev.type === 'EdgeAdded' && ev.edgeId) {
      edgeAddedById.set(normalizeHex(ev.edgeId), ev);
    }
  });

  // Collect all referenced edge IDs and find missing EdgeAdded events
  const referenced = new Set();
  events.forEach((ev) => {
    if (ev.edgeId) referenced.add(normalizeHex(ev.edgeId));
    if (ev.lowerChildId) referenced.add(normalizeHex(ev.lowerChildId));
    if (ev.upperChildId) referenced.add(normalizeHex(ev.upperChildId));
  });
  const missingIds = Array.from(referenced).filter((id) => !edgeAddedById.has(id));
  console.log(`Backfilling ${missingIds.length} missing EdgeAdded events...`);

  // Backfill with concurrency
  const concurrency = 4;
  let cursor = 0;
  async function backfillWorker() {
    while (cursor < missingIds.length) {
      const id = missingIds[cursor];
      cursor += 1;
      try {
        const ev = await fetchEdgeAddedLog(id);
        if (ev) edgeAddedById.set(normalizeHex(ev.edgeId), ev);
      } catch (err) {
        console.warn(`Failed to backfill ${id}: ${err.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => backfillWorker()));

  // Fetch tx.from (staker) for all EdgeAdded events
  const txHashes = new Set();
  edgeAddedById.forEach((ev) => {
    if (ev?.txHash) txHashes.add(normalizeHex(ev.txHash));
  });
  const txHashList = Array.from(txHashes);
  console.log(`Fetching staker addresses for ${txHashList.length} transactions...`);

  const txFromByHash = new Map();
  let txCursor = 0;
  async function txWorker() {
    while (txCursor < txHashList.length) {
      const hash = txHashList[txCursor];
      txCursor += 1;
      try {
        const from = await fetchTxFrom(hash);
        txFromByHash.set(hash, from);
      } catch {
        txFromByHash.set(hash, null);
      }
    }
  }
  await Promise.all(Array.from({ length: 6 }, () => txWorker()));

  // Attach staker to edgeAddedById
  const edgeAddedByIdObj = {};
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

  const fs = await import('fs');
  const path = await import('path');
  const outDir = path.join(process.cwd(), 'static', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'edge-challenge-flow.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Written to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
