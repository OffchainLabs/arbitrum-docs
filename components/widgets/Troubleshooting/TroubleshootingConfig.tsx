'use client';

import { useEffect, useId, useRef, useState } from 'react';

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
 * Each dimension is a native radio group in a `<fieldset>`, so the browser supplies the radio
 * keyboard pattern: one Tab stop per group, arrow keys to move the selection.
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
  const name = useId();
  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="float-left me-2 min-w-32 text-sm font-medium text-fd-muted-foreground">
        {label}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <label
            key={option.id}
            className={cn(
              'cursor-pointer rounded-md border px-3 py-1.5 text-sm transition-colors',
              'has-focus-visible:ring-2 has-focus-visible:ring-fd-ring has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-fd-card',
              'border-fd-border text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground',
              'has-checked:border-fd-primary has-checked:bg-fd-primary has-checked:font-medium has-checked:text-fd-primary-foreground',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={option.id === value}
              onChange={() => onSelect(option.id)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function TroubleshootingConfig() {
  const { os, network, nodeType } = useTroubleshooting();
  const [updated, setUpdated] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Announced from the change handler rather than an effect on the selection, so neither the first
  // paint nor the store restoring a saved config after hydration says "Content updated!".
  function select(dimension: 'os' | 'network' | 'nodeType', id: string) {
    setDimension(dimension, id);
    setUpdated(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setUpdated(false), 2000);
  }

  return (
    <div className="not-prose my-6 rounded-lg border border-fd-border bg-fd-card p-4">
      <div className="flex flex-col gap-3">
        <Row
          label="Operating system:"
          options={OS_OPTIONS}
          value={os}
          onSelect={(id) => select('os', id)}
        />
        <Row
          label="Network:"
          options={NETWORK_OPTIONS}
          value={network}
          onSelect={(id) => select('network', id)}
        />
        <Row
          label="Node type:"
          options={NODE_TYPE_OPTIONS}
          value={nodeType}
          onSelect={(id) => select('nodeType', id)}
        />
      </div>
      {/* The region stays mounted and empty; text inserted into it is what a screen reader
          announces. It tells readers that guidance elsewhere on the page just changed. */}
      <p aria-live="polite" className="mt-3 mb-0 min-h-5 text-sm text-fd-primary">
        {updated ? 'Content updated!' : null}
      </p>
    </div>
  );
}
