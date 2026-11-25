'use client';

import type { ReactFlowInstance } from '@xyflow/react';
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';

import type { ActorNodeType } from './ActorNode.tsx';
import type { BandNodeType } from './BandNode.tsx';
import { DetailOverlay } from './DetailOverlay.tsx';
import { FlowCanvas } from './FlowCanvas.tsx';
import { Legend } from './Legend.tsx';
import { PathTabs, panelId, tabId } from './PathTabs.tsx';
import type { RoutedEdgeType } from './RoutedEdge.tsx';
import { Key, StepBar } from './StepBar.tsx';
import { StepCard } from './StepCard.tsx';
import { CANVAS_STYLE, FLOWS, type FlowId, PROJECT, THEME } from './flows.ts';
import { flowEdges, flowNodes } from './graph.ts';
import { stepNumbersByEdge } from './layout.ts';
import { type Flow, type ResolvedPath, type StepDetail, flowPaths } from './model.ts';
import type { PathCount } from './navigation.ts';
import { useDockPosition } from './useDockPosition.ts';
import { useFlowLayouts } from './useFlowLayouts.ts';
import { useStepCamera } from './useStepCamera.ts';
import {
  SITE_HEADER,
  motionDuration,
  siteHeaderPx,
  useStepNavigation,
} from './useStepNavigation.ts';

const NARROW_QUERY = '(max-width: 767px)';
const ESC_HINT_MS = 3000;
// The canvas height in the page: this, or the screen less the site header when that is smaller,
// so the canvas and its docked caption fit the screen together. Never below CANVAS_MIN.
const CANVAS_NARROW = 680;
const CANVAS_WIDE = 720;
const CANVAS_MIN = 480;

interface PathView {
  path: ResolvedPath;
  stepNumbers: Record<string, number[]>;
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

/** A registered flow on one canvas, with one layout per path. A tab shows only its own parts. */
export default function FlowDiagramView({ flowId }: { flowId: FlowId }) {
  const { flow, counts, paths } = VIEWS[flowId];
  const { layouts, failed } = useFlowLayouts(flow);
  const [instance, setInstance] = useState<ReactFlowInstance<
    ActorNodeType | BandNodeType,
    RoutedEdgeType
  > | null>(null);
  const [narrow, setNarrow] = useState(() => window.matchMedia(NARROW_QUERY).matches);
  const canvasRef = useRef<HTMLDivElement>(null);
  // The step dock: the caption and the step bar.
  const barRef = useRef<HTMLDivElement>(null);
  const [fullScreen, setFullScreen] = useState(false);
  // The Escape hint shows for a few seconds after each entry to full screen, then fades.
  const [escHint, setEscHint] = useState(false);
  const { path, index, started, goTo, selectPath } = useStepNavigation(
    counts,
    canvasRef,
    !fullScreen,
  );
  const current = paths[path]!;
  const stepCount = current.path.steps.length;
  const step = current.path.steps[index]!;
  const layout = layouts?.[path] ?? null;
  const dock = useDockPosition(canvasRef, barRef);
  const dockMoved = dock.offset !== null;
  const { showAll, overview, grownHeight, showStep } = useStepCamera(
    instance,
    layout,
    step,
    canvasRef,
    { narrow, dockRef: barRef, dockMoved, growOverview: true },
  );
  // From 768px the content column is too narrow for the whole graph, so Show all also enters
  // full screen, where the graph has the screen width. Leaving full screen then ends Show all.
  const showAllInFullScreen = useRef(false);
  const showAllWide = () => {
    if (!narrow && !fullScreen) {
      showAllInFullScreen.current = true;
      dock.reset();
      setFullScreen(true);
    }
    showAll();
  };
  useEffect(() => {
    if (fullScreen || !showAllInFullScreen.current) return;
    showAllInFullScreen.current = false;
    showStep();
  }, [fullScreen, showStep]);
  const backToStep = () => {
    if (showAllInFullScreen.current) {
      setFullScreen(false);
      return;
    }
    showStep();
    // The canvas shrinks back from the grown overview: bring its top into view when it went off
    // screen while the reader scrolled down the whole graph.
    const canvas = canvasRef.current;
    if (!fullScreen && canvas && canvas.getBoundingClientRect().top < siteHeaderPx(canvas)) {
      canvas.scrollIntoView({ block: 'start', behavior: motionDuration() ? 'smooth' : 'auto' });
    }
  };
  // The open detail, kept apart from `step`: it stays mounted while it fades out over the next step.
  const [openDetail, setOpenDetail] = useState<StepDetail | null>(null);
  const [detailSeen, setDetailSeen] = useState(false);
  const finishedDetail = useRef(false);
  const trigger = useMemo(
    () => ({
      label: `Look inside the ${flow.actors.find((a) => a.id === step.detail?.actor)?.label}`,
      blink: !detailSeen,
      onOpen: () => {
        setDetailSeen(true);
        setOpenDetail(step.detail ?? null);
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

  // Full screen fixes the root over the page. The page behind stops scrolling, and leaving
  // restores its position, which moved when the root left the page flow. The scrollbar gutter
  // that app/global.css keeps goes too, or it shows as a strip beside the fixed root.
  useEffect(() => {
    if (!fullScreen) return;
    const root = document.documentElement;
    const scrollY = window.scrollY;
    const { overflow, scrollbarGutter } = root.style;
    root.style.overflow = 'hidden';
    root.style.scrollbarGutter = 'auto';
    return () => {
      root.style.overflow = overflow;
      root.style.scrollbarGutter = scrollbarGutter;
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    };
  }, [fullScreen]);

  useEffect(() => {
    if (!fullScreen) return;
    setEscHint(true);
    const timer = window.setTimeout(() => setEscHint(false), ESC_HINT_MS);
    return () => window.clearTimeout(timer);
  }, [fullScreen]);

  // Escape leaves full screen, from anywhere on the page. Not while the detail dialog is open:
  // there Escape closes only the dialog.
  useEffect(() => {
    if (!fullScreen || openDetail) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setFullScreen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [fullScreen, openDetail]);

  // After Next closes the detail view, focus Next here. The overlay's cleanup runs first and
  // focuses the node that opened it, which is no longer a button on the next step.
  useEffect(() => {
    if (openDetail || !finishedDetail.current) return;
    finishedDetail.current = false;
    barRef.current?.querySelector<HTMLElement>('[data-step-next]')?.focus();
  }, [openDetail]);

  const nodes = useMemo(
    () => (layout ? flowNodes(flow, layout, step, trigger, index + 1) : []),
    [flow, layout, step, trigger, index],
  );
  const edges = useMemo(
    () => (layout ? flowEdges(flow, layout, step, current.stepNumbers) : []),
    [flow, layout, step, current],
  );
  const labels = flow.card ?? PROJECT.card;
  // The path's finality levels in step order, and the last one reached by this step.
  const track = useMemo(() => {
    const finalities = current.path.steps.flatMap((each) => (each.finality ? [each.finality] : []));
    const levels = [...new Set(finalities)];
    if (levels.length === 0) return undefined;
    const reachedSoFar = current.path.steps
      .slice(0, index + 1)
      .flatMap((each) => (each.finality ? [each.finality] : []));
    const last = reachedSoFar.at(-1);
    return { levels, reached: last === undefined ? -1 : levels.indexOf(last) };
  }, [current, index]);
  const stepLabel = `Step ${index + 1} of ${stepCount}: ${step.title}`;
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') goTo(index + 1);
    if (event.key === 'ArrowLeft') goTo(index - 1);
  };

  const baseHeight = `max(${CANVAS_MIN}px, min(${narrow ? CANVAS_NARROW : CANVAS_WIDE}px, calc(100svh - ${SITE_HEADER})))`;
  // Show all grows the canvas, never shrinks it, so the whole graph reads at zoom 1.
  const canvasHeight = grownHeight ? `max(${baseHeight}, ${grownHeight}px)` : baseHeight;
  const canvas = (
    <div
      ref={canvasRef}
      role="group"
      aria-roledescription="diagram"
      aria-label={`${flow.title}. ${stepLabel}`}
      className={['relative flex w-full flex-col', fullScreen ? 'min-h-0 min-w-0 flex-1' : ''].join(
        ' ',
      )}
      style={{
        ...CANVAS_STYLE,
        height: fullScreen ? undefined : canvasHeight,
        // In full screen the grown canvas overflows the screen, and the body scrolls.
        minHeight: fullScreen && grownHeight ? grownHeight : undefined,
        // No site header shows above a full screen canvas, and goTo reads this margin as its
        // height.
        scrollMarginTop: fullScreen ? 0 : SITE_HEADER,
      }}
    >
      <Legend flow={flow} narrow={narrow} />
      {fullScreen && (
        // Top center under the key strip, where browsers show their own full screen exit hint.
        // Not below 768px, where readers have no Escape key. A status, so a screen reader
        // announces it once.
        <div
          role="status"
          className={[
            'pointer-events-none absolute top-14 left-1/2 z-30 hidden -translate-x-1/2 md:flex',
            'items-center gap-1 rounded-md px-3 py-1.5 text-sm whitespace-nowrap',
            'transition-opacity duration-500 starting:opacity-0 motion-reduce:transition-none',
            escHint ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          style={{
            background: THEME.chip,
            color: THEME.ink,
            fontFamily: THEME.font,
            border: `1px solid ${THEME.connector}`,
          }}
        >
          Press <Key>Esc</Key> to exit full screen
        </div>
      )}
      {failed && (
        <p className="m-auto px-4 text-center" style={{ color: THEME.ink }}>
          The diagram could not be drawn.
        </p>
      )}
      {layout && <FlowCanvas nodes={nodes} edges={edges} onInit={setInstance} panX={narrow} />}
      {/* The step dock. Sticky in normal flow: it sits at the canvas bottom, or at the screen
          bottom while the canvas bottom is below the fold, so the step's caption stays on
          screen with Next. Below 768px it spans the canvas, so the step bar fits a phone. The
          reader can drag it by its grip to uncover the graph: it is then absolute at the
          dragged spot, and `data-moved` tells the camera. */}
      <div
        ref={barRef}
        data-step-dock=""
        data-moved={dockMoved ? '' : undefined}
        className={[
          'z-20 flex w-full max-w-2xl flex-col px-1.5 pb-1.5',
          'md:w-[calc(100%-24px)] md:rounded-lg',
          dockMoved ? 'absolute rounded-lg' : 'sticky bottom-0 mx-auto mt-auto md:bottom-3 md:mb-3',
        ].join(' ')}
        style={{
          background: THEME.chip,
          color: THEME.ink,
          fontFamily: THEME.font,
          left: dock.offset?.x,
          top: dock.offset?.y,
          // Docked and edge to edge below 768px: a top border only.
          borderTop: `1px solid ${THEME.connector}`,
          borderInline: narrow && !dockMoved ? 'none' : `1px solid ${THEME.connector}`,
          borderBottom: narrow && !dockMoved ? 'none' : `1px solid ${THEME.connector}`,
        }}
      >
        {/* The step bar comes first in the DOM, the grip and the caption above it only on screen:
            Tab from the widget reaches Back and Next at once, and a screen reader that presses
            Next and reads on hears the new caption. */}
        <StepBar
          index={index}
          count={stepCount}
          started={started}
          docked
          onGo={goTo}
          onShowAll={showAllWide}
          onShowStep={overview ? backToStep : undefined}
          fullScreen={fullScreen}
          onToggleFullScreen={() => {
            dock.reset();
            setFullScreen((on) => !on);
          }}
        />
        {/* Show all leaves the step bar alone in the dock, so the dock covers less of the graph. */}
        {!overview && (
          <>
            {/* touch-none: a drag on the grip moves the dock, not the page. */}
            <button
              type="button"
              aria-label="Move the step caption"
              aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight Home"
              title="Drag to move. Double-click to put it back."
              className={[
                'order-first flex h-4 w-full shrink-0 items-center justify-center',
                'cursor-grab touch-none active:cursor-grabbing focus-visible:outline-(--flow-focus)',
              ].join(' ')}
              {...dock.gripProps}
            >
              <span
                aria-hidden="true"
                className="h-1 w-10 rounded-full"
                style={{ background: THEME.connector }}
              />
            </button>
            {/* The caption scrolls inside a capped height, so it never takes over the canvas. */}
            <div
              className={[
                '-order-1 overflow-y-auto',
                fullScreen ? 'max-h-[35dvh]' : 'max-h-[160px] md:max-h-[240px]',
              ].join(' ')}
            >
              <StepCard step={step} labels={labels} caption track={track} />
            </div>
          </>
        )}
      </div>
    </div>
  );

  const body = (
    <>
      {canvas}
      <div className="sr-only" aria-live="polite">
        {stepLabel}
      </div>
    </>
  );

  // In full screen the canvas fills the space under the tabs, and scrolls when Show all grows it.
  // The dock sticks to the bottom of this scroll area.
  const bodyClass = fullScreen ? 'flex min-h-0 flex-1 flex-col overflow-y-auto' : undefined;

  return (
    // overflow-clip, not overflow-hidden: hidden creates a scroll container and breaks the bar.
    // Focusable root, so ArrowLeft and ArrowRight step only while focus is inside the widget.
    <div
      role="region"
      aria-label={`${flow.title} diagram`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={[
        'group/flow not-prose overflow-clip',
        // z-[999]: above the site header, below the detail dialog at z-[1000].
        fullScreen
          ? 'fixed inset-0 z-[999] flex flex-col bg-fd-background'
          : 'my-6 rounded-lg border border-fd-border',
      ].join(' ')}
    >
      <PathTabs
        flowId={flow.id}
        paths={paths.map((view) => view.path)}
        selected={path}
        onSelect={(next) => {
          if (next !== path) selectPath(next);
        }}
      />
      {paths.length > 1 ? (
        <div
          role="tabpanel"
          id={panelId(flow.id)}
          aria-labelledby={tabId(flow.id, paths[path]!.path.id)}
          className={bodyClass}
        >
          {body}
        </div>
      ) : fullScreen ? (
        <div className={bodyClass}>{body}</div>
      ) : (
        body
      )}
      {openDetail && (
        <DetailOverlay
          flow={openDetail.flow}
          labels={labels}
          anchorRef={canvasRef}
          onClose={() => setOpenDetail(null)}
          onFinish={() => {
            finishedDetail.current = true;
            const next = openDetail.next;
            goTo(next ? current.path.steps.findIndex((other) => other.id === next) : index + 1);
          }}
        />
      )}
    </div>
  );
}
