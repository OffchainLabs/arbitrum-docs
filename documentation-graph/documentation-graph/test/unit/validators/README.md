# Validator Tests - RED Phase (TDD)

## Overview

This directory contains **FAILING** unit tests for Enhancement 1: JSON Schema Architecture. These tests are part of the RED phase of Test-Driven Development (TDD) and are designed to fail until the implementation is complete.

## Test Files

### SchemaValidator.test.js

Comprehensive tests for the `SchemaValidator` class covering:

**Constructor and Initialization (8 tests)**

- Instance creation and initialization
- AJV configuration (allErrors, strict mode, removeAdditional, coerceTypes)

**Schema Loading (10 tests)**

- Loading schemas from file paths
- Loading multiple schemas at once
- Schema compilation with AJV
- Error handling for non-existent/invalid schemas
- Schema structure validation
- Schema caching
- Directory loading
- Performance constraints (<100ms)

**Data Validation (20 tests)**

- Valid data validation
- Invalid data error detection
- Detailed error information
- All errors collection (allErrors option)
- Null/undefined/empty data handling
- Nested object validation
- Array item validation
- Type coercion
- Additional property removal
- Performance constraints (<100ms)

**Error Reporting (7 tests)**

- Human-readable error formatting
- Field path in error messages
- Error keyword identification
- Schema path information
- Expected vs actual in errors
- Error grouping by severity
- Error summary generation

**Schema Utilities (8 tests)**

- Schema loaded checking
- Schema name listing
- Schema retrieval by name
- Schema unloading
- Unloading all schemas
- Schema self-validation
- Invalid schema detection

**Edge Cases and Error Handling (5 tests)**

- Very large data objects
- Circular reference detection
- Special characters handling
- Concurrent validation calls

**Total: 58 test cases**

### DataValidator.test.js

Comprehensive tests for the `DataValidator` class covering:

**Constructor and Initialization (7 tests)**

- Instance creation
- Schemas directory configuration
- Default directory handling
- SchemaValidator initialization
- Schema loading during init
- Error handling for invalid directory
- Performance constraints (<500ms)

**Graph Validation (10 tests)**

- Valid graph validation
- Missing metadata detection
- Invalid node structure detection
- Invalid edge structure detection
- Null/undefined handling
- All node types validation
- All edge types validation
- Performance constraints (<100ms)

**Document Validation (10 tests)**

- Valid document validation
- Single document validation
- Missing required fields detection
- Document array validation
- Invalid document in array detection
- Empty array handling
- Links structure validation
- Frontmatter structure validation
- Performance constraints (<100ms)

**Concept Validation (8 tests)**

- Valid concept validation
- Metadata structure validation
- Missing metadata detection
- Individual concept structure
- Invalid concept detection
- Empty array handling
- Types and categories validation
- Performance constraints (<100ms)

**Analysis Validation (7 tests)**

- Valid analysis validation
- Metadata validation
- Missing sections detection
- Basic statistics structure
- Centrality metrics structure
- Invalid centrality values detection
- Performance constraints (<100ms)

**Validation Reports (7 tests)**

- Single validation report generation
- Comprehensive multi-validation reports
- Error details inclusion
- Warnings inclusion
- JSON export
- Markdown export
- Validation statistics

**Batch Validation (3 tests)**

- Multiple data types validation
- All errors reporting
- Performance constraints (<500ms)

**Error Handling and Edge Cases (5 tests)**

- Uninitialized validator handling
- Corrupted schema handling
- Very large datasets
- Special characters
- Concurrent validation requests

**Utility Methods (5 tests)**

- Schema list retrieval
- Schema existence checking
- Schema reloading
- Validation statistics
- Statistics reset

**Total: 62 test cases**

## Test Expectations

### All tests will FAIL because:

1. **Implementation doesn't exist**

   - `src/validators/SchemaValidator.js` - Not implemented
   - `src/validators/DataValidator.js` - Not implemented

2. **Schema files don't exist**

   - `schemas/graph-schema.json` - Not created
   - `schemas/document-schema.json` - Not created
   - `schemas/concept-schema.json` - Not created
   - `schemas/analysis-schema.json` - Not created

3. **Dependencies not configured**
   - AJV library not installed
   - Package configuration pending

## Performance Requirements

All validators must meet these constraints:

- **Schema loading**: < 100ms per schema
- **Data validation**: < 100ms for typical datasets
- **Batch validation**: < 500ms for multiple datasets
- **Initialization**: < 500ms for DataValidator

## Next Steps (GREEN Phase)

To make these tests pass:

1. **Install dependencies**

   ```shell
   npm install ajv ajv-formats
   ```

2. **Create schema files**

   - Implement JSON Schema Draft 07 schemas
   - Follow structure defined in schema tests

3. **Implement SchemaValidator class**

   - AJV integration with proper configuration
   - Schema loading and caching
   - Validation with comprehensive error reporting
   - Utility methods for schema management

4. **Implement DataValidator class**

   - Initialize with SchemaValidator
   - Type-specific validation methods
   - Report generation
   - Batch validation support

5. **Run tests and iterate**
   ```shell
   npm test test/unit/validators/
   ```

## Test Coverage Goals

- **Branches**: 90%+
- **Functions**: 95%+
- **Lines**: 95%+
- **Statements**: 95%+

## Test Utilities Used

- `performanceHelpers.js` - Timing and memory measurement
- `assertionHelpers.js` - Custom assertions for validation
- `testDataBuilder.js` - Test data generation
- `loggerMock.js` - Mock logger for testing

## Running Tests

```shell
# Run all validator tests
npm test -- test/unit/validators/

# Run specific test file
npm test -- test/unit/validators/SchemaValidator.test.js

# Run with coverage
npm test -- --coverage test/unit/validators/

# Run in watch mode
npm test -- --watch test/unit/validators/
```

## Expected Initial Results

```
FAIL test/unit/validators/SchemaValidator.test.js
FAIL test/unit/validators/DataValidator.test.js

Tests: 120 failed, 120 total
Time: ~2s
```

This is EXPECTED and CORRECT for the RED phase of TDD.
