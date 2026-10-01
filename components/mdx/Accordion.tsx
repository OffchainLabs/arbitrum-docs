'use client';

import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from 'fumadocs-ui/components/ui/accordion';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';
import { Check, LinkIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { useFindablePanel } from './use-findable-panel';

/**
 * Fumadocs' `Accordion`, with the panel always rendered. Fumadocs unmounts a closed panel, so its
 * text is missing from server HTML. A closed panel remains mounted and receives
 * `hidden="until-found"` after hydration, so browser Find can open it.
 */
export function Accordion({
  title,
  id,
  value = String(title),
  children,
  ...props
}: Omit<ComponentProps<typeof AccordionItem>, 'value' | 'title'> & {
  title: string | ReactNode;
  value?: string;
}) {
  const contentRef = useFindablePanel('closed');

  return (
    <AccordionItem value={value} {...props}>
      <AccordionHeader id={id} data-accordion-value={value}>
        <AccordionTrigger>{title}</AccordionTrigger>
        {id ? <CopyButton id={id} /> : null}
      </AccordionHeader>
      <AccordionContent
        ref={contentRef}
        forceMount
        className="data-[state=closed]:h-0 data-[find-reveal]:animate-none!"
      >
        <div className="px-4 pb-2 text-[0.9375rem] prose-no-margin">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

function CopyButton({ id }: { id: string }) {
  const [checked, onClick] = useCopyButton(() => {
    const url = new URL(window.location.href);
    url.hash = id;
    return navigator.clipboard.writeText(url.toString());
  });

  return (
    <button
      type="button"
      aria-label="Copy Link"
      className={cn(buttonVariants({ color: 'ghost', className: 'text-fd-muted-foreground me-2' }))}
      onClick={onClick}
    >
      {checked ? <Check className="size-3.5" /> : <LinkIcon className="size-3.5" />}
    </button>
  );
}
