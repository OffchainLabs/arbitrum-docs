import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ImageZoomProps {
  src: string;
  alt?: string;
  className?: string;
}

export default function ImageZoom({ src, alt, className }: ImageZoomProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create portal container on mount
    if (typeof window !== 'undefined') {
      const container = document.createElement('div');
      container.id = 'image-zoom-portal';
      document.body.appendChild(container);
      setPortalContainer(container);

      return () => {
        document.body.removeChild(container);
      };
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const img = new Image();
      img.src = src;
      img.onload = () => setImageLoaded(true);
      img.onerror = (e) => {
        console.error('Error loading image:', e);
        setIsOpen(false);
      };
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      setImageLoaded(false);
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, src]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleImageClick = () => {
    setIsOpen(true);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  const renderModal = () => {
    if (!isOpen || !portalContainer) return null;

    return createPortal(
      <div className="image-zoom__modal" onClick={handleClose}>
        <div className="image-zoom__container">
          {imageLoaded ? (
            <img
              src={src}
              alt={alt || ''}
              className="image-zoom__image"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="image-zoom__loading">Loading...</div>
          )}
          <button
            className="image-zoom__close"
            onClick={handleClose}
            aria-label="Close zoom view"
          >
            ✕
          </button>
        </div>
      </div>,
      portalContainer
    );
  };

  return (
    <>
      <img
        src={src}
        alt={alt || ''}
        className={className}
        onClick={handleImageClick}
        style={{ cursor: 'zoom-in' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleImageClick()}
      />
      {renderModal()}
    </>
  );
}
