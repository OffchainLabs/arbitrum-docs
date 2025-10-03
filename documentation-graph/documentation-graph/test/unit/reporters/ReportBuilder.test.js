/**
 * ReportBuilder Unit Tests
 *
 * These are FAILING tests (RED phase of TDD)
 * Implementation does not exist yet
 *
 * Tests for:
 * - Fluent API interface
 * - Markdown element generation (headings, paragraphs, lists, tables, code blocks)
 * - Table of contents with anchor links
 * - Metadata in HTML comments
 * - Mermaid diagram integration
 * - Method chaining
 * - Building final markdown output
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  assertMarkdownTable,
  assertMarkdownHeading,
  assertMarkdownList,
} from '../../helpers/assertionHelpers.js';

// Import the class we're testing (will fail until implemented)
let ReportBuilder;
try {
  const module = await import('../../../src/reporters/ReportBuilder.js');
  ReportBuilder = module.default || module.ReportBuilder;
} catch (error) {
  console.warn('ReportBuilder not implemented yet - tests will fail as expected');
}

describe('ReportBuilder', () => {
  let builder;

  beforeEach(() => {
    if (ReportBuilder) {
      builder = new ReportBuilder();
    }
  });

  describe('Constructor and Initialization', () => {
    it('should create a new ReportBuilder instance', () => {
      expect(builder).toBeDefined();
      expect(builder).toBeInstanceOf(ReportBuilder);
    });

    it('should initialize with empty content array', () => {
      expect(builder.content).toBeDefined();
      expect(Array.isArray(builder.content)).toBe(true);
      expect(builder.content).toHaveLength(0);
    });

    it('should initialize table formatter', () => {
      expect(builder.tableFormatter).toBeDefined();
    });

    it('should initialize mermaid formatter', () => {
      expect(builder.mermaidFormatter).toBeDefined();
    });
  });

  describe('Fluent API - Method Chaining', () => {
    it('should return this for chaining after addTitle', () => {
      const result = builder.addTitle('Test Title');
      expect(result).toBe(builder);
    });

    it('should return this for chaining after addHeading', () => {
      const result = builder.addHeading('Test Heading');
      expect(result).toBe(builder);
    });

    it('should return this for chaining after addParagraph', () => {
      const result = builder.addParagraph('Test paragraph');
      expect(result).toBe(builder);
    });

    it('should return this for chaining after addList', () => {
      const result = builder.addList(['Item 1', 'Item 2']);
      expect(result).toBe(builder);
    });

    it('should return this for chaining after addTable', () => {
      const result = builder.addTable(['Header'], [['Row']]);
      expect(result).toBe(builder);
    });

    it('should return this for chaining after addCodeBlock', () => {
      const result = builder.addCodeBlock('const x = 1;', 'javascript');
      expect(result).toBe(builder);
    });

    it('should allow complex method chaining', () => {
      const result = builder
        .addTitle('Title')
        .addHeading('Heading')
        .addParagraph('Paragraph')
        .addList(['Item']);

      expect(result).toBe(builder);
    });
  });

  describe('Title and Headings', () => {
    it('should add level 1 title', () => {
      builder.addTitle('Main Title', 1);
      const markdown = builder.build();

      assertMarkdownHeading(markdown, 'Main Title', 1);
    });

    it('should add level 2 heading', () => {
      builder.addHeading('Section Heading', 2);
      const markdown = builder.build();

      assertMarkdownHeading(markdown, 'Section Heading', 2);
    });

    it('should add level 3 subheading', () => {
      builder.addSubheading('Subsection', 3);
      const markdown = builder.build();

      assertMarkdownHeading(markdown, 'Subsection', 3);
    });

    it('should default to level 2 for addHeading', () => {
      builder.addHeading('Default Level');
      const markdown = builder.build();

      expect(markdown).toContain('## Default Level');
    });

    it('should default to level 3 for addSubheading', () => {
      builder.addSubheading('Default Subheading');
      const markdown = builder.build();

      expect(markdown).toContain('### Default Subheading');
    });

    it('should handle headings with special characters', () => {
      builder.addHeading('Heading with émoji 🚀');
      const markdown = builder.build();

      expect(markdown).toContain('## Heading with émoji 🚀');
    });

    it('should support heading levels 1-6', () => {
      builder
        .addTitle('Level 1', 1)
        .addHeading('Level 2', 2)
        .addHeading('Level 3', 3)
        .addHeading('Level 4', 4)
        .addHeading('Level 5', 5)
        .addHeading('Level 6', 6);

      const markdown = builder.build();

      expect(markdown).toContain('# Level 1');
      expect(markdown).toContain('## Level 2');
      expect(markdown).toContain('### Level 3');
      expect(markdown).toContain('#### Level 4');
      expect(markdown).toContain('##### Level 5');
      expect(markdown).toContain('###### Level 6');
    });
  });

  describe('Paragraphs and Text', () => {
    it('should add paragraph text', () => {
      builder.addParagraph('This is a test paragraph.');
      const markdown = builder.build();

      expect(markdown).toContain('This is a test paragraph.');
    });

    it('should add multiple paragraphs', () => {
      builder.addParagraph('First paragraph.').addParagraph('Second paragraph.');

      const markdown = builder.build();

      expect(markdown).toContain('First paragraph.');
      expect(markdown).toContain('Second paragraph.');
    });

    it('should handle empty paragraph', () => {
      builder.addParagraph('');
      const markdown = builder.build();

      expect(markdown).toBeDefined();
    });

    it('should handle multi-line paragraph', () => {
      const multiLine = 'This is line 1.\nThis is line 2.';
      builder.addParagraph(multiLine);
      const markdown = builder.build();

      expect(markdown).toContain(multiLine);
    });
  });

  describe('Lists', () => {
    it('should add unordered list', () => {
      builder.addList(['Item 1', 'Item 2', 'Item 3']);
      const markdown = builder.build();

      assertMarkdownList(markdown, ['Item 1', 'Item 2', 'Item 3']);
    });

    it('should add ordered list', () => {
      builder.addList(['First', 'Second', 'Third'], true);
      const markdown = builder.build();

      expect(markdown).toContain('1. First');
      expect(markdown).toContain('2. Second');
      expect(markdown).toContain('3. Third');
    });

    it('should default to unordered list', () => {
      builder.addList(['Item']);
      const markdown = builder.build();

      expect(markdown).toMatch(/^[-*] Item/m);
    });

    it('should handle empty list', () => {
      builder.addList([]);
      const markdown = builder.build();

      expect(markdown).toBeDefined();
    });

    it('should handle single item list', () => {
      builder.addList(['Single item']);
      const markdown = builder.build();

      expect(markdown).toMatch(/[-*] Single item/);
    });

    it('should handle list items with special characters', () => {
      builder.addList(['Item with émoji 🎯', 'Item with **bold**']);
      const markdown = builder.build();

      expect(markdown).toContain('Item with émoji 🎯');
      expect(markdown).toContain('Item with **bold**');
    });
  });

  describe('Tables', () => {
    it('should add markdown table', () => {
      const headers = ['Name', 'Value'];
      const rows = [
        ['Item 1', '100'],
        ['Item 2', '200'],
      ];

      builder.addTable(headers, rows);
      const markdown = builder.build();

      assertMarkdownTable(markdown, headers);
      expect(markdown).toContain('Item 1');
      expect(markdown).toContain('100');
    });

    it('should add table with alignment', () => {
      const headers = ['Left', 'Center', 'Right'];
      const rows = [['A', 'B', 'C']];
      const alignment = ['left', 'center', 'right'];

      builder.addTable(headers, rows, alignment);
      const markdown = builder.build();

      expect(markdown).toContain('---'); // left
      expect(markdown).toContain(':---:'); // center
      expect(markdown).toContain('---:'); // right
    });

    it('should handle empty table', () => {
      builder.addTable(['Header'], []);
      const markdown = builder.build();

      assertMarkdownTable(markdown, ['Header']);
    });

    it('should handle table with many columns', () => {
      const headers = ['Col1', 'Col2', 'Col3', 'Col4', 'Col5'];
      const rows = [['A', 'B', 'C', 'D', 'E']];

      builder.addTable(headers, rows);
      const markdown = builder.build();

      headers.forEach((header) => {
        expect(markdown).toContain(header);
      });
    });

    it('should handle table with special characters', () => {
      const headers = ['Name', 'Description'];
      const rows = [['Test', 'Contains | pipe']];

      builder.addTable(headers, rows);
      const markdown = builder.build();

      expect(markdown).toBeDefined();
    });
  });

  describe('Code Blocks', () => {
    it('should add code block with language', () => {
      builder.addCodeBlock('const x = 1;', 'javascript');
      const markdown = builder.build();

      expect(markdown).toContain('```javascript');
      expect(markdown).toContain('const x = 1;');
      expect(markdown).toContain('```');
    });

    it('should add code block without language', () => {
      builder.addCodeBlock('plain text');
      const markdown = builder.build();

      expect(markdown).toContain('```');
      expect(markdown).toContain('plain text');
    });

    it('should handle multi-line code', () => {
      const code = 'line 1\nline 2\nline 3';
      builder.addCodeBlock(code, 'text');
      const markdown = builder.build();

      expect(markdown).toContain('line 1');
      expect(markdown).toContain('line 2');
      expect(markdown).toContain('line 3');
    });

    it('should support shell language tag', () => {
      builder.addCodeBlock('npm install', 'shell');
      const markdown = builder.build();

      expect(markdown).toContain('```shell');
    });

    it('should handle empty code block', () => {
      builder.addCodeBlock('');
      const markdown = builder.build();

      expect(markdown).toContain('```');
    });
  });

  describe('Mermaid Diagrams', () => {
    it('should add mermaid diagram', () => {
      const data = [
        { label: 'A', value: 30 },
        { label: 'B', value: 70 },
      ];

      builder.addMermaidDiagram('pie', data);
      const markdown = builder.build();

      expect(markdown).toContain('```mermaid');
      expect(markdown).toContain('```');
    });

    it('should delegate to mermaid formatter', () => {
      const data = [{ label: 'Test', value: 100 }];

      builder.addMermaidDiagram('pie', data);
      const markdown = builder.build();

      expect(markdown).toContain('mermaid');
    });

    it('should support different diagram types', () => {
      builder.addMermaidDiagram('pie', []);
      builder.addMermaidDiagram('flowchart', { nodes: [], edges: [] });

      const markdown = builder.build();

      expect(markdown).toContain('```mermaid');
    });
  });

  describe('Metadata', () => {
    it('should add metadata in HTML comments', () => {
      const metadata = {
        generated: '2024-01-01',
        version: '1.0.0',
      };

      builder.addMetadata(metadata);
      const markdown = builder.build();

      expect(markdown).toContain('<!-- Report Metadata');
      expect(markdown).toContain('generated: 2024-01-01');
      expect(markdown).toContain('version: 1.0.0');
      expect(markdown).toContain('-->');
    });

    it('should handle empty metadata', () => {
      builder.addMetadata({});
      const markdown = builder.build();

      expect(markdown).toContain('<!-- Report Metadata');
      expect(markdown).toContain('-->');
    });

    it('should format metadata key-value pairs', () => {
      builder.addMetadata({ key: 'value' });
      const markdown = builder.build();

      expect(markdown).toContain('key: value');
    });
  });

  describe('Table of Contents', () => {
    it('should add table of contents', () => {
      const sections = ['Introduction', 'Methods', 'Results'];

      builder.addTableOfContents(sections);
      const markdown = builder.build();

      assertMarkdownHeading(markdown, 'Table of Contents', 2);
    });

    it('should create anchor links for sections', () => {
      const sections = ['Executive Summary', 'Concept Analysis'];

      builder.addTableOfContents(sections);
      const markdown = builder.build();

      expect(markdown).toContain('[Executive Summary](#executive-summary)');
      expect(markdown).toContain('[Concept Analysis](#concept-analysis)');
    });

    it('should number TOC entries', () => {
      const sections = ['First', 'Second', 'Third'];

      builder.addTableOfContents(sections);
      const markdown = builder.build();

      expect(markdown).toContain('1. [First]');
      expect(markdown).toContain('2. [Second]');
      expect(markdown).toContain('3. [Third]');
    });

    it('should handle special characters in section names', () => {
      const sections = ['Section with spaces', 'Section-with-dashes'];

      builder.addTableOfContents(sections);
      const markdown = builder.build();

      expect(markdown).toContain('#section-with-spaces');
      expect(markdown).toContain('#section-with-dashes');
    });

    it('should handle empty sections array', () => {
      builder.addTableOfContents([]);
      const markdown = builder.build();

      assertMarkdownHeading(markdown, 'Table of Contents', 2);
    });
  });

  describe('Utility Methods', () => {
    it('should add horizontal rule', () => {
      builder.addHorizontalRule();
      const markdown = builder.build();

      expect(markdown).toContain('---');
    });

    it('should add warning message', () => {
      builder.addWarning('This is a warning');
      const markdown = builder.build();

      expect(markdown).toContain('> **Warning**: This is a warning');
    });

    it('should add info message', () => {
      builder.addInfo('This is an info message');
      const markdown = builder.build();

      expect(markdown).toContain('> **Note**: This is an info message');
    });

    it('should add custom section content', () => {
      builder.addSection('Custom content here');
      const markdown = builder.build();

      expect(markdown).toContain('Custom content here');
    });
  });

  describe('Reset and Build', () => {
    it('should reset content', () => {
      builder.addTitle('Title').addParagraph('Paragraph').reset();

      expect(builder.content).toHaveLength(0);
    });

    it('should return this after reset for chaining', () => {
      const result = builder.reset();
      expect(result).toBe(builder);
    });

    it('should build complete markdown string', () => {
      builder.addTitle('Title').addParagraph('Paragraph');

      const markdown = builder.build();

      expect(typeof markdown).toBe('string');
      expect(markdown.length).toBeGreaterThan(0);
    });

    it('should join content with newlines', () => {
      builder.addParagraph('Line 1').addParagraph('Line 2');

      const markdown = builder.build();

      expect(markdown).toContain('\n');
    });

    it('should return empty string for empty content', () => {
      const markdown = builder.build();

      expect(typeof markdown).toBe('string');
    });

    it('should allow building multiple times', () => {
      builder.addParagraph('Test');

      const markdown1 = builder.build();
      const markdown2 = builder.build();

      expect(markdown1).toBe(markdown2);
    });

    it('should allow modification after build', () => {
      builder.addParagraph('First');
      const markdown1 = builder.build();

      builder.addParagraph('Second');
      const markdown2 = builder.build();

      expect(markdown2).toContain('First');
      expect(markdown2).toContain('Second');
      expect(markdown2.length).toBeGreaterThan(markdown1.length);
    });
  });

  describe('Complex Document Building', () => {
    it('should build complex document with multiple sections', () => {
      builder
        .addTitle('Documentation Analysis Report', 1)
        .addMetadata({ generated: new Date().toISOString() })
        .addTableOfContents(['Introduction', 'Analysis', 'Conclusion'])
        .addHeading('Introduction', 2)
        .addParagraph('This is the introduction.')
        .addHeading('Analysis', 2)
        .addSubheading('Statistics', 3)
        .addTable(
          ['Metric', 'Value'],
          [
            ['Files', '100'],
            ['Concepts', '50'],
          ],
        )
        .addHeading('Conclusion', 2)
        .addList(['Finding 1', 'Finding 2', 'Finding 3']);

      const markdown = builder.build();

      assertMarkdownHeading(markdown, 'Documentation Analysis Report', 1);
      assertMarkdownHeading(markdown, 'Introduction', 2);
      assertMarkdownHeading(markdown, 'Analysis', 2);
      assertMarkdownTable(markdown, ['Metric', 'Value']);
    });

    it('should maintain proper spacing between elements', () => {
      builder
        .addHeading('Section 1')
        .addParagraph('Paragraph')
        .addList(['Item'])
        .addTable(['H'], [['R']]);

      const markdown = builder.build();

      expect(markdown).toContain('\n');
    });

    it('should handle mixed content types', () => {
      builder
        .addParagraph('Text')
        .addCodeBlock('code')
        .addList(['item'])
        .addTable(['h'], [['r']])
        .addWarning('warning');

      const markdown = builder.build();

      expect(markdown).toBeDefined();
      expect(markdown.length).toBeGreaterThan(0);
    });
  });
});
