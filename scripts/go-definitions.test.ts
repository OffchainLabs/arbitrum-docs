/**
 * The "Go definition" panel copies declarations from the Nitro source. Extraction must return the
 * exact text, and fail when a declaration is missing.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { goMethodSignature, goStructType, lineOf } from '../lib/go-definitions.ts';

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

test('every method in the OpenAPI document has a Go definition', () => {
  const doc = JSON.parse(readFileSync('content/openapi/arbitrum-json-rpc.json', 'utf8'));
  for (const { post } of Object.values<{ post: Record<string, unknown> }>(doc.paths)) {
    const go = post['x-arbitrum-go'];
    assert.equal(typeof go, 'string', `${String(post.operationId)} has no x-arbitrum-go`);
    assert.match(go as string, /^\/\/ (nitro v3\.12\.1|go-ethereum 5eee8f5) \S+:\d+\nfunc \(/);
  }
});
