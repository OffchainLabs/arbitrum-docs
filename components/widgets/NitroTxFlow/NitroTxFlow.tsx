'use client';

import type { ReactFlowInstance, Viewport } from '@xyflow/react';
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';

import type { ActorNodeType } from './ActorNode.tsx';
import { BandLabels } from './BandLabels.tsx';
import type { BandNodeType } from './BandNode.tsx';
import { FlowCanvas } from './FlowCanvas.tsx';
import { Legend } from './Legend.tsx';
import type { RoutedEdgeType } from './RoutedEdge.tsx';
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
    if (event.key === 'ArrowRight') goTo(index + 1);
    if (event.key === 'ArrowLeft') goTo(index - 1);
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
          <FlowCanvas
            nodes={nodes}
            edges={edges}
            onInit={(flow) => {
              setInstance(flow);
              setViewport(flow.getViewport());
            }}
            onMove={setViewport}
          />
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
