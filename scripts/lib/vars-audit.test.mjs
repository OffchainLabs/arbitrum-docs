import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseSchemaKeys, parseVarUsages } from './vars-audit.mjs';

const SCHEMA = `import { z } from 'zod';

const varsSchema = z.object({
  latestNitroVersion: z.string(),
  arbOneChainId: z.number(),
  nitroDocsRepo: z.url(),
});

export const vars = varsSchema.parse(varsJson);
`;

test('parseSchemaKeys reads a z.object literal', () => {
  assert.deepEqual(parseSchemaKeys(SCHEMA), [
    'latestNitroVersion',
    'arbOneChainId',
    'nitroDocsRepo',
  ]);
});

test('parseSchemaKeys reads a z.strictObject literal too', () => {
  assert.deepEqual(parseSchemaKeys(SCHEMA.replace('z.object(', 'z.strictObject(')), [
    'latestNitroVersion',
    'arbOneChainId',
    'nitroDocsRepo',
  ]);
});

test('parseSchemaKeys returns empty on an unrecognised shape so the caller can fail loudly', () => {
  // vars-check exits 2 on an empty result rather than reporting a false all-clear.
  assert.deepEqual(parseSchemaKeys('const x = 1;'), []);
});

test('parseVarUsages captures static names with 1-indexed lines', () => {
  const usages = parseVarUsages('intro\n<Var name="latestArbOS" />\n');
  assert.equal(usages.length, 1);
  assert.equal(usages[0].name, 'latestArbOS');
  assert.equal(usages[0].line, 2);
});

test('parseVarUsages captures several usages on one line', () => {
  const usages = parseVarUsages('<Var name="a" /> and <Var name="b" />');
  assert.deepEqual(
    usages.map((u) => u.name),
    ['a', 'b'],
  );
  assert.deepEqual(
    usages.map((u) => u.line),
    [1, 1],
  );
});

test('parseVarUsages reports a dynamic name as null rather than skipping it', () => {
  const usages = parseVarUsages('<Var name={key} />');
  assert.equal(usages.length, 1);
  assert.equal(usages[0].name, null);
});

test('parseVarUsages accepts single quotes', () => {
  assert.equal(parseVarUsages("<Var name='latestArbOS' />")[0].name, 'latestArbOS');
});

test('parseVarUsages does not match a component whose name merely starts with Var', () => {
  assert.deepEqual(parseVarUsages('<VarTable name="x" />'), []);
});
