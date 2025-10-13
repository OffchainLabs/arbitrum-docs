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
 * TableFormatter Unit Tests
 *
 * These are FAILING tests (RED phase of TDD)
 * Implementation does not exist yet
 *
 * Tests for:
 * - Markdown table formatting
 * - Header row generation
 * - Separator row with alignment markers
 * - Data row formatting
 * - Column alignment (left, center, right)
 * - Key-value table formatting
 * - Edge cases (empty arrays, special characters)
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { assertMarkdownTable } from '../../../helpers/assertionHelpers.js';

// Import the class we're testing (will fail until implemented)
let TableFormatter;
try {
  const module = await import('../../../../src/reporters/formatters/TableFormatter.js');
  TableFormatter = module.default || module.TableFormatter;
} catch (error) {
  console.warn('TableFormatter not implemented yet - tests will fail as expected');
}

describe('TableFormatter', () => {
  let formatter;

  beforeEach(() => {
    if (TableFormatter) {
      formatter = new TableFormatter();
    }
  });

  describe('Constructor and Initialization', () => {
    it('should create a new TableFormatter instance', () => {
      expect(formatter).toBeDefined();
      expect(formatter).toBeInstanceOf(TableFormatter);
    });
  });

  describe('Basic Table Formatting', () => {
    it('should implement format method', () => {
      expect(formatter.format).toBeDefined();
      expect(typeof formatter.format).toBe('function');
    });

    it('should format simple table', () => {
      const headers = ['Name', 'Value'];
      const rows = [
        ['Item 1', '100'],
        ['Item 2', '200'],
      ];

      const table = formatter.format(headers, rows);

      expect(typeof table).toBe('string');
      assertMarkdownTable(table, headers);
    });

    it('should include header row', () => {
      const headers = ['Col1', 'Col2'];
      const rows = [['A', 'B']];

      const table = formatter.format(headers, rows);

      expect(table).toContain('| Col1 | Col2 |');
    });

    it('should include separator row', () => {
      const headers = ['Col1', 'Col2'];
      const rows = [['A', 'B']];

      const table = formatter.format(headers, rows);

      expect(table).toMatch(/\| --- \| --- \|/);
    });

    it('should include data rows', () => {
      const headers = ['Name', 'Value'];
      const rows = [
        ['Item 1', '100'],
        ['Item 2', '200'],
      ];

      const table = formatter.format(headers, rows);

      expect(table).toContain('| Item 1 | 100 |');
      expect(table).toContain('| Item 2 | 200 |');
    });

    it('should format with proper spacing', () => {
      const headers = ['A', 'B'];
      const rows = [['1', '2']];

      const table = formatter.format(headers, rows);

      expect(table).toMatch(/\| \w+ \| \w+ \|/);
    });

    it('should end with newline', () => {
      const headers = ['A'];
      const rows = [['1']];

      const table = formatter.format(headers, rows);

      expect(table).toMatch(/\n$/);
    });
  });

  describe('Column Alignment', () => {
    it('should support left alignment', () => {
      const headers = ['Name'];
      const rows = [['Value']];
      const alignment = ['left'];

      const table = formatter.format(headers, rows, alignment);

      expect(table).toContain('| --- |');
    });

    it('should support center alignment', () => {
      const headers = ['Name'];
      const rows = [['Value']];
      const alignment = ['center'];

      const table = formatter.format(headers, rows, alignment);

      expect(table).toContain('| :---: |');
    });

    it('should support right alignment', () => {
      const headers = ['Name'];
      const rows = [['Value']];
      const alignment = ['right'];

      const table = formatter.format(headers, rows, alignment);

      expect(table).toContain('| ---: |');
    });

    it('should default to left alignment', () => {
      const headers = ['A', 'B'];
      const rows = [['1', '2']];

      const table = formatter.format(headers, rows);

      expect(table).toContain('| --- | --- |');
    });

    it('should support mixed alignments', () => {
      const headers = ['Left', 'Center', 'Right'];
      const rows = [['A', 'B', 'C']];
      const alignment = ['left', 'center', 'right'];

      const table = formatter.format(headers, rows, alignment);

      expect(table).toContain('| --- | :---: | ---: |');
    });

    it('should handle partial alignment array', () => {
      const headers = ['A', 'B', 'C'];
      const rows = [['1', '2', '3']];
      const alignment = ['center']; // Only first column

      const table = formatter.format(headers, rows, alignment);

      expect(table).toContain(':---:'); // First column centered
      expect(table).toContain('---'); // Others left-aligned
    });

    it('should ignore invalid alignment values', () => {
      const headers = ['A'];
      const rows = [['1']];
      const alignment = ['invalid'];

      const table = formatter.format(headers, rows, alignment);

      expect(table).toContain('| --- |'); // Default to left
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty headers', () => {
      const table = formatter.format([], []);

      expect(typeof table).toBe('string');
      expect(table).toBe('');
    });

    it('should handle empty rows', () => {
      const headers = ['Name', 'Value'];
      const rows = [];

      const table = formatter.format(headers, rows);

      assertMarkdownTable(table, headers);
      expect(table).toContain('| Name | Value |');
    });

    it('should handle single column', () => {
      const headers = ['Single'];
      const rows = [['Value 1'], ['Value 2']];

      const table = formatter.format(headers, rows);

      expect(table).toContain('| Single |');
      expect(table).toContain('| Value 1 |');
      expect(table).toContain('| Value 2 |');
    });

    it('should handle single row', () => {
      const headers = ['A', 'B'];
      const rows = [['1', '2']];

      const table = formatter.format(headers, rows);

      expect(table).toContain('| A | B |');
      expect(table).toContain('| 1 | 2 |');
    });

    it('should handle many columns', () => {
      const headers = ['A', 'B', 'C', 'D', 'E', 'F'];
      const rows = [['1', '2', '3', '4', '5', '6']];

      const table = formatter.format(headers, rows);

      headers.forEach((header) => {
        expect(table).toContain(header);
      });
    });

    it('should handle many rows', () => {
      const headers = ['Name'];
      const rows = Array.from({ length: 100 }, (_, i) => [`Item ${i}`]);

      const table = formatter.format(headers, rows);

      expect(table).toContain('| Item 0 |');
      expect(table).toContain('| Item 99 |');
    });

    it('should handle empty cell values', () => {
      const headers = ['A', 'B'];
      const rows = [
        ['', 'value'],
        ['value', ''],
      ];

      const table = formatter.format(headers, rows);

      expect(table).toContain('|  | value |');
      expect(table).toContain('| value |  |');
    });

    it('should handle null values', () => {
      const headers = ['A', 'B'];
      const rows = [[null, 'value']];

      const table = formatter.format(headers, rows);

      expect(table).toBeDefined();
    });

    it('should handle undefined values', () => {
      const headers = ['A', 'B'];
      const rows = [[undefined, 'value']];

      const table = formatter.format(headers, rows);

      expect(table).toBeDefined();
    });

    it('should handle numeric values', () => {
      const headers = ['Number', 'Float'];
      const rows = [[42, 3.14159]];

      const table = formatter.format(headers, rows);

      expect(table).toContain('| 42 | 3.14159 |');
    });

    it('should handle boolean values', () => {
      const headers = ['Flag'];
      const rows = [[true], [false]];

      const table = formatter.format(headers, rows);

      expect(table).toContain('| true |');
      expect(table).toContain('| false |');
    });
  });

  describe('Special Characters', () => {
    it('should handle pipe character in cells', () => {
      const headers = ['Text'];
      const rows = [['Contains | pipe']];

      const table = formatter.format(headers, rows);

      expect(table).toBeDefined();
      // Should escape or handle pipes appropriately
    });

    it('should handle newlines in cells', () => {
      const headers = ['Text'];
      const rows = [['Line 1\nLine 2']];

      const table = formatter.format(headers, rows);

      expect(table).toBeDefined();
    });

    it('should handle special markdown characters', () => {
      const headers = ['Text'];
      const rows = [['**bold** and *italic*']];

      const table = formatter.format(headers, rows);

      expect(table).toContain('**bold**');
      expect(table).toContain('*italic*');
    });

    it('should handle unicode characters', () => {
      const headers = ['Unicode'];
      const rows = [['émoji 🚀'], ['中文字符']];

      const table = formatter.format(headers, rows);

      expect(table).toContain('émoji 🚀');
      expect(table).toContain('中文字符');
    });

    it('should handle HTML entities', () => {
      const headers = ['HTML'];
      const rows = [['&lt;tag&gt;']];

      const table = formatter.format(headers, rows);

      expect(table).toContain('&lt;tag&gt;');
    });
  });

  describe('Key-Value Formatting', () => {
    it('should implement formatKeyValue method', () => {
      expect(formatter.formatKeyValue).toBeDefined();
      expect(typeof formatter.formatKeyValue).toBe('function');
    });

    it('should format object as key-value table', () => {
      const data = {
        name: 'Test',
        value: '100',
        status: 'active',
      };

      const table = formatter.formatKeyValue(data);

      expect(table).toContain('| Property | Value |');
      expect(table).toContain('| name | Test |');
      expect(table).toContain('| value | 100 |');
      expect(table).toContain('| status | active |');
    });

    it('should handle empty object', () => {
      const table = formatter.formatKeyValue({});

      expect(table).toContain('| Property | Value |');
    });

    it('should handle nested objects', () => {
      const data = {
        simple: 'value',
        nested: { key: 'value' },
      };

      const table = formatter.formatKeyValue(data);

      expect(table).toContain('| simple | value |');
      // Nested object should be stringified
      expect(table).toBeDefined();
    });

    it('should handle arrays in values', () => {
      const data = {
        items: [1, 2, 3],
      };

      const table = formatter.formatKeyValue(data);

      expect(table).toBeDefined();
    });

    it('should handle null values in object', () => {
      const data = {
        key: null,
      };

      const table = formatter.formatKeyValue(data);

      expect(table).toBeDefined();
    });

    it('should handle undefined values in object', () => {
      const data = {
        key: undefined,
      };

      const table = formatter.formatKeyValue(data);

      expect(table).toBeDefined();
    });

    it('should preserve key order', () => {
      const data = {
        first: '1',
        second: '2',
        third: '3',
      };

      const table = formatter.formatKeyValue(data);

      const lines = table.split('\n');
      const firstIndex = lines.findIndex((l) => l.includes('first'));
      const secondIndex = lines.findIndex((l) => l.includes('second'));
      const thirdIndex = lines.findIndex((l) => l.includes('third'));

      expect(firstIndex).toBeLessThan(secondIndex);
      expect(secondIndex).toBeLessThan(thirdIndex);
    });
  });

  describe('Formatting Quality', () => {
    it('should produce valid markdown table syntax', () => {
      const headers = ['A', 'B'];
      const rows = [['1', '2']];

      const table = formatter.format(headers, rows);

      // Should match markdown table pattern
      expect(table).toMatch(/\| .+ \| .+ \|/);
      expect(table).toMatch(/\| [-:]+ \| [-:]+ \|/);
    });

    it('should align all pipes vertically when possible', () => {
      const headers = ['A', 'B'];
      const rows = [['1', '2']];

      const table = formatter.format(headers, rows);

      const lines = table.split('\n').filter((l) => l.trim());
      const pipePositions = lines.map((line) =>
        Array.from(line.matchAll(/\|/g)).map((m) => m.index),
      );

      // All lines should have same number of pipes
      expect(pipePositions.every((pos) => pos.length === pipePositions[0].length)).toBe(true);
    });

    it('should handle very long cell content', () => {
      const headers = ['Long Content'];
      const rows = [['a'.repeat(200)]];

      const table = formatter.format(headers, rows);

      expect(table).toBeDefined();
      expect(table).toContain('a'.repeat(200));
    });

    it('should maintain consistent spacing', () => {
      const headers = ['A', 'B'];
      const rows = [
        ['1', '2'],
        ['3', '4'],
      ];

      const table = formatter.format(headers, rows);

      const lines = table.split('\n').filter((l) => l.trim() && l.includes('|'));
      lines.forEach((line) => {
        expect(line).toMatch(/\| \S+ \| \S+ \|/);
      });
    });
  });

  describe('Return Value', () => {
    it('should return string', () => {
      const table = formatter.format(['A'], [['1']]);

      expect(typeof table).toBe('string');
    });

    it('should return non-empty string for valid input', () => {
      const table = formatter.format(['A'], [['1']]);

      expect(table.length).toBeGreaterThan(0);
    });

    it('should return empty string for empty headers', () => {
      const table = formatter.format([], []);

      expect(table).toBe('');
    });

    it('should include newline at end', () => {
      const table = formatter.format(['A'], [['1']]);

      expect(table.endsWith('\n')).toBe(true);
    });
  });
});
