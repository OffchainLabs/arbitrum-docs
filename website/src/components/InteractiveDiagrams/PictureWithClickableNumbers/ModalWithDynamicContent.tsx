// This component has been deprecated and its functionality integrated into Modal.tsx
// We're keeping this file only for backwards compatibility
// New code should use Modal.tsx which now supports dynamic content loading directly

import { Modal } from './Modal';

/**
 * Modal component with dynamic content loading for the PictureWithClickableNumbers diagram.
 * This component is just a wrapper around the original Modal component for backwards compatibility.
 */
export function ModalWithDynamicContent(props: {
  number: 1 | 2 | 3 | 4 | 5;
  customContent?: React.ComponentType;
  coordinates?: typeof defaultCoordinates;
  children?: React.ReactNode;
  id?: string;
  diagramId?: string;
}) {
  // Just pass all props directly to the Modal component
  return <Modal {...props} />;
}
