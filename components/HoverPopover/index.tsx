'use client';

import {
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  safePolygon,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useMergeRefs,
  useRole,
} from '@floating-ui/react';
import { type ReactNode, useState } from 'react';

import './styles.css';

/**
 * Generic hover/focus popover built on `@floating-ui/react`. The interaction primitive behind
 * `<Reference>`/`<Term>`: inline, opens on hover/focus, closes on leave/blur. Owns open state,
 * positioning, dismissal, and the portal; consumers pass a trigger (`children`) and prebuilt
 * `content` (typically server-rendered).
 */
export function HoverPopover({
  children,
  content,
  title,
}: {
  children: ReactNode;
  content: ReactNode;
  title?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(10), flip({ fallbackAxisSideDirection: 'start' }), shift({ padding: 5 })],
    whileElementsMounted: autoUpdate,
  });

  // `handleClose: safePolygon()` keeps the popover open while the pointer crosses the offset gap
  // toward it — the equivalent of Tippy's `interactive: true` on the legacy site. Glossary
  // definitions contain cross-reference links, so the content has to be reachable, not just visible.
  const hover = useHover(context, {
    move: false,
    delay: { open: 150, close: 150 },
    handleClose: safePolygon(),
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);
  const triggerRef = useMergeRefs([refs.setReference]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="hover-popover__trigger"
        {...getReferenceProps()}
      >
        {children}
      </button>
      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="hover-popover__content hover-popover__content--tooltip"
            {...getFloatingProps()}
          >
            <div className="hover-popover__body">
              {title && <p className="hover-popover__title">{title}</p>}
              {content}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
