import type { Viewport } from '@xyflow/react';
import { type RefObject, useEffect, useState } from 'react';

import { BAND_STYLE, BRAND } from './brand.ts';
import { type Band, type Box, type FlowLayout, activeBoxes } from './layout.ts';
import type { Step } from './model.ts';
import { siteHeaderPx } from './useStepNavigation.ts';

const BAND_LABEL_INSET = 10;
const BAND_LABEL_HEIGHT = 26;

interface BandLabelsProps {
  layout: FlowLayout;
  step: Step;
  viewport: Viewport;
  canvasRef: RefObject<HTMLDivElement | null>;
  barRef: RefObject<HTMLElement | null>;
}

// Same width estimate as the edge chips, at 13px, plus padding and the accent bar.
function bandLabelWidth(chain: Band['chain']): number {
  return Math.ceil(BAND_STYLE[chain].name.length * 0.55 * 13) + 34;
}

/**
 * Band names, outside the React Flow transform. Each sits at the top right of the visible part
 * of its band, below the site header and above the step bar, and moves below any active node,
 * edge label or the React Flow attribution it would cover. It is hidden when the visible part of
 * the band is too thin.
 */
export function BandLabels({ layout, step, viewport, canvasRef, barRef }: BandLabelsProps) {
  const [, setScrollTick] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollTick((tick) => tick + 1);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const canvas = canvasRef.current;
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const toCanvas = (box: Box) => ({
    left: box.x * viewport.zoom + viewport.x,
    right: (box.x + box.width) * viewport.zoom + viewport.x,
    top: box.y * viewport.zoom + viewport.y,
    bottom: (box.y + box.height) * viewport.zoom + viewport.y,
  });
  const obstacles = activeBoxes(layout, step).map(toCanvas);
  const attribution = canvas.querySelector('.react-flow__attribution')?.getBoundingClientRect();
  if (attribution) {
    obstacles.push({
      left: attribution.left - rect.left,
      right: attribution.right - rect.left,
      top: attribution.top - rect.top,
      bottom: attribution.bottom - rect.top,
    });
  }
  obstacles.sort((a, b) => a.top - b.top);
  const visibleTop = Math.max(0, siteHeaderPx(canvas) - rect.top) + BAND_LABEL_INSET;
  const floor = Math.min(
    (barRef.current?.getBoundingClientRect().top ?? Infinity) - rect.top - 6,
    canvas.clientHeight,
    window.innerHeight - rect.top,
  );

  return layout.bands.map((band, index) => {
    const box = toCanvas(band.box);
    const x = Math.min(box.right, canvas.clientWidth) - BAND_LABEL_INSET;
    const width = bandLabelWidth(band.chain);
    let y = Math.max(box.top + BAND_LABEL_INSET, visibleTop);
    for (const obstacle of obstacles) {
      const overlaps =
        x - width < obstacle.right &&
        obstacle.left < x &&
        y < obstacle.bottom &&
        obstacle.top < y + BAND_LABEL_HEIGHT;
      if (overlaps) y = obstacle.bottom + 6;
    }
    if (y + BAND_LABEL_HEIGHT > Math.min(box.bottom - BAND_LABEL_INSET, floor)) return null;
    const style = BAND_STYLE[band.chain];
    return (
      <div
        key={`${band.chain}-${index}`}
        aria-hidden="true"
        className="pointer-events-none absolute z-10 flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[13px] font-semibold whitespace-nowrap"
        style={{
          left: x,
          top: y,
          transform: 'translateX(-100%)',
          background: BRAND.chip,
          color: BRAND.chipText,
          fontFamily: BRAND.font,
          opacity: band.chain === step.txChain ? 1 : 0.8,
        }}
      >
        <span style={{ width: 4, height: 14, borderRadius: 2, background: style.accent }} />
        {style.name}
      </div>
    );
  });
}
