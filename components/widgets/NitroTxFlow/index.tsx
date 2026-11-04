'use client';

import dynamic from 'next/dynamic';

const NitroTxFlowImpl = dynamic(() => import('./NitroTxFlow'), {
  ssr: false,
  loading: () => (
    <div className="p-10 text-center text-fd-muted-foreground">Loading diagram...</div>
  ),
});

export function NitroTxFlow() {
  return <NitroTxFlowImpl />;
}
