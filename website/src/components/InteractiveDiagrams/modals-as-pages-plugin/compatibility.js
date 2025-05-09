/**
 * Compatibility layer for the modals-as-pages plugin.
 * Provides backward compatibility with the old interactive-diagrams-plugin.
 */

import React from 'react';
import ModalContentLoader from './loader';
import { getDiagramContentParams } from './registry';

/**
 * DiagramContentLoader - Compatibility component for the old API.
 *
 * @param {Object} props Component props
 * @param {string} props.diagramId The diagram identifier
 * @param {number|string} props.stepNumber The step number
 * @param {React.ReactNode} props.fallback Optional fallback content
 * @returns {React.ReactElement} The content loader component
 */
export function DiagramContentLoader({ diagramId, stepNumber, fallback, ...props }) {
  // Map to the new structure
  const { contextId, groupId, contentId } = getDiagramContentParams(diagramId, stepNumber);

  // Use the new ModalContentLoader with the mapped parameters
  return (
    <ModalContentLoader
      contextId={contextId}
      groupId={groupId}
      contentId={contentId}
      fallback={fallback}
      {...props}
    />
  );
}

/**
 * Compatibility wrapper for the old DiagramContentMap component.
 * This component worked with static content defined in JavaScript, but this
 * functionality is now handled by the modals-as-pages plugin.
 *
 * @param {Object} props The component props
 * @returns {React.ReactElement} The content loader component
 */
export function DiagramContentMap(props) {
  return <DiagramContentLoader {...props} />;
}
