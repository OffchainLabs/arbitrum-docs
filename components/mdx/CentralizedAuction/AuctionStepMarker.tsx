'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { X } from 'lucide-react';
import { useState } from 'react';

import { CIRCLE_RADIUS, coordinates, numberPaths } from './constants';
import { AUCTION_STEPS } from './steps';
import styles from './styles.module.css';

/**
 * One numbered marker on the auction diagram, and the step dialog behind it.
 *
 * Upstream split this across `NumberComponent`, `ButtonComponent` and `Modal`, and animated all
 * three with `@react-spring/web`. The animations are a pulsing ring, a hover grow, and a dialog
 * fade, and each one is expressible as a CSS transition or keyframe, so the spring dependency is
 * not carried over. Radix (already used by `PdfModal`) supplies the focus trap, `Esc` handling and scroll lock,
 * and its `data-state` attributes drive the open and close animations.
 */
export function AuctionStepMarker({ step, interactive }: { step: number; interactive?: boolean }) {
  const [open, setOpen] = useState(false);

  const coords = coordinates[step as keyof typeof coordinates];
  const pathData = numberPaths[step as keyof typeof numberPaths];
  const content = AUCTION_STEPS[step];
  if (!coords || !pathData || !content) return null;

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
          // The focus ring belongs on the focusable element. It used to sit on the inner group,
          // which never receives focus, so keyboard users saw nothing.
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
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content} aria-describedby={undefined}>
          <div className={styles.header}>
            <Dialog.Title className={styles.title}>{content.title}</Dialog.Title>
            <Dialog.Close className={styles.close} aria-label="Close">
              <X className={styles.closeIcon} aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className={styles.body}>
            <p className={styles.lead}>{content.lead}</p>
            <ol className={styles.points}>
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
