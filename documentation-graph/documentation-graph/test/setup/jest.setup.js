/**
 * Jest Setup File
 *
 * Configures test environment, custom matchers, and global utilities
 */

import { jest } from '@jest/globals';

// Extend Jest matchers with jest-extended
import 'jest-extended';

// Custom matchers
expect.extend({
  /**
   * Check if object has valid schema structure
   */
  toBeValidSchema(received) {
    const hasRequiredFields = received.$schema && received.$id && received.type;

    if (hasRequiredFields) {
      return {
        message: () => `Expected ${JSON.stringify(received)} not to be a valid schema`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${JSON.stringify(received)} to have $schema, $id, and type fields`,
        pass: false,
      };
    }
  },

  /**
   * Check if markdown contains valid table
   */
  toContainValidMarkdownTable(received) {
    const hasTableHeader = /\|.*\|/.test(received);
    const hasSeparator = /\|[\s-:]+\|/.test(received);
    const hasRows = (received.match(/\|.*\|/g) || []).length > 2;

    const isValid = hasTableHeader && hasSeparator && hasRows;

    if (isValid) {
      return {
        message: () => `Expected ${received} not to contain a valid markdown table`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `Expected ${received} to contain a valid markdown table with header, separator, and rows`,
        pass: false,
      };
    }
  },

  /**
   * Check if object is valid Cytoscape element
   */
  toBeValidCytoscapeElement(received) {
    const hasData = received.data !== undefined;
    const hasId = received.data && received.data.id !== undefined;

    if (hasData && hasId) {
      return {
        message: () => `Expected ${JSON.stringify(received)} not to be a valid Cytoscape element`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${JSON.stringify(received)} to have data.id field`,
        pass: false,
      };
    }
  },

  /**
   * Check if validation result has expected structure
   */
  toBeValidationResult(received) {
    const hasValid = typeof received.valid === 'boolean';
    const hasErrors = Array.isArray(received.errors);

    if (hasValid && hasErrors) {
      return {
        message: () => `Expected ${JSON.stringify(received)} not to be a validation result`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `Expected ${JSON.stringify(received)} to have valid (boolean) and errors (array) fields`,
        pass: false,
      };
    }
  },
});

// Global test utilities
global.testUtils = {
  /**
   * Create mock logger instance
   */
  createMockLogger() {
    return {
      section: jest.fn(),
      info: jest.fn(),
      success: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      stat: jest.fn(),
      progress: jest.fn(),
      debug: jest.fn(),
    };
  },

  /**
   * Create mock file system
   */
  createMockFileSystem() {
    const files = new Map();

    return {
      files,
      readJsonFile: jest.fn(async (path) => {
        if (!files.has(path)) {
          throw new Error(`ENOENT: ${path}`);
        }
        return JSON.parse(files.get(path));
      }),
      writeFile: jest.fn(async (path, content) => {
        files.set(path, content);
      }),
      readFile: jest.fn(async (path) => {
        if (!files.has(path)) {
          throw new Error(`ENOENT: ${path}`);
        }
        return files.get(path);
      }),
      addFile: (path, content) => {
        files.set(path, typeof content === 'string' ? content : JSON.stringify(content));
      },
      reset: () => {
        files.clear();
      },
    };
  },

  /**
   * Wait for async operations to complete
   */
  async waitForAsync(ms = 0) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  },

  /**
   * Suppress console output during tests
   */
  suppressConsole() {
    const original = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
    };

    beforeEach(() => {
      console.log = jest.fn();
      console.warn = jest.fn();
      console.error = jest.fn();
      console.info = jest.fn();
    });

    afterEach(() => {
      console.log = original.log;
      console.warn = original.warn;
      console.error = original.error;
      console.info = original.info;
    });
  },

  /**
   * Generate random test data
   */
  generateTestNode(id, type = 'document', overrides = {}) {
    return {
      id,
      type,
      label: `Test ${type} ${id}`,
      ...overrides,
    };
  },

  generateTestEdge(id, source, target, type = 'links_to', overrides = {}) {
    return {
      id,
      source,
      target,
      type,
      ...overrides,
    };
  },

  generateTestGraph(nodeCount = 10, edgeCount = 20) {
    const nodes = Array.from({ length: nodeCount }, (_, i) =>
      this.generateTestNode(`node${i}`, 'document'),
    );
    const edges = Array.from({ length: edgeCount }, (_, i) =>
      this.generateTestEdge(
        `edge${i}`,
        `node${i % nodeCount}`,
        `node${(i + 1) % nodeCount}`,
        'links_to',
      ),
    );
    return { nodes, edges };
  },
};

// Configure test timeouts for different test types
const testType = process.env.TEST_TYPE || 'unit';
switch (testType) {
  case 'performance':
    jest.setTimeout(300000); // 5 minutes for performance tests
    break;
  case 'integration':
    jest.setTimeout(120000); // 2 minutes for integration tests
    break;
  case 'unit':
  default:
    jest.setTimeout(30000); // 30 seconds for unit tests
    break;
}

// Global error handlers
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
