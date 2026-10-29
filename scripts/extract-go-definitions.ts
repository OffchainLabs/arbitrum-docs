// Copies each JSON-RPC method's Go signature, and the structs of its params and result, from the
// Nitro source at the release pinned in content/vars.json into `x-arbitrum-go`, and points its
// `externalDocs` at the method's line, in content/openapi/arbitrum-json-rpc.json. Run through
//   pnpm json-rpc:generate                       # clones the pinned tag
//   pnpm json-rpc:generate --nitro ~/OCL/nitro   # reads an existing clone (or NITRO_REPO_PATH)
// which then runs scripts/generate-openapi-spike.ts. Reads tagged blobs with `git show`, so the
// checkout's branch does not matter.
//
// Fails before writing when a receiver the reference documents has a method that is neither in
// METHODS nor in UNDOCUMENTED, or when an entry of either is gone from Nitro. A Nitro bump runs
// this, so a new or removed method stops the bump until someone decides about the reference.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

import {
  goExportedMethods,
  goMethodSignature,
  goStructType,
  lineOf,
  methodInventoryProblems,
} from '../lib/go-definitions.ts';

const SPEC = './content/openapi/arbitrum-json-rpc.json';
const NITRO_URL = 'https://github.com/OffchainLabs/nitro.git';
/** What scripts/generate-openapi-spike.ts writes. */
const GENERATED = [
  './content/docs/json-rpc-spike',
  './components/widgets/OpenAPIPage/request-urls.json',
  './components/widgets/OpenAPIPage/json-rpc-types.json',
];
const vars = JSON.parse(readFileSync('./content/vars.json', 'utf8'));

function pin(key: string): string {
  const value: unknown = vars[key];
  if (typeof value !== 'string') throw new Error(`content/vars.json needs a string ${key}`);
  return value;
}

const NITRO_TAG = pin('nitroVersionTag');
const GETH_COMMIT = pin('goEthereumCommit');

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

/** Exported methods on a documented receiver that the reference does not cover yet. */
const UNDOCUMENTED = new Set([
  'arb_maintenanceStatus',
  'daprovider_getMaxMessageSize',
  'das_store',
  'das_expirationPolicy',
]);

/** go-ethereum's standard `eth` receiver: its other methods are Ethereum's, not Arbitrum's. */
const NOT_INVENTORIED = new Set(['TransactionAPI']);

const { values } = parseArgs({ options: { nitro: { type: 'string' } } });
const local = values.nitro ?? process.env.NITRO_REPO_PATH;
const workDir = local ? undefined : mkdtempSync(join(tmpdir(), 'nitro-json-rpc-'));
const nitro = local ?? join(workDir as string, 'nitro');
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

function version(decl: Decl): string {
  return decl.repo === 'nitro' ? `nitro ${NITRO_TAG}` : `go-ethereum ${GETH_COMMIT.slice(0, 7)}`;
}

function header(decl: Decl, text: string): string {
  return `// ${version(decl)} ${decl.file}:${lineOf(source(decl), text)}\n${text}`;
}

/** The JSON-RPC name of every exported method on the receivers that METHODS documents. */
function inventory(): Set<string> {
  const found = new Set<string>();
  for (const [id, method] of Object.entries(METHODS)) {
    if (NOT_INVENTORIED.has(method.receiver)) continue;
    const namespace = id.slice(0, id.indexOf('_'));
    for (const name of goExportedMethods(source(method), method.receiver)) {
      found.add(`${namespace}_${name[0]?.toLowerCase()}${name.slice(1)}`);
    }
  }
  return found;
}

/** A shallow clone of the pinned tag, with the go-ethereum submodule at the commit it pins. */
function cloneNitro(): void {
  console.log(`cloning ${NITRO_URL} at ${NITRO_TAG} (shallow)`);
  const git = (...args: string[]) =>
    execFileSync('git', ['-c', 'advice.detachedHead=false', ...args], { stdio: 'inherit' });
  git('clone', '--depth', '1', '--branch', NITRO_TAG, '--quiet', NITRO_URL, nitro);
  git('-C', nitro, 'submodule', 'update', '--init', '--depth', '1', '--quiet', 'go-ethereum');
}

function sourceLink(method: Method, signature: string): { description: string; url: string } {
  const line = lineOf(source(method), signature);
  const [repo, rev] = method.repo === 'nitro' ? ['nitro', NITRO_TAG] : ['go-ethereum', GETH_COMMIT];
  return {
    description: `${version(method)} \`${method.file}:${line}\``,
    url: `https://github.com/OffchainLabs/${repo}/blob/${rev}/${method.file}#L${line}`,
  };
}

try {
  if (workDir) cloneNitro();
  const documented = new Set(
    Object.keys(METHODS).filter((id) => !NOT_INVENTORIED.has(METHODS[id]?.receiver ?? '')),
  );
  const problems = methodInventoryProblems(inventory(), documented, UNDOCUMENTED);
  if (problems.length > 0) {
    throw new Error(
      `Nitro ${NITRO_TAG} changed the JSON-RPC methods of a documented receiver ` +
        `(scripts/extract-go-definitions.ts):\n${problems.map((p) => `  - ${p}`).join('\n')}`,
    );
  }

  const doc = JSON.parse(readFileSync(SPEC, 'utf8'));
  for (const { post } of Object.values<{ post: Record<string, unknown> }>(doc.paths)) {
    const id = post.operationId as string;
    const method = METHODS[id];
    if (!method) throw new Error(`${SPEC}: ${id} has no entry in METHODS`);
    const signature = goMethodSignature(source(method), method.receiver, method.name);
    const blocks = [header(method, signature)];
    for (const struct of method.structs ?? []) {
      blocks.push(header(struct, goStructType(source(struct), struct.name)));
    }
    post.externalDocs = sourceLink(method, signature);
    post['x-arbitrum-go'] = blocks.join('\n\n');
  }
  writeFileSync(SPEC, JSON.stringify(doc, null, 2));
  execFileSync(process.execPath, ['scripts/generate-openapi-spike.ts'], { stdio: 'inherit' });
  // Neither script writes the shape `pnpm format:check` expects.
  const generated = [SPEC, ...GENERATED];
  execFileSync('pnpm', ['exec', 'prettier', '--write', '--log-level', 'warn', ...generated], {
    stdio: 'inherit',
  });
} finally {
  if (workDir) rmSync(workDir, { recursive: true, force: true });
}
