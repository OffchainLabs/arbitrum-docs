'use client';

import dynamic from 'next/dynamic';

/**
 * Lazy boundary for the Timeboost auction diagram.
 *
 * `components/mdx.tsx` reaches every docs page, so anything it references statically lands in every
 * page's client bundle. The artwork is an asset under `public/img/` and is not the weight here:
 * `AuctionStepMarker` pulls in `@radix-ui/react-dialog` and `DynamicCodeBlock`, plus the five steps'
 * prose and code samples, and one page renders all of it. `next/dynamic` keeps that in its own
 * chunk. Server rendering stays on, so the diagram and its markers are in the HTML.
 */
const FlowChartImpl = dynamic(() => import('./FlowChart').then((mod) => mod.FlowChart));

export function FlowChart() {
  return <FlowChartImpl />;
}
