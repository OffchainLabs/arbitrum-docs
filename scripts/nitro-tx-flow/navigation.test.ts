import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  clampStep,
  parseStepHash,
  stepHash,
} from '../../components/widgets/NitroTxFlow/navigation.ts';

test('parseStepHash maps a 1-based hash to a 0-based index', () => {
  assert.equal(parseStepHash('#step-4', 7), 3);
  assert.equal(parseStepHash('#step-1', 7), 0);
});

test('parseStepHash clamps out-of-range step numbers', () => {
  assert.equal(parseStepHash('#step-0', 7), 0);
  assert.equal(parseStepHash('#step-99', 7), 6);
});

test('parseStepHash returns null for non-step hashes', () => {
  assert.equal(parseStepHash('#step-x', 7), null);
  assert.equal(parseStepHash('#how-it-works', 7), null);
  assert.equal(parseStepHash('', 7), null);
  assert.equal(parseStepHash('#step-', 7), null);
  assert.equal(parseStepHash('#step-1.5', 7), null);
  assert.equal(parseStepHash('step-2', 7), null);
});

test('stepHash returns the 1-based hash for a 0-based index', () => {
  assert.equal(stepHash(0), '#step-1');
  assert.equal(stepHash(6), '#step-7');
});

test('clampStep keeps the index inside the step range', () => {
  assert.equal(clampStep(-1, 7), 0);
  assert.equal(clampStep(3, 7), 3);
  assert.equal(clampStep(7, 7), 6);
});
