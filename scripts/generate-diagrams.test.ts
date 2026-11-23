import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { Part } from './diagrams/types.ts';
import { checkPartDocs } from './generate-diagrams.ts';

const part = (id: string, docs?: string): Part => ({
  id,
  label: id,
  kind: 'process',
  lane: 'child',
  ...(docs === undefined ? {} : { docs }),
});

test('accepts part docs links that name a docs page', () => {
  const parts = new Map([
    ['a', part('a', '/guide/alpha')],
    ['b', part('b')],
  ]);
  checkPartDocs(parts, new Set(['/guide/alpha']));
});

test('rejects a part docs link that names no docs page', () =>
  assert.throws(
    () => checkPartDocs(new Map([['a', part('a', '/nope')]]), new Set(['/guide/alpha'])),
    /parts\.yaml: part "a" docs "\/nope" is not a docs page/,
  ));
