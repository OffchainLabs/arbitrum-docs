import { useEffect, useState } from 'react';

import { type FlowLayout, computeLayout } from './layout.ts';
import type { Flow } from './model.ts';

/** Runs the ELK layout once. `failed` is true when it rejects; the error goes to the console. */
export function useFlowLayout(flow: Flow) {
  const [layout, setLayout] = useState<FlowLayout | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    computeLayout(flow).then(
      (result) => {
        if (mounted) setLayout(result);
      },
      (error: unknown) => {
        console.error(`NitroTxFlow: the ELK layout of flow "${flow.id}" failed.`, error);
        if (mounted) setFailed(true);
      },
    );
    return () => {
      mounted = false;
    };
  }, [flow]);

  return { layout, failed };
}
