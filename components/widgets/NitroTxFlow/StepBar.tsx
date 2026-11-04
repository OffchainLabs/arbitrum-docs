import type { RefObject } from 'react';

import { BRAND } from './brand.ts';

interface StepBarProps {
  index: number;
  count: number;
  started: boolean;
  barRef: RefObject<HTMLElement | null>;
  onGo: (index: number) => void;
  onShowAll: () => void;
}

// Sticky in normal flow: it sits at the canvas bottom, or at the screen bottom while the canvas
// bottom is below the fold. Back and Next use aria-disabled, not disabled, so keyboard focus stays
// on them at the first and last step. Below 768px the spacing shrinks, so the bar fits a phone
// screen.
export function StepBar({ index, count, started, barRef, onGo, onShowAll }: StepBarProps) {
  return (
    <nav
      ref={barRef}
      aria-label="Transaction steps"
      className="sticky bottom-3 z-20 mx-auto mt-auto mb-3 flex items-center gap-1 rounded-lg p-1.5 text-sm md:gap-2"
      style={{
        background: BRAND.chip,
        color: BRAND.chipText,
        fontFamily: BRAND.font,
        border: `1px solid ${BRAND.connector}`,
      }}
    >
      <button
        type="button"
        className="rounded-md px-2 py-1 whitespace-nowrap aria-disabled:opacity-40 md:px-3"
        style={{ border: `1px solid ${BRAND.connector}` }}
        aria-disabled={index === 0}
        onClick={() => index > 0 && onGo(index - 1)}
      >
        ← Back
      </button>
      <span className="text-xs whitespace-nowrap md:px-1">
        {started ? `Step ${index + 1} of ${count}` : 'Press Next to start'}
      </span>
      <button
        type="button"
        className={`rounded-md px-2 py-1 font-semibold whitespace-nowrap aria-disabled:opacity-40 md:px-3 ${started ? '' : 'motion-safe:animate-pulse'}`}
        style={{
          border: `1px solid ${BRAND.active}`,
          boxShadow: started ? 'none' : '0 0 0 3px rgba(18, 170, 255, 0.6)',
        }}
        aria-disabled={index === count - 1}
        onClick={() => index < count - 1 && onGo(index + 1)}
      >
        Next →
      </button>
      <button
        type="button"
        className="px-1 py-1 text-xs whitespace-nowrap underline md:px-2"
        onClick={onShowAll}
      >
        Show all
      </button>
    </nav>
  );
}
