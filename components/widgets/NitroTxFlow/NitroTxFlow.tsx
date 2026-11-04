'use client';

import {
  MarkerType,
  type Node,
  type NodeProps,
  ReactFlow,
  type ReactFlowInstance,
  type Viewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';

import { ActorNode, type ActorNodeType } from './ActorNode.tsx';
import { Legend } from './Legend.tsx';
import { RoutedEdge, type RoutedEdgeType } from './RoutedEdge.tsx';
import { StepCard } from './StepCard.tsx';
import { BAND_STYLE, BRAND } from './brand.ts';
import {
  type Band,
  type Box,
  type FlowLayout,
  NODE_HEIGHT,
  NODE_WIDTH,
  computeLayout,
} from './layout.ts';
import { type Step, transactionLifecycle } from './model.ts';
import { parseStepHash, stepHash } from './navigation.ts';

const FLOW = transactionLifecycle;
const STEP_COUNT = FLOW.steps.length;

const NARROW_QUERY = '(max-width: 767px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const CAMERA_MARGIN = 24;
// Room for the key and the band names at the top of the canvas.
const CAMERA_TOP = 40;
// Room for the step bar at the bottom of the canvas.
const CAMERA_BOTTOM = 56;
// Clears the sticky site header.
const SITE_HEADER = 72;
const BAND_LABEL_INSET = 10;
const BAND_LABEL_HEIGHT = 26;

type BandNodeType = Node<{ band: Band; active: boolean }, 'band'>;

const nodeTypes = { actor: ActorNode, band: BandNode };
const edgeTypes = { routed: RoutedEdge };

const STEP_NUMBERS: Record<string, number[]> = {};
FLOW.steps.forEach((step, index) => {
  for (const id of step.edges) (STEP_NUMBERS[id] ??= []).push(index + 1);
});

function cameraDuration(): number {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches ? 0 : 500;
}

function initialStep(): number {
  return parseStepHash(window.location.hash, STEP_COUNT) ?? 0;
}

// The boxes the camera frames and the band names avoid: active nodes and active edge labels.
function activeBoxes(layout: FlowLayout, step: Step): Box[] {
  return [
    ...step.actors.map((id) => ({ ...layout.nodes[id]!, width: NODE_WIDTH, height: NODE_HEIGHT })),
    ...step.edges.map((id) => layout.edges[id]!.label),
  ];
}

function BandNode({ data }: NodeProps<BandNodeType>) {
  const { band, active } = data;
  const style = BAND_STYLE[band.chain];
  return (
    <div
      className="pointer-events-none motion-safe:transition-[background-color,border-color] motion-safe:duration-200"
      style={{
        width: band.box.width,
        height: band.box.height,
        borderRadius: 12,
        background: style.fill[active ? 1 : 0],
        border: `2px solid ${style.border[active ? 1 : 0]}`,
      }}
    />
  );
}

interface BandLabelsProps {
  layout: FlowLayout;
  step: Step;
  viewport: Viewport;
  canvasRef: RefObject<HTMLDivElement | null>;
  barRef: RefObject<HTMLElement | null>;
}

// Same width estimate as the edge chips, at 13px, plus padding and the accent bar.
function bandLabelWidth(chain: Band['chain']): number {
  return Math.ceil(BAND_STYLE[chain].name.length * 0.55 * 13) + 34;
}

/**
 * Band names, outside the React Flow transform. Each sits at the top right of the visible part
 * of its band, below the site header and above the step bar, and moves below any active node or
 * edge label it would cover. It is hidden when the visible part of the band is too thin.
 */
function BandLabels({ layout, step, viewport, canvasRef, barRef }: BandLabelsProps) {
  const [, setScrollTick] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollTick((tick) => tick + 1);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const canvas = canvasRef.current;
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const toCanvas = (box: Box) => ({
    left: box.x * viewport.zoom + viewport.x,
    right: (box.x + box.width) * viewport.zoom + viewport.x,
    top: box.y * viewport.zoom + viewport.y,
    bottom: (box.y + box.height) * viewport.zoom + viewport.y,
  });
  const obstacles = activeBoxes(layout, step)
    .map(toCanvas)
    .sort((a, b) => a.top - b.top);
  const visibleTop = Math.max(0, SITE_HEADER - rect.top) + BAND_LABEL_INSET;
  const floor = Math.min(
    (barRef.current?.getBoundingClientRect().top ?? Infinity) - rect.top - 6,
    canvas.clientHeight,
    window.innerHeight - rect.top,
  );

  return layout.bands.map((band, index) => {
    const box = toCanvas(band.box);
    const x = Math.min(box.right, canvas.clientWidth) - BAND_LABEL_INSET;
    const width = bandLabelWidth(band.chain);
    let y = Math.max(box.top + BAND_LABEL_INSET, visibleTop);
    for (const obstacle of obstacles) {
      const overlaps =
        x - width < obstacle.right &&
        obstacle.left < x &&
        y < obstacle.bottom &&
        obstacle.top < y + BAND_LABEL_HEIGHT;
      if (overlaps) y = obstacle.bottom + 6;
    }
    if (y + BAND_LABEL_HEIGHT > Math.min(box.bottom - BAND_LABEL_INSET, floor)) return null;
    const style = BAND_STYLE[band.chain];
    return (
      <div
        key={`${band.chain}-${index}`}
        aria-hidden="true"
        className="pointer-events-none absolute z-10 flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[13px] font-semibold whitespace-nowrap"
        style={{
          left: x,
          top: y,
          transform: 'translateX(-100%)',
          background: BRAND.chip,
          color: BRAND.chipText,
          fontFamily: BRAND.font,
          opacity: band.chain === step.txChain ? 1 : 0.8,
        }}
      >
        <span style={{ width: 4, height: 14, borderRadius: 2, background: style.accent }} />
        {style.name}
      </div>
    );
  });
}

interface StepBarProps {
  index: number;
  started: boolean;
  barRef: RefObject<HTMLElement | null>;
  onGo: (index: number) => void;
  onShowAll: () => void;
}

// Sticky in normal flow: it sits at the canvas bottom, or at the screen bottom while the canvas
// bottom is below the fold.
function StepBar({ index, started, barRef, onGo, onShowAll }: StepBarProps) {
  return (
    <nav
      ref={barRef}
      aria-label="Transaction steps"
      className="sticky bottom-3 z-20 mx-auto mt-auto mb-3 flex items-center gap-2 rounded-lg p-1.5 text-sm"
      style={{
        background: BRAND.chip,
        color: BRAND.chipText,
        fontFamily: BRAND.font,
        border: `1px solid ${BRAND.connector}`,
      }}
    >
      <button
        type="button"
        className="rounded-md px-3 py-1 whitespace-nowrap disabled:opacity-40"
        style={{ border: `1px solid ${BRAND.connector}` }}
        disabled={index === 0}
        onClick={() => onGo(index - 1)}
      >
        ← Back
      </button>
      <span className="px-1 text-xs whitespace-nowrap">
        {started ? `Step ${index + 1} of ${STEP_COUNT}` : 'Press Next to start'}
      </span>
      <button
        type="button"
        className={`rounded-md px-3 py-1 font-semibold whitespace-nowrap disabled:opacity-40 ${started ? '' : 'motion-safe:animate-pulse'}`}
        style={{
          border: `1px solid ${BRAND.active}`,
          boxShadow: started ? 'none' : '0 0 0 3px rgba(18, 170, 255, 0.6)',
        }}
        disabled={index === STEP_COUNT - 1}
        onClick={() => onGo(index + 1)}
      >
        Next →
      </button>
      <button
        type="button"
        className="px-2 py-1 text-xs whitespace-nowrap underline"
        onClick={onShowAll}
      >
        Show all
      </button>
    </nav>
  );
}

export default function NitroTxFlow() {
  const [layout, setLayout] = useState<FlowLayout | null>(null);
  const [instance, setInstance] = useState<ReactFlowInstance<
    ActorNodeType | BandNodeType,
    RoutedEdgeType
  > | null>(null);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [index, setIndex] = useState(initialStep);
  // Start cue: shown on first load at step 1 until the reader moves once.
  const [started, setStarted] = useState(() => initialStep() > 0);
  const [narrow, setNarrow] = useState(() => window.matchMedia(NARROW_QUERY).matches);
  const canvasRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const hashStep = useRef(index);
  const step = FLOW.steps[index]!;

  useEffect(() => {
    void computeLayout(FLOW).then(setLayout);
  }, []);

  useEffect(() => {
    const query = window.matchMedia(NARROW_QUERY);
    const onChange = () => setNarrow(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // A hash that is not a step hash (a heading link) keeps the current step.
  useEffect(() => {
    const onHashChange = () => {
      const next = parseStepHash(window.location.hash, STEP_COUNT);
      if (next === null) return;
      setStarted(true);
      setIndex(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // On a step change only, so a heading hash on load stays in the URL. A ref of the last written
  // step, not a first-run flag, because Strict Mode runs the effect twice on mount.
  useEffect(() => {
    if (hashStep.current === index) return;
    hashStep.current = index;
    window.history.replaceState(null, '', stepHash(index));
  }, [index]);

  // The camera frames the active nodes and their edge labels at zoom <= 1.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!instance || !layout || !canvas) return;
    const boxes = activeBoxes(layout, step);
    const minX = Math.min(...boxes.map((box) => box.x));
    const minY = Math.min(...boxes.map((box) => box.y));
    const maxX = Math.max(...boxes.map((box) => box.x + box.width));
    const maxY = Math.max(...boxes.map((box) => box.y + box.height));
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const frameHeight = height - CAMERA_TOP - CAMERA_BOTTOM;
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
      { duration: cameraDuration() },
    );
  }, [instance, layout, step]);

  const showAll = () => void instance?.fitView({ padding: 0.08, duration: cameraDuration() });

  const goTo = (next: number) => {
    setStarted(true);
    setIndex(next);
    // Bring the whole canvas on screen, so the step bar does not cover the active step.
    const canvas = canvasRef.current;
    if (!canvas) return;
    const box = canvas.getBoundingClientRect();
    if (box.top < SITE_HEADER || box.bottom > window.innerHeight) {
      canvas.scrollIntoView({ block: 'start', behavior: cameraDuration() ? 'smooth' : 'auto' });
    }
  };

  const nodes = useMemo<(ActorNodeType | BandNodeType)[]>(() => {
    if (!layout) return [];
    const bands: BandNodeType[] = layout.bands.map((band, i) => ({
      id: `band-${band.chain}-${i}`,
      type: 'band',
      position: { x: band.box.x, y: band.box.y },
      data: { band, active: band.chain === step.txChain },
      draggable: false,
      connectable: false,
      selectable: false,
      zIndex: -1,
      style: { pointerEvents: 'none' },
    }));
    const actors: ActorNodeType[] = FLOW.actors.map((actor) => ({
      id: actor.id,
      type: 'actor',
      position: layout.nodes[actor.id]!,
      data: { actor, active: step.actors.includes(actor.id) },
      draggable: false,
      connectable: false,
    }));
    return [...bands, ...actors];
  }, [layout, step]);

  const edges = useMemo<RoutedEdgeType[]>(() => {
    if (!layout) return [];
    return FLOW.edges.map((edge) => {
      const active = step.edges.includes(edge.id);
      return {
        id: edge.id,
        type: 'routed',
        source: edge.source,
        target: edge.target,
        data: {
          label: edge.label,
          stepNumbers: STEP_NUMBERS[edge.id] ?? [],
          active,
          route: layout.edges[edge.id]!,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: active ? BRAND.active : BRAND.connector,
          width: 16,
          height: 16,
          markerUnits: 'userSpaceOnUse',
        },
        zIndex: active ? 1 : 0,
      };
    });
  }, [layout, step]);

  const stepLabel = `Step ${index + 1} of ${STEP_COUNT}: ${step.title}`;

  return (
    // overflow-clip, not overflow-hidden: hidden creates a scroll container and breaks the bar.
    <div className="not-prose my-6 overflow-clip rounded-lg border border-fd-border">
      <div
        ref={canvasRef}
        role="group"
        aria-roledescription="diagram"
        aria-label={`${FLOW.title}. ${stepLabel}`}
        className="relative flex h-[520px] w-full flex-col md:h-[720px]"
        style={{ background: BRAND.gradient, scrollMarginTop: SITE_HEADER }}
      >
        <Legend narrow={narrow} />
        {layout && (
          <BandLabels
            layout={layout}
            step={step}
            viewport={viewport}
            canvasRef={canvasRef}
            barRef={barRef}
          />
        )}
        {layout && (
          <div className="absolute inset-0">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onInit={(flow) => {
                setInstance(flow);
                setViewport(flow.getViewport());
              }}
              onMove={(_, next) => setViewport(next)}
              minZoom={0.3}
              panOnDrag={false}
              zoomOnScroll={false}
              zoomOnDoubleClick={false}
              preventScrolling={false}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
            />
          </div>
        )}
        <StepBar index={index} started={started} barRef={barRef} onGo={goTo} onShowAll={showAll} />
      </div>
      <div className="sr-only" aria-live="polite">
        {stepLabel}
      </div>
      <StepCard step={step} />
    </div>
  );
}
