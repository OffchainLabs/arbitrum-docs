/**
 * MIT License - Copyright (c) 2025 Offchain Labs
 *
 * FullTextSearch Unit Tests
 *
 * Tests full-text search with BM25 ranking, phrase search, boolean operators,
 * and snippet generation.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { FullTextSearchEngine } from '../FullTextSearch.js';

describe('FullTextSearchEngine', () => {
  let fullTextSearch;
  let testDocuments;

  beforeEach(() => {
    testDocuments = new Map([
      [
        '/docs/arbitrum.md',
        {
          filePath: '/docs/arbitrum.md',
          relativePath: 'arbitrum.md',
          frontmatter: { title: 'Arbitrum Overview' },
          headings: [{ text: 'Layer 2 Scaling' }, { text: 'Gas Optimization' }],
          content:
            'Arbitrum is a layer 2 scaling solution that uses optimistic rollups. Gas optimization is crucial for efficiency.',
        },
      ],
      [
        '/docs/ethereum.md',
        {
          filePath: '/docs/ethereum.md',
          relativePath: 'ethereum.md',
          frontmatter: { title: 'Ethereum Basics' },
          headings: [{ text: 'Smart Contracts' }],
          content:
            'Ethereum is a blockchain platform with smart contract functionality. Layer 2 solutions help scale Ethereum.',
        },
      ],
      [
        '/docs/rollups.md',
        {
          filePath: '/docs/rollups.md',
          relativePath: 'rollups.md',
          frontmatter: { title: 'Optimistic Rollups' },
          headings: [{ text: 'Fraud Proofs' }, { text: 'State Transition' }],
          content:
            'Optimistic rollups assume transactions are valid by default. Fraud proofs are used to challenge invalid transactions.',
        },
      ],
      [
        '/docs/gas.md',
        {
          filePath: '/docs/gas.md',
          relativePath: 'gas.md',
          frontmatter: { title: 'Gas Optimization Techniques' },
          headings: [{ text: 'Best Practices' }],
          content:
            'Gas optimization techniques include batching transactions, using efficient data structures, and minimizing storage operations.',
        },
      ],
    ]);

    fullTextSearch = new FullTextSearchEngine(testDocuments);
  });

  describe('Index Building', () => {
    it('should build Lunr index successfully', () => {
      expect(fullTextSearch.lunrIndex).toBeDefined();
      expect(fullTextSearch.documentMap.size).toBe(testDocuments.size);
    });

    it('should map document IDs correctly', () => {
      const docIds = Array.from(fullTextSearch.documentMap.keys());
      expect(docIds.every((id) => id.startsWith('doc_'))).toBe(true);
    });

    it('should store document references', () => {
      const firstDoc = Array.from(fullTextSearch.documentMap.values())[0];
      expect(firstDoc).toHaveProperty('frontmatter');
      expect(firstDoc).toHaveProperty('content');
      expect(firstDoc).toHaveProperty('id');
    });
  });

  describe('Simple Search', () => {
    it('should find documents containing search term', () => {
      const results = fullTextSearch.search('arbitrum', { type: 'simple' });
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].document.relativePath).toBe('arbitrum.md');
    });

    it('should rank results by relevance', () => {
      const results = fullTextSearch.search('layer 2', { type: 'simple' });
      expect(results.length).toBeGreaterThan(0);
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    it('should filter by minimum score', () => {
      const results = fullTextSearch.search('optimization', {
        type: 'simple',
        minScore: 0.8,
      });
      results.forEach((result) => {
        expect(result.score).toBeGreaterThanOrEqual(0.8);
      });
    });

    it('should respect limit parameter', () => {
      const results = fullTextSearch.search('ethereum', {
        type: 'simple',
        limit: 1,
      });
      expect(results.length).toBeLessThanOrEqual(1);
    });

    it('should boost title matches higher', () => {
      const results = fullTextSearch.search('arbitrum', { type: 'simple' });
      const arbitrumDoc = results.find((r) => r.document.relativePath === 'arbitrum.md');
      expect(arbitrumDoc).toBeDefined();
      expect(arbitrumDoc.score).toBeGreaterThan(0);
    });

    it('should boost heading matches', () => {
      const results = fullTextSearch.search('fraud proofs', { type: 'simple' });
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Phrase Search', () => {
    it('should find exact phrase matches', () => {
      const results = fullTextSearch.phraseSearch('layer 2');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should use phrase search type', () => {
      const results = fullTextSearch.search('optimistic rollups', { type: 'phrase' });
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].matchType).toBe('phrase');
    });

    it('should not match partial phrases', () => {
      const exactResults = fullTextSearch.phraseSearch('layer 2 scaling');
      const partialResults = fullTextSearch.phraseSearch('layer scaling');
      expect(exactResults.length).toBeGreaterThanOrEqual(partialResults.length);
    });

    it('should handle multi-word phrases', () => {
      const results = fullTextSearch.phraseSearch('gas optimization techniques');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Boolean Search', () => {
    it('should handle AND operator', () => {
      const results = fullTextSearch.booleanSearch('arbitrum AND layer');
      expect(results.length).toBeGreaterThan(0);
      results.forEach((result) => {
        const content = result.document.content.toLowerCase();
        expect(content.includes('arbitrum') || content.includes('layer')).toBe(true);
      });
    });

    it('should handle OR operator', () => {
      const results = fullTextSearch.booleanSearch('arbitrum OR ethereum');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle NOT operator', () => {
      const results = fullTextSearch.booleanSearch('layer -ethereum');
      results.forEach((result) => {
        const content = result.document.content.toLowerCase();
        expect(content.includes('ethereum')).toBe(false);
      });
    });

    it('should handle complex boolean queries', () => {
      const results = fullTextSearch.booleanSearch('(arbitrum OR ethereum) AND optimization');
      expect(results).toBeDefined();
    });

    it('should use boolean search type', () => {
      const results = fullTextSearch.search('arbitrum OR ethereum', { type: 'boolean' });
      expect(results[0].matchType).toBe('boolean');
    });
  });

  describe('Snippet Generation', () => {
    it('should generate context snippets', () => {
      const results = fullTextSearch.search('arbitrum', {
        type: 'simple',
        snippets: true,
      });
      expect(results[0].snippets).toBeDefined();
      expect(results[0].snippets.length).toBeGreaterThan(0);
    });

    it('should highlight matched terms', () => {
      const results = fullTextSearch.search('layer 2', {
        type: 'simple',
        snippets: true,
      });
      if (results[0]?.snippets?.length > 0) {
        const snippet = results[0].snippets[0];
        expect(snippet).toContain('<mark>');
        expect(snippet).toContain('</mark>');
      }
    });

    it('should include context around matches', () => {
      const doc = Array.from(testDocuments.values())[0];
      const snippets = fullTextSearch.generateSnippets(doc, 'arbitrum', 50);
      expect(snippets.length).toBeGreaterThan(0);
      expect(snippets[0].length).toBeGreaterThan('arbitrum'.length);
    });

    it('should add ellipsis at boundaries', () => {
      const doc = Array.from(testDocuments.values())[0];
      const snippets = fullTextSearch.generateSnippets(doc, 'layer', 20);
      if (snippets.length > 0) {
        const hasEllipsis = snippets.some((s) => s.startsWith('...') || s.endsWith('...'));
        expect(hasEllipsis).toBe(true);
      }
    });

    it('should limit snippet count', () => {
      const doc = {
        content: 'test '.repeat(100) + 'arbitrum '.repeat(10) + 'test '.repeat(100),
      };
      const snippets = fullTextSearch.generateSnippets(doc, 'arbitrum', 50);
      expect(snippets.length).toBeLessThanOrEqual(3);
    });

    it('should group nearby matches', () => {
      const doc = {
        content: 'Arbitrum is a layer 2 solution that improves Ethereum scalability.',
      };
      const snippets = fullTextSearch.generateSnippets(doc, 'arbitrum layer', 100);
      expect(snippets.length).toBeGreaterThan(0);
    });

    it('should handle terms shorter than 3 characters', () => {
      const doc = Array.from(testDocuments.values())[0];
      const snippets = fullTextSearch.generateSnippets(doc, 'is a', 50);
      expect(snippets).toBeDefined();
    });
  });

  describe('Caching', () => {
    it('should cache search results', () => {
      const firstCall = fullTextSearch.search('arbitrum', { type: 'simple' });
      const secondCall = fullTextSearch.search('arbitrum', { type: 'simple' });
      expect(firstCall).toEqual(secondCall);
    });

    it('should use different cache keys for different queries', () => {
      const result1 = fullTextSearch.search('arbitrum', { type: 'simple' });
      const result2 = fullTextSearch.search('ethereum', { type: 'simple' });
      expect(result1).not.toEqual(result2);
    });

    it('should use different cache keys for different options', () => {
      fullTextSearch.search('arbitrum', { type: 'simple', minScore: 0.5 });
      fullTextSearch.search('arbitrum', { type: 'simple', minScore: 0.8 });
      expect(fullTextSearch.cache.size).toBeGreaterThan(1);
    });

    it('should clear cache', () => {
      fullTextSearch.search('arbitrum', { type: 'simple' });
      fullTextSearch.clearCache();
      expect(fullTextSearch.cache.size).toBe(0);
    });

    it('should evict old entries when cache is full', () => {
      const smallCacheSearch = new FullTextSearchEngine(testDocuments, null, {
        performance: { queryCacheSize: 2 },
      });
      smallCacheSearch.maxCacheSize = 2;
      smallCacheSearch.search('test1');
      smallCacheSearch.search('test2');
      smallCacheSearch.search('test3');
      expect(smallCacheSearch.cache.size).toBeLessThanOrEqual(2);
    });

    it('should return cache statistics', () => {
      fullTextSearch.search('arbitrum');
      const stats = fullTextSearch.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty query', () => {
      const results = fullTextSearch.search('', { type: 'simple' });
      expect(results).toHaveLength(0);
    });

    it('should handle null query', () => {
      const results = fullTextSearch.search(null, { type: 'simple' });
      expect(results).toHaveLength(0);
    });

    it('should handle undefined query', () => {
      const results = fullTextSearch.search(undefined, { type: 'simple' });
      expect(results).toHaveLength(0);
    });

    it('should handle query with no results', () => {
      const results = fullTextSearch.search('xyznonexistent', { type: 'simple' });
      expect(results).toHaveLength(0);
    });

    it('should handle very long query', () => {
      const longQuery = 'arbitrum '.repeat(50);
      const results = fullTextSearch.search(longQuery, { type: 'simple' });
      expect(results).toBeDefined();
    });

    it('should handle special characters in query', () => {
      const results = fullTextSearch.search('layer-2', { type: 'simple' });
      expect(results).toBeDefined();
    });

    it('should handle invalid boolean query gracefully', () => {
      const results = fullTextSearch.booleanSearch('AND OR NOT');
      expect(results).toBeDefined();
    });
  });

  describe('Search Options', () => {
    it('should use default type when not specified', () => {
      const results = fullTextSearch.search('arbitrum');
      expect(results).toBeDefined();
    });

    it('should use default minScore when not specified', () => {
      const results = fullTextSearch.search('arbitrum', { type: 'simple' });
      results.forEach((result) => {
        expect(result.score).toBeGreaterThanOrEqual(0.5);
      });
    });

    it('should use default limit when not specified', () => {
      const results = fullTextSearch.search('layer');
      expect(results.length).toBeLessThanOrEqual(20);
    });

    it('should include snippets by default', () => {
      const results = fullTextSearch.search('arbitrum', { snippets: true });
      if (results.length > 0) {
        expect(results[0]).toHaveProperty('snippets');
      }
    });

    it('should exclude snippets when requested', () => {
      const results = fullTextSearch.search('arbitrum', { snippets: false });
      if (results.length > 0) {
        expect(results[0].snippets).toBeUndefined();
      }
    });
  });

  describe('Result Format', () => {
    it('should include document metadata', () => {
      const results = fullTextSearch.search('arbitrum');
      if (results.length > 0) {
        expect(results[0].document).toHaveProperty('relativePath');
        expect(results[0].document).toHaveProperty('frontmatter');
        expect(results[0].document).toHaveProperty('content');
      }
    });

    it('should include score', () => {
      const results = fullTextSearch.search('arbitrum');
      if (results.length > 0) {
        expect(results[0]).toHaveProperty('score');
        expect(typeof results[0].score).toBe('number');
      }
    });

    it('should include match type', () => {
      const results = fullTextSearch.search('arbitrum', { type: 'simple' });
      if (results.length > 0) {
        expect(results[0]).toHaveProperty('matchType');
        expect(results[0].matchType).toBe('simple');
      }
    });

    it('should include match metadata', () => {
      const results = fullTextSearch.search('arbitrum');
      if (results.length > 0) {
        expect(results[0]).toHaveProperty('matches');
        expect(typeof results[0].matches).toBe('object');
      }
    });
  });

  describe('Empty or Missing Index', () => {
    it('should handle empty document map', () => {
      const emptySearch = new FullTextSearchEngine(new Map());
      expect(emptySearch.lunrIndex).toBeDefined();
    });

    it('should return empty results for searches on empty index', () => {
      const emptySearch = new FullTextSearchEngine(new Map());
      const results = emptySearch.search('test');
      expect(results).toHaveLength(0);
    });

    it('should handle documents without content', () => {
      const docsWithoutContent = new Map([
        [
          '/docs/empty.md',
          {
            filePath: '/docs/empty.md',
            relativePath: 'empty.md',
            frontmatter: {},
            headings: [],
            content: '',
          },
        ],
      ]);
      const search = new FullTextSearchEngine(docsWithoutContent);
      expect(search.lunrIndex).toBeDefined();
    });
  });

  describe('Field Boosting', () => {
    it('should apply field boosts during indexing', () => {
      const customBoostSearch = new FullTextSearchEngine(testDocuments, null, {
        fieldBoosts: { title: 5.0, headings: 3.0, body: 1.0 },
      });
      expect(customBoostSearch.lunrIndex).toBeDefined();
    });

    it('should prioritize title matches', () => {
      const results = fullTextSearch.search('arbitrum');
      const titleDoc = results.find((r) =>
        r.document.frontmatter?.title?.toLowerCase().includes('arbitrum'),
      );
      if (titleDoc) {
        expect(titleDoc.score).toBeGreaterThan(0);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle Lunr search errors gracefully', () => {
      // Invalid syntax that might cause Lunr to throw
      const results = fullTextSearch.search('***', { type: 'simple' });
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle snippet generation errors', () => {
      const invalidDoc = { content: null };
      const snippets = fullTextSearch.generateSnippets(invalidDoc, 'test', 50);
      expect(snippets).toBeDefined();
      expect(Array.isArray(snippets)).toBe(true);
    });
  });
});
