import assert from 'node:assert/strict';
import { before, test } from 'node:test';

import {
  PROJECT,
  transactionLifecycle as flow,
  pgaRound,
  sequencerStep3,
  transactionSubmission,
} from '../../components/widgets/FlowDiagram/flows.generated.ts';
import {
  type Box,
  type FlowLayout,
  NODE_HEIGHT,
  NODE_WIDTH,
  computeBands,
  computeLayout,
  firstStepIndex,
  stepNumbersByEdge,
} from '../../components/widgets/FlowDiagram/layout.ts';
import {
  type Flow,
  type ResolvedPath,
  type Step,
  flowPaths,
} from '../../components/widgets/FlowDiagram/model.ts';

interface Case {
  name: string;
  flow: Flow;
  path: ResolvedPath;
  layout: FlowLayout;
}

const cases: Case[] = [];

function layoutOf(flowId: string, pathId: string): FlowLayout {
  const found = cases.find((c) => c.flow.id === flowId && c.path.id === pathId);
  if (!found) throw new Error(`no layout for ${flowId}/${pathId}`);
  return found.layout;
}

before(async () => {
  for (const shown of [flow, transactionSubmission, pgaRound, sequencerStep3]) {
    for (const path of flowPaths(shown)) {
      const name = `${shown.id}/${path.id || 'main'}`;
      cases.push({ name, flow: shown, path, layout: await computeLayout(shown, path.steps) });
    }
  }
});

function overlaps(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

function nodeBoxes(l: FlowLayout): Box[] {
  return Object.values(l.nodes).map((p) => ({ ...p, width: NODE_WIDTH, height: NODE_HEIGHT }));
}

function pathEdges(c: Case) {
  const used = new Set(c.path.steps.flatMap((step) => step.edges));
  return c.flow.edges.filter((edge) => used.has(edge.id));
}

test('firstStepIndex gives each part the index of the first step that lists it', () => {
  const step = (id: string, actors: string[]): Step => ({
    id,
    title: id,
    text: '',
    actors,
    edges: [],
    citations: [],
    txChain: 'child',
  });
  const steps = [step('one', ['a', 'b']), step('two', ['b', 'c']), step('three', ['d', 'a'])];
  assert.deepEqual(firstStepIndex(steps), { a: 0, b: 0, c: 1, d: 2 });
});

test('every edge points down', () => {
  for (const c of cases) {
    for (const edge of pathEdges(c)) {
      const source = c.layout.nodes[edge.source]!;
      const target = c.layout.nodes[edge.target]!;
      assert.ok(target.y > source.y, `${c.name} ${edge.id}: ${target.y} <= ${source.y}`);
    }
  }
});

test('each lane is one vertical column', () => {
  const lanes = Object.keys(PROJECT.lanes);
  for (const c of cases) {
    const chainOf = new Map(c.flow.actors.map((actor) => [actor.id, actor.chain]));
    const spans = lanes
      .map((lane) => {
        const xs = Object.entries(c.layout.nodes)
          .filter(([id]) => chainOf.get(id) === lane)
          .map(([, point]) => point.x);
        return {
          lane,
          left: Math.min(...xs),
          right: Math.max(...xs) + NODE_WIDTH,
          count: xs.length,
        };
      })
      .filter((span) => span.count > 0);
    for (let i = 1; i < spans.length; i++) {
      const prev = spans[i - 1]!;
      const next = spans[i]!;
      assert.ok(prev.right < next.left, `${c.name}: ${prev.lane} reaches into ${next.lane}`);
    }
  }
});

// Rows are the distinct node tops, top to bottom. Compaction leaves no empty row below a part.
function rowsOf(l: FlowLayout): number[] {
  return [...new Set(Object.values(l.nodes).map((point) => point.y))].sort((a, b) => a - b);
}

test('no part can move up a row: it sits under an incoming part or the part above it', () => {
  for (const c of cases) {
    const rows = rowsOf(c.layout);
    const nodes = c.layout.nodes;
    const edges = pathEdges(c);
    for (const [id, point] of Object.entries(nodes)) {
      const row = rows.indexOf(point.y);
      if (row === 0) continue;
      const above = rows[row - 1];
      const fromEdge = edges.some((edge) => edge.target === id && nodes[edge.source]!.y === above);
      const fromColumn = Object.values(nodes).some((n) => n.x === point.x && n.y === above);
      assert.ok(fromEdge || fromColumn, `${c.name}: ${id} could move up a row`);
    }
  }
});

test('parts in one lane column keep the order of their first step', () => {
  for (const c of cases) {
    const first = firstStepIndex(c.path.steps);
    const nodes = Object.entries(c.layout.nodes);
    for (const [a, pa] of nodes) {
      for (const [b, pb] of nodes) {
        if (pa.x === pb.x && first[a]! < first[b]!) {
          assert.ok(pa.y < pb.y, `${c.name}: ${b} above ${a}`);
        }
      }
    }
  }
});

test('the Rollup sits below the Proposer on both submission tabs', () => {
  for (const pathId of ['direct', 'retryable']) {
    const l = layoutOf(transactionSubmission.id, pathId);
    assert.ok(l.nodes.rollup!.y > l.nodes.proposer!.y, pathId);
  }
});

test('the Rollup sits in the row right under the Bridge on both submission tabs', () => {
  for (const pathId of ['direct', 'retryable']) {
    const l = layoutOf(transactionSubmission.id, pathId);
    const rows = rowsOf(l);
    const bridge = rows.indexOf(l.nodes['bridge-late']!.y);
    assert.equal(rows.indexOf(l.nodes.rollup!.y), bridge + 1, pathId);
  }
});

test('the Outbox sits below the Rollup on both submission tabs', () => {
  for (const pathId of ['direct', 'retryable']) {
    const l = layoutOf(transactionSubmission.id, pathId);
    assert.ok(l.nodes.outbox!.y > l.nodes.rollup!.y, pathId);
  }
});

test("a path's layout holds only the parts and edges its steps use", () => {
  for (const c of cases) {
    const actors = new Set(c.path.steps.flatMap((step) => step.actors));
    assert.deepEqual(Object.keys(c.layout.nodes).sort(), [...actors].sort(), c.name);
    const edges = pathEdges(c).map((edge) => edge.id);
    assert.deepEqual(Object.keys(c.layout.edges).sort(), edges.sort(), c.name);
  }
  const direct = layoutOf(transactionSubmission.id, 'direct');
  for (const id of ['dapp', 'inbox', 'bridge']) assert.ok(!(id in direct.nodes), id);
});

test('every edge segment is horizontal or vertical', () => {
  for (const c of cases) {
    for (const [id, edge] of Object.entries(c.layout.edges)) {
      assert.ok(edge.points.length >= 2, `${c.name} ${id}`);
      for (let i = 1; i < edge.points.length; i++) {
        const a = edge.points[i - 1]!;
        const b = edge.points[i]!;
        const straight = Math.abs(a.x - b.x) <= 0.5 || Math.abs(a.y - b.y) <= 0.5;
        assert.ok(straight, `${c.name} ${id} segment ${i}`);
      }
    }
  }
});

test('no two node boxes overlap', () => {
  for (const c of cases) {
    const boxes = nodeBoxes(c.layout);
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        assert.ok(!overlaps(boxes[i]!, boxes[j]!), `${c.name}: nodes ${i} and ${j}`);
      }
    }
  }
});

test('no two label boxes overlap', () => {
  for (const c of cases) {
    const entries = Object.entries(c.layout.edges);
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        assert.ok(
          !overlaps(entries[i]![1].label, entries[j]![1].label),
          `${c.name}: labels ${entries[i]![0]} and ${entries[j]![0]}`,
        );
      }
    }
  }
});

test('no label box overlaps a node box', () => {
  for (const c of cases) {
    const boxes = nodeBoxes(c.layout);
    for (const [id, edge] of Object.entries(c.layout.edges)) {
      for (const box of boxes) assert.ok(!overlaps(edge.label, box), `${c.name}: label ${id}`);
    }
  }
});

/** The distance from `point` to the nearest point of the polyline `points`. */
function distanceToPolyline(point: { x: number; y: number }, points: { x: number; y: number }[]) {
  let best = Infinity;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    const x = Math.min(Math.max(point.x, Math.min(a.x, b.x)), Math.max(a.x, b.x));
    const y = Math.min(Math.max(point.y, Math.min(a.y, b.y)), Math.max(a.y, b.y));
    best = Math.min(best, Math.hypot(point.x - x, point.y - y));
  }
  return best;
}

test('every label is centered on its own edge', () => {
  for (const c of cases) {
    for (const [id, edge] of Object.entries(c.layout.edges)) {
      const center = {
        x: edge.label.x + edge.label.width / 2,
        y: edge.label.y + edge.label.height / 2,
      };
      const distance = distanceToPolyline(center, edge.points);
      assert.ok(distance <= 2, `${c.name} ${id}: label center is ${distance.toFixed(1)}px away`);
    }
  }
});

test('layout is identical across two runs', async () => {
  for (const c of cases) {
    assert.deepEqual(await computeLayout(c.flow, c.path.steps), c.layout, c.name);
  }
});

test('the submission direct path has exactly one band per chain', () => {
  assert.deepEqual(
    layoutOf(transactionSubmission.id, 'direct').bands.map((band) => band.chain),
    ['child', 'parent'],
  );
});

test('the lifecycle bands each hold their own chain parts', () => {
  const bands = layoutOf(flow.id, '').bands;
  assert.equal(bands.length, 2);
  const child = bands.find((b) => b.chain === 'child');
  const parent = bands.find((b) => b.chain === 'parent');
  assert.deepEqual([...child!.actors].sort(), [
    'fullnode',
    'fullnode-late',
    'poster',
    'relay',
    'seq',
  ]);
  assert.deepEqual([...parent!.actors].sort(), ['bridge', 'seqinbox']);
});

test('the wallet is in no band', () => {
  for (const c of cases) {
    for (const band of c.layout.bands) assert.ok(!band.actors.includes('wallet'), c.name);
  }
});

test('bands do not overlap each other', () => {
  for (const c of cases) {
    const { bands } = c.layout;
    for (let i = 0; i < bands.length; i++) {
      for (let j = i + 1; j < bands.length; j++) {
        assert.ok(!overlaps(bands[i]!.box, bands[j]!.box), c.name);
      }
    }
  }
});

test('computeBands gives each band lane one column over the full graph height', () => {
  const fake: Flow = {
    id: 'fake',
    title: 'Fake',
    edges: [],
    steps: [],
    actors: [
      { id: 'w', label: 'W', tech: '', kind: 'user', chain: 'off-chain' },
      { id: 'a', label: 'A', tech: '', kind: 'process', chain: 'child' },
      { id: 'b', label: 'B', tech: '', kind: 'contract', chain: 'parent' },
      { id: 'c', label: 'C', tech: '', kind: 'process', chain: 'child' },
    ],
  };
  const nodes = {
    w: { x: 0, y: 0 },
    a: { x: 300, y: 0 },
    c: { x: 560, y: 150 },
    b: { x: 852, y: 50 },
  };
  assert.deepEqual(computeBands(fake, nodes, 400), [
    { chain: 'child', actors: ['a', 'c'], box: { x: 276, y: 0, width: 528, height: 400 } },
    { chain: 'parent', actors: ['b'], box: { x: 828, y: 0, width: 268, height: 400 } },
  ]);
});
