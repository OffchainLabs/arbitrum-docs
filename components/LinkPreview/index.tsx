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
  useHover,
  useInteractions,
} from '@floating-ui/react';
import { ArrowUpRight } from 'lucide-react';
import { type ReactNode, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import type { LinkPreview as LinkPreviewData } from '@/lib/link-preview';

// One request per target per session. A 404 or a failed fetch caches as null: no card.
const cache = new Map<string, Promise<LinkPreviewData | null>>();

function load(url: string): Promise<LinkPreviewData | null> {
  let entry = cache.get(url);
  if (!entry) {
    entry = fetch(url)
      .then((response) => (response.ok ? (response.json() as Promise<LinkPreviewData>) : null))
      .catch(() => null);
    cache.set(url, entry);
  }
  return entry;
}

type PointerHandler = (event: PointerEvent) => void;

/**
 * Wikipedia-style page preview for the internal link in `children`. Pointer-only: the link itself
 * is the keyboard path, so the card takes no focus and has no role. The whole card is a link that
 * opens the previewed page in a new tab.
 */
export function LinkPreview({
  previewUrl,
  hash,
  children,
}: {
  previewUrl: string;
  hash?: string | undefined;
  children: ReactNode;
}) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<LinkPreviewData | null>(null);
  const id = useId();

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    middleware: [offset(8), flip({ fallbackAxisSideDirection: 'start' }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const hover = useHover(context, {
    mouseOnly: true,
    move: false,
    delay: { open: 400, close: 150 },
    handleClose: safePolygon(),
  });
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, dismiss]);
  // `useHover` learns the pointer type from its reference props, which cannot be spread on the
  // server-rendered link. The listeners below forward the native events to them.
  const referenceProps = useRef(getReferenceProps());
  useLayoutEffect(() => {
    referenceProps.current = getReferenceProps();
  });

  useEffect(() => {
    const anchor = wrapperRef.current?.querySelector('a');
    if (!anchor || matchMedia('(hover: none)').matches) return;
    // A <Term> in the link keeps its own popover; a link in a definition gets no second card.
    if (anchor.querySelector('[data-hover-popover]')) return;
    if (anchor.closest('[data-hover-popover-panel]')) return;

    refs.setReference(anchor);
    const onPointerEnter = (event: PointerEvent) => {
      (referenceProps.current.onPointerEnter as PointerHandler | undefined)?.(event);
      // Start the fetch now so it overlaps the open delay. A touch pointer never opens a card.
      if (event.pointerType !== 'touch') void load(previewUrl).then(setData);
    };
    const onPointerDown = (event: PointerEvent) =>
      (referenceProps.current.onPointerDown as PointerHandler | undefined)?.(event);
    anchor.addEventListener('pointerenter', onPointerEnter);
    anchor.addEventListener('pointerdown', onPointerDown);
    return () => {
      anchor.removeEventListener('pointerenter', onPointerEnter);
      anchor.removeEventListener('pointerdown', onPointerDown);
    };
  }, [previewUrl, refs]);

  const visible = open && data !== null;
  useEffect(() => {
    const anchor = refs.domReference.current;
    if (!visible || !anchor) return;
    anchor.setAttribute('aria-describedby', id);
    return () => anchor.removeAttribute('aria-describedby');
  }, [visible, id, refs]);

  return (
    <>
      <span ref={wrapperRef} className="contents">
        {children}
      </span>
      {visible && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            id={id}
            {...getFloatingProps()}
            className="z-9999 max-w-[380px] rounded-lg border bg-fd-popover text-fd-popover-foreground shadow-popover"
          >
            {/* The whole card is the link, so it takes the hover cues a prose link has: the title
                in the link colour, an underline and a tint on hover. The Term card has none. */}
            <a
              href={hash ? `${data.url}#${hash}` : data.url}
              target="_blank"
              rel="noopener"
              className="group block rounded-lg px-5 py-4 text-sm leading-[1.6] transition-colors duration-200 hover:bg-fd-accent"
            >
              <span className="mb-2 flex items-center justify-between text-[0.6875rem] font-medium tracking-[0.08em] text-fd-muted-foreground uppercase">
                Preview
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </span>
              <PreviewBody data={data} hash={hash} />
            </a>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

function PreviewBody({ data, hash }: { data: LinkPreviewData; hash?: string | undefined }) {
  const titleClass =
    'font-semibold text-fd-primary decoration-2 underline-offset-4 group-hover:underline';
  const section = hash && Object.hasOwn(data.sections, hash) ? data.sections[hash] : undefined;
  if (section) {
    return (
      <>
        <span className="mb-1 block text-xs text-fd-muted-foreground">{data.title}</span>
        <span className={`mb-2 block text-[1rem] ${titleClass}`}>{section.heading}</span>
        {section.text && <span className="block">{section.text}</span>}
      </>
    );
  }
  return (
    <>
      <span className={`mb-2 block text-[1rem] ${titleClass}`}>{data.title}</span>
      {data.description && <span className="mb-2 block">{data.description}</span>}
      {data.lead && data.lead !== data.description && (
        <span className="block text-fd-muted-foreground">{data.lead}</span>
      )}
    </>
  );
}
