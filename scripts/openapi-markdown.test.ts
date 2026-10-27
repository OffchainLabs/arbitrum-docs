/**
 * The `.md` mirror of a JSON-RPC page is plain text, so a `$ref` in it points nowhere. It lists
 * the result fields and the Go definition, without the JSON-RPC envelope.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { openapiPageMarkdown } from '../lib/openapi.ts';

const SCHEMA = './content/openapi/arbitrum-json-rpc.json';

test('arb_getRawBlockMetadata markdown documents the nested result fields', async () => {
  const md = await openapiPageMarkdown(SCHEMA, 'arb_getRawBlockMetadata');
  const { nitroVersionTag } = JSON.parse(readFileSync('content/vars.json', 'utf8'));
  assert.match(md, /\| `\[\]\.blockNumber` \| number \| yes \|/);
  assert.match(md, /\| `result` \| NumberAndBlockMetadata\[\] \\\| null \| yes \|/);
  assert.ok(
    md.includes(
      `\`\`\`go\n// nitro ${nitroVersionTag} execution/gethexec/api.go:59\n` +
        'func (a *ArbAPI) GetRawBlockMetadata(',
    ),
  );
  assert.doesNotMatch(md, /\$ref|#\/components\//);
});

test('the curl example targets the URL of the method, not the first server', async () => {
  const arb1 = await openapiPageMarkdown(SCHEMA, 'arb_getRawBlockMetadata');
  assert.match(arb1, /curl -X POST https:\/\/arb1\.arbitrum\.io\/rpc \\/);
  const node = await openapiPageMarkdown(SCHEMA, 'eth_sendRawTransactionSync');
  assert.match(node, /curl -X POST \$NITRO_RPC_URL \\/);
  const da = await openapiPageMarkdown(SCHEMA, 'daprovider_store');
  assert.match(da, /curl -X POST \$DA_SERVER_URL \\/);
});
