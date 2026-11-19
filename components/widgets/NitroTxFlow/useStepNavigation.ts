import { type RefObject, useEffect, useRef, useState } from 'react';

import {
  type PathCount,
  type StepPosition,
  clampStep,
  parseStepHash,
  stepHash,
} from './navigation.ts';

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
 * The current path and step, synced with the `#step-n` or `#<path>-step-n` hash. A hash that is
 * not a step hash (a heading link) keeps the current position. `goTo` also scrolls the canvas on
 * screen when it is not fully visible, so the step bar does not cover the active step.
 * `paths` must be a stable array: it is an effect dependency.
 */
export function useStepNavigation(paths: PathCount[], canvasRef: RefObject<HTMLElement | null>) {
  const [position, setPosition] = useState<StepPosition>(
    () => parseStepHash(window.location.hash, paths) ?? { path: 0, index: 0 },
  );
  const { path, index } = position;
  // Start cue: shown on first load at step 1 until the reader moves once.
  const [started, setStarted] = useState(path > 0 || index > 0);
  const hashed = useRef(position);

  useEffect(() => {
    const onHashChange = () => {
      const next = parseStepHash(window.location.hash, paths);
      if (next === null) return;
      setStarted(true);
      setPosition(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [paths]);

  // On a step change only, so a heading hash on load stays in the URL. A ref of the last written
  // position, not a first-run flag, because Strict Mode runs the effect twice on mount.
  useEffect(() => {
    if (hashed.current.path === path && hashed.current.index === index) return;
    hashed.current = { path, index };
    window.history.replaceState(null, '', stepHash({ path, index }, paths));
  }, [path, index, paths]);

  const selectPath = (next: number) => {
    setStarted(true);
    setPosition({ path: next, index: 0 });
  };

  // Clamped: at the first or last step, Back or Next does nothing.
  const goTo = (next: number) => {
    const target = clampStep(next, paths[path]!.stepCount);
    if (target === index) return;
    setStarted(true);
    setPosition({ path, index: target });
    const canvas = canvasRef.current;
    if (!canvas) return;
    const box = canvas.getBoundingClientRect();
    if (box.top < siteHeaderPx(canvas) || box.bottom > window.innerHeight) {
      canvas.scrollIntoView({ block: 'start', behavior: motionDuration() ? 'smooth' : 'auto' });
    }
  };

  return { path, index, started, goTo, selectPath };
}
