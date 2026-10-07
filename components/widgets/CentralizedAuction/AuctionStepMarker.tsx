'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { X } from 'lucide-react';
import { useState } from 'react';

import { type AuctionStepId, CIRCLE_RADIUS, coordinates, numberPaths } from './constants';
import { AUCTION_STEPS } from './steps';
import styles from './styles.module.css';

/**
 * One numbered marker on the auction diagram, and the step dialog behind it.
 *
 * The pulsing ring and hover grow are CSS in `styles.module.css`. The dialog is Tailwind utilities
 * on Fumadocs' overlay token and dialog animations. Radix supplies the focus trap, `Esc` handling
 * and scroll lock, and its `data-state` attributes select the open and close animations.
 */
export function AuctionStepMarker({
  step,
  interactive,
}: {
  step: AuctionStepId;
  interactive?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const coords = coordinates[step];
  const pathData = numberPaths[step];
  const content = AUCTION_STEPS[step];

  const offsetX = coords.circle.x - coords.path.x + (coords.offset?.x ?? 0);
  const offsetY = coords.circle.y - coords.path.y + (coords.offset?.y ?? 0);

  const marker = (
    <g id={`auction-step-${step}`}>
      {interactive ? (
        <circle
          className={styles.markerRing}
          cx={coords.circle.x}
          cy={coords.circle.y}
          r={CIRCLE_RADIUS * 1.5}
        />
      ) : null}
      <circle
        className={styles.markerCircle}
        cx={coords.circle.x}
        cy={coords.circle.y}
        r={CIRCLE_RADIUS}
      />
      <path
        className={styles.markerDigit}
        d={pathData}
        transform={`translate(${offsetX}, ${offsetY})`}
      />
    </g>
  );

  if (!interactive) return marker;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <g
          role="button"
          tabIndex={0}
          aria-label={`Open step ${step}`}
          // The focus ring belongs on the focusable element; the inner group never receives focus,
          // so a ring there would show keyboard users nothing.
          className={styles.markerInteractive}
          // Radix wires the click, but an SVG group is not a button: Enter and Space do not
          // synthesise one, so keyboard users need this.
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setOpen(true);
            }
          }}
        >
          {marker}
        </g>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-fd-overlay backdrop-blur-xs data-[state=closed]:animate-fd-fade-out data-[state=open]:animate-fd-fade-in motion-reduce:animate-none" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[min(640px,calc(100vh-2rem))] w-[min(800px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border bg-fd-popover text-fd-popover-foreground shadow-2xl data-[state=closed]:animate-fd-dialog-out data-[state=open]:animate-fd-dialog-in motion-reduce:animate-none"
          aria-describedby={undefined}
        >
          <div className="flex flex-none items-start justify-between gap-4 border-b px-5 py-4">
            <Dialog.Title className="text-lg font-medium [&_code]:text-[0.95em]">
              {content.title}
            </Dialog.Title>
            <Dialog.Close
              className="inline-flex flex-none cursor-pointer rounded-md p-1 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
              aria-label="Close"
            >
              <X className="size-[1.125rem]" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto p-5 text-[0.9375rem]">
            <p className="text-fd-muted-foreground">{content.lead}</p>
            <ol className="flex list-decimal flex-col gap-2 ps-5 [&_code]:rounded-sm [&_code]:bg-fd-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em]">
              {content.points.map((point, index) => (
                // The list is static content in source order, so the index is a stable identity.
                <li key={index}>{point}</li>
              ))}
            </ol>
            <DynamicCodeBlock lang={content.code.lang} code={content.code.value} />
            {content.readMore ? (
              // A new tab is right for leaving the site and wrong for staying on it, so the target
              // follows the link rather than being fixed.
              <a
                className="font-medium underline decoration-fd-primary decoration-2 underline-offset-4 hover:text-fd-primary"
                href={content.readMore}
                {...(/^https?:\/\//.test(content.readMore)
                  ? { target: '_blank', rel: 'noreferrer noopener' }
                  : {})}
              >
                Read comprehensive explanation
              </a>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
