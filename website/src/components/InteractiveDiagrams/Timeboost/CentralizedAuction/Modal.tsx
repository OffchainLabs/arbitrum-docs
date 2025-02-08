import React, { useState } from 'react';
import { useTransition, animated } from '@react-spring/web';
import styled from 'styled-components';
import * as Dialog from '@radix-ui/react-dialog';
import { createPortal } from 'react-dom';
import { NumberComponent } from './NumberComponent';
import modalContent from './modalContent.json';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import solidity from 'react-syntax-highlighter/dist/cjs/languages/prism/solidity';
import { useColorMode } from '@docusaurus/theme-common';

SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('solidity', solidity);

type StepNumber = '1' | '2' | '3' | '4' | '5';

interface CodeBlock {
  language: string;
  code: string;
}

interface ModalContent {
  title: string;
  content: {
    description: string;
    steps: string[];
    codeBlocks?: CodeBlock[];
  };
}

const ANIMATION_CONFIG = {
  from: {
    scale: 0,
    opacity: 0,
  },
  enter: {
    scale: 1,
    opacity: 1,
  },
  leave: {
    scale: 0,
    opacity: 0,
  },
};

export function Modal({ number }: { number: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkTheme } = useColorMode();
  const content: ModalContent = modalContent[number.toString() as StepNumber];
  const transition = useTransition(isOpen, ANIMATION_CONFIG);

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

  const renderModalContent = (style: any) => (
    <Content $isDark={isDarkTheme} forceMount style={style}>
      <DialogHeader>
        <CloseButton $isDark={isDarkTheme} onClick={() => setIsOpen(false)}>
          <CloseIcon />
        </CloseButton>
      </DialogHeader>
      <Title $isDark={isDarkTheme}>{content.title}</Title>
      <DialogBody $isDark={isDarkTheme}>
        <div>
          <p>{content.content.description}</p>
          <ul>
            {content.content.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
        {content.content.codeBlocks?.map(renderCodeBlock)}
      </DialogBody>
    </Content>
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
              <OverlayBackground />
              <div style={{
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
              }}>
                {renderModalContent({})}
              </div>
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
