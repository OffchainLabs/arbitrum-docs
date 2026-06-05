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
    <div onClick={handleClose} className="image-zoom__modal">
      <div onClick={(e) => e.stopPropagation()} className="image-zoom__container">
        {imageLoaded ? (
          <img src={src} alt={alt || ''} className="image-zoom__image" />
        ) : (
          <div className="image-zoom__loading">Loading...</div>
        )}
        <button onClick={handleClose} className="image-zoom__close">
          ✕
        </button>
      </div>
    </div>
  );

  return (
    <>
      <figure className="image-zoom__figure">
        <img
          src={src}
          alt={alt || ''}
          className={`image-zoom__thumbnail ${className || ''}`}
          onClick={handleImageClick}
        />
        {captionText && <figcaption className="image-zoom__caption">{captionText}</figcaption>}
      </figure>
      {isOpen && typeof document !== 'undefined' && createPortal(renderModal(), document.body)}
    </>
  );
}
