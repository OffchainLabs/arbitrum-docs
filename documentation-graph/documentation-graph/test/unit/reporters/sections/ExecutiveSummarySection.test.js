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
 * ExecutiveSummarySection Unit Tests
 *
 * These are FAILING tests (RED phase of TDD)
 * Implementation does not exist yet
 *
 * Tests for:
 * - Section title
 * - High-level overview paragraph generation
 * - Key metrics dashboard table
 * - Critical findings list
 * - Data extraction from analysis results
 * - Builder integration
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  createGraphBuilder,
  createDocumentBuilder,
  createConceptBuilder,
  createAnalysisBuilder,
} from '../../../helpers/testDataBuilder.js';

// Import the class we're testing (will fail until implemented)
let ExecutiveSummarySection;
let ReportBuilder;
try {
  const sectionModule = await import(
    '../../../../src/reporters/sections/ExecutiveSummarySection.js'
  );
  ExecutiveSummarySection = sectionModule.default || sectionModule.ExecutiveSummarySection;

  const builderModule = await import('../../../../src/reporters/ReportBuilder.js');
  ReportBuilder = builderModule.default || builderModule.ReportBuilder;
} catch (error) {
  console.warn('ExecutiveSummarySection not implemented yet - tests will fail as expected');
}

describe('ExecutiveSummarySection', () => {
  let section;
  let builder;
  let sampleData;

  beforeEach(() => {
    const graph = createGraphBuilder().withRandomNodes(20, 'document').withRandomEdges(30).build();

    sampleData = {
      documents: createDocumentBuilder().withRandomDocuments(20).build(),
      concepts: createConceptBuilder().withRandomConcepts(50).build(),
      analysis: createAnalysisBuilder().forGraph(graph).build(),
      quality: { overallScore: 75 },
      structure: { orphanDocuments: [] },
    };

    if (ExecutiveSummarySection) {
      section = new ExecutiveSummarySection({ maxConceptsToShow: 50 });
    }

    if (ReportBuilder) {
      builder = new ReportBuilder();
    }
  });

  describe('Section Configuration', () => {
    it('should create section instance', () => {
      expect(section).toBeDefined();
      expect(section).toBeInstanceOf(ExecutiveSummarySection);
    });

    it('should accept configuration in constructor', () => {
      const customSection = new ExecutiveSummarySection({ custom: 'config' });

      expect(customSection.config).toBeDefined();
      expect(customSection.config.custom).toBe('config');
    });

    it('should return correct section title', () => {
      const title = section.getTitle();

      expect(title).toBe('Executive summary');
    });
  });

  describe('Section Generation', () => {
    it('should implement generate method', () => {
      expect(section.generate).toBeDefined();
      expect(typeof section.generate).toBe('function');
    });

    it('should be async function', async () => {
      const result = section.generate(sampleData, builder);

      expect(result).toBeInstanceOf(Promise);
    });

    it('should return builder for chaining', async () => {
      const result = await section.generate(sampleData, builder);

      expect(result).toBe(builder);
    });

    it('should add section heading', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('## Executive summary');
    });

    it('should add high-level overview paragraph', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('This report presents a comprehensive analysis');
      expect(markdown).toContain('documentation repository');
    });

    it('should include document count in overview', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain(sampleData.documents.length.toString());
    });

    it('should include concept count in overview', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain(sampleData.concepts.topConcepts.length.toString());
    });

    it('should include node count in overview', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain(sampleData.analysis.basic.totalNodes.toString());
    });

    it('should include edge count in overview', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain(sampleData.analysis.basic.totalEdges.toString());
    });
  });

  describe('Key Metrics Dashboard', () => {
    it('should add key metrics subheading', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('### Key metrics');
    });

    it('should add metrics table', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('| Metric | Value | Details |');
      expect(markdown).toContain('|');
    });

    it('should include total documents metric', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('Total documents');
      expect(markdown).toContain(sampleData.documents.length.toString());
    });

    it('should include unique concepts metric', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('Unique concepts');
      expect(markdown).toContain(sampleData.concepts.topConcepts.length.toString());
    });

    it('should include graph nodes metric', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('Graph nodes');
      expect(markdown).toContain(sampleData.analysis.basic.totalNodes.toString());
    });

    it('should include graph edges metric', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('Graph edges');
      expect(markdown).toContain(sampleData.analysis.basic.totalEdges.toString());
    });

    it('should include graph density metric', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('Graph density');
      expect(markdown).toMatch(/\d+\.\d+%/); // Percentage format
    });

    it('should include average connections metric', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('Avg connections');
    });

    it('should format density as percentage', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      const densityPercent = (sampleData.analysis.basic.density * 100).toFixed(2);
      expect(markdown).toContain(densityPercent);
    });

    it('should format average degree to 2 decimals', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      const avgDegree = sampleData.analysis.basic.avgDegree.toFixed(2);
      expect(markdown).toContain(avgDegree);
    });
  });

  describe('Critical Findings', () => {
    it('should add critical findings subheading', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('### Critical findings');
    });

    it('should add findings list', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toMatch(/^[-*] /m);
    });

    it('should extract top concept finding', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      const topConcept = sampleData.concepts.topConcepts[0];
      expect(markdown).toContain(topConcept.concept);
      expect(markdown).toContain('most mentioned concept');
    });

    it('should include concept frequency in finding', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      const topConcept = sampleData.concepts.topConcepts[0];
      expect(markdown).toContain(topConcept.frequency.toFixed(0));
      expect(markdown).toContain('occurrences');
    });

    it('should include concept file count', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      const topConcept = sampleData.concepts.topConcepts[0];
      expect(markdown).toContain(topConcept.fileCount.toString());
      expect(markdown).toContain('files');
    });

    it('should report orphaned documents if present', async () => {
      sampleData.structure.orphanDocuments = ['doc1.md', 'doc2.md'];

      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('2 orphaned documents');
      expect(markdown).toContain('requiring integration');
    });

    it('should report connected graph', async () => {
      sampleData.analysis.basic.isConnected = true;

      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('fully connected knowledge graph');
    });

    it('should report disconnected components', async () => {
      sampleData.analysis.basic.isConnected = false;

      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('disconnected components');
      expect(markdown).toContain('requiring linking');
    });

    it('should include quality score if available', async () => {
      sampleData.quality = { overallScore: 85 };

      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('Overall quality score');
      expect(markdown).toContain('85/100');
    });
  });

  describe('Data Extraction', () => {
    it('should implement extractCriticalFindings method', () => {
      expect(section.extractCriticalFindings).toBeDefined();
      expect(typeof section.extractCriticalFindings).toBe('function');
    });

    it('should return array of findings', () => {
      const findings = section.extractCriticalFindings(sampleData);

      expect(Array.isArray(findings)).toBe(true);
      expect(findings.length).toBeGreaterThan(0);
    });

    it('should extract findings from valid data', () => {
      const findings = section.extractCriticalFindings(sampleData);

      expect(findings.length).toBeGreaterThan(0);
      findings.forEach((finding) => {
        expect(typeof finding).toBe('string');
        expect(finding.length).toBeGreaterThan(0);
      });
    });

    it('should handle missing top concepts gracefully', () => {
      const dataWithoutConcepts = {
        ...sampleData,
        concepts: { topConcepts: [] },
      };

      const findings = section.extractCriticalFindings(dataWithoutConcepts);

      expect(Array.isArray(findings)).toBe(true);
    });

    it('should handle missing quality data gracefully', () => {
      const dataWithoutQuality = { ...sampleData };
      delete dataWithoutQuality.quality;

      const findings = section.extractCriticalFindings(dataWithoutQuality);

      expect(Array.isArray(findings)).toBe(true);
    });

    it('should handle missing structure data gracefully', () => {
      const dataWithoutStructure = { ...sampleData };
      delete dataWithoutStructure.structure;

      const findings = section.extractCriticalFindings(dataWithoutStructure);

      expect(Array.isArray(findings)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty concepts array', async () => {
      sampleData.concepts.topConcepts = [];

      await expect(section.generate(sampleData, builder)).resolves.not.toThrow();
    });

    it('should handle zero document count', async () => {
      sampleData.documents = [];

      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('0');
    });

    it('should handle undefined quality score', async () => {
      delete sampleData.quality;

      await expect(section.generate(sampleData, builder)).resolves.not.toThrow();
    });

    it('should handle undefined structure', async () => {
      delete sampleData.structure;

      await expect(section.generate(sampleData, builder)).resolves.not.toThrow();
    });

    it('should handle very large numbers', async () => {
      sampleData.analysis.basic.totalNodes = 1000000;
      sampleData.analysis.basic.totalEdges = 5000000;

      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('1000000');
      expect(markdown).toContain('5000000');
    });

    it('should handle zero density', async () => {
      sampleData.analysis.basic.density = 0;

      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('0.00%');
    });

    it('should handle missing analysis data', async () => {
      sampleData.analysis.basic = {};

      await expect(section.generate(sampleData, builder)).resolves.not.toThrow();
    });
  });
});
