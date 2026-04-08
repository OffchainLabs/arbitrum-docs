import React, { useState } from 'react';
import {
  useFloating,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  offset,
  flip,
  shift,
  autoUpdate,
  useMergeRefs,
} from '@floating-ui/react';
import { MDXProvider } from '@mdx-js/react';
const mdxComponents = {
  h1: ({ children }) => <h1 className="diagram-hover-modal__title">{children}</h1>,
  h2: ({ children }) => <h2 className="diagram-hover-modal__subtitle">{children}</h2>,
  h3: ({ children }) => <h3 className="diagram-hover-modal__heading3">{children}</h3>,
  h4: ({ children }) => <h4 className="diagram-hover-modal__heading4">{children}</h4>,
  p: ({ children }) => <p className="diagram-hover-modal__paragraph">{children}</p>,
  ul: ({ children }) => <ul className="diagram-hover-modal__list">{children}</ul>,
  ol: ({ children }) => <ol className="diagram-hover-modal__list">{children}</ol>,
  li: ({ children }) => <li className="diagram-hover-modal__list-item">{children}</li>,
  strong: ({ children }) => <strong className="diagram-hover-modal__strong">{children}</strong>,
  code: ({ children }) => <code className="diagram-hover-modal__inline-code">{children}</code>,
  a: ({ children, href }) => (
    <a href={href} className="diagram-hover-modal__link" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

interface DiagramHoverModalProps {
  ContentComponent: React.ComponentType;
  children: React.ReactNode;
}

export function DiagramHoverModal({ ContentComponent, children }: DiagramHoverModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(10), flip({ fallbackAxisSideDirection: 'start' }), shift({ padding: 5 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    move: false,
    delay: { open: 150, close: 150 },
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'dialog' });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  const ref = useMergeRefs([refs.setReference]);

  return (
    <>
      <span ref={ref} className="diagram-hover-modal__trigger" {...getReferenceProps()}>
        {children}
      </span>

      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="diagram-hover-modal__content"
            {...getFloatingProps()}
          >
            <div className="diagram-hover-modal__header">
              <button
                className="diagram-hover-modal__close"
                onClick={() => setIsOpen(false)}
                aria-label="Close modal"
              >
                x
              </button>
            </div>
            <div className="diagram-hover-modal__body">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- Docusaurus bundles conflicting @types/react versions */}
              <MDXProvider components={mdxComponents as any}>
                <ContentComponent />
              </MDXProvider>
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
