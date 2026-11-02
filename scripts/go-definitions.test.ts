/**
 * The "Go definition" panel copies declarations from the Nitro source. Extraction must return the
 * exact text, and fail when a declaration is missing.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  goExportedMethods,
  goMethodSignature,
  goStructType,
  lineOf,
  methodInventoryProblems,
} from '../lib/go-definitions.ts';

const SOURCE = `package gethexec

type TimeoutQueue struct {
\tBlockNumber uint64        \`json:"blockNumber"\`
\tTickets     []common.Hash \`json:"tickets"\`
}

func (api *ArbDebugAPI) TimeoutQueue(ctx context.Context, blockNum rpc.BlockNumber) (TimeoutQueue, error) {
\treturn TimeoutQueue{}, nil
}

func (s *RPCServer) Store(ctx context.Context, message hexutil.Bytes) error {
\treturn nil
}
`;

test('returns the method signature without its body', () => {
  assert.equal(
    goMethodSignature(SOURCE, 'ArbDebugAPI', 'TimeoutQueue'),
    'func (api *ArbDebugAPI) TimeoutQueue(ctx context.Context, blockNum rpc.BlockNumber) (TimeoutQueue, error)',
  );
});

test('matches the receiver, not only the method name', () => {
  assert.throws(() => goMethodSignature(SOURCE, 'WriterServer', 'Store'), /WriterServer\.Store/);
  assert.match(goMethodSignature(SOURCE, 'RPCServer', 'Store'), /^func \(s \*RPCServer\) Store\(/);
});

test('returns the whole struct declaration', () => {
  assert.equal(
    goStructType(SOURCE, 'TimeoutQueue'),
    'type TimeoutQueue struct {\n\tBlockNumber uint64        `json:"blockNumber"`\n\tTickets     []common.Hash `json:"tickets"`\n}',
  );
});

test('throws for a missing struct', () => {
  assert.throws(() => goStructType(SOURCE, 'PricingModelHistory'), /PricingModelHistory/);
});

test('finds the line of a declaration', () => {
  assert.equal(lineOf(SOURCE, 'func (api *ArbDebugAPI) TimeoutQueue('), 8);
  assert.throws(() => lineOf(SOURCE, 'func Missing('), /func Missing/);
});

test('lists the exported methods of one receiver only', () => {
  const source = `${SOURCE}
func (s *RPCServer) HealthCheck(ctx context.Context) error {
\treturn nil
}

func (s *RPCServer) internal() {}
`;
  assert.deepEqual(goExportedMethods(source, 'RPCServer'), ['Store', 'HealthCheck']);
  assert.deepEqual(goExportedMethods(source, 'WriterServer'), []);
});

test('reports a method Nitro added and an entry Nitro removed', () => {
  const found = new Set(['das_store', 'das_healthCheck', 'das_newThing']);
  const documented = new Set(['das_healthCheck', 'das_gone']);
  const undocumented = new Set(['das_store']);
  const problems = methodInventoryProblems(found, documented, undocumented);
  assert.equal(problems.length, 2);
  assert.match(problems[0] ?? '', /das_newThing/);
  assert.match(problems[1] ?? '', /das_gone/);
});

test('reports nothing when every method is documented or left out on purpose', () => {
  const found = new Set(['das_store', 'das_healthCheck']);
  assert.deepEqual(
    methodInventoryProblems(found, new Set(['das_healthCheck']), new Set(['das_store'])),
    [],
  );
});

test('every method in the OpenAPI document has a Go definition at the pinned release', () => {
  const vars = JSON.parse(readFileSync('content/vars.json', 'utf8'));
  const nitro = `nitro ${vars.nitroVersionTag}`;
  const geth = `go-ethereum ${vars.goEthereumCommit.slice(0, 7)}`;
  const doc = JSON.parse(readFileSync('content/openapi/arbitrum-json-rpc.json', 'utf8'));
  const stale = 'stale: run pnpm json-rpc:generate';
  for (const { post } of Object.values<{ post: Record<string, unknown> }>(doc.paths)) {
    const id = String(post.operationId);
    assert.equal(typeof post['x-arbitrum-go'], 'string', `${id} has no x-arbitrum-go`);
    const go = post['x-arbitrum-go'] as string;
    for (const [, version] of go.matchAll(/^\/\/ (\S+ \S+) \S+:\d+$/gm)) {
      assert.ok(version === nitro || version === geth, `${id}: ${version} is ${stale}`);
    }
    // The source link names the same declaration as the first header of the Go definition.
    const docs = post.externalDocs as { description: string; url: string };
    const header = `// ${docs.description.replaceAll('`', '')}\nfunc (`;
    assert.ok(go.startsWith(header), `${id}: externalDocs is ${stale}`);
    const rev = `/blob/(${vars.nitroVersionTag}|${vars.goEthereumCommit})/`;
    assert.match(docs.url, new RegExp(rev), `${id}: externalDocs is ${stale}`);
  }
});
