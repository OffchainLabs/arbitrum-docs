import assert from 'node:assert/strict';
import { test } from 'node:test';

import { FLOWS } from '../../components/widgets/FlowDiagram/flows.generated.ts';
import { flowPaths } from '../../components/widgets/FlowDiagram/model.ts';
import { checkFlowShape } from './flow-shape.ts';

test('every registered flow has a valid shape and resolvable paths', () => {
  const flows = Object.values(FLOWS);
  assert.ok(flows.length > 0);
  for (const flow of flows) {
    checkFlowShape(flow);
    assert.doesNotThrow(() => flowPaths(flow), `${flow.id}: flowPaths`);
  }
});
