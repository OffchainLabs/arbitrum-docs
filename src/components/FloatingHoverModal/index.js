import React, { useState, cloneElement } from 'react';
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
// Remove Link import - we'll use a span instead to avoid Docusaurus broken link detection (Docusaurus's build will fail if a <Link> points to a non-existent page)
import './styles.css';

// Import all config partials statically to avoid CSP issues
import ConfigCustomGasToken from '@site/docs/launch-arbitrum-chain/partials/config-custom-gas-token.mdx';
import ConfigAltDa from '@site/docs/launch-arbitrum-chain/partials/config-alt-da.mdx';
import ConfigDedicatedThroughput from '@site/docs/launch-arbitrum-chain/partials/config-dedicated-throughput.mdx';
import ConfigNativeEth from '@site/docs/launch-arbitrum-chain/partials/config-native-eth.mdx';
import ConfigHardware from '@site/docs/launch-arbitrum-chain/partials/config-hardware.mdx';
import ConfigRollup from '@site/docs/launch-arbitrum-chain/partials/config-rollup.mdx';
import ConfigAnytrust from '@site/docs/launch-arbitrum-chain/partials/config-anytrust.mdx';
import ConfigFastwithdrawals from '@site/docs/launch-arbitrum-chain/partials/config-fast-withdrawals.mdx';
import ConfigTimeboost from '@site/docs/launch-arbitrum-chain/partials/config-timeboost.mdx';
import ConfigBold from '@site/docs/launch-arbitrum-chain/partials/config-bold.mdx';
import ConfigPermissionedValidators from '@site/docs/launch-arbitrum-chain/partials/config-permissioned-validators.mdx';
import ConfigL1ChallengePeriod from '@site/docs/launch-arbitrum-chain/partials/config-l1-challenge-period.mdx';

// Static content mapping
const contentMap = {
  'config-custom-gas-token': ConfigCustomGasToken,
  'config-alt-da': ConfigAltDa,
  'config-dedicated-throughput': ConfigDedicatedThroughput,
  'config-native-eth': ConfigNativeEth,
  'config-hardware': ConfigHardware,
  'config-rollup': ConfigRollup,
  'config-anytrust': ConfigAnytrust,
  'config-fast-withdrawals': ConfigFastwithdrawals,
  'config-timeboost': ConfigTimeboost,
  'config-bold': ConfigBold,
  'config-permissioned-validators': ConfigPermissionedValidators,
  'config-l1-challenge-period': ConfigL1ChallengePeriod,
};

// MDX components for proper rendering
const mdxComponents = {
  h1: ({ children }) => <h1 className="floating-modal__title">{children}</h1>,
  h2: ({ children }) => <h2 className="floating-modal__subtitle">{children}</h2>,
  p: ({ children }) => <p className="floating-modal__paragraph">{children}</p>,
  ul: ({ children }) => <ul className="floating-modal__list">{children}</ul>,
  ol: ({ children }) => <ol className="floating-modal__list">{children}</ol>,
  li: ({ children }) => <li className="floating-modal__list-item">{children}</li>,
  strong: ({ children }) => <strong className="floating-modal__strong">{children}</strong>,
  code: ({ children }) => <code className="floating-modal__inline-code">{children}</code>,
  table: ({ children }) => <table className="floating-modal__table">{children}</table>,
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => <th className="floating-modal__th">{children}</th>,
  td: ({ children }) => <td className="floating-modal__td">{children}</td>,
  a: ({ children, href }) => (
    <a href={href} className="floating-modal__link" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

export function FloatingHoverModal({ href, children }) {
  const [isOpen, setIsOpen] = useState(false);

  // Extract content key from href
  const extractContentKey = (href) => {
    const match = href.match(/\/partials\/([\w-]+)\.mdx$/);
    return match ? match[1] : null;
  };

  const contentKey = extractContentKey(href);
  const ContentComponent = contentMap[contentKey];

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(10),
      flip({
        fallbackAxisSideDirection: 'start',
      }),
      shift({ padding: 5 }),
    ],
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
      <button
        ref={ref}
        className="floating-hover-modal__trigger"
        type="button"
        {...getReferenceProps()}
      >
        {children}
      </button>

      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="floating-hover-modal__content"
            {...getFloatingProps()}
          >
            <div className="floating-hover-modal__header">
              <button
                className="floating-hover-modal__close"
                onClick={() => setIsOpen(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="floating-hover-modal__body">
              {ContentComponent ? (
                <MDXProvider components={mdxComponents}>
                  <ContentComponent />
                </MDXProvider>
              ) : (
                <div className="floating-modal__error">
                  <h2 className="floating-modal__subtitle">Content Not Available</h2>
                  <p className="floating-modal__paragraph">
                    The content for "{contentKey}" is not currently available.
                  </p>
                </div>
              )}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
