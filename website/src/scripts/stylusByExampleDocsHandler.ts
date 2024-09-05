const fs = require('fs');
const path = require('path');
const { RendererEvent } = require('typedoc');
const { parseMarkdownContentTitle } = require('@docusaurus/utils');

const allowList = [
  'hello_world',
  'primitive_data_types',
  'variables',
  'constants',
  'function',
  'errors',
  'events',
  'inheritance',
  'vm_affordances',
  'sending_ether',
  'function_selector',
  'abi_encode',
  'abi_decode',
  'hashing',
  'bytes_in_bytes_out',
];

function load(app) {
  const outputDir = path.join(app.options.getValue('out'), '../../stylus-by-example');
  const sourceDir = path.join(outputDir, '../../stylus-by-example/src/app/basic_examples');

  app.renderer.on(RendererEvent.START, async () => {
    cleanDirectory(outputDir);
  });

  app.renderer.on(RendererEvent.END, async () => {
    copyFiles(sourceDir, outputDir);

    const sidebarItems = generateSidebar(outputDir);
    const sidebarConfig = { items: sidebarItems };
    const sidebarPath = path.join(outputDir, 'sidebar.js');

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

  function processDirectory(dirPath, targetPath, isRoot = false) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const hasChildDirectories = entries.some((entry) => entry.isDirectory());

    if (isRoot) {
      // Special handling for root directory
      entries.forEach((entry) => {
        const sourcePath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          processDirectory(sourcePath, targetPath);
        }
      });
    } else if (hasChildDirectories) {
      // This directory has subdirectories, so we preserve its structure
      const currentDirName = path.basename(dirPath);
      const newTargetPath = path.join(targetPath, currentDirName);
      fs.mkdirSync(newTargetPath, { recursive: true });

      entries.forEach((entry) => {
        if (!allowList.includes(entry.name)) {
          return;
        }
        const sourcePath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          processDirectory(sourcePath, newTargetPath);
        } else if (entry.name === 'page.mdx') {
          const content = fs.readFileSync(sourcePath, 'utf8');
          const convertedContent = convertMetadataToFrontmatter(content);
          fs.writeFileSync(path.join(newTargetPath, entry.name), convertedContent);
        }
      });
    } else {
      // This directory only contains files, so we flatten it
      const mdxFile = entries.find((entry) => entry.isFile() && entry.name === 'page.mdx');
      if (mdxFile) {
        const parentDirName = path.basename(dirPath);
        if (!allowList.includes(parentDirName)) {
          return;
        }
        const sourcePath = path.join(dirPath, mdxFile.name);
        const newFileName = `${parentDirName}.mdx`;
        const content = fs.readFileSync(sourcePath, 'utf8');
        const convertedContent = convertMetadataToFrontmatter(content);
        fs.writeFileSync(path.join(targetPath, newFileName), convertedContent);
      }
    }
  }

  processDirectory(source, target, true);
}
function convertMetadataToFrontmatter(content) {
  const metadataRegex = /export const metadata = ({[\s\S]*?});/;
  const match = content.match(metadataRegex);

  if (match) {
    let metadataObj;
    try {
      metadataObj = eval(`(${match[1]})`);
    } catch (error) {
      console.error('Error parsing metadata:', error);
      return content;
    }

    // Convert object to YAML-style string
    let metadataContent = Object.entries(metadataObj)
      .map(([key, value]) => {
        // Escape double quotes and wrap value in quotes
        const safeValue = String(value).replace(/"/g, '\\"');
        return `${key}: "${safeValue}"`;
      })
      .join('\n');

    const frontmatter = `---\n${metadataContent}\n---\n\n`;
    return content.replace(metadataRegex, frontmatter);
  }

  return content;
}

/**
 * Sorts entries based on the allowList order
 */
function sortEntries(a, b) {
  const allowListIndexA = allowList.indexOf(a.replace('.mdx', ''));
  const allowListIndexB = allowList.indexOf(b.replace('.mdx', ''));

  if (allowListIndexA !== -1 && allowListIndexB !== -1) {
    return allowListIndexA - allowListIndexB;
  } else if (allowListIndexA !== -1) {
    return -1;
  } else if (allowListIndexB !== -1) {
    return 1;
  }

  return a.localeCompare(b);
}

function generateSidebar(dir, basePath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.sort((a, b) => sortEntries(a.name, b.name));

  const items = entries
    .map((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const subItems = generateSidebar(fullPath, `${basePath}/${entry.name}`);
        if (subItems.length === 0) {
          return null; // Filter out empty categories
        }
        const label = capitalizeWords(entry.name.replace(/_/g, ' '));
        return {
          type: 'category',
          label,
          items: subItems,
        };
      } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
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

function capitalizeWords(string) {
  return string.replace(/\b\w/g, (l) => l.toUpperCase());
}

function generateId(name, basePath) {
  const label = getLabelFromFilesystem(name);
  return 'stylus-by-example' + (basePath + '/' + label).toLowerCase();
}

function generateLabel(entry) {
  const filePath = `${entry.path}/${entry.name}`;
  const titleFromFile = getTitleFromFileContent(filePath);
  const label = titleFromFile || getLabelFromFilesystem(entry.name);
  return capitalizeWords(label.replace(/_/g, ' '));
}

function getLabelFromFilesystem(name) {
  return name.replace(/\.mdx$/, '');
}

function getTitleFromFileContent(filePath) {
  if (!fs.existsSync(filePath)) {
    return '';
  }
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { contentTitle } = parseMarkdownContentTitle(fileContent);

  return contentTitle || '';
}

exports.load = load;
