import React, { useState } from 'react';
import { useTransition } from '@react-spring/web';
import * as Dialog from '@radix-ui/react-dialog';
import { createPortal } from 'react-dom';
import Button from './Button';
import { coordinates as defaultCoordinates } from './constants';
import { ModalContentLoader } from '../modals-as-pages-plugin/exports';
import { getDiagramContentParams } from '../modals-as-pages-plugin/registry';

/**
 * Enhanced Modal component for PictureWithClickableNumbers that integrates with the modals-as-pages-plugin.
 * This version supports loading content from MDX files via the plugin system.
 *
 * @param props - The component props
 * @param props.number - The step number (1-5) that determines which content to display
 * @param props.customContent - Optional custom content component to override default step content
 * @param props.usePlugin - Whether to use the modals-as-pages-plugin for content loading
 * @param props.contextId - Context ID for the content (default: 'diagrams')
 * @param props.groupId - Group ID for the content (defaults to diagramId)
 * @param props.contentId - Content ID (defaults to step-{number})
 * @returns A modal component with content that can be loaded from the plugin registry
 */
export function ModalWithPlugin({
  number,
  customContent,
  coordinates,
  children,
  id = 'default',
  diagramId = 'centralized-auction',
  usePlugin = true,
  contextId,
  groupId,
  contentId,
}: {
  number: 1 | 2 | 3 | 4 | 5;
  customContent?: React.ComponentType;
  coordinates?: typeof defaultCoordinates;
  children?: React.ReactNode;
  id?: string;
  diagramId?: string;
  usePlugin?: boolean;
  contextId?: string;
  groupId?: string;
  contentId?: string;
}) {
  /**
   * State to track whether the modal is currently open.
   */
  const [isOpen, setIsOpen] = useState(false);

  // Create a unique modal ID for this instance
  const modalId = `modal-${id}-${number}`;

  /**
   * Determine content parameters based on props
   */
  const {
    contextId: resolvedContextId,
    groupId: resolvedGroupId,
    contentId: resolvedContentId,
  } = contextId && groupId && contentId
    ? { contextId, groupId, contentId }
    : getDiagramContentParams(diagramId, number);

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
   * Render the content based on whether we're using the plugin or custom content
   */
  const renderContent = () => {
    // If custom content is provided, use it
    if (customContent) {
      const CustomContent = customContent;
      return <CustomContent />;
    }

    // If the plugin should be used, load content from the registry
    if (usePlugin) {
      return (
        <ModalContentLoader
          contextId={resolvedContextId}
          groupId={resolvedGroupId}
          contentId={resolvedContentId}
          fallback={
            <div className="modal-content-error">
              <h2>Content not found</h2>
              <p>
                Could not find content for diagram "{diagramId}", step {number}.
              </p>
              <p>
                Make sure you have created the content file at:
                <code>
                  content/{resolvedContextId}/{resolvedGroupId}/{resolvedContentId}.mdx
                </code>
              </p>
            </div>
          }
          className="modal-content-container"
        />
      );
    }

    // Fallback to error message
    return (
      <div className="modal-content-error">
        <h2>No content source specified</h2>
        <p>Please provide either customContent or set usePlugin to true.</p>
      </div>
    );
  };

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
                        {renderContent()}
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
