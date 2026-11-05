import type { Edge, Node, ReactFlowInstance } from '@xyflow/react';
import { type RefObject, useEffect, useState } from 'react';

import { type Box, type FlowLayout, NODE_HEIGHT, NODE_WIDTH, activeBoxes } from './layout.ts';
import type { Step } from './model.ts';
import { motionDuration } from './useStepNavigation.ts';

const CAMERA_MARGIN = 24;
// Room for the key and the band names at the top of the canvas.
const CAMERA_TOP = 40;
// Room for the step bar at the bottom of the canvas.
const CAMERA_BOTTOM = 56;

/**
 * Frames `boxes` at zoom <= 1 inside the canvas, between the top room for the key and band names
 * and the bottom room for the step bar.
 */
function frame<N extends Node, E extends Edge>(
  instance: ReactFlowInstance<N, E>,
  canvas: HTMLElement,
  boxes: Box[],
) {
  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.width));
  const maxY = Math.max(...boxes.map((box) => box.y + box.height));
  const width = canvas.clientWidth;
  const frameHeight = canvas.clientHeight - CAMERA_TOP - CAMERA_BOTTOM;
  const zoom = Math.min(
    1,
    (width - 2 * CAMERA_MARGIN) / (maxX - minX),
    (frameHeight - 2 * CAMERA_MARGIN) / (maxY - minY),
  );
  void instance.setViewport(
    {
      x: width / 2 - ((minX + maxX) / 2) * zoom,
      y: CAMERA_TOP + frameHeight / 2 - ((minY + maxY) / 2) * zoom,
      zoom,
    },
    { duration: motionDuration() },
  );
}

/** Every band, node and edge label in the layout. */
function allBoxes(layout: FlowLayout): Box[] {
  return [
    ...layout.bands.map((band) => band.box),
    ...Object.values(layout.nodes).map((point) => ({
      ...point,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    })),
    ...Object.values(layout.edges).map((edge) => edge.label),
  ];
}

/**
 * Frames the active nodes and their edge labels on each step change and each canvas resize
 * (crossing 768px, or rotating a phone). Returns `showAll`, which frames the whole graph the same
 * way.
 */
export function useStepCamera<N extends Node, E extends Edge>(
  instance: ReactFlowInstance<N, E> | null,
  layout: FlowLayout | null,
  step: Step,
  canvasRef: RefObject<HTMLDivElement | null>,
  frameAll = false,
) {
  const [canvasSize, setCanvasSize] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() =>
      setCanvasSize(`${canvas.clientWidth}x${canvas.clientHeight}`),
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [canvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!instance || !layout || !canvas) return;
    frame(instance, canvas, frameAll ? allBoxes(layout) : activeBoxes(layout, step));
  }, [instance, layout, step, canvasRef, canvasSize, frameAll]);

  return () => {
    const canvas = canvasRef.current;
    if (!instance || !layout || !canvas) return;
    frame(instance, canvas, allBoxes(layout));
  };
}
