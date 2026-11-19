import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  type Flow,
  codeRefs,
  transactionLifecycle as flow,
  flowPaths,
} from '../../components/widgets/NitroTxFlow/model.ts';
import { checkFlowShape } from './flow-shape.ts';

test('the flow has a valid shape', () => {
  checkFlowShape(flow);
});

test('step count is between 6 and 8', () => {
  assert.ok(flow.steps.length >= 6 && flow.steps.length <= 8, `got ${flow.steps.length}`);
});

test('every step has non-empty text and all three failure parts', () => {
  for (const step of flow.steps) {
    assert.ok(step.text.trim(), `${step.id} text`);
    assert.ok(step.failure!.symptoms.trim(), `${step.id} symptoms`);
    assert.ok(step.failure!.impact.trim(), `${step.id} impact`);
    assert.ok(step.failure!.recovery.trim(), `${step.id} recovery`);
  }
});

test('every step has at least one citation', () => {
  for (const step of flow.steps) assert.ok(step.citations.length > 0, step.id);
});

test('codeRefs returns each repo+path once', () => {
  const refs = codeRefs(flow);
  const keys = refs.map((r) => `${r.repo}:${r.path}`);
  assert.equal(new Set(keys).size, keys.length);
  for (const step of flow.steps) {
    if (step.code) assert.ok(keys.includes(`${step.code.repo}:${step.code.path}`), step.id);
  }
});

test('txChain is child for steps 1 to 5 and parent for steps 6 and 7', () => {
  assert.deepEqual(
    flow.steps.map((s) => s.txChain),
    ['child', 'child', 'child', 'child', 'child', 'parent', 'parent'],
  );
});

test('flowPaths gives a flow without paths one unnamed path of all its steps', () => {
  const paths = flowPaths(flow);
  assert.equal(paths.length, 1);
  assert.equal(paths[0]!.id, '');
  assert.deepEqual(
    paths[0]!.steps.map((s) => s.id),
    flow.steps.map((s) => s.id),
  );
});

test('flowPaths throws on an unknown step id', () => {
  const bad = { ...flow, paths: [{ id: 'x', label: 'X', steps: ['nope'] }] };
  assert.throws(() => flowPaths(bad), /path "x" lists unknown step "nope"/);
});

test('codeRefs includes refs from detail flows', () => {
  const inner: Flow = {
    ...flow,
    id: 'inner',
    steps: [
      {
        ...flow.steps[0]!,
        code: undefined,
        citations: [{ repo: 'nitro', path: 'only/in/detail.go' }],
      },
    ],
  };
  const parent: Flow = {
    ...flow,
    steps: [
      { ...flow.steps[0]!, code: undefined, citations: [], detail: { actor: 'x', flow: inner } },
    ],
  };
  const keys = codeRefs(parent).map((r) => `${r.repo}:${r.path}`);
  assert.deepEqual(keys, ['nitro:only/in/detail.go']);
});
