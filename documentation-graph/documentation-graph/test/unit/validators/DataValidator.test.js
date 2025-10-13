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
 * DataValidator Unit Tests
 *
 * These are FAILING tests (RED phase of TDD)
 * Implementation does not exist yet
 *
 * Tests for:
 * - Initialization with schema validator
 * - Validating graphs, documents, concepts, analysis
 * - Generating validation reports
 * - Handling invalid data
 * - Performance constraints
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createGraphBuilder,
  createDocumentBuilder,
  createConceptBuilder,
  createAnalysisBuilder,
} from '../../helpers/testDataBuilder.js';
import { measureTime } from '../../helpers/performanceHelpers.js';
import { assertPerformance } from '../../helpers/assertionHelpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the class we're testing (will fail until implemented)
let DataValidator;
try {
  const module = await import('../../../src/validators/DataValidator.js');
  DataValidator = module.default || module.DataValidator;
} catch (error) {
  console.warn('DataValidator not implemented yet - tests will fail as expected');
}

describe('DataValidator', () => {
  let validator;
  const schemasDir = path.join(__dirname, '../../../schemas');

  beforeEach(async () => {
    if (DataValidator) {
      validator = new DataValidator(schemasDir);
      await validator.initialize();
    }
  });

  afterEach(() => {
    validator = null;
  });

  describe('Constructor and Initialization', () => {
    it('should create a new DataValidator instance', () => {
      expect(validator).toBeDefined();
      expect(validator).toBeInstanceOf(DataValidator);
    });

    it('should accept schemas directory path in constructor', () => {
      const customValidator = new DataValidator('/custom/schemas/path');

      expect(customValidator.schemasDir).toBe('/custom/schemas/path');
    });

    it('should use default schemas directory if not provided', () => {
      const defaultValidator = new DataValidator();

      expect(defaultValidator.schemasDir).toBeDefined();
      expect(defaultValidator.schemasDir).toContain('schemas');
    });

    it('should initialize SchemaValidator internally', async () => {
      expect(validator.schemaValidator).toBeDefined();
    });

    it('should load all schemas during initialization', async () => {
      const loadedSchemas = validator.getLoadedSchemas();

      expect(loadedSchemas).toContain('graph');
      expect(loadedSchemas).toContain('document');
      expect(loadedSchemas).toContain('concept');
      expect(loadedSchemas).toContain('analysis');
    });

    it('should throw error if schemas directory does not exist', async () => {
      const invalidValidator = new DataValidator('/nonexistent/path');

      await expect(invalidValidator.initialize()).rejects.toThrow('Schemas directory not found');
    });

    it('should initialize within performance constraints (<500ms)', async () => {
      const freshValidator = new DataValidator(schemasDir);

      const { duration } = await measureTime(() => freshValidator.initialize());

      assertPerformance(duration, 500, 'DataValidator initialization');
    });
  });

  describe('Graph Validation', () => {
    it('should validate valid graph data', () => {
      const graphData = createGraphBuilder()
        .withRandomNodes(10, 'document')
        .withRandomEdges(15)
        .build();

      const result = validator.validateGraph(graphData);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.dataType).toBe('graph');
    });

    it('should detect missing metadata in graph', () => {
      const invalidGraph = {
        nodes: [],
        edges: [],
        // Missing metadata
      };

      const result = validator.validateGraph(invalidGraph);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path.includes('metadata'))).toBe(true);
    });

    it('should detect invalid node structure', () => {
      const graphWithInvalidNodes = {
        metadata: {
          version: '1.0.0',
          generated: new Date().toISOString(),
          source: {
            inputPath: '/test',
            fileCount: 1,
            totalNodes: 1,
            totalEdges: 0,
          },
        },
        nodes: [
          { id: 'node1' }, // Missing type and label
        ],
        edges: [],
      };

      const result = validator.validateGraph(graphWithInvalidNodes);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path.includes('nodes'))).toBe(true);
    });

    it('should detect invalid edge structure', () => {
      const graphWithInvalidEdges = {
        metadata: {
          version: '1.0.0',
          generated: new Date().toISOString(),
          source: {
            inputPath: '/test',
            fileCount: 1,
            totalNodes: 2,
            totalEdges: 1,
          },
        },
        nodes: [
          { id: 'node1', type: 'document', label: 'Doc 1' },
          { id: 'node2', type: 'document', label: 'Doc 2' },
        ],
        edges: [
          { id: 'edge1', source: 'node1' }, // Missing target and type
        ],
      };

      const result = validator.validateGraph(graphWithInvalidEdges);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path.includes('edges'))).toBe(true);
    });

    it('should validate graph within performance constraints (<100ms)', async () => {
      const graphData = createGraphBuilder().withRandomNodes(100).withRandomEdges(200).build();

      const { duration } = await measureTime(() => validator.validateGraph(graphData));

      assertPerformance(duration, 100, 'Graph validation');
    });

    it('should handle null graph data', () => {
      const result = validator.validateGraph(null);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle undefined graph data', () => {
      const result = validator.validateGraph(undefined);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate graph with all node types', () => {
      const graphData = {
        metadata: {
          version: '1.0.0',
          generated: new Date().toISOString(),
          source: {
            inputPath: '/test',
            fileCount: 5,
            totalNodes: 5,
            totalEdges: 0,
          },
        },
        nodes: [
          { id: 'doc1', type: 'document', label: 'Document' },
          { id: 'con1', type: 'concept', label: 'Concept' },
          { id: 'sec1', type: 'section', label: 'Section' },
          { id: 'dir1', type: 'directory', label: 'Directory' },
          { id: 'tag1', type: 'tag', label: 'Tag' },
        ],
        edges: [],
      };

      const result = validator.validateGraph(graphData);

      expect(result.valid).toBe(true);
    });

    it('should validate graph with all edge types', () => {
      const graphData = {
        metadata: {
          version: '1.0.0',
          generated: new Date().toISOString(),
          source: {
            inputPath: '/test',
            fileCount: 2,
            totalNodes: 2,
            totalEdges: 5,
          },
        },
        nodes: [
          { id: 'node1', type: 'document', label: 'Doc 1' },
          { id: 'node2', type: 'concept', label: 'Concept 1' },
        ],
        edges: [
          { id: 'e1', source: 'node1', target: 'node2', type: 'mentions' },
          { id: 'e2', source: 'node1', target: 'node2', type: 'links_to' },
          { id: 'e3', source: 'node1', target: 'node2', type: 'contains' },
          { id: 'e4', source: 'node1', target: 'node2', type: 'similar' },
          { id: 'e5', source: 'node1', target: 'node2', type: 'co_occurs' },
        ],
      };

      const result = validator.validateGraph(graphData);

      expect(result.valid).toBe(true);
    });
  });

  describe('Document Validation', () => {
    it('should validate valid document data', () => {
      const documents = createDocumentBuilder().withRandomDocuments(5).build();

      const result = validator.validateDocuments(documents);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.dataType).toBe('document');
    });

    it('should validate single document object', () => {
      const document = {
        path: '/docs/test.md',
        extension: '.md',
        content: '# Test',
        frontmatter: { title: 'Test' },
        headings: [{ level: 1, text: 'Test' }],
        links: { internal: [], external: [] },
      };

      const result = validator.validateDocument(document);

      expect(result.valid).toBe(true);
    });

    it('should detect missing required document fields', () => {
      const invalidDoc = {
        path: '/docs/test.md',
        content: '# Test',
        // Missing other required fields
      };

      const result = validator.validateDocument(invalidDoc);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate document array', () => {
      const documents = createDocumentBuilder()
        .addDocument({
          path: '/docs/doc1.md',
          extension: '.md',
          content: '# Doc 1',
          frontmatter: { title: 'Doc 1' },
          headings: [],
          links: { internal: [], external: [] },
        })
        .addDocument({
          path: '/docs/doc2.md',
          extension: '.md',
          content: '# Doc 2',
          frontmatter: { title: 'Doc 2' },
          headings: [],
          links: { internal: [], external: [] },
        })
        .build();

      const result = validator.validateDocuments(documents);

      expect(result.valid).toBe(true);
    });

    it('should detect invalid document in array', () => {
      const documents = [
        {
          path: '/docs/valid.md',
          extension: '.md',
          content: '# Valid',
          frontmatter: {},
          headings: [],
          links: { internal: [], external: [] },
        },
        {
          path: '/docs/invalid.md',
          // Missing required fields
        },
      ];

      const result = validator.validateDocuments(documents);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path.includes('[1]'))).toBe(true);
    });

    it('should validate documents within performance constraints (<100ms)', async () => {
      const documents = createDocumentBuilder().withRandomDocuments(50).build();

      const { duration } = await measureTime(() => validator.validateDocuments(documents));

      assertPerformance(duration, 100, 'Documents validation');
    });

    it('should handle empty documents array', () => {
      const result = validator.validateDocuments([]);

      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('Empty documents array');
    });

    it('should validate document links structure', () => {
      const document = {
        path: '/docs/test.md',
        extension: '.md',
        content: '# Test',
        frontmatter: {},
        headings: [],
        links: {
          internal: ['/docs/other.md', '/docs/another.md'],
          external: ['https://example.com'],
        },
      };

      const result = validator.validateDocument(document);

      expect(result.valid).toBe(true);
    });

    it('should validate document frontmatter structure', () => {
      const document = {
        path: '/docs/test.md',
        extension: '.md',
        content: '# Test',
        frontmatter: {
          title: 'Test Document',
          sidebar_label: 'Test',
          description: 'Test description',
          content_type: 'concept',
        },
        headings: [],
        links: { internal: [], external: [] },
      };

      const result = validator.validateDocument(document);

      expect(result.valid).toBe(true);
    });
  });

  describe('Concept Validation', () => {
    it('should validate valid concept data', () => {
      const concepts = createConceptBuilder().withRandomConcepts(10).build();

      const result = validator.validateConcepts(concepts);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.dataType).toBe('concept');
    });

    it('should validate concept metadata structure', () => {
      const concepts = {
        metadata: {
          totalConcepts: 5,
          extractionDate: new Date().toISOString(),
        },
        topConcepts: [],
      };

      const result = validator.validateConcepts(concepts);

      expect(result.valid).toBe(true);
    });

    it('should detect missing concept metadata', () => {
      const invalidConcepts = {
        topConcepts: [],
        // Missing metadata
      };

      const result = validator.validateConcepts(invalidConcepts);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path.includes('metadata'))).toBe(true);
    });

    it('should validate individual concept structure', () => {
      const concepts = {
        metadata: {
          totalConcepts: 1,
          extractionDate: new Date().toISOString(),
        },
        topConcepts: [
          {
            concept: 'blockchain',
            frequency: 42,
            fileCount: 10,
            type: 'domain',
            category: 'blockchain',
          },
        ],
      };

      const result = validator.validateConcepts(concepts);

      expect(result.valid).toBe(true);
    });

    it('should detect invalid concept in array', () => {
      const invalidConcepts = {
        metadata: {
          totalConcepts: 1,
          extractionDate: new Date().toISOString(),
        },
        topConcepts: [
          {
            concept: 'test',
            frequency: -5, // Invalid negative frequency
          },
        ],
      };

      const result = validator.validateConcepts(invalidConcepts);

      expect(result.valid).toBe(false);
    });

    it('should validate concepts within performance constraints (<100ms)', async () => {
      const concepts = createConceptBuilder().withRandomConcepts(100).build();

      const { duration } = await measureTime(() => validator.validateConcepts(concepts));

      assertPerformance(duration, 100, 'Concepts validation');
    });

    it('should handle empty concepts array', () => {
      const concepts = {
        metadata: {
          totalConcepts: 0,
          extractionDate: new Date().toISOString(),
        },
        topConcepts: [],
      };

      const result = validator.validateConcepts(concepts);

      expect(result.valid).toBe(true);
    });

    it('should validate concept types and categories', () => {
      const concepts = {
        metadata: {
          totalConcepts: 4,
          extractionDate: new Date().toISOString(),
        },
        topConcepts: [
          { concept: 'c1', frequency: 10, fileCount: 5, type: 'domain', category: 'blockchain' },
          { concept: 'c2', frequency: 8, fileCount: 4, type: 'technical', category: 'technical' },
          { concept: 'c3', frequency: 6, fileCount: 3, type: 'general', category: 'development' },
          { concept: 'c4', frequency: 4, fileCount: 2, type: 'domain', category: 'arbitrum' },
        ],
      };

      const result = validator.validateConcepts(concepts);

      expect(result.valid).toBe(true);
    });
  });

  describe('Analysis Validation', () => {
    it('should validate valid analysis data', () => {
      const graphData = createGraphBuilder().withRandomNodes(10).withRandomEdges(15).build();

      const analysis = createAnalysisBuilder().forGraph(graphData).build();

      const result = validator.validateAnalysis(analysis);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.dataType).toBe('analysis');
    });

    it('should validate analysis metadata', () => {
      const analysis = {
        metadata: {
          version: '1.0.0',
          generated: new Date().toISOString(),
        },
        basic: {
          totalNodes: 10,
          totalEdges: 15,
          density: 0.333,
          avgDegree: 3.0,
          isConnected: true,
          nodesByType: { document: 10 },
          edgesByType: { links_to: 15 },
        },
        centrality: {
          degree: { values: {} },
          betweenness: { values: {} },
          closeness: { values: {} },
        },
      };

      const result = validator.validateAnalysis(analysis);

      expect(result.valid).toBe(true);
    });

    it('should detect missing analysis sections', () => {
      const invalidAnalysis = {
        metadata: {
          version: '1.0.0',
          generated: new Date().toISOString(),
        },
        basic: {},
        // Missing centrality
      };

      const result = validator.validateAnalysis(invalidAnalysis);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path.includes('centrality'))).toBe(true);
    });

    it('should validate basic statistics structure', () => {
      const analysis = {
        metadata: {
          version: '1.0.0',
          generated: new Date().toISOString(),
        },
        basic: {
          totalNodes: 5,
          totalEdges: 10,
          density: 0.5,
          avgDegree: 4.0,
          isConnected: false,
          nodesByType: { document: 3, concept: 2 },
          edgesByType: { links_to: 8, mentions: 2 },
        },
        centrality: {
          degree: { values: {} },
          betweenness: { values: {} },
          closeness: { values: {} },
        },
      };

      const result = validator.validateAnalysis(analysis);

      expect(result.valid).toBe(true);
    });

    it('should validate centrality metrics structure', () => {
      const analysis = {
        metadata: {
          version: '1.0.0',
          generated: new Date().toISOString(),
        },
        basic: {
          totalNodes: 2,
          totalEdges: 1,
          density: 1.0,
          avgDegree: 1.0,
          isConnected: true,
          nodesByType: {},
          edgesByType: {},
        },
        centrality: {
          degree: {
            values: { node1: 1, node2: 1 },
            max: 1,
            min: 1,
            avg: 1,
          },
          betweenness: {
            values: { node1: 0, node2: 0 },
            max: 0,
            min: 0,
            avg: 0,
          },
          closeness: {
            values: { node1: 1, node2: 1 },
            max: 1,
            min: 1,
            avg: 1,
          },
        },
      };

      const result = validator.validateAnalysis(analysis);

      expect(result.valid).toBe(true);
    });

    it('should validate analysis within performance constraints (<100ms)', async () => {
      const graphData = createGraphBuilder().withRandomNodes(50).withRandomEdges(100).build();

      const analysis = createAnalysisBuilder().forGraph(graphData).build();

      const { duration } = await measureTime(() => validator.validateAnalysis(analysis));

      assertPerformance(duration, 100, 'Analysis validation');
    });

    it('should detect invalid centrality values', () => {
      const invalidAnalysis = {
        metadata: {
          version: '1.0.0',
          generated: new Date().toISOString(),
        },
        basic: {
          totalNodes: 1,
          totalEdges: 0,
          density: 0,
          avgDegree: 0,
          isConnected: true,
          nodesByType: {},
          edgesByType: {},
        },
        centrality: {
          degree: {
            values: { node1: -5 }, // Invalid negative centrality
          },
          betweenness: { values: {} },
          closeness: { values: {} },
        },
      };

      const result = validator.validateAnalysis(invalidAnalysis);

      expect(result.valid).toBe(false);
    });
  });

  describe('Validation Reports', () => {
    it('should generate validation report for single validation', () => {
      const graphData = createGraphBuilder().withRandomNodes(5).build();

      const result = validator.validateGraph(graphData);
      const report = validator.generateReport(result);

      expect(report).toBeDefined();
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('details');
      expect(report.summary).toHaveProperty('valid');
      expect(report.summary).toHaveProperty('errorCount');
    });

    it('should generate comprehensive report for multiple validations', () => {
      const graphData = createGraphBuilder().withRandomNodes(5).build();
      const documents = createDocumentBuilder().withRandomDocuments(3).build();
      const concepts = createConceptBuilder().withRandomConcepts(10).build();

      const results = {
        graph: validator.validateGraph(graphData),
        documents: validator.validateDocuments(documents),
        concepts: validator.validateConcepts(concepts),
      };

      const report = validator.generateComprehensiveReport(results);

      expect(report).toBeDefined();
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('overall');
      expect(report).toHaveProperty('byDataType');
      expect(report.overall).toHaveProperty('allValid');
      expect(report.overall).toHaveProperty('totalErrors');
    });

    it('should include error details in report', () => {
      const invalidGraph = { nodes: 'invalid' };

      const result = validator.validateGraph(invalidGraph);
      const report = validator.generateReport(result);

      expect(report.details).toHaveProperty('errors');
      expect(report.details.errors.length).toBeGreaterThan(0);
      expect(report.details.errors[0]).toHaveProperty('message');
      expect(report.details.errors[0]).toHaveProperty('path');
    });

    it('should include warnings in report', () => {
      const result = validator.validateDocuments([]);
      const report = validator.generateReport(result);

      expect(report.details).toHaveProperty('warnings');
      expect(Array.isArray(report.details.warnings)).toBe(true);
    });

    it('should export report to JSON', () => {
      const graphData = createGraphBuilder().withRandomNodes(5).build();
      const result = validator.validateGraph(graphData);
      const report = validator.generateReport(result);

      const json = validator.exportReportToJSON(report);

      expect(typeof json).toBe('string');
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should export report to markdown', () => {
      const graphData = createGraphBuilder().withRandomNodes(5).build();
      const result = validator.validateGraph(graphData);
      const report = validator.generateReport(result);

      const markdown = validator.exportReportToMarkdown(report);

      expect(typeof markdown).toBe('string');
      expect(markdown).toContain('#');
      expect(markdown).toContain('Validation Report');
    });

    it('should include validation statistics in report', () => {
      const graphData = createGraphBuilder().withRandomNodes(10).build();
      const result = validator.validateGraph(graphData);
      const report = validator.generateReport(result);

      expect(report).toHaveProperty('statistics');
      expect(report.statistics).toHaveProperty('validationTime');
      expect(report.statistics).toHaveProperty('dataSize');
    });
  });

  describe('Batch Validation', () => {
    it('should validate multiple data types in batch', () => {
      const batch = {
        graph: createGraphBuilder().withRandomNodes(5).build(),
        documents: createDocumentBuilder().withRandomDocuments(3).build(),
        concepts: createConceptBuilder().withRandomConcepts(10).build(),
      };

      const results = validator.validateBatch(batch);

      expect(results).toBeDefined();
      expect(results).toHaveProperty('graph');
      expect(results).toHaveProperty('documents');
      expect(results).toHaveProperty('concepts');
      expect(results.graph.valid).toBe(true);
      expect(results.documents.valid).toBe(true);
      expect(results.concepts.valid).toBe(true);
    });

    it('should report all errors in batch validation', () => {
      const batch = {
        graph: { invalid: 'data' },
        documents: [{ invalid: 'doc' }],
        concepts: { invalid: 'concepts' },
      };

      const results = validator.validateBatch(batch);

      expect(results.graph.valid).toBe(false);
      expect(results.documents.valid).toBe(false);
      expect(results.concepts.valid).toBe(false);
    });

    it('should validate batch within performance constraints (<500ms)', async () => {
      const batch = {
        graph: createGraphBuilder().withRandomNodes(20).build(),
        documents: createDocumentBuilder().withRandomDocuments(10).build(),
        concepts: createConceptBuilder().withRandomConcepts(30).build(),
      };

      const { duration } = await measureTime(() => validator.validateBatch(batch));

      assertPerformance(duration, 500, 'Batch validation');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle validator not initialized', () => {
      const uninitializedValidator = new DataValidator(schemasDir);

      expect(() => {
        uninitializedValidator.validateGraph({});
      }).toThrow('Validator not initialized');
    });

    it('should handle corrupted schema gracefully', async () => {
      const corruptValidator = new DataValidator('/path/with/corrupt/schemas');

      await expect(corruptValidator.initialize()).rejects.toThrow();
    });

    it('should handle very large datasets', () => {
      const largeGraph = createGraphBuilder().withRandomNodes(1000).withRandomEdges(2000).build();

      const result = validator.validateGraph(largeGraph);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('valid');
    });

    it('should handle special characters in data', () => {
      const dataWithSpecialChars = {
        metadata: {
          version: '1.0.0',
          generated: new Date().toISOString(),
          source: {
            inputPath: '/test/特殊字符/🚀',
            fileCount: 1,
            totalNodes: 1,
            totalEdges: 0,
          },
        },
        nodes: [],
        edges: [],
      };

      expect(() => {
        validator.validateGraph(dataWithSpecialChars);
      }).not.toThrow();
    });

    it('should handle concurrent validation requests', async () => {
      const promises = Array.from({ length: 10 }, () => {
        const graphData = createGraphBuilder().withRandomNodes(5).build();
        return Promise.resolve(validator.validateGraph(graphData));
      });

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach((result) => {
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Utility Methods', () => {
    it('should get loaded schemas list', () => {
      const schemas = validator.getLoadedSchemas();

      expect(Array.isArray(schemas)).toBe(true);
      expect(schemas.length).toBeGreaterThan(0);
    });

    it('should check if specific schema is loaded', () => {
      expect(validator.hasSchema('graph')).toBe(true);
      expect(validator.hasSchema('nonexistent')).toBe(false);
    });

    it('should reload schemas', async () => {
      await validator.reloadSchemas();

      const schemas = validator.getLoadedSchemas();
      expect(schemas).toContain('graph');
    });

    it('should get validation statistics', () => {
      validator.validateGraph(createGraphBuilder().withRandomNodes(5).build());
      validator.validateDocuments(createDocumentBuilder().withRandomDocuments(3).build());

      const stats = validator.getValidationStats();

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('totalValidations');
      expect(stats.totalValidations).toBeGreaterThanOrEqual(2);
    });

    it('should reset validation statistics', () => {
      validator.validateGraph(createGraphBuilder().withRandomNodes(5).build());

      validator.resetStats();

      const stats = validator.getValidationStats();
      expect(stats.totalValidations).toBe(0);
    });
  });
});
