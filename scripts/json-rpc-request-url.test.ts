/**
 * The curl, TypeScript and Rust tabs take their URL from `request-urls.json`, keyed by the
 * JSON-RPC method. A method with no entry must fail the build, not ship a wrong URL.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { requestUrl } from '../lib/json-rpc-request-url.ts';

const URLS = {
  arb_getRawBlockMetadata: 'https://arb1.arbitrum.io/rpc',
  arb_write: '$NITRO_RPC_URL',
};

test('returns the URL of the method in the request body', () => {
  assert.equal(
    requestUrl(URLS, { method: 'arb_getRawBlockMetadata' }),
    URLS.arb_getRawBlockMetadata,
  );
  assert.equal(requestUrl(URLS, { method: 'arb_write' }), '$NITRO_RPC_URL');
});

test('throws for a method with no entry', () => {
  assert.throws(() => requestUrl(URLS, { method: 'arb_unknown' }), /arb_unknown/);
});

test('throws for a body with no method', () => {
  assert.throws(() => requestUrl(URLS, {}), /no request URL/);
  assert.throws(() => requestUrl(URLS, undefined), /no request URL/);
});

test('request-urls.json matches x-arbitrum-request-url in the OpenAPI document', () => {
  const doc = JSON.parse(readFileSync('content/openapi/arbitrum-json-rpc.json', 'utf8'));
  const expected = Object.fromEntries(
    Object.values<{ post: { 'operationId': string; 'x-arbitrum-request-url': string } }>(
      doc.paths,
    ).map(({ post }) => [post.operationId, post['x-arbitrum-request-url']]),
  );
  const actual = JSON.parse(
    readFileSync('components/widgets/OpenAPIPage/request-urls.json', 'utf8'),
  );
  assert.deepEqual(actual, expected, 'stale map: run node scripts/generate-openapi-spike.ts');
});
