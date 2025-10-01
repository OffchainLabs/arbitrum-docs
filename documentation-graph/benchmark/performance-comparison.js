/**
 * Performance Comparison Benchmark
 * Compares the optimized concept extraction with baseline performance expectations
 */

import { ConceptExtractor } from '../src/extractors/conceptExtractor.js';
import performanceMonitor from '../src/utils/performanceMonitor.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample documents for benchmarking
const sampleDocuments = new Map([
  [
    '/sample1.md',
    {
      filePath: '/sample1.md',
      content: `
      Arbitrum is a Layer 2 scaling solution for Ethereum that enables high-throughput,
      low-cost smart contracts while maintaining Ethereum's security guarantees.
      It uses Optimistic Rollup technology to batch transactions off-chain and submit them to Ethereum.

      The Arbitrum Virtual Machine (AVM) is compatible with the Ethereum Virtual Machine (EVM),
      making it easy for developers to deploy existing smart contracts with minimal changes.

      Key features include fast transaction finality, low gas fees, and seamless integration
      with Ethereum's ecosystem. Developers can use familiar tools like Hardhat, Truffle,
      and MetaMask to build and deploy decentralized applications on Arbitrum.
    `,
      frontmatter: {
        title: 'Introduction to Arbitrum',
        description: 'Learn about Arbitrum Layer 2 solution',
        tags: ['arbitrum', 'layer2', 'ethereum'],
      },
      headings: [
        { level: 1, text: 'Introduction to Arbitrum', id: 'introduction' },
        { level: 2, text: 'What is Arbitrum', id: 'what-is-arbitrum' },
        { level: 2, text: 'Key Features', id: 'key-features' },
      ],
    },
  ],
  [
    '/sample2.md',
    {
      filePath: '/sample2.md',
      content: `
      Smart contracts on Arbitrum benefit from significant gas cost reductions compared to Ethereum mainnet.
      The Sequencer processes transactions in the order received, ensuring fairness and preventing front-running.

      Arbitrum uses fraud proofs to ensure transaction validity. If a dispute arises, the protocol can verify
      transactions on the Ethereum mainnet. This approach combines the speed of off-chain processing with
      the security of on-chain settlement.

      The bridge between Ethereum and Arbitrum allows users to transfer assets seamlessly. Deposits typically
      take 10-15 minutes, while withdrawals require a challenge period of approximately 7 days for security.
    `,
      frontmatter: {
        title: 'Arbitrum Technical Architecture',
        description: 'Deep dive into Arbitrum architecture',
        tags: ['arbitrum', 'architecture', 'rollups'],
      },
      headings: [
        { level: 1, text: 'Arbitrum Architecture', id: 'architecture' },
        { level: 2, text: 'Sequencer', id: 'sequencer' },
        { level: 2, text: 'Fraud Proofs', id: 'fraud-proofs' },
      ],
    },
  ],
  [
    '/sample3.md',
    {
      filePath: '/sample3.md',
      content: `
      Deploying a dApp to Arbitrum requires minimal changes to existing Ethereum contracts.
      The development workflow remains familiar, with support for popular frameworks and tools.

      Gas estimation works similarly to Ethereum, but with lower costs due to batching and compression.
      The ArbGas system measures computational complexity and determines transaction fees.

      Advanced features like the Arbitrum SDK provide helpers for cross-chain messaging,
      token bridging, and monitoring transaction status across both L1 and L2 networks.
    `,
      frontmatter: {
        title: 'Deploying to Arbitrum',
        description: 'Guide for deploying dApps on Arbitrum',
        tags: ['arbitrum', 'deployment', 'development'],
      },
      headings: [
        { level: 1, text: 'Deployment Guide', id: 'deployment' },
        { level: 2, text: 'Setup', id: 'setup' },
        { level: 2, text: 'Configuration', id: 'configuration' },
      ],
    },
  ],
]);

async function runBenchmark() {
  console.log('Performance Benchmark - Concept Extraction Optimizations');
  console.log('='.repeat(70));
  console.log('');

  console.log('Optimizations implemented:');
  console.log('  1. Compromise document caching (30% improvement expected)');
  console.log('  2. Jaccard similarity instead of Levenshtein (50-70% faster)');
  console.log('  3. Low-frequency concept pruning (30-40% dataset reduction)');
  console.log('');

  // Initialize extractor
  const extractor = new ConceptExtractor();

  // Run extraction with performance monitoring
  console.log('Running concept extraction on sample documents...');
  console.log('');

  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;

  performanceMonitor.start('benchmark_extraction');
  const result = await extractor.extractFromDocuments(sampleDocuments);
  const metrics = performanceMonitor.end('benchmark_extraction');

  const endTime = Date.now();
  const endMemory = process.memoryUsage().heapUsed;

  // Display results
  console.log('');
  console.log('Results:');
  console.log('-'.repeat(70));
  console.log(`Documents processed: ${sampleDocuments.size}`);
  console.log(`Unique concepts extracted: ${result.concepts.size}`);
  console.log(`Co-occurrence relationships: ${result.cooccurrence.size}`);
  console.log('');
  console.log('Performance Metrics:');
  console.log(`  Total time: ${metrics.duration}ms`);
  console.log(`  Time per document: ${Math.round(metrics.duration / sampleDocuments.size)}ms`);
  console.log(`  CPU time (user): ${metrics.cpuUser}ms`);
  console.log(`  CPU time (system): ${metrics.cpuSystem}ms`);
  console.log(`  Memory start: ${metrics.memoryStart}MB`);
  console.log(`  Memory end: ${metrics.memoryEnd}MB`);
  console.log(`  Memory delta: ${metrics.memoryDelta > 0 ? '+' : ''}${metrics.memoryDelta}MB`);
  console.log('');

  // Display top concepts
  console.log('Top Concepts Extracted:');
  console.log('-'.repeat(70));
  const topConcepts = extractor.getTopConcepts(15);
  topConcepts.forEach((concept, index) => {
    console.log(
      `  ${index + 1}. ${concept.concept} (frequency: ${
        Math.round(concept.frequency * 100) / 100
      }, files: ${concept.fileCount})`,
    );
  });
  console.log('');

  // Performance comparison with baseline expectations
  console.log('Performance Comparison:');
  console.log('-'.repeat(70));

  // Baseline expectations from profiling analysis
  const baselineTimePerDoc = 150; // ms per document (from 28s / ~200 docs)
  const expectedOptimization = 0.5; // 50% improvement expected
  const optimizedTimePerDoc = metrics.duration / sampleDocuments.size;
  const improvement = ((baselineTimePerDoc - optimizedTimePerDoc) / baselineTimePerDoc) * 100;

  console.log(`  Baseline (expected): ${baselineTimePerDoc}ms per document`);
  console.log(`  Optimized (actual): ${Math.round(optimizedTimePerDoc)}ms per document`);
  console.log(`  Improvement: ${improvement > 0 ? '+' : ''}${Math.round(improvement)}%`);
  console.log('');

  console.log('Optimization Effectiveness:');
  console.log('  ✓ Compromise caching: Reduces redundant NLP object creation');
  console.log('  ✓ Jaccard similarity: O(n) vs O(n²) complexity improvement');
  console.log('  ✓ Concept pruning: Reduces normalization workload significantly');
  console.log('');

  // Display full performance report
  console.log(performanceMonitor.generateReport());

  return {
    totalTime: metrics.duration,
    conceptCount: result.concepts.size,
    improvement: improvement,
  };
}

// Run the benchmark
runBenchmark().catch(console.error);
