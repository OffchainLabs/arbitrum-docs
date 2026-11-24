import type { RefObject } from 'react';

import { THEME } from './flows.ts';

// THEME.focus, not the site focus ring, which has too little contrast on THEME.chip.
const FOCUS = 'focus-visible:outline-(--flow-focus)';

interface StepBarProps {
  index: number;
  count: number;
  started: boolean;
  barRef: RefObject<HTMLElement | null>;
  onGo: (index: number) => void;
  onShowAll: () => void;
  // When set, Next stays active on the last step and calls this instead of stepping.
  onFinish?: () => void;
}

// Sticky in normal flow: it sits at the canvas bottom, or at the screen bottom while the canvas
// bottom is below the fold. Back and Next use aria-disabled, not disabled, so keyboard focus stays
// on them at the first and last step. Below 768px the spacing shrinks, so the bar fits a phone
// screen.
export function StepBar({
  index,
  count,
  started,
  barRef,
  onGo,
  onShowAll,
  onFinish,
}: StepBarProps) {
  const atEnd = index === count - 1;
  return (
    <nav
      ref={barRef}
      aria-label="Transaction steps"
      className={[
        'sticky bottom-3 z-20 mx-auto mt-auto mb-3 flex items-center gap-1 rounded-lg p-1.5',
        'text-sm md:gap-2',
      ].join(' ')}
      style={{
        background: THEME.chip,
        color: THEME.ink,
        fontFamily: THEME.font,
        border: `1px solid ${THEME.connector}`,
      }}
    >
      <button
        type="button"
        className={[
          'rounded-md px-2 py-1 whitespace-nowrap aria-disabled:opacity-40 md:px-3',
          FOCUS,
        ].join(' ')}
        style={{ border: `1px solid ${THEME.connector}` }}
        aria-disabled={index === 0}
        onClick={() => onGo(index - 1)}
      >
        ← Back
      </button>
      <span className="text-xs whitespace-nowrap md:px-1">
        {started ? `Step ${index + 1} of ${count}` : 'Press Next to start'}
      </span>
      <button
        type="button"
        className={[
          'rounded-md px-2 py-1 font-semibold whitespace-nowrap aria-disabled:opacity-40 md:px-3',
          FOCUS,
          started ? '' : 'motion-safe:animate-pulse',
        ].join(' ')}
        style={{
          border: `1px solid ${THEME.active}`,
          boxShadow: started ? 'none' : THEME.startGlow,
        }}
        data-step-next=""
        aria-disabled={atEnd && !onFinish}
        onClick={() => (atEnd && onFinish ? onFinish() : onGo(index + 1))}
      >
        Next →
      </button>
      <button
        type="button"
        className={`px-1 py-1 text-xs whitespace-nowrap underline md:px-2 ${FOCUS}`}
        onClick={onShowAll}
      >
        Show all
      </button>
    </nav>
  );
}
