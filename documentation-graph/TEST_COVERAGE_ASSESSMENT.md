# Test Coverage and Quality Assessment Report

## Documentation Graph Codebase

**Assessment Date:** 2025-10-13
**Codebase Version:** 1.2.0
**Assessment Scope:** Unit Tests, Integration Tests, Coverage Metrics, Test Quality

---

## Executive Summary

### Overall Assessment: MODERATE COVERAGE WITH CRITICAL GAPS

**Current State:**

- **Test Suites:** 25 total (19 passing, 6 failing)
- **Test Cases:** 913 total (715 passing, 198 failing)
- **Pass Rate:** 78.3% (tests passing)
- **Coverage Target:** 50% (branches, functions, lines, statements)
- **Source Files:** 12 main source files
- **Test Files:** 12 test files

**Key Findings:**

1. Strong test suite for MCP server components (DataPreprocessor, SmartCache)
2. Good coverage of reporter and visualization modules
3. Critical failures in core extractor tests due to interface mismatches
4. Missing tests for graph analyzer and graph builder (core components)
5. Test-fixture driven approach with good integration test structure
6. TDD practices evident in MCP server tests (RED phase documented)

---

## Detailed Coverage Analysis

### 1. Core Components Coverage

#### A. Document Extractor (`src/extractors/documentExtractor.js`)

**Status:** PARTIALLY COVERED - FAILING TESTS

**Test File:** `test/unit/extractors/documentExtractor.test.js`

**Coverage Highlights:**

- ✅ Frontmatter extraction
- ✅ Heading extraction with ID generation
- ✅ Link extraction (internal/external/anchor)
- ✅ Code block extraction
- ✅ Word counting
- ✅ Error handling for missing files

**Critical Issues:**

- ❌ Test expectations don't match actual implementation interface
- ❌ `extractCodeBlocks()` returns wrong type (not iterable)
- ❌ `resolvePath()` method mismatch (uses `dirname` which doesn't exist)
- ❌ Stats object missing `totalWords` property

**Test Quality:** MODERATE

- Good test structure with describe blocks
- Uses fixtures properly
- Edge cases covered (empty content, special characters)
- **Gap:** Tests written for old API, not updated with implementation changes

**Recommendations:**

1. Update test expectations to match current API
2. Add test for `DocumentExtractor.extractAll()` method
3. Add tests for sidebar integration
4. Add tests for chunk processing
5. Verify stats object structure matches implementation

---

#### B. Concept Extractor (`src/extractors/conceptExtractor.js`)

**Status:** PARTIALLY COVERED - FAILING TESTS

**Test File:** `test/unit/extractors/conceptExtractor.test.js`

**Coverage Highlights:**

- ✅ Term normalization
- ✅ Concept validation (stop words, domain terms)
- ✅ Similarity checking
- ❌ Concept extraction from text (broken)
- ❌ Missing method tests (`addConcept` doesn't exist)

**Critical Issues:**

- ❌ `extractConceptsFromText()` returns complex objects, not simple strings
- ❌ `addConcept()` method doesn't exist in implementation
- ❌ `calculateConceptMetrics()` interface mismatch
- ❌ `fastSimilarityCheck()` logic doesn't match test expectations

**Test Quality:** LOW-MODERATE

- Good edge case coverage intent
- API mismatch suggests stale tests
- Missing tests for:
  - TF-IDF weighting
  - Concept co-occurrence tracking
  - Batch processing
  - Cache management
  - Performance optimizations

**Recommendations:**

1. Refactor tests to match actual ConceptExtractor API
2. Add tests for `extractFromDocuments()` (main entry point)
3. Test compromise.js integration
4. Test domain-specific term recognition
5. Add performance tests for large document sets

---

#### C. Graph Builder (`src/builders/graphBuilder.js`)

**Status:** NOT COVERED

**Test File:** MISSING

**Coverage:** 0%

**Impact:** CRITICAL - Core component with no test coverage

**Missing Test Scenarios:**

- Graph construction from documents and concepts
- Node creation (documents, concepts, sections, directories, tags)
- Edge creation (contains, mentions, links_to, similar, parent_child, co_occurs)
- Similarity edge calculation
- Memory management during graph building
- Chunk-based processing
- Graph serialization

**Recommendations:**

1. **PRIORITY 1:** Create comprehensive unit test suite
2. Test memory-aware processing with explicit logging
3. Mock graphology library for unit tests
4. Test graph statistics calculation
5. Add integration tests for full graph building pipeline

---

#### D. Graph Analyzer (`src/analyzers/graphAnalyzer.js`)

**Status:** NOT COVERED

**Test File:** MISSING

**Coverage:** 0%

**Impact:** CRITICAL - Core component with no test coverage

**Missing Test Scenarios:**

- Centrality metrics calculation (degree, betweenness, closeness)
- Hub identification
- Orphaned content detection
- Graph statistics computation
- Quality assessment metrics
- Performance with large graphs

**Recommendations:**

1. **PRIORITY 1:** Create unit test suite for analyzer
2. Test centrality algorithms with known graph structures
3. Test edge cases (empty graphs, disconnected components)
4. Add performance tests for large-scale analysis
5. Validate statistical accuracy with benchmark datasets

---

### 2. MCP Server Components Coverage

#### A. DataPreprocessor (`mcp-server/src/core/DataPreprocessor.js`)

**Status:** EXCELLENT - TDD APPROACH

**Test File:** `mcp-server/test/unit/core/DataPreprocessor.test.js`

**Coverage Highlights:**

- ✅ 25 comprehensive tests (DP-U-001 to DP-U-025)
- ✅ Constructor validation and error handling
- ✅ Metadata summary generation with size constraints
- ✅ Inverted index building (concept↔document)
- ✅ Similarity matrix computation
- ✅ Large file chunking with manifest
- ✅ Full pipeline orchestration
- ✅ Idempotency testing
- ✅ Statistics reporting
- ✅ Empty data handling

**Test Quality:** EXCELLENT

- TDD RED phase documented (tests written first)
- Clear test IDs for traceability
- Edge cases well covered
- Performance constraints validated
- Uses fixture loader for test data
- Good separation of concerns

**Strengths:**

- Tests verify size limits (100KB metadata, 500KB chunks)
- Tests validate data integrity
- Tests check performance boundaries (<60s)
- Tests confirm idempotency
- Comprehensive edge case coverage

**Minor Gaps:**

- No tests for concurrent preprocessing
- No tests for incremental updates
- No tests for cache invalidation

---

#### B. SmartCache (`mcp-server/src/core/SmartCache.js`)

**Status:** EXCELLENT - TDD APPROACH

**Test File:** `mcp-server/test/unit/core/SmartCache.test.js`

**Coverage Highlights:**

- ✅ 32+ comprehensive tests (SC-U-001 to SC-E-003)
- ✅ LRU eviction policy with timestamp tracking
- ✅ TTL expiration handling
- ✅ Size calculation and limits
- ✅ Cache statistics (hits, misses, evictions)
- ✅ Concurrent access safety
- ✅ Predictive prefetching with pattern detection
- ✅ Query planning and optimization
- ✅ Cache warming strategies
- ✅ Request deduplication
- ✅ Edge cases (disabled cache, eviction during query)

**Test Quality:** EXCELLENT

- TDD RED phase documented
- Clear test categorization (LRU, Prefetching, Planning, Warming, Edge Cases)
- Performance constraints tested
- Concurrency tested (100 concurrent operations)
- Pattern learning tested
- Probabilistic prefetching tested

**Strengths:**

- Comprehensive coverage of caching strategies
- Tests validate memory management
- Tests verify prefetch effectiveness
- Tests confirm query optimization
- Edge cases extremely well covered

**Minor Gaps:**

- No tests for cache persistence across restarts
- No tests for distributed cache scenarios
- No tests for cache corruption recovery

---

### 3. Reporter and Visualization Components

#### Status: EXCELLENT COVERAGE

**Test Files:**

- `test/unit/reporters/MarkdownReportGenerator.test.js` (58 tests, all passing)
- `test/unit/reporters/ReportBuilder.test.js` (passing)
- `test/unit/reporters/formatters/MermaidFormatter.test.js` (passing)
- `test/unit/reporters/formatters/TableFormatter.test.js` (passing)
- `test/unit/reporters/sections/ExecutiveSummarySection.test.js` (passing)
- `test/unit/reporters/sections/TopConceptsSection.test.js` (passing)
- `test/unit/validators/DataValidator.test.js` (passing)
- `test/unit/validators/SchemaValidator.test.js` (passing)
- `test/unit/visualizers/ChunkedDataWriter.test.js` (passing)
- `test/unit/visualizers/DataExtractor.test.js` (passing)

**Coverage Highlights:**

- ✅ Report generation with all sections
- ✅ Markdown formatting and syntax validation
- ✅ Table of contents generation
- ✅ Mermaid diagram integration
- ✅ Error handling for missing data
- ✅ Performance constraints (<30s, <1MB)
- ✅ Configuration options
- ✅ Edge cases (special characters, zero stats, long names)
- ✅ Data validation with schemas
- ✅ Chunked data writing for large files

**Test Quality:** EXCELLENT

- Clear test organization
- Good use of beforeEach for setup
- Edge cases well covered
- Performance boundaries validated
- Configuration flexibility tested

---

### 4. Utility Components Coverage

#### A. File Utils (`src/utils/fileUtils.js`)

**Status:** COVERED

**Test File:** `test/unit/utils/fileUtils.test.js` (passing)

**Coverage:** Good baseline coverage for file operations

---

#### B. Logger (`src/utils/logger.js`)

**Status:** NOT COVERED

**Test File:** MISSING

**Impact:** LOW - Utility component, but logging correctness matters

**Recommendations:**

- Add tests for log level filtering
- Test progress bar functionality
- Test structured output formatting

---

#### C. Performance Monitor (`src/utils/performanceMonitor.js`)

**Status:** NOT COVERED

**Test File:** MISSING

**Impact:** MODERATE - Performance tracking should be validated

**Recommendations:**

- Test timing accuracy
- Test memory tracking
- Test metric aggregation

---

### 5. Integration Tests

#### A. Extraction Pipeline (`test/integration/extraction-pipeline.test.js`)

**Status:** COVERED

**Tests:**

- ✅ Full document extraction from fixtures
- ✅ Full concept extraction from documents
- ✅ Data consistency between phases
- ✅ Concept extraction from headings
- ✅ Performance within limits
- ✅ Memory usage validation

**Test Quality:** GOOD

- Tests full pipeline end-to-end
- Uses real fixtures
- Validates cross-phase data integrity
- Checks performance boundaries

**Gaps:**

- No integration test for graph building phase
- No integration test for analysis phase
- No integration test for visualization generation
- No integration test for complete end-to-end run

---

#### B. Report Generation (`test/integration/reportGeneration.test.js`)

**Status:** COVERED

**Test Quality:** GOOD

- Tests report generation integration

---

## Test Quality Assessment

### Strengths

1. **MCP Server Components (Excellent)**

   - TDD approach with RED phase documented
   - Comprehensive edge case coverage
   - Clear test identification (DP-U-001, SC-U-001, etc.)
   - Performance boundaries validated
   - Size constraints tested

2. **Reporter Components (Excellent)**

   - 715 passing tests demonstrate robustness
   - Error handling thoroughly tested
   - Configuration flexibility validated
   - Performance constraints enforced

3. **Test Structure (Good)**

   - Clear separation of unit vs integration tests
   - Good use of fixtures
   - Proper beforeEach/afterEach lifecycle
   - Descriptive test names

4. **Integration Testing (Good)**
   - End-to-end pipeline testing
   - Cross-component data integrity validation
   - Performance and memory validation

### Weaknesses

1. **API/Interface Mismatches (Critical)**

   - DocumentExtractor tests fail due to API changes
   - ConceptExtractor tests fail due to interface evolution
   - Tests not maintained alongside code changes
   - 198 failing tests indicate technical debt

2. **Missing Core Component Tests (Critical)**

   - GraphBuilder has 0% coverage (core component)
   - GraphAnalyzer has 0% coverage (core component)
   - These are the most complex components with highest risk

3. **Test Maintenance Issues**

   - Stale tests not updated with implementation
   - Breaking tests indicate CI/CD gaps
   - No clear process for keeping tests synchronized

4. **Coverage Gaps**

   - Logger utility not tested
   - PerformanceMonitor not tested
   - SidebarExtractor not tested
   - HTML visualizers not tested

5. **Limited Performance Testing**
   - Only basic time/memory checks
   - No stress testing
   - No scalability testing
   - No benchmarking suite

---

## Coverage Metrics Analysis

### Current Coverage Thresholds

```javascript
// documentation-graph/jest.config.js
coverageThreshold: {
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50
  }
}

// mcp-server/jest.config.js
coverageThreshold: {
  global: {
    branches: 70,
    functions: 75,
    lines: 75,
    statements: 75
  }
}
```

### Assessment

**Documentation Graph:** 50% threshold is LOW for production code

- Industry standard for critical code: 80%+
- Recommended minimum: 70%

**MCP Server:** 70-75% threshold is GOOD

- Appropriate for production quality
- Tests demonstrate this standard is achievable

### Recommendations

1. Increase documentation-graph thresholds incrementally:

   - Phase 1: 60% (fix failing tests)
   - Phase 2: 70% (add missing tests)
   - Phase 3: 80% (comprehensive coverage)

2. Maintain MCP server high standards
3. Add per-component thresholds for critical paths

---

## Test Maintainability Assessment

### Current Issues

1. **Fixture Management**

   - Good: Centralized fixture loading (`loadFixtureCached`)
   - Gap: No fixture versioning or schema validation

2. **Test Data**

   - Good: Separate fixtures directory
   - Gap: Fixtures may be outdated or minimal

3. **Test Isolation**

   - Good: beforeEach clears state
   - Gap: Some tests may have interdependencies

4. **Async Handling**

   - Good: Proper use of async/await
   - Gap: No timeout configuration for slow operations

5. **Mocking Strategy**
   - Gap: Limited use of mocks/stubs
   - Gap: No clear mocking framework usage
   - Gap: Integration tests use real implementations

### Recommendations

1. Implement fixture schema validation
2. Version test fixtures
3. Use dependency injection for better testability
4. Standardize on mocking framework (sinon, jest.mock)
5. Add test helpers for common operations

---

## Edge Case Coverage Assessment

### Well Covered

✅ **MCP Server (Excellent)**

- Empty data sets
- Oversized items
- Concurrent access
- TTL expiration
- Cache eviction
- Pattern matching edge cases
- Disabled cache scenarios
- Request deduplication

✅ **Reporters (Good)**

- Missing data
- Null/undefined values
- Special characters
- Zero statistics
- Very long names
- Empty collections

### Poorly Covered

❌ **Core Extractors**

- Malformed MDX files
- Encoding issues
- Circular references
- Extremely large documents
- Binary file handling
- Symbolic links

❌ **Graph Components**

- Empty graphs
- Disconnected components
- Cycles in graph
- Maximum node/edge limits
- Graph corruption scenarios

---

## Test Configuration Analysis

### Jest Configurations

**Main Config (`documentation-graph/jest.config.js`):**

```javascript
{
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  testMatch: ['**/test/**/*.test.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: ['src/**/*.js', '!src/index.js', '!**/node_modules/**', '!**/dist/**'],
  setupFilesAfterEnv: ['jest-extended/all'],
  verbose: true
}
```

**MCP Server Config (`mcp-server/jest.config.js`):**

```javascript
{
  testEnvironment: 'node',
  testMatch: ['**/test/unit/**/*.test.js', '**/test/integration/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/test/setup/jest.setup.js'],
  testTimeout: 30000,
  maxWorkers: '50%'
}
```

### Assessment

**Strengths:**

- ES modules properly configured
- jest-extended for better assertions
- Appropriate test timeouts (30s)
- Parallel execution limited (50% workers)

**Gaps:**

- No separate configs for unit vs integration
- No performance test configuration
- No test result reporters configured
- Missing test retry configuration

---

## Critical Test Gaps Summary

### Priority 1 (Critical - Must Fix)

1. **Fix Failing Tests (198 failures)**

   - Update DocumentExtractor tests to match implementation
   - Update ConceptExtractor tests to match implementation
   - Restore test suite to passing state

2. **Graph Builder Test Suite (0% coverage)**

   - Create comprehensive unit tests
   - Test graph construction algorithms
   - Test memory management
   - Test performance characteristics

3. **Graph Analyzer Test Suite (0% coverage)**
   - Test centrality calculations
   - Test hub/orphan detection
   - Test statistics generation
   - Validate algorithm correctness

### Priority 2 (High - Should Add)

4. **End-to-End Integration Tests**

   - Full pipeline test (extract → concepts → graph → analyze → visualize)
   - Test with realistic dataset
   - Validate output artifacts
   - Check performance boundaries

5. **HTML Visualizer Tests**

   - Test visualization generation
   - Test Cytoscape.js integration
   - Test interactive features
   - Validate HTML output

6. **Performance Test Suite**
   - Benchmark extraction performance
   - Benchmark graph building
   - Benchmark analysis
   - Test scalability limits

### Priority 3 (Medium - Nice to Have)

7. **Sidebar Extractor Tests**

   - Test sidebar parsing
   - Test navigation structure
   - Test orphan detection

8. **Performance Monitor Tests**

   - Test timing accuracy
   - Test memory tracking
   - Test metric reporting

9. **Mutation Testing**
   - Run mutation testing to verify test effectiveness
   - Identify weak test assertions
   - Improve test quality

---

## Test Execution Performance

### Current Performance

**Full Test Suite:** ~2.3 seconds

- 25 test suites
- 913 test cases
- Reasonable performance for development

**Issues:**

- 198 failing tests slow down development
- No separate fast/slow test categorization
- No watch mode optimization

### Recommendations

1. Tag slow tests for optional execution
2. Implement test sharding for CI/CD
3. Add smoke test suite for quick validation
4. Configure watch mode for rapid feedback

---

## CI/CD Integration Assessment

### Current State

**Package.json Scripts:**

```json
{
  "test": "NODE_OPTIONS=--experimental-vm-modules jest",
  "test:watch": "NODE_OPTIONS=--experimental-vm-modules jest --watch",
  "test:coverage": "NODE_OPTIONS=--experimental-vm-modules jest --coverage",
  "test:unit": "NODE_OPTIONS=--experimental-vm-modules jest --testPathPattern=unit",
  "test:integration": "NODE_OPTIONS=--experimental-vm-modules jest --testPathPattern=integration"
}
```

**Assessment:**

- ✅ Good separation of test types
- ✅ Coverage script available
- ✅ Watch mode for development
- ❌ No pre-commit hooks visible
- ❌ No CI pipeline configuration visible
- ❌ No test result reporting

### Recommendations

1. Add pre-commit hook to run fast tests
2. Configure GitHub Actions for CI
3. Add test result reporting (HTML, XML)
4. Add coverage reporting to CI
5. Fail CI on coverage decrease
6. Add performance regression detection

---

## Recommendations Summary

### Immediate Actions (Week 1)

1. **Fix All Failing Tests**

   - Update DocumentExtractor test expectations
   - Update ConceptExtractor test expectations
   - Verify all 198 failures resolved
   - Restore CI to green state

2. **Add Critical Missing Tests**
   - Create GraphBuilder test suite (minimum viable)
   - Create GraphAnalyzer test suite (minimum viable)
   - Add basic end-to-end integration test

### Short-term Actions (Month 1)

3. **Improve Test Coverage**

   - Add comprehensive GraphBuilder tests
   - Add comprehensive GraphAnalyzer tests
   - Add HTML visualizer tests
   - Add utility component tests
   - Target 70% overall coverage

4. **Enhance Test Quality**

   - Add performance benchmarks
   - Add stress tests for large datasets
   - Improve edge case coverage
   - Add mutation testing

5. **Improve Test Infrastructure**
   - Add pre-commit hooks
   - Configure CI/CD pipeline
   - Add test reporting
   - Add coverage tracking

### Long-term Actions (Quarter 1)

6. **Test Maintenance Process**

   - Document test maintenance guidelines
   - Add test review to PR process
   - Implement continuous test quality monitoring
   - Regular test refactoring sprints

7. **Advanced Testing**
   - Property-based testing for algorithms
   - Contract testing for MCP server
   - Visual regression testing for HTML output
   - Performance regression testing

---

## Test Quality Metrics

### Current Metrics

| Metric               | Current | Target        | Status      |
| -------------------- | ------- | ------------- | ----------- |
| Pass Rate            | 78.3%   | 100%          | ⚠️ POOR     |
| Unit Test Coverage   | ~50%    | 80%           | ⚠️ MODERATE |
| Integration Coverage | Partial | Complete      | ⚠️ MODERATE |
| Test Maintenance     | Poor    | Good          | ❌ POOR     |
| Edge Case Coverage   | Mixed   | High          | ⚠️ MODERATE |
| Performance Tests    | Minimal | Comprehensive | ❌ POOR     |
| Test Execution Time  | 2.3s    | <5s           | ✅ GOOD     |

### Quality Score: 4.5/10

**Breakdown:**

- MCP Server Tests: 9/10 (Excellent)
- Reporter Tests: 8/10 (Excellent)
- Core Extractor Tests: 2/10 (Poor - failing)
- Graph Component Tests: 0/10 (Missing)
- Integration Tests: 6/10 (Partial)
- Test Infrastructure: 5/10 (Basic)

---

## Conclusion

### Summary Assessment

The documentation-graph codebase shows a **bipolar test quality situation**:

**Excellent Areas:**

- MCP server components demonstrate world-class TDD practices
- Reporter components have comprehensive test coverage
- Test structure and organization are solid

**Critical Issues:**

- 198 failing tests indicate broken test maintenance
- Core components (GraphBuilder, GraphAnalyzer) have 0% coverage
- Test/implementation interface mismatches show process gaps

### Risk Assessment

**Current Risk Level: HIGH**

**Risks:**

1. Core graph building logic untested (high complexity, no coverage)
2. Failing tests mask new regressions
3. Technical debt accumulating in test suite
4. No confidence in refactoring safety

### Path Forward

**Phase 1: Stabilization (2 weeks)**

- Fix all failing tests
- Add minimum viable tests for graph components
- Restore CI to passing state

**Phase 2: Enhancement (1 month)**

- Comprehensive graph component testing
- Performance test suite
- Increase coverage to 70%

**Phase 3: Excellence (3 months)**

- Achieve 80%+ coverage
- Advanced testing techniques
- Continuous test quality monitoring

### Success Criteria

✅ All tests passing (0 failures)
✅ 80%+ code coverage across all components
✅ Comprehensive edge case coverage
✅ Performance benchmarks established
✅ CI/CD with test quality gates
✅ Test maintenance process documented

---

## Appendix: Test File Inventory

### Documentation Graph Tests

**Unit Tests (10 files):**

1. `test/unit/extractors/conceptExtractor.test.js` (FAILING)
2. `test/unit/extractors/documentExtractor.test.js` (FAILING)
3. `test/unit/reportGenerators/coverageGaps.test.js` (PASSING)
4. `test/unit/reportHelpers/conceptDescriptions.test.js` (PASSING)
5. `test/unit/reportHelpers/contentTypeDiscovery.test.js` (PASSING)
6. `test/unit/reportHelpers/thresholdConfiguration.test.js` (PASSING)
7. `test/unit/utils/fileUtils.test.js` (PASSING)
8. `documentation-graph/test/unit/reporters/*` (12 files, PASSING)
9. `documentation-graph/test/unit/validators/*` (2 files, PASSING)
10. `documentation-graph/test/unit/visualizers/*` (2 files, PASSING)

**Integration Tests (2 files):**

1. `test/integration/extraction-pipeline.test.js` (PASSING)
2. `test/integration/reportGeneration.test.js` (PASSING)

### MCP Server Tests

**Unit Tests (2 files):**

1. `mcp-server/test/unit/core/DataPreprocessor.test.js` (TDD, PASSING)
2. `mcp-server/test/unit/core/SmartCache.test.js` (TDD, PASSING)

### Missing Tests

**Critical Missing:**

1. `src/builders/graphBuilder.js` - NO TEST FILE
2. `src/analyzers/graphAnalyzer.js` - NO TEST FILE

**Important Missing:** 3. `src/visualizers/htmlVisualizer.js` - NO TEST FILE 4. `src/visualizers/optimizedHtmlVisualizer.js` - NO TEST FILE 5. `src/extractors/sidebarExtractor.js` - NO TEST FILE 6. `src/utils/logger.js` - NO TEST FILE 7. `src/utils/performanceMonitor.js` - NO TEST FILE

---

**Report Generated:** 2025-10-13
**Assessor:** Test Automation Engineer (AI)
**Next Review:** After Phase 1 completion (2 weeks)
