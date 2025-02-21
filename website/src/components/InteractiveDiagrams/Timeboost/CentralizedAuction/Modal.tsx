import React, { useState } from 'react';
import { useTransition, animated } from '@react-spring/web';
import styled from 'styled-components';
import * as Dialog from '@radix-ui/react-dialog';
import { createPortal } from 'react-dom';
import { NumberComponent } from './NumberComponent';
import { MDXProvider } from '@mdx-js/react';
import type { MDXComponents } from '@mdx-js/react/lib';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import solidity from 'react-syntax-highlighter/dist/cjs/languages/prism/solidity';
import { useColorMode } from '@docusaurus/theme-common';

SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('solidity', solidity);

const stepTitles = {
  1: 'Step 1: Deposit funds into the auction contract',
  2: 'Step 2: timeboost_submitBid()',
  3: 'Step 3: Auctioneer Response',
  4: 'Step 4: auctioneer_submitBidAuctionTransaction',
  5: 'Step 5: Sequencer prioritizes the auction contract calls',
};

const components = {
  h1: ({ children }) => <Title>{children}</Title>,
  p: ({ children }) => <p>{children}</p>,
  ol: ({ children }) => <ul>{children}</ul>,
  li: ({ children }) => <li>{children}</li>,
  pre: ({ children }) => children,
  code: ({ children, className }) => {
    const language = className?.replace('language-', '') || 'text';
    return (
      <SyntaxHighlighter
        language={language}
        style={useColorMode().isDarkTheme ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          padding: '16px',
          borderRadius: '4px',
          backgroundColor: useColorMode().isDarkTheme ? 'rgb(41, 45, 62)' : 'rgb(246, 248, 250)',
        }}
      >
        {children}
      </SyntaxHighlighter>
    );
  },
};

export function Modal({ number }: { number: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkTheme } = useColorMode();
  const StepContent = modalContent;

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

  const renderCodeBlock = (block: CodeBlock, index: number) => (
    <div key={index} style={{ position: 'relative' }}>
      <SyntaxHighlighter
        language={block.language}
        style={isDarkTheme ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          padding: '16px',
          borderRadius: '4px',
          backgroundColor: isDarkTheme ? 'rgb(41, 45, 62)' : 'rgb(246, 248, 250)',
        }}
      >
        {block.code.trim()}
      </SyntaxHighlighter>
    </div>
  );

  return (
    <>
      <g
        onClick={() => setIsOpen(true)}
        style={{
          cursor: 'pointer',
          pointerEvents: 'all',
        }}
      >
        <NumberComponent number={number} />
      </g>
      {typeof document !== 'undefined' &&
        createPortal(
          <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
            <Dialog.Portal>
              {overlayTransitions((styles, item) => item && <OverlayBackground style={styles} />)}
              {transitions(
                (styles, item) =>
                  item && (
                    <div
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        zIndex: 10000,
                        pointerEvents: 'none',
                      }}
                    >
                      <Content
                        $isDark={isDarkTheme}
                        forceMount
                        style={{
                          ...styles,
                          pointerEvents: 'auto',
                        }}
                      >
                        <DialogHeader>
                          <CloseButton $isDark={isDarkTheme} onClick={() => setIsOpen(false)}>
                            <CloseIcon />
                          </CloseButton>
                        </DialogHeader>
                        <Title $isDark={isDarkTheme}>{stepTitles[number]}</Title>
                        <DialogBody $isDark={isDarkTheme}>
                          <MDXProvider components={components}>
                            <StepContent />
                          </MDXProvider>
                        </DialogBody>
                      </Content>
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

const OverlayBackground = styled(animated(Dialog.Overlay))`
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
  z-index: 9999;
`;

const Content = styled(animated(Dialog.Content))<{ $isDark: boolean }>`
  position: relative;
  width: 100%;
  max-width: 800px;
  min-height: 200px;
  max-height: calc(100vh - 40px);
  background-color: ${(props) => (props.$isDark ? 'rgb(33, 49, 71)' : 'rgb(255, 255, 255)')};
  border-radius: 4px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  color: ${(props) => (props.$isDark ? '#fff' : '#000')};
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  overflow: hidden;
  will-change: transform, opacity;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const DialogHeader = styled.header`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
  flex-shrink: 0;
`;

const DialogBody = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding-right: 8px;
  flex: 1;
  -webkit-overflow-scrolling: touch;

  pre {
    margin: 0 !important;
    padding: 16px !important;
    border-radius: 4px !important;
    background-color: ${(props) =>
      props.$isDark ? 'rgb(41, 45, 62)' : 'rgb(246, 248, 250)'} !important;
    overflow-x: auto;
    max-width: 100%;
  }

  code {
    font-family: 'Fira Code', monospace !important;
    font-size: 14px !important;
    line-height: 1.5 !important;
    white-space: pre-wrap;
    word-break: break-word;
  }

  @media (max-width: 768px) {
    padding-right: 4px;

    pre {
      padding: 12px !important;
      margin: 0 -12px !important;
      border-radius: 0 !important;
    }

    code {
      font-size: 13px !important;
    }

    ul {
      padding-left: 20px;
      margin: 8px 0;
    }
  }
`;

const CloseButton = styled(Dialog.Close)<{ $isDark: boolean }>`
  background-color: transparent;
  border: none;
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
  color: ${(props) => (props.$isDark ? '#9dcced' : '#666')};

  &:hover {
    color: ${(props) => (props.$isDark ? '#fff' : '#000')};
  }
`;

const Title = styled(Dialog.Title)<{ $isDark: boolean }>`
  font-size: 20px;
  margin-bottom: 16px;
  padding-right: 24px;
  flex-shrink: 0;
  color: ${(props) => (props.$isDark ? '#fff' : '#000')};

  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 12px;
  }
`;
