import { type RefObject, useEffect, useRef, useState } from 'react';

import { parseStepHash, stepHash } from './navigation.ts';

// Clears the sticky site header, and the table of contents bar under it when Fumadocs shows one,
// plus 16px. Fumadocs sets `--fd-docs-row-3` to their total height: 56px at 1280px, 96px at 375px.
export const SITE_HEADER = 'calc(var(--fd-docs-row-3, 56px) + 16px)';

/** `SITE_HEADER` in pixels, read back from the canvas, which uses it as its scroll margin. */
export function siteHeaderPx(canvas: HTMLElement): number {
  return parseFloat(getComputedStyle(canvas).scrollMarginTop);
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** 500ms camera and scroll moves, or none under `prefers-reduced-motion: reduce`. */
export function motionDuration(): number {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches ? 0 : 500;
}

/**
 * The current step, synced with the `#step-n` hash. A hash that is not a step hash (a heading
 * link) keeps the current step. `goTo` also scrolls the canvas on screen when it is not fully
 * visible, so the step bar does not cover the active step.
 */
export function useStepNavigation(stepCount: number, canvasRef: RefObject<HTMLElement | null>) {
  const [index, setIndex] = useState(() => parseStepHash(window.location.hash, stepCount) ?? 0);
  // Start cue: shown on first load at step 1 until the reader moves once.
  const [started, setStarted] = useState(index > 0);
  const hashStep = useRef(index);

  useEffect(() => {
    const onHashChange = () => {
      const next = parseStepHash(window.location.hash, stepCount);
      if (next === null) return;
      setStarted(true);
      setIndex(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [stepCount]);

  // On a step change only, so a heading hash on load stays in the URL. A ref of the last written
  // step, not a first-run flag, because Strict Mode runs the effect twice on mount.
  useEffect(() => {
    if (hashStep.current === index) return;
    hashStep.current = index;
    window.history.replaceState(null, '', stepHash(index));
  }, [index]);

  const goTo = (next: number) => {
    setStarted(true);
    setIndex(next);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const box = canvas.getBoundingClientRect();
    if (box.top < siteHeaderPx(canvas) || box.bottom > window.innerHeight) {
      canvas.scrollIntoView({ block: 'start', behavior: motionDuration() ? 'smooth' : 'auto' });
    }
  };

  return { index, started, goTo };
}
