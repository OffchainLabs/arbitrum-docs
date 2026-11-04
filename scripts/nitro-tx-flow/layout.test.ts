import assert from 'node:assert/strict';
import { before, test } from 'node:test';

import {
  type Box,
  type FlowLayout,
  NODE_HEIGHT,
  NODE_WIDTH,
  computeBands,
  computeLayout,
  firstInteractionRank,
} from '../../components/widgets/NitroTxFlow/layout.ts';
import {
  type Flow,
  transactionLifecycle as flow,
} from '../../components/widgets/NitroTxFlow/model.ts';

let layout: FlowLayout;

before(async () => {
  layout = await computeLayout(flow);
});

function overlaps(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

function nodeBoxes(l: FlowLayout): Box[] {
  return Object.values(l.nodes).map((p) => ({ ...p, width: NODE_WIDTH, height: NODE_HEIGHT }));
}

test('firstInteractionRank gives wallet 0, fullnode 1, seq 2, relay 3, poster 4, seqinbox 5, bridge 6', () => {
  assert.deepEqual(firstInteractionRank(flow), {
    wallet: 0,
    fullnode: 1,
    seq: 2,
    relay: 3,
    poster: 4,
    seqinbox: 5,
    bridge: 6,
  });
});

test('each actor sits in its own row, in rank order', () => {
  const rank = firstInteractionRank(flow);
  const ordered = Object.keys(rank).sort((a, b) => rank[a]! - rank[b]!);
  for (let i = 1; i < ordered.length; i++) {
    assert.ok(layout.nodes[ordered[i]!]!.y > layout.nodes[ordered[i - 1]!]!.y, ordered[i]);
  }
});

test('every edge segment is horizontal or vertical', () => {
  for (const [id, edge] of Object.entries(layout.edges)) {
    for (let i = 1; i < edge.points.length; i++) {
      const a = edge.points[i - 1]!;
      const b = edge.points[i]!;
      assert.ok(Math.abs(a.x - b.x) <= 0.5 || Math.abs(a.y - b.y) <= 0.5, `${id} segment ${i}`);
    }
  }
});

test('no two node boxes overlap', () => {
  const boxes = nodeBoxes(layout);
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      assert.ok(!overlaps(boxes[i]!, boxes[j]!), `nodes ${i} and ${j}`);
    }
  }
});

test('no two label boxes overlap', () => {
  const entries = Object.entries(layout.edges);
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      assert.ok(
        !overlaps(entries[i]![1].label, entries[j]![1].label),
        `labels ${entries[i]![0]} and ${entries[j]![0]}`,
      );
    }
  }
});

test('no label box overlaps a node box', () => {
  const boxes = nodeBoxes(layout);
  for (const [id, edge] of Object.entries(layout.edges)) {
    for (const box of boxes) assert.ok(!overlaps(edge.label, box), `label ${id}`);
  }
});

test('every edge has at least 2 points', () => {
  for (const [id, edge] of Object.entries(layout.edges)) {
    assert.ok(edge.points.length >= 2, id);
  }
});

test('layout is identical across two runs', async () => {
  assert.deepEqual(await computeLayout(flow), layout);
});

test('bands: one child band holding fullnode, seq, relay, poster and one parent band holding seqinbox, bridge', () => {
  assert.equal(layout.bands.length, 2);
  const child = layout.bands.find((b) => b.chain === 'child');
  const parent = layout.bands.find((b) => b.chain === 'parent');
  assert.deepEqual([...child!.actors].sort(), ['fullnode', 'poster', 'relay', 'seq']);
  assert.deepEqual([...parent!.actors].sort(), ['bridge', 'seqinbox']);
});

test('the wallet is in no band', () => {
  for (const band of layout.bands) assert.ok(!band.actors.includes('wallet'));
});

test('bands do not overlap each other', () => {
  for (let i = 0; i < layout.bands.length; i++) {
    for (let j = i + 1; j < layout.bands.length; j++) {
      assert.ok(!overlaps(layout.bands[i]!.box, layout.bands[j]!.box));
    }
  }
});

test('a chain whose rows are not adjacent gets two bands', () => {
  const fake: Flow = {
    id: 'fake',
    title: 'Fake',
    edges: [],
    steps: [],
    actors: [
      { id: 'a', label: 'A', tech: '', kind: 'process', chain: 'child' },
      { id: 'b', label: 'B', tech: '', kind: 'contract', chain: 'parent' },
      { id: 'c', label: 'C', tech: '', kind: 'process', chain: 'child' },
    ],
  };
  const nodes = { a: { x: 0, y: 0 }, b: { x: 0, y: 150 }, c: { x: 0, y: 300 } };
  const bands = computeBands(fake, nodes, 220);
  assert.deepEqual(
    bands.map((b) => [b.chain, b.actors]),
    [
      ['child', ['a']],
      ['parent', ['b']],
      ['child', ['c']],
    ],
  );
});
