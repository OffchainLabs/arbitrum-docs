import type { Viewport } from '@xyflow/react';

import type { Box } from './layout.ts';

export const CAMERA_MARGIN = 24;
// Room for the step bar at the bottom of the canvas.
export const CAMERA_BOTTOM = 56;
// On a narrow screen a step keeps this zoom, and the reader drags sideways to pan.
export const PHONE_MIN_ZOOM = 0.6;

interface Size {
  width: number;
  height: number;
}

/**
 * The offset on one axis that centers `min`..`max` in `start`..`start + size`. When the span does
 * not fit at `zoom`, it centers `focus` instead, clamped so the view stops at the span's ends plus
 * the margin.
 */
function axisOffset(
  [min, max]: [number, number],
  focus: number,
  [start, size]: [number, number],
  zoom: number,
): number {
  const room = size - 2 * CAMERA_MARGIN;
  if ((max - min) * zoom <= room + 1e-9) return start + size / 2 - ((min + max) / 2) * zoom;
  const lowest = start + size - CAMERA_MARGIN - max * zoom;
  const highest = start + CAMERA_MARGIN - min * zoom;
  return Math.min(highest, Math.max(lowest, start + size / 2 - focus * zoom));
}

function bounds(boxes: Box[]) {
  return {
    minX: Math.min(...boxes.map((box) => box.x)),
    minY: Math.min(...boxes.map((box) => box.y)),
    maxX: Math.max(...boxes.map((box) => box.x + box.width)),
    maxY: Math.max(...boxes.map((box) => box.y + box.height)),
  };
}

/**
 * The canvas height that frames `boxes` at zoom 1, or at the zoom that fits `width` when the
 * boxes are wider. When `narrow`, zoom stays >= `PHONE_MIN_ZOOM` and the reader drags sideways.
 * `cameraViewport` with `fitAll: false` frames the boxes in a canvas of this height at that zoom.
 */
export function overviewHeight(
  boxes: Box[],
  width: number,
  top: number,
  { narrow, bottom = CAMERA_BOTTOM }: { narrow: boolean; bottom?: number },
): number {
  const { minX, minY, maxX, maxY } = bounds(boxes);
  const fit = Math.min(1, (width - 2 * CAMERA_MARGIN) / (maxX - minX));
  const zoom = narrow ? Math.max(fit, PHONE_MIN_ZOOM) : fit;
  return Math.ceil(top + bottom + 2 * CAMERA_MARGIN + (maxY - minY) * zoom);
}

/**
 * The viewport that frames `boxes` at zoom <= 1 inside `canvas`, between `top` (room for the key)
 * and `bottom` (room for the step bar or dock). When `narrow` and not `fitAll`, zoom stays
 * >= `PHONE_MIN_ZOOM`. On an axis where the boxes then do not fit, the view centers on `focus` and
 * stops at the boxes' ends plus the margin.
 */
export function cameraViewport(
  boxes: Box[],
  focus: Box,
  canvas: Size,
  top: number,
  { narrow, fitAll, bottom = CAMERA_BOTTOM }: { narrow: boolean; fitAll: boolean; bottom?: number },
): Viewport {
  const { minX, minY, maxX, maxY } = bounds(boxes);
  const frameHeight = canvas.height - top - bottom;
  const fit = Math.min(
    1,
    (canvas.width - 2 * CAMERA_MARGIN) / (maxX - minX),
    (frameHeight - 2 * CAMERA_MARGIN) / (maxY - minY),
  );
  const zoom = narrow && !fitAll ? Math.max(fit, PHONE_MIN_ZOOM) : fit;
  return {
    x: axisOffset([minX, maxX], focus.x + focus.width / 2, [0, canvas.width], zoom),
    y: axisOffset([minY, maxY], focus.y + focus.height / 2, [top, frameHeight], zoom),
    zoom,
  };
}
