import React from 'react';
import { usePluginData } from '@docusaurus/useGlobalData';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

/**
 * Component that loads the content for an interactive diagram's modal
 * This serves as a wrapper around the actual content
 */
export default function DiagramContentLoader({ diagramId, stepNumber }) {
  // Access the diagram registry from plugin data
  const { diagramRegistry = {} } = usePluginData('interactive-diagrams-plugin') || {};

  // Check if we have content for this diagram and step
  const hasContent =
    diagramRegistry && diagramRegistry[diagramId] && diagramRegistry[diagramId][stepNumber];

  if (!hasContent) {
    console.warn(`No content found for diagram=${diagramId}, step=${stepNumber}`);
    return (
      <div className="diagram-content-error">
        <h2>Missing content</h2>
        <p>
          Could not find content for diagram "{diagramId}" step {stepNumber}.
        </p>
      </div>
    );
  }

  // Get the relative path to the content file
  const { relativePath } = diagramRegistry[diagramId][stepNumber];

  // This is where we would dynamically import the MDX content
  // However, Docusaurus/webpack doesn't easily support dynamic imports for MDX
  // Instead, we'll create a mapping system

  // For now, render a placeholder with information about what we're trying to load
  return (
    <div className="diagram-content-placeholder">
      <div className="diagram-content-info">
        <p>Loading content from: {relativePath}</p>
      </div>
    </div>
  );
}
