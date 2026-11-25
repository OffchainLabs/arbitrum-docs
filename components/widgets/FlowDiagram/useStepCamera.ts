import type { Edge, Node, ReactFlowInstance } from '@xyflow/react';
import { type RefObject, useEffect, useState } from 'react';

import { CAMERA_BOTTOM, CAMERA_MARGIN, cameraViewport, overviewHeight } from './camera.ts';
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
  // Show all grows the canvas to `overviewHeight`, so the whole graph reads at zoom 1. Off in
  // the detail dialog, which sizes its canvas to the graph.
  growOverview?: boolean;
}

/**
 * Frames the active nodes and their edge labels on each step change, each canvas resize
 * (crossing 768px, or rotating a phone) and each dock resize (a new step's caption, or details
 * opened), above the dock, and when the reader moves or puts back the dock. When `narrow`, a step
 * keeps zoom >= `PHONE_MIN_ZOOM`; a step too wide or tall for that centers on its first active
 * node instead. `showAll` frames the whole graph until the step changes or `showStep`; `overview`
 * says it is on. With `growOverview`, `grownHeight` is then the canvas height that shows it at
 * zoom 1 (or the width fit, with the phone floor); otherwise the graph fits the canvas.
 */
export function useStepCamera<N extends Node, E extends Edge>(
  instance: ReactFlowInstance<N, E> | null,
  layout: FlowLayout | null,
  step: Step,
  canvasRef: RefObject<HTMLDivElement | null>,
  {
    inDialog = false,
    narrow = false,
    dockRef,
    dockMoved = false,
    growOverview = false,
  }: CameraOptions = {},
) {
  // A dialog has no key. Read at each frame, since the key strip wraps with the canvas width.
  const topRoom = (canvas: HTMLElement) => (inDialog ? 0 : keyRoom(canvas));
  const [canvasSize, setCanvasSize] = useState('');
  // Show all holds until the step changes: the step it was pressed on. A resize, such as the
  // caption folding to its title, then frames the whole graph again, not the step.
  const [overviewStep, setOverviewStep] = useState<Step | null>(null);
  const overview = overviewStep === step;
  const grow = overview && growOverview;
  const [grownHeight, setGrownHeight] = useState<number | null>(null);

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
    // A grown overview keeps the phone zoom floor: the canvas is tall enough for it.
    const fitAll = inDialog || (overview && !grow);
    const boxes = inDialog || overview ? allBoxes(layout) : activeBoxes(layout, step);
    const options = { narrow, fitAll, bottom: dockRoom(dockRef?.current) };
    const top = topRoom(canvas);
    let size = sizeOf(canvas);
    if (grow) {
      const height = overviewHeight(boxes, size.width, top, options);
      setGrownHeight(height);
      // The canvas grows on the next render; frame for its new height now.
      size = { width: size.width, height: Math.max(size.height, height) };
    } else {
      setGrownHeight(null);
    }
    const viewport = cameraViewport(boxes, focus, size, top, options);
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
    grow,
  ]);

  return {
    // Frames the whole graph, and keeps it framed until the step changes or `showStep`. The
    // effect above frames it, at the grown height when `growOverview`.
    showAll: () => setOverviewStep(step),
    overview,
    grownHeight: grow ? grownHeight : null,
    showStep: () => setOverviewStep(null),
  };
}
