/**
 * MIT License - Copyright (c) 2025 Offchain Labs
 *
 * QueryParser Integration Tests
 *
 * Tests layered search strategy with exact match, fuzzy match, partial match,
 * and full-text search fallback.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { QueryParser } from '../QueryParser.js';
import { FuzzyMatcher } from '../../search/FuzzyMatcher.js';
import { FullTextSearchEngine } from '../../search/FullTextSearch.js';

describe('QueryParser', () => {
  let queryParser;
  let testConcepts;
  let testDocuments;
  let fullTextSearch;

  beforeEach(() => {
    testConcepts = {
      topConcepts: [
        { concept: 'arbitrum', frequency: 100 },
        { concept: 'ethereum', frequency: 90 },
        { concept: 'gas optimization', frequency: 80 },
        { concept: 'layer 2', frequency: 70 },
        { concept: 'optimistic rollup', frequency: 60 },
        { concept: 'fraud proof', frequency: 50 },
        { concept: 'sequencer', frequency: 40 },
        { concept: 'bridge', frequency: 30 },
      ],
    };

    testDocuments = new Map([
      [
        '/docs/arbitrum.md',
        {
          frontmatter: { title: 'Arbitrum' },
          content: 'Arbitrum is a layer 2 scaling solution.',
        },
      ],
      [
        '/docs/ethereum.md',
        {
          frontmatter: { title: 'Ethereum' },
          content: 'Ethereum with smart contracts.',
        },
      ],
    ]);

    fullTextSearch = new FullTextSearchEngine(testDocuments);
    queryParser = new QueryParser(testDocuments, testConcepts, fullTextSearch);
  });

  describe('Initialization', () => {
    it('should initialize with documents and concepts', () => {
      expect(queryParser.documents).toBe(testDocuments);
      expect(queryParser.concepts).toBe(testConcepts);
    });

    it('should initialize fuzzy matcher', () => {
      expect(queryParser.fuzzyMatcher).toBeDefined();
      expect(queryParser.fuzzyMatcher).toBeInstanceOf(FuzzyMatcher);
    });

    it('should accept full-text search engine', () => {
      expect(queryParser.fullTextSearch).toBe(fullTextSearch);
    });

    it('should allow setting full-text search later', () => {
      const parser = new QueryParser(testDocuments, testConcepts);
      expect(parser.fullTextSearch).toBeNull();
      parser.setFullTextSearch(fullTextSearch);
      expect(parser.fullTextSearch).toBe(fullTextSearch);
    });
  });

  describe('Layer 1: Exact Match', () => {
    it('should find exact matches (case-insensitive)', () => {
      const result = queryParser.findConcept('arbitrum');
      expect(result).toBe('arbitrum');
    });

    it('should handle case-insensitive exact matches', () => {
      const result = queryParser.findConcept('ETHEREUM');
      expect(result).toBe('ethereum');
    });

    it('should handle exact matches with whitespace', () => {
      const result = queryParser.findConcept('gas optimization');
      expect(result).toBe('gas optimization');
    });

    it('should return null for non-existent terms', () => {
      const result = queryParser.findConcept('nonexistent');
      expect(result).toBeNull();
    });

    it('should bypass fuzzy matching for exact matches', () => {
      const result = queryParser.findConcept('arbitrum');
      expect(result).toBe('arbitrum');
    });
  });

  describe('Layer 2: Fuzzy Match', () => {
    it('should find fuzzy matches for typos', () => {
      const result = queryParser.findConcept('arbitrom');
      expect(result).toBe('arbitrum');
    });

    it('should handle abbreviation expansion', () => {
      const result = queryParser.findConcept('ARB');
      expect(result).toBe('arbitrum');
    });

    it('should handle character transposition', () => {
      const result = queryParser.findConcept('ehtereum');
      expect(result).toBe('ethereum');
    });

    it('should respect fuzzy threshold', () => {
      const result = queryParser.findConcept('xyz', { fuzzyThreshold: 0.9 });
      expect(result).toBeNull();
    });

    it('should return best fuzzy match', () => {
      const result = queryParser.findConcept('sequencr');
      expect(result).toBe('sequencer');
    });
  });

  describe('Layer 3: Partial Match', () => {
    it('should find partial matches when fuzzy fails', () => {
      const result = queryParser.findConcept('opt');
      expect(result).toBe('gas optimization');
    });

    it('should return most frequent partial match', () => {
      const result = queryParser.findConcept('layer');
      expect(result).toBe('layer 2');
    });

    it('should handle substring matching', () => {
      const result = queryParser.findConcept('rollup');
      expect(result).toBe('optimistic rollup');
    });
  });

  describe('Layer 4: Full-Text Fallback', () => {
    it('should use full-text search when all layers fail', () => {
      const result = queryParser.findConceptWithFallbacks('scaling', {
        enableFulltext: true,
      });
      expect(result.found).toBe(true);
      expect(result.bestMatch.layer).toBe('fulltext');
    });

    it('should not use full-text when disabled', () => {
      const result = queryParser.findConceptWithFallbacks('scaling', {
        enableFulltext: false,
      });
      expect(result.found).toBe(false);
    });

    it('should include documents in full-text results', () => {
      const result = queryParser.findConceptWithFallbacks('smart', {
        enableFulltext: true,
      });
      if (result.found && result.bestMatch.layer === 'fulltext') {
        expect(result.bestMatch).toHaveProperty('documents');
      }
    });
  });

  describe('findConceptWithFallbacks', () => {
    it('should return detailed match information for exact match', () => {
      const result = queryParser.findConceptWithFallbacks('arbitrum');
      expect(result.found).toBe(true);
      expect(result.bestMatch.concept).toBe('arbitrum');
      expect(result.bestMatch.layer).toBe('exact');
      expect(result.bestMatch.score).toBe(1.0);
      expect(result.bestMatch.confidence).toBe(1.0);
    });

    it('should return detailed match information for fuzzy match', () => {
      const result = queryParser.findConceptWithFallbacks('arbitrom');
      expect(result.found).toBe(true);
      expect(result.bestMatch.concept).toBe('arbitrum');
      expect(result.bestMatch.layer).toBe('fuzzy');
      expect(result.bestMatch.score).toBeGreaterThan(0.7);
    });

    it('should track all search attempts', () => {
      const result = queryParser.findConceptWithFallbacks('arbitrom');
      expect(result.attempts).toBeDefined();
      expect(result.attempts.length).toBeGreaterThan(0);
      expect(result.attempts[0]).toHaveProperty('layer');
      expect(result.attempts[0]).toHaveProperty('success');
    });

    it('should include explanation in match', () => {
      const result = queryParser.findConceptWithFallbacks('arbitrum');
      expect(result.bestMatch.explanation).toBeDefined();
      expect(typeof result.bestMatch.explanation).toBe('string');
    });

    it('should return not found when all layers fail', () => {
      const result = queryParser.findConceptWithFallbacks('xyznonexistent', {
        enableFulltext: false,
      });
      expect(result.found).toBe(false);
      expect(result.bestMatch).toBeNull();
    });

    it('should respect enableFuzzy option', () => {
      const result = queryParser.findConceptWithFallbacks('arbitrom', {
        enableFuzzy: false,
      });
      // Should skip fuzzy layer
      const fuzzyAttempt = result.attempts.find((a) => a.layer === 'fuzzy');
      expect(fuzzyAttempt).toBeUndefined();
    });
  });

  describe('Natural Language Query Parsing', () => {
    it('should parse concept from "about" queries', () => {
      const filters = queryParser.parseQuery('Show me all docs about gas optimization');
      expect(filters.concept).toBe('gas optimization');
    });

    it('should parse concept from "for" queries', () => {
      const filters = queryParser.parseQuery('Find docs for layer 2');
      expect(filters.concept).toBe('layer 2');
    });

    it('should extract content type', () => {
      const filters = queryParser.parseQuery('Show quickstart docs');
      expect(filters.contentType).toBe('quickstart');
    });

    it('should extract similarity threshold', () => {
      const filters = queryParser.parseQuery('Find docs with 70% similarity');
      expect(filters.similarity).toBe(0.7);
    });

    it('should extract connection threshold', () => {
      const filters = queryParser.parseQuery('Show hubs with >10 connections');
      expect(filters.connections).toBe(10);
    });

    it('should detect orphaned filter', () => {
      const filters = queryParser.parseQuery('Find orphaned documents');
      expect(filters.orphaned).toBe(true);
    });

    it('should handle multiple filters', () => {
      const filters = queryParser.parseQuery(
        'Show orphaned quickstart docs about gas optimization',
      );
      expect(filters.concept).toBeDefined();
      expect(filters.contentType).toBe('quickstart');
      expect(filters.orphaned).toBe(true);
    });
  });

  describe('Document Filtering', () => {
    const mockDocs = [
      {
        relativePath: 'quickstart.md',
        frontmatter: { content_type: 'quickstart' },
        directory: 'guides',
        navigation: { isOrphaned: false },
      },
      {
        relativePath: 'concept.md',
        frontmatter: { content_type: 'concept' },
        directory: 'concepts',
        navigation: { isOrphaned: true },
      },
      {
        relativePath: 'tutorial.md',
        frontmatter: { content_type: 'tutorial' },
        directory: 'guides',
        navigation: { isOrphaned: false },
      },
    ];

    it('should filter by content type', () => {
      const filters = { contentType: 'quickstart' };
      const results = queryParser.applyFilters(mockDocs, filters);
      expect(results.length).toBe(1);
      expect(results[0].frontmatter.content_type).toBe('quickstart');
    });

    it('should filter by directory', () => {
      const filters = { directory: 'guides' };
      const results = queryParser.applyFilters(mockDocs, filters);
      expect(results.length).toBe(2);
      results.forEach((doc) => {
        expect(doc.directory).toBe('guides');
      });
    });

    it('should filter by orphaned status', () => {
      const filters = { orphaned: true };
      const results = queryParser.applyFilters(mockDocs, filters);
      expect(results.length).toBe(1);
      expect(results[0].navigation.isOrphaned).toBe(true);
    });

    it('should apply multiple filters', () => {
      const filters = { directory: 'guides', contentType: 'quickstart' };
      const results = queryParser.applyFilters(mockDocs, filters);
      expect(results.length).toBe(1);
    });

    it('should return all docs when no filters', () => {
      const filters = {};
      const results = queryParser.applyFilters(mockDocs, filters);
      expect(results.length).toBe(mockDocs.length);
    });
  });

  describe('Document Search', () => {
    const mockDocsArray = [
      {
        relativePath: 'arbitrum.md',
        frontmatter: { title: 'Arbitrum', content_type: 'concept' },
        directory: 'concepts',
      },
      {
        relativePath: 'quickstart.md',
        frontmatter: { title: 'Quick Start', content_type: 'quickstart' },
        directory: 'guides',
      },
    ];

    beforeEach(() => {
      queryParser.documents = mockDocsArray;
    });

    it('should search documents with filters', () => {
      const result = queryParser.searchDocuments('Show concept docs');
      expect(result.results).toBeDefined();
      expect(result.filters.contentType).toBe('concept');
    });

    it('should return formatted results', () => {
      const result = queryParser.searchDocuments('Show all docs');
      expect(result).toHaveProperty('query');
      expect(result).toHaveProperty('filters');
      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('totalResults');
    });

    it('should include document metadata in results', () => {
      const result = queryParser.searchDocuments('Show all docs');
      if (result.results.length > 0) {
        expect(result.results[0]).toHaveProperty('path');
        expect(result.results[0]).toHaveProperty('title');
        expect(result.results[0]).toHaveProperty('contentType');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search term', () => {
      const result = queryParser.findConcept('');
      expect(result).toBeNull();
    });

    it('should handle null search term', () => {
      const result = queryParser.findConcept(null);
      expect(result).toBeNull();
    });

    it('should handle undefined search term', () => {
      const result = queryParser.findConcept(undefined);
      expect(result).toBeNull();
    });

    it('should handle search with no concepts', () => {
      const emptyParser = new QueryParser(testDocuments, { topConcepts: [] });
      const result = emptyParser.findConcept('test');
      expect(result).toBeNull();
    });

    it('should handle missing fuzzy matcher', () => {
      const parser = new QueryParser(testDocuments, {});
      expect(parser.fuzzyMatcher).toBeNull();
    });

    it('should handle missing full-text search', () => {
      const parser = new QueryParser(testDocuments, testConcepts);
      const result = parser.findConceptWithFallbacks('test', { enableFulltext: true });
      expect(result.found).toBe(false);
    });
  });

  describe('Layered Search Priority', () => {
    it('should prefer exact match over fuzzy', () => {
      const result = queryParser.findConcept('arbitrum');
      expect(result).toBe('arbitrum');
    });

    it('should prefer fuzzy match over partial', () => {
      // Add a concept with partial match
      testConcepts.topConcepts.push({ concept: 'arbit', frequency: 10 });
      const parser = new QueryParser(testDocuments, testConcepts, fullTextSearch);
      const result = parser.findConcept('arbitrom');
      expect(result).toBe('arbitrum');
    });

    it('should use partial match when fuzzy fails', () => {
      const result = queryParser.findConcept('opt');
      expect(result).not.toBeNull();
    });

    it('should attempt all layers in order', () => {
      const result = queryParser.findConceptWithFallbacks('scaling', {
        enableFulltext: true,
      });
      expect(result.attempts.length).toBeGreaterThan(0);
      const layers = result.attempts.map((a) => a.layer);
      expect(layers).toContain('exact');
    });
  });

  describe('Confidence Scoring', () => {
    it('should assign confidence 1.0 for exact matches', () => {
      const result = queryParser.findConceptWithFallbacks('arbitrum');
      expect(result.bestMatch.confidence).toBe(1.0);
    });

    it('should assign variable confidence for fuzzy matches', () => {
      const result = queryParser.findConceptWithFallbacks('arbitrom');
      expect(result.bestMatch.confidence).toBeGreaterThan(0);
      expect(result.bestMatch.confidence).toBeLessThan(1.0);
    });

    it('should assign 0.7 confidence for partial matches', () => {
      const result = queryParser.findConceptWithFallbacks('opt');
      if (result.bestMatch.layer === 'partial') {
        expect(result.bestMatch.confidence).toBe(0.7);
      }
    });
  });

  describe('Configuration Options', () => {
    it('should respect custom fuzzy threshold', () => {
      const result = queryParser.findConcept('xyz', { fuzzyThreshold: 0.9 });
      expect(result).toBeNull();
    });

    it('should use default threshold when not provided', () => {
      const result = queryParser.findConcept('arbitrom');
      expect(result).not.toBeNull();
    });
  });
});
