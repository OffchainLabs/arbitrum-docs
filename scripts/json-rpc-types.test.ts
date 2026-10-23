/**
 * Each JSON-RPC method page shows its params and result without the JSON-RPC envelope: a Result
 * list and TypeScript types, both derived from the OpenAPI document.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { methodTypes } from '../lib/json-rpc-types.ts';

function docWith(params: unknown, result: unknown, schemas: Record<string, unknown> = {}) {
  return {
    paths: {
      '/x_getThing': {
        post: {
          operationId: 'x_getThing',
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Req' } } },
          },
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: { oneOf: [{ $ref: '#/components/schemas/Res' }, { title: 'Error' }] },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        ...schemas,
        Req: { type: 'object', properties: { params } },
        Res: { type: 'object', properties: { result } },
      },
    },
  };
}

const HASH = { title: 'Hash', type: 'string', pattern: '^0x[0-9a-fA-F]{64}$' };

test('types the params as a labeled tuple, optional after minItems', () => {
  const doc = docWith(
    {
      type: 'array',
      minItems: 1,
      prefixItems: [
        { $ref: '#/components/schemas/Hash', title: 'hash' },
        { type: 'integer', title: 'timeoutMs' },
      ],
    },
    { type: 'null' },
    { Hash: HASH },
  );
  const { typescript } = methodTypes(doc, 'x_getThing');
  assert.match(typescript, /^export type XGetThingParams = \[hash: Hash, timeoutMs\?: number\];$/m);
  assert.match(typescript, /^export type XGetThingResult = null;$/m);
  assert.match(typescript, /^export type Hash = string;$/m);
});

test('types an object result, optional fields outside required', () => {
  const doc = docWith(
    { type: 'array', prefixItems: [] },
    {
      type: 'object',
      required: ['tickets'],
      properties: {
        tickets: { type: 'array', items: { $ref: '#/components/schemas/Hash' } },
        note: { type: 'string', description: 'A note.' },
      },
    },
    { Hash: HASH },
  );
  const { typescript, result } = methodTypes(doc, 'x_getThing');
  assert.match(typescript, /^export type XGetThingParams = \[\];$/m);
  assert.match(
    typescript,
    /^export type XGetThingResult = \{\n {2}tickets: Hash\[\];\n {2}note\?: string;\n\};$/m,
  );
  assert.deepEqual(result, [
    { name: 'tickets', type: 'Hash[]', required: true, description: '' },
    { name: 'note', type: 'string', required: false, description: 'A note.' },
  ]);
});

test('lists the item fields of a nullable array result', () => {
  const doc = docWith(
    { type: 'array', prefixItems: [] },
    { oneOf: [{ type: 'array', items: { $ref: '#/components/schemas/Item' } }, { type: 'null' }] },
    {
      Item: {
        type: 'object',
        required: ['n'],
        properties: { n: { type: 'integer', description: 'Number.' } },
      },
    },
  );
  const { typescript, result } = methodTypes(doc, 'x_getThing');
  assert.match(typescript, /^export type XGetThingResult = Item\[\] \| null;$/m);
  assert.match(typescript, /^export type Item = \{\n {2}n: number;\n\};$/m);
  assert.deepEqual(result, [
    { name: 'result', type: 'Item[] | null', required: true, description: '' },
    { name: '[].n', type: 'number', required: true, description: 'Number.' },
  ]);
});

test('types enums, consts and maps', () => {
  const doc = docWith(
    {
      type: 'array',
      prefixItems: [
        { title: 'tag', oneOf: [{ type: 'string' }, { type: 'string', enum: ['latest', 'safe'] }] },
      ],
    },
    { type: 'object', additionalProperties: { const: 1 } },
  );
  const { typescript } = methodTypes(doc, 'x_getThing');
  assert.match(typescript, /Params = \[tag: string \| 'latest' \| 'safe'\];/);
  assert.match(typescript, /Result = Record<string, 1>;/);
});

test('throws for a schema construct it does not map', () => {
  const doc = docWith(
    { type: 'array', prefixItems: [{ title: 'x', allOf: [] }] },
    { type: 'null' },
  );
  assert.throws(() => methodTypes(doc, 'x_getThing'), /x_getThing.*allOf/);
});

test('throws for an unknown method', () => {
  assert.throws(() => methodTypes(docWith([], null), 'x_missing'), /x_missing/);
});

test('every method in the OpenAPI document gets types, and json-rpc-types.json is current', () => {
  const doc = JSON.parse(readFileSync('content/openapi/arbitrum-json-rpc.json', 'utf8'));
  const ids = Object.values<{ post: { operationId: string } }>(doc.paths).map(
    ({ post }) => post.operationId,
  );
  const expected = Object.fromEntries(ids.map((id) => [id, methodTypes(doc, id)]));
  const actual = JSON.parse(
    readFileSync('components/widgets/OpenAPIPage/json-rpc-types.json', 'utf8'),
  );
  assert.deepEqual(actual, expected, 'stale map: run node scripts/generate-openapi-spike.ts');
  assert.match(
    expected.arbdebug_timeoutQueue.typescript,
    /export type ArbdebugTimeoutQueueParams = \[blockNum: BlockNumber\];/,
  );
});
