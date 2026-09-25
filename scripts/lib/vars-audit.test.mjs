import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseSchemaKeys, parseVarUrlUsages, parseVarUsages } from './vars-audit.mjs';

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

// --- @@name@@ tokens in link destinations (resolved by lib/remark-var-urls) ---

test('parseVarUrlUsages captures a token in a link destination with a 1-indexed line', () => {
  const usages = parseVarUrlUsages('intro\n[Interface](https://x/@@nitroVersionTag@@/a.sol)\n');
  assert.deepEqual(usages, [{ line: 2, name: 'nitroVersionTag' }]);
});

test('parseVarUrlUsages captures every token in one destination, in order', () => {
  const usages = parseVarUrlUsages('[i](https://x/@@repoSlug@@/blob/@@versionTag@@/a.go)');
  assert.deepEqual(
    usages.map((u) => u.name),
    ['repoSlug', 'versionTag'],
  );
});

test('parseVarUrlUsages captures both destinations on one line', () => {
  const usages = parseVarUrlUsages('| [i](https://x/@@a@@/f.sol) | [impl](https://y/@@b@@/f.go) |');
  assert.deepEqual(
    usages.map((u) => u.name),
    ['a', 'b'],
  );
});

test('parseVarUrlUsages reads a reference definition', () => {
  assert.deepEqual(parseVarUrlUsages('[ref]: https://x/@@versionTag@@/a.go'), [
    { line: 1, name: 'versionTag' },
  ]);
});

test('parseVarUrlUsages ignores a token in prose, which the plugin does not resolve', () => {
  // Scope is link destinations only; <Var> remains the way to render a value in prose.
  assert.deepEqual(parseVarUrlUsages('The current version is @@nitroVersionTag@@.'), []);
});

test('parseVarUrlUsages tolerates the upstream @@name=value@@ marker', () => {
  assert.deepEqual(parseVarUrlUsages('[i](https://x/@@versionTag=v3.1@@/a.go)'), [
    { line: 1, name: 'versionTag' },
  ]);
});

test('parseVarUrlUsages returns nothing for a destination with no token', () => {
  assert.deepEqual(parseVarUrlUsages('[i](https://x/v3.11.4/a.go)'), []);
});
