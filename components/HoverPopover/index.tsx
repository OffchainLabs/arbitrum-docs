'use client';

import {
  FloatingFocusManager,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { type ReactNode, useEffect, useId, useRef, useState } from 'react';

import { useInLink } from './in-link';

/**
 * Generic hover/focus popover built on `@floating-ui/react`. The interaction primitive behind
 * `<Term>`: inline, opens on hover, focus or click, closes on leave, `Esc` or an outside press.
 * Owns open state, positioning, dismissal, and the portal; consumers pass a trigger (`children`)
 * and prebuilt `content` (typically server-rendered).
 *
 * The popover is a non-modal dialog, not a tooltip, because definitions carry links. The focus
 * manager keeps it in the tab order right after the trigger even though it is portaled to the end
 * of `<body>`: Tab from the trigger moves into the popover, and Tab past its last link moves on to
 * whatever follows the trigger in the page. `initialFocus={-1}` leaves focus on the trigger when it
 * opens, so hovering or tabbing past a term never steals focus.
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
  const inLink = useInLink();
  const linkedTriggerRef = useRef<HTMLSpanElement>(null);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(10), flip({ fallbackAxisSideDirection: 'start' }), shift({ padding: 5 })],
    whileElementsMounted: autoUpdate,
  });

  // `safePolygon()` keeps the popover open while the pointer crosses the gap toward it, so the
  // cross-reference links inside a definition stay reachable by pointer.
  const hover = useHover(context, {
    move: false,
    delay: { open: 150, close: 150 },
    handleClose: safePolygon(),
  });
  const focus = useFocus(context);
  // A tap or click opens it too, and keeps it open while hover or focus opened it
  // (`stickIfOpen` is the default), so a click on an already open term does not close it.
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'dialog' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    click,
    dismiss,
    role,
  ]);
  const titleId = useId();

  useEffect(() => {
    if (!inLink) return;
    const trigger = linkedTriggerRef.current;
    const link = trigger?.closest('a');
    if (!trigger || !link) return;

    // Position at the term, but use the containing link as the keyboard reference. A nested
    // button or a tabindex on the span would make the anchor's HTML invalid.
    refs.setReference(link);
    refs.setPositionReference(trigger);
    const onFocus = () => setIsOpen(true);
    const onBlur = () => {
      requestAnimationFrame(() => {
        const active = document.activeElement;
        if (active !== link && !refs.floating.current?.contains(active)) setIsOpen(false);
      });
    };
    link.addEventListener('focus', onFocus);
    link.addEventListener('blur', onBlur);
    if (document.activeElement === link) onFocus();
    return () => {
      link.removeEventListener('focus', onFocus);
      link.removeEventListener('blur', onBlur);
    };
  }, [inLink, refs]);

  return (
    <>
      {/* Inside a link the trigger must not be interactive: a button in an anchor is invalid HTML. */}
      {inLink ? (
        <span
          ref={linkedTriggerRef}
          className="border-b border-dotted border-fd-primary"
          {...getReferenceProps()}
        >
          {children}
        </span>
      ) : (
        <button
          ref={refs.setReference}
          type="button"
          className="cursor-text border-b border-dotted border-fd-primary"
          {...getReferenceProps()}
        >
          {children}
        </button>
      )}
      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              aria-labelledby={title ? titleId : undefined}
              className="z-9999 flex max-h-[60vh] max-w-[380px] flex-col overflow-hidden rounded-lg border bg-fd-popover text-fd-popover-foreground shadow-popover"
              {...getFloatingProps({
                // React bubbles events out of a portal through the component tree, so without this a
                // click in the definition reaches an enclosing link and navigates to its href.
                onClick: (event) => event.stopPropagation(),
              })}
            >
              {/* Portaled outside `.prose`, so links restate the prose link treatment. */}
              <div className="flex-1 overflow-y-auto px-5 py-4 leading-[1.6] [&_a]:font-medium [&_a]:underline [&_a]:decoration-fd-primary [&_a]:decoration-2 [&_a]:underline-offset-4 [&_a]:transition-colors [&_a]:duration-200 [&_a:hover]:text-fd-primary [&_a:hover]:decoration-current [&>:last-child]:mb-0">
                {title && (
                  <p id={titleId} className="mb-2 text-[1rem] font-semibold text-fd-foreground">
                    {title}
                  </p>
                )}
                {content}
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}
