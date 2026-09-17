'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { ExternalLink, X } from 'lucide-react';
import { type MouseEvent, type ReactNode, useState } from 'react';

import styles from './styles.module.css';

interface PdfModalProps {
  /** Root-absolute URL of the PDF, e.g. `/audit-reports/report.pdf`. */
  href: string;
  /** Link text shown in the document. */
  children: ReactNode;
  /** Heading shown in the modal. Defaults to the PDF's filename. */
  title?: string;
}

/**
 * Opens a PDF in an overlay instead of navigating away from the page.
 *
 * The dialog comes from Radix rather than being hand-rolled: it supplies the focus trap, `Esc`
 * handling, scroll lock, ARIA wiring, and portalling that are easy to get subtly wrong. Radix is
 * already the primitive layer under `fumadocs-ui`'s own accordions and popovers, and the version is
 * pinned to the one `fumadocs-ui` resolves so pnpm dedupes it.
 *
 * The PDF itself renders in an `<iframe>`, delegating to the browser's built-in viewer — scrolling,
 * zoom, search, and print all come free, and no pdf.js bundle is shipped. The trade-off is iOS
 * Safari, which renders only the first page inside an iframe; the header's "Open in new tab" link is
 * the escape hatch there and doubles as the download path everywhere else.
 *
 * Modifier-clicks are deliberately left alone, so ⌘/Ctrl/middle-click still opens the PDF in a new
 * tab like any other link.
 */
export function PdfModal({ href, children, title }: PdfModalProps) {
  const [open, setOpen] = useState(false);
  const label = title ?? href.split('/').pop() ?? 'PDF';

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    // Let the browser handle "open in new tab/window" gestures natively.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    setOpen(true);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <a href={href} onClick={handleClick} className={styles.trigger}>
        {children}
      </a>

      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content} aria-describedby={undefined}>
          <div className={styles.header}>
            <Dialog.Title className={styles.title}>{label}</Dialog.Title>
            <div className={styles.actions}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className={styles.action}
                title="Open in a new tab"
              >
                <ExternalLink className={styles.actionIcon} aria-hidden="true" />
                <span>New tab</span>
              </a>
              <Dialog.Close className={styles.action} aria-label="Close">
                <X className={styles.actionIcon} aria-hidden="true" />
              </Dialog.Close>
            </div>
          </div>

          {/* Mounted only while open, so no PDF is fetched until a reader asks for one. */}
          <iframe src={href} title={label} className={styles.viewer} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
