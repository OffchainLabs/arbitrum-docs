/**
 * Main exports for the modals-as-pages plugin.
 * This file exports all the components and utilities that might be used in the application.
 */

// Core loader component
export { default as ModalContentLoader } from './loader';

// Registry utilities
export {
  useContentRegistry,
  useContent,
  useAvailableGroups,
  useAvailableContent,
  useContentExists,
  getDiagramContentParams,
} from './registry';

// Compatibility components
export { DiagramContentLoader, DiagramContentMap } from './compatibility';

// Re-export types for TypeScript users
// Note: This import is handled by TypeScript and will be removed in JS builds
export * from './types';
