# Test Coverage Improvement Action Plan

## Documentation Graph Codebase

**Plan Version:** 1.0
**Created:** 2025-10-13
**Owner:** Development Team
**Target Completion:** 3 months

---

## Overview

This action plan addresses the critical test coverage gaps and quality issues identified in the Test Coverage Assessment. The plan is structured in three phases with clear deliverables and success criteria.

---

## Phase 1: Stabilization (Weeks 1-2)

### Goal: Restore test suite to passing state and establish minimum viable coverage

**Success Criteria:**

- ✅ 0 failing tests (currently 198)
- ✅ All core components have minimum test coverage (>50%)
- ✅ CI pipeline passes consistently

---

### Week 1: Fix Failing Tests

#### Task 1.1: Fix DocumentExtractor Tests (Priority: CRITICAL)

**File:** `test/unit/extractors/documentExtractor.test.js`

**Issues to Fix:**

1. **extractLinks() method mismatch**

   ```javascript
   // Current test expects:
   const links = extractor.extractLinks(content);
   // But implementation uses:
   const links = DocumentExtractor.extractLinks(content, currentPath);
   ```

   **Action:** Update test to pass `currentPath` parameter

2. **extractCodeBlocks() return type mismatch**

   ```javascript
   // Test expects array: blocks[0].toContain('code')
   // Implementation may return Set or different structure
   ```

   **Action:** Verify actual return type and update test expectations

3. **Stats object structure**

   ```javascript
   // Test expects: stats.totalWords
   // Implementation has: stats.averageWordsPerDoc but not totalWords
   ```

   **Action:** Either add totalWords to stats or update test

4. **resolvePath() method name**
   ```javascript
   // Test uses: DocumentExtractor.dirname
   // Should be: path.dirname
   ```
   **Action:** Use correct path.dirname method

**Estimated Time:** 4 hours

**Test Plan:**

```bash
# Run only DocumentExtractor tests
npm run test:unit -- documentExtractor.test.js

# Expected outcome: All tests passing
```

---

#### Task 1.2: Fix ConceptExtractor Tests (Priority: CRITICAL)

**File:** `test/unit/extractors/conceptExtractor.test.js`

**Issues to Fix:**

1. **extractConceptsFromText() return structure**

   ```javascript
   // Test expects: Set<string>
   // Implementation returns: Array<ConceptObject>
   // ConceptObject: { text, normalized, type, pos, weight, ... }
   ```

   **Action:** Update tests to work with ConceptObject array

2. **Missing addConcept() method**

   ```javascript
   // Tests use: extractor.addConcept('term', 'file.md')
   // Method doesn't exist in implementation
   ```

   **Action:** Either implement addConcept() or refactor tests

3. **normalizeTerm() behavior**

   ```javascript
   // Test expects: 'test term' (with space)
   // Implementation returns: 'testterm' (no space)
   ```

   **Action:** Clarify normalization rules and align test/impl

4. **fastSimilarityCheck() logic**
   ```javascript
   // Test expects: fastSimilarityCheck('test', 'testing') === true
   // Implementation returns: false
   ```
   **Action:** Review similarity threshold and adjust test or implementation

**Estimated Time:** 6 hours

**Refactoring Approach:**

```javascript
// Option 1: Update tests to match current API
describe('extractConceptsFromText', () => {
  it('should extract concepts from simple text', () => {
    const text = 'Arbitrum is a blockchain platform.';
    const concepts = extractor.extractConceptsFromText(text);

    expect(Array.isArray(concepts)).toBe(true);
    expect(concepts.length).toBeGreaterThan(0);

    const normalized = concepts.map((c) => c.normalized);
    expect(normalized).toContain('arbitrum');
    expect(normalized).toContain('blockchain');
  });
});

// Option 2: Add helper methods to ConceptExtractor for testing
class ConceptExtractor {
  // Add for test compatibility
  addConcept(term, filePath) {
    // Implementation
  }

  getConceptStrings() {
    // Return array of normalized strings for testing
    return Array.from(this.concepts.keys());
  }
}
```

---

#### Task 1.3: Verify Schema Tests (Priority: HIGH)

**File:** `documentation-graph/test/unit/schemas/schemas.test.js`

**Issue:**

```
Schema files not created yet - tests will fail as expected
```

**Action:**

1. Check if schema files should exist
2. Either create schema files or mark tests as pending
3. Update test to handle missing schemas gracefully

**Estimated Time:** 2 hours

---

### Week 2: Add Minimum Viable Coverage for Core Components

#### Task 2.1: GraphBuilder Minimum Test Suite (Priority: CRITICAL)

**New File:** `test/unit/builders/graphBuilder.test.js`

**Minimum Test Coverage:**

```javascript
/**
 * GraphBuilder Minimum Viable Test Suite
 */
import { describe, test, expect, beforeEach } from '@jest/globals';
import GraphBuilder from '../../../src/builders/graphBuilder.js';

describe('GraphBuilder', () => {
  let builder;

  beforeEach(() => {
    builder = new GraphBuilder();
  });

  describe('constructor', () => {
    test('GB-U-001: Should create GraphBuilder instance', () => {
      expect(builder).toBeDefined();
      expect(builder.graph).toBeDefined();
    });
  });

  describe('buildGraph()', () => {
    test('GB-U-002: Should build graph from documents and concepts', async () => {
      const documents = new Map([
        [
          'doc1.md',
          {
            id: 'doc1',
            title: 'Test Doc',
            content: 'Test content',
            concepts: ['blockchain', 'smart contract'],
          },
        ],
      ]);

      const concepts = {
        concepts: new Map([['blockchain', { frequency: 5, documents: ['doc1.md'] }]]),
      };

      const result = await builder.buildGraph(documents, concepts);

      expect(result).toBeDefined();
      expect(result.nodes).toBeGreaterThan(0);
      expect(result.edges).toBeGreaterThan(0);
    });

    test('GB-U-003: Should handle empty input gracefully', async () => {
      const result = await builder.buildGraph(new Map(), { concepts: new Map() });

      expect(result).toBeDefined();
      expect(result.nodes).toBe(0);
    });

    test('GB-U-004: Should create document nodes', async () => {
      const documents = new Map([['doc1.md', { id: 'doc1', title: 'Test' }]]);

      await builder.buildGraph(documents, { concepts: new Map() });

      const docNodes = builder.getNodesByType('document');
      expect(docNodes.length).toBeGreaterThan(0);
    });

    test('GB-U-005: Should create concept nodes', async () => {
      const concepts = {
        concepts: new Map([['blockchain', { frequency: 5 }]]),
      };

      await builder.buildGraph(new Map(), concepts);

      const conceptNodes = builder.getNodesByType('concept');
      expect(conceptNodes.length).toBeGreaterThan(0);
    });
  });

  describe('addSimilarityEdges()', () => {
    test('GB-U-006: Should create similarity edges between similar docs', () => {
      // Test similarity edge creation
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Memory Management', () => {
    test('GB-U-007: Should process large graphs without excessive memory', async () => {
      const largeDocSet = new Map();
      for (let i = 0; i < 100; i++) {
        largeDocSet.set(`doc${i}.md`, {
          id: `doc${i}`,
          title: `Document ${i}`,
        });
      }

      const memBefore = process.memoryUsage().heapUsed;
      await builder.buildGraph(largeDocSet, { concepts: new Map() });
      const memAfter = process.memoryUsage().heapUsed;

      const memUsedMB = (memAfter - memBefore) / 1024 / 1024;
      expect(memUsedMB).toBeLessThan(500); // Less than 500MB for 100 docs
    });
  });

  describe('getStats()', () => {
    test('GB-U-008: Should return graph statistics', async () => {
      await builder.buildGraph(new Map([['doc1.md', { id: 'doc1' }]]), { concepts: new Map() });

      const stats = builder.getStats();

      expect(stats).toHaveProperty('totalNodes');
      expect(stats).toHaveProperty('totalEdges');
      expect(stats).toHaveProperty('nodeTypes');
    });
  });
});
```

**Estimated Time:** 8 hours

---

#### Task 2.2: GraphAnalyzer Minimum Test Suite (Priority: CRITICAL)

**New File:** `test/unit/analyzers/graphAnalyzer.test.js`

**Minimum Test Coverage:**

```javascript
/**
 * GraphAnalyzer Minimum Viable Test Suite
 */
import { describe, test, expect, beforeEach } from '@jest/globals';
import GraphAnalyzer from '../../../src/analyzers/graphAnalyzer.js';

describe('GraphAnalyzer', () => {
  let analyzer;
  let mockGraph;

  beforeEach(() => {
    analyzer = new GraphAnalyzer();
    mockGraph = createMockGraph(); // Helper to create test graph
  });

  describe('analyzeCentrality()', () => {
    test('GA-U-001: Should calculate degree centrality', () => {
      const centrality = analyzer.analyzeCentrality(mockGraph, 'degree');

      expect(centrality).toBeDefined();
      expect(Object.keys(centrality).length).toBeGreaterThan(0);
    });

    test('GA-U-002: Should calculate betweenness centrality', () => {
      const centrality = analyzer.analyzeCentrality(mockGraph, 'betweenness');

      expect(centrality).toBeDefined();
      expect(Object.keys(centrality).length).toBeGreaterThan(0);
    });

    test('GA-U-003: Should handle disconnected graphs', () => {
      const disconnectedGraph = createDisconnectedGraph();
      const centrality = analyzer.analyzeCentrality(disconnectedGraph, 'degree');

      expect(centrality).toBeDefined();
    });
  });

  describe('identifyHubs()', () => {
    test('GA-U-004: Should identify hub documents', () => {
      const hubs = analyzer.identifyHubs(mockGraph, { topN: 10 });

      expect(Array.isArray(hubs)).toBe(true);
      expect(hubs.length).toBeLessThanOrEqual(10);

      // Hubs should be sorted by centrality descending
      if (hubs.length > 1) {
        for (let i = 0; i < hubs.length - 1; i++) {
          expect(hubs[i].centrality).toBeGreaterThanOrEqual(hubs[i + 1].centrality);
        }
      }
    });
  });

  describe('identifyOrphans()', () => {
    test('GA-U-005: Should identify orphaned content', () => {
      const orphans = analyzer.identifyOrphans(mockGraph);

      expect(Array.isArray(orphans)).toBe(true);
    });

    test('GA-U-006: Should consider nodes with no edges as orphans', () => {
      const graphWithOrphan = createGraphWithOrphan();
      const orphans = analyzer.identifyOrphans(graphWithOrphan);

      expect(orphans.length).toBeGreaterThan(0);
    });
  });

  describe('calculateStats()', () => {
    test('GA-U-007: Should calculate graph statistics', () => {
      const stats = analyzer.calculateStats(mockGraph);

      expect(stats).toHaveProperty('totalNodes');
      expect(stats).toHaveProperty('totalEdges');
      expect(stats).toHaveProperty('averageDegree');
      expect(stats).toHaveProperty('density');
    });
  });

  describe('Performance', () => {
    test('GA-U-008: Should analyze large graphs in reasonable time', () => {
      const largeGraph = createLargeGraph(1000); // 1000 nodes

      const startTime = Date.now();
      analyzer.analyzeCentrality(largeGraph, 'degree');
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000); // Less than 5 seconds
    });
  });
});

// Helper functions
function createMockGraph() {
  // Create simple graph for testing
  return {
    nodes: ['doc1', 'doc2', 'doc3'],
    edges: [
      { source: 'doc1', target: 'doc2' },
      { source: 'doc2', target: 'doc3' },
    ],
  };
}

function createDisconnectedGraph() {
  return {
    nodes: ['doc1', 'doc2', 'doc3', 'doc4'],
    edges: [
      { source: 'doc1', target: 'doc2' },
      // doc3 and doc4 disconnected
    ],
  };
}

function createGraphWithOrphan() {
  return {
    nodes: ['doc1', 'doc2', 'orphan'],
    edges: [
      { source: 'doc1', target: 'doc2' },
      // 'orphan' has no edges
    ],
  };
}

function createLargeGraph(size) {
  const nodes = [];
  const edges = [];

  for (let i = 0; i < size; i++) {
    nodes.push(`node${i}`);
    if (i > 0) {
      edges.push({ source: `node${i - 1}`, target: `node${i}` });
    }
  }

  return { nodes, edges };
}
```

**Estimated Time:** 8 hours

---

#### Task 2.3: CI Pipeline Configuration (Priority: HIGH)

**New File:** `.github/workflows/test.yml`

```yaml
name: Test Suite

on:
  push:
    branches: [master, documentation-graph]
  pull_request:
    branches: [master]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella

      - name: Check coverage threshold
        run: |
          COVERAGE=$(node -pe "JSON.parse(require('fs').readFileSync('./coverage/coverage-summary.json')).total.lines.pct")
          echo "Coverage: $COVERAGE%"
          if (( $(echo "$COVERAGE < 50" | bc -l) )); then
            echo "Coverage is below 50%"
            exit 1
          fi
```

**Estimated Time:** 4 hours

---

### Phase 1 Deliverables

- [ ] All 198 failing tests fixed
- [ ] GraphBuilder minimum test suite (8 tests)
- [ ] GraphAnalyzer minimum test suite (8 tests)
- [ ] CI pipeline configured
- [ ] Test pass rate: 100%
- [ ] Coverage: >50% overall

**Total Estimated Time:** 32 hours (1 week with 2 developers)

---

## Phase 2: Enhancement (Weeks 3-6)

### Goal: Achieve comprehensive coverage and improve test quality

**Success Criteria:**

- ✅ 70%+ code coverage across all components
- ✅ Comprehensive edge case coverage
- ✅ Performance benchmarks established
- ✅ Test maintainability improved

---

### Week 3: Comprehensive Graph Component Testing

#### Task 3.1: Complete GraphBuilder Test Suite

**Expand to 50+ tests covering:**

1. **Node Creation** (10 tests)

   - Document nodes with all attributes
   - Concept nodes with frequency data
   - Section nodes with hierarchy
   - Directory nodes
   - Tag nodes
   - Navigation root nodes

2. **Edge Creation** (15 tests)

   - Contains relationships
   - Mentions relationships
   - Links_to relationships
   - Similar relationships
   - Parent_child relationships
   - Co_occurs relationships
   - Navigation relationships

3. **Graph Operations** (10 tests)

   - Add node with validation
   - Add edge with validation
   - Remove node and cascade
   - Update node attributes
   - Merge similar concepts
   - Graph serialization
   - Graph deserialization

4. **Memory Management** (8 tests)

   - Chunk-based processing
   - Memory cleanup after chunks
   - Large graph handling (10k+ nodes)
   - Memory leak detection
   - Cache management

5. **Error Handling** (7 tests)
   - Invalid node data
   - Circular references
   - Duplicate nodes
   - Missing required fields
   - Corrupt data handling

**Estimated Time:** 20 hours

---

#### Task 3.2: Complete GraphAnalyzer Test Suite

**Expand to 50+ tests covering:**

1. **Centrality Algorithms** (12 tests)

   - Degree centrality correctness
   - Betweenness centrality correctness
   - Closeness centrality correctness
   - PageRank algorithm
   - Eigenvector centrality
   - Verify against known graph structures

2. **Hub Analysis** (8 tests)

   - Hub identification algorithms
   - Hub scoring methods
   - Top-N hub selection
   - Hub categories (connectors, authorities)
   - Cross-component hubs

3. **Orphan Detection** (8 tests)

   - True orphans (no edges)
   - Weakly connected nodes
   - Sidebar coverage analysis
   - Link validation
   - Broken link detection

4. **Quality Metrics** (10 tests)

   - Documentation completeness
   - Link density
   - Concept coverage
   - Content freshness indicators
   - Readability metrics

5. **Graph Statistics** (7 tests)

   - Basic stats (nodes, edges, density)
   - Component analysis
   - Path length distribution
   - Clustering coefficient
   - Graph diameter

6. **Performance** (5 tests)
   - Large graph analysis (10k+ nodes)
   - Incremental analysis
   - Parallel processing
   - Memory efficiency
   - Time complexity validation

**Estimated Time:** 24 hours

---

### Week 4: Visualizer and Utility Testing

#### Task 4.1: HTML Visualizer Test Suite

**New File:** `test/unit/visualizers/htmlVisualizer.test.js`

**Coverage Areas:**

1. **Template Generation** (10 tests)

   - HTML structure validation
   - CSS injection
   - JavaScript injection
   - Cytoscape.js configuration
   - Interactive controls

2. **Data Formatting** (8 tests)

   - Graph data to Cytoscape format
   - Node styling
   - Edge styling
   - Layout configuration
   - Filter configuration

3. **File Output** (6 tests)

   - Write HTML file
   - Asset bundling
   - Relative path handling
   - Output directory creation
   - File permissions

4. **Error Handling** (6 tests)
   - Large graph handling
   - Invalid data
   - Write failures
   - Missing templates

**Estimated Time:** 16 hours

---

#### Task 4.2: Utility Component Tests

**New Files:**

- `test/unit/utils/logger.test.js`
- `test/unit/utils/performanceMonitor.test.js`

**Logger Tests (10 tests):**

- Log level filtering
- Section formatting
- Progress bar creation
- Progress bar updates
- Color output
- Stats formatting
- Error formatting
- Warning formatting
- Success formatting
- Quiet mode

**PerformanceMonitor Tests (8 tests):**

- Start timing
- Stop timing
- Memory tracking
- Metric aggregation
- Report generation
- Reset functionality
- Multiple concurrent timings
- Nested timing

**Estimated Time:** 12 hours

---

#### Task 4.3: SidebarExtractor Test Suite

**New File:** `test/unit/extractors/sidebarExtractor.test.js`

**Coverage Areas (15 tests):**

- Extract sidebar structure
- Parse nested categories
- Handle multiple sidebars
- Identify navigation roots
- Build hierarchy
- Orphan detection
- Error handling (missing sidebar)
- Docusaurus format support
- Custom sidebar formats

**Estimated Time:** 10 hours

---

### Week 5: Integration and End-to-End Testing

#### Task 5.1: Complete Pipeline Integration Test

**New File:** `test/integration/complete-pipeline.test.js`

```javascript
/**
 * Complete End-to-End Pipeline Integration Test
 */
describe('Complete Documentation Analysis Pipeline', () => {
  test('INT-001: Should process documentation from input to visualization', async () => {
    // 1. Document Extraction
    const extractor = new DocumentExtractor(testDocsDir);
    const { documents, sidebarData } = await extractor.extractAll();
    expect(documents.size).toBeGreaterThan(0);

    // 2. Concept Extraction
    const conceptExtractor = new ConceptExtractor();
    const concepts = await conceptExtractor.extractFromDocuments(documents);
    expect(concepts.concepts.size).toBeGreaterThan(0);

    // 3. Graph Building
    const builder = new GraphBuilder();
    const graph = await builder.buildGraph(documents, concepts);
    expect(graph.nodes).toBeGreaterThan(0);

    // 4. Graph Analysis
    const analyzer = new GraphAnalyzer();
    const analysis = await analyzer.analyze(graph);
    expect(analysis.hubs.length).toBeGreaterThan(0);

    // 5. Visualization Generation
    const visualizer = new HtmlVisualizer();
    const vizPath = await visualizer.generate(graph, analysis, outputDir);
    expect(fs.existsSync(vizPath)).toBe(true);

    // 6. Report Generation
    const reportGen = new MarkdownReportGenerator();
    const reportPath = await reportGen.generate(
      {
        documents,
        concepts,
        graph,
        analysis,
      },
      outputDir,
    );
    expect(fs.existsSync(reportPath)).toBe(true);
  });

  test('INT-002: Should handle large documentation set (500+ files)', async () => {
    // Performance test with large dataset
  }, 300000); // 5 minute timeout

  test('INT-003: Should maintain data consistency across phases', async () => {
    // Verify IDs, references, etc. remain consistent
  });

  test('INT-004: Should complete within memory limits', async () => {
    // Monitor memory usage throughout pipeline
  });
});
```

**Estimated Time:** 16 hours

---

#### Task 5.2: Performance Benchmark Suite

**New File:** `test/performance/benchmarks.test.js`

**Benchmarks:**

1. **Document Extraction Benchmarks**

   - 100 files: target <5s
   - 500 files: target <20s
   - 1000 files: target <40s

2. **Concept Extraction Benchmarks**

   - 100 docs: target <10s
   - 500 docs: target <45s
   - 1000 docs: target <90s

3. **Graph Building Benchmarks**

   - 100 nodes: target <2s
   - 500 nodes: target <8s
   - 1000 nodes: target <15s

4. **Analysis Benchmarks**

   - Centrality (100 nodes): target <1s
   - Centrality (500 nodes): target <5s
   - Hub detection: target <2s

5. **Memory Benchmarks**
   - Max heap usage per 100 docs: <100MB
   - Memory leak detection
   - Garbage collection effectiveness

**Configuration:**

```javascript
// jest.config.performance.js
export default {
  testEnvironment: 'node',
  testMatch: ['**/test/performance/**/*.test.js'],
  testTimeout: 300000, // 5 minutes
  maxWorkers: 1, // Sequential for accurate timing
  setupFilesAfterEnv: ['<rootDir>/test/setup/performance.setup.js'],
};
```

**Estimated Time:** 20 hours

---

### Week 6: Test Quality Enhancement

#### Task 6.1: Edge Case Coverage Expansion

**Add 50+ edge case tests across all components:**

1. **Data Edge Cases**

   - Empty strings
   - Null/undefined values
   - Very long strings (>10k chars)
   - Special characters (unicode, emojis)
   - Binary data
   - Circular references
   - Deep nesting (100+ levels)

2. **File System Edge Cases**

   - Missing files
   - Unreadable files
   - Symbolic links
   - Large files (>10MB)
   - Concurrent file access
   - Disk full scenarios

3. **Graph Edge Cases**

   - Self-loops
   - Multiple edges between same nodes
   - Disconnected components
   - Very dense graphs
   - Very sparse graphs
   - Maximum node limits

4. **Encoding Edge Cases**
   - UTF-8 with BOM
   - Latin-1 encoding
   - Mixed encodings
   - Malformed UTF-8

**Estimated Time:** 16 hours

---

#### Task 6.2: Test Maintainability Improvements

**Actions:**

1. **Create Test Helpers Library**

   ```javascript
   // test/helpers/graphHelpers.js
   export function createMockDocument(overrides = {}) {
     return {
       id: 'doc1',
       title: 'Test Document',
       content: 'Test content',
       ...overrides,
     };
   }

   export function createMockGraph(nodeCount, edgeRatio = 0.5) {
     // Generate graph with specified characteristics
   }

   export function assertGraphStructure(graph, expected) {
     // Common graph assertions
   }
   ```

2. **Standardize Test Naming**

   - Use consistent ID format: `COMP-TYPE-###`
   - Clear descriptions
   - Group related tests

3. **Improve Fixture Management**

   ```javascript
   // test/fixtures/index.js
   export const fixtures = {
     documents: {
       simple: () => loadFixture('documents/simple.json'),
       withFrontmatter: () => loadFixture('documents/frontmatter.json'),
       large: () => loadFixture('documents/large.json'),
     },
     graphs: {
       small: () => loadFixture('graphs/small.json'),
       complex: () => loadFixture('graphs/complex.json'),
     },
   };
   ```

4. **Add Test Documentation**
   - Document test strategy
   - Document fixture structure
   - Document test helpers
   - Add examples for common test patterns

**Estimated Time:** 12 hours

---

### Phase 2 Deliverables

- [ ] GraphBuilder: 50+ comprehensive tests
- [ ] GraphAnalyzer: 50+ comprehensive tests
- [ ] HTML Visualizer: 30+ tests
- [ ] Utility components: 18+ tests
- [ ] SidebarExtractor: 15+ tests
- [ ] Complete pipeline integration test
- [ ] Performance benchmark suite
- [ ] 50+ edge case tests
- [ ] Test maintainability improvements
- [ ] Coverage: >70% overall

**Total Estimated Time:** 146 hours (4 weeks with 2 developers)

---

## Phase 3: Excellence (Weeks 7-12)

### Goal: Achieve industry-leading test quality and automation

**Success Criteria:**

- ✅ 80%+ code coverage
- ✅ Mutation testing score >75%
- ✅ Automated test quality monitoring
- ✅ Performance regression detection
- ✅ Comprehensive test documentation

---

### Week 7-8: Advanced Testing Techniques

#### Task 7.1: Property-Based Testing

**Install Dependency:**

```bash
npm install --save-dev fast-check
```

**Implementation:**

```javascript
// test/property/graphProperties.test.js
import fc from 'fast-check';
import GraphBuilder from '../../src/builders/graphBuilder.js';

describe('GraphBuilder Property-Based Tests', () => {
  test('PROP-001: Adding and removing nodes should maintain graph consistency', () => {
    fc.assert(
      fc.property(fc.array(fc.string(), { minLength: 1, maxLength: 100 }), (nodeIds) => {
        const builder = new GraphBuilder();

        // Add nodes
        nodeIds.forEach((id) => builder.addNode(id, { type: 'document' }));

        // Graph should have all nodes
        expect(builder.graph.order).toBe(nodeIds.length);

        // Remove nodes
        nodeIds.forEach((id) => builder.removeNode(id));

        // Graph should be empty
        expect(builder.graph.order).toBe(0);
      }),
      { numRuns: 100 },
    );
  });

  test('PROP-002: Graph statistics should be consistent', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(fc.string(), fc.string()), { minLength: 0, maxLength: 50 }),
        (edges) => {
          const builder = new GraphBuilder();

          edges.forEach(([source, target]) => {
            builder.addNode(source, { type: 'doc' });
            builder.addNode(target, { type: 'doc' });
            builder.addEdge(source, target);
          });

          const stats = builder.getStats();

          // Number of edges should match
          expect(stats.totalEdges).toBe(edges.length);

          // Average degree = 2 * edges / nodes
          const expectedAvgDegree =
            builder.graph.order > 0 ? (2 * edges.length) / builder.graph.order : 0;
          expect(stats.averageDegree).toBeCloseTo(expectedAvgDegree, 2);
        },
      ),
      { numRuns: 100 },
    );
  });
});
```

**Additional Property Tests:**

- Concept extraction properties (frequency, co-occurrence)
- Centrality algorithm properties (symmetry, monotonicity)
- Serialization properties (roundtrip consistency)

**Estimated Time:** 24 hours

---

#### Task 7.2: Mutation Testing

**Install Dependency:**

```bash
npm install --save-dev stryker-cli @stryker-mutator/core @stryker-mutator/jest-runner
```

**Configuration:**

```javascript
// stryker.config.js
export default {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'jest',
  coverageAnalysis: 'perTest',
  jest: {
    projectType: 'custom',
    configFile: 'jest.config.js',
  },
  mutate: ['src/**/*.js', '!src/index.js', '!src/**/*.test.js'],
  thresholds: {
    high: 80,
    low: 60,
    break: 50,
  },
};
```

**Run Mutation Testing:**

```bash
npx stryker run
```

**Action Items:**

1. Run initial mutation testing
2. Identify weak test assertions
3. Improve test quality based on survivors
4. Achieve >75% mutation score

**Estimated Time:** 16 hours

---

#### Task 7.3: Visual Regression Testing

**For HTML Visualizations:**

```bash
npm install --save-dev puppeteer jest-image-snapshot
```

```javascript
// test/visual/visualization.test.js
import puppeteer from 'puppeteer';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

describe('Visualization Visual Regression', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
  });

  afterAll(async () => {
    await browser.close();
  });

  test('VIS-001: Graph visualization should match snapshot', async () => {
    await page.goto(`file://${visualizationPath}`);
    await page.waitForSelector('#cy'); // Cytoscape container

    const screenshot = await page.screenshot();
    expect(screenshot).toMatchImageSnapshot({
      failureThreshold: 0.01,
      failureThresholdType: 'percent',
    });
  });
});
```

**Estimated Time:** 12 hours

---

### Week 9-10: Test Automation and Monitoring

#### Task 8.1: Pre-commit Hooks

**Install Husky:**

```bash
npm install --save-dev husky lint-staged
npx husky install
```

**Configuration:**

```json
// package.json
{
  "lint-staged": {
    "src/**/*.js": ["npm run test:unit -- --findRelatedTests", "npm run lint"]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint-staged
```

**Estimated Time:** 4 hours

---

#### Task 8.2: Continuous Test Quality Monitoring

**Test Coverage Tracking:**

```yaml
# .github/workflows/coverage-report.yml
name: Coverage Report

on:
  push:
    branches: [master, documentation-graph]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Generate coverage
        run: npm run test:coverage
      - name: Comment PR with coverage
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          lcov-file: ./coverage/lcov.info
      - name: Coverage Badge
        uses: we-cli/coverage-badge-action@main
```

**Test Quality Dashboard:**

Create automated reports tracking:

- Test pass rate over time
- Coverage trends
- Test execution time
- Flaky test detection
- Mutation testing score

**Estimated Time:** 16 hours

---

#### Task 8.3: Performance Regression Detection

```javascript
// test/performance/regression-check.js
import { performance } from 'perf_hooks';
import fs from 'fs-extra';

const BASELINE_FILE = 'test/performance/baseline.json';

export async function checkPerformanceRegression(testName, testFn, threshold = 0.2) {
  const baseline = await loadBaseline();

  const start = performance.now();
  await testFn();
  const duration = performance.now() - start;

  const baselineDuration = baseline[testName];
  if (baselineDuration) {
    const increase = (duration - baselineDuration) / baselineDuration;

    if (increase > threshold) {
      throw new Error(
        `Performance regression detected: ${testName} ` +
          `increased by ${(increase * 100).toFixed(1)}% ` +
          `(${baselineDuration.toFixed(2)}ms → ${duration.toFixed(2)}ms)`,
      );
    }
  }

  // Update baseline
  baseline[testName] = duration;
  await saveBaseline(baseline);

  return duration;
}
```

**Estimated Time:** 12 hours

---

### Week 11: Documentation and Knowledge Transfer

#### Task 9.1: Test Documentation

**Create:**

1. **TEST_STRATEGY.md**

   - Testing philosophy
   - Test pyramid structure
   - When to write unit vs integration tests
   - TDD best practices

2. **TEST_HELPERS_GUIDE.md**

   - Available test helpers
   - Fixture management
   - Mock creation
   - Common test patterns

3. **CONTRIBUTING_TESTS.md**

   - How to run tests
   - How to write new tests
   - Test naming conventions
   - PR test requirements

4. **TEST_MAINTENANCE.md**
   - Keeping tests in sync with code
   - Updating fixtures
   - Handling flaky tests
   - Test refactoring guidelines

**Estimated Time:** 16 hours

---

#### Task 9.2: Test Examples and Templates

**Create:**

```javascript
// test/templates/unit-test-template.js
/**
 * Unit Test Template
 *
 * Use this template when creating new unit tests.
 * Replace COMPONENT_NAME with your component name.
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import ComponentName from '../../../src/path/to/ComponentName.js';

describe('ComponentName', () => {
  let instance;

  beforeEach(() => {
    // Setup: Create fresh instance for each test
    instance = new ComponentName();
  });

  describe('constructor', () => {
    test('CN-U-001: Should create instance with default config', () => {
      expect(instance).toBeDefined();
      expect(instance.config).toBeDefined();
    });

    test('CN-U-002: Should throw error for invalid config', () => {
      expect(() => {
        new ComponentName({ invalid: true });
      }).toThrow('Invalid configuration');
    });
  });

  describe('mainMethod()', () => {
    test('CN-U-003: Should process valid input', async () => {
      const input = {
        /* valid input */
      };
      const result = await instance.mainMethod(input);

      expect(result).toBeDefined();
      expect(result.status).toBe('success');
    });

    test('CN-U-004: Should handle null input gracefully', async () => {
      const result = await instance.mainMethod(null);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Invalid input');
    });

    test('CN-U-005: Should respect timeout limits', async () => {
      const slowInput = {
        /* input causing slow operation */
      };

      await expect(instance.mainMethod(slowInput, { timeout: 100 })).rejects.toThrow('Timeout');
    }, 200);
  });

  describe('Edge Cases', () => {
    test('CN-E-001: Should handle empty array', async () => {
      const result = await instance.mainMethod([]);
      expect(result).toEqual([]);
    });

    test('CN-E-002: Should handle large input (10k items)', async () => {
      const largeInput = Array.from({ length: 10000 }, (_, i) => ({ id: i }));

      const startTime = Date.now();
      const result = await instance.mainMethod(largeInput);
      const duration = Date.now() - startTime;

      expect(result.length).toBe(10000);
      expect(duration).toBeLessThan(5000); // <5s for 10k items
    });
  });
});
```

**Estimated Time:** 8 hours

---

### Week 12: Final Review and Optimization

#### Task 10.1: Test Suite Optimization

**Actions:**

1. **Identify Slow Tests**

   ```bash
   npm run test -- --verbose --detectOpenHandles
   ```

2. **Parallelize Where Possible**

   - Use test sharding for CI
   - Identify tests that can run in parallel
   - Optimize fixture loading

3. **Reduce Test Redundancy**

   - Identify duplicate test coverage
   - Consolidate similar tests
   - Remove obsolete tests

4. **Optimize Test Data**
   - Minimize fixture sizes
   - Use test data generators
   - Cache computed test data

**Estimated Time:** 16 hours

---

#### Task 10.2: Final Coverage Push

**Target Areas to Reach 80%+:**

1. Identify remaining uncovered lines
2. Add focused tests for uncovered paths
3. Remove dead code if uncoverable
4. Document why certain code is excluded from coverage

**Estimated Time:** 16 hours

---

#### Task 10.3: Test Quality Audit

**Review Checklist:**

- [ ] All tests passing
- [ ] 80%+ coverage achieved
- [ ] Mutation score >75%
- [ ] No flaky tests
- [ ] Performance benchmarks stable
- [ ] All components have tests
- [ ] Edge cases covered
- [ ] Error paths tested
- [ ] Integration tests complete
- [ ] Documentation complete
- [ ] CI/CD configured
- [ ] Pre-commit hooks working
- [ ] Test quality monitoring in place

**Estimated Time:** 8 hours

---

### Phase 3 Deliverables

- [ ] Property-based tests (20+ tests)
- [ ] Mutation testing score >75%
- [ ] Visual regression tests
- [ ] Pre-commit hooks configured
- [ ] Test quality monitoring dashboard
- [ ] Performance regression detection
- [ ] Comprehensive test documentation
- [ ] Test templates and examples
- [ ] Test suite optimization
- [ ] Coverage: >80% overall
- [ ] Test quality audit passed

**Total Estimated Time:** 148 hours (6 weeks with 2 developers)

---

## Summary Timeline

| Phase                      | Duration   | Key Deliverables                               | Estimated Hours |
| -------------------------- | ---------- | ---------------------------------------------- | --------------- |
| **Phase 1: Stabilization** | Weeks 1-2  | Fix failing tests, minimum coverage, CI        | 32              |
| **Phase 2: Enhancement**   | Weeks 3-6  | Comprehensive coverage, integration tests      | 146             |
| **Phase 3: Excellence**    | Weeks 7-12 | Advanced techniques, automation, 80%+ coverage | 148             |
| **Total**                  | 12 weeks   | Industry-leading test quality                  | 326             |

**Resource Requirements:**

- 2 developers @ 40 hours/week = 960 hours total capacity
- Planned work: 326 hours (34% allocation)
- Buffer for unexpected issues: 15%
- Leaves capacity for feature development

---

## Success Metrics

### Quantitative Metrics

| Metric              | Current | Phase 1 Target | Phase 2 Target | Phase 3 Target |
| ------------------- | ------- | -------------- | -------------- | -------------- |
| Test Pass Rate      | 78.3%   | 100%           | 100%           | 100%           |
| Code Coverage       | ~50%    | >50%           | >70%           | >80%           |
| Unit Tests          | ~650    | ~700           | ~900           | ~1000          |
| Integration Tests   | 2       | 5              | 10             | 15             |
| Failing Tests       | 198     | 0              | 0              | 0              |
| Test Execution Time | 2.3s    | <5s            | <10s           | <15s           |
| Mutation Score      | N/A     | N/A            | N/A            | >75%           |

### Qualitative Metrics

- **Test Maintainability:** Poor → Good → Excellent
- **Test Documentation:** Minimal → Comprehensive → Exemplary
- **Edge Case Coverage:** Moderate → High → Comprehensive
- **CI/CD Integration:** None → Basic → Advanced
- **Test Reliability:** Moderate → High → Excellent

---

## Risk Management

### Identified Risks

1. **Time Overruns**

   - **Mitigation:** Weekly progress reviews, prioritize critical tests
   - **Contingency:** Reduce Phase 3 scope if needed

2. **API Changes During Testing**

   - **Mitigation:** Coordinate with development team
   - **Contingency:** Update tests incrementally

3. **Performance Test Infrastructure**

   - **Mitigation:** Early setup and validation
   - **Contingency:** Simplify benchmarks if infrastructure limited

4. **Team Availability**
   - **Mitigation:** Cross-train team members
   - **Contingency:** Extend timeline if resources reduced

---

## Maintenance Plan

### Ongoing Activities

1. **Weekly:** Review new test failures, update CI status
2. **Bi-weekly:** Review coverage trends, identify gaps
3. **Monthly:** Run mutation testing, review test quality
4. **Quarterly:** Test suite optimization, documentation updates
5. **Annually:** Test strategy review, tool evaluation

### Test Quality Gates

**For All PRs:**

- All tests must pass
- Coverage must not decrease
- New code must have tests (>80% coverage)
- Integration tests for new features

**For Releases:**

- Full test suite passing
- Performance benchmarks met
- Mutation score maintained
- Security tests passing

---

## Conclusion

This comprehensive test improvement plan provides a structured approach to achieving industry-leading test quality for the documentation-graph codebase. By following this plan over 12 weeks, the team will:

1. Eliminate all failing tests (Phase 1)
2. Achieve comprehensive coverage (Phase 2)
3. Implement advanced testing practices (Phase 3)

The plan is ambitious but achievable with dedicated resources and commitment to test quality. The investment will pay dividends in:

- **Reduced bugs** in production
- **Faster development** with confident refactoring
- **Better code quality** through TDD practices
- **Lower maintenance costs** through early defect detection
- **Improved team confidence** in the codebase

Success requires leadership commitment, team discipline, and consistent execution. With these elements in place, the documentation-graph project can achieve testing excellence.

---

**Plan Owner:** Development Team Lead
**Review Date:** Weekly
**Next Major Review:** End of Phase 1 (Week 2)
**Plan Version:** 1.0
**Last Updated:** 2025-10-13
