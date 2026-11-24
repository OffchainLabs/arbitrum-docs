import type { Viewport } from '@xyflow/react';
import { type RefObject, useEffect, useState } from 'react';

import { PROJECT, THEME } from './flows.ts';
import { type Band, type Box, type FlowLayout, activeBoxes, nodeBox } from './layout.ts';
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

// 0.55 em per character at 13px, plus padding and the accent bar. The edge chips in layout.ts use
// 0.52 em at 12px.
function bandLabelWidth(chain: Band['chain']): number {
  return Math.ceil(PROJECT.lanes[chain]!.label.length * 0.55 * 13) + 34;
}

interface Edges {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

// Whether a band name at (x, y) with this width overlaps `obstacle`.
function covers(obstacle: Edges, x: number, y: number, width: number): boolean {
  return (
    x < obstacle.right &&
    obstacle.left < x + width &&
    y < obstacle.bottom &&
    obstacle.top < y + BAND_LABEL_HEIGHT
  );
}

/**
 * Band names, outside the React Flow transform. Each sits at the top left of the visible part
 * of its band column, below the site header and above the step bar, and moves below any node,
 * active edge label, the key, the React Flow attribution or earlier band name it would cover. It
 * may extend past its band's right edge, and slides left to stay on the canvas. It is hidden when
 * it does not fit the canvas width or the visible part of its band column vertically.
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
  // Every node, so a name never hides a part, and the active edge labels.
  const nodes = Object.values(layout.nodes).map(nodeBox);
  const obstacles = [...nodes, ...activeBoxes(layout, step)].map(toCanvas);
  for (const element of canvas.querySelectorAll('.react-flow__attribution, [data-flow-key]')) {
    const pinned = element.getBoundingClientRect();
    obstacles.push({
      left: pinned.left - rect.left,
      right: pinned.right - rect.left,
      top: pinned.top - rect.top,
      bottom: pinned.bottom - rect.top,
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
    const width = bandLabelWidth(band.chain);
    // A name may pass its band edge; a narrow band slides it left to stay on the canvas.
    const x = Math.min(
      Math.max(box.left, 0) + BAND_LABEL_INSET,
      canvas.clientWidth - width - BAND_LABEL_INSET,
    );
    if (x < 0) return null;
    let y = Math.max(box.top + BAND_LABEL_INSET, visibleTop);
    // Moving below one obstacle can land on an earlier, taller one, so repeat until none covers.
    for (let moved = true; moved;) {
      moved = false;
      for (const obstacle of obstacles) {
        if (!covers(obstacle, x, y, width)) continue;
        y = obstacle.bottom + 6;
        moved = true;
      }
    }
    if (y + BAND_LABEL_HEIGHT > Math.min(box.bottom - BAND_LABEL_INSET, floor)) return null;
    obstacles.push({ left: x, right: x + width, top: y, bottom: y + BAND_LABEL_HEIGHT });
    const lane = PROJECT.lanes[band.chain]!;
    return (
      <div
        key={`${band.chain}-${index}`}
        aria-hidden="true"
        className={[
          'pointer-events-none absolute z-10 flex items-center gap-1.5 rounded-md px-2 py-0.5',
          'text-[13px] font-semibold whitespace-nowrap',
        ].join(' ')}
        style={{
          left: x,
          top: y,
          background: THEME.chip,
          color: THEME.ink,
          fontFamily: THEME.font,
          opacity: band.chain === step.txChain ? 1 : 0.8,
        }}
      >
        <span style={{ width: 4, height: 14, borderRadius: 2, background: lane.widget!.accent }} />
        {lane.label}
      </div>
    );
  });
}
