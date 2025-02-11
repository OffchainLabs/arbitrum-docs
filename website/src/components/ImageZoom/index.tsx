/** @browser-only
 * ImageZoom Component
 *
 * A React component that adds a click-to-zoom feature to images with smooth animations.
 *
 * Features:
 * - Smooth fade and scale animations
 * - Responsive sizing (max 90% of viewport)
 * - Dark overlay background
 * - Close on overlay click, escape key, or close button
 * - Mobile-friendly
 *
 * Usage in MDX files:
 * ```mdx
 * import { ImageZoom } from '@site/src/components/ImageZoom';
 *
 * <ImageZoom
 *   src="path/to/your/image.png"
 *   alt="Description of the image"
 *   className="optional-custom-class"
 * />
 * ```
 *
 * Usage in React components:
 * ```tsx
 * import { ImageZoom } from '@site/src/components/ImageZoom';
 *
 * function YourComponent() {
 *   return (
 *     <ImageZoom
 *       src="/images/example.png"
 *       alt="Example image"
 *       className="optional-styling"
 *     />
 *   );
 * }
 * ```
 *
 * Props:
 * @param {string} src - The source URL of the image
 * @param {string} [alt] - Optional alt text for the image
 * @param {string} [className] - Optional CSS class name for additional styling
 *
 * Dependencies:
 * - @react-spring/web (for animations)
 * - styled-components (for styling)
 * - @radix-ui/react-dialog (for modal functionality)
 */

import React, { useState } from 'react';
import { useTransition, animated } from '@react-spring/web';
import styled from 'styled-components';
import * as Dialog from '@radix-ui/react-dialog';
import { createPortal } from 'react-dom';

interface ImageZoomProps {
  src: string;
  alt?: string;
  className?: string;
}

export function ImageZoom({ src, alt, className }: ImageZoomProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');

  React.useEffect(() => {
    // For documentation site, we only need to handle string paths
    setImageSrc(src as string);
  }, [src]);

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
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt || ''}
          className={`cursor-zoom-in ${className || ''}`}
          onClick={() => setIsOpen(true)}
        />
      )}
      {typeof document !== 'undefined' &&
        createPortal(
          <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
            <Dialog.Portal>
              {overlayTransitions(
                (styles, item) =>
                  item && <OverlayBackground style={styles} onClick={() => setIsOpen(false)} />,
              )}
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
                        style={{
                          ...styles,
                          pointerEvents: 'auto',
                        }}
                      >
                        <CloseButton onClick={() => setIsOpen(false)}>
                          <CloseIcon />
                        </CloseButton>
                        <ZoomedImage
                          src={imageSrc}
                          alt={alt || ''}
                          onClick={(e) => e.stopPropagation()}
                        />
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

const OverlayBackground = styled(animated(Dialog.Overlay))`
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  position: fixed;
  inset: 0;
  z-index: 9999;
  cursor: zoom-out;
`;

const Content = styled(animated.div)`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ZoomedImage = styled.img`
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 4px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;

  &:hover {
    opacity: 0.8;
  }
`;

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M15.9574 14.1689L8.59651 6.75098L6.73232 8.59598L14.1313 16.071L6.71338 23.4129L8.5964 25.2769L15.9574 17.8779L23.3943 25.2769L25.2392 23.4129L17.8213 16.071L25.2202 8.59598L23.3752 6.75098L15.9574 14.1689Z"
      fill="currentColor"
    />
  </svg>
);
