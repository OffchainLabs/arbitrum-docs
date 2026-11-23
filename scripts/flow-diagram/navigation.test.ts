import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  clampStep,
  parseStepHash,
  stepHash,
} from '../../components/widgets/FlowDiagram/navigation.ts';

const ONE = [{ id: '', stepCount: 7 }];
const TWO = [
  { id: 'direct', stepCount: 9 },
  { id: 'retryable', stepCount: 10 },
];

test('#step-4 opens step 4 of an unnamed path', () => {
  assert.deepEqual(parseStepHash('#step-4', ONE), { path: 0, index: 3 });
});
test('#retryable-step-5 opens step 5 of the second path', () => {
  assert.deepEqual(parseStepHash('#retryable-step-5', TWO), { path: 1, index: 4 });
});
test('a step number past the end clamps to the last step of that path', () => {
  assert.deepEqual(parseStepHash('#direct-step-99', TWO), { path: 0, index: 8 });
  assert.deepEqual(parseStepHash('#step-0', ONE), { path: 0, index: 0 });
});
test('#step-3 does not match a flow whose paths are named', () => {
  assert.equal(parseStepHash('#step-3', TWO), null);
});
test('an unknown path id or a heading hash gives null', () => {
  assert.equal(parseStepHash('#unknown-step-2', TWO), null);
  assert.equal(parseStepHash('#related-pages', TWO), null);
});
test('parseStepHash returns null for malformed hashes', () => {
  for (const hash of ['#step-x', '', '#step-', '#step-1.5', 'step-2']) {
    assert.equal(parseStepHash(hash, ONE), null, hash);
  }
});
test('stepHash writes the path id only when it is not empty', () => {
  assert.equal(stepHash({ path: 0, index: 0 }, ONE), '#step-1');
  assert.equal(stepHash({ path: 1, index: 4 }, TWO), '#retryable-step-5');
});

test('clampStep keeps the index inside the step range', () => {
  assert.equal(clampStep(-1, 7), 0);
  assert.equal(clampStep(3, 7), 3);
  assert.equal(clampStep(7, 7), 6);
});
