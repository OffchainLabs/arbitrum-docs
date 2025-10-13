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

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuration constants for AJV validator
 * @constant
 */
const AJV_CONFIG = {
  allErrors: true, // Collect all validation errors, not just the first
  strict: false, // Allow flexibility in schema structure
  removeAdditional: true, // Remove properties not defined in schema
  coerceTypes: true, // Automatically coerce types when possible
};

/**
 * Valid JSON Schema types
 * @constant
 */
const VALID_JSON_SCHEMA_TYPES = [
  'object',
  'array',
  'string',
  'number',
  'integer',
  'boolean',
  'null',
];

/**
 * Schema identifier property name
 * @constant
 */
const SCHEMA_ID_PROPERTY = '$id';

/**
 * Minimum supported JSON Schema draft version
 * @constant
 */
const MIN_SCHEMA_DRAFT = 'draft-07';

/**
 * Error severity levels for validation errors
 * @constant
 */
const ERROR_SEVERITY = {
  CRITICAL: ['required', 'type'],
  WARNING: [], // All other error types are warnings
};

/**
 * SchemaValidator - Validates data against JSON Schema definitions
 *
 * This class provides comprehensive JSON Schema validation using the AJV library.
 * It supports loading schemas from files or directories, validating data against
 * loaded schemas, and providing detailed error reporting.
 *
 * @class
 * @example
 * const validator = new SchemaValidator();
 * await validator.loadSchema('mySchema', '/path/to/schema.json');
 * const result = validator.validate('mySchema', data);
 * if (!result.valid) {
 *   console.error(validator.formatErrors(result.errors));
 * }
 */
export class SchemaValidator {
  /**
   * Creates a new SchemaValidator instance
   * Initializes AJV with optimal configuration for documentation validation
   */
  constructor() {
    /**
     * Loaded schema definitions indexed by name
     * @type {Object.<string, Object>}
     * @private
     */
    this.schemas = {};

    /**
     * Compiled AJV validators indexed by schema name
     * @type {Object.<string, Function>}
     * @private
     */
    this.validators = {};

    /**
     * AJV instance for schema compilation and validation
     * @type {Ajv}
     * @private
     */
    this.ajv = new Ajv(AJV_CONFIG);

    // Add standard format validators (date-time, uri, email, etc.)
    addFormats(this.ajv);
  }

  /**
   * Load a single schema from file
   *
   * Loads and compiles a JSON Schema from the specified file path.
   * Implements caching to avoid reloading the same schema multiple times.
   *
   * @param {string} name - Unique identifier for the schema
   * @param {string} schemaPath - Absolute path to the schema file
   * @returns {Promise<boolean>} True if schema loaded successfully
   * @throws {Error} If schema file not found or invalid
   *
   * @example
   * await validator.loadSchema('document', '/path/to/document-schema.json');
   */
  async loadSchema(name, schemaPath) {
    try {
      // Return early if schema already cached
      if (this.schemas[name]) {
        return true;
      }

      // Verify file exists before reading
      await fs.access(schemaPath);

      // Load and parse schema file
      const schema = await this._readSchemaFile(schemaPath);

      // Validate schema meets JSON Schema standards
      this._validateSchemaStructure(schema);

      // Store original schema
      this.schemas[name] = schema;

      // Compile schema for validation (remove $id to prevent AJV conflicts)
      this.validators[name] = this._compileSchema(schema);

      return true;
    } catch (error) {
      throw this._handleLoadError(error, schemaPath);
    }
  }

  /**
   * Read and parse schema file
   * @private
   * @param {string} filePath - Path to schema file
   * @returns {Promise<Object>} Parsed schema object
   */
  async _readSchemaFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Validate schema structure meets JSON Schema standards
   * @private
   * @param {Object} schema - Schema to validate
   * @throws {Error} If schema structure is invalid
   */
  _validateSchemaStructure(schema) {
    if (!this.validateSchema(schema)) {
      throw new Error('Invalid schema structure');
    }
  }

  /**
   * Compile schema with AJV, removing $id to prevent conflicts
   * @private
   * @param {Object} schema - Schema to compile
   * @returns {Function} Compiled validator function
   */
  _compileSchema(schema) {
    const schemaForCompile = { ...schema };
    delete schemaForCompile[SCHEMA_ID_PROPERTY];
    return this.ajv.compile(schemaForCompile);
  }

  /**
   * Handle errors during schema loading with improved error messages
   * @private
   * @param {Error} error - Original error
   * @param {string} schemaPath - Path that failed to load
   * @returns {Error} Enhanced error with better context
   */
  _handleLoadError(error, schemaPath) {
    if (error.code === 'ENOENT') {
      return new Error(`Schema file not found: ${schemaPath}`);
    }
    if (error instanceof SyntaxError) {
      return new Error(`Invalid JSON in schema file: ${schemaPath}. ${error.message}`);
    }
    return error;
  }

  /**
   * Load multiple schemas from a map of names to paths
   *
   * @param {Object.<string, string>} schemaMap - Map of schema names to file paths
   * @returns {Promise<boolean>} True if all schemas loaded successfully
   * @throws {Error} If any schema fails to load
   *
   * @example
   * await validator.loadSchemas({
   *   'document': '/path/to/document-schema.json',
   *   'graph': '/path/to/graph-schema.json'
   * });
   */
  async loadSchemas(schemaMap) {
    for (const [name, schemaPath] of Object.entries(schemaMap)) {
      await this.loadSchema(name, schemaPath);
    }
    return true;
  }

  /**
   * Load all schemas from a directory
   *
   * Automatically discovers and loads all files matching the pattern '*-schema.json'.
   * Schema names are derived from filenames (e.g., 'document-schema.json' -> 'document').
   *
   * @param {string} dir - Directory path containing schema files
   * @returns {Promise<number>} Number of schemas loaded
   * @throws {Error} If directory cannot be read or schemas are invalid
   *
   * @example
   * const count = await validator.loadSchemasFromDirectory('./schemas');
   * console.log(`Loaded ${count} schemas`);
   */
  async loadSchemasFromDirectory(dir) {
    const files = await fs.readdir(dir);
    const schemaFiles = this._filterSchemaFiles(files);

    let count = 0;
    for (const file of schemaFiles) {
      const name = this._extractSchemaName(file);
      const filePath = path.join(dir, file);
      await this.loadSchema(name, filePath);
      count++;
    }

    return count;
  }

  /**
   * Filter files to find schema files
   * @private
   * @param {string[]} files - Array of filenames
   * @returns {string[]} Filtered schema files
   */
  _filterSchemaFiles(files) {
    return files.filter((f) => f.endsWith('-schema.json'));
  }

  /**
   * Extract schema name from filename
   * @private
   * @param {string} filename - Schema filename
   * @returns {string} Schema name without suffix
   */
  _extractSchemaName(filename) {
    return filename.replace('-schema.json', '');
  }

  /**
   * Validate data against a loaded schema
   *
   * Performs validation and returns detailed results. Handles edge cases like
   * null/undefined data and circular references gracefully.
   *
   * @param {string} schemaName - Name of the loaded schema to validate against
   * @param {*} data - Data to validate
   * @returns {Object} Validation result with `valid` boolean and `errors` array
   * @throws {Error} If schema not found or circular reference detected
   *
   * @example
   * const result = validator.validate('document', documentData);
   * if (!result.valid) {
   *   console.error('Validation failed:', result.errors);
   * }
   */
  validate(schemaName, data) {
    const validator = this._getValidator(schemaName);

    // Handle null/undefined data
    if (data === undefined || data === null) {
      return this._validateNullableData(validator, data);
    }

    // Check for circular references before validation
    this._checkCircularReferences(data);

    // Perform validation on original data (allows AJV mutations like coercion)
    const valid = validator(data);

    return {
      valid,
      errors: valid ? [] : this.formatErrorsArray(validator.errors || []),
    };
  }

  /**
   * Validate and throw on error (convenience method)
   *
   * @param {string} schemaName - Name of schema to validate against
   * @param {*} data - Data to validate
   * @param {string} [description='Data'] - Description for error message
   * @returns {Object} Validation result if successful
   * @throws {Error} If validation fails
   *
   * @example
   * validator.validateOrThrow('document', doc, 'Document data');
   */
  validateOrThrow(schemaName, data, description = 'Data') {
    const result = this.validate(schemaName, data);
    if (!result.valid) {
      const errorMsg = `${description} validation failed:\n${this.formatErrors(result.errors)}`;
      throw new Error(errorMsg);
    }
    return result;
  }

  /**
   * Get validator for schema name
   * @private
   * @param {string} schemaName - Schema name
   * @returns {Function} Compiled validator
   * @throws {Error} If schema not found
   */
  _getValidator(schemaName) {
    const validator = this.validators[schemaName];
    if (!validator) {
      throw new Error(`Schema not found: ${schemaName}`);
    }
    return validator;
  }

  /**
   * Validate null or undefined data
   * @private
   * @param {Function} validator - AJV validator function
   * @param {*} data - Null or undefined data
   * @returns {Object} Validation result
   */
  _validateNullableData(validator, data) {
    const valid = validator(data);
    return {
      valid,
      errors: valid ? [] : this.formatErrorsArray(validator.errors || []),
    };
  }

  /**
   * Check for circular references in data
   * @private
   * @param {*} data - Data to check
   * @throws {Error} If circular reference detected
   */
  _checkCircularReferences(data) {
    try {
      JSON.stringify(data);
    } catch (error) {
      throw new Error('Circular reference detected in data');
    }
  }

  /**
   * Format AJV errors into consistent structure
   *
   * Transforms raw AJV errors into a standardized format with clear paths,
   * messages, and metadata for better error reporting.
   *
   * @param {Array} errors - Raw AJV validation errors
   * @returns {Array<Object>} Formatted error objects
   *
   * @example
   * const formatted = validator.formatErrorsArray(ajvErrors);
   * // [{ message: "...", path: "/field", keyword: "type", ... }]
   */
  formatErrorsArray(errors) {
    return errors.map((err) => ({
      message: err.message,
      path: this._extractErrorPath(err),
      keyword: err.keyword,
      schemaPath: err.schemaPath,
      params: err.params,
    }));
  }

  /**
   * Format errors for human-readable display
   *
   * Converts error objects into a multi-line string suitable for console output.
   *
   * @param {Array<Object>} errors - Formatted error objects
   * @returns {string} Multi-line error message
   *
   * @example
   * console.error(validator.formatErrors(result.errors));
   */
  formatErrors(errors) {
    return errors.map((err) => `  - ${err.path}: ${err.message}`).join('\n');
  }

  /**
   * Group errors by severity level
   *
   * Categorizes errors into critical (required/type) and warnings (all others).
   *
   * @param {Array<Object>} errors - Formatted error objects
   * @returns {Object} Object with critical and warnings arrays
   *
   * @example
   * const grouped = validator.groupErrorsBySeverity(errors);
   * console.log(`${grouped.critical.length} critical errors`);
   */
  groupErrorsBySeverity(errors) {
    return {
      critical: errors.filter((e) => ERROR_SEVERITY.CRITICAL.includes(e.keyword)),
      warnings: errors.filter((e) => !ERROR_SEVERITY.CRITICAL.includes(e.keyword)),
    };
  }

  /**
   * Get summary statistics for errors
   *
   * @param {Array<Object>} errors - Formatted error objects
   * @returns {Object} Summary with total count and breakdown by type
   *
   * @example
   * const summary = validator.getErrorSummary(errors);
   * // { totalErrors: 5, errorsByType: { required: 2, type: 3 } }
   */
  getErrorSummary(errors) {
    const byType = {};
    errors.forEach((err) => {
      byType[err.keyword] = (byType[err.keyword] || 0) + 1;
    });

    return {
      totalErrors: errors.length,
      errorsByType: byType,
    };
  }

  /**
   * Extract clean error path from AJV error
   * @private
   * @param {Object} err - AJV error object
   * @returns {string} Error path
   */
  _extractErrorPath(err) {
    if (err.instancePath) {
      return err.instancePath;
    }
    if (err.params?.missingProperty) {
      return `/${err.params.missingProperty}`;
    }
    return '/';
  }

  /**
   * Validate schema structure meets JSON Schema standards
   *
   * Performs basic structural validation to ensure schema is valid JSON Schema.
   * Checks for proper types, structure, and draft version compatibility.
   *
   * @param {Object} schema - Schema object to validate
   * @returns {boolean} True if schema structure is valid
   *
   * @example
   * if (validator.validateSchema(schemaObj)) {
   *   console.log('Valid schema structure');
   * }
   */
  validateSchema(schema) {
    // Check schema is an object
    if (!schema || typeof schema !== 'object') {
      return false;
    }

    // Validate schema draft version if present
    if (schema.$schema && !schema.$schema.includes(MIN_SCHEMA_DRAFT)) {
      return false;
    }

    // Validate type if present
    if (schema.type && !VALID_JSON_SCHEMA_TYPES.includes(schema.type)) {
      return false;
    }

    // Validate properties structure if present
    if (schema.properties && typeof schema.properties !== 'object') {
      return false;
    }

    return true;
  }

  /**
   * Check if schema is loaded
   *
   * @param {string} name - Schema name to check
   * @returns {boolean} True if schema is loaded
   */
  hasSchema(name) {
    return name in this.schemas;
  }

  /**
   * Get list of loaded schema names
   *
   * @returns {string[]} Array of loaded schema names
   */
  getLoadedSchemas() {
    return Object.keys(this.schemas);
  }

  /**
   * Get schema definition by name
   *
   * @param {string} name - Schema name
   * @returns {Object|undefined} Schema object or undefined if not found
   */
  getSchema(name) {
    return this.schemas[name];
  }

  /**
   * Unload a specific schema
   *
   * Removes schema and its compiled validator from memory.
   *
   * @param {string} name - Schema name to unload
   */
  unloadSchema(name) {
    delete this.schemas[name];
    delete this.validators[name];
  }

  /**
   * Unload all schemas
   *
   * Clears all loaded schemas and validators from memory.
   */
  unloadAll() {
    this.schemas = {};
    this.validators = {};
  }

  /**
   * Generate validation report from results
   *
   * @param {Object} results - Validation results
   * @returns {Object} Formatted validation report
   */
  generateReport(results) {
    return {
      valid: results.valid,
      errorCount: results.errors.length,
      errors: results.errors,
    };
  }
}

export default SchemaValidator;
