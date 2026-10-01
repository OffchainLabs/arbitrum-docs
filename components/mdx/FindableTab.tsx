'use client';

import { Tab as FumadocsTab, type TabProps } from 'fumadocs-ui/components/tabs';

import { cn } from '@/lib/cn';

import { useFindablePanel } from './use-findable-panel';

export function Tab({ className, ...props }: TabProps) {
  const ref = useFindablePanel('inactive');

  return (
    <FumadocsTab
      {...props}
      ref={ref}
      forceMount
      className={cn(
        'data-[state=inactive]:block data-[state=inactive]:h-0 data-[state=inactive]:p-0 data-[state=inactive]:[content-visibility:hidden]',
        className,
      )}
    />
  );
}
