import { useEffect, useState } from 'react';

import { type FlowLayout, computeLayout } from './layout.ts';
import { type Flow, flowPaths } from './model.ts';

/**
 * Runs the ELK layout once per path of `flow`, in `flowPaths` order. `failed` is true when any
 * layout rejects; the error goes to the console.
 */
export function useFlowLayouts(flow: Flow) {
  const [layouts, setLayouts] = useState<FlowLayout[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all(flowPaths(flow).map((path) => computeLayout(flow, path.steps))).then(
      (result) => {
        if (mounted) setLayouts(result);
      },
      (error: unknown) => {
        console.error(`FlowDiagram: the ELK layout of flow "${flow.id}" failed.`, error);
        if (mounted) setFailed(true);
      },
    );
    return () => {
      mounted = false;
    };
  }, [flow]);

  return { layouts, failed };
}
