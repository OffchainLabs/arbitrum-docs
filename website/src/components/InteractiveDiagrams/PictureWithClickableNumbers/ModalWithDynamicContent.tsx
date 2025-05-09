import React, { useState } from 'react';
import { useTransition, animated } from '@react-spring/web';
import * as Dialog from '@radix-ui/react-dialog';
import { createPortal } from 'react-dom';
import Button from './Button';
import { MDXProvider } from '@mdx-js/react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import solidity from 'react-syntax-highlighter/dist/cjs/languages/prism/solidity';
import { useColorMode } from '@docusaurus/theme-common';
import { SyntaxHighlighterProps } from './types';
import { coordinates as defaultCoordinates } from './constants';
import DiagramContentMap from '../DiagramContentMap';

/**
 * Interface for code block data structure.
 */
interface CodeBlock {
  language: string;
  code: string;
}

/**
 * A wrapper component for SyntaxHighlighter with proper TypeScript typing.
 */
const StyledSyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({
  language,
  style,
  customStyle,
  children,
}) => {
  return (
    <SyntaxHighlighter language={language} style={style} customStyle={customStyle}>
      {children}
    </SyntaxHighlighter>
  );
};

SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('solidity', solidity);

const components = {
  h1: ({ children }) => <h1 className="modal__title">{children}</h1>,
  p: ({ children }) => <p>{children}</p>,
  ol: ({ children }) => <ul>{children}</ul>,
  li: ({ children }) => <li>{children}</li>,
  pre: ({ children }) => children,
  code: ({ children, className }) => {
    const language = className?.replace('language-', '') || 'text';
    return (
      <StyledSyntaxHighlighter
        language={language}
        style={useColorMode().isDarkTheme ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          padding: '16px',
          borderRadius: '4px',
          backgroundColor: useColorMode().isDarkTheme ? 'rgb(41, 45, 62)' : 'rgb(246, 248, 250)',
        }}
      >
        {String(children)}
      </StyledSyntaxHighlighter>
    );
  },
};

/**
 * Modal component with dynamic content loading for the PictureWithClickableNumbers diagram.
 */
export function ModalWithDynamicContent({
  number,
  customContent,
  coordinates,
  children,
  id = 'default',
  diagramId = 'centralized-auction',
}: {
  number: 1 | 2 | 3 | 4 | 5;
  customContent?: React.ComponentType;
  coordinates?: typeof defaultCoordinates;
  children?: React.ReactNode;
  id?: string;
  diagramId?: string;
}) {
  /**
   * State to track whether the modal is currently open.
   */
  const [isOpen, setIsOpen] = useState(false);

  // Create a unique modal ID for this instance
  const modalId = `modal-${id}-${number}`;

  /**
   * Get the current color mode (light/dark) from Docusaurus.
   */
  const { isDarkTheme } = useColorMode();

  /**
   * Determine the content to display in the modal
   */
  const StepContent = customContent
    ? customContent
    : () => <DiagramContentMap diagramId={diagramId} stepNumber={String(number)} />;

  /**
   * Animation configuration for the modal content.
   */
  const transitions = useTransition(isOpen, {
    from: { opacity: 0, transform: 'scale(0.95)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(0.95)' },
    config: { tension: 300, friction: 20 },
  });

  /**
   * Animation configuration for the modal overlay.
   */
  const overlayTransitions = useTransition(isOpen, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: 200 },
  });

  /**
   * Renders a code block with syntax highlighting.
   */
  const renderCodeBlock = (block: CodeBlock, index: number) => (
    <div key={index} style={{ position: 'relative' }}>
      <StyledSyntaxHighlighter
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
      </StyledSyntaxHighlighter>
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
        {children || <Button number={number} type="dynamic" coordinates={coordinates} id={id} />}
      </g>
      {typeof document !== 'undefined' &&
        createPortal(
          <Dialog.Root open={isOpen} onOpenChange={setIsOpen} id={modalId}>
            <Dialog.Portal>
              {overlayTransitions(
                (styles, item) =>
                  item && <Dialog.Overlay className="modal__overlay" style={styles} />,
              )}
              {transitions(
                (styles, item) =>
                  item && (
                    <div className="modal__container">
                      <Dialog.Content
                        className="modal__content"
                        forceMount
                        style={{
                          ...styles,
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
                        <MDXProvider components={components}>
                          <StepContent />
                        </MDXProvider>
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

/**
 * Close icon for the modal dialog.
 */
const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M15.9574 14.1689L8.59651 6.75098L6.73232 8.59598L14.1313 16.071L6.71338 23.4129L8.5964 25.2769L15.9574 17.8779L23.3943 25.2769L25.2392 23.4129L17.8213 16.071L25.2202 8.59598L23.3752 6.75098L15.9574 14.1689Z"
      fill="currentColor"
    />
  </svg>
);
