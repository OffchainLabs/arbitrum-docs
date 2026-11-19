import assert from 'node:assert/strict';

import type { Flow } from '../../components/widgets/NitroTxFlow/model.ts';

/** Asserts the structure every flow needs: unique ids, known actors and edges, step text. */
export function checkFlowShape(flow: Flow): void {
  const actorIds = flow.actors.map((a) => a.id);
  const edgeIds = flow.edges.map((e) => e.id);
  assert.equal(new Set(actorIds).size, actorIds.length, `${flow.id}: duplicate actor id`);
  assert.equal(new Set(edgeIds).size, edgeIds.length, `${flow.id}: duplicate edge id`);

  const actors = new Set(actorIds);
  const edges = new Set(edgeIds);
  for (const edge of flow.edges) {
    assert.ok(actors.has(edge.source), `${flow.id}: ${edge.id} source ${edge.source}`);
    assert.ok(actors.has(edge.target), `${flow.id}: ${edge.id} target ${edge.target}`);
  }

  const stepIds = flow.steps.map((s) => s.id);
  assert.equal(new Set(stepIds).size, stepIds.length, `${flow.id}: duplicate step id`);
  for (const step of flow.steps) {
    assert.match(step.id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.ok(step.text.trim(), `${flow.id}: ${step.id} text`);
    for (const id of step.actors) assert.ok(actors.has(id), `${flow.id}: ${step.id} actor ${id}`);
    for (const id of step.edges) assert.ok(edges.has(id), `${flow.id}: ${step.id} edge ${id}`);
  }
}
