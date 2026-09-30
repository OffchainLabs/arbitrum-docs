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

/**
 * Fumadocs' `Accordion`, with the panel always rendered. Fumadocs unmounts a closed panel, so its
 * text is missing from the server HTML that search engines index and that Ctrl+F searches. Here a
 * closed panel stays in the document and CSS hides it; Radix still animates the open.
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
  return (
    <AccordionItem value={value} {...props}>
      <AccordionHeader id={id} data-accordion-value={value}>
        <AccordionTrigger>{title}</AccordionTrigger>
        {id ? <CopyButton id={id} /> : null}
      </AccordionHeader>
      <AccordionContent forceMount className="data-[state=closed]:hidden">
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
