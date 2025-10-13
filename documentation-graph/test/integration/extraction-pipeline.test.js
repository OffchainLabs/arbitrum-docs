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
 * Integration tests for the full extraction pipeline
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import path from 'path';
import fs from 'fs-extra';
import DocumentExtractor from '../../src/extractors/documentExtractor.js';
import ConceptExtractor from '../../src/extractors/conceptExtractor.js';

describe('Extraction Pipeline Integration', () => {
  const testDir = path.join(process.cwd(), 'test', 'fixtures', 'documents');
  let documents, conceptData;

  beforeAll(async () => {
    // Run full extraction pipeline
    const documentExtractor = new DocumentExtractor(testDir);
    const extractionResult = await documentExtractor.extractAll();
    documents = extractionResult.documents;

    const conceptExtractor = new ConceptExtractor();
    conceptData = await conceptExtractor.extractFromDocuments(documents);
  });

  describe('Document Extraction', () => {
    it('should extract all test documents', () => {
      expect(documents).toBeDefined();
      expect(documents.size).toBeGreaterThan(0);
    });

    it('should extract document metadata correctly', () => {
      const docArray = Array.from(documents.values());
      const validDoc = docArray.find(d => d.frontmatter && d.frontmatter.title === 'Test Document');

      expect(validDoc).toBeDefined();
      expect(validDoc.frontmatter.description).toBeDefined();
      expect(validDoc.content).toBeDefined();
      expect(validDoc.headings).toBeDefined();
    });

    it('should handle documents without frontmatter', () => {
      const docArray = Array.from(documents.values());
      const noFrontmatterDoc = docArray.find(d =>
        d.content && d.content.includes('Document Without Frontmatter')
      );

      expect(noFrontmatterDoc).toBeDefined();
      expect(noFrontmatterDoc.frontmatter).toEqual({});
    });
  });

  describe('Concept Extraction', () => {
    it('should extract concepts from documents', () => {
      expect(conceptData).toBeDefined();
      expect(conceptData.concepts).toBeDefined();
      expect(conceptData.concepts.size).toBeGreaterThan(0);
    });

    it('should extract domain-specific terms', () => {
      const conceptArray = Array.from(conceptData.concepts.keys());

      // Should find blockchain-related terms from test documents
      const hasDomainTerms = conceptArray.some(concept =>
        ['blockchain', 'smart contract', 'arbitrum', 'contract'].includes(concept)
      );

      expect(hasDomainTerms).toBe(true);
    });

    it('should track concept frequency', () => {
      expect(conceptData.frequency).toBeDefined();
      expect(conceptData.frequency.size).toBeGreaterThan(0);

      // Frequency should be at least 1 for all concepts
      for (const [concept, freq] of conceptData.frequency.entries()) {
        expect(freq).toBeGreaterThanOrEqual(1);
      }
    });

    it('should not include stop words', () => {
      const conceptArray = Array.from(conceptData.concepts.keys());
      const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at'];

      const hasStopWords = conceptArray.some(concept =>
        stopWords.includes(concept)
      );

      expect(hasStopWords).toBe(false);
    });
  });

  describe('Pipeline Integration', () => {
    it('should maintain data consistency between phases', () => {
      // Verify that concepts reference valid documents
      for (const [concept, data] of conceptData.concepts.entries()) {
        expect(data).toBeDefined();
        expect(data.files).toBeDefined();

        // All referenced files should exist in extracted documents
        for (const filePath of data.files) {
          const hasDocument = Array.from(documents.keys()).some(docPath =>
            docPath.includes(path.basename(filePath)) || filePath.includes(path.basename(docPath))
          );
          expect(hasDocument).toBe(true);
        }
      }
    });

    it('should extract concepts from document headings', () => {
      // Headings should contribute to concepts
      const docArray = Array.from(documents.values());
      const conceptArray = Array.from(conceptData.concepts.keys());

      // Find a document with headings
      const docWithHeadings = docArray.find(d => d.headings && d.headings.length > 0);
      expect(docWithHeadings).toBeDefined();

      // Some heading text should appear in concepts (normalized)
      const headingTexts = docWithHeadings.headings.map(h => h.text.toLowerCase());
      const hasHeadingConcepts = conceptArray.some(concept =>
        headingTexts.some(heading => heading.includes(concept) || concept.includes(heading.split(' ')[0]))
      );

      expect(hasHeadingConcepts).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should complete extraction in reasonable time', () => {
      // This test implicitly passes if beforeAll completes
      // You could add explicit timing if needed
      expect(documents.size).toBeGreaterThan(0);
      expect(conceptData.concepts.size).toBeGreaterThan(0);
    });

    it('should not exceed memory limits', () => {
      const memUsage = process.memoryUsage();
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;

      // Should not use excessive memory for small test set
      expect(heapUsedMB).toBeLessThan(1000); // Less than 1GB for test fixtures
    });
  });
});
