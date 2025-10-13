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
 * Integration Tests: End-to-End Report Generation
 *
 * Tests the complete report generation pipeline from documents → analysis → report.
 * Follows TDD approach: write failing tests first, then implement minimal fixes.
 *
 * Test Coverage:
 * - Full report generation with dynamic content types
 * - Full report generation with dynamic thresholds
 * - Full report generation with dynamic concept descriptions
 * - Complete pipeline from documents → analysis → report
 * - Error scenarios (missing data, invalid config)
 *
 * @module test/integration/reportGeneration
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { generateIssueReport } from '../../src/index.js';
import {
  discoverContentTypes,
  loadReportConfiguration,
  generateConceptDescription,
  getThresholds,
} from '../../src/helpers/reportHelpers.js';
import {
  DocumentsMapBuilder,
  DocumentBuilder,
  ConceptDataBuilder,
  AnalysisBuilder,
  testData,
} from '../helpers/testDataBuilders.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Report Generation - Integration Tests', () => {
  const outputDir = path.join(__dirname, '..', 'output', 'integration');
  const inputDir = '/test/input/dir';

  beforeAll(async () => {
    await fs.ensureDir(outputDir);
  });

  afterAll(async () => {
    // Clean up test output
    await fs.remove(outputDir);
  });

  /**
   * INTEGRATION TEST 1: Full Report with Dynamic Content Types
   *
   * This test verifies that content types are discovered from actual document
   * frontmatter rather than hard-coded lists.
   */
  describe('Full Report Generation with Dynamic Content Types', () => {
    it('SHOULD generate report with actual content type counts (not hard-coded list)', async () => {
      // ARRANGE: Create documents with diverse content types
      const documents = new DocumentsMapBuilder()
        .addDocumentWithBuilder((b) =>
          b.withPath('docs/guide1.mdx').withContentType('how-to').withWordCount(500),
        )
        .addDocumentWithBuilder((b) =>
          b.withPath('docs/guide2.mdx').withContentType('how-to').withWordCount(600),
        )
        .addDocumentWithBuilder((b) =>
          b.withPath('docs/guide3.mdx').withContentType('how-to').withWordCount(700),
        )
        .addDocumentWithBuilder((b) =>
          b.withPath('docs/concept1.mdx').withContentType('concept').withWordCount(800),
        )
        .addDocumentWithBuilder((b) =>
          b.withPath('docs/concept2.mdx').withContentType('concept').withWordCount(900),
        )
        .addDocumentWithBuilder((b) =>
          b.withPath('docs/ref1.mdx').withContentType('reference').withWordCount(1000),
        )
        .addDocumentWithBuilder((b) =>
          b.withPath('docs/tutorial1.mdx').withContentType('tutorial').withWordCount(1200),
        )
        .addDocumentWithBuilder((b) =>
          b
            .withPath('docs/troubleshoot1.mdx')
            .withContentType('troubleshooting')
            .withWordCount(400),
        )
        .addDocumentWithBuilder((b) =>
          b.withPath('docs/custom-type.mdx').withContentType('custom-guide').withWordCount(500),
        )
        .addDocumentWithBuilder((b) =>
          b.withPath('docs/no-type.mdx').withoutFrontmatter().withWordCount(300),
        )
        .build();

      const conceptData = new ConceptDataBuilder()
        .addConcept('arbitrum')
        .addConcept('transaction')
        .addConcept('smart contract')
        .build();

      const analysis = new AnalysisBuilder()
        .withDocumentCount(documents.size)
        .withQualityScore(75)
        .build();

      const graphStats = {
        totalNodes: 23,
        totalEdges: 45,
        density: 0.085,
        avgDegree: 3.9,
      };

      // ACT: Generate report
      const reportPath = await generateIssueReport(
        analysis,
        conceptData,
        documents,
        graphStats,
        outputDir,
        inputDir,
        null,
        null,
      );

      const reportContent = await fs.readFile(reportPath, 'utf-8');

      // ASSERT: Content types section should show actual discovered types
      // NOT hard-coded types like "Most common format" or "Well-distributed"

      // Should find Content Types section
      expect(reportContent).toContain('Content Types');

      // Should contain actual content type counts from our data
      expect(reportContent).toMatch(/how-to.*3 document/i);
      expect(reportContent).toMatch(/concept.*2 document/i);
      expect(reportContent).toMatch(/reference.*1 document/i);
      expect(reportContent).toMatch(/tutorial.*1 document/i);
      expect(reportContent).toMatch(/troubleshooting.*1 document/i);
      expect(reportContent).toMatch(/custom-guide.*1 document/i);
      expect(reportContent).toMatch(/unspecified.*1 document/i);

      // Should NOT contain hard-coded descriptions
      expect(reportContent).not.toMatch(/Most common format/i);
      expect(reportContent).not.toMatch(/Well-distributed across/i);
      expect(reportContent).not.toMatch(/Technical explanations/i);

      // Should show percentages for each type
      expect(reportContent).toMatch(/how-to.*30\.0%/);
      expect(reportContent).toMatch(/concept.*20\.0%/);
    });

    it('SHOULD handle documents with only unspecified content types', async () => {
      // ARRANGE: All documents without content_type
      const documents = new DocumentsMapBuilder()
        .addDocumentWithBuilder((b) => b.withPath('docs/a.mdx').withoutFrontmatter())
        .addDocumentWithBuilder((b) => b.withPath('docs/b.mdx').withoutFrontmatter())
        .addDocumentWithBuilder((b) => b.withPath('docs/c.mdx').withoutFrontmatter())
        .build();

      const conceptData = testData.createConcepts(['test']);
      const analysis = testData.createAnalysis(3, 60);
      const graphStats = { totalNodes: 4, totalEdges: 3, density: 0.25, avgDegree: 1.5 };

      // ACT
      const reportPath = await generateIssueReport(
        analysis,
        conceptData,
        documents,
        graphStats,
        outputDir,
        inputDir,
        null,
        null,
      );

      const reportContent = await fs.readFile(reportPath, 'utf-8');

      // ASSERT: Should show 100% unspecified, not hard-coded types
      expect(reportContent).toMatch(/unspecified.*3 document/i);
      expect(reportContent).toMatch(/unspecified.*100\.0%/i);

      // Extract just the Content Types section to check it doesn't have other types
      const contentTypesMatch = reportContent.match(/#### Content Types\n(.*?)\n\n###/s);
      expect(contentTypesMatch).toBeTruthy();
      const contentTypesSection = contentTypesMatch[1];
      expect(contentTypesSection).not.toMatch(/how-to:/);
      expect(contentTypesSection).not.toMatch(/tutorial:/);
      expect(contentTypesSection).not.toMatch(/reference:/);
    });

    it('SHOULD preserve exact content type strings without normalization', async () => {
      // ARRANGE: Documents with unusual content type names
      const documents = new DocumentsMapBuilder()
        .addDocumentWithBuilder((b) => b.withPath('docs/api.mdx').withContentType('API Reference')) // Capital letters, space
        .addDocumentWithBuilder((b) =>
          b.withPath('docs/guide.mdx').withContentType('step-by-step-guide'),
        ) // Multiple hyphens
        .addDocumentWithBuilder((b) =>
          b.withPath('docs/faq.mdx').withContentType('FAQ & Troubleshooting'),
        ) // Special characters
        .build();

      const conceptData = testData.createConcepts(['test']);
      const analysis = testData.createAnalysis(3, 70);
      const graphStats = { totalNodes: 4, totalEdges: 3, density: 0.25, avgDegree: 1.5 };

      // ACT
      const reportPath = await generateIssueReport(
        analysis,
        conceptData,
        documents,
        graphStats,
        outputDir,
        inputDir,
        null,
        null,
      );

      const reportContent = await fs.readFile(reportPath, 'utf-8');

      // ASSERT: Should preserve exact strings
      expect(reportContent).toContain('API Reference');
      expect(reportContent).toContain('step-by-step-guide');
      expect(reportContent).toContain('FAQ & Troubleshooting');
    });
  });

  /**
   * INTEGRATION TEST 2: Full Report with Dynamic Thresholds
   *
   * This test verifies that thresholds are configurable and used throughout
   * the report, not hard-coded magic numbers.
   */
  describe('Full Report Generation with Dynamic Thresholds', () => {
    it('SHOULD use configured thresholds for shallow content detection', async () => {
      // ARRANGE: Custom configuration with different threshold
      const customConfig = {
        contentQuality: {
          shallowWordCount: 400, // Changed from default 200
          lowConceptDensity: 5,
          highSimilarityThreshold: 0.8,
        },
        structural: {
          minHubDocuments: 3,
          oversizedDirMultiplier: 2,
        },
        coverage: {
          lowConceptsPerDoc: 2,
          minDirFileCount: 3,
          underrepresentedTypeCount: 3,
        },
        discoverability: {
          substantialDocWordCount: 300,
          poorLinkingThreshold: 2,
          deepNestingDepth: 3,
          deepNestingCount: 10,
        },
        navigation: {
          goodCoveragePercent: 90,
          minEntryPoints: 5,
          maxDeadEnds: 10,
          maxDepth: 5,
        },
      };

      // Documents with 300 words (below custom threshold of 400, but above default 200)
      const documents = new DocumentsMapBuilder()
        .addDocumentWithBuilder((b) => b.withPath('docs/doc1.mdx').withWordCount(300)) // Shallow with custom threshold
        .addDocumentWithBuilder((b) => b.withPath('docs/doc2.mdx').withWordCount(350)) // Shallow with custom threshold
        .addDocumentWithBuilder((b) => b.withPath('docs/doc3.mdx').withWordCount(500)) // Not shallow
        .build();

      const conceptData = testData.createConcepts(['test']);
      const analysis = testData.createAnalysis(3, 70);
      const graphStats = { totalNodes: 4, totalEdges: 3, density: 0.25, avgDegree: 1.5 };

      // ACT: Generate report with custom config
      // NOTE: This will FAIL initially because generateIssueReport doesn't accept config
      const thresholds = getThresholds(customConfig);

      // ASSERT: Thresholds should be extracted correctly
      expect(thresholds.shallowWordCount).toBe(400);
      expect(thresholds.lowConceptDensity).toBe(5);

      // TODO: When generateIssueReport supports config, test should verify:
      // - Report shows "fewer than 400 words" (not 200)
      // - 2 documents flagged as shallow (doc1, doc2)
      // - doc3 (500 words) is NOT flagged
    });

    it('SHOULD use configured thresholds for poor linking detection', async () => {
      // ARRANGE: Custom threshold for internal links
      const customConfig = {
        contentQuality: {
          shallowWordCount: 200,
          lowConceptDensity: 5,
          highSimilarityThreshold: 0.8,
        },
        structural: {
          minHubDocuments: 3,
          oversizedDirMultiplier: 2,
        },
        coverage: {
          lowConceptsPerDoc: 2,
          minDirFileCount: 3,
          underrepresentedTypeCount: 3,
        },
        discoverability: {
          substantialDocWordCount: 300,
          poorLinkingThreshold: 5, // Changed from default 2
          deepNestingDepth: 3,
          deepNestingCount: 10,
        },
        navigation: {
          goodCoveragePercent: 90,
          minEntryPoints: 5,
          maxDeadEnds: 10,
          maxDepth: 5,
        },
      };

      const thresholds = getThresholds(customConfig);

      // ASSERT
      expect(thresholds.poorLinkingThreshold).toBe(5);
      expect(thresholds.substantialDocWordCount).toBe(300);
    });

    it('SHOULD use default thresholds when no config provided', async () => {
      // ARRANGE: No config provided
      const thresholds = getThresholds();

      // ASSERT: Should use defaults
      expect(thresholds.shallowWordCount).toBe(200);
      expect(thresholds.poorLinkingThreshold).toBe(2);
      expect(thresholds.minHubDocuments).toBe(3);
      expect(thresholds.lowConceptsPerDoc).toBe(2);
      expect(thresholds.goodCoveragePercent).toBe(90);
    });

    it('SHOULD merge partial config with defaults', async () => {
      // ARRANGE: Partial config (only override contentQuality)
      const partialConfig = {
        contentQuality: {
          shallowWordCount: 150,
          lowConceptDensity: 3,
          highSimilarityThreshold: 0.9,
        },
      };

      const config = await loadReportConfiguration(partialConfig);
      const thresholds = getThresholds(config);

      // ASSERT: Override values used
      expect(thresholds.shallowWordCount).toBe(150);
      expect(thresholds.lowConceptDensity).toBe(3);
      expect(thresholds.highSimilarityThreshold).toBe(0.9);

      // ASSERT: Default values preserved for other categories
      expect(thresholds.minHubDocuments).toBe(3);
      expect(thresholds.poorLinkingThreshold).toBe(2);
      expect(thresholds.goodCoveragePercent).toBe(90);
    });
  });

  /**
   * INTEGRATION TEST 3: Full Report with Dynamic Concept Descriptions
   *
   * This test verifies that concept descriptions are generated from actual
   * metadata and context, not hard-coded dictionaries.
   */
  describe('Full Report Generation with Dynamic Concept Descriptions', () => {
    it('SHOULD generate concept descriptions from actual concept metadata', async () => {
      // ARRANGE: Concepts with full metadata
      const conceptData = new ConceptDataBuilder()
        .addConcept('arbitrum', (builder) =>
          builder
            .withType('domain')
            .withCategory('platform')
            .withFiles(['docs/intro.mdx', 'docs/guide.mdx', 'docs/api.mdx'])
            .withWeight(42),
        )
        .addConcept('transaction', (builder) =>
          builder
            .withType('technical')
            .withCategory('blockchain')
            .withFiles(['docs/concepts.mdx', 'docs/api.mdx'])
            .withWeight(28),
        )
        .addConcept('smart contract', (builder) =>
          builder
            .withType('technical')
            .withCategory('development')
            .withFiles(['docs/dev-guide.mdx'])
            .withWeight(15),
        )
        .withCooccurrence('arbitrum', 'transaction', 10)
        .withCooccurrence('transaction', 'smart contract', 8)
        .build();

      // ACT: Generate descriptions
      const desc1 = generateConceptDescription('arbitrum', conceptData);
      const desc2 = generateConceptDescription('transaction', conceptData);
      const desc3 = generateConceptDescription('smart contract', conceptData);

      // ASSERT: Descriptions should be data-driven
      // Should mention domain/technical type
      expect(desc1).toMatch(/Domain-specific/i);
      expect(desc2).toMatch(/Technical/i);
      expect(desc3).toMatch(/Technical/i);

      // Should mention category
      expect(desc1).toMatch(/platform/i);
      expect(desc2).toMatch(/blockchain/i);
      expect(desc3).toMatch(/development/i);

      // Should mention file count
      expect(desc1).toMatch(/3 files/);
      expect(desc2).toMatch(/2 files/);
      expect(desc3).toMatch(/1 file/);

      // Should mention related concepts from co-occurrence
      expect(desc1).toMatch(/related to transaction/i);
      expect(desc2).toMatch(/related to/i);

      // Should NOT be hard-coded strings
      expect(desc1).not.toBe('Current Arbitrum technology stack');
      expect(desc2).not.toBe('Blockchain transaction operations');
    });

    it('SHOULD handle concepts without co-occurrence data', async () => {
      // ARRANGE: Concept without related concepts
      const conceptData = new ConceptDataBuilder()
        .addConcept('isolated-concept', (builder) =>
          builder
            .withType('technical')
            .withCategory('general')
            .withFiles(['docs/isolated.mdx'])
            .withWeight(5),
        )
        .build();

      // ACT
      const description = generateConceptDescription('isolated-concept', conceptData);

      // ASSERT: Should still generate description without crashing
      expect(description).toBeTruthy();
      expect(description).toMatch(/Technical/i);
      expect(description).toMatch(/general/i);
      expect(description).toMatch(/1 file/);
      // Should NOT crash on missing co-occurrence
    });

    it('SHOULD return generic description for unknown concepts', async () => {
      // ARRANGE: Empty concept data
      const conceptData = new ConceptDataBuilder().build();

      // ACT
      const description = generateConceptDescription('unknown-concept', conceptData);

      // ASSERT: Should return fallback
      expect(description).toBe('Technical terminology');
    });

    it('SHOULD truncate long descriptions to 100 characters', async () => {
      // ARRANGE: Concept that would generate very long description
      const conceptData = new ConceptDataBuilder()
        .addConcept('verbose-concept', (builder) =>
          builder
            .withType('domain')
            .withCategory('extremely-long-category-name-that-goes-on-and-on')
            .withFiles(['docs/1.mdx', 'docs/2.mdx', 'docs/3.mdx'])
            .withWeight(100),
        )
        .withCooccurrence('verbose-concept', 'another-very-long-related-concept-name', 10)
        .build();

      // ACT
      const description = generateConceptDescription('verbose-concept', conceptData);

      // ASSERT: Should be truncated
      expect(description.length).toBeLessThanOrEqual(100);
      if (description.length === 100) {
        expect(description).toMatch(/\.\.\.$/);
      }
    });
  });

  /**
   * INTEGRATION TEST 4: Complete Pipeline (Documents → Analysis → Report)
   *
   * This test verifies the entire end-to-end flow with realistic data.
   */
  describe('Complete Pipeline Integration', () => {
    it('SHOULD generate complete report from realistic dataset', async () => {
      // ARRANGE: Realistic documentation set
      const documents = new DocumentsMapBuilder()
        // How-to guides (most common)
        .addMultiple(15, 'docs/guides/how-to', 'how-to')
        // Conceptual docs
        .addMultiple(10, 'docs/concepts/concept', 'concept')
        // Reference docs
        .addMultiple(8, 'docs/reference/ref', 'reference')
        // Tutorials
        .addMultiple(5, 'docs/tutorials/tutorial', 'tutorial')
        // Quickstarts
        .addMultiple(3, 'docs/quickstart/quick', 'quickstart')
        // Troubleshooting
        .addMultiple(4, 'docs/troubleshooting/trouble', 'troubleshooting')
        // Unspecified (missing frontmatter)
        .addDocumentWithBuilder((b) => b.withPath('docs/misc/readme.mdx').withoutFrontmatter())
        .addDocumentWithBuilder((b) => b.withPath('docs/misc/changelog.mdx').withoutFrontmatter())
        .build();

      const conceptData = new ConceptDataBuilder()
        .addConcept('arbitrum', (b) =>
          b
            .withType('domain')
            .withCategory('platform')
            .withFiles(['docs/intro.mdx'])
            .withWeight(100),
        )
        .addConcept('rollup', (b) =>
          b
            .withType('domain')
            .withCategory('architecture')
            .withFiles(['docs/arch.mdx'])
            .withWeight(85),
        )
        .addConcept('transaction', (b) =>
          b
            .withType('technical')
            .withCategory('blockchain')
            .withFiles(['docs/tx.mdx'])
            .withWeight(75),
        )
        .addConcept('smart contract', (b) =>
          b
            .withType('technical')
            .withCategory('development')
            .withFiles(['docs/dev.mdx'])
            .withWeight(60),
        )
        .addConcept('bridge', (b) =>
          b
            .withType('technical')
            .withCategory('infrastructure')
            .withFiles(['docs/bridge.mdx'])
            .withWeight(50),
        )
        .withCooccurrence('arbitrum', 'rollup', 30)
        .withCooccurrence('rollup', 'transaction', 25)
        .withCooccurrence('transaction', 'smart contract', 20)
        .build();

      const analysis = new AnalysisBuilder()
        .withDocumentCount(documents.size)
        .withQualityScore(78)
        .withDirectoryDistribution({
          guides: 15,
          concepts: 10,
          reference: 8,
          tutorials: 5,
          troubleshooting: 4,
          quickstart: 3,
          misc: 2,
        })
        .build();

      const graphStats = {
        totalNodes: 52,
        totalEdges: 120,
        density: 0.045,
        avgDegree: 4.6,
      };

      // ACT: Generate full report
      const reportPath = await generateIssueReport(
        analysis,
        conceptData,
        documents,
        graphStats,
        outputDir,
        inputDir,
        null,
        null,
      );

      const reportContent = await fs.readFile(reportPath, 'utf-8');

      // ASSERT: Report structure
      expect(reportContent).toBeTruthy();
      expect(reportContent.length).toBeGreaterThan(1000);

      // ASSERT: Executive Summary has actual counts
      expect(reportContent).toMatch(/47 documentation files/);
      expect(reportContent).toMatch(/5 unique concepts/);
      expect(reportContent).toMatch(/52 nodes/);
      expect(reportContent).toMatch(/120 edges/);

      // ASSERT: Content Types section shows actual distribution
      expect(reportContent).toMatch(/how-to.*15/i);
      expect(reportContent).toMatch(/concept.*10/i);
      expect(reportContent).toMatch(/reference.*8/i);
      expect(reportContent).toMatch(/tutorial.*5/i);
      expect(reportContent).toMatch(/troubleshooting.*4/i);
      expect(reportContent).toMatch(/quickstart.*3/i);
      expect(reportContent).toMatch(/unspecified.*2/i);

      // ASSERT: Top concepts listed with dynamic descriptions
      expect(reportContent).toContain('arbitrum');
      expect(reportContent).toContain('rollup');
      expect(reportContent).toContain('transaction');

      // Concept descriptions should mention metadata
      expect(reportContent).toMatch(/arbitrum.*Domain-specific/i);
      expect(reportContent).toMatch(/transaction.*Technical/i);

      // ASSERT: Directory distribution shows actual data
      expect(reportContent).toMatch(/guides.*15 document/i);
      expect(reportContent).toMatch(/concepts.*10 document/i);

      // ASSERT: Quality score matches
      expect(reportContent).toContain('78/100');
    });

    it('SHOULD handle minimal dataset (5 documents)', async () => {
      // ARRANGE: Minimal viable dataset
      const documents = new DocumentsMapBuilder()
        .addDocumentWithBuilder((b) => b.withPath('docs/a.mdx').withContentType('how-to'))
        .addDocumentWithBuilder((b) => b.withPath('docs/b.mdx').withContentType('concept'))
        .addDocumentWithBuilder((b) => b.withPath('docs/c.mdx').withContentType('reference'))
        .addDocumentWithBuilder((b) => b.withPath('docs/d.mdx').withContentType('how-to'))
        .addDocumentWithBuilder((b) => b.withPath('docs/e.mdx').withoutFrontmatter())
        .build();

      const conceptData = testData.createConcepts(['test', 'concept']);
      const analysis = testData.createAnalysis(5, 65);
      const graphStats = { totalNodes: 7, totalEdges: 10, density: 0.095, avgDegree: 2.86 };

      // ACT
      const reportPath = await generateIssueReport(
        analysis,
        conceptData,
        documents,
        graphStats,
        outputDir,
        inputDir,
        null,
        null,
      );

      const reportContent = await fs.readFile(reportPath, 'utf-8');

      // ASSERT: Should generate without errors
      expect(reportContent).toBeTruthy();

      // Should show correct counts
      expect(reportContent).toMatch(/5 documentation files/);
      expect(reportContent).toMatch(/2 unique concepts/);

      // Should handle content types correctly
      expect(reportContent).toMatch(/how-to.*2/i);
      expect(reportContent).toMatch(/concept.*1/i);
      expect(reportContent).toMatch(/reference.*1/i);
      expect(reportContent).toMatch(/unspecified.*1/i);
    });

    it('SHOULD handle large dataset (100+ documents)', async () => {
      // ARRANGE: Large dataset
      const documents = new DocumentsMapBuilder()
        .addMultiple(40, 'docs/guides', 'how-to')
        .addMultiple(30, 'docs/concepts', 'concept')
        .addMultiple(20, 'docs/reference', 'reference')
        .addMultiple(10, 'docs/tutorials', 'tutorial')
        .addMultiple(5, 'docs/misc', 'quickstart')
        .build();

      const conceptData = testData.createConcepts(['arbitrum', 'rollup', 'transaction']);
      const analysis = testData.createAnalysis(105, 82);
      const graphStats = { totalNodes: 108, totalEdges: 300, density: 0.026, avgDegree: 5.56 };

      // ACT
      const reportPath = await generateIssueReport(
        analysis,
        conceptData,
        documents,
        graphStats,
        outputDir,
        inputDir,
        null,
        null,
      );

      const reportContent = await fs.readFile(reportPath, 'utf-8');

      // ASSERT: Should handle large numbers
      expect(reportContent).toMatch(/105 documentation files/);
      expect(reportContent).toMatch(/108 nodes/);
      expect(reportContent).toMatch(/300 edges/);

      // Should show percentages for large counts
      expect(reportContent).toMatch(/how-to.*40.*38\.1%/i);
      expect(reportContent).toMatch(/concept.*30.*28\.6%/i);
    });
  });

  /**
   * INTEGRATION TEST 5: Error Scenarios
   *
   * This test verifies graceful handling of missing or invalid data.
   */
  describe('Error Scenarios and Edge Cases', () => {
    it('SHOULD handle missing concept data gracefully', async () => {
      // ARRANGE: Documents but no concepts
      const documents = testData.createDocuments(5, 'how-to');
      const emptyConcepts = new ConceptDataBuilder().build();
      const analysis = testData.createAnalysis(5, 60);
      const graphStats = { totalNodes: 5, totalEdges: 4, density: 0.2, avgDegree: 1.6 };

      // ACT
      const reportPath = await generateIssueReport(
        analysis,
        emptyConcepts,
        documents,
        graphStats,
        outputDir,
        inputDir,
        null,
        null,
      );

      const reportContent = await fs.readFile(reportPath, 'utf-8');

      // ASSERT: Should not crash
      expect(reportContent).toBeTruthy();
      expect(reportContent).toMatch(/0 unique concepts/);
    });

    it('SHOULD handle missing navigation data', async () => {
      // ARRANGE: Complete data except navigation
      const documents = testData.createDocuments(10);
      const conceptData = testData.createConcepts();
      const analysis = testData.createAnalysis(10, 70);
      analysis.navigation = { available: false };
      const graphStats = { totalNodes: 13, totalEdges: 20, density: 0.128, avgDegree: 3.08 };

      // ACT
      const reportPath = await generateIssueReport(
        analysis,
        conceptData,
        documents,
        graphStats,
        outputDir,
        inputDir,
        null,
        null,
      );

      const reportContent = await fs.readFile(reportPath, 'utf-8');

      // ASSERT: Should show navigation unavailable message
      expect(reportContent).toMatch(/Navigation.*unavailable/i);
    });

    it('SHOULD handle invalid configuration values', async () => {
      // ARRANGE: Invalid config
      const invalidConfig = {
        contentQuality: {
          shallowWordCount: -100, // Negative value
          lowConceptDensity: 'invalid', // Non-numeric
          highSimilarityThreshold: 1.5, // Out of range
        },
      };

      // ACT & ASSERT: Should throw validation error
      await expect(loadReportConfiguration(invalidConfig)).rejects.toThrow(/Threshold value/);
    });

    it('SHOULD reject negative threshold values', async () => {
      // ARRANGE
      const negativeConfig = {
        contentQuality: {
          shallowWordCount: -50,
          lowConceptDensity: 5,
          highSimilarityThreshold: 0.8,
        },
      };

      // ACT & ASSERT
      await expect(loadReportConfiguration(negativeConfig)).rejects.toThrow(/cannot be negative/i);
    });

    it('SHOULD reject non-numeric threshold values', async () => {
      // ARRANGE
      const nonNumericConfig = {
        structural: {
          minHubDocuments: 'three', // String instead of number
          oversizedDirMultiplier: 2,
        },
      };

      // ACT & ASSERT
      await expect(loadReportConfiguration(nonNumericConfig)).rejects.toThrow(/must be numeric/i);
    });

    it('SHOULD reject threshold percentages outside 0-1 range', async () => {
      // ARRANGE
      const outOfRangeConfig = {
        contentQuality: {
          shallowWordCount: 200,
          lowConceptDensity: 5,
          highSimilarityThreshold: 1.5, // Should be 0-1
        },
      };

      // ACT & ASSERT
      await expect(loadReportConfiguration(outOfRangeConfig)).rejects.toThrow(
        /must be in range 0-1/i,
      );
    });

    it('SHOULD handle empty documents map', async () => {
      // ARRANGE: Zero documents
      const emptyDocs = new Map();
      const emptyConcepts = new ConceptDataBuilder().build();
      const analysis = testData.createAnalysis(0, 0);
      const graphStats = { totalNodes: 0, totalEdges: 0, density: 0, avgDegree: 0 };

      // ACT
      const reportPath = await generateIssueReport(
        analysis,
        emptyConcepts,
        emptyDocs,
        graphStats,
        outputDir,
        inputDir,
        null,
        null,
      );

      const reportContent = await fs.readFile(reportPath, 'utf-8');

      // ASSERT: Should handle gracefully
      expect(reportContent).toBeTruthy();
      expect(reportContent).toMatch(/0 documentation files/);
      expect(reportContent).toMatch(/0 unique concepts/);
    });

    it('SHOULD handle special characters in document paths', async () => {
      // ARRANGE: Documents with special chars
      const documents = new DocumentsMapBuilder()
        .addDocumentWithBuilder((b) => b.withPath('docs/文档.mdx').withContentType('how-to'))
        .addDocumentWithBuilder((b) => b.withPath('docs/[test].mdx').withContentType('concept'))
        .addDocumentWithBuilder((b) =>
          b.withPath('docs/guide (v2).mdx').withContentType('reference'),
        )
        .build();

      const conceptData = testData.createConcepts();
      const analysis = testData.createAnalysis(3, 70);
      const graphStats = { totalNodes: 6, totalEdges: 5, density: 0.16, avgDegree: 1.67 };

      // ACT
      const reportPath = await generateIssueReport(
        analysis,
        conceptData,
        documents,
        graphStats,
        outputDir,
        inputDir,
        null,
        null,
      );

      const reportContent = await fs.readFile(reportPath, 'utf-8');

      // ASSERT: Should preserve special characters
      expect(reportContent).toContain('文档');
      expect(reportContent).toContain('[test]');
      expect(reportContent).toContain('(v2)');
    });
  });

  /**
   * INTEGRATION TEST 6: Report Consistency
   *
   * Verify reports are deterministic and reproducible.
   */
  describe('Report Consistency and Reproducibility', () => {
    it('SHOULD produce identical reports for identical input data', async () => {
      // ARRANGE: Fixed dataset
      const documents = testData.createDocuments(10, 'how-to');
      const conceptData = testData.createConcepts(['arbitrum', 'transaction']);
      const analysis = testData.createAnalysis(10, 75);
      const graphStats = { totalNodes: 12, totalEdges: 20, density: 0.15, avgDegree: 3.33 };

      // ACT: Generate two reports with same data
      const report1Path = await generateIssueReport(
        analysis,
        conceptData,
        documents,
        graphStats,
        outputDir,
        inputDir,
        null,
        null,
      );

      const report2Path = await generateIssueReport(
        analysis,
        conceptData,
        documents,
        graphStats,
        outputDir,
        inputDir,
        null,
        null,
      );

      const content1 = await fs.readFile(report1Path, 'utf-8');
      const content2 = await fs.readFile(report2Path, 'utf-8');

      // Normalize timestamps
      const normalize = (content) =>
        content.replace(/\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}/g, 'TIMESTAMP');

      // ASSERT: Content should be identical (except timestamps)
      expect(normalize(content1)).toBe(normalize(content2));
    });

    it('SHOULD generate different reports for different input data', async () => {
      // ARRANGE: Two different datasets
      const docs1 = testData.createDocuments(5, 'how-to');
      const docs2 = testData.createDocuments(10, 'concept');

      const concepts1 = testData.createConcepts(['test']);
      const concepts2 = testData.createConcepts(['arbitrum', 'rollup', 'transaction']);

      const analysis1 = testData.createAnalysis(5, 60);
      const analysis2 = testData.createAnalysis(10, 85);

      const stats1 = { totalNodes: 6, totalEdges: 5, density: 0.16, avgDegree: 1.67 };
      const stats2 = { totalNodes: 13, totalEdges: 25, density: 0.16, avgDegree: 3.85 };

      // ACT - Use different output directories to avoid timestamp collision
      const outputDir1 = path.join(outputDir, 'test1');
      const outputDir2 = path.join(outputDir, 'test2');
      await fs.ensureDir(outputDir1);
      await fs.ensureDir(outputDir2);

      const report1Path = await generateIssueReport(
        analysis1,
        concepts1,
        docs1,
        stats1,
        outputDir1,
        inputDir,
        null,
        null,
      );

      // Wait 1 second to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const report2Path = await generateIssueReport(
        analysis2,
        concepts2,
        docs2,
        stats2,
        outputDir2,
        inputDir,
        null,
        null,
      );

      const content1 = await fs.readFile(report1Path, 'utf-8');
      const content2 = await fs.readFile(report2Path, 'utf-8');

      // ASSERT: Reports should differ
      expect(content1).not.toBe(content2);
      expect(content1).toContain('5 documentation files');
      expect(content2).toContain('10 documentation files');
      expect(content1).toContain('60/100');
      expect(content2).toContain('85/100');
    });
  });
});
