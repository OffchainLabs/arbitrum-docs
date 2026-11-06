'use client';

import type { ReactFlowInstance } from '@xyflow/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { ActorNodeType } from './ActorNode.tsx';
import type { BandNodeType } from './BandNode.tsx';
import { FlowCanvas } from './FlowCanvas.tsx';
import type { RoutedEdgeType } from './RoutedEdge.tsx';
import { StepBar } from './StepBar.tsx';
import { StepCard } from './StepCard.tsx';
import { BRAND } from './brand.ts';
import { flowEdges, flowNodes } from './graph.ts';
import { stepNumbersByEdge } from './layout.ts';
import type { Flow } from './model.ts';
import { useFlowLayout } from './useFlowLayout.ts';
import { useStepCamera } from './useStepCamera.ts';

interface DetailOverlayProps {
  flow: Flow;
  onClose: () => void;
}

// SPIKE: a second diagram in a dialog, with its own sub-steps. Full screen below 768px; a centered
// panel over a backdrop above.
export function DetailOverlay({ flow, onClose }: DetailOverlayProps) {
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
  const stepNumbers = useMemo(() => stepNumbersByEdge(flow), [flow]);
  const nodes = useMemo(() => (layout ? flowNodes(flow, layout, step) : []), [flow, layout, step]);
  const edges = useMemo(
    () => (layout ? flowEdges(flow, layout, step, stepNumbers) : []),
    [flow, layout, step, stepNumbers],
  );
  const goTo = (next: number) => setIndex(Math.min(Math.max(next, 0), flow.steps.length - 1));

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      opener?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center md:bg-black/60 md:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={flow.title}
        className={[
          'flex h-full w-full flex-col overflow-y-auto bg-fd-background',
          'md:h-auto md:max-h-[92vh] md:w-[min(900px,94vw)] md:rounded-lg md:border md:border-fd-border',
        ].join(' ')}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') goTo(index + 1);
          if (event.key === 'ArrowLeft') goTo(index - 1);
        }}
      >
        <div className="flex items-center justify-between border-b border-fd-border px-4 py-2">
          <h2 className="text-base font-semibold">{flow.title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
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
          />
        </div>
        <StepCard step={step} />
      </div>
    </div>,
    document.body,
  );
}
