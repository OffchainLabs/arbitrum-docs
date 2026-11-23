import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { DiagramFlow, DiagramStep, Part, ProjectConfig } from './diagrams/types.ts';
import { buildContent, checkPartDocs, toFlow } from './generate-diagrams.ts';

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

const config: ProjectConfig = {
  lanes: {
    side: { label: 'Side', short: 'side' },
    main: {
      label: 'Main lane',
      short: 'main',
      svg: { fill: '#000000', stroke: '#111111' },
      widget: { accent: '#222222', fill: ['#333333', '#444444'], border: ['#555555', '#666666'] },
    },
  },
  kinds: {
    box: {
      label: 'Box',
      svg: { fill: '#000000', title: '#111111', sub: '#222222' },
      widget: { fill: '#777777', title: '#888888', sub: '#999999' },
    },
    plain: { label: 'Plain', svg: { fill: '#000000', title: '#111111', sub: '#222222' } },
  },
  repos: {
    app: { url: 'https://example.com/app', code: 'https://example.com/app/blob/{var:tag}' },
  },
  finality: { done: { label: 'Done', term: 'done' } },
  card: { detailsToggle: 'Details', symptoms: 'S', impact: 'I', recovery: 'R', showFlag: false },
  svg: { canvas: [1, 1], cols: [0], rows: [0], box: [1, 1], scale: 1, offset: [0, 0] },
};

function widgetFlow(step: Partial<DiagramStep> = {}, kind = 'box'): DiagramFlow {
  return {
    id: 'demo',
    title: 'Demo',
    showLanes: true,
    parts: [{ id: 'a', label: 'A', tech: 'Go', kind, lane: 'main' }],
    edges: [],
    steps: [
      {
        id: 'one',
        title: 'One',
        text: 'Step one.',
        parts: ['a'],
        edges: [],
        cites: [],
        lane: 'main',
        ...step,
      },
    ],
    file: 'flows/demo.md',
  };
}

const toWidget = (flow: DiagramFlow) => toFlow(flow, { config, all: new Map([[flow.id, flow]]) });

test('accepts a flow whose ids project.yaml declares', () => {
  const flow = toWidget(
    widgetFlow({ finality: 'done', code: { repo: 'app', path: 'x.go', line: 3 } }),
  );
  assert.equal(flow.steps[0]!.finality, 'done');
  assert.deepEqual(flow.steps[0]!.code, { repo: 'app', path: 'x.go', line: 3 });
});

test('accepts a part without a tech and emits no tech for it', () => {
  const flow = widgetFlow();
  flow.parts = [{ id: 'a', label: 'A', kind: 'box', lane: 'main' }];
  assert.equal('tech' in toWidget(flow).actors[0]!, false);
});

test('rejects a finality that project.yaml does not declare', () =>
  assert.throws(
    () => toWidget(widgetFlow({ finality: 'nope' })),
    /step "one" has finality "nope", which project\.yaml does not declare/,
  ));

test('rejects a part whose kind has no widget colors', () =>
  assert.throws(
    () => toWidget(widgetFlow({}, 'plain')),
    /part "a" has kind "plain", which has no widget colors/,
  ));

test('rejects a step lane that is not a band lane', () =>
  assert.throws(
    () => toWidget(widgetFlow({ lane: 'side' })),
    /step "one" lane "side" has no widget band colors/,
  ));

test('rejects a repo that project.yaml does not declare', () =>
  assert.throws(
    () => toWidget(widgetFlow({ cites: [{ repo: 'other', path: 'y.go' }] })),
    /step "one" uses repo "other", which has no code link/,
  ));

test('rejects a part lane without a short name when the flow shows lanes', () => {
  const flow = widgetFlow();
  flow.parts[0]!.lane = 'bare';
  const bare = { ...config, lanes: { ...config.lanes, bare: { label: 'Bare' } } };
  assert.throws(
    () => toFlow(flow, { config: bare, all: new Map([[flow.id, flow]]) }),
    /part "a" has lane "bare", which has no short name/,
  );
  toFlow({ ...flow, showLanes: false }, { config: bare, all: new Map([[flow.id, flow]]) });
});

test('emits PROJECT: lanes without svg, kinds with widget colors, repos with code links', () => {
  const flow = widgetFlow();
  const content = buildContent(new Map([[flow.id, flow]]), config);
  const match = /^export const PROJECT: Project = (.*);$/m.exec(content);
  assert.ok(match, 'no PROJECT constant');
  assert.deepEqual(JSON.parse(match[1]!), {
    lanes: {
      side: { label: 'Side', short: 'side' },
      main: {
        label: 'Main lane',
        short: 'main',
        widget: {
          accent: '#222222',
          fill: ['#333333', '#444444'],
          border: ['#555555', '#666666'],
        },
      },
    },
    kinds: { box: { label: 'Box', widget: { fill: '#777777', title: '#888888', sub: '#999999' } } },
    finality: { done: { label: 'Done', term: 'done' } },
    repos: { app: { code: 'https://example.com/app/blob/{var:tag}' } },
    card: { detailsToggle: 'Details', symptoms: 'S', impact: 'I', recovery: 'R', showFlag: false },
  });
});
