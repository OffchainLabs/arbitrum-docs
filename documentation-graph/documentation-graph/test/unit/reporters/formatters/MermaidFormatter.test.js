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
 * MermaidFormatter Unit Tests
 *
 * These are FAILING tests (RED phase of TDD)
 * Implementation does not exist yet
 *
 * Tests for:
 * - Mermaid diagram type selection
 * - Pie chart formatting
 * - Flowchart formatting
 * - Graph formatting
 * - Syntax correctness
 * - Special character handling in labels
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Import the class we're testing (will fail until implemented)
let MermaidFormatter;
try {
  const module = await import('../../../../src/reporters/formatters/MermaidFormatter.js');
  MermaidFormatter = module.default || module.MermaidFormatter;
} catch (error) {
  console.warn('MermaidFormatter not implemented yet - tests will fail as expected');
}

describe('MermaidFormatter', () => {
  let formatter;

  beforeEach(() => {
    if (MermaidFormatter) {
      formatter = new MermaidFormatter();
    }
  });

  describe('Constructor and Initialization', () => {
    it('should create a new MermaidFormatter instance', () => {
      expect(formatter).toBeDefined();
      expect(formatter).toBeInstanceOf(MermaidFormatter);
    });
  });

  describe('Main Format Method', () => {
    it('should implement format method', () => {
      expect(formatter.format).toBeDefined();
      expect(typeof formatter.format).toBe('function');
    });

    it('should return string', () => {
      const data = [{ label: 'A', value: 10 }];
      const diagram = formatter.format('pie', data);

      expect(typeof diagram).toBe('string');
    });

    it('should dispatch to pie chart formatter', () => {
      const data = [{ label: 'A', value: 10 }];
      const diagram = formatter.format('pie', data);

      expect(diagram).toContain('pie');
    });

    it('should dispatch to flowchart formatter', () => {
      const data = { nodes: [], edges: [] };
      const diagram = formatter.format('flowchart', data);

      expect(diagram).toContain('flowchart');
    });

    it('should dispatch to graph formatter', () => {
      const data = [];
      const diagram = formatter.format('graph', data);

      expect(diagram).toContain('graph');
    });

    it('should throw error for unsupported type', () => {
      expect(() => {
        formatter.format('unsupported', {});
      }).toThrow('Unsupported diagram type');
    });

    it('should throw error for invalid type', () => {
      expect(() => {
        formatter.format(null, {});
      }).toThrow();
    });
  });

  describe('Pie Chart Formatting', () => {
    it('should implement formatPieChart method', () => {
      expect(formatter.formatPieChart).toBeDefined();
      expect(typeof formatter.formatPieChart).toBe('function');
    });

    it('should format simple pie chart', () => {
      const data = [
        { label: 'A', value: 30 },
        { label: 'B', value: 70 },
      ];

      const diagram = formatter.formatPieChart(data);

      expect(diagram).toContain('pie title Concept Distribution');
      expect(diagram).toContain('"A" : 30');
      expect(diagram).toContain('"B" : 70');
    });

    it('should include pie keyword', () => {
      const data = [{ label: 'Test', value: 100 }];
      const diagram = formatter.formatPieChart(data);

      expect(diagram).toMatch(/^pie/);
    });

    it('should include title', () => {
      const data = [{ label: 'Test', value: 100 }];
      const diagram = formatter.formatPieChart(data);

      expect(diagram).toContain('pie title Concept Distribution');
    });

    it('should format data with quotes and colons', () => {
      const data = [{ label: 'Category', value: 50 }];
      const diagram = formatter.formatPieChart(data);

      expect(diagram).toContain('"Category" : 50');
    });

    it('should handle multiple data items', () => {
      const data = [
        { label: 'First', value: 10 },
        { label: 'Second', value: 20 },
        { label: 'Third', value: 30 },
      ];

      const diagram = formatter.formatPieChart(data);

      expect(diagram).toContain('"First" : 10');
      expect(diagram).toContain('"Second" : 20');
      expect(diagram).toContain('"Third" : 30');
    });

    it('should use proper indentation', () => {
      const data = [{ label: 'A', value: 10 }];
      const diagram = formatter.formatPieChart(data);

      expect(diagram).toMatch(/\n    "/); // 4 spaces
    });

    it('should handle empty data array', () => {
      const diagram = formatter.formatPieChart([]);

      expect(diagram).toContain('pie title Concept Distribution');
    });

    it('should handle single data item', () => {
      const data = [{ label: 'Only', value: 100 }];
      const diagram = formatter.formatPieChart(data);

      expect(diagram).toContain('"Only" : 100');
    });

    it('should handle decimal values', () => {
      const data = [{ label: 'Test', value: 42.5 }];
      const diagram = formatter.formatPieChart(data);

      expect(diagram).toContain('42.5');
    });

    it('should handle zero values', () => {
      const data = [{ label: 'Zero', value: 0 }];
      const diagram = formatter.formatPieChart(data);

      expect(diagram).toContain('"Zero" : 0');
    });

    it('should handle large values', () => {
      const data = [{ label: 'Big', value: 1000000 }];
      const diagram = formatter.formatPieChart(data);

      expect(diagram).toContain('1000000');
    });
  });

  describe('Flowchart Formatting', () => {
    it('should implement formatFlowchart method', () => {
      expect(formatter.formatFlowchart).toBeDefined();
      expect(typeof formatter.formatFlowchart).toBe('function');
    });

    it('should format simple flowchart', () => {
      const data = {
        nodes: [
          { id: 'A', label: 'Node A' },
          { id: 'B', label: 'Node B' },
        ],
        edges: [{ source: 'A', target: 'B' }],
      };

      const diagram = formatter.formatFlowchart(data);

      expect(diagram).toContain('flowchart TD');
      expect(diagram).toContain('A[Node A]');
      expect(diagram).toContain('B[Node B]');
      expect(diagram).toContain('A --> B');
    });

    it('should include flowchart keyword', () => {
      const data = { nodes: [], edges: [] };
      const diagram = formatter.formatFlowchart(data);

      expect(diagram).toMatch(/^flowchart/);
    });

    it('should use TD direction', () => {
      const data = { nodes: [], edges: [] };
      const diagram = formatter.formatFlowchart(data);

      expect(diagram).toContain('flowchart TD');
    });

    it('should format nodes with brackets', () => {
      const data = {
        nodes: [{ id: 'test', label: 'Test Node' }],
        edges: [],
      };

      const diagram = formatter.formatFlowchart(data);

      expect(diagram).toContain('test[Test Node]');
    });

    it('should format edges with arrows', () => {
      const data = {
        nodes: [
          { id: 'A', label: 'A' },
          { id: 'B', label: 'B' },
        ],
        edges: [{ source: 'A', target: 'B' }],
      };

      const diagram = formatter.formatFlowchart(data);

      expect(diagram).toContain('A --> B');
    });

    it('should handle empty nodes', () => {
      const data = { nodes: [], edges: [] };
      const diagram = formatter.formatFlowchart(data);

      expect(diagram).toBe('flowchart TD');
    });

    it('should handle nodes without edges', () => {
      const data = {
        nodes: [{ id: 'A', label: 'Alone' }],
        edges: [],
      };

      const diagram = formatter.formatFlowchart(data);

      expect(diagram).toContain('A[Alone]');
    });

    it('should handle multiple edges', () => {
      const data = {
        nodes: [
          { id: 'A', label: 'A' },
          { id: 'B', label: 'B' },
          { id: 'C', label: 'C' },
        ],
        edges: [
          { source: 'A', target: 'B' },
          { source: 'B', target: 'C' },
        ],
      };

      const diagram = formatter.formatFlowchart(data);

      expect(diagram).toContain('A --> B');
      expect(diagram).toContain('B --> C');
    });

    it('should use proper indentation', () => {
      const data = {
        nodes: [{ id: 'A', label: 'A' }],
        edges: [],
      };

      const diagram = formatter.formatFlowchart(data);

      expect(diagram).toMatch(/\n    A\[/); // 4 spaces
    });
  });

  describe('Graph Formatting', () => {
    it('should implement formatGraph method', () => {
      expect(formatter.formatGraph).toBeDefined();
      expect(typeof formatter.formatGraph).toBe('function');
    });

    it('should format simple graph', () => {
      const data = [{ source: 'A', target: 'B', sourceLabel: 'Node A', targetLabel: 'Node B' }];

      const diagram = formatter.formatGraph(data);

      expect(diagram).toContain('graph LR');
      expect(diagram).toContain('A[Node A] --> B[Node B]');
    });

    it('should include graph keyword', () => {
      const data = [];
      const diagram = formatter.formatGraph(data);

      expect(diagram).toMatch(/^graph/);
    });

    it('should use LR direction', () => {
      const data = [];
      const diagram = formatter.formatGraph(data);

      expect(diagram).toContain('graph LR');
    });

    it('should format edges with labels', () => {
      const data = [{ source: 'src', target: 'tgt', sourceLabel: 'Source', targetLabel: 'Target' }];

      const diagram = formatter.formatGraph(data);

      expect(diagram).toContain('src[Source] --> tgt[Target]');
    });

    it('should handle empty data', () => {
      const diagram = formatter.formatGraph([]);

      expect(diagram).toBe('graph LR');
    });

    it('should handle multiple edges', () => {
      const data = [
        { source: 'A', target: 'B', sourceLabel: 'A', targetLabel: 'B' },
        { source: 'B', target: 'C', sourceLabel: 'B', targetLabel: 'C' },
      ];

      const diagram = formatter.formatGraph(data);

      expect(diagram).toContain('A[A] --> B[B]');
      expect(diagram).toContain('B[B] --> C[C]');
    });

    it('should use proper indentation', () => {
      const data = [{ source: 'A', target: 'B', sourceLabel: 'A', targetLabel: 'B' }];

      const diagram = formatter.formatGraph(data);

      expect(diagram).toMatch(/\n    A\[/); // 4 spaces
    });
  });

  describe('Special Characters Handling', () => {
    it('should handle quotes in pie chart labels', () => {
      const data = [{ label: 'Label "with quotes"', value: 10 }];
      const diagram = formatter.formatPieChart(data);

      expect(diagram).toBeDefined();
      // Should escape or handle quotes
    });

    it('should handle unicode in labels', () => {
      const data = [{ label: 'Label with émoji 🚀', value: 10 }];
      const diagram = formatter.formatPieChart(data);

      expect(diagram).toContain('émoji 🚀');
    });

    it('should handle special markdown characters', () => {
      const data = [{ label: 'Label with * and #', value: 10 }];
      const diagram = formatter.formatPieChart(data);

      expect(diagram).toBeDefined();
    });

    it('should handle colons in labels', () => {
      const data = [{ label: 'Label: with colon', value: 10 }];
      const diagram = formatter.formatPieChart(data);

      expect(diagram).toBeDefined();
    });

    it('should handle brackets in node labels', () => {
      const data = {
        nodes: [{ id: 'A', label: 'Node [bracket]' }],
        edges: [],
      };

      const diagram = formatter.formatFlowchart(data);

      expect(diagram).toBeDefined();
    });

    it('should handle arrows in labels', () => {
      const data = {
        nodes: [{ id: 'A', label: 'A --> B' }],
        edges: [],
      };

      const diagram = formatter.formatFlowchart(data);

      expect(diagram).toBeDefined();
    });

    it('should handle newlines in labels', () => {
      const data = [{ label: 'Line 1\nLine 2', value: 10 }];
      const diagram = formatter.formatPieChart(data);

      expect(diagram).toBeDefined();
    });

    it('should handle pipes in labels', () => {
      const data = [{ label: 'A | B', value: 10 }];
      const diagram = formatter.formatPieChart(data);

      expect(diagram).toBeDefined();
    });
  });

  describe('Syntax Validation', () => {
    it('should produce valid Mermaid pie chart syntax', () => {
      const data = [
        { label: 'A', value: 30 },
        { label: 'B', value: 70 },
      ];

      const diagram = formatter.formatPieChart(data);

      expect(diagram).toMatch(/^pie title .+/);
      expect(diagram).toMatch(/\n    ".+" : \d+/);
    });

    it('should produce valid Mermaid flowchart syntax', () => {
      const data = {
        nodes: [{ id: 'A', label: 'A' }],
        edges: [],
      };

      const diagram = formatter.formatFlowchart(data);

      expect(diagram).toMatch(/^flowchart TD/);
      expect(diagram).toMatch(/\n    \w+\[.+\]/);
    });

    it('should produce valid Mermaid graph syntax', () => {
      const data = [{ source: 'A', target: 'B', sourceLabel: 'A', targetLabel: 'B' }];

      const diagram = formatter.formatGraph(data);

      expect(diagram).toMatch(/^graph LR/);
      expect(diagram).toMatch(/\n    \w+\[.+\] --> \w+\[.+\]/);
    });

    it('should use consistent line endings', () => {
      const data = [
        { label: 'A', value: 10 },
        { label: 'B', value: 20 },
      ];

      const diagram = formatter.formatPieChart(data);

      const lines = diagram.split('\n');
      expect(lines.length).toBeGreaterThan(1);
    });

    it('should not have trailing whitespace', () => {
      const data = [{ label: 'A', value: 10 }];
      const diagram = formatter.formatPieChart(data);

      const lines = diagram.split('\n');
      lines.forEach((line) => {
        expect(line).not.toMatch(/\s$/);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null data', () => {
      expect(() => {
        formatter.formatPieChart(null);
      }).toThrow();
    });

    it('should handle undefined data', () => {
      expect(() => {
        formatter.formatPieChart(undefined);
      }).toThrow();
    });

    it('should handle malformed pie data', () => {
      const data = [{ wrongKey: 'value' }];

      expect(() => {
        formatter.formatPieChart(data);
      }).not.toThrow();
    });

    it('should handle malformed flowchart data', () => {
      const data = { wrongKey: [] };

      expect(() => {
        formatter.formatFlowchart(data);
      }).not.toThrow();
    });

    it('should handle very long labels', () => {
      const data = [{ label: 'a'.repeat(200), value: 10 }];
      const diagram = formatter.formatPieChart(data);

      expect(diagram).toContain('a'.repeat(200));
    });

    it('should handle negative values in pie chart', () => {
      const data = [{ label: 'Negative', value: -10 }];
      const diagram = formatter.formatPieChart(data);

      expect(diagram).toContain('-10');
    });

    it('should handle circular references in flowchart', () => {
      const data = {
        nodes: [
          { id: 'A', label: 'A' },
          { id: 'B', label: 'B' },
        ],
        edges: [
          { source: 'A', target: 'B' },
          { source: 'B', target: 'A' },
        ],
      };

      const diagram = formatter.formatFlowchart(data);

      expect(diagram).toContain('A --> B');
      expect(diagram).toContain('B --> A');
    });
  });
});
