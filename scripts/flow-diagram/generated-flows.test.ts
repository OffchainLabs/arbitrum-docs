import assert from 'node:assert/strict';
import { test } from 'node:test';

import { FLOWS } from '../../components/widgets/FlowDiagram/flows.generated.ts';
import { type Flow, type FlowEdge, flowPaths } from '../../components/widgets/FlowDiagram/model.ts';
import { checkFlowShape } from './flow-shape.ts';

test('every registered flow has a valid shape and resolvable paths', () => {
  const flows = Object.values(FLOWS);
  assert.ok(flows.length > 0);
  for (const flow of flows) {
    checkFlowShape(flow);
    assert.doesNotThrow(() => flowPaths(flow), `${flow.id}: flowPaths`);
  }
});

function flowsWithDetails(flow: Flow): Flow[] {
  const found = [flow];
  for (const step of flow.steps) {
    if (step.detail) found.push(...flowsWithDetails(step.detail.flow));
  }
  return found;
}

function findCycleEdge(edges: FlowEdge[]): FlowEdge | undefined {
  const remaining = [...edges];
  for (;;) {
    const hasIncoming = new Set(remaining.map((edge) => edge.target));
    const next = remaining.filter((edge) => hasIncoming.has(edge.source));
    if (next.length === remaining.length) return next[0];
    if (next.length === 0) return undefined;
    remaining.splice(0, remaining.length, ...next);
  }
}

test("every path's edges form no cycle, in every flow", () => {
  for (const top of Object.values(FLOWS)) {
    for (const flow of flowsWithDetails(top)) {
      const edgesById = new Map(flow.edges.map((edge) => [edge.id, edge]));
      for (const path of flowPaths(flow)) {
        const used = new Set(path.steps.flatMap((step) => step.edges));
        const edges = [...used].flatMap((id) => edgesById.get(id) ?? []);
        const cycle = findCycleEdge(edges);
        assert.equal(
          cycle,
          undefined,
          `${flow.id} path "${path.id}": edge "${cycle?.id}" is on a cycle`,
        );
      }
    }
  }
});
