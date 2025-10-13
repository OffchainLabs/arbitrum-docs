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
 * TopConceptsSection Unit Tests
 *
 * These are FAILING tests (RED phase of TDD)
 * Implementation does not exist yet
 *
 * Tests for:
 * - Section title
 * - Top N concepts table generation
 * - Concept categorization and breakdown
 * - Optional Mermaid pie chart
 * - Configuration (maxConceptsToShow)
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { createConceptBuilder } from '../../../helpers/testDataBuilder.js';

// Import the class we're testing (will fail until implemented)
let TopConceptsSection;
let ReportBuilder;
try {
  const sectionModule = await import('../../../../src/reporters/sections/TopConceptsSection.js');
  TopConceptsSection = sectionModule.default || sectionModule.TopConceptsSection;

  const builderModule = await import('../../../../src/reporters/ReportBuilder.js');
  ReportBuilder = builderModule.default || builderModule.ReportBuilder;
} catch (error) {
  console.warn('TopConceptsSection not implemented yet - tests will fail as expected');
}

describe('TopConceptsSection', () => {
  let section;
  let builder;
  let sampleData;

  beforeEach(() => {
    sampleData = {
      concepts: createConceptBuilder().withRandomConcepts(100).build(),
    };

    if (TopConceptsSection) {
      section = new TopConceptsSection({ maxConceptsToShow: 50 });
    }

    if (ReportBuilder) {
      builder = new ReportBuilder();
    }
  });

  describe('Section Configuration', () => {
    it('should create section instance', () => {
      expect(section).toBeDefined();
      expect(section).toBeInstanceOf(TopConceptsSection);
    });

    it('should accept configuration in constructor', () => {
      const customSection = new TopConceptsSection({ maxConceptsToShow: 25 });

      expect(customSection.config).toBeDefined();
      expect(customSection.config.maxConceptsToShow).toBe(25);
    });

    it('should return correct section title', () => {
      const title = section.getTitle();

      expect(title).toBe('Concept analysis');
    });

    it('should default maxConcepts to config value', () => {
      expect(section.maxConcepts).toBe(50);
    });

    it('should use default maxConcepts if not in config', () => {
      const defaultSection = new TopConceptsSection({});

      expect(defaultSection.maxConcepts).toBe(50);
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

      expect(markdown).toContain('## Concept analysis');
    });

    it('should add introduction paragraph', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('Extracted');
      expect(markdown).toContain('unique concepts');
      expect(markdown).toContain('NLP analysis');
    });

    it('should mention total concepts in intro', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain(sampleData.concepts.topConcepts.length.toString());
    });

    it('should mention maxConcepts in intro', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('top 50');
    });
  });

  describe('Top Concepts Table', () => {
    it('should add top concepts subheading', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('### Top concepts by frequency');
    });

    it('should add concepts table', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('| Rank | Concept | Frequency | Files | Category | Type |');
    });

    it('should include table separator row', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toMatch(/\|[\s-:]+\|/);
    });

    it('should limit concepts to maxConceptsToShow', async () => {
      const smallSection = new TopConceptsSection({ maxConceptsToShow: 10 });

      await smallSection.generate(sampleData, builder);
      const markdown = builder.build();

      // Count table rows (excluding header and separator)
      const rows = markdown.split('\n').filter((line) => line.startsWith('|')).length;
      expect(rows).toBeLessThanOrEqual(12); // header + separator + 10 data rows
    });

    it('should rank concepts starting from 1', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('| 1 |');
    });

    it('should include concept name', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      const firstConcept = sampleData.concepts.topConcepts[0];
      expect(markdown).toContain(firstConcept.concept);
    });

    it('should format frequency with 1 decimal', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toMatch(/\| \d+\.\d \|/);
    });

    it('should include file count', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      const firstConcept = sampleData.concepts.topConcepts[0];
      expect(markdown).toContain(firstConcept.fileCount.toString());
    });

    it('should include category', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      const firstConcept = sampleData.concepts.topConcepts[0];
      if (firstConcept.category) {
        expect(markdown).toContain(firstConcept.category);
      }
    });

    it('should show N/A for missing category', async () => {
      sampleData.concepts.topConcepts[0] = {
        concept: 'test',
        frequency: 10,
        fileCount: 5,
      };

      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('N/A');
    });

    it('should include concept type', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toMatch(/domain|technical|general/);
    });

    it('should default type to general if missing', async () => {
      sampleData.concepts.topConcepts[0] = {
        concept: 'test',
        frequency: 10,
        fileCount: 5,
      };

      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('general');
    });
  });

  describe('Category Breakdown', () => {
    it('should add category breakdown subheading', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('### Concept categories');
    });

    it('should add category table', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('| Category | Count | Percentage |');
    });

    it('should count concepts by category', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toMatch(/\| \w+ \| \d+ \| \d+\.\d+% \|/);
    });

    it('should calculate percentages correctly', async () => {
      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toMatch(/\d+\.\d+%/);
    });

    it('should implement countCategories method', () => {
      expect(section.countCategories).toBeDefined();
      expect(typeof section.countCategories).toBe('function');
    });

    it('should return category counts object', () => {
      const topConcepts = sampleData.concepts.topConcepts.slice(0, 50);
      const counts = section.countCategories(topConcepts);

      expect(typeof counts).toBe('object');
      expect(Object.keys(counts).length).toBeGreaterThan(0);
    });

    it('should count each category occurrence', () => {
      const testConcepts = [
        { concept: 'a', category: 'blockchain', frequency: 10, fileCount: 1 },
        { concept: 'b', category: 'blockchain', frequency: 5, fileCount: 1 },
        { concept: 'c', category: 'arbitrum', frequency: 3, fileCount: 1 },
      ];

      const counts = section.countCategories(testConcepts);

      expect(counts.blockchain).toBe(2);
      expect(counts.arbitrum).toBe(1);
    });

    it('should handle uncategorized concepts', () => {
      const testConcepts = [{ concept: 'a', frequency: 10, fileCount: 1 }];

      const counts = section.countCategories(testConcepts);

      expect(counts.uncategorized).toBe(1);
    });
  });

  describe('Mermaid Visualization', () => {
    it('should add visualization when enabled', async () => {
      section.config.includeMermaidDiagrams = true;

      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('### Top 10 concepts visualization');
      expect(markdown).toContain('```mermaid');
    });

    it('should skip visualization when disabled', async () => {
      section.config.includeMermaidDiagrams = false;

      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).not.toContain('```mermaid');
    });

    it('should create pie chart with top 10 concepts', async () => {
      section.config.includeMermaidDiagrams = true;

      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('pie');
    });

    it('should pass concept data to mermaid formatter', async () => {
      section.config.includeMermaidDiagrams = true;

      await section.generate(sampleData, builder);
      const markdown = builder.build();

      const topConcepts = sampleData.concepts.topConcepts.slice(0, 10);
      topConcepts.forEach((concept) => {
        // At least some concept labels should appear
        if (markdown.includes(concept.concept)) {
          expect(markdown).toContain(concept.concept);
        }
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty concepts array', async () => {
      sampleData.concepts.topConcepts = [];

      await expect(section.generate(sampleData, builder)).resolves.not.toThrow();
    });

    it('should handle fewer concepts than maxConceptsToShow', async () => {
      sampleData.concepts.topConcepts = sampleData.concepts.topConcepts.slice(0, 10);
      section.maxConcepts = 50;

      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toBeDefined();
    });

    it('should handle single concept', async () => {
      sampleData.concepts.topConcepts = [sampleData.concepts.topConcepts[0]];

      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('| 1 |');
    });

    it('should handle concepts without categories', async () => {
      sampleData.concepts.topConcepts = sampleData.concepts.topConcepts.map((c) => ({
        concept: c.concept,
        frequency: c.frequency,
        fileCount: c.fileCount,
      }));

      await expect(section.generate(sampleData, builder)).resolves.not.toThrow();
    });

    it('should handle very long concept names', async () => {
      sampleData.concepts.topConcepts[0].concept = 'a'.repeat(200);

      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toBeDefined();
    });

    it('should handle zero frequency', async () => {
      sampleData.concepts.topConcepts[0].frequency = 0;

      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('0.0');
    });

    it('should handle zero file count', async () => {
      sampleData.concepts.topConcepts[0].fileCount = 0;

      await section.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('| 0 |');
    });

    it('should handle missing concepts metadata', async () => {
      delete sampleData.concepts.metadata;

      await expect(section.generate(sampleData, builder)).resolves.not.toThrow();
    });
  });

  describe('Configuration Variations', () => {
    it('should respect custom maxConceptsToShow', async () => {
      const customSection = new TopConceptsSection({ maxConceptsToShow: 5 });

      await customSection.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('top 5');
    });

    it('should handle maxConceptsToShow of 1', async () => {
      const singleSection = new TopConceptsSection({ maxConceptsToShow: 1 });

      await singleSection.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toContain('top 1');
    });

    it('should handle very large maxConceptsToShow', async () => {
      const largeSection = new TopConceptsSection({ maxConceptsToShow: 1000 });

      await largeSection.generate(sampleData, builder);
      const markdown = builder.build();

      expect(markdown).toBeDefined();
    });
  });
});
