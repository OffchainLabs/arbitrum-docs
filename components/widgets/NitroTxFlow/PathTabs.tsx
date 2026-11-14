import { type KeyboardEvent, useRef } from 'react';

import type { ResolvedPath } from './model.ts';

interface PathTabsProps {
  paths: ResolvedPath[];
  selected: number;
  onSelect: (path: number) => void;
}

/**
 * One tab per path, above the canvas. Nothing for a flow with one path. ArrowLeft and ArrowRight
 * move between tabs and stop there, so the widget root does not also change the step.
 */
export function PathTabs({ paths, selected, onSelect }: PathTabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  if (paths.length < 2) return null;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.stopPropagation();
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const next = (selected + step + paths.length) % paths.length;
    onSelect(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Paths"
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
          role="tab"
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
