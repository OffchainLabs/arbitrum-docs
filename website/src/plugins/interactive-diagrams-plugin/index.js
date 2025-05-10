/**
 * Docusaurus plugin for handling interactive diagrams and their associated partial content
 */
const path = require('path');
const fs = require('fs');
const globby = require('globby');

module.exports = function (context, options) {
  // Plugin options with defaults
  const {
    partialsPath = '../arbitrum-docs/how-arbitrum-works/timeboost/diagrams-modals',
    partialPrefix = '_partial-',
    debug = false,
  } = options || {};

  // Registry to store mapping between diagram IDs and their modal content
  let diagramRegistry = {};

  return {
    name: 'interactive-diagrams-plugin',

    async loadContent() {
      // Get absolute path to partials directory
      const partialsDirPath = path.join(context.siteDir, partialsPath);

      if (debug) {
        console.log('[Interactive Diagrams Plugin] Loading partials from:', partialsDirPath);
      }

      // Find all partial files in the directory
      const partialFiles = await globby([`${partialPrefix}*-step-*.mdx`], {
        cwd: partialsDirPath,
        absolute: true,
      });

      if (debug) {
        console.log('[Interactive Diagrams Plugin] Found partials:', partialFiles);
      }

      // Process each file and add to registry
      partialFiles.forEach((filePath) => {
        try {
          // Extract diagram ID and step number from filename
          // Format: _partial-{diagramId}-step-{stepNumber}.mdx
          const fileName = path.basename(filePath);

          // Parse the filename to extract diagram ID and step number
          const match = fileName.match(new RegExp(`${partialPrefix}([^-]+)-step-(\\d+)\\.mdx$`));

          if (match) {
            const [, diagramId, stepNumber] = match;

            // Initialize diagram in registry if not exists
            if (!diagramRegistry[diagramId]) {
              diagramRegistry[diagramId] = {};
            }

            // Store the path to the partial file for this step
            diagramRegistry[diagramId][stepNumber] = {
              path: filePath,
              relativePath: path.relative(context.siteDir, filePath),
            };

            if (debug) {
              console.log(
                `[Interactive Diagrams Plugin] Registered diagram=${diagramId}, step=${stepNumber}, file=${filePath}`,
              );
            }
          } else {
            if (debug) {
              console.warn(
                `[Interactive Diagrams Plugin] File naming does not match expected pattern: ${fileName}`,
              );
            }
          }
        } catch (error) {
          console.error(`[Interactive Diagrams Plugin] Error processing file ${filePath}:`, error);
        }
      });

      return diagramRegistry;
    },

    async contentLoaded({ content, actions }) {
      // Make registry available to components via global data
      actions.setGlobalData({
        diagramRegistry: content,
      });

      if (debug) {
        console.log('[Interactive Diagrams Plugin] Registry loaded:', content);
      }
    },

    // Add a route for potential API access to registry data
    async routesLoaded({ routes }) {
      // Optional: create a route to expose the registry data if needed
    },

    // Called when the Docusaurus config is loaded
    configureWebpack(config, isServer, utils) {
      return {
        // Add webpack aliases if needed
      };
    },
  };
};
