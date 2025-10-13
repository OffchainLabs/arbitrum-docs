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
 * SchemaValidator Unit Tests
 *
 * These are FAILING tests (RED phase of TDD)
 * Implementation does not exist yet
 *
 * Tests for:
 * - Loading schemas from files
 * - Validating data against schemas
 * - Error reporting and formatting
 * - Schema compilation with AJV
 * - Performance constraints
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import path from 'path';
import { fileURLToPath } from 'url';
import { measureTime } from '../../helpers/performanceHelpers.js';
import { assertPerformance, assertErrorMessage } from '../../helpers/assertionHelpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the class we're testing (will fail until implemented)
let SchemaValidator;
try {
  const module = await import('../../../src/validators/SchemaValidator.js');
  SchemaValidator = module.default || module.SchemaValidator;
} catch (error) {
  console.warn('SchemaValidator not implemented yet - tests will fail as expected');
}

describe('SchemaValidator', () => {
  let validator;

  beforeEach(() => {
    if (SchemaValidator) {
      validator = new SchemaValidator();
    }
  });

  afterEach(() => {
    validator = null;
  });

  describe('Constructor and Initialization', () => {
    it('should create a new SchemaValidator instance', () => {
      expect(validator).toBeDefined();
      expect(validator).toBeInstanceOf(SchemaValidator);
    });

    it('should initialize with empty schemas collection', () => {
      expect(validator.schemas).toBeDefined();
      expect(typeof validator.schemas).toBe('object');
      expect(Object.keys(validator.schemas)).toHaveLength(0);
    });

    it('should initialize AJV instance with proper configuration', () => {
      expect(validator.ajv).toBeDefined();
      expect(validator.ajv.constructor.name).toBe('Ajv');
    });

    it('should configure AJV with allErrors option', () => {
      // AJV should be configured to collect all errors, not just first
      expect(validator.ajv.opts.allErrors).toBe(true);
    });

    it('should configure AJV with strict mode disabled for flexibility', () => {
      expect(validator.ajv.opts.strict).toBe(false);
    });

    it('should configure AJV with removeAdditional option', () => {
      // Should remove additional properties not defined in schema
      expect(validator.ajv.opts.removeAdditional).toBe(true);
    });

    it('should configure AJV with coerceTypes for type flexibility', () => {
      expect(validator.ajv.opts.coerceTypes).toBe(true);
    });
  });

  describe('Schema Loading', () => {
    it('should load a schema from file path', async () => {
      const schemaPath = path.join(__dirname, '../../../schemas/graph-schema.json');
      const result = await validator.loadSchema('graph', schemaPath);

      expect(result).toBe(true);
      expect(validator.schemas.graph).toBeDefined();
    });

    it('should load multiple schemas at once', async () => {
      const schemas = {
        graph: path.join(__dirname, '../../../schemas/graph-schema.json'),
        document: path.join(__dirname, '../../../schemas/document-schema.json'),
        concept: path.join(__dirname, '../../../schemas/concept-schema.json'),
      };

      const results = await validator.loadSchemas(schemas);

      expect(results).toBe(true);
      expect(Object.keys(validator.schemas)).toHaveLength(3);
      expect(validator.schemas.graph).toBeDefined();
      expect(validator.schemas.document).toBeDefined();
      expect(validator.schemas.concept).toBeDefined();
    });

    it('should compile schema with AJV after loading', async () => {
      const schemaPath = path.join(__dirname, '../../../schemas/graph-schema.json');
      await validator.loadSchema('graph', schemaPath);

      expect(validator.validators.graph).toBeDefined();
      expect(typeof validator.validators.graph).toBe('function');
    });

    it('should throw error when loading non-existent schema file', async () => {
      await expect(
        validator.loadSchema('nonexistent', '/path/to/nonexistent.json'),
      ).rejects.toThrow('Schema file not found');
    });

    it('should throw error when loading invalid JSON schema', async () => {
      const invalidSchemaPath = path.join(__dirname, '../../fixtures/invalid-schema.json');

      await expect(validator.loadSchema('invalid', invalidSchemaPath)).rejects.toThrow();
    });

    it('should validate schema structure before loading', async () => {
      const schemaPath = path.join(__dirname, '../../../schemas/graph-schema.json');
      await validator.loadSchema('graph', schemaPath);

      const schema = validator.schemas.graph;
      expect(schema.$schema).toBeDefined();
      expect(schema.$schema).toContain('draft-07');
      expect(schema.type).toBe('object');
    });

    it('should cache loaded schemas for reuse', async () => {
      const schemaPath = path.join(__dirname, '../../../schemas/graph-schema.json');

      await validator.loadSchema('graph', schemaPath);
      const firstLoad = validator.schemas.graph;

      await validator.loadSchema('graph', schemaPath);
      const secondLoad = validator.schemas.graph;

      expect(firstLoad).toBe(secondLoad);
    });

    it('should support loading schemas from directory', async () => {
      const schemasDir = path.join(__dirname, '../../../schemas');
      const count = await validator.loadSchemasFromDirectory(schemasDir);

      expect(count).toBeGreaterThan(0);
      expect(Object.keys(validator.schemas).length).toBeGreaterThan(0);
    });

    it('should handle schema loading within performance constraints (<100ms)', async () => {
      const schemaPath = path.join(__dirname, '../../../schemas/graph-schema.json');

      const { duration } = await measureTime(() => validator.loadSchema('graph', schemaPath));

      assertPerformance(duration, 100, 'Schema loading');
    });
  });

  describe('Data Validation', () => {
    beforeEach(async () => {
      if (validator) {
        const schemaPath = path.join(__dirname, '../../../schemas/graph-schema.json');
        await validator.loadSchema('graph', schemaPath);
      }
    });

    it('should validate valid data successfully', () => {
      const validData = {
        metadata: {
          version: '1.0.0',
          generated: new Date().toISOString(),
          source: {
            inputPath: '/test/docs',
            fileCount: 10,
            totalNodes: 50,
            totalEdges: 75,
          },
        },
        nodes: [],
        edges: [],
      };

      const result = validator.validate('graph', validData);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return validation errors for invalid data', () => {
      const invalidData = {
        metadata: {
          // Missing required fields
        },
        nodes: 'not-an-array',
        edges: null,
      };

      const result = validator.validate('graph', invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should provide detailed error information', () => {
      const invalidData = {
        metadata: {
          version: '1.0.0',
          // Missing other required fields
        },
        nodes: [],
        edges: [],
      };

      const result = validator.validate('graph', invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toHaveProperty('message');
      expect(result.errors[0]).toHaveProperty('path');
      expect(result.errors[0]).toHaveProperty('keyword');
    });

    it('should collect all validation errors with allErrors option', () => {
      const invalidData = {
        metadata: null, // Error 1
        nodes: 'invalid', // Error 2
        edges: {}, // Error 3
      };

      const result = validator.validate('graph', invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });

    it('should throw error when validating with non-existent schema', () => {
      const data = { test: 'data' };

      expect(() => {
        validator.validate('nonexistent', data);
      }).toThrow('Schema not found');
    });

    it('should handle null data gracefully', () => {
      const result = validator.validate('graph', null);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle undefined data gracefully', () => {
      const result = validator.validate('graph', undefined);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle empty object data', () => {
      const result = validator.validate('graph', {});

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.message.includes('required'))).toBe(true);
    });

    it('should validate nested object structures', () => {
      const dataWithNestedObjects = {
        metadata: {
          version: '1.0.0',
          generated: new Date().toISOString(),
          source: {
            inputPath: '/test',
            fileCount: 5,
            totalNodes: 10,
            totalEdges: 15,
            processing: {
              chunkSize: 30,
              chunksProcessed: 1,
            },
          },
        },
        nodes: [],
        edges: [],
      };

      const result = validator.validate('graph', dataWithNestedObjects);

      expect(result.valid).toBe(true);
    });

    it('should validate array items against schema', () => {
      const dataWithNodes = {
        metadata: {
          version: '1.0.0',
          generated: new Date().toISOString(),
          source: {
            inputPath: '/test',
            fileCount: 1,
            totalNodes: 2,
            totalEdges: 0,
          },
        },
        nodes: [
          { id: 'node1', type: 'document', label: 'Doc 1' },
          { id: 'node2', type: 'concept', label: 'Concept 1' },
        ],
        edges: [],
      };

      const result = validator.validate('graph', dataWithNodes);

      expect(result.valid).toBe(true);
    });

    it('should detect invalid array items', () => {
      const dataWithInvalidNodes = {
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
          { id: 'node1' }, // Missing required fields
        ],
        edges: [],
      };

      const result = validator.validate('graph', dataWithInvalidNodes);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path.includes('nodes'))).toBe(true);
    });

    it('should coerce types when coerceTypes is enabled', () => {
      const dataWithStringNumbers = {
        metadata: {
          version: '1.0.0',
          generated: new Date().toISOString(),
          source: {
            inputPath: '/test',
            fileCount: '5', // String instead of number
            totalNodes: '10',
            totalEdges: '15',
          },
        },
        nodes: [],
        edges: [],
      };

      const result = validator.validate('graph', dataWithStringNumbers);

      // Should coerce strings to numbers
      expect(result.valid).toBe(true);
      expect(typeof dataWithStringNumbers.metadata.source.fileCount).toBe('number');
    });

    it('should remove additional properties when removeAdditional is enabled', () => {
      const dataWithExtra = {
        metadata: {
          version: '1.0.0',
          generated: new Date().toISOString(),
          source: {
            inputPath: '/test',
            fileCount: 5,
            totalNodes: 10,
            totalEdges: 15,
          },
          extraField: 'should be removed',
        },
        nodes: [],
        edges: [],
        anotherExtra: 'also removed',
      };

      const result = validator.validate('graph', dataWithExtra);

      expect(result.valid).toBe(true);
      expect(dataWithExtra.metadata.extraField).toBeUndefined();
      expect(dataWithExtra.anotherExtra).toBeUndefined();
    });

    it('should validate within performance constraints (<100ms)', async () => {
      const validData = {
        metadata: {
          version: '1.0.0',
          generated: new Date().toISOString(),
          source: {
            inputPath: '/test',
            fileCount: 10,
            totalNodes: 50,
            totalEdges: 75,
          },
        },
        nodes: Array.from({ length: 50 }, (_, i) => ({
          id: `node-${i}`,
          type: 'document',
          label: `Document ${i}`,
        })),
        edges: [],
      };

      const { duration } = await measureTime(() => validator.validate('graph', validData));

      assertPerformance(duration, 100, 'Schema validation');
    });
  });

  describe('Error Reporting', () => {
    beforeEach(async () => {
      if (validator) {
        const schemaPath = path.join(__dirname, '../../../schemas/graph-schema.json');
        await validator.loadSchema('graph', schemaPath);
      }
    });

    it('should format errors in human-readable format', () => {
      const invalidData = {
        metadata: null,
        nodes: [],
        edges: [],
      };

      const result = validator.validate('graph', invalidData);
      const formatted = validator.formatErrors(result.errors);

      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should include field path in error messages', () => {
      const invalidData = {
        metadata: {
          version: '1.0.0',
          generated: new Date().toISOString(),
          source: {
            inputPath: '/test',
            fileCount: -5, // Invalid negative number
            totalNodes: 10,
            totalEdges: 15,
          },
        },
        nodes: [],
        edges: [],
      };

      const result = validator.validate('graph', invalidData);

      expect(
        result.errors.some((e) => e.path.includes('metadata') && e.path.includes('source')),
      ).toBe(true);
    });

    it('should provide error keyword for error type identification', () => {
      const invalidData = {
        metadata: {
          version: '1.0.0',
          // Missing required fields
        },
        nodes: [],
        edges: [],
      };

      const result = validator.validate('graph', invalidData);

      expect(result.errors[0].keyword).toBeDefined();
      expect(['required', 'type', 'enum', 'minimum'].includes(result.errors[0].keyword)).toBe(true);
    });

    it('should include schema path in error information', () => {
      const invalidData = { nodes: 'invalid' };

      const result = validator.validate('graph', invalidData);

      expect(result.errors[0]).toHaveProperty('schemaPath');
    });

    it('should provide expected vs actual in error details', () => {
      const invalidData = {
        metadata: {
          version: '1.0.0',
          generated: new Date().toISOString(),
          source: {
            inputPath: '/test',
            fileCount: 5,
            totalNodes: 10,
            totalEdges: 15,
          },
        },
        nodes: 'should-be-array',
        edges: [],
      };

      const result = validator.validate('graph', invalidData);
      const nodeError = result.errors.find((e) => e.path.includes('nodes'));

      expect(nodeError).toBeDefined();
      expect(nodeError.message).toContain('array');
    });

    it('should group errors by severity if applicable', () => {
      const invalidData = {
        metadata: null,
        nodes: 'invalid',
        edges: {},
      };

      const result = validator.validate('graph', invalidData);
      const grouped = validator.groupErrorsBySeverity(result.errors);

      expect(grouped).toBeDefined();
      expect(grouped).toHaveProperty('critical');
      expect(Array.isArray(grouped.critical)).toBe(true);
    });

    it('should generate error summary', () => {
      const invalidData = {
        metadata: null,
        nodes: 'invalid',
        edges: {},
      };

      const result = validator.validate('graph', invalidData);
      const summary = validator.getErrorSummary(result.errors);

      expect(summary).toBeDefined();
      expect(summary).toHaveProperty('totalErrors');
      expect(summary.totalErrors).toBe(result.errors.length);
      expect(summary).toHaveProperty('errorsByType');
    });
  });

  describe('Schema Utilities', () => {
    it('should check if schema is loaded', () => {
      expect(validator.hasSchema('graph')).toBe(false);
    });

    it('should return loaded schema names', async () => {
      const schemaPath = path.join(__dirname, '../../../schemas/graph-schema.json');
      await validator.loadSchema('graph', schemaPath);

      const names = validator.getLoadedSchemas();

      expect(Array.isArray(names)).toBe(true);
      expect(names).toContain('graph');
    });

    it('should get schema by name', async () => {
      const schemaPath = path.join(__dirname, '../../../schemas/graph-schema.json');
      await validator.loadSchema('graph', schemaPath);

      const schema = validator.getSchema('graph');

      expect(schema).toBeDefined();
      expect(schema.$schema).toBeDefined();
    });

    it('should unload schema', async () => {
      const schemaPath = path.join(__dirname, '../../../schemas/graph-schema.json');
      await validator.loadSchema('graph', schemaPath);

      validator.unloadSchema('graph');

      expect(validator.hasSchema('graph')).toBe(false);
    });

    it('should unload all schemas', async () => {
      const schemas = {
        graph: path.join(__dirname, '../../../schemas/graph-schema.json'),
        document: path.join(__dirname, '../../../schemas/document-schema.json'),
      };

      await validator.loadSchemas(schemas);
      validator.unloadAll();

      expect(validator.getLoadedSchemas()).toHaveLength(0);
    });

    it('should validate schema itself against JSON Schema meta-schema', () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'test-schema',
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      };

      const isValid = validator.validateSchema(schema);

      expect(isValid).toBe(true);
    });

    it('should detect invalid schema structure', () => {
      const invalidSchema = {
        type: 'invalid-type',
        properties: 'not-an-object',
      };

      const isValid = validator.validateSchema(invalidSchema);

      expect(isValid).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very large data objects', async () => {
      const schemaPath = path.join(__dirname, '../../../schemas/graph-schema.json');
      await validator.loadSchema('graph', schemaPath);

      const largeData = {
        metadata: {
          version: '1.0.0',
          generated: new Date().toISOString(),
          source: {
            inputPath: '/test',
            fileCount: 1000,
            totalNodes: 1000,
            totalEdges: 2000,
          },
        },
        nodes: Array.from({ length: 1000 }, (_, i) => ({
          id: `node-${i}`,
          type: 'document',
          label: `Document ${i}`,
        })),
        edges: [],
      };

      const result = validator.validate('graph', largeData);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('valid');
    });

    it('should handle circular reference detection', () => {
      const circularData = {
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
        nodes: [],
        edges: [],
      };

      // Create circular reference
      circularData.self = circularData;

      expect(() => {
        validator.validate('graph', circularData);
      }).toThrow();
    });

    it('should handle special characters in data values', () => {
      const dataWithSpecialChars = {
        metadata: {
          version: '1.0.0',
          generated: new Date().toISOString(),
          source: {
            inputPath: '/test/path/with/特殊字符/and/émojis/🚀',
            fileCount: 1,
            totalNodes: 1,
            totalEdges: 0,
          },
        },
        nodes: [
          {
            id: 'node-with-émoji-🎯',
            type: 'document',
            label: 'Document with 特殊字符',
          },
        ],
        edges: [],
      };

      expect(() => {
        validator.validate('graph', dataWithSpecialChars);
      }).not.toThrow();
    });

    it('should handle concurrent validation calls', async () => {
      const schemaPath = path.join(__dirname, '../../../schemas/graph-schema.json');
      await validator.loadSchema('graph', schemaPath);

      const validData = {
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
        nodes: [],
        edges: [],
      };

      const promises = Array.from({ length: 10 }, () =>
        Promise.resolve(validator.validate('graph', validData)),
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach((result) => {
        expect(result.valid).toBe(true);
      });
    });
  });
});
