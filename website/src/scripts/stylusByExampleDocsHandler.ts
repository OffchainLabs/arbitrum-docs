const fs = require('fs');
const path = require('path');
const { Application, RendererEvent } = require('typedoc');
const { parseMarkdownContentTitle } = require('@docusaurus/utils');

const allowList = ['getting_started', 'basic_examples'];

function load(app) {
  const outputDir = path.join(app.options.getValue('out'), '../../stylus-by-example');
  const sourceDir = path.join(outputDir, '../../stylus-by-example/src');

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
        2
      )};\nmodule.exports = typedocSidebar.items;`,
      'utf8'
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

function copyFiles(source, target, parentDir = '') {
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
      // Only process directories in the allowList
      if (allowList.includes(entry.name)) {
        copyFiles(sourcePath, targetPath, entry.name);
      }
    } else if (entry.name === 'page.mdx') {
      // Only copy files if their parent directory is in the allowList
      if (allowList.includes(parentDir)) {
        try {
          const newFileName = `${parentDir}.mdx`;
          const content = fs.readFileSync(sourcePath, 'utf8');
          const convertedContent = convertMetadataToFrontmatter(content);
          fs.writeFileSync(path.join(target, newFileName), convertedContent);
        } catch (err) {
          console.error(`Failed to process file from ${sourcePath} to ${targetPath}:`, err);
        }
      }
    }
  });
}

function convertMetadataToFrontmatter(content) {
  const metadataRegex = /export const metadata = {([\s\S]*?)};/;
  const match = content.match(metadataRegex);

  if (match) {
    let metadataContent = match[1];
    
    // Convert JavaScript object syntax to YAML
    metadataContent = metadataContent
      .replace(/:\s*"/g, ': "')  // Fix spacing after colons
      .replace(/",\s*$/gm, '"')  // Remove trailing commas
      .replace(/,\s*$/gm, '')    // Remove trailing commas without quotes
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)  // Remove empty lines
      .join('\n');

    const frontmatter = `---\n${metadataContent}\n---\n\n`;
    return content.replace(metadataRegex, frontmatter);
  }

  return content;
}

function sortEntries(a, b) {
  const specialOrder = ['getting_started', 'basic_examples'];
  const indexA = specialOrder.indexOf(a);
  const indexB = specialOrder.indexOf(b);
  
  if (indexA !== -1 && indexB !== -1) {
    return indexA - indexB;
  } else if (indexA !== -1) {
    return -1;
  } else if (indexB !== -1) {
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
        // Check if the directory is in the allowList
        if (!allowList.includes(entry.name)) {
          return null;
        }
        const subItems = generateSidebar(
          fullPath,
          `${basePath}/${entry.name}`
        );
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
  return string.replace(/\b\w/g, l => l.toUpperCase());
}

function generateId(name, basePath) {
  const label = getLabelFromFilesystem(name);
  return 'stylus-by-example'+(basePath + '/' + label).toLowerCase();
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