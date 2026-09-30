'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/cn';

import {
  NETWORK_OPTIONS,
  NODE_TYPE_OPTIONS,
  OS_OPTIONS,
  type Option,
  setDimension,
  useTroubleshooting,
} from './store';

/**
 * The OS / Network / Node type selector that drives the rest of the troubleshooting page.
 * Each dimension is a labelled radio group, so the control is reachable by keyboard and announced
 * correctly by screen readers.
 */

function Row({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: Option[];
  value: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-fd-muted-foreground min-w-32">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(option.id)}
              className={cn(
                'rounded-md border px-3 py-1.5 text-sm transition-colors cursor-pointer',
                selected
                  ? 'border-fd-primary bg-fd-primary text-fd-primary-foreground font-medium'
                  : 'border-fd-border text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TroubleshootingConfig() {
  const { os, network, nodeType } = useTroubleshooting();
  const [updated, setUpdated] = useState(false);
  // Skip the flash on first paint (and on the re-render that restores a saved config).
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    // "Content updated!" tells readers that guidance elsewhere on the page just changed.
    setUpdated(true);
    const timer = setTimeout(() => setUpdated(false), 2000);
    return () => clearTimeout(timer);
  }, [os, network, nodeType]);

  return (
    <div className="not-prose my-6 rounded-lg border border-fd-border bg-fd-card p-4">
      <div className="flex flex-col gap-3">
        <Row
          label="Operating system:"
          options={OS_OPTIONS}
          value={os}
          onSelect={(id) => setDimension('os', id)}
        />
        <Row
          label="Network:"
          options={NETWORK_OPTIONS}
          value={network}
          onSelect={(id) => setDimension('network', id)}
        />
        <Row
          label="Node type:"
          options={NODE_TYPE_OPTIONS}
          value={nodeType}
          onSelect={(id) => setDimension('nodeType', id)}
        />
      </div>
      <p
        aria-live="polite"
        className={cn(
          'mt-3 mb-0 text-sm text-fd-primary transition-opacity duration-300',
          updated ? 'opacity-100' : 'opacity-0',
        )}
      >
        Content updated!
      </p>
    </div>
  );
}
