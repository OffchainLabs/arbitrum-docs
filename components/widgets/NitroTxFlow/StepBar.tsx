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
// bottom is below the fold.
export function StepBar({ index, count, started, barRef, onGo, onShowAll }: StepBarProps) {
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
        {started ? `Step ${index + 1} of ${count}` : 'Press Next to start'}
      </span>
      <button
        type="button"
        className={`rounded-md px-3 py-1 font-semibold whitespace-nowrap disabled:opacity-40 ${started ? '' : 'motion-safe:animate-pulse'}`}
        style={{
          border: `1px solid ${BRAND.active}`,
          boxShadow: started ? 'none' : '0 0 0 3px rgba(18, 170, 255, 0.6)',
        }}
        disabled={index === count - 1}
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
