import React, { useState } from 'react';
import { useTransition, animated } from '@react-spring/web';
import * as Dialog from '@radix-ui/react-dialog';
import { createPortal } from 'react-dom';
import { MDXProvider } from '@mdx-js/react';
import { useColorMode } from '@docusaurus/theme-common';
import type { NodeId } from './types';
import { NODE_LABELS, DEEP_DIVE_LINKS } from './constants';

import userInboxContent from './modals/modal-user-inbox.mdx';
import delayedInboxContent from './modals/modal-delayed-inbox.mdx';
import sequencerContent from './modals/modal-sequencer.mdx';
import sequencerFeedContent from './modals/modal-sequencer-feed.mdx';
import batchCompressContent from './modals/modal-batch-compress.mdx';
import sequencedTxsContent from './modals/modal-sequenced-txs.mdx';
import stfContent from './modals/modal-stf.mdx';
import stateContent from './modals/modal-state.mdx';
import l2BlocksContent from './modals/modal-l2-blocks.mdx';
import l1ChainContent from './modals/modal-l1-chain.mdx';

const components = {
  h1: ({ children }: { children: React.ReactNode }) => <h1 className="modal__title">{children}</h1>,
  p: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  ul: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  ol: ({ children }: { children: React.ReactNode }) => <ol>{children}</ol>,
  li: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  a: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

const contentMap: Record<NodeId, React.ComponentType> = {
  userInbox: userInboxContent,
  delayedInbox: delayedInboxContent,
  sequencer: sequencerContent,
  sequencerFeed: sequencerFeedContent,
  batchCompress: batchCompressContent,
  sequencedTxs: sequencedTxsContent,
  stf: stfContent,
  state: stateContent,
  l2Blocks: l2BlocksContent,
  l1Chain: l1ChainContent,
};

interface ModalProps {
  nodeId: NodeId;
  children: React.ReactNode;
}

export function Modal({ nodeId, children }: ModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  let isDarkTheme = false;
  try {
    const colorMode = useColorMode();
    isDarkTheme = colorMode.isDarkTheme;
  } catch {
    // During SSG, useColorMode throws an error - use default
  }

  const ContentComponent = contentMap[nodeId];
  const deepDiveLink = DEEP_DIVE_LINKS[nodeId];

  const transitions = useTransition(isOpen, {
    from: { opacity: 0, transform: 'scale(0.95)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(0.95)' },
    config: { tension: 300, friction: 20 },
  });

  const overlayTransitions = useTransition(isOpen, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: 200 },
  });

  return (
    <>
      <g
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Learn more about ${NODE_LABELS[nodeId]}`}
        style={{
          cursor: 'pointer',
          pointerEvents: 'all',
        }}
      >
        {children}
      </g>
      {typeof document !== 'undefined' &&
        createPortal(
          <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
            <Dialog.Portal>
              {overlayTransitions(
                (styles, item) =>
                  item && (
                    <animated.div>
                      <Dialog.Overlay
                        className="modal__overlay"
                        style={styles as React.CSSProperties}
                      />
                    </animated.div>
                  ),
              )}
              {transitions(
                (styles, item) =>
                  item && (
                    <div className="modal__container">
                      <Dialog.Content
                        className="modal__content"
                        forceMount
                        style={{
                          ...(styles as React.CSSProperties),
                          pointerEvents: 'auto',
                        }}
                      >
                        <header className="modal__header">
                          <Dialog.Close
                            className="modal__close-button"
                            onClick={() => setIsOpen(false)}
                          >
                            <CloseIcon />
                          </Dialog.Close>
                        </header>
                        <div className="modal__body">
                          <MDXProvider components={components}>
                            <ContentComponent />
                          </MDXProvider>
                          <div className="transaction-lifecycle-modal__deep-dive">
                            <a href={deepDiveLink}>Read the deep dive documentation &rarr;</a>
                          </div>
                        </div>
                      </Dialog.Content>
                    </div>
                  ),
              )}
            </Dialog.Portal>
          </Dialog.Root>,
          document.body,
        )}
    </>
  );
}

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M15.9574 14.1689L8.59651 6.75098L6.73232 8.59598L14.1313 16.071L6.71338 23.4129L8.5964 25.2769L15.9574 17.8779L23.3943 25.2769L25.2392 23.4129L17.8213 16.071L25.2202 8.59598L23.3752 6.75098L15.9574 14.1689Z"
      fill="currentColor"
    />
  </svg>
);
