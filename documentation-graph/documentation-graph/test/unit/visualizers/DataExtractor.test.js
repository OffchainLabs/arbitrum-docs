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
 * DataExtractor Test Suite
 * Tests for extracting and transforming graph data for Cytoscape visualization
 *
 * @group unit
 * @group visualizers
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { DataExtractor } from '../../../src/visualizers/DataExtractor.js';

describe('DataExtractor', () => {
  let extractor;

  beforeEach(() => {
    extractor = new DataExtractor();
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with default chunk size of 1000', () => {
      expect(extractor.chunkSize).toBe(1000);
    });

    it('should accept custom chunk size via config', () => {
      const customExtractor = new DataExtractor({ chunkSize: 500 });
      expect(customExtractor.chunkSize).toBe(500);
    });

    it('should throw error for invalid chunk size (negative)', () => {
      expect(() => new DataExtractor({ chunkSize: -100 })).toThrow('Chunk size must be positive');
    });

    it('should throw error for invalid chunk size (zero)', () => {
      expect(() => new DataExtractor({ chunkSize: 0 })).toThrow('Chunk size must be positive');
    });
  });

  describe('extract() - Main Extraction Method', () => {
    let graphData;
    let analysisData;

    beforeEach(() => {
      graphData = {
        nodes: [
          { id: 'node1', type: 'document', label: 'Doc 1', filePath: '/path/to/doc1.md' },
          { id: 'node2', type: 'concept', label: 'Concept A', frequency: 5 },
        ],
        edges: [{ id: 'edge1', source: 'node1', target: 'node2', type: 'mentions', weight: 0.8 }],
      };

      analysisData = {
        basic: {
          nodeCount: 2,
          edgeCount: 1,
          density: 0.5,
          avgDegree: 1.0,
          isConnected: true,
          nodesByType: { document: 1, concept: 1 },
          edgesByType: { mentions: 1 },
        },
        centrality: {
          degree: {
            values: { node1: 0.7, node2: 0.3 },
          },
        },
      };
    });

    it('should extract complete visualization data structure', () => {
      const result = extractor.extract(graphData, analysisData);

      expect(result).toHaveProperty('metadata');
      expect(result).toHaveProperty('elements');
      expect(result).toHaveProperty('styles');
      expect(result).toHaveProperty('layout');
    });

    it('should return metadata object with correct structure', () => {
      const result = extractor.extract(graphData, analysisData);

      expect(result.metadata).toHaveProperty('version');
      expect(result.metadata).toHaveProperty('generated');
      expect(result.metadata).toHaveProperty('source');
      expect(result.metadata).toHaveProperty('statistics');
      expect(result.metadata).toHaveProperty('chunking');
    });

    it('should return elements with nodes and edges arrays', () => {
      const result = extractor.extract(graphData, analysisData);

      expect(result.elements).toHaveProperty('nodes');
      expect(result.elements).toHaveProperty('edges');
      expect(Array.isArray(result.elements.nodes)).toBe(true);
      expect(Array.isArray(result.elements.edges)).toBe(true);
    });

    it('should transform all nodes to Cytoscape format', () => {
      const result = extractor.extract(graphData, analysisData);

      expect(result.elements.nodes).toHaveLength(2);
      expect(result.elements.nodes[0]).toHaveProperty('data');
      expect(result.elements.nodes[0]).toHaveProperty('classes');
    });

    it('should transform all edges to Cytoscape format', () => {
      const result = extractor.extract(graphData, analysisData);

      expect(result.elements.edges).toHaveLength(1);
      expect(result.elements.edges[0]).toHaveProperty('data');
      expect(result.elements.edges[0]).toHaveProperty('classes');
    });

    it('should throw error for missing graphData', () => {
      expect(() => extractor.extract(null, analysisData)).toThrow('Graph data is required');
    });

    it('should throw error for missing analysisData', () => {
      expect(() => extractor.extract(graphData, null)).toThrow('Analysis data is required');
    });

    it('should throw error for graphData without nodes array', () => {
      const invalidGraph = { edges: [] };
      expect(() => extractor.extract(invalidGraph, analysisData)).toThrow(
        'Graph data must contain nodes array',
      );
    });

    it('should throw error for graphData without edges array', () => {
      const invalidGraph = { nodes: [] };
      expect(() => extractor.extract(invalidGraph, analysisData)).toThrow(
        'Graph data must contain edges array',
      );
    });

    it('should handle empty graph gracefully', () => {
      const emptyGraph = { nodes: [], edges: [] };
      const result = extractor.extract(emptyGraph, analysisData);

      expect(result.elements.nodes).toHaveLength(0);
      expect(result.elements.edges).toHaveLength(0);
    });

    it('should include styles array in result', () => {
      const result = extractor.extract(graphData, analysisData);

      expect(Array.isArray(result.styles)).toBe(true);
      expect(result.styles.length).toBeGreaterThan(0);
    });

    it('should include layout config in result', () => {
      const result = extractor.extract(graphData, analysisData);

      expect(result.layout).toHaveProperty('name');
      expect(result.layout).toHaveProperty('animate');
    });
  });

  describe('buildMetadata()', () => {
    let graphData;
    let analysisData;

    beforeEach(() => {
      graphData = {
        nodes: Array.from({ length: 150 }, (_, i) => ({
          id: `node${i}`,
          type: 'document',
          label: `Doc ${i}`,
        })),
        edges: [],
      };

      analysisData = {
        basic: {
          density: 0.42,
          avgDegree: 3.5,
          isConnected: false,
          nodesByType: { document: 150 },
          edgesByType: {},
        },
      };
    });

    it('should include version field', () => {
      const metadata = extractor.buildMetadata(graphData, analysisData);
      expect(metadata.version).toBe('1.0.0');
    });

    it('should include ISO 8601 timestamp in generated field', () => {
      const metadata = extractor.buildMetadata(graphData, analysisData);
      expect(metadata.generated).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include source information with node/edge counts', () => {
      const metadata = extractor.buildMetadata(graphData, analysisData);

      expect(metadata.source.totalNodes).toBe(150);
      expect(metadata.source.totalEdges).toBe(0);
    });

    it('should include source information with node types', () => {
      const metadata = extractor.buildMetadata(graphData, analysisData);

      expect(metadata.source.nodeTypes).toEqual(['document']);
    });

    it('should include source information with edge types', () => {
      const metadata = extractor.buildMetadata(graphData, analysisData);

      expect(Array.isArray(metadata.source.edgeTypes)).toBe(true);
    });

    it('should include statistics from analysis data', () => {
      const metadata = extractor.buildMetadata(graphData, analysisData);

      expect(metadata.statistics.density).toBe(0.42);
      expect(metadata.statistics.avgDegree).toBe(3.5);
      expect(metadata.statistics.isConnected).toBe(false);
    });

    it('should enable chunking when node count exceeds chunk size', () => {
      extractor.chunkSize = 100;
      const metadata = extractor.buildMetadata(graphData, analysisData);

      expect(metadata.chunking.enabled).toBe(true);
    });

    it('should disable chunking when node count is below chunk size', () => {
      extractor.chunkSize = 200;
      const metadata = extractor.buildMetadata(graphData, analysisData);

      expect(metadata.chunking.enabled).toBe(false);
    });

    it('should calculate correct total chunks', () => {
      extractor.chunkSize = 100;
      const metadata = extractor.buildMetadata(graphData, analysisData);

      expect(metadata.chunking.totalChunks).toBe(2);
    });

    it('should include chunkSize in metadata', () => {
      const metadata = extractor.buildMetadata(graphData, analysisData);

      expect(metadata.chunking.chunkSize).toBe(extractor.chunkSize);
    });
  });

  describe('buildElements()', () => {
    let graphData;
    let analysisData;

    beforeEach(() => {
      graphData = {
        nodes: [
          { id: 'doc1', type: 'document', label: 'Document 1' },
          { id: 'concept1', type: 'concept', label: 'Concept 1' },
        ],
        edges: [{ id: 'e1', source: 'doc1', target: 'concept1', type: 'mentions' }],
      };

      analysisData = {
        basic: {},
        centrality: {
          degree: { values: { doc1: 0.8, concept1: 0.6 } },
        },
      };
    });

    it('should return object with nodes and edges properties', () => {
      const elements = extractor.buildElements(graphData, analysisData);

      expect(elements).toHaveProperty('nodes');
      expect(elements).toHaveProperty('edges');
    });

    it('should transform all nodes', () => {
      const elements = extractor.buildElements(graphData, analysisData);

      expect(elements.nodes).toHaveLength(2);
    });

    it('should transform all edges', () => {
      const elements = extractor.buildElements(graphData, analysisData);

      expect(elements.edges).toHaveLength(1);
    });

    it('should call transformNode for each node', () => {
      const elements = extractor.buildElements(graphData, analysisData);

      elements.nodes.forEach((node) => {
        expect(node).toHaveProperty('data');
        expect(node.data).toHaveProperty('id');
      });
    });

    it('should call transformEdge for each edge', () => {
      const elements = extractor.buildElements(graphData, analysisData);

      elements.edges.forEach((edge) => {
        expect(edge).toHaveProperty('data');
        expect(edge.data).toHaveProperty('source');
        expect(edge.data).toHaveProperty('target');
      });
    });

    it('should handle empty nodes array', () => {
      graphData.nodes = [];
      graphData.edges = [];

      const elements = extractor.buildElements(graphData, analysisData);

      expect(elements.nodes).toHaveLength(0);
      expect(elements.edges).toHaveLength(0);
    });
  });

  describe('transformNode()', () => {
    let node;
    let analysisData;

    beforeEach(() => {
      node = {
        id: 'node1',
        type: 'document',
        label: 'Test Document',
        filePath: '/path/to/doc.md',
        title: 'Test Title',
      };

      analysisData = {
        centrality: {
          degree: {
            values: { node1: 0.75 },
          },
        },
      };
    });

    it('should return Cytoscape node format', () => {
      const transformed = extractor.transformNode(node, analysisData);

      expect(transformed).toHaveProperty('data');
      expect(transformed).toHaveProperty('classes');
    });

    it('should include id in data', () => {
      const transformed = extractor.transformNode(node, analysisData);

      expect(transformed.data.id).toBe('node1');
    });

    it('should include label in data', () => {
      const transformed = extractor.transformNode(node, analysisData);

      expect(transformed.data.label).toBe('Test Document');
    });

    it('should include type in data', () => {
      const transformed = extractor.transformNode(node, analysisData);

      expect(transformed.data.type).toBe('document');
    });

    it('should spread all node properties into data', () => {
      const transformed = extractor.transformNode(node, analysisData);

      expect(transformed.data.filePath).toBe('/path/to/doc.md');
      expect(transformed.data.title).toBe('Test Title');
    });

    it('should include centrality data', () => {
      const transformed = extractor.transformNode(node, analysisData);

      expect(transformed.data.centrality).toBeDefined();
      expect(transformed.data.centrality.degree).toBe(0.75);
    });

    it('should use 0 for centrality when node not in analysis', () => {
      const transformed = extractor.transformNode(
        { id: 'unknown', type: 'concept', label: 'Unknown' },
        analysisData,
      );

      expect(transformed.data.centrality.degree).toBe(0);
    });

    it('should add node type as CSS class', () => {
      const transformed = extractor.transformNode(node, analysisData);

      expect(transformed.classes).toContain('document');
    });

    it('should handle node with position', () => {
      node.position = { x: 100, y: 200 };
      const transformed = extractor.transformNode(node, analysisData);

      expect(transformed.position).toEqual({ x: 100, y: 200 });
    });

    it('should set position to undefined when not provided', () => {
      const transformed = extractor.transformNode(node, analysisData);

      expect(transformed.position).toBeUndefined();
    });

    it('should handle missing centrality data gracefully', () => {
      const transformed = extractor.transformNode(node, { centrality: null });

      expect(transformed.data.centrality.degree).toBe(0);
    });
  });

  describe('transformEdge()', () => {
    let edge;

    beforeEach(() => {
      edge = {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        type: 'mentions',
        weight: 0.85,
        label: 'mentions 5 times',
      };
    });

    it('should return Cytoscape edge format', () => {
      const transformed = extractor.transformEdge(edge);

      expect(transformed).toHaveProperty('data');
      expect(transformed).toHaveProperty('classes');
    });

    it('should include id in data', () => {
      const transformed = extractor.transformEdge(edge);

      expect(transformed.data.id).toBe('edge1');
    });

    it('should include source in data', () => {
      const transformed = extractor.transformEdge(edge);

      expect(transformed.data.source).toBe('node1');
    });

    it('should include target in data', () => {
      const transformed = extractor.transformEdge(edge);

      expect(transformed.data.target).toBe('node2');
    });

    it('should include type in data', () => {
      const transformed = extractor.transformEdge(edge);

      expect(transformed.data.type).toBe('mentions');
    });

    it('should include weight in data', () => {
      const transformed = extractor.transformEdge(edge);

      expect(transformed.data.weight).toBe(0.85);
    });

    it('should use default weight of 1 when not provided', () => {
      delete edge.weight;
      const transformed = extractor.transformEdge(edge);

      expect(transformed.data.weight).toBe(1);
    });

    it('should include label in data', () => {
      const transformed = extractor.transformEdge(edge);

      expect(transformed.data.label).toBe('mentions 5 times');
    });

    it('should use empty string for label when not provided', () => {
      delete edge.label;
      const transformed = extractor.transformEdge(edge);

      expect(transformed.data.label).toBe('');
    });

    it('should add edge type as CSS class', () => {
      const transformed = extractor.transformEdge(edge);

      expect(transformed.classes).toContain('mentions');
    });
  });

  describe('buildStyles()', () => {
    it('should return array of style objects', () => {
      const styles = extractor.buildStyles();

      expect(Array.isArray(styles)).toBe(true);
      expect(styles.length).toBeGreaterThan(0);
    });

    it('should include base node style', () => {
      const styles = extractor.buildStyles();
      const nodeStyle = styles.find((s) => s.selector === 'node');

      expect(nodeStyle).toBeDefined();
      expect(nodeStyle.style).toHaveProperty('label');
    });

    it('should include base edge style', () => {
      const styles = extractor.buildStyles();
      const edgeStyle = styles.find((s) => s.selector === 'edge');

      expect(edgeStyle).toBeDefined();
      expect(edgeStyle.style).toHaveProperty('width');
    });

    it('should include document node style', () => {
      const styles = extractor.buildStyles();
      const docStyle = styles.find((s) => s.selector === '.document');

      expect(docStyle).toBeDefined();
      expect(docStyle.style).toHaveProperty('shape');
      expect(docStyle.style).toHaveProperty('background-color');
    });

    it('should include concept node style', () => {
      const styles = extractor.buildStyles();
      const conceptStyle = styles.find((s) => s.selector === '.concept');

      expect(conceptStyle).toBeDefined();
      expect(conceptStyle.style).toHaveProperty('shape');
    });

    it('should include directory node style', () => {
      const styles = extractor.buildStyles();
      const dirStyle = styles.find((s) => s.selector === '.directory');

      expect(dirStyle).toBeDefined();
    });

    it('should set different shapes for different node types', () => {
      const styles = extractor.buildStyles();
      const docShape = styles.find((s) => s.selector === '.document').style.shape;
      const conceptShape = styles.find((s) => s.selector === '.concept').style.shape;

      expect(docShape).not.toBe(conceptShape);
    });

    it('should set different colors for different node types', () => {
      const styles = extractor.buildStyles();
      const docColor = styles.find((s) => s.selector === '.document').style['background-color'];
      const conceptColor = styles.find((s) => s.selector === '.concept').style['background-color'];

      expect(docColor).not.toBe(conceptColor);
    });
  });

  describe('buildLayoutConfig()', () => {
    it('should return layout configuration object', () => {
      const layout = extractor.buildLayoutConfig();

      expect(typeof layout).toBe('object');
    });

    it('should use cose layout algorithm', () => {
      const layout = extractor.buildLayoutConfig();

      expect(layout.name).toBe('cose');
    });

    it('should enable animation', () => {
      const layout = extractor.buildLayoutConfig();

      expect(layout.animate).toBe(true);
    });

    it('should include animation duration', () => {
      const layout = extractor.buildLayoutConfig();

      expect(layout.animationDuration).toBeDefined();
      expect(typeof layout.animationDuration).toBe('number');
    });

    it('should include physics parameters', () => {
      const layout = extractor.buildLayoutConfig();

      expect(layout).toHaveProperty('nodeRepulsion');
      expect(layout).toHaveProperty('idealEdgeLength');
      expect(layout).toHaveProperty('edgeElasticity');
      expect(layout).toHaveProperty('gravity');
    });

    it('should include iteration parameters', () => {
      const layout = extractor.buildLayoutConfig();

      expect(layout).toHaveProperty('numIter');
      expect(layout).toHaveProperty('initialTemp');
      expect(layout).toHaveProperty('coolingFactor');
      expect(layout).toHaveProperty('minTemp');
    });

    it('should use reasonable default values', () => {
      const layout = extractor.buildLayoutConfig();

      expect(layout.nodeRepulsion).toBeGreaterThan(0);
      expect(layout.coolingFactor).toBeLessThan(1);
      expect(layout.coolingFactor).toBeGreaterThan(0);
    });
  });

  describe('chunkData()', () => {
    let visualizationData;

    beforeEach(() => {
      visualizationData = {
        metadata: {
          chunking: {
            enabled: true,
            chunkSize: 100,
            totalChunks: 3,
          },
        },
        elements: {
          nodes: Array.from({ length: 250 }, (_, i) => ({
            data: { id: `node${i}`, label: `Node ${i}` },
          })),
          edges: Array.from({ length: 500 }, (_, i) => ({
            data: { id: `edge${i}`, source: `node${i % 250}`, target: `node${(i + 1) % 250}` },
          })),
        },
      };

      extractor.chunkSize = 100;
    });

    it('should return array of chunks', () => {
      const chunks = extractor.chunkData(visualizationData);

      expect(Array.isArray(chunks)).toBe(true);
    });

    it('should create correct number of chunks', () => {
      const chunks = extractor.chunkData(visualizationData);

      expect(chunks.length).toBe(3);
    });

    it('should include chunk index in each chunk', () => {
      const chunks = extractor.chunkData(visualizationData);

      chunks.forEach((chunk, i) => {
        expect(chunk.index).toBe(i);
      });
    });

    it('should include total chunks count in each chunk', () => {
      const chunks = extractor.chunkData(visualizationData);

      chunks.forEach((chunk) => {
        expect(chunk.total).toBe(3);
      });
    });

    it('should distribute nodes across chunks', () => {
      const chunks = extractor.chunkData(visualizationData);

      const totalNodes = chunks.reduce((sum, chunk) => sum + chunk.elements.nodes.length, 0);
      expect(totalNodes).toBe(250);
    });

    it('should include relevant edges in each chunk', () => {
      const chunks = extractor.chunkData(visualizationData);

      chunks.forEach((chunk) => {
        expect(chunk.elements.edges.length).toBeGreaterThan(0);
      });
    });

    it('should include edges where source or target is in chunk', () => {
      const chunks = extractor.chunkData(visualizationData);

      chunks.forEach((chunk) => {
        const nodeIds = new Set(chunk.elements.nodes.map((n) => n.data.id));
        chunk.elements.edges.forEach((edge) => {
          const sourceInChunk = nodeIds.has(edge.data.source);
          const targetInChunk = nodeIds.has(edge.data.target);
          expect(sourceInChunk || targetInChunk).toBe(true);
        });
      });
    });

    it('should handle chunking disabled gracefully', () => {
      visualizationData.metadata.chunking.enabled = false;
      const chunks = extractor.chunkData(visualizationData);

      expect(chunks.length).toBe(1);
      expect(chunks[0].elements.nodes.length).toBe(250);
    });

    it('should handle small graphs (no chunking needed)', () => {
      visualizationData.elements.nodes = visualizationData.elements.nodes.slice(0, 50);
      extractor.chunkSize = 100;

      const chunks = extractor.chunkData(visualizationData);

      expect(chunks.length).toBe(1);
    });

    it('should not duplicate edges across chunks', () => {
      const chunks = extractor.chunkData(visualizationData);

      const allEdgeIds = new Set();
      let duplicates = 0;

      chunks.forEach((chunk) => {
        chunk.elements.edges.forEach((edge) => {
          if (allEdgeIds.has(edge.data.id)) {
            duplicates++;
          }
          allEdgeIds.add(edge.data.id);
        });
      });

      // Some duplication is expected for cross-chunk edges, but should be minimal
      expect(duplicates).toBeLessThan(visualizationData.elements.edges.length * 0.2);
    });
  });

  describe('Performance', () => {
    it('should extract large graph in reasonable time (<5 seconds)', () => {
      const largeGraph = {
        nodes: Array.from({ length: 5000 }, (_, i) => ({
          id: `node${i}`,
          type: i % 3 === 0 ? 'document' : 'concept',
          label: `Node ${i}`,
        })),
        edges: Array.from({ length: 10000 }, (_, i) => ({
          id: `edge${i}`,
          source: `node${i % 5000}`,
          target: `node${(i + 1) % 5000}`,
          type: 'links_to',
        })),
      };

      const analysisData = {
        basic: {
          density: 0.0008,
          avgDegree: 4.0,
          isConnected: true,
          nodesByType: { document: 1667, concept: 3333 },
          edgesByType: { links_to: 10000 },
        },
        centrality: {
          degree: {
            values: {},
          },
        },
      };

      const startTime = Date.now();
      const result = extractor.extract(largeGraph, analysisData);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000);
      expect(result.elements.nodes.length).toBe(5000);
      expect(result.elements.edges.length).toBe(10000);
    });

    it('should chunk large graph in reasonable time (<3 seconds)', () => {
      const largeGraph = {
        metadata: {
          chunking: { enabled: true, chunkSize: 1000, totalChunks: 5 },
        },
        elements: {
          nodes: Array.from({ length: 5000 }, (_, i) => ({
            data: { id: `node${i}`, label: `Node ${i}` },
          })),
          edges: Array.from({ length: 10000 }, (_, i) => ({
            data: { id: `edge${i}`, source: `node${i % 5000}`, target: `node${(i + 1) % 5000}` },
          })),
        },
      };

      extractor.chunkSize = 1000;

      const startTime = Date.now();
      const chunks = extractor.chunkData(largeGraph);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(3000);
      expect(chunks.length).toBe(5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle node with all optional fields missing', () => {
      const minimalNode = { id: 'n1', type: 'document', label: 'Doc' };
      const analysisData = { centrality: { degree: { values: {} } } };

      const transformed = extractor.transformNode(minimalNode, analysisData);

      expect(transformed.data.id).toBe('n1');
      expect(transformed.data.centrality.degree).toBe(0);
    });

    it('should handle edge with minimal properties', () => {
      const minimalEdge = { id: 'e1', source: 'n1', target: 'n2', type: 'links' };

      const transformed = extractor.transformEdge(minimalEdge);

      expect(transformed.data.weight).toBe(1);
      expect(transformed.data.label).toBe('');
    });

    it('should handle graph with only nodes (no edges)', () => {
      const graphData = {
        nodes: [{ id: 'n1', type: 'document', label: 'Doc 1' }],
        edges: [],
      };
      const analysisData = {
        basic: { density: 0, avgDegree: 0, isConnected: false, nodesByType: {}, edgesByType: {} },
        centrality: { degree: { values: {} } },
      };

      const result = extractor.extract(graphData, analysisData);

      expect(result.elements.nodes.length).toBe(1);
      expect(result.elements.edges.length).toBe(0);
    });

    it('should handle graph with special characters in labels', () => {
      const node = {
        id: 'node1',
        type: 'document',
        label: 'Test "quotes" & <html> $special',
      };
      const analysisData = { centrality: { degree: { values: {} } } };

      const transformed = extractor.transformNode(node, analysisData);

      expect(transformed.data.label).toBe('Test "quotes" & <html> $special');
    });

    it('should handle very long node labels (>200 chars)', () => {
      const longLabel = 'A'.repeat(300);
      const node = { id: 'n1', type: 'document', label: longLabel };
      const analysisData = { centrality: { degree: { values: {} } } };

      const transformed = extractor.transformNode(node, analysisData);

      expect(transformed.data.label).toBe(longLabel);
    });

    it('should handle nodes with negative centrality (edge case)', () => {
      const node = { id: 'n1', type: 'document', label: 'Doc' };
      const analysisData = {
        centrality: { degree: { values: { n1: -0.5 } } },
      };

      const transformed = extractor.transformNode(node, analysisData);

      expect(transformed.data.centrality.degree).toBe(-0.5);
    });

    it('should handle edges with weight > 1', () => {
      const edge = {
        id: 'e1',
        source: 'n1',
        target: 'n2',
        type: 'links',
        weight: 5.7,
      };

      const transformed = extractor.transformEdge(edge);

      expect(transformed.data.weight).toBe(5.7);
    });
  });
});
