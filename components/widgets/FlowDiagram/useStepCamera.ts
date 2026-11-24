import type { Edge, Node, ReactFlowInstance } from '@xyflow/react';
import { type RefObject, useEffect, useState } from 'react';

import { CAMERA_BOTTOM, CAMERA_MARGIN, cameraViewport } from './camera.ts';
import { type Box, type FlowLayout, activeBoxes, nodeBox } from './layout.ts';
import type { Step } from './model.ts';
import { motionDuration } from './useStepNavigation.ts';

// Room for the key and the band names at the top of the canvas.
const CAMERA_TOP = 40;

function sizeOf(canvas: HTMLElement) {
  return { width: canvas.clientWidth, height: canvas.clientHeight };
}

/** Every band, node and edge label in the layout. */
function allBoxes(layout: FlowLayout): Box[] {
  return [
    ...layout.bands.map((band) => band.box),
    ...Object.values(layout.nodes).map(nodeBox),
    ...Object.values(layout.edges).map((edge) => edge.label),
  ];
}

/** The dialog canvas size that frames the whole graph at zoom 1. A dialog has no top room. */
export function naturalCanvasSize(layout: FlowLayout) {
  const boxes = allBoxes(layout);
  const width =
    Math.max(...boxes.map((box) => box.x + box.width)) - Math.min(...boxes.map((box) => box.x));
  const height =
    Math.max(...boxes.map((box) => box.y + box.height)) - Math.min(...boxes.map((box) => box.y));
  return {
    width: Math.ceil(width + 2 * CAMERA_MARGIN),
    height: Math.ceil(height + 2 * CAMERA_MARGIN + CAMERA_BOTTOM),
  };
}

/**
 * Frames the active nodes and their edge labels on each step change and each canvas resize
 * (crossing 768px, or rotating a phone). When `narrow` (a screen under 768px), a step keeps zoom
 * >= `PHONE_MIN_ZOOM`; a step too wide or tall for that centers on its first active node instead.
 * Returns `showAll`, which fits the whole graph with no zoom floor. `inDialog` fits the whole graph
 * on every step, with no top room: a dialog has no key or band names.
 */
export function useStepCamera<N extends Node, E extends Edge>(
  instance: ReactFlowInstance<N, E> | null,
  layout: FlowLayout | null,
  step: Step,
  canvasRef: RefObject<HTMLDivElement | null>,
  { inDialog = false, narrow = false }: { inDialog?: boolean; narrow?: boolean } = {},
) {
  const top = inDialog ? 0 : CAMERA_TOP;
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
    const focus = nodeBox(layout.nodes[step.actors[0]!]!);
    const boxes = inDialog ? allBoxes(layout) : activeBoxes(layout, step);
    const options = { narrow, fitAll: inDialog };
    const viewport = cameraViewport(boxes, focus, sizeOf(canvas), top, options);
    void instance.setViewport(viewport, { duration: motionDuration() });
  }, [instance, layout, step, canvasRef, canvasSize, inDialog, narrow, top]);

  return () => {
    const canvas = canvasRef.current;
    if (!instance || !layout || !canvas) return;
    const boxes = allBoxes(layout);
    const options = { narrow, fitAll: true };
    const viewport = cameraViewport(boxes, boxes[0]!, sizeOf(canvas), top, options);
    void instance.setViewport(viewport, { duration: motionDuration() });
  };
}
