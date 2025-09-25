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

  // Concept extraction settings - Maximum coverage mode for comprehensive analysis
  // Expected processing time: 3-5 minutes for maximum concept extraction
  conceptExtraction: {
    minLength: 3,
    maxLength: 50,
    minFrequency: 2,
    maxConcepts: 15000, // Significantly increased for maximum concept coverage
    maxConceptsPerDocument: 500, // Doubled for richer per-document analysis
    maxCooccurrenceRecords: 350000, // Doubled for comprehensive relationship mapping
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
  }
};