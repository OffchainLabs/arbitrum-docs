/**
 * Registry utility functions for the modals-as-pages plugin.
 * Provides helper functions to work with the content registry.
 */

import { usePluginData } from '@docusaurus/useGlobalData';

/**
 * Hook to access the content registry from the modals-as-pages plugin.
 *
 * @returns {Object} The content registry object
 */
export function useContentRegistry() {
  const { contentRegistry = {} } = usePluginData('modals-as-pages-plugin') || {};
  return contentRegistry;
}

/**
 * Hook to get content for a specific context, group, and content ID.
 *
 * @param {string} contextId The context identifier (e.g., 'diagrams', 'tutorials')
 * @param {string} groupId The group identifier (e.g., 'transaction-flow', 'getting-started')
 * @param {string} contentId The content identifier (e.g., 'step-1', 'welcome')
 * @returns {Object|null} The content object or null if not found
 */
export function useContent(contextId, groupId, contentId) {
  const contentRegistry = useContentRegistry();
  return contentRegistry[contextId]?.[groupId]?.[contentId] || null;
}

/**
 * Hook to get all available group IDs for a specific context.
 *
 * @param {string} contextId The context identifier
 * @returns {string[]} Array of available group IDs
 */
export function useAvailableGroups(contextId) {
  const contentRegistry = useContentRegistry();
  return contentRegistry[contextId] ? Object.keys(contentRegistry[contextId]) : [];
}

/**
 * Hook to get all available content IDs for a specific context and group.
 *
 * @param {string} contextId The context identifier
 * @param {string} groupId The group identifier
 * @returns {string[]} Array of available content IDs
 */
export function useAvailableContent(contextId, groupId) {
  const contentRegistry = useContentRegistry();
  return contentRegistry[contextId]?.[groupId]
    ? Object.keys(contentRegistry[contextId][groupId])
    : [];
}

/**
 * Hook to check if content exists for a specific context, group, and content ID.
 *
 * @param {string} contextId The context identifier
 * @param {string} groupId The group identifier
 * @param {string} contentId The content identifier
 * @returns {boolean} True if the content exists, false otherwise
 */
export function useContentExists(contextId, groupId, contentId) {
  const contentRegistry = useContentRegistry();
  return Boolean(contentRegistry[contextId]?.[groupId]?.[contentId]);
}

/**
 * Helper for mapping diagram ID and step number to content parameters.
 * Useful for compatibility with existing diagram components.
 *
 * @param {string} diagramId The diagram identifier
 * @param {number|string} stepNumber The step number
 * @returns {Object} Object with contextId, groupId, and contentId
 */
export function getDiagramContentParams(diagramId, stepNumber) {
  return {
    contextId: 'diagrams',
    groupId: diagramId,
    contentId: `step-${stepNumber}`,
  };
}
