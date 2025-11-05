/**
 * ImageZoom Component
 *
 * A React component that adds a click-to-zoom feature to images with smooth animations.
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ImageZoomProps {
  src: string;
  alt?: string;
  className?: string;
  caption?: string;
  children?: React.ReactNode;
}

export default function ImageZoom({ src, alt, className, caption, children }: ImageZoomProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Use children as caption if provided, otherwise use caption prop
  const captionText = children || caption;

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

  const renderModal = () => (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '90vw',
          height: '90vh',
        }}
      >
        {imageLoaded ? (
          <img
            src={src}
            alt={alt || ''}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <div style={{ color: 'white' }}>Loading...</div>
        )}
        <button
          onClick={handleClose}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '8px',
            zIndex: 100000,
            fontSize: '24px',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );

  return (
    <>
      <figure style={{ margin: '1rem 0', textAlign: 'center' }}>
        <img
          src={src}
          alt={alt || ''}
          className={className}
          onClick={handleImageClick}
          style={{ cursor: 'zoom-in' }}
        />
        {captionText && (
          <figcaption
            style={{
              marginTop: '0.5rem',
              fontSize: '0.9rem',
              fontStyle: 'italic',
              color: 'var(--ifm-color-emphasis-600)',
              textAlign: 'center',
            }}
          >
            {captionText}
          </figcaption>
        )}
      </figure>
      {isOpen && typeof document !== 'undefined' && createPortal(renderModal(), document.body)}
    </>
  );
}
