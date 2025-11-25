/**
 * MIT License - Copyright (c) 2025 Offchain Labs
 *
 * Test Fixtures - Sample Documents
 *
 * Realistic test data representing Arbitrum documentation
 */

export const testDocuments = new Map([
  [
    '/docs/arbitrum-overview.md',
    {
      filePath: '/docs/arbitrum-overview.md',
      relativePath: 'arbitrum-overview.md',
      frontmatter: {
        title: 'Arbitrum Overview',
        content_type: 'concept',
        tags: ['arbitrum', 'layer 2', 'scaling'],
      },
      headings: [
        { text: 'What is Arbitrum?' },
        { text: 'Layer 2 Scaling' },
        { text: 'Optimistic Rollups' },
      ],
      content: `Arbitrum is a Layer 2 scaling solution for Ethereum that uses optimistic rollups.
    It significantly reduces gas costs while maintaining Ethereum's security guarantees.
    Arbitrum uses fraud proofs to ensure transaction validity and supports the full Ethereum
    Virtual Machine (EVM). Gas optimization is crucial for efficient Layer 2 operations.`,
    },
  ],

  [
    '/docs/gas-optimization.md',
    {
      filePath: '/docs/gas-optimization.md',
      relativePath: 'gas-optimization.md',
      frontmatter: {
        title: 'Gas Optimization Techniques',
        content_type: 'how-to',
        tags: ['gas', 'optimization', 'performance'],
      },
      headings: [
        { text: 'Best Practices' },
        { text: 'Batch Transactions' },
        { text: 'Storage Optimization' },
      ],
      content: `Gas optimization is essential for reducing transaction costs on Arbitrum.
    Key techniques include batching transactions, using efficient data structures, and
    minimizing storage operations. Layer 2 scaling solutions like Arbitrum inherently
    reduce gas costs compared to Ethereum mainnet. Developers should optimize smart contracts
    for gas efficiency using proven design patterns.`,
    },
  ],

  [
    '/docs/optimistic-rollups.md',
    {
      filePath: '/docs/optimistic-rollups.md',
      relativePath: 'optimistic-rollups.md',
      frontmatter: {
        title: 'Optimistic Rollups Explained',
        content_type: 'concept',
        tags: ['optimistic rollup', 'fraud proof', 'rollup'],
      },
      headings: [
        { text: 'How Optimistic Rollups Work' },
        { text: 'Fraud Proofs' },
        { text: 'State Transition' },
      ],
      content: `Optimistic rollups assume transactions are valid by default and only verify them
    if challenged. Fraud proofs are used to challenge invalid transactions during the dispute
    period. This approach enables high throughput while maintaining security. State transition
    functions process batches of transactions off-chain. The sequencer aggregates transactions
    and posts them to the Ethereum mainnet.`,
    },
  ],

  [
    '/docs/cross-chain-messaging.md',
    {
      filePath: '/docs/cross-chain-messaging.md',
      relativePath: 'cross-chain-messaging.md',
      frontmatter: {
        title: 'Cross-Chain Messaging',
        content_type: 'tutorial',
        tags: ['cross-chain', 'bridge', 'messaging'],
      },
      headings: [
        { text: 'Retryable Tickets' },
        { text: 'Outbox Messages' },
        { text: 'Message Lifecycle' },
      ],
      content: `Cross-chain messaging enables communication between Ethereum and Arbitrum.
    Retryable tickets allow L1 to L2 messaging with guaranteed execution. Outbox messages
    enable L2 to L1 communication with Merkle proof verification. The transaction lifecycle
    includes submission, execution, and confirmation phases. Arbitrum Nova supports fast
    cross-chain transactions.`,
    },
  ],

  [
    '/docs/nitro-stack.md',
    {
      filePath: '/docs/nitro-stack.md',
      relativePath: 'nitro-stack.md',
      frontmatter: {
        title: 'Arbitrum Nitro Stack',
        content_type: 'reference',
        tags: ['nitro', 'architecture', 'technology'],
      },
      headings: [
        { text: 'Architecture Overview' },
        { text: 'WASM Execution' },
        { text: 'State Transition' },
      ],
      content: `The Nitro stack is Arbitrum's latest technology upgrade featuring WebAssembly
    execution and advanced state transition mechanisms. It provides faster transaction
    processing and improved gas optimization. The sequencer decentralization roadmap aims
    to distribute block production. Data availability is ensured through batch posting to
    Ethereum. Nitro's architecture supports multiple execution environments.`,
    },
  ],

  [
    '/docs/fraud-proofs.md',
    {
      filePath: '/docs/fraud-proofs.md',
      relativePath: 'fraud-proofs.md',
      frontmatter: {
        title: 'Understanding Fraud Proofs',
        content_type: 'concept',
        tags: ['fraud proof', 'security', 'validation'],
      },
      headings: [
        { text: 'Proof Generation' },
        { text: 'Challenge Period' },
        { text: 'Dispute Resolution' },
      ],
      content: `Fraud proofs are the security mechanism in optimistic rollups. Validators can
    challenge invalid state transitions by submitting fraud proofs during the challenge period.
    The proof of stake consensus ensures economic security. Dispute resolution involves
    interactive proving between challenger and defender. Gas optimization during fraud proof
    generation reduces verification costs.`,
    },
  ],

  [
    '/docs/arbitrum-nova.md',
    {
      filePath: '/docs/arbitrum-nova.md',
      relativePath: 'arbitrum-nova.md',
      frontmatter: {
        title: 'Arbitrum Nova Chain',
        content_type: 'concept',
        tags: ['arbitrum nova', 'anytrust', 'chain'],
      },
      headings: [
        { text: 'AnyTrust Protocol' },
        { text: 'Data Availability Committee' },
        { text: 'Use Cases' },
      ],
      content: `Arbitrum Nova is a chain optimized for ultra-low cost transactions using the
    AnyTrust protocol. It relies on a Data Availability Committee for data storage instead
    of posting all data to Ethereum. This enables significantly lower gas costs for gaming
    and social applications. Layer 2 scaling reaches new levels with Nova's architecture.
    Cross-chain messaging connects Nova with other Arbitrum chains.`,
    },
  ],

  [
    '/docs/sequencer-decentralization.md',
    {
      filePath: '/docs/sequencer-decentralization.md',
      relativePath: 'sequencer-decentralization.md',
      frontmatter: {
        title: 'Sequencer Decentralization',
        content_type: 'roadmap',
        tags: ['sequencer', 'decentralization', 'roadmap'],
      },
      headings: [
        { text: 'Current Architecture' },
        { text: 'Decentralization Plans' },
        { text: 'Fair Ordering' },
      ],
      content: `Sequencer decentralization is a key milestone in Arbitrum's roadmap. The current
    centralized sequencer will transition to a distributed network of validators. Fair ordering
    mechanisms prevent front-running and MEV extraction. The transaction lifecycle will include
    consensus among multiple sequencers. State transition finality depends on sequencer
    agreement and fraud proof validation.`,
    },
  ],

  [
    '/docs/evm-compatibility.md',
    {
      filePath: '/docs/evm-compatibility.md',
      relativePath: 'evm-compatibility.md',
      frontmatter: {
        title: 'EVM Compatibility',
        content_type: 'reference',
        tags: ['evm', 'compatibility', 'ethereum'],
      },
      headings: [{ text: 'Smart Contract Support' }, { text: 'Opcodes' }, { text: 'Gas Metering' }],
      content: `Arbitrum provides full EVM compatibility, supporting all Ethereum smart contracts
    and tools. The WASM-based execution in Nitro stack maintains Ethereum equivalence while
    improving performance. Gas optimization strategies from Ethereum apply to Arbitrum with
    additional layer 2 specific optimizations. Developers can deploy existing contracts
    without modifications. The transaction lifecycle mirrors Ethereum's execution model.`,
    },
  ],

  [
    '/docs/delayed-inbox.md',
    {
      filePath: '/docs/delayed-inbox.md',
      relativePath: 'delayed-inbox.md',
      frontmatter: {
        title: 'Delayed Inbox Mechanism',
        content_type: 'technical',
        tags: ['delayed inbox', 'censorship resistance', 'inbox'],
      },
      headings: [
        { text: 'Censorship Resistance' },
        { text: 'Force Inclusion' },
        { text: 'Transaction Ordering' },
      ],
      content: `The delayed inbox provides censorship resistance by allowing users to force
    include transactions if the sequencer is down or censoring. Transactions submitted to
    the delayed inbox are guaranteed to execute after a delay period. This ensures the
    liveness and censorship resistance of the Arbitrum chain. Cross-chain messaging can
    utilize the delayed inbox for guaranteed delivery. The transaction lifecycle includes
    delayed inbox as a fallback mechanism.`,
    },
  ],
]);

export const testConcepts = {
  topConcepts: [
    { concept: 'arbitrum', frequency: 150, data: { type: 'single' } },
    { concept: 'ethereum', frequency: 140, data: { type: 'single' } },
    {
      concept: 'gas optimization',
      frequency: 130,
      data: { type: 'phrase', length: 2, components: ['gas', 'optimization'] },
    },
    {
      concept: 'layer 2',
      frequency: 120,
      data: { type: 'phrase', length: 2, components: ['layer', '2'] },
    },
    {
      concept: 'optimistic rollup',
      frequency: 110,
      data: { type: 'phrase', length: 2, components: ['optimistic', 'rollup'] },
    },
    {
      concept: 'fraud proof',
      frequency: 100,
      data: { type: 'phrase', length: 2, components: ['fraud', 'proof'] },
    },
    { concept: 'cross-chain', frequency: 90, data: { type: 'single' } },
    {
      concept: 'nitro stack',
      frequency: 80,
      data: { type: 'phrase', length: 2, components: ['nitro', 'stack'] },
    },
    { concept: 'sequencer', frequency: 70, data: { type: 'single' } },
    {
      concept: 'transaction lifecycle',
      frequency: 60,
      data: { type: 'phrase', length: 2, components: ['transaction', 'lifecycle'] },
    },
    {
      concept: 'state transition',
      frequency: 55,
      data: { type: 'phrase', length: 2, components: ['state', 'transition'] },
    },
    {
      concept: 'arbitrum nova',
      frequency: 50,
      data: { type: 'phrase', length: 2, components: ['arbitrum', 'nova'] },
    },
    {
      concept: 'retryable ticket',
      frequency: 45,
      data: { type: 'phrase', length: 2, components: ['retryable', 'ticket'] },
    },
    {
      concept: 'delayed inbox',
      frequency: 40,
      data: { type: 'phrase', length: 2, components: ['delayed', 'inbox'] },
    },
    { concept: 'bridge', frequency: 35, data: { type: 'single' } },
  ],
};

export const testQueries = {
  exact: [
    { query: 'arbitrum', expected: 'arbitrum', matchType: 'exact' },
    { query: 'gas optimization', expected: 'gas optimization', matchType: 'exact' },
    { query: 'ethereum', expected: 'ethereum', matchType: 'exact' },
  ],
  fuzzy: [
    { query: 'arbitrom', expected: 'arbitrum', matchType: 'fuzzy' },
    { query: 'ehtereum', expected: 'ethereum', matchType: 'fuzzy' },
    { query: 'optimistc', expected: 'optimistic rollup', matchType: 'fuzzy' },
    { query: 'ARB', expected: 'arbitrum', matchType: 'abbreviation' },
    { query: 'ETH', expected: 'ethereum', matchType: 'abbreviation' },
  ],
  partial: [
    { query: 'opt', expected: 'gas optimization', matchType: 'partial' },
    { query: 'rollup', expected: 'optimistic rollup', matchType: 'partial' },
    { query: 'proof', expected: 'fraud proof', matchType: 'partial' },
  ],
  fulltext: [
    { query: 'layer 2 scaling', minResults: 2 },
    { query: 'transaction validation', minResults: 1 },
    { query: 'smart contract execution', minResults: 1 },
    { query: 'censorship resistance', minResults: 1 },
  ],
};

export default {
  testDocuments,
  testConcepts,
  testQueries,
};
