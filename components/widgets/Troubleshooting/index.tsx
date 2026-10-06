'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

/**
 * Lazy boundaries for the node troubleshooting page.
 *
 * `components/mdx.tsx` reaches every docs page, and these five components and their store are used
 * on one. `next/dynamic` keeps them in their own chunk. Server rendering stays on, so the controls
 * and checklist are in the HTML. Every boundary resolves to the same `./store` module instance, so
 * the components still share one selection.
 */
const ChecklistImpl = dynamic(() =>
  import('./Checklist').then((mod) => mod.TroubleshootingChecklist),
);
const ChecklistItemImpl = dynamic(() => import('./Checklist').then((mod) => mod.ChecklistItem));
const ConfigGuidanceImpl = dynamic(() =>
  import('./ConfigGuidance').then((mod) => mod.ConfigGuidance),
);
const ConfigImpl = dynamic(() =>
  import('./TroubleshootingConfig').then((mod) => mod.TroubleshootingConfig),
);
const ReportImpl = dynamic(() =>
  import('./TroubleshootingReport').then((mod) => mod.TroubleshootingReport),
);

export function TroubleshootingChecklist({ children }: { children: ReactNode }) {
  return <ChecklistImpl>{children}</ChecklistImpl>;
}

export function ChecklistItem(props: { id: string; label: string; children?: ReactNode }) {
  return <ChecklistItemImpl {...props} />;
}

export function ConfigGuidance() {
  return <ConfigGuidanceImpl />;
}

export function TroubleshootingConfig() {
  return <ConfigImpl />;
}

export function TroubleshootingReport() {
  return <ReportImpl />;
}
