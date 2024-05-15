const fs = require('fs');
const path = require('path');
const { Application, RendererEvent } = require('typedoc');

/**
 * Plugin to move `arbitrum-sdk` docs files to the same folder as used by Docusaurus site.
 *
 * It also generates a `sidebar.js` file to be used by Docusaurus to display the sidebar.
 *
 * The plugin automatically runs when the Typedoc renderer finishes. It copies the doc files from
 * the `arbitrum-sdk` docs folder to the Docusaurus docs folder. Uses those files, plus the
 * generated files, to generate the sidebar. It should handle these options automatically.
 */
function load(app) {
  app.renderer.on(RendererEvent.END, async (event) => {
    const outputDir = app.options.getValue('out');
    const sourceDir = path.join(outputDir, '../../../arbitrum-sdk/docs');
    const targetDir = path.join(outputDir, '../');

    copyFiles(sourceDir, targetDir);

    const sidebarItems = generateSidebar(targetDir);
    const sidebarConfig = { items: sidebarItems };
    const sidebarPath = path.join(targetDir, 'sidebar.js');

    fs.writeFileSync(
      sidebarPath,
      `// @ts-check\n/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */\nconst typedocSidebar = ${JSON.stringify(
        sidebarConfig,
        null,
        2,
      )};\nmodule.exports = typedocSidebar.items;`,
      'utf8',
    );
  });
}

// Function to recursively copy files
function copyFiles(source, target) {
  fs.mkdirSync(target, { recursive: true });
  fs.readdirSync(source, { withFileTypes: true }).forEach((entry) => {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyFiles(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

// Sort entries by leading numbers, then alphabetically
function sortEntries(a, b) {
  const numA = a.match(/^\d+/);
  const numB = b.match(/^\d+/);
  if (numA && numB) {
    return parseInt(numA[0], 10) - parseInt(numB[0], 10);
  } else if (numA) {
    return -1;
  } else if (numB) {
    return 1;
  } else {
    // Alphabetical order
    return a.localeCompare(b);
  }
}

// Generate an in-folder sidebar with sorting
function generateSidebar(dir, basePath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  // Sort entries before processing
  entries.sort((a, b) => sortEntries(a.name, b.name));

  const items = entries
    .filter((item) => item !== undefined)
    .map((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const subItems = generateSidebar(
          fullPath,
          `${basePath}/${entry.name.replace(/^\d+-/, '')}`,
        );
        return {
          type: 'category',
          label: generateLabel(entry.name),
          items: subItems,
        };
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const docId = generateId(entry.name, basePath);
        return {
          type: 'doc',
          id: docId,
          label: generateLabel(entry.name),
        };
      }
    });

  return items;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function generateId(name, basePath) {
  let label = name.replace(/^\d+-/, ''); //
  label = label.replace(/\.md$/, '');
  const slashIfNeeded = basePath.startsWith('/') ? '' : '/';
  return 'sdk-docs' + slashIfNeeded + path.join(basePath, label);
}

function generateLabel(name) {
  let label = name.replace(/^\d+-/, '');
  label = label.replace(/\.md$/, '');
  return capitalizeFirstLetter(label);
}

exports.load = load;
