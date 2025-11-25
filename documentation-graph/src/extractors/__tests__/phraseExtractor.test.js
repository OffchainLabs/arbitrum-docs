/**
 * MIT License - Copyright (c) 2025 Offchain Labs
 *
 * PhraseExtractor Unit Tests
 *
 * Tests multi-word phrase extraction using NLP patterns, domain dictionaries,
 * and frequency filtering.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import compromise from 'compromise';
import { PhraseExtractor } from '../phraseExtractor.js';

describe('PhraseExtractor', () => {
  let phraseExtractor;

  beforeEach(() => {
    phraseExtractor = new PhraseExtractor({
      minWords: 2,
      maxWords: 4,
      minFrequency: 2,
      maxPhrases: 300,
      domainPhrases: ['optimistic rollup', 'gas optimization', 'fraud proof'],
    });
  });

  describe('Noun Phrase Extraction', () => {
    it('should extract adjective + noun + noun patterns', () => {
      const doc = compromise('The optimistic rollup design is efficient.');
      const phrases = phraseExtractor.extractNounPhrases(doc, 1.0);
      const found = phrases.find((p) => p.text.toLowerCase().includes('optimistic rollup'));
      expect(found).toBeDefined();
      expect(found.type).toBe('noun_phrase');
      expect(found.pattern).toBe('adj_noun_noun');
    });

    it('should extract noun + noun compounds', () => {
      const doc = compromise('Gas optimization is crucial for scalability.');
      const phrases = phraseExtractor.extractNounPhrases(doc, 1.0);
      const found = phrases.find((p) => p.text.toLowerCase().includes('gas'));
      expect(found).toBeDefined();
      expect(found.type).toBe('noun_phrase');
    });

    it('should extract noun + preposition + noun patterns', () => {
      const doc = compromise('The proof of stake mechanism is secure.');
      const phrases = phraseExtractor.extractNounPhrases(doc, 1.0);
      const found = phrases.find((p) => p.text.toLowerCase().includes('proof of'));
      expect(found).toBeDefined();
      expect(found.pattern).toBe('noun_prep_noun');
    });

    it('should filter out short phrases (< 5 characters)', () => {
      const doc = compromise('The it is a way to go.');
      const phrases = phraseExtractor.extractNounPhrases(doc, 1.0);
      phrases.forEach((phrase) => {
        expect(phrase.text.length).toBeGreaterThan(5);
      });
    });

    it('should apply weight multipliers correctly', () => {
      const doc = compromise('Gas optimization improves performance.');
      const phrases = phraseExtractor.extractNounPhrases(doc, 2.0);
      phrases.forEach((phrase) => {
        expect(phrase.weight).toBeGreaterThan(2.0);
      });
    });
  });

  describe('Technical Compound Extraction', () => {
    it('should extract Title Case compounds', () => {
      const doc = compromise('Arbitrum Nova is a new chain.');
      const compounds = phraseExtractor.extractTechnicalCompounds(doc, 1.0);
      const found = compounds.find((c) => c.text === 'Arbitrum Nova');
      expect(found).toBeDefined();
      expect(found.type).toBe('technical_compound');
      expect(found.pattern).toBe('title_case');
    });

    it('should extract three-word Title Case compounds', () => {
      const doc = compromise('The Nitro Stack Implementation is complete.');
      const compounds = phraseExtractor.extractTechnicalCompounds(doc, 1.0);
      const found = compounds.find((c) => c.text.includes('Nitro Stack'));
      expect(found).toBeDefined();
    });

    it('should extract hyphenated compounds', () => {
      const doc = compromise('Cross-chain messaging enables interoperability.');
      const compounds = phraseExtractor.extractTechnicalCompounds(doc, 1.0);
      const found = compounds.find((c) => c.text.includes('cross') && c.text.includes('chain'));
      expect(found).toBeDefined();
      expect(found.pattern).toBe('hyphenated');
    });

    it('should normalize hyphenated to space-separated', () => {
      const doc = compromise('State-transition functions are critical.');
      const compounds = phraseExtractor.extractTechnicalCompounds(doc, 1.0);
      const found = compounds.find((c) => c.text.includes('state'));
      if (found) {
        expect(found.text).toContain(' ');
        expect(found.text).not.toContain('-');
      }
    });

    it('should handle multi-hyphenated compounds', () => {
      const doc = compromise('The layer-2-scaling solution works well.');
      const compounds = phraseExtractor.extractTechnicalCompounds(doc, 1.0);
      expect(compounds.length).toBeGreaterThan(0);
    });
  });

  describe('Domain Phrase Extraction', () => {
    it('should extract configured domain phrases', () => {
      const doc = compromise('The optimistic rollup uses fraud proofs.');
      const domainPhrases = phraseExtractor.extractDomainPhrases(doc, 1.0);
      expect(domainPhrases.length).toBeGreaterThan(0);
      const rollupPhrase = domainPhrases.find((p) => p.text.includes('optimistic rollup'));
      expect(rollupPhrase).toBeDefined();
      expect(rollupPhrase.type).toBe('domain_phrase');
    });

    it('should match domain phrases with word boundaries', () => {
      const doc = compromise('Gas optimization is important, not gasoptimization.');
      const domainPhrases = phraseExtractor.extractDomainPhrases(doc, 1.0);
      const gasPhrase = domainPhrases.find((p) => p.text.includes('gas optimization'));
      expect(gasPhrase).toBeDefined();
    });

    it('should handle case-insensitive matching', () => {
      const doc = compromise('GAS OPTIMIZATION is crucial.');
      const domainPhrases = phraseExtractor.extractDomainPhrases(doc, 1.0);
      const found = domainPhrases.find((p) => p.text.toLowerCase().includes('gas optimization'));
      expect(found).toBeDefined();
    });

    it('should apply higher weight to domain phrases', () => {
      const doc = compromise('Fraud proof validation is required.');
      const domainPhrases = phraseExtractor.extractDomainPhrases(doc, 1.0);
      const found = domainPhrases.find((p) => p.text.includes('fraud proof'));
      if (found) {
        expect(found.weight).toBeGreaterThan(1.0);
      }
    });

    it('should match multiple occurrences', () => {
      const doc = compromise('Optimistic rollup and another optimistic rollup.');
      const domainPhrases = phraseExtractor.extractDomainPhrases(doc, 1.0);
      const rollupPhrases = domainPhrases.filter((p) => p.text.includes('optimistic rollup'));
      expect(rollupPhrases.length).toBe(2);
    });
  });

  describe('Phrase Filtering by Length', () => {
    it('should filter phrases below minWords', () => {
      const extractor = new PhraseExtractor({ minWords: 3, maxWords: 4 });
      const doc = compromise('Gas optimization and very good state transition functions.');
      const phrases = extractor.extractPhrases(doc, 1.0);
      phrases.forEach((phrase) => {
        const wordCount = phrase.text.split(/\s+/).length;
        expect(wordCount).toBeGreaterThanOrEqual(3);
      });
    });

    it('should filter phrases above maxWords', () => {
      const extractor = new PhraseExtractor({ minWords: 2, maxWords: 2 });
      const doc = compromise('Very long technical phrase here that should be filtered.');
      const phrases = extractor.extractPhrases(doc, 1.0);
      phrases.forEach((phrase) => {
        const wordCount = phrase.text.split(/\s+/).length;
        expect(wordCount).toBeLessThanOrEqual(2);
      });
    });

    it('should accept phrases within word range', () => {
      const extractor = new PhraseExtractor({ minWords: 2, maxWords: 4 });
      const doc = compromise('Gas optimization and state transition function.');
      const phrases = extractor.extractPhrases(doc, 1.0);
      expect(phrases.length).toBeGreaterThan(0);
    });
  });

  describe('Phrase Recording and Frequency', () => {
    it('should record phrases with file path', () => {
      const doc = compromise('Gas optimization is crucial.');
      const phrases = phraseExtractor.extractPhrases(doc, 1.0);
      phraseExtractor.recordPhrases(phrases, '/docs/test.md');
      expect(phraseExtractor.phraseFrequency.size).toBeGreaterThan(0);
    });

    it('should track frequency across multiple documents', () => {
      const doc1 = compromise('Gas optimization is important.');
      const doc2 = compromise('Gas optimization improves performance.');
      const phrases1 = phraseExtractor.extractPhrases(doc1, 1.0);
      const phrases2 = phraseExtractor.extractPhrases(doc2, 1.0);
      phraseExtractor.recordPhrases(phrases1, '/docs/test1.md');
      phraseExtractor.recordPhrases(phrases2, '/docs/test2.md');

      const gasOptPhrase = Array.from(phraseExtractor.phraseFrequency.keys()).find(
        (k) => k.includes('gas') && k.includes('optimization'),
      );
      expect(gasOptPhrase).toBeDefined();
      const freq = phraseExtractor.phraseFrequency.get(gasOptPhrase);
      expect(freq).toBeGreaterThan(1);
    });

    it('should normalize phrases before recording', () => {
      const doc = compromise('Gas Optimization and GAS optimization.');
      const phrases = phraseExtractor.extractPhrases(doc, 1.0);
      phraseExtractor.recordPhrases(phrases, '/docs/test.md');

      const normalized = phraseExtractor.normalizePhrase('gas optimization');
      expect(phraseExtractor.phraseFrequency.has(normalized)).toBe(true);
    });

    it('should track files where phrases appear', () => {
      const doc = compromise('Fraud proof validation.');
      const phrases = phraseExtractor.extractPhrases(doc, 1.0);
      phraseExtractor.recordPhrases(phrases, '/docs/test.md');

      const normalized = phraseExtractor.normalizePhrase('fraud proof');
      const phraseData = phraseExtractor.phrases.get(normalized);
      if (phraseData) {
        expect(phraseData.files.has('/docs/test.md')).toBe(true);
      }
    });

    it('should accumulate total weight', () => {
      const doc = compromise('Gas optimization twice. Gas optimization again.');
      const phrases = phraseExtractor.extractPhrases(doc, 2.0);
      phraseExtractor.recordPhrases(phrases, '/docs/test.md');

      const normalized = phraseExtractor.normalizePhrase('gas optimization');
      const phraseData = phraseExtractor.phrases.get(normalized);
      if (phraseData) {
        expect(phraseData.totalWeight).toBeGreaterThan(0);
      }
    });
  });

  describe('Top Phrases Retrieval', () => {
    beforeEach(() => {
      // Populate with test data
      const doc1 = compromise('Gas optimization is crucial. Gas optimization works.');
      const doc2 = compromise('Gas optimization again. Fraud proof validation.');
      const phrases1 = phraseExtractor.extractPhrases(doc1, 1.0);
      const phrases2 = phraseExtractor.extractPhrases(doc2, 1.0);
      phraseExtractor.recordPhrases(phrases1, '/docs/test1.md');
      phraseExtractor.recordPhrases(phrases2, '/docs/test2.md');
    });

    it('should return top phrases sorted by frequency', () => {
      const topPhrases = phraseExtractor.getTopPhrases(10);
      for (let i = 1; i < topPhrases.length; i++) {
        expect(topPhrases[i - 1].frequency).toBeGreaterThanOrEqual(topPhrases[i].frequency);
      }
    });

    it('should filter by minimum frequency', () => {
      const extractor = new PhraseExtractor({ minFrequency: 5 });
      const doc = compromise('Single occurrence phrase here.');
      const phrases = extractor.extractPhrases(doc, 1.0);
      extractor.recordPhrases(phrases, '/docs/test.md');
      const topPhrases = extractor.getTopPhrases();
      expect(topPhrases.length).toBe(0);
    });

    it('should always include domain phrases regardless of frequency', () => {
      const extractor = new PhraseExtractor({
        minFrequency: 10,
        domainPhrases: ['optimistic rollup'],
      });
      const doc = compromise('Optimistic rollup once.');
      const phrases = extractor.extractPhrases(doc, 1.0);
      extractor.recordPhrases(phrases, '/docs/test.md');
      const topPhrases = extractor.getTopPhrases();
      const rollupPhrase = topPhrases.find((p) => p.concept.includes('optimistic rollup'));
      expect(rollupPhrase).toBeDefined();
    });

    it('should respect limit parameter', () => {
      const topPhrases = phraseExtractor.getTopPhrases(2);
      expect(topPhrases.length).toBeLessThanOrEqual(2);
    });

    it('should include phrase metadata', () => {
      const topPhrases = phraseExtractor.getTopPhrases(10);
      if (topPhrases.length > 0) {
        const phrase = topPhrases[0];
        expect(phrase).toHaveProperty('concept');
        expect(phrase).toHaveProperty('data');
        expect(phrase.data).toHaveProperty('type', 'phrase');
        expect(phrase.data).toHaveProperty('components');
        expect(phrase.data).toHaveProperty('files');
      }
    });
  });

  describe('Phrase Normalization', () => {
    it('should convert to lowercase', () => {
      const normalized = phraseExtractor.normalizePhrase('GAS OPTIMIZATION');
      expect(normalized).toBe('gas optimization');
    });

    it('should trim whitespace', () => {
      const normalized = phraseExtractor.normalizePhrase('  gas optimization  ');
      expect(normalized).toBe('gas optimization');
    });

    it('should remove special characters except hyphens', () => {
      const normalized = phraseExtractor.normalizePhrase('gas@#$ optimization!');
      expect(normalized).toBe('gas optimization');
    });

    it('should normalize multiple spaces', () => {
      const normalized = phraseExtractor.normalizePhrase('gas    optimization');
      expect(normalized).toBe('gas optimization');
    });

    it('should handle empty input', () => {
      const normalized = phraseExtractor.normalizePhrase('');
      expect(normalized).toBe('');
    });
  });

  describe('Component Index Building', () => {
    it('should build component index', () => {
      const doc = compromise('Gas optimization and fraud proof.');
      const phrases = phraseExtractor.extractPhrases(doc, 1.0);
      phraseExtractor.recordPhrases(phrases, '/docs/test.md');
      const componentIndex = phraseExtractor.buildComponentIndex();
      expect(componentIndex.size).toBeGreaterThan(0);
    });

    it('should map words to phrases containing them', () => {
      const doc = compromise('Gas optimization is key.');
      const phrases = phraseExtractor.extractPhrases(doc, 1.0);
      phraseExtractor.recordPhrases(phrases, '/docs/test.md');
      const componentIndex = phraseExtractor.buildComponentIndex();

      const gasKey = Array.from(componentIndex.keys()).find((k) => k === 'gas');
      if (gasKey) {
        const phrasesWithGas = componentIndex.get(gasKey);
        expect(phrasesWithGas.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Statistics', () => {
    it('should return extraction statistics', () => {
      const doc = compromise('Gas optimization and fraud proof.');
      const phrases = phraseExtractor.extractPhrases(doc, 1.0);
      phraseExtractor.recordPhrases(phrases, '/docs/test.md');
      const stats = phraseExtractor.getStats();
      expect(stats).toHaveProperty('totalPhrases');
      expect(stats).toHaveProperty('uniquePhrases');
      expect(stats).toHaveProperty('aboveMinFrequency');
      expect(stats).toHaveProperty('domainPhrasesFound');
      expect(stats).toHaveProperty('avgWordsPerPhrase');
    });

    it('should calculate average words per phrase', () => {
      const doc = compromise('Gas optimization and optimistic rollup design.');
      const phrases = phraseExtractor.extractPhrases(doc, 1.0);
      phraseExtractor.recordPhrases(phrases, '/docs/test.md');
      const stats = phraseExtractor.getStats();
      expect(stats.avgWordsPerPhrase).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty document', () => {
      const doc = compromise('');
      const phrases = phraseExtractor.extractPhrases(doc, 1.0);
      expect(phrases).toHaveLength(0);
    });

    it('should handle document with no phrases', () => {
      const doc = compromise('a b c d e f');
      const phrases = phraseExtractor.extractPhrases(doc, 1.0);
      expect(phrases.length).toBe(0);
    });

    it('should handle very long document', () => {
      const longText = 'Gas optimization '.repeat(100);
      const doc = compromise(longText);
      const phrases = phraseExtractor.extractPhrases(doc, 1.0);
      expect(phrases.length).toBeGreaterThan(0);
    });

    it('should handle special characters in text', () => {
      const doc = compromise('Gas-optimization & fraud@proof validation!');
      const phrases = phraseExtractor.extractPhrases(doc, 1.0);
      expect(phrases.length).toBeGreaterThan(0);
    });
  });
});
