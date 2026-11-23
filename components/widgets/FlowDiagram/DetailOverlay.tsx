'use client';

import * as Dialog from '@radix-ui/react-dialog';
import type { ReactFlowInstance } from '@xyflow/react';
import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';

import type { ActorNodeType } from './ActorNode.tsx';
import type { BandNodeType } from './BandNode.tsx';
import { FlowCanvas } from './FlowCanvas.tsx';
import type { RoutedEdgeType } from './RoutedEdge.tsx';
import { StepBar } from './StepBar.tsx';
import { StepCard } from './StepCard.tsx';
import { BRAND } from './brand.ts';
import { flowEdges, flowNodes } from './graph.ts';
import { stepNumbersByEdge } from './layout.ts';
import type { CardLabels, Flow } from './model.ts';
import { useFlowLayout } from './useFlowLayout.ts';
import { useStepCamera } from './useStepCamera.ts';
import { motionDuration } from './useStepNavigation.ts';

const FADE_MS = 500;

interface DetailOverlayProps {
  flow: Flow;
  // The card labels of the flow that opens this one.
  labels: CardLabels;
  // Runs after the fade-out, to unmount this view.
  onClose: () => void;
  // Next on the last sub-step. Runs as the fade-out starts, so the opening flow moves under it.
  onFinish: () => void;
}

// SPIKE: a second diagram in a dialog, with its own sub-steps. Full screen below 768px; a centered
// panel over a backdrop above.
export function DetailOverlay({ flow, labels, onClose, onFinish }: DetailOverlayProps) {
  const { layout } = useFlowLayout(flow);
  const [instance, setInstance] = useState<ReactFlowInstance<
    ActorNodeType | BandNodeType,
    RoutedEdgeType
  > | null>(null);
  const [index, setIndex] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const step = flow.steps[index]!;
  // A detail graph is small: keep every part in view and let the highlight show the sub-step.
  const showAll = useStepCamera(instance, layout, step, canvasRef, true);
  const stepNumbers = useMemo(() => stepNumbersByEdge(flow.steps), [flow]);
  // A detail flow has one path that uses every actor and edge, so nothing is muted.
  const actorIds = useMemo(() => new Set(flow.actors.map((actor) => actor.id)), [flow]);
  const edgeIds = useMemo(() => new Set(flow.edges.map((edge) => edge.id)), [flow]);
  const nodes = useMemo(
    () => (layout ? flowNodes(flow, layout, step, actorIds) : []),
    [flow, layout, step, actorIds],
  );
  const edges = useMemo(
    () => (layout ? flowEdges(flow, layout, step, stepNumbers, edgeIds) : []),
    [flow, layout, step, stepNumbers, edgeIds],
  );
  const goTo = (next: number) => setIndex(Math.min(Math.max(next, 0), flow.steps.length - 1));

  // Every close fades out first; `onClose` runs when the fade ends and unmounts this view.
  const [fadeMs] = useState(() => (motionDuration() ? FADE_MS : 0));
  const [closing, setClosing] = useState(false);
  const finish = () => {
    onFinish();
    setClosing(true);
  };

  // An effect event, so a parent render during the fade does not restart the timer.
  const closed = useEffectEvent(() => onClose());
  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(closed, fadeMs);
    return () => clearTimeout(timer);
  }, [closing, fadeMs]);

  // Read during the first render: Radix moves focus into the dialog before any effect here runs.
  const [opener] = useState(() => document.activeElement as HTMLElement | null);
  useEffect(() => () => opener?.focus(), [opener]);

  // Radix traps Tab, hides the rest of the page from assistive technology, and reports Escape and
  // a press on the backdrop as a close. The dialog stays open in Radix until the fade-out ends.
  return (
    <Dialog.Root open onOpenChange={(open) => !open && setClosing(true)}>
      <Dialog.Portal>
        {/* `starting:` fades in from the first frame; `inert` while closing ignores clicks and keys. */}
        <Dialog.Overlay
          className={[
            'fixed inset-0 z-[1000] flex items-center justify-center md:bg-black/60 md:p-6',
            'transition-opacity ease-out starting:opacity-0',
            closing ? 'opacity-0' : 'opacity-100',
          ].join(' ')}
          style={{ transitionDuration: `${fadeMs}ms` }}
          inert={closing}
        >
          <Dialog.Content
            aria-describedby={undefined}
            className={[
              'flex h-full w-full flex-col overflow-y-auto bg-fd-background',
              'md:h-auto md:max-h-[92vh] md:w-[min(900px,94vw)] md:rounded-lg md:border md:border-fd-border',
            ].join(' ')}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              closeRef.current?.focus();
            }}
            // Without a Radix trigger, its own close focus lands on the body; the effect above
            // returns focus to the opener instead.
            onCloseAutoFocus={(event) => event.preventDefault()}
            // React events bubble through the portal to the opening widget, which would step too.
            onKeyDown={(event) => {
              if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
              event.stopPropagation();
              if (event.key === 'ArrowLeft') goTo(index - 1);
              else if (index === flow.steps.length - 1) finish();
              else goTo(index + 1);
            }}
          >
            <div className="flex items-center justify-between border-b border-fd-border px-4 py-2">
              <Dialog.Title className="text-base font-semibold">{flow.title}</Dialog.Title>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setClosing(true)}
                className="rounded-md border border-fd-border px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>
            <div
              ref={canvasRef}
              className="relative flex h-[600px] w-full shrink-0 flex-col md:h-[720px]"
              style={{ background: BRAND.gradient }}
            >
              {layout && (
                <FlowCanvas nodes={nodes} edges={edges} onInit={setInstance} onMove={() => {}} />
              )}
              <StepBar
                index={index}
                count={flow.steps.length}
                started
                barRef={barRef}
                onGo={goTo}
                onShowAll={showAll}
                onFinish={finish}
              />
            </div>
            <StepCard step={step} labels={labels} />
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
