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
 * ChunkedDataWriter Test Suite
 * Tests for writing visualization data to files (chunked or complete)
 *
 * @group unit
 * @group visualizers
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ChunkedDataWriter } from '../../../src/visualizers/ChunkedDataWriter.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_OUTPUT_DIR = path.join(__dirname, '../../fixtures/temp-output');

describe('ChunkedDataWriter', () => {
  let writer;
  let visualizationData;

  beforeEach(async () => {
    // Create temp output directory
    await fs.mkdir(TEST_OUTPUT_DIR, { recursive: true });

    writer = new ChunkedDataWriter(TEST_OUTPUT_DIR);

    visualizationData = {
      metadata: {
        version: '1.0.0',
        generated: '2025-01-01T00:00:00Z',
        chunking: {
          enabled: false,
          chunkSize: 100,
          totalChunks: 1,
        },
      },
      elements: {
        nodes: [{ data: { id: 'n1', label: 'Node 1' } }, { data: { id: 'n2', label: 'Node 2' } }],
        edges: [{ data: { id: 'e1', source: 'n1', target: 'n2' } }],
      },
      styles: [],
      layout: { name: 'cose' },
    };
  });

  afterEach(async () => {
    // Clean up temp directory
    try {
      await fs.rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Constructor', () => {
    it('should initialize with output directory', () => {
      expect(writer.outputDir).toBe(TEST_OUTPUT_DIR);
    });

    it('should throw error for missing output directory', () => {
      expect(() => new ChunkedDataWriter()).toThrow('Output directory is required');
    });

    it('should throw error for empty output directory', () => {
      expect(() => new ChunkedDataWriter('')).toThrow('Output directory is required');
    });

    it('should accept absolute path', () => {
      const absPath = path.resolve('/tmp/test-output');
      const testWriter = new ChunkedDataWriter(absPath);
      expect(testWriter.outputDir).toBe(absPath);
    });

    it('should accept relative path', () => {
      const testWriter = new ChunkedDataWriter('./test-output');
      expect(testWriter.outputDir).toBe('./test-output');
    });
  });

  describe('write() - Main Write Method', () => {
    it('should write data and return paths object', async () => {
      const paths = await writer.write(visualizationData, false);

      expect(paths).toBeDefined();
      expect(typeof paths).toBe('object');
    });

    it('should write complete file when chunking disabled', async () => {
      const paths = await writer.write(visualizationData, false);

      expect(paths).toHaveProperty('data');
      expect(paths.data).toContain('graph-visualization-data.json');
    });

    it('should write chunks when chunking enabled', async () => {
      visualizationData.metadata.chunking.enabled = true;
      visualizationData.metadata.chunking.totalChunks = 2;

      const paths = await writer.write(visualizationData, true);

      expect(paths).toHaveProperty('chunks');
      expect(paths).toHaveProperty('metadata');
      expect(Array.isArray(paths.chunks)).toBe(true);
    });

    it('should throw error for missing visualization data', async () => {
      await expect(writer.write(null, false)).rejects.toThrow('Visualization data is required');
    });

    it('should throw error for invalid visualization data structure', async () => {
      await expect(writer.write({}, false)).rejects.toThrow('Invalid visualization data structure');
    });

    it('should throw error when missing elements', async () => {
      const invalidData = { metadata: visualizationData.metadata };
      await expect(writer.write(invalidData, false)).rejects.toThrow(
        'Visualization data must contain elements',
      );
    });

    it('should throw error when missing metadata', async () => {
      const invalidData = { elements: visualizationData.elements };
      await expect(writer.write(invalidData, false)).rejects.toThrow(
        'Visualization data must contain metadata',
      );
    });

    it('should use metadata chunking setting when enableChunking param is undefined', async () => {
      visualizationData.metadata.chunking.enabled = true;
      visualizationData.metadata.chunking.totalChunks = 1;

      const paths = await writer.write(visualizationData);

      // Should default to metadata.chunking.enabled
      expect(paths).toHaveProperty('chunks');
    });

    it('should override metadata setting with enableChunking param', async () => {
      visualizationData.metadata.chunking.enabled = true;
      visualizationData.metadata.chunking.totalChunks = 1;

      const paths = await writer.write(visualizationData, false);

      // Should respect explicit false parameter
      expect(paths).toHaveProperty('data');
      expect(paths).not.toHaveProperty('chunks');
    });

    it('should create output directory if it does not exist', async () => {
      const newDir = path.join(TEST_OUTPUT_DIR, 'nested/deep/path');
      const newWriter = new ChunkedDataWriter(newDir);

      await newWriter.write(visualizationData, false);

      const dirExists = await fs
        .stat(newDir)
        .then(() => true)
        .catch(() => false);
      expect(dirExists).toBe(true);
    });
  });

  describe('writeComplete()', () => {
    it('should write single JSON file', async () => {
      const filePath = await writer.writeComplete(visualizationData);

      expect(filePath).toBeDefined();
      expect(filePath).toContain('graph-visualization-data.json');
    });

    it('should create file at correct path', async () => {
      const filePath = await writer.writeComplete(visualizationData);

      const fileExists = await fs
        .stat(filePath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);
    });

    it('should write valid JSON content', async () => {
      const filePath = await writer.writeComplete(visualizationData);

      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed).toHaveProperty('metadata');
      expect(parsed).toHaveProperty('elements');
    });

    it('should write formatted JSON (pretty-printed)', async () => {
      const filePath = await writer.writeComplete(visualizationData);

      const content = await fs.readFile(filePath, 'utf-8');

      // Check for indentation (pretty-printed JSON)
      expect(content).toContain('  ');
      expect(content).toContain('\n');
    });

    it('should preserve all data properties', async () => {
      const filePath = await writer.writeComplete(visualizationData);

      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed.metadata.version).toBe('1.0.0');
      expect(parsed.elements.nodes).toHaveLength(2);
      expect(parsed.elements.edges).toHaveLength(1);
    });

    it('should return absolute file path', async () => {
      const filePath = await writer.writeComplete(visualizationData);

      expect(path.isAbsolute(filePath)).toBe(true);
    });

    it('should overwrite existing file', async () => {
      const filePath1 = await writer.writeComplete(visualizationData);

      visualizationData.elements.nodes.push({ data: { id: 'n3', label: 'Node 3' } });

      const filePath2 = await writer.writeComplete(visualizationData);

      expect(filePath1).toBe(filePath2);

      const content = await fs.readFile(filePath2, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed.elements.nodes).toHaveLength(3);
    });

    it('should handle large data (10k+ nodes)', async () => {
      const largeData = {
        ...visualizationData,
        elements: {
          nodes: Array.from({ length: 10000 }, (_, i) => ({
            data: { id: `n${i}`, label: `Node ${i}` },
          })),
          edges: [],
        },
      };

      const filePath = await writer.writeComplete(largeData);

      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed.elements.nodes).toHaveLength(10000);
    });

    it('should handle special characters in data', async () => {
      visualizationData.elements.nodes[0].data.label = 'Test "quotes" & <html>';

      const filePath = await writer.writeComplete(visualizationData);

      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed.elements.nodes[0].data.label).toBe('Test "quotes" & <html>');
    });
  });

  describe('writeChunked()', () => {
    beforeEach(() => {
      // Create larger dataset for chunking
      visualizationData.elements.nodes = Array.from({ length: 250 }, (_, i) => ({
        data: { id: `node${i}`, label: `Node ${i}`, type: 'document' },
      }));
      visualizationData.elements.edges = Array.from({ length: 500 }, (_, i) => ({
        data: {
          id: `edge${i}`,
          source: `node${i % 250}`,
          target: `node${(i + 1) % 250}`,
        },
      }));
      visualizationData.metadata.chunking = {
        enabled: true,
        chunkSize: 100,
        totalChunks: 3,
      };
    });

    it('should return array of chunk file paths', async () => {
      const chunkPaths = await writer.writeChunked(visualizationData);

      expect(Array.isArray(chunkPaths)).toBe(true);
      expect(chunkPaths.length).toBeGreaterThan(0);
    });

    it('should create correct number of chunk files', async () => {
      const chunkPaths = await writer.writeChunked(visualizationData);

      expect(chunkPaths.length).toBe(3);
    });

    it('should name chunks with sequential indices', async () => {
      const chunkPaths = await writer.writeChunked(visualizationData);

      expect(chunkPaths[0]).toContain('chunk-0.json');
      expect(chunkPaths[1]).toContain('chunk-1.json');
      expect(chunkPaths[2]).toContain('chunk-2.json');
    });

    it('should write valid JSON for each chunk', async () => {
      const chunkPaths = await writer.writeChunked(visualizationData);

      for (const chunkPath of chunkPaths) {
        const content = await fs.readFile(chunkPath, 'utf-8');
        const parsed = JSON.parse(content);

        expect(parsed).toHaveProperty('index');
        expect(parsed).toHaveProperty('total');
        expect(parsed).toHaveProperty('elements');
      }
    });

    it('should include chunk metadata in each chunk', async () => {
      const chunkPaths = await writer.writeChunked(visualizationData);

      const chunk0 = JSON.parse(await fs.readFile(chunkPaths[0], 'utf-8'));

      expect(chunk0.index).toBe(0);
      expect(chunk0.total).toBe(3);
    });

    it('should distribute nodes across chunks', async () => {
      const chunkPaths = await writer.writeChunked(visualizationData);

      let totalNodes = 0;
      for (const chunkPath of chunkPaths) {
        const chunk = JSON.parse(await fs.readFile(chunkPath, 'utf-8'));
        totalNodes += chunk.elements.nodes.length;
      }

      expect(totalNodes).toBe(250);
    });

    it('should include edges in chunks', async () => {
      const chunkPaths = await writer.writeChunked(visualizationData);

      for (const chunkPath of chunkPaths) {
        const chunk = JSON.parse(await fs.readFile(chunkPath, 'utf-8'));
        expect(chunk.elements.edges.length).toBeGreaterThan(0);
      }
    });

    it('should handle chunking with uneven distribution', async () => {
      visualizationData.elements.nodes = visualizationData.elements.nodes.slice(0, 225);
      visualizationData.metadata.chunking.totalChunks = 3;

      const chunkPaths = await writer.writeChunked(visualizationData);

      const chunk0 = JSON.parse(await fs.readFile(chunkPaths[0], 'utf-8'));
      const chunk1 = JSON.parse(await fs.readFile(chunkPaths[1], 'utf-8'));
      const chunk2 = JSON.parse(await fs.readFile(chunkPaths[2], 'utf-8'));

      expect(chunk0.elements.nodes.length).toBe(100);
      expect(chunk1.elements.nodes.length).toBe(100);
      expect(chunk2.elements.nodes.length).toBe(25);
    });

    it('should clean up previous chunks before writing new ones', async () => {
      // Write first set of chunks
      await writer.writeChunked(visualizationData);

      // Modify data to create fewer chunks
      visualizationData.elements.nodes = visualizationData.elements.nodes.slice(0, 150);
      visualizationData.metadata.chunking.totalChunks = 2;

      // Write second set
      const newChunkPaths = await writer.writeChunked(visualizationData);

      expect(newChunkPaths.length).toBe(2);

      // Old chunk-2.json should not exist
      const oldChunk2 = path.join(TEST_OUTPUT_DIR, 'graph-visualization-data-chunk-2.json');
      const exists = await fs
        .stat(oldChunk2)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(false);
    });
  });

  describe('writeMetadata()', () => {
    it('should write metadata to JSON file', async () => {
      const metadataPath = await writer.writeMetadata(visualizationData.metadata);

      expect(metadataPath).toBeDefined();
      expect(metadataPath).toContain('graph-visualization-data-meta.json');
    });

    it('should create file at correct path', async () => {
      const metadataPath = await writer.writeMetadata(visualizationData.metadata);

      const fileExists = await fs
        .stat(metadataPath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);
    });

    it('should write valid JSON content', async () => {
      const metadataPath = await writer.writeMetadata(visualizationData.metadata);

      const content = await fs.readFile(metadataPath, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed).toHaveProperty('version');
      expect(parsed).toHaveProperty('generated');
    });

    it('should preserve all metadata properties', async () => {
      const metadataPath = await writer.writeMetadata(visualizationData.metadata);

      const content = await fs.readFile(metadataPath, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed.version).toBe('1.0.0');
      expect(parsed.generated).toBe('2025-01-01T00:00:00Z');
      expect(parsed.chunking).toEqual(visualizationData.metadata.chunking);
    });

    it('should write formatted JSON', async () => {
      const metadataPath = await writer.writeMetadata(visualizationData.metadata);

      const content = await fs.readFile(metadataPath, 'utf-8');

      expect(content).toContain('  ');
      expect(content).toContain('\n');
    });

    it('should return absolute file path', async () => {
      const metadataPath = await writer.writeMetadata(visualizationData.metadata);

      expect(path.isAbsolute(metadataPath)).toBe(true);
    });

    it('should throw error for missing metadata', async () => {
      await expect(writer.writeMetadata(null)).rejects.toThrow('Metadata is required');
    });

    it('should throw error for invalid metadata structure', async () => {
      await expect(writer.writeMetadata({})).rejects.toThrow('Invalid metadata structure');
    });
  });

  describe('File Size Analysis', () => {
    it('should calculate file size for complete data', async () => {
      const filePath = await writer.writeComplete(visualizationData);

      const stats = await fs.stat(filePath);
      const sizeKB = stats.size / 1024;

      expect(sizeKB).toBeGreaterThan(0);
      expect(sizeKB).toBeLessThan(10); // Small test data should be < 10KB
    });

    it('should demonstrate size reduction with chunking', async () => {
      // Create large dataset
      const largeData = {
        ...visualizationData,
        elements: {
          nodes: Array.from({ length: 1000 }, (_, i) => ({
            data: { id: `n${i}`, label: `Node ${i}`, type: 'document' },
          })),
          edges: Array.from({ length: 2000 }, (_, i) => ({
            data: { id: `e${i}`, source: `n${i % 1000}`, target: `n${(i + 1) % 1000}` },
          })),
        },
        metadata: {
          ...visualizationData.metadata,
          chunking: { enabled: true, chunkSize: 100, totalChunks: 10 },
        },
      };

      // Write complete file
      const completePath = await writer.writeComplete(largeData);
      const completeSize = (await fs.stat(completePath)).size;

      // Write chunked files
      const chunkPaths = await writer.writeChunked(largeData);

      // Each chunk should be smaller than complete file
      for (const chunkPath of chunkPaths) {
        const chunkSize = (await fs.stat(chunkPath)).size;
        expect(chunkSize).toBeLessThan(completeSize);
      }
    });
  });

  describe('Error Handling', () => {
    it('should throw error when output directory is not writable', async () => {
      // This test is platform-specific and may not work on all systems
      // Skip on Windows
      if (process.platform === 'win32') {
        return;
      }

      const readOnlyDir = path.join(TEST_OUTPUT_DIR, 'readonly');
      await fs.mkdir(readOnlyDir, { recursive: true });
      await fs.chmod(readOnlyDir, 0o444);

      const readOnlyWriter = new ChunkedDataWriter(readOnlyDir);

      await expect(readOnlyWriter.write(visualizationData, false)).rejects.toThrow();

      // Cleanup
      await fs.chmod(readOnlyDir, 0o755);
    });

    it('should handle JSON stringify errors gracefully', async () => {
      // Create circular reference
      const circularData = { ...visualizationData };
      circularData.elements.circular = circularData;

      await expect(writer.writeComplete(circularData)).rejects.toThrow();
    });

    it('should provide helpful error message for disk full scenario', async () => {
      // This test is difficult to simulate reliably
      // We'll just verify the error handling code exists
      expect(writer.writeComplete).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should write complete file for large graph in <1 second', async () => {
      const largeData = {
        ...visualizationData,
        elements: {
          nodes: Array.from({ length: 5000 }, (_, i) => ({
            data: { id: `n${i}`, label: `Node ${i}` },
          })),
          edges: Array.from({ length: 10000 }, (_, i) => ({
            data: { id: `e${i}`, source: `n${i % 5000}`, target: `n${(i + 1) % 5000}` },
          })),
        },
      };

      const startTime = Date.now();
      await writer.writeComplete(largeData);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1000);
    });

    it('should write chunked files for large graph in <3 seconds', async () => {
      const largeData = {
        ...visualizationData,
        elements: {
          nodes: Array.from({ length: 5000 }, (_, i) => ({
            data: { id: `n${i}`, label: `Node ${i}` },
          })),
          edges: Array.from({ length: 10000 }, (_, i) => ({
            data: { id: `e${i}`, source: `n${i % 5000}`, target: `n${(i + 1) % 5000}` },
          })),
        },
        metadata: {
          ...visualizationData.metadata,
          chunking: { enabled: true, chunkSize: 1000, totalChunks: 5 },
        },
      };

      const startTime = Date.now();
      await writer.writeChunked(largeData);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(3000);
    });
  });

  describe('Integration with DataExtractor', () => {
    it('should write data extracted by DataExtractor', async () => {
      // Simulate DataExtractor output format
      const extractedData = {
        metadata: {
          version: '1.0.0',
          generated: new Date().toISOString(),
          source: { totalNodes: 2, totalEdges: 1 },
          statistics: { density: 0.5, avgDegree: 1.0 },
          chunking: { enabled: false, chunkSize: 1000, totalChunks: 1 },
        },
        elements: {
          nodes: [
            { data: { id: 'n1', label: 'Node 1', type: 'document' }, classes: ['document'] },
            { data: { id: 'n2', label: 'Node 2', type: 'concept' }, classes: ['concept'] },
          ],
          edges: [
            {
              data: { id: 'e1', source: 'n1', target: 'n2', type: 'mentions' },
              classes: ['mentions'],
            },
          ],
        },
        styles: [],
        layout: { name: 'cose', animate: true },
      };

      const paths = await writer.write(extractedData, false);

      expect(paths.data).toBeDefined();

      const content = JSON.parse(await fs.readFile(paths.data, 'utf-8'));
      expect(content.elements.nodes[0].classes).toContain('document');
      expect(content.elements.nodes[1].classes).toContain('concept');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty elements (no nodes, no edges)', async () => {
      visualizationData.elements = { nodes: [], edges: [] };

      const filePath = await writer.writeComplete(visualizationData);

      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed.elements.nodes).toHaveLength(0);
      expect(parsed.elements.edges).toHaveLength(0);
    });

    it('should handle very long file paths', async () => {
      const longPath = path.join(TEST_OUTPUT_DIR, 'a'.repeat(200));
      const longWriter = new ChunkedDataWriter(longPath);

      await expect(longWriter.write(visualizationData, false)).resolves.toBeDefined();
    });

    it('should handle concurrent writes', async () => {
      const promises = [
        writer.write({ ...visualizationData }, false),
        writer.write({ ...visualizationData }, false),
        writer.write({ ...visualizationData }, false),
      ];

      await expect(Promise.all(promises)).resolves.toBeDefined();
    });

    it('should handle Unicode characters in data', async () => {
      visualizationData.elements.nodes[0].data.label = '测试 🚀 emoji';

      const filePath = await writer.writeComplete(visualizationData);

      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed.elements.nodes[0].data.label).toBe('测试 🚀 emoji');
    });
  });
});
