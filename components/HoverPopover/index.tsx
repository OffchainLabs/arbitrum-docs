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

/**
 * Generic hover/focus popover built on `@floating-ui/react`. The interaction primitive behind
 * `<Term>`: inline, opens on hover/focus, closes on leave/blur. Owns open state,
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

  // `safePolygon()` keeps the popover open while the pointer crosses the gap toward it, so the
  // cross-reference links inside a definition stay reachable.
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
        className="cursor-text border-b border-dotted border-fd-primary"
        {...getReferenceProps()}
      >
        {children}
      </button>
      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="z-9999 flex max-h-[60vh] max-w-[380px] flex-col overflow-hidden rounded-lg border bg-fd-popover text-fd-popover-foreground shadow-[0_8px_30px_rgb(0_0_0/0.12)]"
            {...getFloatingProps()}
          >
            {/* Portaled outside `.prose`, so links restate the prose link treatment. */}
            <div className="flex-1 overflow-y-auto px-5 py-4 leading-[1.6] [&_a]:font-medium [&_a]:underline [&_a]:decoration-fd-primary [&_a]:decoration-2 [&_a]:underline-offset-4 [&_a]:transition-colors [&_a]:duration-200 [&_a:hover]:text-fd-primary [&_a:hover]:decoration-current [&>:last-child]:mb-0">
              {title && (
                <p className="mb-2 text-[1rem] font-semibold text-fd-foreground">{title}</p>
              )}
              {content}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
