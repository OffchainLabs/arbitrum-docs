'use client';

import dynamic from 'next/dynamic';

/**
 * Lazy boundary for the BoLD edge challenge diagram.
 *
 * `components/mdx.tsx` reaches every docs page, and this widget pulls in d3 plus five sub-components
 * that only one page renders. `next/dynamic` keeps all of it in its own chunk. Server rendering is
 * off: the diagram measures the container and draws into it with d3, so there is nothing meaningful
 * to render without a DOM, and the loading text below is what the reader sees for that instant.
 */
const EdgeChallengeFlowImpl = dynamic(() => import('./EdgeChallengeFlow'), {
  ssr: false,
  // Tailwind utilities, because the widget's stylesheet arrives with the lazy chunk, after this.
  loading: () => (
    <div className="p-10 text-center text-fd-muted-foreground">Loading edge challenge data...</div>
  ),
});

export function EdgeChallengeFlow() {
  return <EdgeChallengeFlowImpl />;
}
