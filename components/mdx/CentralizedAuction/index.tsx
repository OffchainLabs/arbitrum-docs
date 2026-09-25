'use client';

import dynamic from 'next/dynamic';

/**
 * Lazy boundary for the Timeboost auction diagram.
 *
 * The artwork is a 2300-line inline SVG that one page renders, so `next/dynamic` keeps it out of the
 * bundle every other docs page loads. Server rendering stays on: the diagram is static markup until
 * a reader opens a step.
 */
const FlowChartImpl = dynamic(() => import('./FlowChart').then((mod) => mod.FlowChart));

export function FlowChart() {
  // `group`, not `img`. `img` is a leaf role: the accessibility tree drops everything beneath it,
  // which hid the three dialog triggers inside while `tabIndex` still let a keyboard reach them, so
  // focus landed on something announced as nothing. As a group, the SVG reports its label and the
  // buttons it contains. The artwork itself is `aria-hidden` in `FlowChart.tsx`, since the prose
  // around the diagram already explains the flow it illustrates.
  return <FlowChartImpl role="group" aria-label="Timeboost centralized auction flow" />;
}
