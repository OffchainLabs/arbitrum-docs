/**
 * Type definitions for the modals-as-pages plugin.
 */

import React from 'react';

/**
 * Plugin options interface.
 */
export interface ModalsAsPagesPluginOptions {
  /**
   * Directory or directories containing the content files.
   * Can be a single string or an array of strings.
   */
  contentDir: string | string[];

  /**
   * Glob pattern to match content files.
   * Default: '**\/*.mdx'
   */
  filePattern?: string;

  /**
   * Function to generate content identifiers from a file path.
   * @param filePath Relative path to the content file
   * @returns Object with contextId, groupId, and contentId
   */
  contentIdGenerator?: (filePath: string) => ContentIdentifiers;

  /**
   * Array of content transformer functions.
   * Each transformer receives the content and metadata and returns transformed content.
   */
  transformers?: ContentTransformer[];
}

/**
 * Content identifiers object.
 */
export interface ContentIdentifiers {
  /**
   * Top-level context identifier (e.g., 'diagrams', 'tutorials').
   */
  contextId: string;

  /**
   * Group identifier within the context (e.g., 'transaction-flow', 'getting-started').
   */
  groupId: string;

  /**
   * Content identifier within the group (e.g., 'step-1', 'welcome').
   */
  contentId: string;
}

/**
 * Content transformer function type.
 */
export type ContentTransformer = (content: string, metadata: ContentIdentifiers) => string;

/**
 * Content entry in the registry.
 */
export interface ContentEntry {
  /**
   * Relative path to the content file.
   */
  relativePath: string;

  /**
   * The content text (possibly transformed).
   */
  content: string;
}

/**
 * Content registry structure.
 */
export interface ContentRegistry {
  [contextId: string]: {
    [groupId: string]: {
      [contentId: string]: ContentEntry;
    };
  };
}

/**
 * Props for the ModalContentLoader component.
 */
export interface ModalContentLoaderProps {
  /**
   * The context identifier.
   */
  contextId: string;

  /**
   * The group identifier.
   */
  groupId: string;

  /**
   * The content identifier.
   */
  contentId: string;

  /**
   * Optional fallback content to display if the requested content is not found.
   */
  fallback?: React.ReactNode;

  /**
   * Optional CSS class name for the content container.
   */
  className?: string;
}

/**
 * Props for the legacy DiagramContentLoader component.
 */
export interface DiagramContentLoaderProps {
  /**
   * The diagram identifier.
   */
  diagramId: string;

  /**
   * The step number.
   */
  stepNumber: number | string;

  /**
   * Optional fallback content.
   */
  fallback?: React.ReactNode;

  /**
   * Optional CSS class name.
   */
  className?: string;
}
