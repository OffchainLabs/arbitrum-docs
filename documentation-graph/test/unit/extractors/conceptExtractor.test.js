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
 * Unit tests for ConceptExtractor
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import ConceptExtractor from '../../../src/extractors/conceptExtractor.js';

describe('ConceptExtractor', () => {
  let extractor;

  beforeEach(() => {
    extractor = new ConceptExtractor();
  });

  describe('normalizeTerm', () => {
    it('should lowercase and trim text', () => {
      const result = extractor.normalizeTerm('  Test Term  ');
      expect(result).toBe('test term');
    });

    it('should remove special characters', () => {
      const result = extractor.normalizeTerm('test@#$term');
      expect(result).toBe('test term');
    });

    it('should handle multiple spaces', () => {
      const result = extractor.normalizeTerm('test    term    here');
      expect(result).toBe('test term here');
    });

    it('should handle hyphens correctly', () => {
      const result = extractor.normalizeTerm('smart-contract');
      expect(result).toBe('smart-contract');
    });
  });

  describe('isValidConcept', () => {
    it('should reject stop words', () => {
      expect(extractor.isValidConcept('the')).toBe(false);
      expect(extractor.isValidConcept('and')).toBe(false);
      expect(extractor.isValidConcept('of')).toBe(false);
    });

    it('should accept valid domain terms', () => {
      expect(extractor.isValidConcept('arbitrum')).toBe(true);
      expect(extractor.isValidConcept('blockchain')).toBe(true);
      expect(extractor.isValidConcept('ethereum')).toBe(true);
    });

    it('should reject very short terms', () => {
      expect(extractor.isValidConcept('a')).toBe(false);
      expect(extractor.isValidConcept('to')).toBe(false);
    });

    it('should reject very long terms', () => {
      const longTerm = 'a'.repeat(100);
      expect(extractor.isValidConcept(longTerm)).toBe(false);
    });

    it('should accept technical terms', () => {
      expect(extractor.isValidConcept('api')).toBe(true);
      expect(extractor.isValidConcept('sdk')).toBe(true);
    });
  });

  describe('extractConceptsFromText', () => {
    it('should extract concepts from simple text', () => {
      const text = 'Arbitrum is a blockchain platform for smart contracts.';
      const concepts = extractor.extractConceptsFromText(text);

      expect(concepts.size).toBeGreaterThan(0);
      expect(Array.from(concepts)).toContain('arbitrum');
      expect(Array.from(concepts)).toContain('blockchain');
      expect(Array.from(concepts)).toContain('smart contract');
    });

    it('should filter out stop words', () => {
      const text = 'The quick brown fox and the lazy dog.';
      const concepts = extractor.extractConceptsFromText(text);

      expect(Array.from(concepts)).not.toContain('the');
      expect(Array.from(concepts)).not.toContain('and');
    });

    it('should handle empty text', () => {
      const concepts = extractor.extractConceptsFromText('');
      expect(concepts.size).toBe(0);
    });

    it('should handle text with only stop words', () => {
      const text = 'the and or but';
      const concepts = extractor.extractConceptsFromText(text);
      expect(concepts.size).toBe(0);
    });

    it('should normalize extracted concepts', () => {
      const text = 'Smart Contract and smart-contract are the same.';
      const concepts = extractor.extractConceptsFromText(text);

      const conceptArray = Array.from(concepts);
      expect(conceptArray).toContain('smart contract');
    });
  });

  describe('areSimilar', () => {
    it('should identify similar terms', () => {
      expect(extractor.areSimilar('blockchain', 'blockchains')).toBe(true);
      expect(extractor.areSimilar('contract', 'contracts')).toBe(true);
    });

    it('should reject dissimilar terms', () => {
      expect(extractor.areSimilar('blockchain', 'ethereum')).toBe(false);
      expect(extractor.areSimilar('api', 'blockchain')).toBe(false);
    });

    it('should handle exact matches', () => {
      expect(extractor.areSimilar('arbitrum', 'arbitrum')).toBe(true);
    });

    it('should handle significant length differences', () => {
      expect(extractor.areSimilar('api', 'application')).toBe(false);
    });
  });

  describe('fastSimilarityCheck', () => {
    it('should quickly filter dissimilar terms by length', () => {
      expect(extractor.fastSimilarityCheck('api', 'blockchain')).toBe(false);
      expect(extractor.fastSimilarityCheck('test', 'testing')).toBe(true);
    });

    it('should check first characters', () => {
      expect(extractor.fastSimilarityCheck('arbitrum', 'ethereum')).toBe(false);
      expect(extractor.fastSimilarityCheck('arbitrum', 'arbos')).toBe(true);
    });
  });

  describe('calculateConceptMetrics', () => {
    it('should calculate statistics for concepts', () => {
      // Add some concepts to test
      extractor.addConcept('blockchain', 'test.md');
      extractor.addConcept('blockchain', 'test2.md');
      extractor.addConcept('ethereum', 'test.md');

      extractor.calculateConceptMetrics();
      const stats = extractor.getStats();

      expect(stats).toHaveProperty('totalConcepts');
      expect(stats).toHaveProperty('uniqueConcepts');
      expect(stats.totalConcepts).toBeGreaterThan(0);
    });
  });

  describe('getStats', () => {
    it('should return concept extraction statistics', () => {
      const stats = extractor.getStats();

      expect(stats).toHaveProperty('totalConcepts');
      expect(stats).toHaveProperty('uniqueConcepts');
      expect(stats).toHaveProperty('domainConcepts');
      expect(stats).toHaveProperty('technicalTerms');
    });

    it('should track concept counts correctly', () => {
      extractor.addConcept('arbitrum', 'test.md');
      extractor.addConcept('blockchain', 'test.md');

      const stats = extractor.getStats();
      expect(stats.totalConcepts).toBeGreaterThanOrEqual(2);
    });
  });
});
