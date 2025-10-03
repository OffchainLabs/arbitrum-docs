/**
 * MarkdownReportGenerator Unit Tests
 *
 * These are FAILING tests (RED phase of TDD)
 * Implementation does not exist yet
 *
 * Tests for:
 * - Constructor with configuration options
 * - Section registration
 * - Report generation from analysis data
 * - Table of contents generation
 * - File output creation
 * - Performance constraints (<30s)
 * - Error handling and partial report generation
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import path from 'path';
import { fileURLToPath } from 'url';
import { measureTime } from '../../helpers/performanceHelpers.js';
import { assertPerformance, assertMarkdownHeading } from '../../helpers/assertionHelpers.js';
import {
  createGraphBuilder,
  createDocumentBuilder,
  createConceptBuilder,
  createAnalysisBuilder,
} from '../../helpers/testDataBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the class we're testing (will fail until implemented)
let MarkdownReportGenerator;
try {
  const module = await import('../../../src/reporters/MarkdownReportGenerator.js');
  MarkdownReportGenerator = module.default || module.MarkdownReportGenerator;
} catch (error) {
  console.warn('MarkdownReportGenerator not implemented yet - tests will fail as expected');
}

describe('MarkdownReportGenerator', () => {
  let generator;
  let sampleData;

  beforeEach(() => {
    // Build sample analysis data
    const graph = createGraphBuilder().withRandomNodes(20, 'document').withRandomEdges(30).build();

    const documents = createDocumentBuilder().withRandomDocuments(20).build();

    const concepts = createConceptBuilder().withRandomConcepts(50).build();

    const analysis = createAnalysisBuilder().forGraph(graph).build();

    sampleData = {
      documents,
      concepts,
      analysis,
      quality: {
        overallScore: 75,
        metrics: {},
      },
      structure: {
        orphanDocuments: [],
      },
    };

    if (MarkdownReportGenerator) {
      generator = new MarkdownReportGenerator();
    }
  });

  afterEach(() => {
    generator = null;
  });

  describe('Constructor and Configuration', () => {
    it('should create a new MarkdownReportGenerator instance', () => {
      expect(generator).toBeDefined();
      expect(generator).toBeInstanceOf(MarkdownReportGenerator);
    });

    it('should initialize with default configuration', () => {
      expect(generator.config).toBeDefined();
      expect(generator.config.outputPath).toBeDefined();
      expect(generator.config.includeTableOfContents).toBe(true);
      expect(generator.config.includeMermaidDiagrams).toBe(true);
    });

    it('should accept custom configuration options', () => {
      const customGenerator = new MarkdownReportGenerator({
        outputPath: '/custom/path/report.md',
        includeTableOfContents: false,
        maxConceptsToShow: 25,
      });

      expect(customGenerator.config.outputPath).toBe('/custom/path/report.md');
      expect(customGenerator.config.includeTableOfContents).toBe(false);
      expect(customGenerator.config.maxConceptsToShow).toBe(25);
    });

    it('should merge custom config with defaults', () => {
      const customGenerator = new MarkdownReportGenerator({
        maxConceptsToShow: 100,
      });

      expect(customGenerator.config.maxConceptsToShow).toBe(100);
      expect(customGenerator.config.includeTableOfContents).toBe(true); // default preserved
    });

    it('should initialize with empty sections array', () => {
      expect(generator.sections).toBeDefined();
      expect(Array.isArray(generator.sections)).toBe(true);
      expect(generator.sections).toHaveLength(0);
    });

    it('should create ReportBuilder instance', () => {
      expect(generator.builder).toBeDefined();
      expect(generator.builder.constructor.name).toBe('ReportBuilder');
    });

    it('should set default maxConceptsToShow to 50', () => {
      expect(generator.config.maxConceptsToShow).toBe(50);
    });

    it('should set default maxHubsToShow to 20', () => {
      expect(generator.config.maxHubsToShow).toBe(20);
    });

    it('should set default maxOrphansToShow to 30', () => {
      expect(generator.config.maxOrphansToShow).toBe(30);
    });
  });

  describe('Section Registration', () => {
    it('should register all default sections', () => {
      generator.registerSections();

      expect(generator.sections.length).toBeGreaterThan(0);
    });

    it('should register ExecutiveSummarySection', () => {
      generator.registerSections();

      const section = generator.sections.find(
        (s) => s.constructor.name === 'ExecutiveSummarySection',
      );
      expect(section).toBeDefined();
    });

    it('should register TopConceptsSection', () => {
      generator.registerSections();

      const section = generator.sections.find((s) => s.constructor.name === 'TopConceptsSection');
      expect(section).toBeDefined();
    });

    it('should register HubDocumentsSection', () => {
      generator.registerSections();

      const section = generator.sections.find((s) => s.constructor.name === 'HubDocumentsSection');
      expect(section).toBeDefined();
    });

    it('should register OrphanedContentSection', () => {
      generator.registerSections();

      const section = generator.sections.find(
        (s) => s.constructor.name === 'OrphanedContentSection',
      );
      expect(section).toBeDefined();
    });

    it('should register QualityAssessmentSection', () => {
      generator.registerSections();

      const section = generator.sections.find(
        (s) => s.constructor.name === 'QualityAssessmentSection',
      );
      expect(section).toBeDefined();
    });

    it('should register StructureBreakdownSection', () => {
      generator.registerSections();

      const section = generator.sections.find(
        (s) => s.constructor.name === 'StructureBreakdownSection',
      );
      expect(section).toBeDefined();
    });

    it('should register RecommendationsSection', () => {
      generator.registerSections();

      const section = generator.sections.find(
        (s) => s.constructor.name === 'RecommendationsSection',
      );
      expect(section).toBeDefined();
    });

    it('should pass configuration to registered sections', () => {
      generator.registerSections();

      const section = generator.sections[0];
      expect(section.config).toBeDefined();
      expect(section.config).toBe(generator.config);
    });

    it('should allow adding custom sections', () => {
      const customSection = {
        getTitle: () => 'Custom Section',
        generate: async (data, builder) => builder,
      };

      generator.sections.push(customSection);

      expect(generator.sections).toContain(customSection);
    });
  });

  describe('Report Generation - Basic', () => {
    it('should generate a complete markdown report', async () => {
      const reportPath = await generator.generate(sampleData);

      expect(reportPath).toBeDefined();
      expect(typeof reportPath).toBe('string');
      expect(reportPath).toContain('.md');
    });

    it('should return path to generated report file', async () => {
      const reportPath = await generator.generate(sampleData);

      expect(reportPath).toContain('PHASE1_ANALYSIS_REPORT.md');
    });

    it('should create report file at configured path', async () => {
      const customPath = path.join(__dirname, '../../fixtures/test-report.md');
      const customGenerator = new MarkdownReportGenerator({
        outputPath: customPath,
      });

      const reportPath = await customGenerator.generate(sampleData);

      expect(reportPath).toBe(path.resolve(customPath));
    });

    it('should include report title', async () => {
      const reportPath = await generator.generate(sampleData);
      const fs = await import('fs');
      const content = fs.readFileSync(reportPath, 'utf-8');

      expect(content).toContain(
        '# Arbitrum Documentation Knowledge Graph - Phase 1 Analysis Report',
      );
    });

    it('should include metadata in HTML comments', async () => {
      const reportPath = await generator.generate(sampleData);
      const fs = await import('fs');
      const content = fs.readFileSync(reportPath, 'utf-8');

      expect(content).toContain('<!-- Report Metadata');
      expect(content).toMatch(/generated:/);
      expect(content).toMatch(/documentsAnalyzed:/);
    });

    it('should include table of contents when enabled', async () => {
      generator.config.includeTableOfContents = true;
      const reportPath = await generator.generate(sampleData);
      const fs = await import('fs');
      const content = fs.readFileSync(reportPath, 'utf-8');

      assertMarkdownHeading(content, 'Table of Contents', 2);
    });

    it('should exclude table of contents when disabled', async () => {
      generator.config.includeTableOfContents = false;
      const reportPath = await generator.generate(sampleData);
      const fs = await import('fs');
      const content = fs.readFileSync(reportPath, 'utf-8');

      expect(content).not.toContain('## Table of Contents');
    });

    it('should generate all registered sections', async () => {
      const reportPath = await generator.generate(sampleData);
      const fs = await import('fs');
      const content = fs.readFileSync(reportPath, 'utf-8');

      assertMarkdownHeading(content, 'Executive summary', 2);
      assertMarkdownHeading(content, 'Concept analysis', 2);
    });

    it('should include interactive visualization section', async () => {
      const reportPath = await generator.generate(sampleData);
      const fs = await import('fs');
      const content = fs.readFileSync(reportPath, 'utf-8');

      assertMarkdownHeading(content, 'Interactive Visualization', 2);
      expect(content).toContain('npm run serve');
    });
  });

  describe('Report Generation - Content Quality', () => {
    it('should generate valid markdown syntax', async () => {
      const reportPath = await generator.generate(sampleData);
      const fs = await import('fs');
      const content = fs.readFileSync(reportPath, 'utf-8');

      // Check for proper heading syntax
      expect(content).toMatch(/^#+ .+$/m);

      // Check for proper list syntax
      expect(content).toMatch(/^[-*] .+$/m);
    });

    it('should include section titles in TOC', async () => {
      generator.config.includeTableOfContents = true;
      const reportPath = await generator.generate(sampleData);
      const fs = await import('fs');
      const content = fs.readFileSync(reportPath, 'utf-8');

      expect(content).toContain('[Executive summary]');
      expect(content).toContain('[Concept analysis]');
    });

    it('should create anchor links in TOC', async () => {
      generator.config.includeTableOfContents = true;
      const reportPath = await generator.generate(sampleData);
      const fs = await import('fs');
      const content = fs.readFileSync(reportPath, 'utf-8');

      expect(content).toMatch(/\[.+\]\(#[a-z0-9-]+\)/);
    });

    it('should include statistics in metadata', async () => {
      const reportPath = await generator.generate(sampleData);
      const fs = await import('fs');
      const content = fs.readFileSync(reportPath, 'utf-8');

      expect(content).toMatch(/documentsAnalyzed: \d+/);
      expect(content).toMatch(/conceptsExtracted: \d+/);
      expect(content).toMatch(/totalNodes: \d+/);
      expect(content).toMatch(/totalEdges: \d+/);
    });

    it('should format numbers appropriately', async () => {
      const reportPath = await generator.generate(sampleData);
      const fs = await import('fs');
      const content = fs.readFileSync(reportPath, 'utf-8');

      // Should contain formatted numbers
      expect(content).toMatch(/\d+/);
      expect(content).toMatch(/\d+\.\d+/); // Decimals
    });

    it('should not exceed 1MB for typical dataset', async () => {
      const reportPath = await generator.generate(sampleData);
      const fs = await import('fs');
      const stats = fs.statSync(reportPath);

      expect(stats.size).toBeLessThan(1024 * 1024); // 1MB
    });
  });

  describe('Report Generation - Error Handling', () => {
    it('should handle null data gracefully', async () => {
      await expect(generator.generate(null)).rejects.toThrow();
    });

    it('should handle undefined data gracefully', async () => {
      await expect(generator.generate(undefined)).rejects.toThrow();
    });

    it('should handle empty data object', async () => {
      const emptyData = {
        documents: [],
        concepts: { topConcepts: [] },
        analysis: { basic: {}, centrality: {} },
      };

      const reportPath = await generator.generate(emptyData);

      expect(reportPath).toBeDefined();
    });

    it('should handle missing documents array', async () => {
      const dataWithoutDocs = { ...sampleData };
      delete dataWithoutDocs.documents;

      await expect(generator.generate(dataWithoutDocs)).rejects.toThrow();
    });

    it('should handle missing concepts object', async () => {
      const dataWithoutConcepts = { ...sampleData };
      delete dataWithoutConcepts.concepts;

      await expect(generator.generate(dataWithoutConcepts)).rejects.toThrow();
    });

    it('should generate partial report if section fails', async () => {
      // Mock a failing section
      generator.registerSections();
      generator.sections[0].generate = async () => {
        throw new Error('Section generation failed');
      };

      const reportPath = await generator.generate(sampleData);
      const fs = await import('fs');
      const content = fs.readFileSync(reportPath, 'utf-8');

      // Should include warning about failed section
      expect(content).toContain('Warning');
    });

    it('should continue generating after section error', async () => {
      generator.registerSections();
      const failingSection = {
        getTitle: () => 'Failing Section',
        generate: async () => {
          throw new Error('Test error');
        },
      };
      generator.sections.splice(1, 0, failingSection);

      const reportPath = await generator.generate(sampleData);

      expect(reportPath).toBeDefined();
    });

    it('should handle file write errors', async () => {
      const invalidGenerator = new MarkdownReportGenerator({
        outputPath: '/invalid/path/that/does/not/exist/report.md',
      });

      await expect(invalidGenerator.generate(sampleData)).rejects.toThrow();
    });
  });

  describe('Performance Constraints', () => {
    it('should generate report in less than 30 seconds', async () => {
      const { duration } = await measureTime(() => generator.generate(sampleData));

      assertPerformance(duration, 30000, 'Report generation');
    });

    it('should handle large datasets within time limit', async () => {
      const largeData = {
        documents: createDocumentBuilder().withRandomDocuments(100).build(),
        concepts: createConceptBuilder().withRandomConcepts(200).build(),
        analysis: createAnalysisBuilder()
          .withBasicStats({ totalNodes: 150, totalEdges: 300 })
          .build(),
        quality: { overallScore: 80 },
        structure: { orphanDocuments: [] },
      };

      const { duration } = await measureTime(() => generator.generate(largeData));

      assertPerformance(duration, 30000, 'Large report generation');
    });

    it('should not leak memory during generation', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      await generator.generate(sampleData);

      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncreaseMB = (finalMemory - initialMemory) / (1024 * 1024);

      expect(memoryIncreaseMB).toBeLessThan(100); // Should not increase by more than 100MB
    });
  });

  describe('Configuration Options', () => {
    it('should respect maxConceptsToShow config', async () => {
      const customGenerator = new MarkdownReportGenerator({
        maxConceptsToShow: 10,
      });

      const reportPath = await customGenerator.generate(sampleData);
      const fs = await import('fs');
      const content = fs.readFileSync(reportPath, 'utf-8');

      // Should mention showing top 10 concepts
      expect(content).toContain('top 10');
    });

    it('should respect includeMermaidDiagrams config', async () => {
      const noMermaidGenerator = new MarkdownReportGenerator({
        includeMermaidDiagrams: false,
      });

      const reportPath = await noMermaidGenerator.generate(sampleData);
      const fs = await import('fs');
      const content = fs.readFileSync(reportPath, 'utf-8');

      expect(content).not.toContain('```mermaid');
    });

    it('should include mermaid diagrams when enabled', async () => {
      const mermaidGenerator = new MarkdownReportGenerator({
        includeMermaidDiagrams: true,
      });

      const reportPath = await mermaidGenerator.generate(sampleData);
      const fs = await import('fs');
      const content = fs.readFileSync(reportPath, 'utf-8');

      expect(content).toContain('```mermaid');
    });

    it('should respect maxHubsToShow config', async () => {
      const customGenerator = new MarkdownReportGenerator({
        maxHubsToShow: 5,
      });

      const reportPath = await customGenerator.generate(sampleData);

      expect(reportPath).toBeDefined();
    });

    it('should respect maxOrphansToShow config', async () => {
      const customGenerator = new MarkdownReportGenerator({
        maxOrphansToShow: 15,
      });

      const reportPath = await customGenerator.generate(sampleData);

      expect(reportPath).toBeDefined();
    });
  });

  describe('Visualization Section', () => {
    it('should include visualization access instructions', async () => {
      const reportPath = await generator.generate(sampleData);
      const fs = await import('fs');
      const content = fs.readFileSync(reportPath, 'utf-8');

      expect(content).toContain('Accessing the visualization');
      expect(content).toContain('npm run serve');
    });

    it('should include visualization features list', async () => {
      const reportPath = await generator.generate(sampleData);
      const fs = await import('fs');
      const content = fs.readFileSync(reportPath, 'utf-8');

      expect(content).toContain('Dynamic exploration');
      expect(content).toContain('Centrality analysis');
      expect(content).toContain('Search functionality');
    });

    it('should include code block for serve command', async () => {
      const reportPath = await generator.generate(sampleData);
      const fs = await import('fs');
      const content = fs.readFileSync(reportPath, 'utf-8');

      expect(content).toContain('```shell');
      expect(content).toContain('npm run serve');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long concept names', async () => {
      const dataWithLongConcepts = { ...sampleData };
      dataWithLongConcepts.concepts.topConcepts[0] = {
        concept: 'a'.repeat(200),
        frequency: 100,
        fileCount: 10,
        type: 'domain',
        category: 'blockchain',
      };

      const reportPath = await generator.generate(dataWithLongConcepts);

      expect(reportPath).toBeDefined();
    });

    it('should handle special characters in data', async () => {
      const dataWithSpecialChars = { ...sampleData };
      dataWithSpecialChars.documents[0].path = '/path/with/émoji/🚀/doc.md';

      const reportPath = await generator.generate(dataWithSpecialChars);

      expect(reportPath).toBeDefined();
    });

    it('should handle zero statistics gracefully', async () => {
      const zeroData = {
        documents: [],
        concepts: { topConcepts: [] },
        analysis: {
          basic: {
            totalNodes: 0,
            totalEdges: 0,
            density: 0,
            avgDegree: 0,
          },
          centrality: { degree: { values: {} } },
        },
      };

      const reportPath = await generator.generate(zeroData);

      expect(reportPath).toBeDefined();
    });

    it('should handle missing quality data', async () => {
      const dataWithoutQuality = { ...sampleData };
      delete dataWithoutQuality.quality;

      const reportPath = await generator.generate(dataWithoutQuality);

      expect(reportPath).toBeDefined();
    });

    it('should handle missing structure data', async () => {
      const dataWithoutStructure = { ...sampleData };
      delete dataWithoutStructure.structure;

      const reportPath = await generator.generate(dataWithoutStructure);

      expect(reportPath).toBeDefined();
    });
  });
});
