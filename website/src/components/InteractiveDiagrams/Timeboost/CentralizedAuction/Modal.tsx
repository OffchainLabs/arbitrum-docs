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
        <CloseButton $isDark={isDarkTheme}>
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
          position: 'relative',
          zIndex: 10,
        }}
      >
        <NumberComponent number={number} />
      </g>
      {typeof document !== 'undefined' &&
        createPortal(
          <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
            <Dialog.Portal forceMount>
              {transition((style, isOpen) => (
                <>
                  {isOpen && <OverlayBackground style={{ opacity: style.opacity }} />}
                  {isOpen && renderModalContent(style)}
                </>
              ))}
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
  pointer-events: all;
  position: fixed;
  inset: 0;
  z-index: 9999;
`;

const Content = styled(animated(Dialog.Content))<{ $isDark: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 400px;
  max-width: 800px;
  width: 50vw;
  min-height: 200px;
  max-height: 80vh;
  height: fit-content;
  background-color: ${props => props.$isDark ? 'rgb(33, 49, 71)' : 'rgb(255, 255, 255)'};
  border-radius: 4px;
  padding: 24px 24px 32px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  color: ${props => props.$isDark ? '#fff' : '#000'};
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
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
  margin-bottom: 6px;
  overflow-y: auto;
  padding-right: 8px;
  flex: 1;

  pre {
    margin: 0 !important;
    padding: 16px !important;
    border-radius: 4px !important;
    background-color: ${props => props.$isDark ? 'rgb(41, 45, 62)' : 'rgb(246, 248, 250)'} !important;
  }

  code {
    font-family: 'Fira Code', monospace !important;
    font-size: 14px !important;
    line-height: 1.5 !important;
  }
`;

const CloseButton = styled(Dialog.Close)<{ $isDark: boolean }>`
  background-color: transparent;
  border: none;
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
  color: ${props => props.$isDark ? '#9dcced' : '#666'};

  &:hover {
    color: ${props => props.$isDark ? '#fff' : '#000'};
  }
`;

const Title = styled(Dialog.Title)<{ $isDark: boolean }>`
  font-size: 20px;
  margin-bottom: 16px;
  flex-shrink: 0;
  color: ${props => props.$isDark ? '#fff' : '#000'};
`;
