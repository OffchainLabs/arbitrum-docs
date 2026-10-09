/**
 * The `.md` mirror of a JSON-RPC page is plain text, so a `$ref` in it points nowhere. The
 * renderer must inline every referenced schema, at any depth.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { inline, openapiPageMarkdown } from '../lib/openapi.ts';

const SCHEMA = './content/openapi/arbitrum-json-rpc.json';

test('arb_getRawBlockMetadata markdown documents the nested result fields', async () => {
  const md = await openapiPageMarkdown(SCHEMA, 'arb_getRawBlockMetadata');
  assert.match(md, /"blockNumber"/);
  assert.match(md, /"rawMetadata"/);
  assert.doesNotMatch(md, /\$ref|#\/components\//);
});

test('inline stops at a schema that refers to itself', () => {
  const doc = {
    components: {
      schemas: {
        Node: { type: 'object', properties: { child: { $ref: '#/components/schemas/Node' } } },
      },
    },
  };
  const out = inline(doc, { $ref: '#/components/schemas/Node' });
  assert.deepEqual(JSON.parse(JSON.stringify(out)), {
    type: 'object',
    properties: { child: { recursive: 'Node' } },
  });
});
