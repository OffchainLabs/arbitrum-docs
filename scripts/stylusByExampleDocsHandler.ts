const fs = require('fs');
const path = require('path');
const { RendererEvent } = require('typedoc');
const { parseMarkdownContentTitle } = require('@docusaurus/utils');
const prettier = require('prettier');

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

const appsAllowList = ['erc20', 'erc721', 'vending_machine', 'multi_call'];

function load(app) {
  const outputDir = path.join(app.options.getValue('out'), '../../docs/stylus-by-example');
  const basicExamplesOutputDir = path.join(outputDir, 'basic_examples');
  const applicationsOutputDir = path.join(outputDir, 'applications');
  const sourceDirBasicExamples = path.join(
    app.options.getValue('out'),
    '../../submodules/stylus-by-example/src/app/basic_examples',
  );
  const sourceDirApplications = path.join(
    app.options.getValue('out'),
    '../../submodules/stylus-by-example/src/app/applications',
  );

  app.renderer.on(RendererEvent.START, async () => {
    cleanDirectory(outputDir);
  });

  app.renderer.on(RendererEvent.END, async () => {
    // Copy basic examples into their directory
    copyFiles(sourceDirBasicExamples, basicExamplesOutputDir, allowList);

    // Generate sidebar for basic examples
    const basicExamplesSidebarItems = generateSidebar(basicExamplesOutputDir, '/basic_examples');
    const basicExamplesSidebarConfig = { items: basicExamplesSidebarItems };
    const basicExamplesSidebarPath = path.join(basicExamplesOutputDir, 'sidebar.js');

    const basicSidebarContent = formatSidebarFile(basicExamplesSidebarConfig, basicExamplesSidebarPath);
    fs.writeFileSync(basicExamplesSidebarPath, basicSidebarContent, 'utf8');

    // Copy applications into their directory
    copyFiles(sourceDirApplications, applicationsOutputDir, appsAllowList);

    // Generate sidebar for applications
    const applicationsSidebarItems = generateSidebar(applicationsOutputDir, '/applications');
    const applicationsSidebarConfig = { items: applicationsSidebarItems };
    const applicationsSidebarPath = path.join(applicationsOutputDir, 'sidebar.js');

    const appsSidebarContent = formatSidebarFile(applicationsSidebarConfig, applicationsSidebarPath);
    fs.writeFileSync(applicationsSidebarPath, appsSidebarContent, 'utf8');
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

function copyFiles(source, target, allowList) {
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
          const validatedContent = validateContent(convertedContent, sourcePath);
          fs.writeFileSync(path.join(newTargetPath, entry.name), validatedContent);
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
        const validatedContent = validateContent(convertedContent, sourcePath);
        const convertedContentWithBanner =
          addAdmonitionOneLineAboveFirstCodeBlock(validatedContent);
        fs.writeFileSync(path.join(targetPath, newFileName), convertedContentWithBanner);
      }
    }
  }

  processDirectory(source, target, true);
}

// Adjust the file path
const firstCodeBlock = `\`\`\`rust`;
const admonitionNotForProduction = `
import NotForProductionBannerPartial from '../../partials/_not-for-production-banner-partial.mdx';

<NotForProductionBannerPartial />
`;

function addAdmonitionOneLineAboveFirstCodeBlock(content) {
  const index = content.indexOf(firstCodeBlock);
  if (index === -1) {
    console.log('firstCodeBlock not found');
    return content; // Return original content instead of undefined
  }

  // Find the position two lines before firstCodeBlock
  const lines = content.substring(0, index).split('\n');
  if (lines.length < 2) {
    console.warn('Not enough lines before code block for banner insertion');
    return content;
  }
  
  const insertLineIndex = Math.max(0, lines.length - 2);
  lines.splice(insertLineIndex, 0, admonitionNotForProduction);

  const newText = lines.join('\n') + content.substring(index);
  return newText;
}

function convertMetadataToFrontmatter(content) {
  const metadataRegex = /export const metadata = ({[\s\S]*?});/;
  const match = content.match(metadataRegex);

  if (match) {
    let metadataObj;
    try {
      // Safer parsing without eval()
      // First, try to parse as a JavaScript object literal
      const metadataString = match[1]
        .trim()
        // Handle single quotes to double quotes
        .replace(/'/g, '"')
        // Handle unquoted keys
        .replace(/(\w+):/g, '"$1":')
        // Handle template literals (basic conversion)
        .replace(/`([^`]*)`/g, '"$1"')
        // Clean up any double-double quotes
        .replace(/""/g, '"');
      
      try {
        metadataObj = JSON.parse(metadataString);
      } catch (jsonError) {
        // If JSON parsing fails, try a more lenient approach
        // Create a Function constructor (safer than eval but still evaluate the code)
        const func = new Function('return ' + match[1]);
        metadataObj = func();
      }
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

/**
 * Validates and fixes common typos in content
 */
function validateContent(content, filePath) {
  // Common typos to fix
  const commonTypos = {
    'followinge': 'following',
    'recieve': 'receive',
    'occured': 'occurred',
    'seperate': 'separate',
    'definately': 'definitely',
    'occassion': 'occasion',
    'untill': 'until',
    'acheive': 'achieve',
    'arguement': 'argument',
    'existance': 'existence',
  };
  
  let validatedContent = content;
  for (const [typo, correction] of Object.entries(commonTypos)) {
    if (validatedContent.includes(typo)) {
      console.warn(`Found typo "${typo}" in ${filePath}, auto-correcting to "${correction}"`);
      validatedContent = validatedContent.replace(new RegExp(typo, 'g'), correction);
    }
  }
  
  return validatedContent;
}

/**
 * Formats sidebar file with Prettier
 */
function formatSidebarFile(sidebarConfig, filePath) {
  // Generate properly formatted JavaScript code
  const sidebarContent = `// @ts-check
/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebar = ${JSON.stringify(sidebarConfig, null, 2)};
module.exports = sidebar.items;
`;

  try {
    // Try to format with Prettier (synchronous API)
    // Note: Using formatWithCursor for synchronous operation
    const formattedResult = prettier.formatWithCursor(sidebarContent, {
      cursorOffset: 0,
      parser: 'babel',
      filepath: filePath,
      singleQuote: true,
      trailingComma: 'all',
      printWidth: 100,
      tabWidth: 2,
      semi: true,
    });
    
    return formattedResult.formatted;
  } catch (error) {
    console.error(`Failed to format sidebar file ${filePath}:`, error.message);
    // Return the unformatted content as fallback
    return sidebarContent;
  }
}

exports.load = load;
