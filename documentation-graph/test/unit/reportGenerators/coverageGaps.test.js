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
 * FAILING TESTS for Coverage Gaps Analysis with Dynamic Content Types
 *
 * Priority: HIGH
 * Focus: Integration of discoverContentTypes into generateCoverageGapsAnalysis
 * Current Issue: Hard-coded docTypes array in line 458 of src/index.js
 *
 * These tests WILL FAIL because generateCoverageGapsAnalysis still uses hard-coded types.
 */

import { describe, it, expect } from '@jest/globals';
import { generateCoverageGapsAnalysis } from '../../../src/index.js';
import {
  DocumentsMapBuilder,
  ConceptDataBuilder,
  AnalysisBuilder,
} from '../../helpers/testDataBuilders.js';

/**
 * This is the actual function from src/index.js that has been refactored
 * Previously it had: const docTypes = ['how-to', 'tutorial', 'reference', 'concept'];
 * Now it discovers types dynamically using discoverContentTypes()
 */

describe('Coverage Gaps Analysis with Dynamic Types - FAILING TESTS', () => {
  describe('generateCoverageGapsAnalysis() - content type detection', () => {
    // TEST 1: Discover actual content types from documents
    it('should discover content types from document frontmatter instead of using hard-coded list', () => {
      const documents = new DocumentsMapBuilder()
        .addDocumentWithBuilder((b) => b.withPath('doc1.mdx').withContentType('quickstart'))
        .addDocumentWithBuilder((b) => b.withPath('doc2.mdx').withContentType('troubleshooting'))
        .addDocumentWithBuilder((b) => b.withPath('doc3.mdx').withContentType('api-guide'))
        .build();

      const analysis = new AnalysisBuilder()
        .withDocumentCount(3)
        .withDirectoryDistribution({ docs: 3 })
        .build();

      const conceptData = new ConceptDataBuilder()
        .addConcept('test', (b) => b.withFiles(['doc1.mdx']).withWeight(5))
        .build();

      const result = generateCoverageGapsAnalysis(analysis, conceptData, documents);

      // Should detect custom content types, not check against hard-coded list
      expect(result).toContain('quickstart');
      expect(result).toContain('troubleshooting');
      expect(result).toContain('api-guide');

      // Should NOT mention hard-coded types that don't exist
      expect(result).not.toContain('how-to');
      expect(result).not.toContain('tutorial');
    });

    // TEST 2: Report underrepresented discovered types
    it('should identify underrepresented types from discovered types only', () => {
      const documents = new DocumentsMapBuilder()
        .addMultiple(3, 'docs/concept', 'concept')
        .addDocumentWithBuilder((b) => b.withPath('doc4.mdx').withContentType('reference'))
        .build();

      const analysis = new AnalysisBuilder()
        .withDocumentCount(4)
        .withDirectoryDistribution({ docs: 4 })
        .build();

      const conceptData = new ConceptDataBuilder()
        .addConcept('test', (b) => b.withFiles(['doc1.mdx']).withWeight(5))
        .build();

      const result = generateCoverageGapsAnalysis(analysis, conceptData, documents);

      // Should report 'reference' as underrepresented (< 3 docs)
      expect(result).toMatch(/underrepresented|documentation type gaps/i);
      expect(result).toContain('reference');

      // Should NOT report missing types that were never in the documents
      expect(result).not.toContain('how-to');
      expect(result).not.toContain('tutorial');
    });

    // TEST 3: Handle when all discovered types are well-represented
    it('should not report type gaps when all discovered types have sufficient docs', () => {
      const documents = new Map([
        ['doc1.mdx', { path: 'doc1.mdx', frontmatter: { content_type: 'concept' } }],
        ['doc2.mdx', { path: 'doc2.mdx', frontmatter: { content_type: 'concept' } }],
        ['doc3.mdx', { path: 'doc3.mdx', frontmatter: { content_type: 'concept' } }],
        ['doc4.mdx', { path: 'doc4.mdx', frontmatter: { content_type: 'reference' } }],
        ['doc5.mdx', { path: 'doc5.mdx', frontmatter: { content_type: 'reference' } }],
        ['doc6.mdx', { path: 'doc6.mdx', frontmatter: { content_type: 'reference' } }],
      ]);

      const analysis = {
        documents: { byDirectory: { docs: 6 } },
      };

      const conceptData = {
        frequency: new Map([['test', 10]]),
        concepts: new Map([['test', { files: new Set(['doc1.mdx']) }]]),
      };

      const result = generateCoverageGapsAnalysis(analysis, conceptData, documents);

      // Should not report type gaps
      expect(result).not.toMatch(/documentation type gaps|underrepresented/i);
    });

    // TEST 4: Work with non-standard content type names
    it('should handle any content type values users have defined', () => {
      const documents = new Map([
        ['doc1.mdx', { path: 'doc1.mdx', frontmatter: { content_type: 'getting-started-guide' } }],
        ['doc2.mdx', { path: 'doc2.mdx', frontmatter: { content_type: 'advanced-tutorial' } }],
        ['doc3.mdx', { path: 'doc3.mdx', frontmatter: { content_type: 'FAQ' } }],
      ]);

      const analysis = {
        documents: { byDirectory: { docs: 3 } },
      };

      const conceptData = {
        frequency: new Map([['test', 5]]),
        concepts: new Map([['test', { files: new Set(['doc1.mdx']) }]]),
      };

      const result = generateCoverageGapsAnalysis(analysis, conceptData, documents);

      // Should work with any user-defined types
      expect(() => generateCoverageGapsAnalysis(analysis, conceptData, documents)).not.toThrow();

      // Should identify underrepresented custom types
      expect(result).toMatch(/getting-started-guide|advanced-tutorial|FAQ/i);
    });

    // TEST 5: Handle documents without content_type
    it('should count documents without content_type as "unspecified"', () => {
      const documents = new Map([
        ['doc1.mdx', { path: 'doc1.mdx', frontmatter: { content_type: 'concept' } }],
        ['doc2.mdx', { path: 'doc2.mdx', frontmatter: { content_type: 'concept' } }],
        ['doc3.mdx', { path: 'doc3.mdx', frontmatter: { content_type: 'concept' } }],
        ['doc4.mdx', { path: 'doc4.mdx', frontmatter: null }],
      ]);

      const analysis = {
        documents: { byDirectory: { docs: 4 } },
      };

      const conceptData = {
        frequency: new Map([['test', 5]]),
        concepts: new Map([['test', { files: new Set(['doc1.mdx']) }]]),
      };

      const result = generateCoverageGapsAnalysis(analysis, conceptData, documents);

      // Should treat missing content_type as "unspecified" and report it
      expect(result).toMatch(/unspecified/i);
    });

    // TEST 6: Use configurable threshold
    it('should use configurable threshold for underrepresented types', () => {
      const documents = new Map([
        ['doc1.mdx', { path: 'doc1.mdx', frontmatter: { content_type: 'concept' } }],
        ['doc2.mdx', { path: 'doc2.mdx', frontmatter: { content_type: 'concept' } }],
        ['doc3.mdx', { path: 'doc3.mdx', frontmatter: { content_type: 'reference' } }],
        ['doc4.mdx', { path: 'doc4.mdx', frontmatter: { content_type: 'reference' } }],
      ]);

      const analysis = {
        documents: { byDirectory: { docs: 4 } },
      };

      const conceptData = {
        frequency: new Map([['test', 5]]),
        concepts: new Map([['test', { files: new Set(['doc1.mdx']) }]]),
      };

      const config = {
        coverage: {
          underrepresentedTypeCount: 5, // Custom threshold: need 5+ docs
        },
      };

      const result = generateCoverageGapsAnalysis(analysis, conceptData, documents, config);

      // With threshold of 5, both types (2 docs each) should be underrepresented
      expect(result).toMatch(/underrepresented/i);
      expect(result).toContain('concept');
      expect(result).toContain('reference');
    });

    // TEST 7: Empty documents should not crash
    it('should handle empty documents map gracefully', () => {
      const documents = new Map();

      const analysis = {
        documents: { byDirectory: {} },
      };

      const conceptData = {
        frequency: new Map(),
        concepts: new Map(),
      };

      expect(() => generateCoverageGapsAnalysis(analysis, conceptData, documents)).not.toThrow();
    });

    // TEST 8: Single content type
    it('should not report gaps when only one content type exists', () => {
      const documents = new Map([
        ['doc1.mdx', { path: 'doc1.mdx', frontmatter: { content_type: 'reference' } }],
        ['doc2.mdx', { path: 'doc2.mdx', frontmatter: { content_type: 'reference' } }],
        ['doc3.mdx', { path: 'doc3.mdx', frontmatter: { content_type: 'reference' } }],
        ['doc4.mdx', { path: 'doc4.mdx', frontmatter: { content_type: 'reference' } }],
      ]);

      const analysis = {
        documents: { byDirectory: { docs: 4 } },
      };

      const conceptData = {
        frequency: new Map([['test', 5]]),
        concepts: new Map([['test', { files: new Set(['doc1.mdx']) }]]),
      };

      const result = generateCoverageGapsAnalysis(analysis, conceptData, documents);

      // No gaps if only one type exists and it has enough docs
      expect(result).not.toMatch(/underrepresented|documentation type gaps/i);
    });
  });
});
