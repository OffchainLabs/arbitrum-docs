import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  CAMERA_BOTTOM,
  CAMERA_MARGIN,
  PHONE_MIN_ZOOM,
  cameraViewport,
} from '../../components/widgets/FlowDiagram/camera.ts';
import type { Box } from '../../components/widgets/FlowDiagram/layout.ts';

const TOP = 40;
const PHONE = { width: 375, height: 520 };
const TABLET = { width: 768, height: 720 };
const STEP = { narrow: true, fitAll: false };
const ALL = { narrow: true, fitAll: true };
const node = (x: number, y: number): Box => ({ x, y, width: 220, height: 72 });
// Three nodes in a row, 1100 wide in all: too wide for 375px at zoom 0.6.
const ROW = [node(0, 0), node(440, 0), node(880, 0)];

/** The screen x of the center of `box` under `viewport`. */
function screenCenterX(box: Box, viewport: { x: number; zoom: number }): number {
  return viewport.x + (box.x + box.width / 2) * viewport.zoom;
}

test('a narrow screen frames a wide step at the phone zoom floor', () => {
  const viewport = cameraViewport(ROW, ROW[1]!, PHONE, TOP, STEP);
  assert.equal(viewport.zoom, PHONE_MIN_ZOOM);
});

test('a narrow screen centers a wide step on its focus box', () => {
  const viewport = cameraViewport(ROW, ROW[1]!, PHONE, TOP, STEP);
  assert.ok(Math.abs(screenCenterX(ROW[1]!, viewport) - PHONE.width / 2) < 1e-9);
});

test('a focus box at the left end clamps the view to the left edge plus the margin', () => {
  const viewport = cameraViewport(ROW, ROW[0]!, PHONE, TOP, STEP);
  assert.equal(viewport.x, CAMERA_MARGIN);
});

test('a focus box at the right end clamps the view to the right edge plus the margin', () => {
  const viewport = cameraViewport(ROW, ROW[2]!, PHONE, TOP, STEP);
  const right = viewport.x + 1100 * viewport.zoom;
  assert.ok(Math.abs(right - (PHONE.width - CAMERA_MARGIN)) < 1e-9);
});

test('a tall step on a narrow screen clamps vertically to the frame', () => {
  const column = [node(0, 0), node(0, 400), node(0, 800)];
  const topEnd = cameraViewport(column, column[0]!, PHONE, TOP, STEP);
  assert.equal(topEnd.zoom, PHONE_MIN_ZOOM);
  assert.equal(topEnd.y, TOP + CAMERA_MARGIN);
  const bottomEnd = cameraViewport(column, column[2]!, PHONE, TOP, STEP);
  const frameBottom = PHONE.height - CAMERA_BOTTOM - CAMERA_MARGIN;
  assert.ok(Math.abs(bottomEnd.y + 872 * bottomEnd.zoom - frameBottom) < 1e-9);
});

test('fitAll on a narrow screen fits every box with no floor', () => {
  const viewport = cameraViewport(ROW, ROW[0]!, PHONE, TOP, ALL);
  assert.ok(viewport.zoom < PHONE_MIN_ZOOM);
  assert.ok(Math.abs(viewport.x - CAMERA_MARGIN) < 1e-9);
  assert.ok(Math.abs(viewport.x + 1100 * viewport.zoom - (PHONE.width - CAMERA_MARGIN)) < 1e-9);
});

test('a wide screen fits a wide step with no floor', () => {
  const wide = [node(0, 0), node(2000, 0)];
  const viewport = cameraViewport(wide, wide[0]!, TABLET, TOP, { narrow: false, fitAll: false });
  assert.ok(viewport.zoom < PHONE_MIN_ZOOM);
  assert.ok(Math.abs(screenCenterX({ x: 0, y: 0, width: 2220, height: 0 }, viewport) - 384) < 1e-9);
});

test('a step that fits at the floor frames the same with or without it', () => {
  const pair = [node(0, 0), node(80, 0)];
  const floored = cameraViewport(pair, pair[1]!, PHONE, TOP, STEP);
  assert.deepEqual(floored, cameraViewport(pair, pair[1]!, PHONE, TOP, ALL));
  assert.ok(floored.zoom >= PHONE_MIN_ZOOM);
});

test('a small step frames at zoom 1, centered in the frame', () => {
  const single = [node(100, 100)];
  const viewport = cameraViewport(single, single[0]!, PHONE, TOP, STEP);
  assert.equal(viewport.zoom, 1);
  assert.equal(screenCenterX(single[0]!, viewport), PHONE.width / 2);
  const frameHeight = PHONE.height - TOP - CAMERA_BOTTOM;
  assert.equal(viewport.y + 136, TOP + frameHeight / 2);
});
