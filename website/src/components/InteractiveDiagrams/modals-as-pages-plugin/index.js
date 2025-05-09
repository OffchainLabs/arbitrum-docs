/**
 * Modals-as-pages Docusaurus Plugin
 *
 * This plugin enables dynamic loading of MDX content into modals within a Docusaurus 3 site.
 * It scans specified directories for MDX files and builds a registry that maps content
 * identifiers to the actual content, making it available through Docusaurus's global data system.
 *
 * @module modals-as-pages-plugin
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Default options
const DEFAULT_OPTIONS = {
  contentDir: 'src/components/InteractiveDiagrams/content',
  filePattern: '**/*.mdx',
  // Default content ID generator extracts context, group, and content IDs from file path
  contentIdGenerator: (filePath) => {
    // Extract parts from the file path
    // Example: diagrams/transaction-flow/step-1.mdx =>
    // { contextId: 'diagrams', groupId: 'transaction-flow', contentId: 'step-1' }
    const parts = filePath.split('/');

    if (parts.length < 3) {
      // If path doesn't have enough parts, use defaults
      return {
        contextId: 'default',
        groupId: path.dirname(filePath).replace(/\//g, '-'),
        contentId: path.basename(filePath, '.mdx'),
      };
    }

    return {
      contextId: parts[0],
      groupId: parts[1],
      contentId: path.basename(parts[2], '.mdx'),
    };
  },
  transformers: [],
};

/**
 * The main plugin function that configures the Docusaurus plugin.
 *
 * @param {Object} context - The Docusaurus context
 * @param {Object} options - The plugin options
 * @returns {Object} The plugin configuration
 */
module.exports = function (context, options) {
  // Merge default options with user options
  const pluginOptions = { ...DEFAULT_OPTIONS, ...options };

  const { contentDir, filePattern, contentIdGenerator, transformers } = pluginOptions;

  // Resolve content directory path(s)
  const contentDirs = Array.isArray(contentDir) ? contentDir : [contentDir];
  const resolvedContentDirs = contentDirs.map((dir) => path.resolve(context.siteDir, dir));

  return {
    name: 'modals-as-pages-plugin',

    /**
     * Loads content from the specified directories and builds the content registry.
     *
     * @returns {Object} The content registry
     */
    async loadContent() {
      // Initialize the content registry
      const contentRegistry = {};

      // Process each content directory
      for (const dir of resolvedContentDirs) {
        if (!fs.existsSync(dir)) {
          console.warn(`[modals-as-pages-plugin] Content directory not found: ${dir}`);
          continue;
        }

        // Find all MDX files that match the pattern
        const files = glob.sync(filePattern, { cwd: dir });

        // Process each file
        for (const file of files) {
          const filePath = path.join(dir, file);
          const relativePath = file;

          // Read the file content
          const content = fs.readFileSync(filePath, 'utf8');

          // Generate content identifiers
          const { contextId, groupId, contentId } = contentIdGenerator(relativePath);

          // Transform content if transformers are provided
          let transformedContent = content;
          for (const transformer of transformers) {
            transformedContent = transformer(transformedContent, { contextId, groupId, contentId });
          }

          // Initialize nested objects if they don't exist
          if (!contentRegistry[contextId]) {
            contentRegistry[contextId] = {};
          }
          if (!contentRegistry[contextId][groupId]) {
            contentRegistry[contextId][groupId] = {};
          }

          // Store the content in the registry
          contentRegistry[contextId][groupId][contentId] = {
            relativePath,
            content: transformedContent,
          };
        }
      }

      return {
        contentRegistry,
      };
    },

    /**
     * Makes the content available to components via the global data system.
     *
     * @param {Object} param0 - The parameters
     * @param {Object} param0.content - The content loaded by loadContent
     * @param {Object} param0.actions - The Docusaurus actions
     */
    async contentLoaded({ content, actions }) {
      const { setGlobalData } = actions;

      // Make content available via the global data system
      setGlobalData({
        contentRegistry: content.contentRegistry,
      });
    },

    /**
     * Returns the paths to watch for changes.
     *
     * @returns {Array} The paths to watch
     */
    getPathsToWatch() {
      // Watch the content directories for changes
      return resolvedContentDirs.map((dir) => path.join(dir, filePattern));
    },
  };
};
