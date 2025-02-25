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

  const renderModal = () => {
    if (!isOpen) return null;
    
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
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="markdown">
        <img
          src={src}
          alt={alt || ''}
          className={className}
          onClick={handleImageClick}
          style={{ cursor: 'zoom-in' }}
        />
      </div>
      {isOpen && typeof document !== 'undefined' && createPortal(renderModal(), document.body)}
    </>
  );
}
