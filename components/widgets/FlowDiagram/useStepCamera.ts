import type { Edge, Node, ReactFlowInstance } from '@xyflow/react';
import { type RefObject, useEffect, useState } from 'react';

import { CAMERA_BOTTOM, CAMERA_MARGIN, cameraViewport } from './camera.ts';
import { type Box, type FlowLayout, activeBoxes, nodeBox } from './layout.ts';
import type { Step } from './model.ts';
import { motionDuration } from './useStepNavigation.ts';

// Room for the Key button at the top of the canvas, when no key strip is measured.
const CAMERA_TOP = 40;
// Space between the key strip and the graph.
const KEY_GAP = 12;
// Space between the graph and the top of the dock.
const DOCK_GAP = 8;

function sizeOf(canvas: HTMLElement) {
  return { width: canvas.clientWidth, height: canvas.clientHeight };
}

/** The room the key takes at the canvas top: the strip's height, or the Key button's room. */
function keyRoom(canvas: HTMLElement): number {
  const strip = canvas.querySelector<HTMLElement>('[data-flow-key-strip]');
  return strip ? strip.offsetHeight + KEY_GAP : CAMERA_TOP;
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
 * The room the dock takes at the canvas bottom: its height and bottom margin, read from layout,
 * not from its sticky position, so it does not change with the page scroll. None once the reader
 * has moved it (`data-moved`): they put it where it does not cover the step.
 */
function dockRoom(dock: HTMLElement | null | undefined): number {
  if (!dock) return CAMERA_BOTTOM;
  if (dock.dataset.moved !== undefined) return 0;
  return dock.offsetHeight + parseFloat(getComputedStyle(dock).marginBottom) + DOCK_GAP;
}

interface CameraOptions {
  // Frame the whole graph on every step, with no top room: a dialog has no key.
  inDialog?: boolean;
  // A screen under 768px: a step keeps zoom >= `PHONE_MIN_ZOOM`.
  narrow?: boolean;
  // The step dock, framed above while docked.
  dockRef?: RefObject<HTMLElement | null>;
  // Whether the reader moved the dock. A change refits the camera.
  dockMoved?: boolean;
}

/**
 * Frames the active nodes and their edge labels on each step change, each canvas resize
 * (crossing 768px, or rotating a phone) and each dock resize (a new step's caption, or details
 * opened), above the dock, and when the reader moves or puts back the dock. When `narrow`, a step
 * keeps zoom >= `PHONE_MIN_ZOOM`; a step too wide or tall for that centers on its first active
 * node instead. `showAll` fits the whole graph with no zoom floor until the step changes or
 * `showStep`; `overview` says it is on.
 */
export function useStepCamera<N extends Node, E extends Edge>(
  instance: ReactFlowInstance<N, E> | null,
  layout: FlowLayout | null,
  step: Step,
  canvasRef: RefObject<HTMLDivElement | null>,
  { inDialog = false, narrow = false, dockRef, dockMoved = false }: CameraOptions = {},
) {
  // A dialog has no key. Read at each frame, since the key strip wraps with the canvas width.
  const topRoom = (canvas: HTMLElement) => (inDialog ? 0 : keyRoom(canvas));
  const [canvasSize, setCanvasSize] = useState('');
  // Show all holds until the step changes: the step it was pressed on. A resize, such as the
  // caption folding to its title, then frames the whole graph again, not the step.
  const [overviewStep, setOverviewStep] = useState<Step | null>(null);
  const overview = overviewStep === step;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dock = dockRef?.current;
    const observer = new ResizeObserver(() =>
      setCanvasSize(`${canvas.clientWidth}x${canvas.clientHeight}:${dock?.offsetHeight ?? 0}`),
    );
    observer.observe(canvas);
    if (dock) observer.observe(dock);
    return () => observer.disconnect();
  }, [canvasRef, dockRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!instance || !layout || !canvas) return;
    const focus = nodeBox(layout.nodes[step.actors[0]!]!);
    const fitAll = inDialog || overview;
    const boxes = fitAll ? allBoxes(layout) : activeBoxes(layout, step);
    const options = { narrow, fitAll, bottom: dockRoom(dockRef?.current) };
    const viewport = cameraViewport(boxes, focus, sizeOf(canvas), topRoom(canvas), options);
    void instance.setViewport(viewport, { duration: motionDuration() });
  }, [
    instance,
    layout,
    step,
    canvasRef,
    canvasSize,
    inDialog,
    narrow,
    dockRef,
    dockMoved,
    overview,
  ]);

  return {
    // Frames the whole graph, and keeps it framed until the step changes or `showStep`.
    showAll: () => {
      const canvas = canvasRef.current;
      if (!instance || !layout || !canvas) return;
      setOverviewStep(step);
      const boxes = allBoxes(layout);
      const options = { narrow, fitAll: true, bottom: dockRoom(dockRef?.current) };
      const viewport = cameraViewport(boxes, boxes[0]!, sizeOf(canvas), topRoom(canvas), options);
      void instance.setViewport(viewport, { duration: motionDuration() });
    },
    overview,
    showStep: () => setOverviewStep(null),
  };
}
