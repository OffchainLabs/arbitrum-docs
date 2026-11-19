import { type KeyboardEvent, useRef } from 'react';

import type { ResolvedPath } from './model.ts';

interface PathTabsProps {
  flowId: string;
  paths: ResolvedPath[];
  selected: number;
  onSelect: (path: number) => void;
}

/**
 * One tab per path, above the canvas. Nothing for a flow with one path. ArrowLeft, ArrowRight,
 * Home and End move between tabs and stop there, so the widget root does not also change the step.
 */
export function tabId(flowId: string, pathId: string): string {
  return `${flowId}-tab-${pathId}`;
}

export function panelId(flowId: string): string {
  return `${flowId}-tabpanel`;
}

export function PathTabs({ flowId, paths, selected, onSelect }: PathTabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  if (paths.length < 2) return null;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.stopPropagation();
    let next = (selected + (event.key === 'ArrowRight' ? 1 : -1) + paths.length) % paths.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = paths.length - 1;
    onSelect(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Submission path"
      onKeyDown={onKeyDown}
      className="flex flex-wrap gap-1 border-b border-fd-border p-2"
    >
      {paths.map((path, i) => (
        <button
          key={path.id}
          ref={(element) => {
            tabRefs.current[i] = element;
          }}
          type="button"
          id={tabId(flowId, path.id)}
          role="tab"
          aria-controls={panelId(flowId)}
          aria-selected={i === selected}
          tabIndex={i === selected ? 0 : -1}
          onClick={() => onSelect(i)}
          className={[
            'rounded-md px-3 py-1.5 text-sm font-medium',
            i === selected
              ? 'bg-fd-primary/15 text-fd-primary'
              : 'text-fd-muted-foreground hover:text-fd-foreground',
          ].join(' ')}
        >
          {path.label}
        </button>
      ))}
    </div>
  );
}
