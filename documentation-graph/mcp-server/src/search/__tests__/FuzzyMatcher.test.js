/**
 * MIT License - Copyright (c) 2025 Offchain Labs
 *
 * FuzzyMatcher Unit Tests
 *
 * Tests fuzzy string matching with Jaccard similarity, Levenshtein distance,
 * abbreviation expansion, and caching.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { FuzzyMatcher } from '../FuzzyMatcher.js';

describe('FuzzyMatcher', () => {
  let fuzzyMatcher;
  let testConcepts;

  beforeEach(() => {
    testConcepts = [
      { concept: 'arbitrum' },
      { concept: 'ethereum' },
      { concept: 'gas optimization' },
      { concept: 'layer 2' },
      { concept: 'optimistic rollup' },
      { concept: 'fraud proof' },
      { concept: 'sequencer' },
      { concept: 'nitro' },
      { concept: 'bridge' },
      { concept: 'cross-chain' },
    ];

    fuzzyMatcher = new FuzzyMatcher(testConcepts);
  });

  describe('Exact Matching', () => {
    it('should return exact match with score 1.0', () => {
      const results = fuzzyMatcher.findFuzzyConcept('arbitrum');
      expect(results).toHaveLength(1);
      expect(results[0].concept).toBe('arbitrum');
      expect(results[0].score).toBe(1.0);
      expect(results[0].matchType).toBe('exact');
    });

    it('should handle case-insensitive exact matches', () => {
      const results = fuzzyMatcher.findFuzzyConcept('ETHEREUM');
      expect(results).toHaveLength(1);
      expect(results[0].concept).toBe('ethereum');
      expect(results[0].score).toBe(1.0);
    });

    it('should handle whitespace normalization', () => {
      const results = fuzzyMatcher.findFuzzyConcept('  gas   optimization  ');
      expect(results).toHaveLength(1);
      expect(results[0].concept).toBe('gas optimization');
      expect(results[0].score).toBe(1.0);
    });
  });

  describe('Jaccard Similarity', () => {
    it('should match typos using Jaccard similarity', () => {
      const results = fuzzyMatcher.findFuzzyConcept('arbitrom', { threshold: 0.7 });
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].concept).toBe('arbitrum');
      expect(results[0].matchType).toBe('jaccard');
      expect(results[0].score).toBeGreaterThan(0.7);
    });

    it('should match with character transposition', () => {
      const results = fuzzyMatcher.findFuzzyConcept('ehtereum', { threshold: 0.7 });
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].concept).toBe('ethereum');
      expect(results[0].score).toBeGreaterThan(0.7);
    });

    it('should calculate correct Jaccard similarity', () => {
      const similarity = fuzzyMatcher.calculateJaccardSimilarity('test', 'test');
      expect(similarity).toBe(1.0);
    });

    it('should generate correct n-grams', () => {
      const ngrams = fuzzyMatcher.generateNgrams('cat', 2);
      expect(ngrams.has('_c')).toBe(true);
      expect(ngrams.has('ca')).toBe(true);
      expect(ngrams.has('at')).toBe(true);
      expect(ngrams.has('t_')).toBe(true);
    });

    it('should handle different n-gram sizes', () => {
      const bigrams = fuzzyMatcher.generateNgrams('test', 2);
      const trigrams = fuzzyMatcher.generateNgrams('test', 3);
      expect(bigrams.size).toBeGreaterThan(0);
      expect(trigrams.size).toBeGreaterThan(0);
      expect(trigrams.size).toBeLessThan(bigrams.size);
    });
  });

  describe('Levenshtein Distance', () => {
    it('should use Levenshtein for very short strings', () => {
      const shortConcepts = [{ concept: 'eth' }, { concept: 'arb' }];
      const matcher = new FuzzyMatcher(shortConcepts);
      const results = matcher.findFuzzyConcept('ath', { threshold: 0.6 });
      expect(results.length).toBeGreaterThan(0);
    });

    it('should calculate correct Levenshtein similarity', () => {
      const similarity = fuzzyMatcher.calculateLevenshteinSimilarity('test', 'test');
      expect(similarity).toBe(1.0);
    });

    it('should handle single character difference', () => {
      const similarity = fuzzyMatcher.calculateLevenshteinSimilarity('test', 'best');
      expect(similarity).toBeGreaterThan(0.7);
    });

    it('should handle empty strings', () => {
      const similarity = fuzzyMatcher.calculateLevenshteinSimilarity('', '');
      expect(similarity).toBe(1.0);
    });
  });

  describe('Abbreviation Expansion', () => {
    it('should expand ARB to arbitrum', () => {
      const results = fuzzyMatcher.findFuzzyConcept('ARB');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].concept).toBe('arbitrum');
      expect(results[0].matchType).toBe('abbreviation');
      expect(results[0].score).toBe(1.0);
    });

    it('should expand ETH to ethereum', () => {
      const results = fuzzyMatcher.findFuzzyConcept('ETH');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].concept).toBe('ethereum');
      expect(results[0].matchType).toBe('abbreviation');
    });

    it('should handle case-insensitive abbreviations', () => {
      const results = fuzzyMatcher.findFuzzyConcept('arb');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].concept).toBe('arbitrum');
    });
  });

  describe('Substring Matching', () => {
    it('should match when query is substring of concept', () => {
      const results = fuzzyMatcher.findFuzzyConcept('opt', { threshold: 0.5 });
      expect(results.length).toBeGreaterThan(0);
      const optimisticMatch = results.find((r) => r.concept.includes('optimistic'));
      expect(optimisticMatch).toBeDefined();
      expect(optimisticMatch.matchType).toBe('substring');
    });

    it('should match when concept is substring of query', () => {
      const results = fuzzyMatcher.findFuzzyConcept('nitrostuff', { threshold: 0.5 });
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].concept).toBe('nitro');
      expect(results[0].matchType).toBe('substring');
    });

    it('should calculate correct substring score', () => {
      const results = fuzzyMatcher.findFuzzyConcept('bridge', { threshold: 0.8 });
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].score).toBeGreaterThan(0.8);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search term', () => {
      const results = fuzzyMatcher.findFuzzyConcept('');
      expect(results).toHaveLength(0);
    });

    it('should handle null search term', () => {
      const results = fuzzyMatcher.findFuzzyConcept(null);
      expect(results).toHaveLength(0);
    });

    it('should handle undefined search term', () => {
      const results = fuzzyMatcher.findFuzzyConcept(undefined);
      expect(results).toHaveLength(0);
    });

    it('should handle special characters', () => {
      const results = fuzzyMatcher.findFuzzyConcept('cross-chain');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].concept).toBe('cross-chain');
    });

    it('should handle numbers', () => {
      const results = fuzzyMatcher.findFuzzyConcept('layer 2');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].concept).toBe('layer 2');
    });

    it('should skip very short terms', () => {
      const results = fuzzyMatcher.findFuzzyConcept('ab', { threshold: 0.7 });
      expect(results).toHaveLength(0);
    });
  });

  describe('Threshold Tuning', () => {
    it('should return more results with lower threshold', () => {
      const highThreshold = fuzzyMatcher.findFuzzyConcept('arbitr', { threshold: 0.9 });
      const lowThreshold = fuzzyMatcher.findFuzzyConcept('arbitr', { threshold: 0.5 });
      expect(lowThreshold.length).toBeGreaterThanOrEqual(highThreshold.length);
    });

    it('should respect threshold limit', () => {
      const results = fuzzyMatcher.findFuzzyConcept('xyz', { threshold: 0.9 });
      results.forEach((result) => {
        expect(result.score).toBeGreaterThanOrEqual(0.9);
      });
    });

    it('should use default threshold when not provided', () => {
      const results = fuzzyMatcher.findFuzzyConcept('arbitrum');
      expect(results).toHaveLength(1);
    });
  });

  describe('Result Limiting', () => {
    it('should respect limit parameter', () => {
      const results = fuzzyMatcher.findFuzzyConcept('optimistic', { limit: 2 });
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should use default limit of 5', () => {
      const largeConcepts = Array.from({ length: 20 }, (_, i) => ({
        concept: `concept${i}`,
      }));
      const matcher = new FuzzyMatcher(largeConcepts);
      const results = matcher.findFuzzyConcept('concept');
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should sort results by score descending', () => {
      const results = fuzzyMatcher.findFuzzyConcept('arbi', { limit: 10 });
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });
  });

  describe('Performance and Caching', () => {
    it('should cache results', () => {
      const firstCall = fuzzyMatcher.findFuzzyConcept('arbitrum', { threshold: 0.8 });
      const secondCall = fuzzyMatcher.findFuzzyConcept('arbitrum', { threshold: 0.8 });
      expect(firstCall).toEqual(secondCall);
    });

    it('should have different cache keys for different thresholds', () => {
      const high = fuzzyMatcher.findFuzzyConcept('arbitrum', { threshold: 0.9 });
      const low = fuzzyMatcher.findFuzzyConcept('arbitrum', { threshold: 0.5 });
      expect(high).toBeDefined();
      expect(low).toBeDefined();
    });

    it('should clear cache', () => {
      fuzzyMatcher.findFuzzyConcept('arbitrum');
      fuzzyMatcher.clearCache();
      expect(fuzzyMatcher.cache.size).toBe(0);
    });

    it('should evict old entries when cache is full', () => {
      const smallCacheMatcher = new FuzzyMatcher(testConcepts, { cacheSize: 2 });
      smallCacheMatcher.findFuzzyConcept('test1');
      smallCacheMatcher.findFuzzyConcept('test2');
      smallCacheMatcher.findFuzzyConcept('test3');
      expect(smallCacheMatcher.cache.size).toBeLessThanOrEqual(2);
    });
  });

  describe('Length Pre-filtering', () => {
    it('should filter candidates by length difference', () => {
      const candidates = [
        { normalized: 'abc', original: { concept: 'abc' } },
        { normalized: 'abcdefghijklmnop', original: { concept: 'abcdefghijklmnop' } },
        { normalized: 'abcd', original: { concept: 'abcd' } },
      ];
      const filtered = fuzzyMatcher.preFilterByLength('abcd', candidates);
      expect(filtered.length).toBeLessThan(candidates.length);
      expect(filtered.every((c) => Math.abs(c.normalized.length - 4) <= 2)).toBe(true);
    });

    it('should keep candidates with similar length', () => {
      const candidates = [
        { normalized: 'test', original: { concept: 'test' } },
        { normalized: 'testing', original: { concept: 'testing' } },
      ];
      const filtered = fuzzyMatcher.preFilterByLength('test', candidates);
      expect(filtered.length).toBeGreaterThan(0);
    });
  });

  describe('Term Normalization', () => {
    it('should convert to lowercase', () => {
      const normalized = fuzzyMatcher.normalizeTerm('ARBITRUM');
      expect(normalized).toBe('arbitrum');
    });

    it('should trim whitespace', () => {
      const normalized = fuzzyMatcher.normalizeTerm('  arbitrum  ');
      expect(normalized).toBe('arbitrum');
    });

    it('should remove special characters except hyphens', () => {
      const normalized = fuzzyMatcher.normalizeTerm('test@#$-value');
      expect(normalized).toBe('test-value');
    });

    it('should normalize multiple spaces', () => {
      const normalized = fuzzyMatcher.normalizeTerm('gas    optimization');
      expect(normalized).toBe('gas optimization');
    });

    it('should handle empty input', () => {
      const normalized = fuzzyMatcher.normalizeTerm('');
      expect(normalized).toBe('');
    });
  });

  describe('Match Explanation', () => {
    it('should provide explanation for exact match', () => {
      const results = fuzzyMatcher.findFuzzyConcept('arbitrum');
      expect(results[0].explanation).toContain('Exact match');
    });

    it('should provide explanation for fuzzy match', () => {
      const results = fuzzyMatcher.findFuzzyConcept('arbitrom', { threshold: 0.7 });
      expect(results[0].explanation).toBeDefined();
      expect(results[0].explanation).toContain('%');
    });

    it('should provide explanation for abbreviation', () => {
      const results = fuzzyMatcher.findFuzzyConcept('ARB');
      expect(results[0].explanation).toContain('Abbreviation expansion');
    });
  });
});
