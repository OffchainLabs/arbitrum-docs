'use client';

import { History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useId } from 'react';

import { cn } from '@/lib/cn';
// Imported from `lib/versions-constants` rather than `lib/versions`: the latter imports the
// generated `collections/server` index, which would pull every compiled MDX page into this client
// component's bundle.
import { LATEST_ID, type VersionOption } from '@/lib/versions-constants';

/**
 * Per-page version selector, rendered only on versioned pages (see
 * .claude/docs/superpowers/specs/2026-07-17-partial-versioning-design.md). Selecting a version
 * navigates to a shareable URL: `basePath` for Latest, or `basePath/<id>` for an archived version.
 * Server-rendered on navigation, so the choice is bookmarkable.
 *
 * `basePath` is the live page's URL, handed down by the server rather than derived from
 * `usePathname()`: on an archive the pathname already carries a version segment, and stripping it
 * here would mean this client component knowing which trailing segments are version ids — exactly
 * the registry knowledge it must not import (see `lib/versions-constants.ts`).
 */
export function VersionSwitcher({
  options,
  current,
  basePath,
}: {
  options: VersionOption[];
  current: string;
  basePath: string;
}) {
  const router = useRouter();
  const selectId = useId();

  function onSelect(id: string) {
    router.push(id === LATEST_ID ? basePath : `${basePath}/${id}`);
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
