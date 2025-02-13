// @ts-check

/**
 * Content Structure Generator
 *
 * This script generates a hierarchical tree visualization of the Arbitrum documentation's
 * sidebar structure, making it easier to understand and analyze the documentation organization.
 *
 * Usage:
 * 1. Run the script directly:
 *    node website/src/scripts/contentStructureGenerator.js
 *
 * Output:
 * - Creates 'contentStructure.txt' in the same directory as this script
 * - The output file shows the complete documentation hierarchy with:
 *   - Proper indentation showing relationships between items
 *   - Labels for all documentation pages
 *   - URLs for external links
 *   - Special handling for HTML elements and external content
 *
 * Configuration:
 * The script accepts the following options (passed to generateSidebarTree):
 * - indentBase: Base number of dashes for indentation (default: 6)
 * - indentLevel: Additional dashes per nested level (default: 15)
 * - skipEmpty: Whether to skip items without labels (default: true)
 * - handleMissing: How to handle invalid/missing items (default: true)
 *
 * Example output format:
 * |------ Section
 * |--------------------- Category
 * |------------------------------------ Page Title
 * |------------------------------------ External Link (https://example.com)
 */

const sidebars = require('../../sidebars.js');
const fs = require('fs');
const path = require('path');

function generateSidebarTree(sidebar, options = {}) {
  const {
    indentBase = 6, // Base number of dashes
    indentLevel = 15, // Additional dashes per level
    skipEmpty = true, // Skip items without labels
    handleMissing = true, // Handle missing/undefined items gracefully
  } = options;

  function getIndent(level) {
    return '|' + '-'.repeat(indentBase + level * indentLevel);
  }

  function processItem(item, level = 0) {
    // Handle null, undefined, or invalid items
    if (!item || typeof item !== 'object') {
      return handleMissing ? '' : `${getIndent(level)} [Invalid Item]\n`;
    }

    let output = '';

    // Handle the current item
    if (item.label) {
      output += `${getIndent(level)} ${item.label}\n`;
    } else if (!skipEmpty) {
      output += `${getIndent(level)} [Unnamed Item]\n`;
    }

    // Handle items array
    if (item.items) {
      // If items is a reference to an external sidebar (like sdkDocsSidebar)
      if (!Array.isArray(item.items)) {
        try {
          // Try to process the external sidebar if it's an array
          if (Array.isArray(item.items.default) || Array.isArray(item.items)) {
            const itemsArray = item.items.default || item.items;
            itemsArray.forEach((childItem) => {
              output += processItem(childItem, level + 1);
            });
          } else {
            output += `${getIndent(level + 1)} [External Content]\n`;
          }
        } catch (error) {
          output += `${getIndent(level + 1)} [External Content]\n`;
        }
      } else {
        // Process each child item
        item.items.forEach((childItem) => {
          output += processItem(childItem, level + 1);
        });
      }
    }

    // Handle HTML type items
    if (item.type === 'html' && item.value) {
      // Extract label from HTML value using regex
      const labelMatch = item.value.match(/>(.*?)</);
      if (labelMatch && labelMatch[1]) {
        output += `${getIndent(level)} ${labelMatch[1].trim()}\n`;
      }
    }

    // Handle link type items
    if (item.type === 'link' && item.label) {
      output += `${getIndent(level)} ${item.label} (${item.href})\n`;
    }

    return output;
  }

  // Process the root sidebar object
  let output = '';
  if (typeof sidebar === 'object') {
    Object.entries(sidebar).forEach(([sectionName, items]) => {
      output += `${getIndent(0)} ${sectionName}\n`;
      if (Array.isArray(items)) {
        items.forEach((item) => {
          output += processItem(item, 1);
        });
      }
    });
  }

  return output;
}

// Generate the tree using the actual sidebars configuration
const treeOutput = generateSidebarTree(sidebars, {
  indentBase: 6,
  indentLevel: 15,
  skipEmpty: true,
  handleMissing: true,
});

// Write output to file
const outputPath = path.join(__dirname, 'contentStructure.txt');
fs.writeFileSync(outputPath, treeOutput, 'utf8');
console.log(`Content structure has been written to: ${outputPath}`);

// Export the function for use in other files
module.exports = {
  generateSidebarTree,
};
