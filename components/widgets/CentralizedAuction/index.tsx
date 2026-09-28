'use client';

import dynamic from 'next/dynamic';

/**
 * Lazy boundary for the Timeboost auction diagram.
 *
 * The artwork is a large inline SVG that one page renders, so `next/dynamic` keeps it out of the
 * bundle every other docs page loads. Server rendering stays on: the diagram is static markup until
 * a reader opens a step.
 */
const FlowChartImpl = dynamic(() => import('./FlowChart').then((mod) => mod.FlowChart));

export function FlowChart() {
  // `group`, not `img`: `img` is a leaf role, so the accessibility tree would drop the dialog
  // triggers inside it. As a group, the SVG reports its label and the buttons it contains. The
  // artwork itself is `aria-hidden` in `FlowChart.tsx`, since the prose around the diagram already
  // explains the flow it illustrates.
  return <FlowChartImpl role="group" aria-label="Timeboost centralized auction flow" />;
}
