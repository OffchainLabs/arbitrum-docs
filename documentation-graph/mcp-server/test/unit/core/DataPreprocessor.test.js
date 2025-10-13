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

/**
 * DataPreprocessor Unit Tests (TDD - RED Phase)
 * These tests are written FIRST and will FAIL until implementation is complete
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { DataPreprocessor } from '../../../src/core/DataPreprocessor.js';
import { loadFixtureCached } from '../../helpers/fixtureLoader.js';

describe('DataPreprocessor', () => {
  let preprocessor;
  let graphData;
  let documents;
  let concepts;

  beforeEach(async () => {
    // Load test fixtures
    graphData = await loadFixtureCached('graphs', 'small');
    documents = await loadFixtureCached('documents', 'simple');
    concepts = await loadFixtureCached('concepts', 'basic');

    // Create fresh instance for each test
    preprocessor = new DataPreprocessor({
      graph: graphData,
      documents,
      concepts,
    });
  });

  describe('constructor', () => {
    test('DP-U-001: Should create instance with required data', () => {
      expect(preprocessor).toBeDefined();
      expect(preprocessor.graph).toEqual(graphData);
      expect(preprocessor.documents).toEqual(documents);
      expect(preprocessor.concepts).toEqual(concepts);
    });

    test('DP-U-002: Should throw error if graph is missing', () => {
      expect(() => {
        new DataPreprocessor({ documents, concepts });
      }).toThrow('Graph data is required');
    });
  });

  describe('generateMetadataSummary()', () => {
    test('DP-U-003: Should generate summary under 100KB', async () => {
      const summary = await preprocessor.generateMetadataSummary();
      const summarySize = JSON.stringify(summary).length;

      expect(summarySize).toBeLessThan(100 * 1024); // 100KB
      expect(summary).toHaveProperty('nodeTypes');
      expect(summary).toHaveProperty('edgeTypes');
      expect(summary).toHaveProperty('topConcepts');
      expect(summary).toHaveProperty('documentIndex');
    });

    test('DP-U-004: Should include all node type counts', async () => {
      const summary = await preprocessor.generateMetadataSummary();

      expect(summary.nodeTypes).toHaveProperty('document');
      expect(summary.nodeTypes).toHaveProperty('concept');
      expect(summary.nodeTypes.document).toBeGreaterThan(0);
    });

    test('DP-U-005: Should extract top 100 concepts with correct frequencies', async () => {
      const summary = await preprocessor.generateMetadataSummary();

      expect(Array.isArray(summary.topConcepts)).toBe(true);
      expect(summary.topConcepts.length).toBeLessThanOrEqual(100);

      // Should be sorted by frequency descending
      for (let i = 0; i < summary.topConcepts.length - 1; i++) {
        expect(summary.topConcepts[i].frequency).toBeGreaterThanOrEqual(
          summary.topConcepts[i + 1].frequency,
        );
      }
    });

    test('DP-U-006: Should create bidirectional document index', async () => {
      const summary = await preprocessor.generateMetadataSummary();

      expect(summary.documentIndex).toBeDefined();
      expect(Object.keys(summary.documentIndex).length).toBeGreaterThan(0);

      // Check if a known document is indexed
      const firstDoc = documents[0];
      expect(summary.documentIndex[firstDoc.relativePath]).toBeDefined();
    });

    test('DP-U-007: Should handle empty/minimal graphs gracefully', async () => {
      const emptyPreprocessor = new DataPreprocessor({
        graph: { nodes: [], edges: [] },
        documents: [],
        concepts: { topConcepts: [] },
      });

      const summary = await emptyPreprocessor.generateMetadataSummary();

      expect(summary).toBeDefined();
      expect(summary.nodeTypes).toEqual({});
      expect(summary.topConcepts).toEqual([]);
      expect(JSON.stringify(summary).length).toBeLessThan(1024); // < 1KB
    });
  });

  describe('buildInvertedIndexes()', () => {
    test('DP-U-008: Should build concept → documents index', async () => {
      const indexes = await preprocessor.buildInvertedIndexes();

      expect(indexes.conceptToDocuments).toBeDefined();
      expect(indexes.conceptToDocuments instanceof Map).toBe(true);

      // Check if known concept is indexed
      const rollupDocs = indexes.conceptToDocuments.get('rollup');
      expect(rollupDocs).toBeDefined();
      expect(Array.isArray(rollupDocs)).toBe(true);

      // Should be sorted by weight descending
      if (rollupDocs.length > 1) {
        for (let i = 0; i < rollupDocs.length - 1; i++) {
          expect(rollupDocs[i].weight).toBeGreaterThanOrEqual(rollupDocs[i + 1].weight);
        }
      }
    });

    test('DP-U-009: Should build document → concepts index', async () => {
      const indexes = await preprocessor.buildInvertedIndexes();

      expect(indexes.documentToConcepts).toBeDefined();
      expect(indexes.documentToConcepts instanceof Map).toBe(true);

      // Check if known document is indexed
      const firstDoc = documents[0];
      const docConcepts = indexes.documentToConcepts.get(firstDoc.relativePath);
      expect(docConcepts).toBeDefined();
      expect(Array.isArray(docConcepts)).toBe(true);
    });

    test('DP-U-010: Should handle documents with no concepts', async () => {
      const indexes = await preprocessor.buildInvertedIndexes();

      // Add a document with no concepts
      const docWithNoConcepts = {
        id: 'empty',
        relativePath: 'empty.md',
        concepts: [],
      };

      preprocessor.documents.push(docWithNoConcepts);
      const newIndexes = await preprocessor.buildInvertedIndexes();

      const emptyConcepts = newIndexes.documentToConcepts.get('empty.md');
      expect(emptyConcepts).toEqual([]);
    });

    test('DP-U-011: Should normalize concept names for indexing', async () => {
      // Add concepts with mixed case
      const mixedCasePreprocessor = new DataPreprocessor({
        graph: graphData,
        documents,
        concepts: {
          topConcepts: [
            { term: 'Arbitrum', frequency: 10, documents: ['doc1'] },
            { term: 'arbitrum', frequency: 5, documents: ['doc2'] },
            { term: 'ARBITRUM', frequency: 3, documents: ['doc3'] },
          ],
        },
      });

      const indexes = await mixedCasePreprocessor.buildInvertedIndexes();

      // All should be normalized to lowercase and merged
      const arbitrumDocs = indexes.conceptToDocuments.get('arbitrum');
      expect(arbitrumDocs).toBeDefined();
      expect(arbitrumDocs.length).toBeGreaterThan(0);
    });

    test('DP-U-012: Should limit index size for performance', async () => {
      const indexes = await preprocessor.buildInvertedIndexes();

      // Check that no concept has more than 100 documents
      for (const [concept, docs] of indexes.conceptToDocuments) {
        expect(docs.length).toBeLessThanOrEqual(100);
      }

      // Check that no document has more than 50 concepts
      for (const [docPath, concepts] of indexes.documentToConcepts) {
        expect(concepts.length).toBeLessThanOrEqual(50);
      }
    });
  });

  describe('buildSimilarityMatrix()', () => {
    test('DP-U-013: Should compute similarity for top N documents', async () => {
      const matrix = await preprocessor.buildSimilarityMatrix({ top: 10 });

      expect(Array.isArray(matrix)).toBe(true);

      // Each entry should have doc1, doc2, similarity
      for (const entry of matrix) {
        expect(entry).toHaveProperty('doc1');
        expect(entry).toHaveProperty('doc2');
        expect(entry).toHaveProperty('similarity');
        expect(entry.similarity).toBeGreaterThanOrEqual(0);
        expect(entry.similarity).toBeLessThanOrEqual(1);
      }
    });

    test('DP-U-014: Should use sparse matrix format for efficiency', async () => {
      const matrix = await preprocessor.buildSimilarityMatrix({
        top: 10,
        minSimilarity: 0.6,
      });

      // Should only include pairs with similarity >= 0.6
      for (const entry of matrix) {
        expect(entry.similarity).toBeGreaterThanOrEqual(0.6);
      }

      // Size should be reasonable
      const matrixSize = JSON.stringify(matrix).length;
      expect(matrixSize).toBeLessThan(50 * 1024); // < 50KB
    });

    test('DP-U-015: Should cache similarity scores with proper precision', async () => {
      const matrix = await preprocessor.buildSimilarityMatrix({ top: 5 });

      for (const entry of matrix) {
        // Similarity should be rounded to 3 decimals
        const decimalPlaces = (entry.similarity.toString().split('.')[1] || '').length;
        expect(decimalPlaces).toBeLessThanOrEqual(3);
      }
    });

    test('DP-U-016: Should handle documents with no similar pairs', async () => {
      const uniquePreprocessor = new DataPreprocessor({
        graph: graphData,
        documents: [
          { id: 'doc1', content: 'completely unique content about apples' },
          { id: 'doc2', content: 'totally different content about zebras' },
        ],
        concepts: { topConcepts: [] },
      });

      const matrix = await uniquePreprocessor.buildSimilarityMatrix({
        minSimilarity: 0.6,
      });

      // Should return empty array, not throw error
      expect(Array.isArray(matrix)).toBe(true);
    });

    test('DP-U-017: Should prioritize most connected documents', async () => {
      // This test will validate that we select top documents by centrality
      const matrix = await preprocessor.buildSimilarityMatrix({ top: 3 });

      // If there are any similar pairs, they should be from the top 3 documents
      expect(matrix).toBeDefined();
      expect(Array.isArray(matrix)).toBe(true);
    });
  });

  describe('chunkLargeFiles()', () => {
    test('DP-U-018: Should split documents into chunks of max size', async () => {
      const result = await preprocessor.chunkLargeFiles({
        data: documents,
        maxChunkSize: 500 * 1024, // 500KB
      });

      expect(result).toHaveProperty('chunks');
      expect(Array.isArray(result.chunks)).toBe(true);
      expect(result.chunks.length).toBeGreaterThan(0);

      // Each chunk should be valid JSON and under max size
      for (const chunk of result.chunks) {
        const chunkSize = JSON.stringify(chunk).length;
        expect(chunkSize).toBeLessThanOrEqual(600 * 1024); // Allow 20% overhead
      }
    });

    test('DP-U-019: Should maintain referential integrity in chunks', async () => {
      const result = await preprocessor.chunkLargeFiles({
        data: documents,
        maxChunkSize: 500 * 1024,
      });

      // Collect all document IDs from chunks
      const allDocIds = new Set();
      for (const chunk of result.chunks) {
        for (const doc of chunk) {
          allDocIds.add(doc.id);
        }
      }

      // All original document IDs should be present
      for (const doc of documents) {
        expect(allDocIds.has(doc.id)).toBe(true);
      }
    });

    test('DP-U-020: Should create chunk manifest for navigation', async () => {
      const result = await preprocessor.chunkLargeFiles({
        data: documents,
        maxChunkSize: 500 * 1024,
        createManifest: true,
      });

      expect(result).toHaveProperty('chunks');
      expect(result).toHaveProperty('manifest');
      expect(result.manifest).toHaveProperty('chunkCount');
      expect(result.manifest).toHaveProperty('itemToChunkMap');

      // Manifest should map each document to its chunk number
      for (const doc of documents) {
        expect(result.manifest.itemToChunkMap[doc.id]).toBeDefined();
      }
    });

    test('DP-U-021: Should handle single large item exceeding chunk size', async () => {
      const largeItem = {
        id: 'large',
        content: 'x'.repeat(600 * 1024), // 600KB item
      };

      const chunksResult = await preprocessor.chunkLargeFiles({
        data: [largeItem],
        maxChunkSize: 500 * 1024,
      });

      // Should place large item in its own chunk
      expect(chunksResult.chunks).toBeDefined();
      expect(chunksResult.chunks.length).toBeGreaterThan(0);

      // Should have warning about oversized item
      expect(chunksResult.warnings).toBeDefined();
      expect(chunksResult.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('runFullPipeline()', () => {
    test('DP-U-022: Should run complete preprocessing in correct order', async () => {
      const result = await preprocessor.runFullPipeline();

      expect(result).toHaveProperty('metadata');
      expect(result).toHaveProperty('indexes');
      expect(result).toHaveProperty('similarityMatrix');
      expect(result).toHaveProperty('chunks');
      expect(result).toHaveProperty('stats');

      // Stats should include timing information
      expect(result.stats).toHaveProperty('totalTime');
      expect(result.stats.totalTime).toBeLessThan(60000); // < 60 seconds
    });

    test('DP-U-023: Should be idempotent (safe to run multiple times)', async () => {
      const result1 = await preprocessor.runFullPipeline();
      const result2 = await preprocessor.runFullPipeline();

      // Results should be identical (or very similar)
      expect(result1.metadata.nodeTypes).toEqual(result2.metadata.nodeTypes);
      expect(result1.stats).toBeDefined();
      expect(result2.stats).toBeDefined();
    });

    test('DP-U-024: Should report preprocessing statistics', async () => {
      const result = await preprocessor.runFullPipeline();

      expect(result.stats).toHaveProperty('originalSizes');
      expect(result.stats).toHaveProperty('preprocessedSizes');
      expect(result.stats).toHaveProperty('compressionRatio');
      expect(result.stats).toHaveProperty('processingTime');

      // Compression ratio should show improvement
      expect(result.stats.compressionRatio).toBeLessThan(1);
    });

    test('DP-U-025: Should handle empty data gracefully', async () => {
      const emptyPreprocessor = new DataPreprocessor({
        graph: { nodes: [], edges: [] },
        documents: [],
        concepts: { topConcepts: [] },
      });

      const result = await emptyPreprocessor.runFullPipeline();

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.indexes).toBeDefined();
      // Should not throw errors
    });
  });
});
