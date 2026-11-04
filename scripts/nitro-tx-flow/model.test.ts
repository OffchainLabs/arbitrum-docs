import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  codeRefs,
  transactionLifecycle as flow,
} from '../../components/widgets/NitroTxFlow/model.ts';

test('actor and edge ids are unique', () => {
  const actorIds = flow.actors.map((a) => a.id);
  const edgeIds = flow.edges.map((e) => e.id);
  assert.equal(new Set(actorIds).size, actorIds.length);
  assert.equal(new Set(edgeIds).size, edgeIds.length);
});

test('every edge source and target is an actor', () => {
  const actorIds = new Set(flow.actors.map((a) => a.id));
  for (const edge of flow.edges) {
    assert.ok(actorIds.has(edge.source), `${edge.id} source ${edge.source}`);
    assert.ok(actorIds.has(edge.target), `${edge.id} target ${edge.target}`);
  }
});

test("every step's actors and edges exist", () => {
  const actorIds = new Set(flow.actors.map((a) => a.id));
  const edgeIds = new Set(flow.edges.map((e) => e.id));
  for (const step of flow.steps) {
    for (const id of step.actors) assert.ok(actorIds.has(id), `${step.id} actor ${id}`);
    for (const id of step.edges) assert.ok(edgeIds.has(id), `${step.id} edge ${id}`);
  }
});

test('step count is between 6 and 8', () => {
  assert.ok(flow.steps.length >= 6 && flow.steps.length <= 8, `got ${flow.steps.length}`);
});

test('step ids are unique kebab-case', () => {
  const ids = flow.steps.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
});

test('every step has non-empty text and all three failure parts', () => {
  for (const step of flow.steps) {
    assert.ok(step.text.trim(), `${step.id} text`);
    assert.ok(step.failure.symptoms.trim(), `${step.id} symptoms`);
    assert.ok(step.failure.impact.trim(), `${step.id} impact`);
    assert.ok(step.failure.recovery.trim(), `${step.id} recovery`);
  }
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
