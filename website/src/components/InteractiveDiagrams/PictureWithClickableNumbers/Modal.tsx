import React, { useState } from 'react';
import { useTransition, animated } from '@react-spring/web';
import * as Dialog from '@radix-ui/react-dialog';
import step1Content from './modal-centralized-auction-step-1.mdx';
import step2Content from './modal-centralized-auction-step-2.mdx';
import step3Content from './modal-centralized-auction-step-3.mdx';
import step4Content from './modal-centralized-auction-step-4.mdx';
import step5Content from './modal-centralized-auction-step-5.mdx';
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

/**
 * Interface for code block data structure.
 */
interface CodeBlock {
  language: string;
  code: string;
}

/**
 * A wrapper component for SyntaxHighlighter with proper TypeScript typing.
 *
 * @param props - The component props
 * @param props.language - The programming language for syntax highlighting
 * @param props.style - The style theme to apply
 * @param props.customStyle - Additional custom styles to apply
 * @param props.children - The code content to highlight
 * @returns A syntax-highlighted code block
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
 * Modal component for the PictureWithClickableNumbers diagram.
 *
 * @remarks
 * This component renders an interactive modal that displays step-specific content
 * when a numbered button is clicked. It uses React Spring for animations and
 * Radix UI for the dialog functionality.
 *
 * @param props - The component props
 * @param props.number - The step number (1-5) that determines which content to display
 * @param props.customContent - Optional custom content component to override default step content
 * @returns An SVG element with a clickable number that opens a modal with step-specific content
 */
export function Modal({
  number,
  customContent,
  coordinates,
  children,
  id = 'default',
}: {
  number: 1 | 2 | 3 | 4 | 5;
  customContent?: React.ComponentType;
  coordinates?: typeof defaultCoordinates;
  children?: React.ReactNode;
  id?: string;
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
   * Map of step numbers to their corresponding content components.
   */
  const stepContent = {
    1: step1Content,
    2: step2Content,
    3: step3Content,
    4: step4Content,
    5: step5Content,
  };
  const StepContent = customContent || stepContent[number];

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
   *
   * @param block - The code block to render
   * @param index - The index of the code block
   * @returns A styled code block with syntax highlighting
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
 *
 * @returns An SVG element representing a close (X) button
 */
const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M15.9574 14.1689L8.59651 6.75098L6.73232 8.59598L14.1313 16.071L6.71338 23.4129L8.5964 25.2769L15.9574 17.8779L23.3943 25.2769L25.2392 23.4129L17.8213 16.071L25.2202 8.59598L23.3752 6.75098L15.9574 14.1689Z"
      fill="currentColor"
    />
  </svg>
);
