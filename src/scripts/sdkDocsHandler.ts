const fs = require('fs');
const path = require('path');
const { Application, RendererEvent } = require('typedoc');
const { parseMarkdownContentTitle } = require('@docusaurus/utils');
/**
 * Plugin to move docs files from a target folder to the same folder as used by Docusaurus site.
 *
 * It also generates a `sidebar.js` file to be used by Docusaurus to display the sidebar.
 *
 * The plugin automatically runs when the Typedoc renderer finishes. It copies the doc files from
 * the target docs folder to the Docusaurus docs folder. Uses those files, plus the generated files,
 * to generate the sidebar. It should handle these options automatically.
 *
 * Sidebar generation is based on the folder structure of the target docs folder, where it sorts
 * files by leading numbers first then alphabetically.
 */
function load(app) {
  const sdkOutputDir = app.options.getValue('out'); // This is the SDK directory
  const sourceDir = path.join(sdkOutputDir, '../../arbitrum-sdk/docs');

  app.renderer.on(RendererEvent.START, async () => {
    cleanDirectory(sdkOutputDir);
  });

  app.renderer.on(RendererEvent.END, async () => {
    // Generate sidebar only from the actual TypeDoc generated content
    const sidebarItems = generateSidebarFromSDKContent(sdkOutputDir);
    const sidebarConfig = { items: sidebarItems };
    const sidebarPath = path.join(sdkOutputDir, '../../sdk-sidebar.js');
    
    fs.writeFileSync(
      sidebarPath,
      `// @ts-check\n/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */\nconst typedocSidebar = ${JSON.stringify(
        sidebarConfig,
        null,
        2,
      )};\nmodule.exports = { sdkSidebar: typedocSidebar.items };`,
      'utf8',
    );
  });
}

// Cleans all files from the target directory
function cleanDirectory(directory) {
  if (fs.existsSync(directory)) {
    fs.readdirSync(directory).forEach((file) => {
      const curPath = path.join(directory, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        cleanDirectory(curPath);
        fs.rmdirSync(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
  }
}

// Recursively copy all files and folders from source to target
function copyFiles(source, target) {
  if (!fs.existsSync(source)) {
    console.error(`Source path does not exist: ${source}`);
    return;
  }

  if (!fs.lstatSync(source).isDirectory()) {
    console.error(`Source path is not a directory: ${source}`);
    return;
  }

  fs.mkdirSync(target, { recursive: true });
  fs.readdirSync(source, { withFileTypes: true }).forEach((entry) => {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyFiles(sourcePath, targetPath);
    } else {
      try {
        fs.copyFileSync(sourcePath, targetPath);
      } catch (err) {
        console.error(`Failed to copy file from ${sourcePath} to ${targetPath}:`, err);
      }
    }
  });
}

// Sort entries by leading numbers, then alphabetically, with 'index.md' first
function sortEntries(a, b) {
  if (a === 'index.md') return -1;
  if (b === 'index.md') return 1;

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
    .map((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const subItems = generateSidebar(
          fullPath,
          basePath ? `${basePath}/${entry.name.replace(/^\d+-/, '')}` : entry.name.replace(/^\d+-/, ''),
        );
        const label = capitalizeFirstLetter(getLabelFromFilesystem(entry.name));
        return {
          type: 'category',
          label,
          items: subItems,
        };
      } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
        const docId = generateId(entry.name, basePath);
        return {
          type: 'doc',
          id: docId,
          label: generateLabel(entry),
        };
      }
    })
    .filter((item) => !!item);

  return items;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function generateId(name, basePath) {
  // For consistency with Docusaurus ID generation, use the same logic as getLabelFromFilesystem
  const idLabel = getLabelFromFilesystem(name);
  if (basePath) {
    return path.join(basePath, idLabel).replace(/\\/g, '/');
  }
  return idLabel;
}

function generateLabel(entry) {
  const filePath = `${entry.path}/${entry.name}`;
  const titleFromFile = getTitleFromFileContent(filePath);
  const label = titleFromFile || getLabelFromFilesystem(entry.name);
  return capitalizeFirstLetter(label);
}

function getLabelFromFilesystem(name) {
  const label = name
    .replace(/^\d+-/, '')
    .replace(/\.md$/, '')
    .replace(/\.mdx$/, '');
  return label || '';
}

function getTitleFromFileContent(filePath) {
  if (!fs.existsSync(filePath)) {
    return '';
  }
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { contentTitle } = parseMarkdownContentTitle(fileContent);

  return contentTitle || '';
}

// Generate sidebar only from the actual SDK TypeDoc content
function generateSidebarFromSDKContent(sdkDir) {
  const entries = fs.readdirSync(sdkDir, { withFileTypes: true });
  const items = [];

  // Process each entry in the SDK directory
  for (const entry of entries) {
    if (entry.isDirectory()) {
      // This is a category (like assetBridger, dataEntities, etc.)
      const categoryPath = path.join(sdkDir, entry.name);
      const categoryFiles = fs.readdirSync(categoryPath, { withFileTypes: true });
      
      const categoryItems = categoryFiles
        .filter(file => file.isFile() && file.name.endsWith('.md'))
        .map(file => ({
          type: 'doc',
          id: `sdk/${entry.name}/${file.name.replace('.md', '')}`,
          label: capitalizeFirstLetter(file.name.replace('.md', '').replace(/([A-Z])/g, ' $1').trim())
        }));

      if (categoryItems.length > 0) {
        items.push({
          type: 'category',
          label: capitalizeFirstLetter(entry.name),
          items: categoryItems
        });
      }
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      // This is a top-level document
      items.push({
        type: 'doc',
        id: `sdk/${entry.name.replace('.md', '')}`,
        label: capitalizeFirstLetter(entry.name.replace('.md', '').replace(/([A-Z])/g, ' $1').trim())
      });
    }
  }

  return items;
}

exports.load = load;
