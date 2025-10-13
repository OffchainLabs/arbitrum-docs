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

import SchemaValidator from './SchemaValidator.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Default schemas directory path
 * @constant
 */
const DEFAULT_SCHEMAS_DIR = path.join(__dirname, '../../schemas');

/**
 * Data type identifiers for validation
 * @constant
 */
const DATA_TYPES = {
  GRAPH: 'graph',
  DOCUMENT: 'document',
  CONCEPT: 'concept',
  ANALYSIS: 'analysis',
};

/**
 * DataValidator - High-level validator for documentation graph data
 *
 * Provides domain-specific validation for documentation graph data structures.
 * Wraps SchemaValidator with convenient methods for common validation scenarios
 * and maintains validation statistics.
 *
 * @class
 * @example
 * const validator = new DataValidator();
 * await validator.initialize();
 * const result = validator.validateGraph(graphData);
 */
export class DataValidator {
  /**
   * Creates a new DataValidator instance
   *
   * @param {string|null} [schemasDir=null] - Custom schemas directory path
   */
  constructor(schemasDir = null) {
    /**
     * Directory containing schema files
     * @type {string}
     * @private
     */
    this.schemasDir = schemasDir || DEFAULT_SCHEMAS_DIR;

    /**
     * Underlying schema validator
     * @type {SchemaValidator}
     * @private
     */
    this.schemaValidator = new SchemaValidator();

    /**
     * Initialization state flag
     * @type {boolean}
     * @private
     */
    this.initialized = false;

    /**
     * Validation statistics tracking
     * @type {Object}
     * @private
     */
    this.validationStats = {
      totalValidations: 0,
      successfulValidations: 0,
      failedValidations: 0,
    };
  }

  /**
   * Initialize validator by loading all schemas
   *
   * Must be called before any validation operations.
   * Loads all schema files from the schemas directory.
   *
   * @returns {Promise<void>}
   * @throws {Error} If schemas directory not found
   */
  async initialize() {
    await this._verifyDirectoryExists();
    await this.schemaValidator.loadSchemasFromDirectory(this.schemasDir);
    this.initialized = true;
  }

  /**
   * Ensure validator is initialized before validation
   *
   * @private
   * @throws {Error} If validator not initialized
   */
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('Validator not initialized. Call initialize() first.');
    }
  }

  /**
   * Verify schemas directory exists
   *
   * @private
   * @returns {Promise<void>}
   * @throws {Error} If directory not found
   */
  async _verifyDirectoryExists() {
    try {
      await fs.access(this.schemasDir);
    } catch (error) {
      throw new Error(`Schemas directory not found: ${this.schemasDir}`);
    }
  }

  /**
   * Base validation method with statistics tracking
   *
   * @private
   * @param {string} schemaName - Schema to validate against
   * @param {*} data - Data to validate
   * @param {string} dataType - Type identifier for result
   * @returns {Object} Validation result with dataType
   */
  _validateWithStats(schemaName, data, dataType) {
    this.ensureInitialized();
    this.validationStats.totalValidations++;

    const result = this.schemaValidator.validate(schemaName, data);
    result.dataType = dataType;

    if (result.valid) {
      this.validationStats.successfulValidations++;
    } else {
      this.validationStats.failedValidations++;
    }

    return result;
  }

  /**
   * Validate graph data structure
   *
   * @param {Object} graphData - Graph data to validate
   * @returns {Object} Validation result
   *
   * @example
   * const result = validator.validateGraph(graphData);
   * if (!result.valid) {
   *   console.error('Graph validation failed:', result.errors);
   * }
   */
  validateGraph(graphData) {
    return this._validateWithStats(DATA_TYPES.GRAPH, graphData, DATA_TYPES.GRAPH);
  }

  /**
   * Validate single document structure
   *
   * @param {Object} document - Document to validate
   * @returns {Object} Validation result
   */
  validateDocument(document) {
    return this._validateWithStats(DATA_TYPES.DOCUMENT, document, DATA_TYPES.DOCUMENT);
  }

  /**
   * Validate documents (array or single)
   *
   * Handles both single document objects and arrays of documents.
   * For arrays, validates each document and aggregates errors.
   *
   * @param {Object|Object[]} documents - Single document or array of documents
   * @returns {Object} Validation result
   */
  validateDocuments(documents) {
    // Handle array of documents
    if (Array.isArray(documents)) {
      return this._validateDocumentArray(documents);
    }

    // Single document
    return this.validateDocument(documents);
  }

  /**
   * Validate array of documents
   *
   * @private
   * @param {Object[]} documents - Array of documents
   * @returns {Object} Validation result with aggregated errors
   */
  _validateDocumentArray(documents) {
    this.ensureInitialized();
    this.validationStats.totalValidations++;

    // Handle empty array
    if (documents.length === 0) {
      this.validationStats.successfulValidations++;
      return {
        valid: true,
        errors: [],
        warnings: ['Empty documents array'],
        dataType: DATA_TYPES.DOCUMENT,
      };
    }

    // Validate each document
    const { allValid, allErrors } = this._validateArrayItems(documents, DATA_TYPES.DOCUMENT);

    // Update stats
    if (allValid) {
      this.validationStats.successfulValidations++;
    } else {
      this.validationStats.failedValidations++;
    }

    return {
      valid: allValid,
      errors: allErrors,
      dataType: DATA_TYPES.DOCUMENT,
    };
  }

  /**
   * Validate array items and aggregate errors
   *
   * @private
   * @param {Array} items - Items to validate
   * @param {string} schemaName - Schema to validate against
   * @returns {Object} Object with allValid flag and allErrors array
   */
  _validateArrayItems(items, schemaName) {
    let allValid = true;
    const allErrors = [];

    items.forEach((item, index) => {
      const result = this.schemaValidator.validate(schemaName, item);
      if (!result.valid) {
        allValid = false;
        result.errors.forEach((err) => {
          allErrors.push({
            ...err,
            path: `[${index}]${err.path}`,
          });
        });
      }
    });

    return { allValid, allErrors };
  }

  /**
   * Validate concepts data structure
   *
   * @param {Object} concepts - Concepts data to validate
   * @returns {Object} Validation result
   */
  validateConcepts(concepts) {
    return this._validateWithStats(DATA_TYPES.CONCEPT, concepts, DATA_TYPES.CONCEPT);
  }

  /**
   * Validate analysis data structure
   *
   * @param {Object} analysis - Analysis data to validate
   * @returns {Object} Validation result
   */
  validateAnalysis(analysis) {
    return this._validateWithStats(DATA_TYPES.ANALYSIS, analysis, DATA_TYPES.ANALYSIS);
  }

  /**
   * Validate all data types in batch
   *
   * Validates multiple data types in a single call. Useful for validating
   * complete pipeline outputs.
   *
   * @param {Object} batch - Object containing data types to validate
   * @param {Object} [batch.graph] - Graph data
   * @param {Object|Object[]} [batch.documents] - Document(s) data
   * @param {Object} [batch.concepts] - Concepts data
   * @param {Object} [batch.analysis] - Analysis data
   * @returns {Object} Map of data types to validation results
   *
   * @example
   * const results = validator.validateBatch({
   *   graph: graphData,
   *   documents: documentArray,
   *   concepts: conceptsData
   * });
   */
  validateBatch(batch) {
    this.ensureInitialized();

    const results = {};
    const validators = {
      graph: this.validateGraph.bind(this),
      documents: this.validateDocuments.bind(this),
      concepts: this.validateConcepts.bind(this),
      analysis: this.validateAnalysis.bind(this),
    };

    // Validate each present data type
    Object.entries(validators).forEach(([key, validator]) => {
      if (batch[key]) {
        results[key] = validator(batch[key]);
      }
    });

    return results;
  }

  /**
   * Validate all outputs (alias for validateBatch)
   *
   * @param {Object} outputs - Object containing data types to validate
   * @returns {Object} Map of data types to validation results
   */
  validateAll(outputs) {
    return this.validateBatch(outputs);
  }

  /**
   * Generate validation report for single result
   *
   * @param {Object} result - Validation result
   * @returns {Object} Formatted validation report
   */
  generateReport(result) {
    return {
      summary: {
        valid: result.valid,
        errorCount: result.errors.length,
        dataType: result.dataType,
      },
      details: {
        errors: result.errors,
        warnings: result.warnings || [],
      },
      statistics: {
        validationTime: Date.now(),
        dataSize: JSON.stringify(result).length,
      },
    };
  }

  /**
   * Generate comprehensive report for multiple validations
   *
   * @param {Object} results - Map of validation results
   * @returns {Object} Comprehensive validation report
   */
  generateComprehensiveReport(results) {
    const allValid = Object.values(results).every((r) => r.valid);
    const totalErrors = Object.values(results).reduce((sum, r) => sum + r.errors.length, 0);

    return {
      timestamp: new Date().toISOString(),
      overall: {
        allValid,
        totalErrors,
        validatedTypes: Object.keys(results),
      },
      byDataType: results,
    };
  }

  /**
   * Generate validation report in specified format
   *
   * @param {Object} results - Validation results
   * @param {string} [format='json'] - Output format ('json' or 'markdown')
   * @returns {Object|string} Formatted report
   */
  generateValidationReport(results, format = 'json') {
    const report = this.generateComprehensiveReport(results);

    if (format === 'json') {
      return report;
    }

    if (format === 'markdown') {
      return this.exportReportToMarkdown(report);
    }

    return report;
  }

  /**
   * Export report to JSON string
   *
   * @param {Object} report - Report object
   * @returns {string} JSON string
   */
  exportReportToJSON(report) {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Export report to Markdown format
   *
   * @param {Object} report - Validation report
   * @returns {string} Markdown formatted report
   */
  exportReportToMarkdown(report) {
    let md = '# Validation Report\n\n';
    md += `**Generated:** ${report.timestamp || new Date().toISOString()}\n\n`;

    // Add summary section if present
    if (report.summary) {
      md += this._generateSummarySection(report.summary);
    }

    // Add overall results if present
    if (report.overall) {
      md += this._generateOverallSection(report.overall);
    }

    // Add errors section if present
    if (report.details?.errors?.length > 0) {
      md += this._generateErrorsSection(report.details.errors);
    }

    return md;
  }

  /**
   * Generate summary section for markdown report
   * @private
   */
  _generateSummarySection(summary) {
    return `## Summary\n\n- **Valid:** ${summary.valid}\n- **Errors:** ${summary.errorCount}\n\n`;
  }

  /**
   * Generate overall results section for markdown report
   * @private
   */
  _generateOverallSection(overall) {
    return `## Overall Results\n\n- **All Valid:** ${overall.allValid}\n- **Total Errors:** ${
      overall.totalErrors
    }\n- **Types Validated:** ${overall.validatedTypes.join(', ')}\n\n`;
  }

  /**
   * Generate errors section for markdown report
   * @private
   */
  _generateErrorsSection(errors) {
    let md = '## Errors\n\n';
    errors.forEach((err) => {
      md += `- **${err.path}:** ${err.message}\n`;
    });
    return md + '\n';
  }

  /**
   * Get list of loaded schemas
   *
   * @returns {string[]} Array of loaded schema names
   */
  getLoadedSchemas() {
    return this.schemaValidator.getLoadedSchemas();
  }

  /**
   * Check if specific schema is loaded
   *
   * @param {string} name - Schema name
   * @returns {boolean} True if schema is loaded
   */
  hasSchema(name) {
    return this.schemaValidator.hasSchema(name);
  }

  /**
   * Reload all schemas from directory
   *
   * @returns {Promise<void>}
   */
  async reloadSchemas() {
    this.schemaValidator.unloadAll();
    await this.initialize();
  }

  /**
   * Get current validation statistics
   *
   * @returns {Object} Validation statistics (copy)
   */
  getValidationStats() {
    return { ...this.validationStats };
  }

  /**
   * Get validation statistics (alias for getValidationStats)
   *
   * @returns {Object} Validation statistics (copy)
   */
  getValidationStatistics() {
    return this.getValidationStats();
  }

  /**
   * Reset validation statistics to zero
   */
  resetStats() {
    this.validationStats = {
      totalValidations: 0,
      successfulValidations: 0,
      failedValidations: 0,
    };
  }
}

export default DataValidator;
