/**
 * MIT License - Copyright (c) 2025 Offchain Labs
 *
 * Performance Benchmark Tests
 *
 * Tests performance of fuzzy matching, phrase extraction, and full-text search
 * against target latencies.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { FuzzyMatcher } from '../../mcp-server/src/search/FuzzyMatcher.js';
import { PhraseExtractor } from '../../src/extractors/phraseExtractor.js';
import { FullTextSearchEngine } from '../../mcp-server/src/search/FullTextSearch.js';
import { QueryParser } from '../../mcp-server/src/core/QueryParser.js';
import { testDocuments, testConcepts } from '../fixtures/test-documents.js';

describe('Search Performance Benchmarks', () => {
  let fuzzyMatcher;
  let phraseExtractor;
  let fullTextSearch;
  let queryParser;

  beforeEach(() => {
    fuzzyMatcher = new FuzzyMatcher(testConcepts.topConcepts);
    phraseExtractor = new PhraseExtractor();
    fullTextSearch = new FullTextSearchEngine(testDocuments);
    queryParser = new QueryParser(testDocuments, testConcepts, fullTextSearch);
  });

  describe('Fuzzy Matching Performance', () => {
    it('should complete exact match in < 10ms (P50)', () => {
      const iterations = 100;
      const timings = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        fuzzyMatcher.findFuzzyConcept('arbitrum');
        const end = performance.now();
        timings.push(end - start);
      }

      const p50 = calculatePercentile(timings, 50);
      expect(p50).toBeLessThan(10);
    });

    it('should complete fuzzy match in < 200ms (P50)', () => {
      const iterations = 100;
      const timings = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        fuzzyMatcher.findFuzzyConcept('arbitrom', { threshold: 0.7 });
        const end = performance.now();
        timings.push(end - start);
      }

      const p50 = calculatePercentile(timings, 50);
      expect(p50).toBeLessThan(200);
    });

    it('should complete fuzzy match in < 1000ms (P99)', () => {
      const iterations = 100;
      const timings = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        fuzzyMatcher.findFuzzyConcept('ehtereum', { threshold: 0.7 });
        const end = performance.now();
        timings.push(end - start);
      }

      const p99 = calculatePercentile(timings, 99);
      expect(p99).toBeLessThan(1000);
    });

    it('should have cache hit time < 5ms', () => {
      // Warm up cache
      fuzzyMatcher.findFuzzyConcept('arbitrum');

      const iterations = 100;
      const timings = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        fuzzyMatcher.findFuzzyConcept('arbitrum');
        const end = performance.now();
        timings.push(end - start);
      }

      const p50 = calculatePercentile(timings, 50);
      expect(p50).toBeLessThan(5);
    });

    it('should handle large concept sets efficiently', () => {
      const largeConcepts = Array.from({ length: 1000 }, (_, i) => ({
        concept: `concept${i}`,
      }));
      const largeMatcher = new FuzzyMatcher(largeConcepts);

      const start = performance.now();
      largeMatcher.findFuzzyConcept('concept500', { threshold: 0.7 });
      const end = performance.now();

      expect(end - start).toBeLessThan(500);
    });
  });

  describe('Phrase Extraction Performance', () => {
    it('should extract phrases from document in < 100ms', async () => {
      const doc = Array.from(testDocuments.values())[0];
      const compromise = await import('compromise');
      const nlpDoc = compromise.default(doc.content);

      const start = performance.now();
      phraseExtractor.extractPhrases(nlpDoc, 1.0);
      const end = performance.now();

      expect(end - start).toBeLessThan(100);
    });

    it('should handle large documents efficiently', async () => {
      const longContent = 'Gas optimization is crucial. '.repeat(100);
      const compromise = await import('compromise');
      const nlpDoc = compromise.default(longContent);

      const start = performance.now();
      phraseExtractor.extractPhrases(nlpDoc, 1.0);
      const end = performance.now();

      expect(end - start).toBeLessThan(200);
    });

    it('should build top phrases efficiently', async () => {
      const compromise = await import('compromise');

      // Extract from multiple documents
      for (const doc of testDocuments.values()) {
        const nlpDoc = compromise.default(doc.content);
        const phrases = phraseExtractor.extractPhrases(nlpDoc, 1.0);
        phraseExtractor.recordPhrases(phrases, doc.filePath);
      }

      const start = performance.now();
      phraseExtractor.getTopPhrases(300);
      const end = performance.now();

      expect(end - start).toBeLessThan(50);
    });
  });

  describe('Full-Text Search Performance', () => {
    it('should complete simple search in < 500ms (P50)', () => {
      const iterations = 100;
      const timings = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        fullTextSearch.search('arbitrum', { type: 'simple' });
        const end = performance.now();
        timings.push(end - start);
      }

      const p50 = calculatePercentile(timings, 50);
      expect(p50).toBeLessThan(500);
    });

    it('should complete simple search in < 2000ms (P99)', () => {
      const iterations = 100;
      const timings = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        fullTextSearch.search('layer 2 scaling', { type: 'simple' });
        const end = performance.now();
        timings.push(end - start);
      }

      const p99 = calculatePercentile(timings, 99);
      expect(p99).toBeLessThan(2000);
    });

    it('should complete phrase search efficiently', () => {
      const start = performance.now();
      fullTextSearch.phraseSearch('optimistic rollup');
      const end = performance.now();

      expect(end - start).toBeLessThan(500);
    });

    it('should complete boolean search efficiently', () => {
      const start = performance.now();
      fullTextSearch.booleanSearch('arbitrum AND ethereum');
      const end = performance.now();

      expect(end - start).toBeLessThan(500);
    });

    it('should generate snippets efficiently', () => {
      const doc = Array.from(testDocuments.values())[0];

      const start = performance.now();
      fullTextSearch.generateSnippets(doc, 'arbitrum layer 2', 150);
      const end = performance.now();

      expect(end - start).toBeLessThan(50);
    });
  });

  describe('QueryParser Layered Search Performance', () => {
    it('should complete exact match instantly', () => {
      const start = performance.now();
      queryParser.findConcept('arbitrum');
      const end = performance.now();

      expect(end - start).toBeLessThan(10);
    });

    it('should complete fuzzy match efficiently', () => {
      const start = performance.now();
      queryParser.findConcept('arbitrom');
      const end = performance.now();

      expect(end - start).toBeLessThan(200);
    });

    it('should complete full findConceptWithFallbacks in < 2500ms', () => {
      const start = performance.now();
      queryParser.findConceptWithFallbacks('scaling solution', {
        enableFulltext: true,
      });
      const end = performance.now();

      expect(end - start).toBeLessThan(2500);
    });
  });

  describe('Memory Usage', () => {
    it('should use < 5MB for fuzzy matcher cache', () => {
      // Fill cache
      for (let i = 0; i < 1000; i++) {
        fuzzyMatcher.findFuzzyConcept(`test${i}`, { threshold: 0.7 });
      }

      const cacheSize = fuzzyMatcher.cache.size;
      // Assuming average entry is ~1KB, 5000 entries = ~5MB
      expect(cacheSize).toBeLessThanOrEqual(5000);
    });

    it('should use reasonable memory for phrase extractor', async () => {
      const compromise = await import('compromise');

      // Extract from all test documents
      for (const doc of testDocuments.values()) {
        const nlpDoc = compromise.default(doc.content);
        const phrases = phraseExtractor.extractPhrases(nlpDoc, 1.0);
        phraseExtractor.recordPhrases(phrases, doc.filePath);
      }

      const phraseCount = phraseExtractor.phraseFrequency.size;
      // Should keep reasonable number of phrases
      expect(phraseCount).toBeLessThan(1000);
    });
  });

  describe('Throughput Tests', () => {
    it('should handle 100 fuzzy queries per second', () => {
      const queries = Array.from({ length: 100 }, (_, i) => `test${i}`);

      const start = performance.now();
      queries.forEach((query) => {
        fuzzyMatcher.findFuzzyConcept(query, { threshold: 0.7 });
      });
      const end = performance.now();

      const duration = end - start;
      expect(duration).toBeLessThan(1000); // < 1 second for 100 queries
    });

    it('should handle 50 full-text queries per second', () => {
      const queries = Array.from({ length: 50 }, (_, i) => `query${i}`);

      const start = performance.now();
      queries.forEach((query) => {
        fullTextSearch.search(query, { type: 'simple' });
      });
      const end = performance.now();

      const duration = end - start;
      expect(duration).toBeLessThan(1000);
    });
  });
});

/**
 * Calculate percentile from array of numbers
 */
function calculatePercentile(arr, percentile) {
  if (arr.length === 0) return 0;

  const sorted = arr.slice().sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}
