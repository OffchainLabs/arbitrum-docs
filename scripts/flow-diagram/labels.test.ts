import assert from 'node:assert/strict';
import { test } from 'node:test';

import { placeLabels } from '../../components/widgets/FlowDiagram/labels.ts';
import type { Box } from '../../components/widgets/FlowDiagram/layout.ts';

function overlaps(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

function center(box: Box): { x: number; y: number } {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

test('a label is centered on the longest vertical segment of its route', () => {
  const route = [
    { x: 0, y: 0 },
    { x: 0, y: 100 },
    { x: 50, y: 100 },
    { x: 50, y: 400 },
  ];
  const boxes = placeLabels({ a: route }, { a: { width: 120, height: 24 } }, []);
  assert.deepEqual(center(boxes.a as Box), { x: 50, y: 250 });
});

test('a second label on a parallel segment 40px away slides along its segment', () => {
  const routes = {
    a: [
      { x: 0, y: 0 },
      { x: 0, y: 300 },
    ],
    b: [
      { x: 40, y: 0 },
      { x: 40, y: 300 },
    ],
  };
  const size = { width: 150, height: 24 };
  const boxes = placeLabels(routes, { a: size, b: size }, []);
  const a = boxes.a as Box;
  const b = boxes.b as Box;
  assert.equal(overlaps(a, b), false);
  assert.ok(Math.abs(center(a).x - 0) <= 2);
  assert.ok(Math.abs(center(b).x - 40) <= 2);
});

test('a label avoids an obstacle box', () => {
  const route = [
    { x: 100, y: 0 },
    { x: 100, y: 300 },
  ];
  const obstacle: Box = { x: 50, y: 120, width: 100, height: 60 };
  const boxes = placeLabels({ a: route }, { a: { width: 80, height: 24 } }, [obstacle]);
  assert.equal(overlaps(boxes.a as Box, obstacle), false);
});

test('a route with no vertical segment centers the label on its longest segment', () => {
  const route = [
    { x: 0, y: 50 },
    { x: 200, y: 50 },
  ];
  const boxes = placeLabels({ a: route }, { a: { width: 60, height: 20 } }, []);
  assert.deepEqual(center(boxes.a as Box), { x: 100, y: 50 });
});

test('a segment with a 0.3px x drift still counts as vertical', () => {
  const route = [
    { x: 100, y: 0 },
    { x: 100.3, y: 300 },
    { x: 400, y: 300 },
  ];
  const boxes = placeLabels({ a: route }, { a: { width: 60, height: 20 } }, []);
  const c = center(boxes.a as Box);
  assert.ok(Math.abs(c.x - 100.15) < 0.01);
  assert.equal(c.y, 150);
});

test('a missing label size throws with the edge id', () => {
  const route = [
    { x: 0, y: 0 },
    { x: 0, y: 100 },
  ];
  assert.throws(() => placeLabels({ e1: route }, {}, []), /no label size for edge "e1"/);
});

test('a route with fewer than 2 points throws with the edge id', () => {
  assert.throws(
    () => placeLabels({ e2: [{ x: 0, y: 0 }] }, { e2: { width: 10, height: 10 } }, []),
    /route for edge "e2" has fewer than 2 points/,
  );
});
