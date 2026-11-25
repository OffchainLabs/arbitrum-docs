import { Maximize2, Minimize2 } from 'lucide-react';
import type { RefObject } from 'react';

import { THEME } from './flows.ts';

// THEME.focus, not the site focus ring, which has too little contrast on THEME.chip.
const FOCUS = 'focus-visible:outline-(--flow-focus)';

interface StepBarProps {
  index: number;
  count: number;
  started: boolean;
  // The sticky bar's own element. Not set when docked: the dock around it holds the ref.
  barRef?: RefObject<HTMLElement | null>;
  // Docked: a plain row inside the widget's step dock, which carries the position and colors.
  docked?: boolean;
  onGo: (index: number) => void;
  onShowAll: () => void;
  // When set, the whole graph shows: Show all reads "Back to this step" and calls this.
  onShowStep?: () => void;
  // When set, Next stays active on the last step and calls this instead of stepping.
  onFinish?: () => void;
  // The arrow key hint. Off in the detail dialog, where its width would widen the dialog past
  // 94vw at 768px and pull it off center over the diagram.
  keyHint?: boolean;
  // When set, the bar ends with a button that toggles full screen.
  fullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export function Key({ children }: { children: string }) {
  return (
    <kbd
      className="rounded px-1 font-sans leading-4"
      style={{ border: `1px solid ${THEME.connector}` }}
    >
      {children}
    </kbd>
  );
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
  onShowStep,
  onFinish,
  docked = false,
  keyHint = true,
  fullScreen = false,
  onToggleFullScreen,
}: StepBarProps) {
  const atEnd = index === count - 1;
  return (
    <nav
      ref={docked ? undefined : barRef}
      aria-label="Transaction steps"
      className={[
        'flex items-center gap-0.5 text-sm md:gap-2',
        docked ? '' : 'sticky bottom-3 z-20 mx-auto mt-auto mb-3 rounded-lg p-1.5',
      ].join(' ')}
      style={
        docked
          ? undefined
          : {
              background: THEME.chip,
              color: THEME.ink,
              fontFamily: THEME.font,
              border: `1px solid ${THEME.connector}`,
            }
      }
    >
      <button
        type="button"
        className={[
          'rounded-md px-2 py-1 whitespace-nowrap aria-disabled:opacity-40 md:px-3',
          FOCUS,
        ].join(' ')}
        style={{ border: `1px solid ${THEME.connector}` }}
        aria-disabled={index === 0}
        aria-keyshortcuts="ArrowLeft"
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
        aria-keyshortcuts="ArrowRight"
        onClick={() => (atEnd && onFinish ? onFinish() : onGo(index + 1))}
      >
        Next →
      </button>
      {keyHint && (
        // The arrow keys step only while focus is inside the widget root (`group/flow`), so the
        // hint shows only then, and not below 768px, where readers have no arrow keys. Its space
        // is always kept: a click focuses the widget, and a bar that widened then would move the
        // button under the pointer before mouseup, so the click would miss. Back and Next carry
        // aria-keyshortcuts for screen readers.
        <span
          aria-hidden="true"
          className={[
            'hidden items-center gap-1 text-xs whitespace-nowrap',
            'md:invisible md:inline-flex md:group-focus-within/flow:visible',
            // Docked, the row is wider than its buttons: the hint pushes Show all and the full
            // screen button to the right end, and Back and Next keep the left.
            docked ? 'md:ml-auto' : '',
          ].join(' ')}
        >
          or <Key>←</Key>
          <Key>→</Key> keys
        </span>
      )}
      <button
        type="button"
        className={`px-1 py-1 text-xs whitespace-nowrap underline md:px-2 ${FOCUS}`}
        onClick={onShowStep ?? onShowAll}
      >
        {onShowStep ? 'Back to this step' : 'Show all'}
      </button>
      {onToggleFullScreen && (
        <button
          type="button"
          className={`rounded-md p-1 ${FOCUS}`}
          aria-label={fullScreen ? 'Exit full screen' : 'Full screen'}
          aria-pressed={fullScreen}
          aria-keyshortcuts={fullScreen ? 'Escape' : undefined}
          title={fullScreen ? 'Exit full screen (Esc)' : 'Full screen'}
          onClick={onToggleFullScreen}
        >
          {fullScreen ? (
            <Minimize2 aria-hidden="true" className="size-4" />
          ) : (
            <Maximize2 aria-hidden="true" className="size-4" />
          )}
        </button>
      )}
    </nav>
  );
}
