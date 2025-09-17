const fs = require('fs');
const path = require('path');

const { RendererEvent } = require('typedoc');
const { parseMarkdownContentTitle } = require('@docusaurus/utils');
const prettier = require('prettier');

// Configuration constants
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

// Main plugin function
function load(app) {
  // Define output directories
  const outputDir = path.join(app.options.getValue('out'), '../../docs/stylus-by-example');
  const basicExamplesOutputDir = path.join(outputDir, 'basic_examples');
  const applicationsOutputDir = path.join(outputDir, 'applications');
  
  // Define source directories
  const sourceDirBasicExamples = path.join(
    app.options.getValue('out'),
    '../../submodules/stylus-by-example/src/app/basic_examples',
  );
  const sourceDirApplications = path.join(
    app.options.getValue('out'),
    '../../submodules/stylus-by-example/src/app/applications',
  );

  // Register event handlers
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

// Utility functions
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
  // Validate source directory
  if (!fs.existsSync(source)) {
    return;
  }

  if (!fs.lstatSync(source).isDirectory()) {
    return;
  }

  // Create target directory
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
          const targetFilePath = path.join(newTargetPath, entry.name);
          const formattedContent = formatMDXFile(validatedContent, targetFilePath);
          fs.writeFileSync(targetFilePath, formattedContent);
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
        const targetFilePath = path.join(targetPath, newFileName);
        const content = fs.readFileSync(sourcePath, 'utf8');
        const convertedContent = convertMetadataToFrontmatter(content);
        const validatedContent = validateContent(convertedContent, sourcePath);
        const convertedContentWithBanner =
          addAdmonitionOneLineAboveFirstCodeBlock(validatedContent);
        const formattedContent = formatMDXFile(convertedContentWithBanner, targetFilePath);
        fs.writeFileSync(targetFilePath, formattedContent);
      }
    }
  }

  processDirectory(source, target, true);
}

// Content processing constants and functions
const firstCodeBlock = `\`\`\`rust`;
const admonitionNotForProduction = `
import NotForProductionBannerPartial from '../../partials/_not-for-production-banner-partial.mdx';

<NotForProductionBannerPartial />
`;

function addAdmonitionOneLineAboveFirstCodeBlock(content) {
  const index = content.indexOf(firstCodeBlock);
  
  if (index === -1) {
    // firstCodeBlock not found
    return content; // Return original content instead of undefined
  }

  // Find the position two lines before firstCodeBlock
  const lines = content.substring(0, index).split('\n');
  
  if (lines.length < 2) {
    // Not enough lines before code block for banner insertion
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
      // Error parsing metadata
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

// Sidebar generation functions
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

// Content validation and formatting functions
/**
 * Comprehensive typo and content validation
 */
function validateContent(content, filePath) {
  let validatedContent = content;
  let fixesApplied = [];
  
  // Comprehensive typo database
  const typoDatabase = {
    // Common English typos
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
    'begining': 'beginning',
    'calender': 'calendar',
    'cemetary': 'cemetery',
    'changable': 'changeable',
    'collegue': 'colleague',
    'concious': 'conscious',
    'definate': 'definite',
    'embarass': 'embarrass',
    'enviroment': 'environment',
    'goverment': 'government',
    'independant': 'independent',
    'neccessary': 'necessary',
    'occurance': 'occurrence',
    'perseverence': 'perseverance',
    'priviledge': 'privilege',
    'publically': 'publicly',
    'recomend': 'recommend',
    'refered': 'referred',
    'relevent': 'relevant',
    'supercede': 'supersede',
    'tendancy': 'tendency',
    'truely': 'truly',
    'wierd': 'weird',
    
    // Technical/Programming typos
    'lenght': 'length',
    'widht': 'width',
    'heigth': 'height',
    'indeces': 'indices',
    'accesible': 'accessible',
    'compatable': 'compatible',
    'dependancy': 'dependency',
    'efficency': 'efficiency',
    'exectuable': 'executable',
    'flexable': 'flexible',
    'initialise': 'initialize',
    'paramater': 'parameter',
    'privilage': 'privilege',
    'proccess': 'process',
    'seperation': 'separation',
    'succesful': 'successful',
    'syncronous': 'synchronous',
    'trasaction': 'transaction',
    'varient': 'variant',
    'verfication': 'verification',
    
    // Blockchain/Crypto specific typos
    'blokchain': 'blockchain',
    'cryptocurency': 'cryptocurrency',
    'ethereum': 'Ethereum',
    'bitcoin': 'Bitcoin',
    'smartcontract': 'smart contract',
    'decentalized': 'decentralized',
    'consesus': 'consensus',
    'validater': 'validator',
    'tranaction': 'transaction',
    'addres': 'address',
    'ballance': 'balance',
    'recipent': 'recipient',
    'recepient': 'recipient',
    'wallet': 'wallet',
    'minning': 'mining',
    'hasrate': 'hashrate',
    'merkletree': 'Merkle tree',
    'nounce': 'nonce',
    'dapp': 'dApp',
    'defi': 'DeFi',
    'nft': 'NFT',
    'dao': 'DAO',
    'api': 'API',
    'sdk': 'SDK',
    'evm': 'EVM',
    'l1': 'Layer 1',
    'l2': 'Layer 2',
    'l3': 'Layer 3',
    
    // Case sensitivity corrections for proper nouns
    'solidity': 'Solidity',
    'rust': 'Rust',
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'nodejs': 'Node.js',
    'github': 'GitHub',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'aws': 'AWS',
    'gcp': 'GCP',
    'azure': 'Azure',
    
    // Common markdown/documentation issues
    'eg.': 'e.g.,',
    'ie.': 'i.e.,',
    'etc.': 'etc.',
    'vs.': 'vs.',
  };
  
  // Apply typo fixes with word boundary checks to avoid partial matches
  for (const [typo, correction] of Object.entries(typoDatabase)) {
    const regex = new RegExp(`\\b${typo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = validatedContent.match(regex);
    
    if (matches) {
      validatedContent = validatedContent.replace(regex, correction);
      fixesApplied.push(`"${typo}" -> "${correction}" (${matches.length} occurrence${matches.length > 1 ? 's' : ''})`);
    }
  }
  
  // Fix common markdown formatting issues
  const markdownFixes = [
    // Fix missing spaces after list markers
    { pattern: /^(\s*[-*+])([^\s])/gm, replacement: '$1 $2', description: 'Missing space after list marker' },
    // Fix multiple consecutive spaces
    { pattern: /  +/g, replacement: ' ', description: 'Multiple consecutive spaces' },
    // Fix trailing spaces
    { pattern: / +$/gm, replacement: '', description: 'Trailing spaces' },
    // Fix inconsistent code block formatting
    { pattern: /```(\w+)\s*\n/g, replacement: '```$1\n', description: 'Code block language formatting' },
    // Fix missing space after headers
    { pattern: /^(#+)([^\s#])/gm, replacement: '$1 $2', description: 'Missing space after header marker' },
    // Fix double spaces in sentences
    { pattern: /([.!?])  +/g, replacement: '$1 ', description: 'Double spaces after punctuation' },
  ];
  
  for (const fix of markdownFixes) {
    const beforeLength = validatedContent.length;
    validatedContent = validatedContent.replace(fix.pattern, fix.replacement);
    const afterLength = validatedContent.length;
    
    if (beforeLength !== afterLength) {
      fixesApplied.push(fix.description);
    }
  }
  
  // Log all fixes applied
  if (fixesApplied.length > 0) {
    // Content fixes applied
  }
  
  return validatedContent;
}

/**
 * Formats MDX file with Prettier and additional content validation
 */
function formatMDXFile(content, filePath) {
  try {
    // Pre-format validation and fixes
    let processedContent = content;
    
    // Apply Prettier-compatible pre-processing
    processedContent = preprocessMDXContent(processedContent);
    
    // Format with Prettier using enhanced configuration
    const formattedResult = prettier.formatWithCursor(processedContent, {
      cursorOffset: 0,
      parser: 'mdx',
      filepath: filePath,
      // Enhanced Prettier options for better MDX formatting
      printWidth: 100,
      tabWidth: 2,
      useTabs: false,
      singleQuote: true,
      trailingComma: 'all',
      proseWrap: 'preserve',
      semi: true,
      bracketSpacing: true,
      arrowParens: 'avoid',
      endOfLine: 'lf',
      // MDX-specific options
      embeddedLanguageFormatting: 'auto',
    });
    
    // Post-format validation
    const finalContent = postProcessMDXContent(formattedResult.formatted, filePath);
    
    // Successfully formatted MDX file
    return finalContent;
  } catch (error) {
    // Failed to format MDX file - returning unformatted content as fallback
    return content;
  }
}

/**
 * Pre-processes MDX content for better Prettier compatibility
 */
function preprocessMDXContent(content) {
  let processed = content;
  
  // Fix common MDX formatting issues that Prettier might struggle with
  const fixes = [
    // Ensure proper spacing around JSX components
    { pattern: /(<[A-Z][^>]*>)(\S)/g, replacement: '$1\n$2', description: 'JSX component spacing' },
    { pattern: /(\S)(<\/[A-Z][^>]*>)/g, replacement: '$1\n$2', description: 'JSX closing tag spacing' },
    
    // Fix frontmatter formatting
    { pattern: /^---\s*\n([\s\S]*?)\n\s*---/m, replacement: (match, frontmatter) => {
      return `---\n${frontmatter.trim()}\n---`;
    }, description: 'Frontmatter formatting' },
    
    // Ensure proper code block formatting
    { pattern: /```(\w+)\s*\n\s*\n/g, replacement: '```$1\n', description: 'Code block spacing' },
    
    // Fix import statements formatting
    { pattern: /^import\s+(.+?)\s+from\s+['"](.+?)['"];?\s*$/gm, replacement: "import $1 from '$2';", description: 'Import statement formatting' },
  ];
  
  fixes.forEach(fix => {
    if (typeof fix.replacement === 'function') {
      processed = processed.replace(fix.pattern, fix.replacement);
    } else {
      processed = processed.replace(fix.pattern, fix.replacement);
    }
  });
  
  return processed;
}

/**
 * Post-processes formatted MDX content for final validation
 */
function postProcessMDXContent(content, filePath) {
  let processed = content;
  
  // Final validation and cleanup
  const postFixes = [
    // Ensure single newline at end of file
    { pattern: /\n*$/, replacement: '\n', description: 'Single trailing newline' },
    
    // Remove excessive blank lines
    { pattern: /\n{3,}/g, replacement: '\n\n', description: 'Excessive blank lines' },
    
    // Ensure proper spacing after headers
    { pattern: /^(#{1,6}\s+.+)(?=\n[^\n#])/gm, replacement: '$1\n', description: 'Header spacing' },
  ];
  
  postFixes.forEach(fix => {
    const before = processed.length;
    processed = processed.replace(fix.pattern, fix.replacement);
    if (before !== processed.length) {
      // Applied post-format fix
    }
  });
  
  return processed;
}

// Sidebar configuration types and validation
/**
 * Enhanced sidebar configuration types for better type safety
 */
interface SidebarItem {
  type: 'doc' | 'category' | 'link' | 'html' | 'ref';
  id?: string;
  label: string;
  items?: SidebarItem[];
  href?: string;
  className?: string;
  customProps?: Record<string, any>;
}

interface SidebarConfig {
  items: SidebarItem[];
}

/**
 * Validates sidebar configuration against Docusaurus conventions
 */
function validateSidebarConfig(config: SidebarConfig, filePath: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const seenLabels = new Set<string>();
  
  function validateItem(item: SidebarItem, path: string = '') {
    const currentPath = path ? `${path}.${item.label}` : item.label;
    
    // Validate required fields
    if (!item.type) {
      errors.push(`Missing 'type' field at ${currentPath}`);
    }
    
    if (!item.label || typeof item.label !== 'string') {
      errors.push(`Missing or invalid 'label' field at ${currentPath}`);
    }
    
    // Validate type-specific requirements
    switch (item.type) {
      case 'doc':
        if (!item.id) {
          errors.push(`Missing 'id' field for doc item at ${currentPath}`);
        } else {
          // Check for duplicate IDs
          if (seenIds.has(item.id)) {
            errors.push(`Duplicate ID '${item.id}' found at ${currentPath}`);
          }
          seenIds.add(item.id);
        }
        break;
        
      case 'category':
        if (!item.items || !Array.isArray(item.items)) {
          errors.push(`Missing or invalid 'items' array for category at ${currentPath}`);
        } else if (item.items.length === 0) {
          errors.push(`Empty 'items' array for category at ${currentPath}`);
        }
        break;
        
      case 'link':
        if (!item.href) {
          errors.push(`Missing 'href' field for link item at ${currentPath}`);
        }
        break;
    }
    
    // Check for duplicate labels at the same level
    const labelKey = `${path}:${item.label}`;
    
    if (seenLabels.has(labelKey)) {
      errors.push(`Duplicate label '${item.label}' found at ${currentPath}`);
    }
    seenLabels.add(labelKey);
    
    // Validate label conventions (sentence case)
    if (item.label && typeof item.label === 'string') {
      const isProperSentenceCase = /^[A-Z][a-z]/.test(item.label) || /^[A-Z]+$/.test(item.label);
      
      if (!isProperSentenceCase) {
        // Label should use sentence case
      }
    }
    
    // Recursively validate nested items
    if (item.items && Array.isArray(item.items)) {
      item.items.forEach(subItem => validateItem(subItem, currentPath));
    }
  }
  
  if (!config.items || !Array.isArray(config.items)) {
    errors.push('Root configuration must have an "items" array');
  } else {
    config.items.forEach(item => validateItem(item));
  }
  
  return { isValid: errors.length === 0, errors };
}

// Sidebar formatting functions
/**
 * Formats sidebar file with enhanced Docusaurus compliance and Prettier formatting
 */
function formatSidebarFile(sidebarConfig: SidebarConfig, filePath: string): string {
  try {
    // Validate sidebar configuration
    const validation = validateSidebarConfig(sidebarConfig, filePath);
    
    if (!validation.isValid) {
      // Sidebar validation errors detected
      throw new Error(`Invalid sidebar configuration: ${validation.errors.join(', ')}`);
    }
    
    // Sidebar validation passed
    
    // Optimize sidebar configuration for better formatting
    const optimizedConfig = optimizeSidebarConfig(sidebarConfig);
    
    // Generate enhanced Docusaurus-compliant sidebar content
    const sidebarContent = generateSidebarContent(optimizedConfig);
    
    // Apply Prettier formatting with enhanced configuration
    const formattedResult = prettier.formatWithCursor(sidebarContent, {
      cursorOffset: 0,
      parser: 'babel',
      filepath: filePath,
      // Enhanced Prettier options for better Docusaurus compatibility
      singleQuote: true,
      trailingComma: 'all',
      printWidth: 100,
      tabWidth: 2,
      semi: true,
      bracketSpacing: true,
      arrowParens: 'avoid',
      endOfLine: 'lf',
      quoteProps: 'as-needed',
      // Object formatting options
      bracketSameLine: false,
      objectCurlySpacing: true,
    });
    
    // Post-format validation and cleanup
    const finalContent = postProcessSidebarContent(formattedResult.formatted, filePath);
    
    // Successfully formatted sidebar file
    return finalContent;
  } catch (error) {
    // Failed to format sidebar file
    
    // Create a robust fallback sidebar
    const fallbackContent = generateFallbackSidebar(sidebarConfig, filePath);
    // Using fallback sidebar configuration
    return fallbackContent;
  }
}

/**
 * Optimizes sidebar configuration for better formatting and compliance
 */
function optimizeSidebarConfig(config: SidebarConfig): SidebarConfig {
  function optimizeItem(item: SidebarItem): SidebarItem {
    const optimized: SidebarItem = {
      type: item.type,
      label: item.label.trim(),
    };
    
    // Add type-specific properties in a consistent order
    if (item.id) optimized.id = item.id.trim();
    if (item.href) optimized.href = item.href.trim();
    if (item.className) optimized.className = item.className.trim();
    
    // Recursively optimize nested items
    if (item.items && Array.isArray(item.items)) {
      optimized.items = item.items.map(optimizeItem);
    }
    
    // Add custom properties last
    if (item.customProps) optimized.customProps = item.customProps;
    
    return optimized;
  }
  
  return {
    items: config.items.map(optimizeItem),
  };
}

/**
 * Generates properly formatted sidebar content with enhanced documentation
 */
function generateSidebarContent(config: SidebarConfig): string {
  const timestamp = new Date().toISOString();
  const configJson = JSON.stringify(config, null, 2);
  
  return `// @ts-check
/**
 * @fileoverview Autogenerated sidebar configuration for Stylus by Example
 * @description This file is automatically generated by stylusByExampleDocsHandler.ts
 * @generated ${timestamp}
 * @see https://docusaurus.io/docs/sidebar
 * @see https://docusaurus.io/docs/sidebar/items
 */

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebarConfig = ${configJson};

/**
 * Export only the items array as required by Docusaurus
 * @type {import('@docusaurus/plugin-content-docs').SidebarItem[]}
 */
module.exports = sidebarConfig.items;
`;
}

/**
 * Post-processes formatted sidebar content for final validation
 */
function postProcessSidebarContent(content: string, filePath: string): string {
  let processed = content;
  
  // Final validation and cleanup for JavaScript/TypeScript files
  const postFixes = [
    // Ensure proper module.exports formatting
    { 
      pattern: /module\.exports\s*=\s*sidebarConfig\.items\s*;?\s*$/m, 
      replacement: 'module.exports = sidebarConfig.items;', 
      description: 'Module exports formatting' 
    },
    
    // Ensure single newline at end of file
    { pattern: /\n*$/, replacement: '\n', description: 'Single trailing newline' },
    
    // Fix any double semicolons
    { pattern: /;;+/g, replacement: ';', description: 'Double semicolons' },
    
    // Ensure proper spacing in JSDoc comments
    { pattern: /\/\*\*\s*\n\s*\*\s*/g, replacement: '/**\n * ', description: 'JSDoc formatting' },
  ];
  
  postFixes.forEach(fix => {
    const before = processed.length;
    processed = processed.replace(fix.pattern, fix.replacement);
    
    if (before !== processed.length) {
      // Applied sidebar post-format fix
    }
  });
  
  return processed;
}

/**
 * Generates a robust fallback sidebar when formatting fails
 */
function generateFallbackSidebar(config: SidebarConfig, filePath: string): string {
  const timestamp = new Date().toISOString();
  
  try {
    // Try to create a minimal but valid sidebar
    const minimalConfig = {
      items: config.items.map(item => ({
        type: item.type,
        label: item.label,
        ...(item.id && { id: item.id }),
        ...(item.items && { items: item.items }),
      })),
    };
    
    return `// @ts-check
// WARNING: This is a fallback sidebar generated due to formatting errors
// Generated: ${timestamp}
// File: ${path.basename(filePath)}

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebar = ${JSON.stringify(minimalConfig, null, 2)};

module.exports = sidebar.items;
`;
  } catch (fallbackError) {
    // Ultimate fallback - empty sidebar
    // Critical error generating fallback sidebar
    return `// @ts-check
// CRITICAL ERROR: Unable to generate sidebar configuration
// Generated: ${timestamp}
// File: ${path.basename(filePath)}

module.exports = [];
`;
  }
}

// Export the main load function
exports.load = load;
