'use client';

import { ReactFlow, type ReactFlowInstance, type Viewport } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';

import { ActorNode, type ActorNodeType } from './ActorNode.tsx';
import { BandLabels } from './BandLabels.tsx';
import { BandNode, type BandNodeType } from './BandNode.tsx';
import { Legend } from './Legend.tsx';
import { RoutedEdge, type RoutedEdgeType } from './RoutedEdge.tsx';
import { StepBar } from './StepBar.tsx';
import { StepCard } from './StepCard.tsx';
import { BRAND } from './brand.ts';
import { flowEdges, flowNodes } from './graph.ts';
import { stepNumbersByEdge } from './layout.ts';
import { transactionLifecycle } from './model.ts';
import { useFlowLayout } from './useFlowLayout.ts';
import { useStepCamera } from './useStepCamera.ts';
import { SITE_HEADER, useStepNavigation } from './useStepNavigation.ts';

const FLOW = transactionLifecycle;
const STEP_COUNT = FLOW.steps.length;
const STEP_NUMBERS = stepNumbersByEdge(FLOW);
const NARROW_QUERY = '(max-width: 767px)';

const nodeTypes = { actor: ActorNode, band: BandNode };
const edgeTypes = { routed: RoutedEdge };

export default function NitroTxFlow() {
  const { layout, failed } = useFlowLayout(FLOW);
  const [instance, setInstance] = useState<ReactFlowInstance<
    ActorNodeType | BandNodeType,
    RoutedEdgeType
  > | null>(null);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [narrow, setNarrow] = useState(() => window.matchMedia(NARROW_QUERY).matches);
  const canvasRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const { index, started, goTo } = useStepNavigation(STEP_COUNT, canvasRef);
  const step = FLOW.steps[index]!;
  const showAll = useStepCamera(instance, layout, step, canvasRef);

  useEffect(() => {
    const query = window.matchMedia(NARROW_QUERY);
    const onChange = () => setNarrow(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const nodes = useMemo(() => (layout ? flowNodes(FLOW, layout, step) : []), [layout, step]);
  const edges = useMemo(
    () => (layout ? flowEdges(FLOW, layout, step, STEP_NUMBERS) : []),
    [layout, step],
  );
  const stepLabel = `Step ${index + 1} of ${STEP_COUNT}: ${step.title}`;
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight' && index < STEP_COUNT - 1) goTo(index + 1);
    if (event.key === 'ArrowLeft' && index > 0) goTo(index - 1);
  };

  return (
    // overflow-clip, not overflow-hidden: hidden creates a scroll container and breaks the bar.
    // Focusable root, so ArrowLeft and ArrowRight step only while focus is inside the widget.
    <div
      role="region"
      aria-label={`${FLOW.title} diagram`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="not-prose my-6 overflow-clip rounded-lg border border-fd-border"
    >
      <div
        ref={canvasRef}
        role="group"
        aria-roledescription="diagram"
        aria-label={`${FLOW.title}. ${stepLabel}`}
        className="relative flex h-[520px] w-full flex-col md:h-[720px]"
        style={{ background: BRAND.gradient, scrollMarginTop: SITE_HEADER }}
      >
        <Legend narrow={narrow} />
        {failed && (
          <p className="m-auto px-4 text-center" style={{ color: BRAND.chipText }}>
            The diagram could not be drawn.
          </p>
        )}
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
          // React Flow sets `touch-action: none` on its pane, which stops a one-finger swipe from
          // scrolling the page. `!` because the utility layer loses to the unlayered React Flow CSS.
          <div className="absolute inset-0 [&_.react-flow\_\_pane]:touch-manipulation!">
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
              // At the bottom right, the step bar covers it on phones.
              attributionPosition="top-right"
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
        <StepBar
          index={index}
          count={STEP_COUNT}
          started={started}
          barRef={barRef}
          onGo={goTo}
          onShowAll={showAll}
        />
      </div>
      <div className="sr-only" aria-live="polite">
        {stepLabel}
      </div>
      <StepCard step={step} />
    </div>
  );
}
