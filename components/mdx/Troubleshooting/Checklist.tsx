'use client';

import { type ReactNode, useEffect, useId } from 'react';

import { cn } from '@/lib/cn';

import { registerChecklistLabel, toggleChecklistItem, useTroubleshooting } from './store';

/**
 * The Step 1 checklist. Ticking an item highlights it and feeds its state into the generated
 * troubleshooting report, matching the Docusaurus original (which scraped `.task input` and the
 * sibling `label` text out of the DOM at report time).
 */

export function TroubleshootingChecklist({ children }: { children: ReactNode }) {
  return <div className="not-prose my-6 flex flex-col gap-2">{children}</div>;
}

export function ChecklistItem({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children?: ReactNode;
}) {
  const { checklist, labels } = useTroubleshooting();
  const checked = checklist[id] ?? false;
  const inputId = useId();

  useEffect(() => {
    // Registered from an effect, not during render, so the store is never written mid-render.
    registerChecklistLabel(id, label);
  }, [id, label]);

  // `labels` is read so this item re-renders once its own label lands in the store; without the
  // read the component would not depend on it and lint would flag the value as unused.
  void labels;

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg border p-4 transition-colors',
        checked ? 'border-fd-primary/40 bg-fd-primary/5' : 'border-fd-border',
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={() => toggleChecklistItem(id)}
        className="mt-1 size-5 shrink-0 cursor-pointer accent-fd-primary"
      />
      <div className="min-w-0 flex-1">
        <label htmlFor={inputId} className="block cursor-pointer font-semibold">
          {label}
        </label>
        {children ? (
          <div className="prose-no-margin mt-2 text-sm text-fd-muted-foreground">{children}</div>
        ) : null}
      </div>
    </div>
  );
}
