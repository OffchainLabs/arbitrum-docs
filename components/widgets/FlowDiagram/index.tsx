'use client';

import dynamic from 'next/dynamic';

import type { FlowId } from './flows.ts';

/**
 * Lazy boundary for the flow diagrams.
 *
 * `components/mdx.tsx` reaches every docs page, and this widget pulls in React Flow and ELK, which
 * only a few pages render. `next/dynamic` keeps them in their own chunk. Server rendering is off:
 * the layout runs in the browser and the camera measures the canvas, so the loading text below is
 * what the reader sees for that instant.
 */
const LazyFlowDiagram = dynamic<{ flowId: FlowId }>(() => import('./FlowDiagram.tsx'), {
  ssr: false,
  // Tailwind utilities, because the React Flow stylesheet arrives with the lazy chunk, after this.
  loading: () => (
    <div className="p-10 text-center text-fd-muted-foreground">Loading diagram...</div>
  ),
});

export function FlowDiagram({ flow }: { flow: FlowId }) {
  return <LazyFlowDiagram flowId={flow} />;
}
