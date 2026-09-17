'use client';

import { History } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useId } from 'react';

import { cn } from '@/lib/cn';
// Imported from `lib/versions-constants` rather than `lib/versions`: the latter imports the
// generated `collections/server` index, which would pull every compiled MDX page into this client
// component's bundle.
import { LATEST_ID, VERSION_PARAM, type VersionOption } from '@/lib/versions-constants';

/**
 * Per-page version selector, rendered only on versioned pages (see
 * .claude/docs/superpowers/specs/2026-07-17-partial-versioning-design.md). Selecting a version navigates to
 * a shareable URL: the bare path for Latest, or `?v=<id>` for an archived version. Server-rendered
 * on navigation, so the choice is bookmarkable.
 */
export function VersionSwitcher({
  options,
  current,
}: {
  options: VersionOption[];
  current: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const selectId = useId();

  function onSelect(id: string) {
    const url = id === LATEST_ID ? pathname : `${pathname}?${VERSION_PARAM}=${id}`;
    router.push(url);
  }

  return (
    <label
      htmlFor={selectId}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm',
        'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground',
        'cursor-pointer transition-colors',
      )}
    >
      <History className="size-4 shrink-0" />
      <span className="sr-only">Version</span>
      <select
        id={selectId}
        value={current}
        onChange={(event) => onSelect(event.target.value)}
        className="cursor-pointer appearance-none bg-transparent pr-1 outline-none"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
