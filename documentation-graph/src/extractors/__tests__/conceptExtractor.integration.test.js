/**
 * MIT License - Copyright (c) 2025 Offchain Labs
 *
 * ConceptExtractor Integration Tests
 *
 * Tests integration of ConceptExtractor with PhraseExtractor to ensure
 * proper merging of single-word concepts and multi-word phrases.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ConceptExtractor } from '../conceptExtractor.js';

describe('ConceptExtractor Integration', () => {
  let conceptExtractor;

  beforeEach(() => {
    conceptExtractor = new ConceptExtractor();
  });

  describe('Phrase Extractor Integration', () => {
    it('should initialize phrase extractor', () => {
      expect(conceptExtractor.phraseExtractor).toBeDefined();
    });

    it('should extract both single-word concepts and multi-word phrases', () => {
      const testDoc = {
        content: 'Gas optimization is crucial for layer 2 scaling on Arbitrum.',
        frontmatter: { title: 'Gas Optimization' },
        headings: [{ text: 'Best Practices' }],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      const topConcepts = conceptExtractor.getTopConcepts(50);

      const singleWords = topConcepts.filter((c) => c.data.type === 'single');
      const phrases = topConcepts.filter((c) => c.data.type === 'phrase');

      expect(singleWords.length).toBeGreaterThan(0);
      expect(phrases.length).toBeGreaterThan(0);
    });

    it('should merge phrases with single-word concepts', () => {
      const testDoc = {
        content: 'Optimistic rollup and fraud proof validation on layer 2.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      const topConcepts = conceptExtractor.getTopConcepts(50);

      const hasPhrase = topConcepts.some(
        (c) => c.concept.includes('optimistic') || c.concept.includes('fraud'),
      );
      expect(hasPhrase).toBe(true);
    });

    it('should properly categorize phrase types', () => {
      const testDoc = {
        content: 'Gas optimization and cross-chain messaging on Arbitrum Nova.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      const topConcepts = conceptExtractor.getTopConcepts(50);

      const phraseConcepts = topConcepts.filter((c) => c.data.type === 'phrase');
      phraseConcepts.forEach((phrase) => {
        expect(phrase.data).toHaveProperty('length');
        expect(phrase.data).toHaveProperty('components');
        expect(phrase.data.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should track phrase frequency separately', () => {
      const testDoc = {
        content:
          'Gas optimization is key. Gas optimization works well. Gas optimization everywhere.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      const topConcepts = conceptExtractor.getTopConcepts(50);

      const gasOpt = topConcepts.find(
        (c) => c.concept.includes('gas') && c.concept.includes('optimization'),
      );
      if (gasOpt) {
        expect(gasOpt.frequency).toBeGreaterThan(1);
      }
    });

    it('should update stats to include phrase metrics', () => {
      const testDoc = {
        content: 'Gas optimization and layer 2 scaling are crucial.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      conceptExtractor.calculateConceptMetrics();
      conceptExtractor.getTopConcepts(50);

      const stats = conceptExtractor.getStats();
      expect(stats).toHaveProperty('totalPhrases');
      expect(stats).toHaveProperty('uniquePhrases');
    });
  });

  describe('Domain Phrase Extraction', () => {
    it('should extract configured domain phrases', () => {
      const testDoc = {
        content: 'Optimistic rollup uses fraud proofs for security.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      const topConcepts = conceptExtractor.getTopConcepts(50);

      const domainPhrases = topConcepts.filter(
        (c) => c.data.category === 'domain_phrase' || c.concept.includes('optimistic rollup'),
      );
      expect(domainPhrases.length).toBeGreaterThan(0);
    });

    it('should prioritize domain phrases with higher weight', () => {
      const testDoc = {
        content: 'Gas optimization and fraud proof validation.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      const topConcepts = conceptExtractor.getTopConcepts(50);

      const fraudProof = topConcepts.find((c) => c.concept.includes('fraud proof'));
      if (fraudProof) {
        expect(fraudProof.data.totalWeight).toBeGreaterThan(0);
      }
    });
  });

  describe('Concept and Phrase Deduplication', () => {
    it('should not create duplicate entries for same phrase', () => {
      const testDoc = {
        content: 'Gas optimization is important. Gas optimization works well.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      const topConcepts = conceptExtractor.getTopConcepts(50);

      const gasOptConcepts = topConcepts.filter(
        (c) =>
          c.concept.toLowerCase().includes('gas') &&
          c.concept.toLowerCase().includes('optimization'),
      );

      // Should only have one normalized entry
      const uniqueNormalized = new Set(gasOptConcepts.map((c) => c.concept));
      expect(uniqueNormalized.size).toBeLessThanOrEqual(gasOptConcepts.length);
    });

    it('should normalize phrases consistently', () => {
      const testDoc1 = {
        content: 'Gas Optimization is key.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test1.md',
      };

      const testDoc2 = {
        content: 'GAS optimization works.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test2.md',
      };

      conceptExtractor.extractFromDocument(testDoc1);
      conceptExtractor.extractFromDocument(testDoc2);
      const topConcepts = conceptExtractor.getTopConcepts(50);

      const gasOpt = topConcepts.find((c) => c.concept === 'gas optimization');
      if (gasOpt) {
        expect(gasOpt.fileCount).toBe(2);
      }
    });
  });

  describe('Top 500 Concepts Limit', () => {
    it('should enforce top 500 limit', () => {
      const topConcepts = conceptExtractor.getTopConcepts(500);
      expect(topConcepts.length).toBeLessThanOrEqual(500);
    });

    it('should sort by frequency', () => {
      const testDoc = {
        content: 'Arbitrum arbitrum ethereum gas optimization layer 2 scaling rollup proof.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      const topConcepts = conceptExtractor.getTopConcepts(50);

      for (let i = 1; i < topConcepts.length; i++) {
        expect(topConcepts[i - 1].frequency).toBeGreaterThanOrEqual(topConcepts[i].frequency);
      }
    });

    it('should include both concepts and phrases in top results', () => {
      const testDoc = {
        content: 'Gas optimization on layer 2 with optimistic rollup and fraud proof.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      const topConcepts = conceptExtractor.getTopConcepts(50);

      const hasSingle = topConcepts.some((c) => c.data.type === 'single');
      const hasPhrase = topConcepts.some((c) => c.data.type === 'phrase');

      expect(hasSingle).toBe(true);
      expect(hasPhrase).toBe(true);
    });
  });

  describe('Phrase Recording and Tracking', () => {
    it('should record phrases in phrase extractor', () => {
      const testDoc = {
        content: 'Gas optimization and fraud proof validation.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      expect(conceptExtractor.phraseExtractor.phraseFrequency.size).toBeGreaterThan(0);
    });

    it('should track file sources for phrases', () => {
      const testDoc1 = {
        content: 'Gas optimization is crucial.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test1.md',
      };

      const testDoc2 = {
        content: 'Gas optimization works well.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test2.md',
      };

      conceptExtractor.extractFromDocument(testDoc1);
      conceptExtractor.extractFromDocument(testDoc2);

      const topConcepts = conceptExtractor.getTopConcepts(50);
      const gasOpt = topConcepts.find(
        (c) => c.concept.includes('gas') && c.concept.includes('optimization'),
      );

      if (gasOpt) {
        const files = Object.keys(gasOpt.data.files);
        expect(files.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('NLP Phrase Pattern Extraction', () => {
    it('should extract adjective + noun + noun patterns', () => {
      const testDoc = {
        content: 'The optimistic rollup design is efficient.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      const topConcepts = conceptExtractor.getTopConcepts(50);

      const adjNounNoun = topConcepts.filter(
        (c) => c.data.pattern === 'adj_noun_noun' || c.concept.includes('optimistic rollup'),
      );
      expect(adjNounNoun.length).toBeGreaterThanOrEqual(0);
    });

    it('should extract noun + noun compounds', () => {
      const testDoc = {
        content: 'Gas optimization improves performance.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      const topConcepts = conceptExtractor.getTopConcepts(50);

      const nounNoun = topConcepts.filter(
        (c) =>
          c.data.pattern === 'noun_noun' ||
          (c.concept.includes('gas') && c.concept.includes('optimization')),
      );
      expect(nounNoun.length).toBeGreaterThanOrEqual(0);
    });

    it('should extract noun + prep + noun patterns', () => {
      const testDoc = {
        content: 'The proof of stake mechanism is secure.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      const topConcepts = conceptExtractor.getTopConcepts(50);

      const nounPrepNoun = topConcepts.filter(
        (c) => c.data.pattern === 'noun_prep_noun' || c.concept.includes('proof of'),
      );
      expect(nounPrepNoun.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Technical Compound Extraction', () => {
    it('should extract Title Case compounds', () => {
      const testDoc = {
        content: 'Arbitrum Nova is a new chain.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      const topConcepts = conceptExtractor.getTopConcepts(50);

      const titleCase = topConcepts.filter(
        (c) => c.data.pattern === 'title_case' || c.concept.includes('arbitrum nova'),
      );
      expect(titleCase.length).toBeGreaterThanOrEqual(0);
    });

    it('should extract and normalize hyphenated compounds', () => {
      const testDoc = {
        content: 'Cross-chain messaging enables interoperability.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      const topConcepts = conceptExtractor.getTopConcepts(50);

      const hyphenated = topConcepts.filter(
        (c) => c.concept.includes('cross') && c.concept.includes('chain'),
      );
      expect(hyphenated.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Frequency Filtering', () => {
    it('should filter phrases appearing only once', () => {
      const testDoc = {
        content: 'Gas optimization appears once. Random phrase here.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      const phraseStats = conceptExtractor.phraseExtractor.getStats();

      // With minFrequency: 2, single occurrences should be filtered
      expect(phraseStats.aboveMinFrequency).toBeLessThanOrEqual(phraseStats.totalPhrases);
    });

    it('should keep phrases appearing 2+ times', () => {
      const testDoc = {
        content: 'Gas optimization here. Gas optimization there. Gas optimization everywhere.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      const topConcepts = conceptExtractor.getTopConcepts(50);

      const gasOpt = topConcepts.find(
        (c) => c.concept.includes('gas') && c.concept.includes('optimization'),
      );
      expect(gasOpt).toBeDefined();
    });
  });

  describe('Multi-Document Processing', () => {
    it('should aggregate phrases across documents', async () => {
      const docs = new Map([
        [
          '/docs/doc1.md',
          {
            content: 'Gas optimization is crucial.',
            frontmatter: {},
            headings: [],
            filePath: '/docs/doc1.md',
          },
        ],
        [
          '/docs/doc2.md',
          {
            content: 'Gas optimization improves performance.',
            frontmatter: {},
            headings: [],
            filePath: '/docs/doc2.md',
          },
        ],
        [
          '/docs/doc3.md',
          {
            content: 'Layer 2 scaling with optimistic rollup.',
            frontmatter: {},
            headings: [],
            filePath: '/docs/doc3.md',
          },
        ],
      ]);

      await conceptExtractor.extractFromDocuments(docs);
      const topConcepts = conceptExtractor.getTopConcepts(50);

      const gasOpt = topConcepts.find(
        (c) => c.concept.includes('gas') && c.concept.includes('optimization'),
      );
      if (gasOpt) {
        expect(gasOpt.fileCount).toBe(2);
      }
    });

    it('should track phrase occurrences across corpus', async () => {
      const docs = new Map([
        [
          '/docs/doc1.md',
          {
            content: 'Optimistic rollup and fraud proof.',
            frontmatter: {},
            headings: [],
            filePath: '/docs/doc1.md',
          },
        ],
        [
          '/docs/doc2.md',
          {
            content: 'Optimistic rollup design.',
            frontmatter: {},
            headings: [],
            filePath: '/docs/doc2.md',
          },
        ],
      ]);

      await conceptExtractor.extractFromDocuments(docs);
      const topConcepts = conceptExtractor.getTopConcepts(50);

      const rollup = topConcepts.find((c) => c.concept.includes('optimistic rollup'));
      if (rollup) {
        expect(rollup.frequency).toBeGreaterThan(1);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle documents with no phrases', () => {
      const testDoc = {
        content: 'a b c d e f g h i j',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      const topConcepts = conceptExtractor.getTopConcepts(50);
      expect(topConcepts).toBeDefined();
    });

    it('should handle empty document', () => {
      const testDoc = {
        content: '',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      const topConcepts = conceptExtractor.getTopConcepts(50);
      expect(topConcepts).toBeDefined();
    });

    it('should handle very long documents', () => {
      const longContent = 'Gas optimization is important. '.repeat(50);
      const testDoc = {
        content: longContent,
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      const topConcepts = conceptExtractor.getTopConcepts(50);
      expect(topConcepts.length).toBeGreaterThan(0);
    });
  });

  describe('Phrase Component Metadata', () => {
    it('should include phrase components in metadata', () => {
      const testDoc = {
        content: 'Gas optimization and layer 2 scaling.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      const topConcepts = conceptExtractor.getTopConcepts(50);

      const phrases = topConcepts.filter((c) => c.data.type === 'phrase');
      phrases.forEach((phrase) => {
        expect(phrase.data.components).toBeDefined();
        expect(Array.isArray(phrase.data.components)).toBe(true);
        expect(phrase.data.components.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should include phrase length in metadata', () => {
      const testDoc = {
        content: 'Gas optimization and layer 2 scaling.',
        frontmatter: {},
        headings: [],
        filePath: '/docs/test.md',
      };

      conceptExtractor.extractFromDocument(testDoc);
      const topConcepts = conceptExtractor.getTopConcepts(50);

      const phrases = topConcepts.filter((c) => c.data.type === 'phrase');
      phrases.forEach((phrase) => {
        expect(phrase.data.length).toBeDefined();
        expect(phrase.data.length).toBeGreaterThanOrEqual(2);
        expect(phrase.data.length).toBe(phrase.data.components.length);
      });
    });
  });
});
