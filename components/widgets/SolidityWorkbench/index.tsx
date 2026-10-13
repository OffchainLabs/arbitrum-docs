'use client';

import dynamic from 'next/dynamic';

/**
 * Lazy boundary for the Solidity quickstart workbench.
 *
 * `components/mdx.tsx` is imported by every docs page, so anything it references statically lands in
 * every page's client bundle. The workbench pulls in viem, react-joyride, Shiki and two CSS modules,
 * which only one page needs, so they load as their own chunk. Server rendering stays on (the
 * workbench touches `window` only in effects and handlers), so the markup is in the HTML and the
 * JavaScript arrives after.
 */
const SolidityQuickstartWorkbenchImpl = dynamic(() =>
  import('./SolidityQuickstartWorkbench').then((mod) => mod.SolidityQuickstartWorkbench),
);

export function SolidityQuickstartWorkbench() {
  return <SolidityQuickstartWorkbenchImpl />;
}
