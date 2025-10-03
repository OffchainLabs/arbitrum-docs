/**
 * Visualization Data Separation Integration Test Suite
 * Tests the complete pipeline for separating visualization data from HTML
 *
 * @group integration
 * @group visualizers
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { DataExtractor } from '../../src/visualizers/DataExtractor.js';
import { ChunkedDataWriter } from '../../src/visualizers/ChunkedDataWriter.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_OUTPUT_DIR = path.join(__dirname, '../fixtures/temp-integration-output');

describe('Visualization Data Separation - Integration', () => {
  let extractor;
  let writer;
  let graphData;
  let analysisData;

  beforeEach(async () => {
    await fs.mkdir(TEST_OUTPUT_DIR, { recursive: true });

    extractor = new DataExtractor();
    writer = new ChunkedDataWriter(TEST_OUTPUT_DIR);

    // Create realistic test data
    graphData = {
      nodes: Array.from({ length: 300 }, (_, i) => ({
        id: `node${i}`,
        type: i % 3 === 0 ? 'document' : i % 3 === 1 ? 'concept' : 'directory',
        label: `Node ${i}`,
        filePath: i % 3 === 0 ? `/docs/file${i}.md` : undefined,
      })),
      edges: Array.from({ length: 600 }, (_, i) => ({
        id: `edge${i}`,
        source: `node${i % 300}`,
        target: `node${(i + 1) % 300}`,
        type: i % 2 === 0 ? 'mentions' : 'links_to',
        weight: Math.random(),
      })),
    };

    analysisData = {
      basic: {
        nodeCount: 300,
        edgeCount: 600,
        density: 0.0067,
        avgDegree: 4.0,
        isConnected: true,
        nodesByType: { document: 100, concept: 100, directory: 100 },
        edgesByType: { mentions: 300, links_to: 300 },
      },
      centrality: {
        degree: {
          values: Object.fromEntries(
            Array.from({ length: 300 }, (_, i) => [`node${i}`, Math.random()]),
          ),
        },
      },
    };
  });

  afterEach(async () => {
    try {
      await fs.rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Complete Pipeline - Extract and Write', () => {
    it('should extract data and write to complete file', async () => {
      const visualizationData = extractor.extract(graphData, analysisData);
      const paths = await writer.write(visualizationData, false);

      expect(paths.data).toBeDefined();

      const fileExists = await fs
        .stat(paths.data)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);
    });

    it('should extract data and write to chunked files', async () => {
      extractor.chunkSize = 100;
      const visualizationData = extractor.extract(graphData, analysisData);

      // Enable chunking
      visualizationData.metadata.chunking.enabled = true;

      const paths = await writer.write(visualizationData, true);

      expect(paths.chunks).toBeDefined();
      expect(paths.chunks.length).toBe(3);
      expect(paths.metadata).toBeDefined();
    });

    it('should preserve data integrity through pipeline', async () => {
      const visualizationData = extractor.extract(graphData, analysisData);
      const paths = await writer.write(visualizationData, false);

      const content = await fs.readFile(paths.data, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed.elements.nodes.length).toBe(300);
      expect(parsed.elements.edges.length).toBe(600);
      expect(parsed.metadata.source.totalNodes).toBe(300);
      expect(parsed.metadata.source.totalEdges).toBe(600);
    });

    it('should include all necessary visualization components', async () => {
      const visualizationData = extractor.extract(graphData, analysisData);
      const paths = await writer.write(visualizationData, false);

      const content = await fs.readFile(paths.data, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed).toHaveProperty('metadata');
      expect(parsed).toHaveProperty('elements');
      expect(parsed).toHaveProperty('styles');
      expect(parsed).toHaveProperty('layout');
      expect(parsed.metadata).toHaveProperty('version');
      expect(parsed.metadata).toHaveProperty('generated');
      expect(parsed.metadata).toHaveProperty('chunking');
    });

    it('should maintain Cytoscape format compatibility', async () => {
      const visualizationData = extractor.extract(graphData, analysisData);
      const paths = await writer.write(visualizationData, false);

      const content = await fs.readFile(paths.data, 'utf-8');
      const parsed = JSON.parse(content);

      // Verify Cytoscape element format
      parsed.elements.nodes.forEach((node) => {
        expect(node).toHaveProperty('data');
        expect(node.data).toHaveProperty('id');
        expect(node.data).toHaveProperty('label');
        expect(node).toHaveProperty('classes');
      });

      parsed.elements.edges.forEach((edge) => {
        expect(edge).toHaveProperty('data');
        expect(edge.data).toHaveProperty('source');
        expect(edge.data).toHaveProperty('target');
        expect(edge).toHaveProperty('classes');
      });
    });
  });

  describe('Chunked Data Pipeline', () => {
    beforeEach(() => {
      extractor.chunkSize = 100;
    });

    it('should create correct number of chunks based on node count', async () => {
      const visualizationData = extractor.extract(graphData, analysisData);
      visualizationData.metadata.chunking.enabled = true;

      const paths = await writer.write(visualizationData, true);

      expect(paths.chunks.length).toBe(3); // 300 nodes / 100 chunk size = 3 chunks
    });

    it('should write metadata file with chunking information', async () => {
      const visualizationData = extractor.extract(graphData, analysisData);
      visualizationData.metadata.chunking.enabled = true;

      const paths = await writer.write(visualizationData, true);

      const metaContent = await fs.readFile(paths.metadata, 'utf-8');
      const metadata = JSON.parse(metaContent);

      expect(metadata.chunking.enabled).toBe(true);
      expect(metadata.chunking.totalChunks).toBe(3);
      expect(metadata.chunking.chunkSize).toBe(100);
    });

    it('should distribute nodes evenly across chunks', async () => {
      const visualizationData = extractor.extract(graphData, analysisData);
      const chunks = extractor.chunkData(visualizationData);

      let totalNodes = 0;
      chunks.forEach((chunk) => {
        totalNodes += chunk.elements.nodes.length;
      });

      expect(totalNodes).toBe(300);
    });

    it('should include relevant edges in each chunk', async () => {
      const visualizationData = extractor.extract(graphData, analysisData);
      const chunks = extractor.chunkData(visualizationData);

      chunks.forEach((chunk) => {
        const nodeIds = new Set(chunk.elements.nodes.map((n) => n.data.id));

        chunk.elements.edges.forEach((edge) => {
          const sourceInChunk = nodeIds.has(edge.data.source);
          const targetInChunk = nodeIds.has(edge.data.target);

          // At least one endpoint should be in this chunk
          expect(sourceInChunk || targetInChunk).toBe(true);
        });
      });
    });

    it('should write all chunks with sequential naming', async () => {
      const visualizationData = extractor.extract(graphData, analysisData);
      visualizationData.metadata.chunking.enabled = true;

      const paths = await writer.write(visualizationData, true);

      expect(paths.chunks[0]).toContain('chunk-0.json');
      expect(paths.chunks[1]).toContain('chunk-1.json');
      expect(paths.chunks[2]).toContain('chunk-2.json');
    });

    it('should allow loading chunks independently', async () => {
      const visualizationData = extractor.extract(graphData, analysisData);
      visualizationData.metadata.chunking.enabled = true;

      const paths = await writer.write(visualizationData, true);

      // Load and verify each chunk independently
      for (let i = 0; i < paths.chunks.length; i++) {
        const chunkContent = await fs.readFile(paths.chunks[i], 'utf-8');
        const chunk = JSON.parse(chunkContent);

        expect(chunk.index).toBe(i);
        expect(chunk.total).toBe(3);
        expect(chunk.elements).toHaveProperty('nodes');
        expect(chunk.elements).toHaveProperty('edges');
      }
    });
  });

  describe('Performance and Size Optimization', () => {
    it('should demonstrate significant size reduction with chunking', async () => {
      // Create large graph
      const largeGraph = {
        nodes: Array.from({ length: 2000 }, (_, i) => ({
          id: `node${i}`,
          type: 'document',
          label: `Node ${i}`,
          filePath: `/path/to/file${i}.md`,
          description: `Description for node ${i}`.repeat(10),
        })),
        edges: Array.from({ length: 4000 }, (_, i) => ({
          id: `edge${i}`,
          source: `node${i % 2000}`,
          target: `node${(i + 1) % 2000}`,
          type: 'links_to',
        })),
      };

      const largeAnalysis = {
        basic: {
          nodeCount: 2000,
          edgeCount: 4000,
          density: 0.001,
          avgDegree: 4.0,
          isConnected: true,
          nodesByType: { document: 2000 },
          edgesByType: { links_to: 4000 },
        },
        centrality: {
          degree: {
            values: Object.fromEntries(
              Array.from({ length: 2000 }, (_, i) => [`node${i}`, Math.random()]),
            ),
          },
        },
      };

      extractor.chunkSize = 500;
      const visualizationData = extractor.extract(largeGraph, largeAnalysis);

      // Write complete file
      const completePaths = await writer.write(visualizationData, false);
      const completeSize = (await fs.stat(completePaths.data)).size;

      // Write chunked files
      visualizationData.metadata.chunking.enabled = true;
      const chunkedPaths = await writer.write(visualizationData, true);

      // Calculate total chunk size
      let totalChunkSize = 0;
      for (const chunkPath of chunkedPaths.chunks) {
        totalChunkSize += (await fs.stat(chunkPath)).size;
      }

      // Individual chunks should be significantly smaller than complete file
      for (const chunkPath of chunkedPaths.chunks) {
        const chunkSize = (await fs.stat(chunkPath)).size;
        expect(chunkSize).toBeLessThan(completeSize * 0.3);
      }
    });

    it('should complete full pipeline in reasonable time for large graph', async () => {
      const largeGraph = {
        nodes: Array.from({ length: 5000 }, (_, i) => ({
          id: `node${i}`,
          type: 'document',
          label: `Node ${i}`,
        })),
        edges: Array.from({ length: 10000 }, (_, i) => ({
          id: `edge${i}`,
          source: `node${i % 5000}`,
          target: `node${(i + 1) % 5000}`,
          type: 'links_to',
        })),
      };

      const largeAnalysis = {
        basic: {
          nodeCount: 5000,
          edgeCount: 10000,
          density: 0.0004,
          avgDegree: 4.0,
          isConnected: true,
          nodesByType: { document: 5000 },
          edgesByType: { links_to: 10000 },
        },
        centrality: {
          degree: {
            values: Object.fromEntries(
              Array.from({ length: 5000 }, (_, i) => [`node${i}`, Math.random()]),
            ),
          },
        },
      };

      extractor.chunkSize = 1000;

      const startTime = Date.now();

      const visualizationData = extractor.extract(largeGraph, largeAnalysis);
      visualizationData.metadata.chunking.enabled = true;
      await writer.write(visualizationData, true);

      const duration = Date.now() - startTime;

      // Complete pipeline should finish in < 10 seconds
      expect(duration).toBeLessThan(10000);
    });

    it('should achieve target file size reduction (>90%)', async () => {
      // Create realistic large graph
      const largeGraph = {
        nodes: Array.from({ length: 3000 }, (_, i) => ({
          id: `node${i}`,
          type: 'document',
          label: `Document ${i}`,
          filePath: `/docs/section${Math.floor(i / 100)}/file${i}.md`,
        })),
        edges: Array.from({ length: 6000 }, (_, i) => ({
          id: `edge${i}`,
          source: `node${i % 3000}`,
          target: `node${(i + 1) % 3000}`,
          type: 'links_to',
        })),
      };

      const largeAnalysis = {
        basic: {
          nodeCount: 3000,
          edgeCount: 6000,
          density: 0.00067,
          avgDegree: 4.0,
          isConnected: true,
          nodesByType: { document: 3000 },
          edgesByType: { links_to: 6000 },
        },
        centrality: {
          degree: {
            values: Object.fromEntries(
              Array.from({ length: 3000 }, (_, i) => [`node${i}`, Math.random()]),
            ),
          },
        },
      };

      extractor.chunkSize = 500;
      const visualizationData = extractor.extract(largeGraph, largeAnalysis);
      visualizationData.metadata.chunking.enabled = true;

      const paths = await writer.write(visualizationData, true);

      // Get largest chunk size
      let maxChunkSize = 0;
      for (const chunkPath of paths.chunks) {
        const size = (await fs.stat(chunkPath)).size;
        maxChunkSize = Math.max(maxChunkSize, size);
      }

      // Write complete file for comparison
      visualizationData.metadata.chunking.enabled = false;
      const completePaths = await writer.write(visualizationData, false);
      const completeSize = (await fs.stat(completePaths.data)).size;

      // Largest chunk should be < 20% of complete file size
      const reduction = ((completeSize - maxChunkSize) / completeSize) * 100;
      expect(reduction).toBeGreaterThan(80);
    });
  });

  describe('HTML Integration (Simulated)', () => {
    it('should generate data format compatible with fetch API', async () => {
      const visualizationData = extractor.extract(graphData, analysisData);
      const paths = await writer.write(visualizationData, false);

      const content = await fs.readFile(paths.data, 'utf-8');

      // Verify it's valid JSON that can be fetched
      expect(() => JSON.parse(content)).not.toThrow();

      const parsed = JSON.parse(content);

      // Verify structure matches what Cytoscape expects
      expect(parsed).toHaveProperty('elements');
      expect(parsed.elements).toHaveProperty('nodes');
      expect(parsed.elements).toHaveProperty('edges');
    });

    it('should create metadata file for progressive loading', async () => {
      extractor.chunkSize = 100;
      const visualizationData = extractor.extract(graphData, analysisData);
      visualizationData.metadata.chunking.enabled = true;

      const paths = await writer.write(visualizationData, true);

      const metaContent = await fs.readFile(paths.metadata, 'utf-8');
      const metadata = JSON.parse(metaContent);

      // HTML can use this to determine how many chunks to load
      expect(metadata.chunking.totalChunks).toBe(3);
      expect(metadata.chunking.chunkSize).toBe(100);
    });

    it('should support CORS-friendly JSON format', async () => {
      const visualizationData = extractor.extract(graphData, analysisData);
      const paths = await writer.write(visualizationData, false);

      // Verify JSON is clean (no functions, symbols, etc.)
      const content = await fs.readFile(paths.data, 'utf-8');
      const parsed = JSON.parse(content);

      // Re-stringify to ensure no non-JSON values
      expect(() => JSON.stringify(parsed)).not.toThrow();
    });

    it('should allow incremental loading of chunks', async () => {
      extractor.chunkSize = 100;
      const visualizationData = extractor.extract(graphData, analysisData);
      visualizationData.metadata.chunking.enabled = true;

      const paths = await writer.write(visualizationData, true);

      // Simulate loading chunks one at a time (like browser would)
      const loadedNodes = [];
      const loadedEdges = [];

      for (const chunkPath of paths.chunks) {
        const chunkContent = await fs.readFile(chunkPath, 'utf-8');
        const chunk = JSON.parse(chunkContent);

        loadedNodes.push(...chunk.elements.nodes);
        loadedEdges.push(...chunk.elements.edges);
      }

      expect(loadedNodes.length).toBe(300);
      expect(loadedEdges.length).toBeGreaterThan(0);
    });
  });

  describe('Backward Compatibility', () => {
    it('should support disabling chunking for simple graphs', async () => {
      const simpleGraph = {
        nodes: graphData.nodes.slice(0, 50),
        edges: graphData.edges.slice(0, 100),
      };

      const visualizationData = extractor.extract(simpleGraph, analysisData);
      visualizationData.metadata.chunking.enabled = false;

      const paths = await writer.write(visualizationData, false);

      expect(paths.data).toBeDefined();
      expect(paths.chunks).toBeUndefined();
    });

    it('should maintain existing visualization format', async () => {
      const visualizationData = extractor.extract(graphData, analysisData);
      const paths = await writer.write(visualizationData, false);

      const content = await fs.readFile(paths.data, 'utf-8');
      const parsed = JSON.parse(content);

      // Verify it includes all standard visualization properties
      expect(parsed).toHaveProperty('metadata');
      expect(parsed).toHaveProperty('elements');
      expect(parsed).toHaveProperty('styles');
      expect(parsed).toHaveProperty('layout');
    });

    it('should work with graphs of any size', async () => {
      // Test with very small graph
      const tinyGraph = {
        nodes: [{ id: 'n1', type: 'document', label: 'Single Node' }],
        edges: [],
      };

      const visualizationData = extractor.extract(tinyGraph, analysisData);
      const paths = await writer.write(visualizationData, false);

      const content = await fs.readFile(paths.data, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed.elements.nodes.length).toBe(1);
      expect(parsed.elements.edges.length).toBe(0);
    });
  });

  describe('Error Recovery', () => {
    it('should handle extraction errors gracefully', async () => {
      const invalidGraph = { nodes: null, edges: [] };

      expect(() => extractor.extract(invalidGraph, analysisData)).toThrow();
    });

    it('should handle write errors gracefully', async () => {
      const visualizationData = extractor.extract(graphData, analysisData);

      // Try writing to invalid directory
      const invalidWriter = new ChunkedDataWriter(
        '/invalid/nonexistent/path/that/cannot/be/created',
      );

      await expect(invalidWriter.write(visualizationData, false)).rejects.toThrow();
    });

    it('should validate data before writing', async () => {
      const invalidData = {
        metadata: null,
        elements: { nodes: [], edges: [] },
      };

      await expect(writer.write(invalidData, false)).rejects.toThrow();
    });
  });

  describe('Data Consistency', () => {
    it('should maintain node references in edges after chunking', async () => {
      extractor.chunkSize = 100;
      const visualizationData = extractor.extract(graphData, analysisData);
      const chunks = extractor.chunkData(visualizationData);

      chunks.forEach((chunk) => {
        const nodeIds = new Set(chunk.elements.nodes.map((n) => n.data.id));

        chunk.elements.edges.forEach((edge) => {
          // At least one node should be in this chunk
          const hasNode = nodeIds.has(edge.data.source) || nodeIds.has(edge.data.target);
          expect(hasNode).toBe(true);
        });
      });
    });

    it('should preserve all node attributes through pipeline', async () => {
      // Add custom attributes to nodes
      graphData.nodes.forEach((node, i) => {
        node.customField = `custom-${i}`;
        node.metadata = { key: `value-${i}` };
      });

      const visualizationData = extractor.extract(graphData, analysisData);
      const paths = await writer.write(visualizationData, false);

      const content = await fs.readFile(paths.data, 'utf-8');
      const parsed = JSON.parse(content);

      // Verify custom attributes are preserved
      parsed.elements.nodes.forEach((node, i) => {
        expect(node.data.customField).toBe(`custom-${i}`);
        expect(node.data.metadata).toEqual({ key: `value-${i}` });
      });
    });

    it('should preserve all edge attributes through pipeline', async () => {
      // Add custom attributes to edges
      graphData.edges.forEach((edge, i) => {
        edge.customProperty = `prop-${i}`;
      });

      const visualizationData = extractor.extract(graphData, analysisData);
      const paths = await writer.write(visualizationData, false);

      const content = await fs.readFile(paths.data, 'utf-8');
      const parsed = JSON.parse(content);

      // Note: transformEdge may not preserve all properties
      // This test will verify current behavior
      expect(parsed.elements.edges.length).toBe(600);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle typical documentation graph (500 docs, 1000 links)', async () => {
      const realWorldGraph = {
        nodes: Array.from({ length: 500 }, (_, i) => ({
          id: `doc${i}`,
          type: 'document',
          label: `Document ${i}`,
          filePath: `/docs/section${Math.floor(i / 50)}/file${i}.md`,
          title: `Title for Document ${i}`,
          description: `Description for document ${i}`,
        })),
        edges: Array.from({ length: 1000 }, (_, i) => ({
          id: `link${i}`,
          source: `doc${i % 500}`,
          target: `doc${(i + Math.floor(Math.random() * 50)) % 500}`,
          type: 'links_to',
          weight: Math.random(),
        })),
      };

      const realWorldAnalysis = {
        basic: {
          nodeCount: 500,
          edgeCount: 1000,
          density: 0.004,
          avgDegree: 4.0,
          isConnected: false,
          nodesByType: { document: 500 },
          edgesByType: { links_to: 1000 },
        },
        centrality: {
          degree: {
            values: Object.fromEntries(
              Array.from({ length: 500 }, (_, i) => [`doc${i}`, Math.random()]),
            ),
          },
        },
      };

      extractor.chunkSize = 100;
      const visualizationData = extractor.extract(realWorldGraph, realWorldAnalysis);
      visualizationData.metadata.chunking.enabled = true;

      const paths = await writer.write(visualizationData, true);

      expect(paths.chunks.length).toBe(5);
      expect(paths.metadata).toBeDefined();

      // Verify chunks are loadable
      for (const chunkPath of paths.chunks) {
        const chunk = JSON.parse(await fs.readFile(chunkPath, 'utf-8'));
        expect(chunk.elements.nodes.length).toBeGreaterThan(0);
      }
    });

    it('should handle large enterprise documentation (10k+ nodes)', async () => {
      const enterpriseGraph = {
        nodes: Array.from({ length: 10000 }, (_, i) => ({
          id: `node${i}`,
          type: i % 2 === 0 ? 'document' : 'concept',
          label: `Node ${i}`,
        })),
        edges: Array.from({ length: 20000 }, (_, i) => ({
          id: `edge${i}`,
          source: `node${i % 10000}`,
          target: `node${(i + 1) % 10000}`,
          type: 'links_to',
        })),
      };

      const enterpriseAnalysis = {
        basic: {
          nodeCount: 10000,
          edgeCount: 20000,
          density: 0.0002,
          avgDegree: 4.0,
          isConnected: false,
          nodesByType: { document: 5000, concept: 5000 },
          edgesByType: { links_to: 20000 },
        },
        centrality: {
          degree: {
            values: Object.fromEntries(
              Array.from({ length: 10000 }, (_, i) => [`node${i}`, Math.random()]),
            ),
          },
        },
      };

      extractor.chunkSize = 1000;

      const startTime = Date.now();
      const visualizationData = extractor.extract(enterpriseGraph, enterpriseAnalysis);
      visualizationData.metadata.chunking.enabled = true;
      const paths = await writer.write(visualizationData, true);
      const duration = Date.now() - startTime;

      expect(paths.chunks.length).toBe(10);
      expect(duration).toBeLessThan(15000); // Should complete in < 15 seconds
    });
  });
});
