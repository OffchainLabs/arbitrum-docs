'use client';

import type { ReactFlowInstance, Viewport } from '@xyflow/react';
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';

import type { ActorNodeType } from './ActorNode.tsx';
import { BandLabels } from './BandLabels.tsx';
import type { BandNodeType } from './BandNode.tsx';
import { DetailOverlay } from './DetailOverlay.tsx';
import { FlowCanvas } from './FlowCanvas.tsx';
import { Legend } from './Legend.tsx';
import { PathTabs } from './PathTabs.tsx';
import type { RoutedEdgeType } from './RoutedEdge.tsx';
import { StepBar } from './StepBar.tsx';
import { StepCard } from './StepCard.tsx';
import { BRAND } from './brand.ts';
import { FLOWS, type FlowId } from './flows.ts';
import { flowEdges, flowNodes } from './graph.ts';
import { stepNumbersByEdge } from './layout.ts';
import { type Flow, OPERATOR_CARD, type ResolvedPath, flowPaths } from './model.ts';
import type { PathCount } from './navigation.ts';
import { useFlowLayout } from './useFlowLayout.ts';
import { useStepCamera } from './useStepCamera.ts';
import { SITE_HEADER, useStepNavigation } from './useStepNavigation.ts';

const NARROW_QUERY = '(max-width: 767px)';

interface PathView {
  path: ResolvedPath;
  stepNumbers: Record<string, number[]>;
  actors: Set<string>;
  edges: Set<string>;
}

interface FlowView {
  flow: Flow;
  // Stable per flow: `useStepNavigation` takes it as an effect dependency.
  counts: PathCount[];
  paths: PathView[];
}

function flowView(flow: Flow): FlowView {
  const paths = flowPaths(flow).map((path) => ({
    path,
    stepNumbers: stepNumbersByEdge(path.steps),
    actors: new Set(path.steps.flatMap((step) => step.actors)),
    edges: new Set(path.steps.flatMap((step) => step.edges)),
  }));
  return {
    flow,
    counts: paths.map(({ path }) => ({ id: path.id, stepCount: path.steps.length })),
    paths,
  };
}

const VIEWS = Object.fromEntries(
  Object.entries(FLOWS).map(([id, flow]) => [id, flowView(flow)]),
) as Record<FlowId, FlowView>;

/** A registered flow on one canvas. The layout runs once per flow, so tabs do not move nodes. */
export default function TxFlowDiagram({ flowId }: { flowId: FlowId }) {
  const { flow, counts, paths } = VIEWS[flowId];
  const { layout, failed } = useFlowLayout(flow);
  const [instance, setInstance] = useState<ReactFlowInstance<
    ActorNodeType | BandNodeType,
    RoutedEdgeType
  > | null>(null);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [narrow, setNarrow] = useState(() => window.matchMedia(NARROW_QUERY).matches);
  const canvasRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const { path, index, started, goTo, selectPath } = useStepNavigation(counts, canvasRef);
  const current = paths[path]!;
  const stepCount = current.path.steps.length;
  const step = current.path.steps[index]!;
  const showAll = useStepCamera(instance, layout, step, canvasRef);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSeen, setDetailSeen] = useState(false);
  const trigger = useMemo(
    () => ({
      label: `Look inside the ${flow.actors.find((a) => a.id === step.detail?.actor)?.label}`,
      blink: !detailSeen,
      onOpen: () => {
        setDetailSeen(true);
        setDetailOpen(true);
      },
    }),
    [flow, step, detailSeen],
  );

  useEffect(() => {
    const query = window.matchMedia(NARROW_QUERY);
    const onChange = () => setNarrow(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const nodes = useMemo(
    () => (layout ? flowNodes(flow, layout, step, current.actors, trigger) : []),
    [flow, layout, step, current, trigger],
  );
  const edges = useMemo(
    () => (layout ? flowEdges(flow, layout, step, current.stepNumbers, current.edges) : []),
    [flow, layout, step, current],
  );
  const labels = flow.card ?? OPERATOR_CARD;
  const stepLabel = `Step ${index + 1} of ${stepCount}: ${step.title}`;
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') goTo(index + 1);
    if (event.key === 'ArrowLeft') goTo(index - 1);
  };

  return (
    // overflow-clip, not overflow-hidden: hidden creates a scroll container and breaks the bar.
    // Focusable root, so ArrowLeft and ArrowRight step only while focus is inside the widget.
    <div
      role="region"
      aria-label={`${flow.title} diagram`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="not-prose my-6 overflow-clip rounded-lg border border-fd-border"
    >
      <PathTabs
        paths={paths.map((view) => view.path)}
        selected={path}
        onSelect={(next) => {
          if (next !== path) selectPath(next);
        }}
      />
      <div
        ref={canvasRef}
        role="group"
        aria-roledescription="diagram"
        aria-label={`${flow.title}. ${stepLabel}`}
        className="relative flex h-[520px] w-full flex-col md:h-[720px]"
        style={{ background: BRAND.gradient, scrollMarginTop: SITE_HEADER }}
      >
        <Legend flow={flow} narrow={narrow} />
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
            onInit={(reactFlow) => {
              setInstance(reactFlow);
              setViewport(reactFlow.getViewport());
            }}
            onMove={setViewport}
          />
        )}
        <StepBar
          index={index}
          count={stepCount}
          started={started}
          barRef={barRef}
          onGo={goTo}
          onShowAll={showAll}
        />
      </div>
      <div className="sr-only" aria-live="polite">
        {stepLabel}
      </div>
      <StepCard step={step} labels={labels} />
      {detailOpen && step.detail && (
        <DetailOverlay
          flow={step.detail.flow}
          labels={labels}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </div>
  );
}
