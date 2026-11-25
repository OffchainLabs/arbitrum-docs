import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { FLOWS } from '../../components/widgets/FlowDiagram/flows.ts';
import type { Flow } from '../../components/widgets/FlowDiagram/model.ts';
import { fillVars } from '../../components/widgets/FlowDiagram/text.ts';

test('fillVars replaces tokens with vars values', () => {
  assert.equal(
    fillVars('{var:a} days, round {var:b} ms', { a: '6.4', b: 125 }),
    '6.4 days, round 125 ms',
  );
});

test('fillVars throws on an unknown var', () => {
  assert.throws(() => fillVars('{var:nope}', {}), /Unknown var "nope"/);
});

test('fillVars throws on an inherited property name', () => {
  assert.throws(() => fillVars('{var:toString}', {}), /Unknown var "toString"/);
});

test('every {var:name} in a flow step resolves in content/vars.json', () => {
  const values = JSON.parse(readFileSync('content/vars.json', 'utf8')) as Record<string, unknown>;
  const check = (flow: Flow) => {
    for (const step of flow.steps) {
      assert.doesNotThrow(() => fillVars(step.text, values), step.id);
      if (step.detail) check(step.detail.flow);
    }
  };
  for (const flow of Object.values(FLOWS)) check(flow);
});
