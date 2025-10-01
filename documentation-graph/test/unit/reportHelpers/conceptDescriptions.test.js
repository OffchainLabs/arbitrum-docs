/**
 * FAILING TESTS for dynamic concept descriptions
 *
 * Priority: HIGH
 * Issue: 60+ hard-coded concept descriptions in getConceptDescription()
 * Goal: Generate descriptions dynamically from concept metadata and context
 *
 * These tests WILL FAIL because the implementation doesn't exist yet.
 */

import { describe, it, expect } from '@jest/globals';
import { generateConceptDescription } from '../../../src/helpers/reportHelpers.js';
import { ConceptDataBuilder } from '../../helpers/testDataBuilders.js';

describe('Dynamic Concept Descriptions - FAILING TESTS', () => {
  describe('generateConceptDescription()', () => {
    // TEST 1: Generate description from concept metadata
    it('should generate description using concept type and category', () => {
      const conceptData = new ConceptDataBuilder()
        .addConcept('arbitrum', (b) =>
          b
            .withType('domain')
            .withCategory('platform')
            .withFiles(['doc1.mdx', 'doc2.mdx'])
            .withWeight(15),
        )
        .build();

      const description = generateConceptDescription('arbitrum', conceptData);

      expect(description).toBeString();
      expect(description.length).toBeGreaterThan(0);
      expect(description).not.toBe('Technical terminology'); // Should not use generic fallback
    });

    // TEST 2: Include file count in description
    it('should include the number of files containing the concept', () => {
      const conceptData = new ConceptDataBuilder()
        .addConcept('transaction', (b) =>
          b
            .withType('technical')
            .withCategory('blockchain')
            .withFiles(['doc1.mdx', 'doc2.mdx', 'doc3.mdx'])
            .withWeight(10),
        )
        .build();

      const description = generateConceptDescription('transaction', conceptData);

      expect(description).toMatch(/3 files?|appears in 3|found in 3/i);
    });

    // TEST 3: Use concept type in description
    it('should differentiate description based on concept type (domain vs technical)', () => {
      const conceptData = new ConceptDataBuilder()
        .addConcept('arbitrum', (b) =>
          b.withType('domain').withCategory('platform').withFiles(['doc1.mdx']).withWeight(10),
        )
        .addConcept('smart contract', (b) =>
          b.withType('technical').withCategory('development').withFiles(['doc2.mdx']).withWeight(8),
        )
        .build();

      const domainDesc = generateConceptDescription('arbitrum', conceptData);
      const technicalDesc = generateConceptDescription('smart contract', conceptData);

      expect(domainDesc).toMatch(/domain|platform|arbitrum-specific/i);
      expect(technicalDesc).toMatch(/technical|development|programming/i);
    });

    // TEST 4: Use co-occurrence for context
    it('should include related concepts from co-occurrence data', () => {
      const conceptData = new ConceptDataBuilder()
        .addConcept('transaction', (b) =>
          b.withType('technical').withCategory('blockchain').withFiles(['doc1.mdx']).withWeight(10),
        )
        .withCooccurrence('transaction', 'arbitrum', 5)
        .withCooccurrence('transaction', 'smart contract', 4)
        .withCooccurrence('transaction', 'gas', 3)
        .build();

      const description = generateConceptDescription('transaction', conceptData);

      // Should mention at least one related concept
      expect(description).toMatch(/arbitrum|smart contract|gas|related to/i);
    });

    // TEST 5: Handle concept not in data
    it('should provide generic description for unknown concepts', () => {
      const conceptData = {
        concepts: new Map(),
        frequency: new Map(),
        cooccurrence: new Map(),
      };

      const description = generateConceptDescription('unknown-concept', conceptData);

      expect(description).toBe('Technical terminology');
    });

    // TEST 6: Use category information
    it('should include category in generated description', () => {
      const conceptData = {
        concepts: new Map([
          [
            'bridge',
            {
              text: 'bridge',
              type: 'technical',
              category: 'infrastructure',
              files: new Set(['doc1.mdx']),
              totalWeight: 6,
            },
          ],
        ]),
        frequency: new Map([['bridge', 6]]),
        cooccurrence: new Map(),
      };

      const description = generateConceptDescription('bridge', conceptData);

      expect(description).toMatch(/infrastructure|cross-chain|transfer/i);
    });

    // TEST 7: Frequency-based importance
    it('should indicate high-importance concepts based on frequency', () => {
      const conceptData = {
        concepts: new Map([
          [
            'common-term',
            {
              text: 'common-term',
              type: 'domain',
              category: 'platform',
              files: new Set(
                Array(50)
                  .fill(0)
                  .map((_, i) => `doc${i}.mdx`),
              ),
              totalWeight: 100,
            },
          ],
        ]),
        frequency: new Map([['common-term', 100]]),
        cooccurrence: new Map(),
      };

      const description = generateConceptDescription('common-term', conceptData);

      expect(description).toMatch(/50 files|frequently|common|widely/i);
    });

    // TEST 8: Short descriptions
    it('should generate concise descriptions (under 100 characters)', () => {
      const conceptData = {
        concepts: new Map([
          [
            'test',
            {
              text: 'test',
              type: 'technical',
              category: 'testing',
              files: new Set(['doc1.mdx']),
              totalWeight: 5,
            },
          ],
        ]),
        frequency: new Map([['test', 5]]),
        cooccurrence: new Map(),
      };

      const description = generateConceptDescription('test', conceptData);

      expect(description.length).toBeLessThan(100);
    });

    // TEST 9: Handle empty co-occurrence
    it('should not fail when co-occurrence data is empty', () => {
      const conceptData = {
        concepts: new Map([
          [
            'isolated',
            {
              text: 'isolated',
              type: 'technical',
              category: 'misc',
              files: new Set(['doc1.mdx']),
              totalWeight: 3,
            },
          ],
        ]),
        frequency: new Map([['isolated', 3]]),
        cooccurrence: new Map(), // No co-occurrence data
      };

      const description = generateConceptDescription('isolated', conceptData);

      expect(description).toBeString();
      expect(description.length).toBeGreaterThan(0);
    });

    // TEST 10: Consistent output for same input
    it('should generate same description for same concept and data', () => {
      const conceptData = {
        concepts: new Map([
          [
            'consistent',
            {
              text: 'consistent',
              type: 'domain',
              category: 'platform',
              files: new Set(['doc1.mdx', 'doc2.mdx']),
              totalWeight: 10,
            },
          ],
        ]),
        frequency: new Map([['consistent', 10]]),
        cooccurrence: new Map(),
      };

      const desc1 = generateConceptDescription('consistent', conceptData);
      const desc2 = generateConceptDescription('consistent', conceptData);

      expect(desc1).toBe(desc2);
    });
  });

  describe('Integration with report generation', () => {
    // TEST 11: No hard-coded descriptions used
    it('should not return any hard-coded description strings', () => {
      const conceptData = {
        concepts: new Map([
          [
            'nitro',
            {
              text: 'nitro',
              type: 'domain',
              category: 'technology',
              files: new Set(['doc1.mdx']),
              totalWeight: 12,
            },
          ],
        ]),
        frequency: new Map([['nitro', 12]]),
        cooccurrence: new Map(),
      };

      const description = generateConceptDescription('nitro', conceptData);

      // Should NOT be the hard-coded value from current implementation
      expect(description).not.toBe('Current Arbitrum technology stack');
    });

    // TEST 12: Handle all concept types
    it('should handle both domain and technical concept types', () => {
      const conceptData = {
        concepts: new Map([
          [
            'domain-concept',
            { type: 'domain', category: 'platform', files: new Set(['doc1.mdx']), totalWeight: 5 },
          ],
          [
            'technical-concept',
            {
              type: 'technical',
              category: 'development',
              files: new Set(['doc2.mdx']),
              totalWeight: 5,
            },
          ],
        ]),
        frequency: new Map([
          ['domain-concept', 5],
          ['technical-concept', 5],
        ]),
        cooccurrence: new Map(),
      };

      const domainDesc = generateConceptDescription('domain-concept', conceptData);
      const techDesc = generateConceptDescription('technical-concept', conceptData);

      expect(domainDesc).toBeTruthy();
      expect(techDesc).toBeTruthy();
      // Descriptions should be different due to different types
      expect(domainDesc).not.toBe(techDesc);
    });
  });
});
