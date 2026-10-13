import assert from 'node:assert/strict';
import { test } from 'node:test';

import { askAI, canAskAI, onAskAI } from '../lib/ai/bridge.ts';

test('no listener: canAskAI is false and askAI does nothing', () => {
  assert.equal(canAskAI(), false);
  askAI('x');
});

test('a listener gets the prompt once, including an empty one', () => {
  const got: string[] = [];
  const off = onAskAI((p) => got.push(p));
  assert.equal(canAskAI(), true);
  askAI('how do fees work');
  askAI('');
  assert.deepEqual(got, ['how do fees work', '']);
  off();
  assert.equal(canAskAI(), false);
});

test('subscribing twice then unsubscribing once leaves one listener (StrictMode remount)', () => {
  const got: string[] = [];
  const listener = (p: string) => got.push(p);
  const offA = onAskAI(listener);
  offA();
  const offB = onAskAI(listener);
  askAI('q');
  assert.deepEqual(got, ['q']);
  offB();
});
