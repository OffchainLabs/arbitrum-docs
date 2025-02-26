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

  useEffect(() => {
    if (isOpen) {
      const img = new Image();
      img.src = src;
      img.onload = () => setImageLoaded(true);
      img.onerror = (e) => console.error('Error loading image:', e);
    } else {
      setImageLoaded(false);
    }
  }, [isOpen, src]);

  const handleImageClick = () => {
    setIsOpen(true);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

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

  const renderModal = () => {
    if (!isOpen || typeof window === 'undefined') return null;

    return (
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
            onClick={(e) => {
              e.stopPropagation();
              handleClose(e);
            }}
            aria-label="Close zoom view"
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <img
        src={src}
        alt={alt || ''}
        className={`${className || ''}`}
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
