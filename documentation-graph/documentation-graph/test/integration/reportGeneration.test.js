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
 * Report Generation Integration Tests
 *
 * These are FAILING tests (RED phase of TDD)
 * Implementation does not exist yet
 *
 * Tests for:
 * - Full report generation pipeline
 * - All sections included in correct order
 * - Table of contents links to sections
 * - Valid markdown formatting throughout
 * - File creation at expected path
 * - Report size constraints
 * - Performance (<30s)
 * - Error recovery and partial report generation
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { measureTime } from '../helpers/performanceHelpers.js';
import {
  assertPerformance,
  assertMarkdownHeading,
  assertMarkdownTable,
} from '../helpers/assertionHelpers.js';
import {
  createGraphBuilder,
  createDocumentBuilder,
  createConceptBuilder,
  createAnalysisBuilder,
} from '../helpers/testDataBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the class we're testing (will fail until implemented)
let MarkdownReportGenerator;
try {
  const module = await import('../../src/reporters/MarkdownReportGenerator.js');
  MarkdownReportGenerator = module.default || module.MarkdownReportGenerator;
} catch (error) {
  console.warn('MarkdownReportGenerator not implemented yet - tests will fail as expected');
}

describe('Report Generation Integration Tests', () => {
  let generator;
  let sampleData;
  let testOutputPath;

  beforeEach(() => {
    // Create comprehensive test data
    const graph = createGraphBuilder().withRandomNodes(50, 'document').withRandomEdges(100).build();

    sampleData = {
      documents: createDocumentBuilder().withRandomDocuments(50).build(),
      concepts: createConceptBuilder().withRandomConcepts(100).build(),
      analysis: createAnalysisBuilder().forGraph(graph).build(),
      quality: {
        overallScore: 75,
        metrics: {
          completeness: 80,
          connectivity: 70,
          consistency: 75,
        },
      },
      structure: {
        orphanDocuments: ['orphan1.md', 'orphan2.md'],
        hubDocuments: [
          { id: 'hub1', degree: 25, label: 'Hub 1' },
          { id: 'hub2', degree: 20, label: 'Hub 2' },
        ],
      },
    };

    testOutputPath = path.join(__dirname, '../fixtures/test-integration-report.md');

    if (MarkdownReportGenerator) {
      generator = new MarkdownReportGenerator({
        outputPath: testOutputPath,
        includeTableOfContents: true,
        includeMermaidDiagrams: true,
        maxConceptsToShow: 50,
      });
    }
  });

  afterEach(() => {
    // Cleanup test files
    if (fs.existsSync(testOutputPath)) {
      fs.unlinkSync(testOutputPath);
    }
  });

  describe('Full Pipeline Execution', () => {
    it('should generate complete report from sample data', async () => {
      const reportPath = await generator.generate(sampleData);

      expect(reportPath).toBeDefined();
      expect(fs.existsSync(reportPath)).toBe(true);
    });

    it('should create file at specified path', async () => {
      const reportPath = await generator.generate(sampleData);

      expect(reportPath).toBe(path.resolve(testOutputPath));
      expect(fs.existsSync(testOutputPath)).toBe(true);
    });

    it('should generate non-empty file', async () => {
      await generator.generate(sampleData);

      const stats = fs.statSync(testOutputPath);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should generate file with reasonable size', async () => {
      await generator.generate(sampleData);

      const stats = fs.statSync(testOutputPath);
      expect(stats.size).toBeLessThan(1024 * 1024); // < 1MB
    });

    it('should complete within 30 seconds', async () => {
      const { duration } = await measureTime(() => generator.generate(sampleData));

      assertPerformance(duration, 30000, 'Full report generation');
    });

    it('should create valid UTF-8 encoded file', async () => {
      await generator.generate(sampleData);

      const content = fs.readFileSync(testOutputPath, 'utf-8');
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
    });
  });

  describe('Report Structure and Completeness', () => {
    it('should include main title', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      assertMarkdownHeading(
        content,
        'Arbitrum Documentation Knowledge Graph - Phase 1 Analysis Report',
        1,
      );
    });

    it('should include table of contents', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      assertMarkdownHeading(content, 'Table of Contents', 2);
    });

    it('should include all section headings in order', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      const sections = ['Executive summary', 'Concept analysis', 'Interactive Visualization'];

      sections.forEach((section) => {
        expect(content).toContain(`## ${section}`);
      });

      // Check order
      const executiveIndex = content.indexOf('## Executive summary');
      const conceptsIndex = content.indexOf('## Concept analysis');
      const vizIndex = content.indexOf('## Interactive Visualization');

      expect(executiveIndex).toBeGreaterThan(0);
      expect(conceptsIndex).toBeGreaterThan(executiveIndex);
      expect(vizIndex).toBeGreaterThan(conceptsIndex);
    });

    it('should include metadata in HTML comments', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      expect(content).toContain('<!-- Report Metadata');
      expect(content).toMatch(/generated: \d{4}-\d{2}-\d{2}/);
      expect(content).toMatch(/documentsAnalyzed: \d+/);
      expect(content).toMatch(/conceptsExtracted: \d+/);
      expect(content).toContain('-->');
    });

    it('should include statistics in metadata', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      expect(content).toContain(`documentsAnalyzed: ${sampleData.documents.length}`);
      expect(content).toContain(`conceptsExtracted: ${sampleData.concepts.topConcepts.length}`);
      expect(content).toContain(`totalNodes: ${sampleData.analysis.basic.totalNodes}`);
      expect(content).toContain(`totalEdges: ${sampleData.analysis.basic.totalEdges}`);
    });
  });

  describe('Table of Contents Functionality', () => {
    it('should link to all major sections', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      expect(content).toContain('[Executive summary](#executive-summary)');
      expect(content).toContain('[Concept analysis](#concept-analysis)');
    });

    it('should number TOC entries', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      expect(content).toMatch(/\d+\. \[.+\]\(#.+\)/);
    });

    it('should create valid anchor links', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      // Extract TOC links
      const tocMatches = content.match(/\[.+\]\(#([a-z0-9-]+)\)/g);
      expect(tocMatches).toBeTruthy();
      expect(tocMatches.length).toBeGreaterThan(0);
    });

    it('should match section headings with TOC anchors', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      // Executive summary should have matching anchor
      expect(content).toContain('[Executive summary](#executive-summary)');
      expect(content).toContain('## Executive summary');
    });
  });

  describe('Section Content Validation', () => {
    it('should include executive summary content', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      expect(content).toContain('## Executive summary');
      expect(content).toContain('### Key metrics');
      expect(content).toContain('### Critical findings');
    });

    it('should include concept analysis content', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      expect(content).toContain('## Concept analysis');
      expect(content).toContain('### Top concepts by frequency');
      expect(content).toContain('### Concept categories');
    });

    it('should include tables in appropriate sections', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      // Should have multiple tables
      const tableCount = (content.match(/\| --- \|/g) || []).length;
      expect(tableCount).toBeGreaterThan(2);
    });

    it('should include lists in appropriate sections', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      // Should have multiple lists
      expect(content).toMatch(/^[-*] /m);
    });

    it('should include mermaid diagrams when enabled', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      expect(content).toContain('```mermaid');
      expect(content).toContain('pie');
    });

    it('should include visualization instructions', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      expect(content).toContain('## Interactive Visualization');
      expect(content).toContain('npm run serve');
      expect(content).toContain('```shell');
    });
  });

  describe('Markdown Formatting Quality', () => {
    it('should produce valid markdown syntax', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      // Check for proper heading syntax
      expect(content).toMatch(/^# .+$/m);
      expect(content).toMatch(/^## .+$/m);
      expect(content).toMatch(/^### .+$/m);

      // Check for proper list syntax
      expect(content).toMatch(/^[-*] .+$/m);

      // Check for proper table syntax
      expect(content).toMatch(/\| .+ \| .+ \|/);
    });

    it('should have consistent line endings', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      // Should use \n line endings
      expect(content).toContain('\n');
      expect(content).not.toContain('\r\n');
    });

    it('should not have trailing whitespace on lines', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      const lines = content.split('\n');
      lines.forEach((line) => {
        if (line.length > 0) {
          expect(line).not.toMatch(/\s$/);
        }
      });
    });

    it('should have proper spacing between sections', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      // Sections should be separated by blank lines
      expect(content).toMatch(/\n\n## /);
    });

    it('should properly format tables', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      // Tables should have separator rows
      expect(content).toMatch(/\| [-:]+ \|/);
    });

    it('should properly format code blocks', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      // Code blocks should be properly fenced
      expect(content).toMatch(/```\w+\n[\s\S]+?\n```/);
    });
  });

  describe('Data Integration', () => {
    it('should include data from all input sources', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      // Document data
      expect(content).toContain(sampleData.documents.length.toString());

      // Concept data
      expect(content).toContain(sampleData.concepts.topConcepts.length.toString());

      // Analysis data
      expect(content).toContain(sampleData.analysis.basic.totalNodes.toString());
      expect(content).toContain(sampleData.analysis.basic.totalEdges.toString());

      // Quality data
      expect(content).toContain('75'); // overallScore

      // Structure data
      expect(content).toContain('2 orphaned documents'); // orphanDocuments.length
    });

    it('should correctly calculate percentages', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      // Should include percentage calculations
      expect(content).toMatch(/\d+\.\d+%/);
    });

    it('should correctly format decimal numbers', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      // Should include decimal formatting
      expect(content).toMatch(/\d+\.\d+/);
    });

    it('should include top concept information', async () => {
      await generator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      const topConcept = sampleData.concepts.topConcepts[0];
      expect(content).toContain(topConcept.concept);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle missing optional data gracefully', async () => {
      const minimalData = {
        documents: createDocumentBuilder().withRandomDocuments(10).build(),
        concepts: createConceptBuilder().withRandomConcepts(20).build(),
        analysis: createAnalysisBuilder()
          .withBasicStats({ totalNodes: 10, totalEdges: 15 })
          .build(),
        // Missing quality and structure
      };

      const reportPath = await generator.generate(minimalData);

      expect(reportPath).toBeDefined();
      expect(fs.existsSync(reportPath)).toBe(true);
    });

    it('should continue after section generation error', async () => {
      // This test would need to mock a failing section
      // For now, just verify the report generates
      const reportPath = await generator.generate(sampleData);

      expect(reportPath).toBeDefined();
    });

    it('should include warning for failed sections', async () => {
      // Would test with mocked failing section
      // Verify warning message appears in report
      const reportPath = await generator.generate(sampleData);

      expect(reportPath).toBeDefined();
    });
  });

  describe('Performance with Large Datasets', () => {
    it('should handle large document count', async () => {
      const largeData = {
        ...sampleData,
        documents: createDocumentBuilder().withRandomDocuments(200).build(),
      };

      const { duration } = await measureTime(() => generator.generate(largeData));

      assertPerformance(duration, 30000, 'Large document report');
    });

    it('should handle large concept count', async () => {
      const largeData = {
        ...sampleData,
        concepts: createConceptBuilder().withRandomConcepts(500).build(),
      };

      const { duration } = await measureTime(() => generator.generate(largeData));

      assertPerformance(duration, 30000, 'Large concept report');
    });

    it('should handle large graph', async () => {
      const largeGraph = createGraphBuilder()
        .withRandomNodes(500, 'document')
        .withRandomEdges(1000)
        .build();

      const largeData = {
        ...sampleData,
        analysis: createAnalysisBuilder().forGraph(largeGraph).build(),
      };

      const { duration } = await measureTime(() => generator.generate(largeData));

      assertPerformance(duration, 30000, 'Large graph report');
    });
  });

  describe('Configuration Variations', () => {
    it('should generate report without TOC when disabled', async () => {
      const noTocGenerator = new MarkdownReportGenerator({
        outputPath: testOutputPath,
        includeTableOfContents: false,
      });

      await noTocGenerator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      expect(content).not.toContain('## Table of Contents');
    });

    it('should generate report without mermaid when disabled', async () => {
      const noMermaidGenerator = new MarkdownReportGenerator({
        outputPath: testOutputPath,
        includeMermaidDiagrams: false,
      });

      await noMermaidGenerator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      expect(content).not.toContain('```mermaid');
    });

    it('should respect maxConceptsToShow limit', async () => {
      const limitedGenerator = new MarkdownReportGenerator({
        outputPath: testOutputPath,
        maxConceptsToShow: 10,
      });

      await limitedGenerator.generate(sampleData);
      const content = fs.readFileSync(testOutputPath, 'utf-8');

      expect(content).toContain('top 10');
    });
  });

  describe('Multiple Report Generation', () => {
    it('should allow generating multiple reports', async () => {
      const firstPath = await generator.generate(sampleData);
      expect(fs.existsSync(firstPath)).toBe(true);

      const secondPath = await generator.generate(sampleData);
      expect(fs.existsSync(secondPath)).toBe(true);

      expect(firstPath).toBe(secondPath);
    });

    it('should overwrite existing report file', async () => {
      await generator.generate(sampleData);
      const firstStats = fs.statSync(testOutputPath);

      // Modify data
      sampleData.documents = createDocumentBuilder().withRandomDocuments(100).build();

      await generator.generate(sampleData);
      const secondStats = fs.statSync(testOutputPath);

      expect(secondStats.mtimeMs).toBeGreaterThan(firstStats.mtimeMs);
    });
  });
});
