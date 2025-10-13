/**
 * MIT License
 *
 * Copyright (c) 2025 Offchain Labs
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Configuration for document extraction and concept identification
export const extractionConfig = {
  // File patterns to process
  filePatterns: [
    '**/*.md',
    '**/*.mdx'
  ],
  
  // Directories to exclude
  excludePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/static/**',
    '**/i18n/**'
  ],

  // Concept extraction settings
  conceptExtraction: {
    minLength: 3,
    maxLength: 50,
    minFrequency: 2,

    // Memory management limits
    maxConcepts: 10000,              // Maximum number of unique concepts to extract
    maxCooccurrenceRecords: 50000,   // Maximum co-occurrence pairs to track
    maxConceptsPerDocument: 200,     // Maximum concepts to extract per document

    stopWords: [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'among', 'through',
      'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be',
      'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall',
      'you', 'your', 'yours', 'we', 'our', 'ours', 'they', 'their', 'theirs'
    ]
  },

  // Domain-specific terminology for Arbitrum/blockchain
  domainTerms: {
    blockchain: [
      'arbitrum', 'ethereum', 'rollup', 'layer2', 'layer 2', 'l2', 'l1',
      'smart contract', 'dapp', 'decentralized', 'blockchain', 'validator',
      'sequencer', 'bridge', 'gas', 'transaction', 'block', 'consensus',
      'proof', 'merkle', 'hash', 'signature', 'wallet', 'token', 'erc20',
      'erc721', 'erc1155', 'nft', 'defi', 'yield', 'liquidity', 'swap',
      'stake', 'unstake', 'delegate', 'governance', 'dao', 'proposal'
    ],
    arbitrum: [
      'nitro', 'classic', 'nova', 'orbit', 'stylus', 'bold', 'anytrust',
      'arbos', 'retryable', 'inbox', 'outbox', 'challenge', 'assertion',
      'fraud proof', 'data availability', 'das', 'committee', 'batching',
      'compression', 'aliasing', 'precompile', 'nodeinterface', 'gateway',
      'canonical', 'custom gateway', 'generic gateway', 'weth gateway',
      'fast withdrawal', 'timeboost', 'express lane', 'auction'
    ],
    technical: [
      'api', 'sdk', 'rpc', 'json', 'rest', 'graphql', 'websocket', 'http',
      'https', 'ssl', 'tls', 'tcp', 'udp', 'p2p', 'ipfs', 'docker',
      'kubernetes', 'aws', 'gcp', 'azure', 'terraform', 'ansible',
      'nginx', 'apache', 'redis', 'postgresql', 'mysql', 'mongodb',
      'elasticsearch', 'kafka', 'rabbitmq', 'prometheus', 'grafana'
    ],
    development: [
      'javascript', 'typescript', 'react', 'nodejs', 'npm', 'yarn', 'webpack',
      'babel', 'eslint', 'prettier', 'jest', 'mocha', 'chai', 'cypress',
      'hardhat', 'truffle', 'remix', 'metamask', 'ethers', 'web3', 'viem',
      'solidity', 'vyper', 'rust', 'go', 'python', 'java', 'cplusplus', 'wasm',
      'git', 'github', 'gitlab', 'cicd', 'docker', 'kubernetes'
    ]
  },

  // Link extraction patterns
  linkPatterns: {
    internal: /\[([^\]]+)\]\(([^)]+\.mdx?)\)/g,
    external: /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    anchor: /\[([^\]]+)\]\(#([^)]+)\)/g
  },

  // Heading patterns for structure extraction
  headingPatterns: {
    h1: /^#\s+(.+)$/gm,
    h2: /^##\s+(.+)$/gm,
    h3: /^###\s+(.+)$/gm,
    h4: /^####\s+(.+)$/gm,
    h5: /^#####\s+(.+)$/gm,
    h6: /^######\s+(.+)$/gm
  },

  // Code block patterns
  codeBlockPatterns: {
    fenced: /```(\w+)?\n([\s\S]*?)```/g,
    inline: /`([^`]+)`/g
  },

  // Import/reference patterns for MDX
  importPatterns: {
    mdx: /import\s+.*\s+from\s+['"`]([^'"`]+)['"`]/g,
    docusaurus: /@docusaurus\/[^'"`\s]+/g
  },

  // Partial file configuration
  partialFiles: {
    // Known partial types and their characteristics
    types: {
      banner: {
        description: 'Banner messages and alerts',
        expectedPatterns: ['banner', 'alert', 'notice'],
        commonUsage: 'User notifications and warnings'
      },
      reference: {
        description: 'Reference data and configuration tables',
        expectedPatterns: ['config', 'params', 'reference', 'endpoints', 'addresses'],
        commonUsage: 'Configuration parameters and API references'
      },
      troubleshooting: {
        description: 'Troubleshooting guides and FAQ sections',
        expectedPatterns: ['troubleshooting', 'faq', 'issues', 'problems'],
        commonUsage: 'Common issues and their solutions'
      },
      glossary: {
        description: 'Glossary definitions and term explanations',
        expectedPatterns: ['glossary', 'definition', 'term'],
        commonUsage: 'Technical term definitions'
      },
      content: {
        description: 'Reusable content blocks',
        expectedPatterns: ['intro', 'gentle', 'overview', 'content'],
        commonUsage: 'Shared introductory or explanatory content'
      },
      component: {
        description: 'Interactive components and controls',
        expectedPatterns: ['component', 'control', 'widget', 'interactive'],
        commonUsage: 'Reusable UI components and interactive elements'
      }
    },

    // Directory patterns for partial files
    directoryPatterns: [
      'partials/',
      '**/partials/**',
      'components/',
      '**/components/**'
    ],

    // File naming conventions for partials
    namingPatterns: {
      prefix: ['_', 'partial-'],
      suffix: ['-partial', '-component'],
      extensions: ['.mdx', '.md']
    }
  }
};