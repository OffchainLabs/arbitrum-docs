// Copies each JSON-RPC method's Go signature, and the structs of its params and result, from the
// Nitro source pinned by the reference into `x-arbitrum-go` in content/openapi/arbitrum-json-rpc.json.
// Reads tagged blobs with `git show`, so the checkout's branch does not matter. Run by hand:
//   node scripts/extract-go-definitions.ts --nitro ~/OCL/nitro
// then node scripts/generate-openapi-spike.ts.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { goMethodSignature, goStructType, lineOf } from '../lib/go-definitions.ts';

const SPEC = './content/openapi/arbitrum-json-rpc.json';
const NITRO_TAG = 'v3.12.1';
const GETH_COMMIT = '5eee8f546e7602b7deeef7909f291bbebc77e233';

type Repo = 'nitro' | 'geth';
type Decl = { repo: Repo; file: string };
type Method = Decl & { receiver: string; name: string; structs?: (Decl & { name: string })[] };

const API = { repo: 'nitro', file: 'execution/gethexec/api.go' } as const;
const PROVIDER = { repo: 'nitro', file: 'daprovider/server/provider_server.go' } as const;
const ANYTRUST = { repo: 'nitro', file: 'daprovider/anytrust/rpc_server.go' } as const;
const DA_CERT = {
  repo: 'nitro',
  file: 'daprovider/server_api/types.go',
  name: 'StoreResult',
} as const;
const STREAM = {
  repo: 'nitro',
  file: 'daprovider/data_streaming/receiver.go',
  name: 'StartStreamingResult',
} as const;
const TXOPTIONS = { repo: 'geth', file: 'arbitrum_types/txoptions.go' } as const;

const METHODS: Record<string, Method> = {
  arb_getRawBlockMetadata: {
    ...API,
    receiver: 'ArbAPI',
    name: 'GetRawBlockMetadata',
    structs: [{ ...API, name: 'NumberAndBlockMetadata' }],
  },
  arb_checkPublisherHealth: { ...API, receiver: 'ArbAPI', name: 'CheckPublisherHealth' },
  arbdebug_pricingModel: {
    ...API,
    receiver: 'ArbDebugAPI',
    name: 'PricingModel',
    structs: [{ ...API, name: 'PricingModelHistory' }],
  },
  arbdebug_timeoutQueueHistory: {
    ...API,
    receiver: 'ArbDebugAPI',
    name: 'TimeoutQueueHistory',
    structs: [{ ...API, name: 'TimeoutQueueHistory' }],
  },
  arbdebug_timeoutQueue: {
    ...API,
    receiver: 'ArbDebugAPI',
    name: 'TimeoutQueue',
    structs: [{ ...API, name: 'TimeoutQueue' }],
  },
  eth_sendRawTransactionSync: {
    repo: 'geth',
    file: 'internal/ethapi/api.go',
    receiver: 'TransactionAPI',
    name: 'SendRawTransactionSync',
  },
  eth_sendRawTransactionConditional: {
    repo: 'geth',
    file: 'arbitrum/conditionaltx.go',
    receiver: 'ArbTransactionAPI',
    name: 'SendRawTransactionConditional',
    structs: [
      { ...TXOPTIONS, name: 'ConditionalOptions' },
      { ...TXOPTIONS, name: 'RootHashOrSlots' },
    ],
  },
  daprovider_store: { ...PROVIDER, receiver: 'WriterServer', name: 'Store', structs: [DA_CERT] },
  daprovider_startChunkedStore: {
    ...PROVIDER,
    receiver: 'WriterServer',
    name: 'StartChunkedStore',
    structs: [STREAM],
  },
  daprovider_sendChunk: { ...PROVIDER, receiver: 'WriterServer', name: 'SendChunk' },
  daprovider_commitChunkedStore: {
    ...PROVIDER,
    receiver: 'WriterServer',
    name: 'CommitChunkedStore',
    structs: [DA_CERT],
  },
  das_startChunkedStore: {
    ...ANYTRUST,
    receiver: 'RPCServer',
    name: 'StartChunkedStore',
    structs: [STREAM],
  },
  das_sendChunk: { ...ANYTRUST, receiver: 'RPCServer', name: 'SendChunk' },
  das_commitChunkedStore: {
    ...ANYTRUST,
    receiver: 'RPCServer',
    name: 'CommitChunkedStore',
    structs: [{ ...ANYTRUST, name: 'StoreResult' }],
  },
  das_healthCheck: { ...ANYTRUST, receiver: 'RPCServer', name: 'HealthCheck' },
};

const { values } = parseArgs({ options: { nitro: { type: 'string' } } });
if (!values.nitro) throw new Error('Pass --nitro <path to a Nitro checkout with tag v3.12.1>.');
const nitro = values.nitro;
const cache = new Map<string, string>();

function source({ repo, file }: Decl): string {
  const key = `${repo}:${file}`;
  if (!cache.has(key)) {
    const [dir, rev] =
      repo === 'nitro' ? [nitro, NITRO_TAG] : [`${nitro}/go-ethereum`, GETH_COMMIT];
    cache.set(
      key,
      execFileSync('git', ['-C', dir, 'show', `${rev}:${file}`], { encoding: 'utf8' }),
    );
  }
  return cache.get(key) as string;
}

function header(decl: Decl, text: string): string {
  const version =
    decl.repo === 'nitro' ? `nitro ${NITRO_TAG}` : `go-ethereum ${GETH_COMMIT.slice(0, 7)}`;
  return `// ${version} ${decl.file}:${lineOf(source(decl), text)}\n${text}`;
}

const doc = JSON.parse(readFileSync(SPEC, 'utf8'));
for (const { post } of Object.values<{ post: Record<string, unknown> }>(doc.paths)) {
  const id = post.operationId as string;
  const method = METHODS[id];
  if (!method) throw new Error(`${SPEC}: ${id} has no entry in METHODS`);
  const blocks = [header(method, goMethodSignature(source(method), method.receiver, method.name))];
  for (const struct of method.structs ?? []) {
    blocks.push(header(struct, goStructType(source(struct), struct.name)));
  }
  post['x-arbitrum-go'] = blocks.join('\n\n');
}
writeFileSync(SPEC, `${JSON.stringify(doc, null, 2)}\n`);
