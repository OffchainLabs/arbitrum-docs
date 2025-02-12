/**
 * ImageZoom Component
 *
 * A React component that adds a click-to-zoom feature to images with smooth animations.
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

interface ImageZoomProps {
  src: string;
  alt?: string;
  className?: string;
}

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
`;

const ImageContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90vw;
  height: 90vh;
`;

const ZoomedImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const CloseButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  z-index: 100000;

  &:hover {
    opacity: 0.8;
  }
`;

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

  const renderModal = () => (
    <Modal onClick={handleClose}>
      <ImageContainer onClick={(e) => e.stopPropagation()}>
        {imageLoaded ? (
          <ZoomedImage
            src={src}
            alt={alt || ''}
          />
        ) : (
          <div style={{ color: 'white' }}>Loading...</div>
        )}
        <CloseButton onClick={handleClose}>✕</CloseButton>
      </ImageContainer>
    </Modal>
  );

  return (
    <>
      <img
        src={src}
        alt={alt || ''}
        className={className}
        onClick={handleImageClick}
        style={{ cursor: 'zoom-in' }}
      />
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(renderModal(), document.body)}
    </>
  );
}
