'use client';

import dynamic from 'next/dynamic';

import type { VendingMachineMode } from './VendingMachine';

/**
 * Lazy boundary for the cupcake demo.
 *
 * `components/mdx.tsx` is imported by every docs page, so anything it references statically lands in
 * every page's client bundle. The demo pulls in viem, which only one page needs, so it loads as its
 * own chunk. Server rendering stays on (the widget touches `window` only in effects and handlers),
 * so the markup is in the HTML and the JavaScript arrives after.
 */
const VendingMachineImpl = dynamic(() =>
  import('./VendingMachine').then((mod) => mod.VendingMachine),
);

export function VendingMachine(props: { id?: string; type?: VendingMachineMode }) {
  return <VendingMachineImpl {...props} />;
}
