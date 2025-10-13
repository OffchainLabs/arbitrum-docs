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
 * FAILING TESTS for dynamic content type discovery
 *
 * Priority: HIGH
 * Issue: Hard-coded content type list in generateCoverageGapsAnalysis()
 * Goal: Replace ['how-to', 'tutorial', 'reference', 'concept'] with actual discovery from documents
 *
 * These tests WILL FAIL because the implementation doesn't exist yet.
 */

import { describe, it, expect } from '@jest/globals';
import { discoverContentTypes } from '../../../src/helpers/reportHelpers.js';
import { DocumentsMapBuilder } from '../../helpers/testDataBuilders.js';

describe('Content Type Discovery - FAILING TESTS', () => {
  describe('discoverContentTypes()', () => {
    // TEST 1: Happy path - discover all content types
    it('should discover all unique content types from document frontmatter', () => {
      const documents = new DocumentsMapBuilder()
        .addDocumentWithBuilder((b) => b.withPath('doc1.mdx').withContentType('how-to'))
        .addDocumentWithBuilder((b) => b.withPath('doc2.mdx').withContentType('concept'))
        .addDocumentWithBuilder((b) => b.withPath('doc3.mdx').withContentType('reference'))
        .addDocumentWithBuilder((b) => b.withPath('doc4.mdx').withContentType('tutorial'))
        .build();

      const result = discoverContentTypes(documents);

      expect(result).toBeArray();
      expect(result).toHaveLength(4);
      expect(result.map((r) => r.type)).toIncludeAllMembers([
        'how-to',
        'concept',
        'reference',
        'tutorial',
      ]);
    });

    // TEST 2: Count documents per type
    it('should accurately count documents for each content type', () => {
      const documents = new DocumentsMapBuilder()
        .addMultiple(3, 'docs/howto', 'how-to')
        .addDocumentWithBuilder((b) => b.withPath('doc4.mdx').withContentType('concept'))
        .addDocumentWithBuilder((b) => b.withPath('doc5.mdx').withContentType('reference'))
        .build();

      const result = discoverContentTypes(documents);

      const howTo = result.find((r) => r.type === 'how-to');
      const concept = result.find((r) => r.type === 'concept');
      const reference = result.find((r) => r.type === 'reference');

      expect(howTo.count).toBe(3);
      expect(concept.count).toBe(1);
      expect(reference.count).toBe(1);
    });

    // TEST 3: Calculate percentages
    it('should calculate correct percentages for each content type', () => {
      const documents = new DocumentsMapBuilder()
        .addMultiple(2, 'docs/howto', 'how-to')
        .addMultiple(2, 'docs/concept', 'concept')
        .build();

      const result = discoverContentTypes(documents);

      const howTo = result.find((r) => r.type === 'how-to');
      const concept = result.find((r) => r.type === 'concept');

      expect(parseFloat(howTo.percentage)).toBe(50.0);
      expect(parseFloat(concept.percentage)).toBe(50.0);
    });

    // TEST 4: Sort by count descending
    it('should sort content types by count in descending order', () => {
      const documents = new DocumentsMapBuilder()
        .addMultiple(3, 'docs/howto', 'how-to')
        .addMultiple(2, 'docs/concept', 'concept')
        .addDocumentWithBuilder((b) => b.withPath('doc6.mdx').withContentType('reference'))
        .build();

      const result = discoverContentTypes(documents);

      expect(result[0].type).toBe('how-to');
      expect(result[0].count).toBe(3);
      expect(result[1].type).toBe('concept');
      expect(result[1].count).toBe(2);
      expect(result[2].type).toBe('reference');
      expect(result[2].count).toBe(1);
    });

    // TEST 5: Handle missing content_type
    it('should classify documents without content_type as "unspecified"', () => {
      const documents = new DocumentsMapBuilder()
        .addDocumentWithBuilder((b) => b.withPath('doc1.mdx').withContentType('how-to'))
        .addDocumentWithBuilder((b) => b.withPath('doc2.mdx').withoutFrontmatter())
        .addDocumentWithBuilder((b) => b.withPath('doc3.mdx').withContentType(undefined))
        .build();

      const result = discoverContentTypes(documents);

      const unspecified = result.find((r) => r.type === 'unspecified');
      expect(unspecified).toBeDefined();
      expect(unspecified.count).toBe(2);
    });

    // TEST 6: Handle empty documents
    it('should return empty array for empty documents map', () => {
      const documents = new Map();

      const result = discoverContentTypes(documents);

      expect(result).toEqual([]);
    });

    // TEST 7: Handle non-standard content types
    it('should preserve any custom content type values from frontmatter', () => {
      const documents = new Map([
        ['doc1.mdx', { frontmatter: { content_type: 'troubleshooting-guide' }, path: 'doc1.mdx' }],
        ['doc2.mdx', { frontmatter: { content_type: 'API Documentation' }, path: 'doc2.mdx' }],
        ['doc3.mdx', { frontmatter: { content_type: 'quick-start' }, path: 'doc3.mdx' }],
      ]);

      const result = discoverContentTypes(documents);

      expect(result.map((r) => r.type)).toIncludeAllMembers([
        'troubleshooting-guide',
        'API Documentation',
        'quick-start',
      ]);
    });

    // TEST 8: Handle single document
    it('should handle map with single document', () => {
      const documents = new Map([
        ['doc1.mdx', { frontmatter: { content_type: 'concept' }, path: 'doc1.mdx' }],
      ]);

      const result = discoverContentTypes(documents);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('concept');
      expect(result[0].count).toBe(1);
      expect(parseFloat(result[0].percentage)).toBe(100.0);
    });

    // TEST 9: Return format validation
    it('should return array of objects with type, count, and percentage properties', () => {
      const documents = new Map([
        ['doc1.mdx', { frontmatter: { content_type: 'how-to' }, path: 'doc1.mdx' }],
        ['doc2.mdx', { frontmatter: { content_type: 'concept' }, path: 'doc2.mdx' }],
      ]);

      const result = discoverContentTypes(documents);

      result.forEach((item) => {
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('count');
        expect(item).toHaveProperty('percentage');
        expect(typeof item.type).toBe('string');
        expect(typeof item.count).toBe('number');
        expect(item.count).toBePositive();
      });
    });

    // TEST 10: Edge case - all documents same type
    it('should handle when all documents have the same content type', () => {
      const documents = new Map([
        ['doc1.mdx', { frontmatter: { content_type: 'reference' }, path: 'doc1.mdx' }],
        ['doc2.mdx', { frontmatter: { content_type: 'reference' }, path: 'doc2.mdx' }],
        ['doc3.mdx', { frontmatter: { content_type: 'reference' }, path: 'doc3.mdx' }],
      ]);

      const result = discoverContentTypes(documents);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('reference');
      expect(result[0].count).toBe(3);
      expect(parseFloat(result[0].percentage)).toBe(100.0);
    });
  });
});
