/**
 * Each JSON-RPC method page shows its result without the JSON-RPC envelope, as a Result list, and
 * the method's Go definition, both derived from the OpenAPI document.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { methodTypes } from '../lib/json-rpc-types.ts';

const GO = '// nitro v3.12.1 x.go:1\nfunc (a *API) GetThing(ctx context.Context) error';

function docWith(result: unknown, schemas: Record<string, unknown> = {}, go: unknown = GO) {
  return {
    paths: {
      '/x_getThing': {
        post: {
          'operationId': 'x_getThing',
          'x-arbitrum-go': go,
          'responses': {
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
    components: { schemas: { ...schemas, Res: { type: 'object', properties: { result } } } },
  };
}

const HASH = { title: 'Hash', type: 'string', pattern: '^0x[0-9a-fA-F]{64}$' };

test('returns the Go definition of the method', () => {
  assert.equal(methodTypes(docWith({ type: 'null' }), 'x_getThing').go, GO);
});

test('throws for a method with no Go definition', () => {
  assert.throws(
    () => methodTypes(docWith({ type: 'null' }, {}, null), 'x_getThing'),
    /x_getThing: no x-arbitrum-go/,
  );
});

test('lists a null result as one row', () => {
  assert.deepEqual(methodTypes(docWith({ type: 'null' }), 'x_getThing').result, [
    { name: 'result', type: 'null', required: true, description: '' },
  ]);
});

test('lists the fields of an object result, optional outside required', () => {
  const doc = docWith(
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
  assert.deepEqual(methodTypes(doc, 'x_getThing').result, [
    { name: 'tickets', type: 'Hash[]', required: true, description: '' },
    { name: 'note', type: 'string', required: false, description: 'A note.' },
  ]);
});

test('lists the item fields of a nullable array result', () => {
  const doc = docWith(
    { oneOf: [{ type: 'array', items: { $ref: '#/components/schemas/Item' } }, { type: 'null' }] },
    {
      Item: {
        type: 'object',
        required: ['n'],
        properties: { n: { type: 'integer', description: 'Number.' } },
      },
    },
  );
  assert.deepEqual(methodTypes(doc, 'x_getThing').result, [
    { name: 'result', type: 'Item[] | null', required: true, description: '' },
    { name: '[].n', type: 'number', required: true, description: 'Number.' },
  ]);
});

test('labels enums, consts and maps', () => {
  const doc = docWith({
    type: 'object',
    properties: {
      tag: { oneOf: [{ type: 'string' }, { type: 'string', enum: ['latest', 'safe'] }] },
      counts: { type: 'object', additionalProperties: { const: 1 } },
    },
  });
  const [tag, counts] = methodTypes(doc, 'x_getThing').result;
  assert.equal(tag?.type, "string | 'latest' | 'safe'");
  assert.equal(counts?.type, 'Record<string, 1>');
});

test('throws for a schema keyword it does not map', () => {
  const doc = docWith({ type: 'object', properties: { x: { allOf: [] } } });
  assert.throws(() => methodTypes(doc, 'x_getThing'), /x_getThing.*allOf/);
});

test('throws for an unknown method', () => {
  assert.throws(() => methodTypes(docWith({ type: 'null' }), 'x_missing'), /x_missing/);
});

test('every method in the OpenAPI document gets rows, and json-rpc-types.json is current', () => {
  const doc = JSON.parse(readFileSync('content/openapi/arbitrum-json-rpc.json', 'utf8'));
  const ids = Object.values<{ post: { operationId: string } }>(doc.paths).map(
    ({ post }) => post.operationId,
  );
  const expected = Object.fromEntries(ids.map((id) => [id, methodTypes(doc, id)]));
  const actual = JSON.parse(
    readFileSync('components/widgets/OpenAPIPage/json-rpc-types.json', 'utf8'),
  );
  assert.deepEqual(actual, expected, 'stale map: run node scripts/generate-openapi-spike.ts');
  assert.match(expected.arbdebug_timeoutQueue.go, /^type TimeoutQueue struct \{$/m);
});
