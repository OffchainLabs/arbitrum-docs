# Test Suite Documentation

Comprehensive test suite for MCP Documentation Analysis v2.0.0 improvements.

## Overview

This test suite validates the three major enhancements to the MCP documentation-analysis server:

1. **Fuzzy/Partial Matching** - FuzzyMatcher with Jaccard similarity and Levenshtein distance
2. **Multi-Word Phrase Extraction** - PhraseExtractor with NLP-based extraction
3. **Full-Text Search Fallback** - FullTextSearchEngine with BM25 ranking

## Test Structure

```
__tests__/
├── README.md                           # This file
├── fixtures/
│   └── test-documents.js               # Sample Arbitrum documentation
├── performance/
│   └── search-performance.test.js      # Performance benchmarks
└── [component tests in source dirs]

mcp-server/src/search/__tests__/
├── FuzzyMatcher.test.js                # Fuzzy matching unit tests
└── FullTextSearch.test.js              # Full-text search unit tests

mcp-server/src/core/__tests__/
└── QueryParser.test.js                 # Layered search integration tests

src/extractors/__tests__/
├── phraseExtractor.test.js             # Phrase extraction unit tests
└── conceptExtractor.integration.test.js # ConceptExtractor integration tests
```

## Running Tests

### All Tests

```bash
npm test
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

### Specific Test Suites

**Unit Tests:**

```bash
npm run test:unit
```

**Integration Tests:**

```bash
npm run test:integration
```

**Performance Benchmarks:**

```bash
npm run test:performance
```

**Individual Components:**

```bash
npm run test:fuzzy        # FuzzyMatcher tests
npm run test:phrase       # PhraseExtractor tests
npm run test:fulltext     # FullTextSearch tests
npm run test:query        # QueryParser tests
npm run test:concept      # ConceptExtractor integration tests
```

## Test Coverage

Target: Minimum 80% code coverage across all modules

### Coverage by Module

| Module           | Lines | Functions | Branches | Coverage Target |
| ---------------- | ----- | --------- | -------- | --------------- |
| FuzzyMatcher     | 80%+  | 80%+      | 80%+     | ✅              |
| PhraseExtractor  | 80%+  | 80%+      | 80%+     | ✅              |
| FullTextSearch   | 80%+  | 80%+      | 80%+     | ✅              |
| QueryParser      | 80%+  | 80%+      | 80%+     | ✅              |
| ConceptExtractor | 80%+  | 80%+      | 80%+     | ✅              |

## Test Categories

### 1. FuzzyMatcher Tests (`FuzzyMatcher.test.js`)

**Test Categories:**

- Exact matching (case-insensitive)
- Jaccard similarity calculations
- Levenshtein distance fallback
- Abbreviation expansion (ARB → arbitrum)
- Substring matching
- Edge cases (empty strings, special characters)
- Threshold tuning (0.5, 0.7, 0.9)
- Result limiting
- Performance and caching
- Length pre-filtering
- Term normalization
- Match explanations

**Key Test Cases:**

- `should match typos using Jaccard similarity` - "arbitrom" → "arbitrum"
- `should expand ARB to arbitrum` - Abbreviation expansion
- `should cache results` - Performance validation
- `should use Levenshtein for very short strings` - < 5 characters

**Performance Targets:**

- Exact match: < 10ms (P50)
- Fuzzy match: < 200ms (P50), < 1s (P99)
- Cache hit: < 5ms

### 2. PhraseExtractor Tests (`phraseExtractor.test.js`)

**Test Categories:**

- Noun phrase extraction (NLP patterns)
- Technical compound extraction (Title Case, hyphenated)
- Domain phrase extraction (configured phrases)
- Phrase filtering by length (2-4 words)
- Phrase recording and frequency tracking
- Top phrases retrieval
- Phrase normalization
- Component index building
- Statistics tracking
- Edge cases

**Key Test Cases:**

- `should extract adjective + noun + noun patterns` - "optimistic rollup design"
- `should extract Title Case compounds` - "Arbitrum Nova"
- `should normalize hyphenated to space-separated` - "cross-chain" → "cross chain"
- `should filter by minimum frequency` - Frequency ≥ 2

**Performance Targets:**

- Per-document extraction: < 100ms
- Index size: ~5-10MB for 300 phrases

### 3. FullTextSearch Tests (`FullTextSearch.test.js`)

**Test Categories:**

- Index building
- Simple search with BM25 ranking
- Phrase search (quoted strings)
- Boolean search (AND/OR/NOT)
- Snippet generation with highlighting
- Caching
- Edge cases
- Search options
- Result format
- Field boosting
- Error handling

**Key Test Cases:**

- `should rank results by relevance` - BM25 scoring validation
- `should find exact phrase matches` - Consecutive word matching
- `should handle AND operator` - Boolean query validation
- `should highlight matched terms` - Snippet generation with `<mark>` tags

**Performance Targets:**

- Simple search: < 500ms (P50), < 2s (P99)
- Index size: ~10-20MB
- Memory: < 20MB runtime

### 4. QueryParser Tests (`QueryParser.test.js`)

**Test Categories:**

- Initialization with fuzzy matcher and full-text search
- Layer 1: Exact match (case-insensitive)
- Layer 2: Fuzzy match (typos, abbreviations)
- Layer 3: Partial match (substring)
- Layer 4: Full-text search fallback
- findConceptWithFallbacks detailed results
- Natural language query parsing
- Document filtering
- Document search
- Edge cases
- Layered search priority
- Confidence scoring
- Configuration options

**Key Test Cases:**

- `should prefer exact match over fuzzy` - Layer priority validation
- `should track all search attempts` - Detailed match information
- `should parse concept from "about" queries` - NL parsing
- `should use full-text search when all layers fail` - Fallback validation

**Performance Targets:**

- Exact match: < 10ms
- Fuzzy match: < 200ms
- Full-text fallback: < 2.5s

### 5. ConceptExtractor Integration Tests (`conceptExtractor.integration.test.js`)

**Test Categories:**

- Phrase extractor integration
- Domain phrase extraction
- Concept and phrase deduplication
- Top 500 concepts limit enforcement
- Phrase recording and tracking
- NLP phrase pattern extraction
- Technical compound extraction
- Frequency filtering
- Multi-document processing
- Edge cases
- Phrase component metadata

**Key Test Cases:**

- `should extract both single-word concepts and multi-word phrases` - Integration validation
- `should merge phrases with single-word concepts` - Deduplication
- `should enforce top 500 limit` - Limit validation
- `should aggregate phrases across documents` - Multi-document processing

**Performance Targets:**

- Phrase extraction integrated with concept extraction
- No significant performance degradation

## Test Fixtures

### Sample Documents (`fixtures/test-documents.js`)

**10 Realistic Arbitrum Documentation Files:**

1. `arbitrum-overview.md` - Layer 2 scaling, optimistic rollups
2. `gas-optimization.md` - Gas optimization techniques
3. `optimistic-rollups.md` - Fraud proofs, state transition
4. `cross-chain-messaging.md` - Retryable tickets, outbox messages
5. `nitro-stack.md` - WASM execution, architecture
6. `fraud-proofs.md` - Proof generation, dispute resolution
7. `arbitrum-nova.md` - AnyTrust protocol, data availability
8. `sequencer-decentralization.md` - Decentralization roadmap
9. `evm-compatibility.md` - Smart contract support
10. `delayed-inbox.md` - Censorship resistance

**Sample Concepts:**

- Single-word: `arbitrum`, `ethereum`, `sequencer`, `bridge`
- Phrases: `gas optimization`, `layer 2`, `optimistic rollup`, `fraud proof`

**Sample Queries:**

- Exact: `arbitrum`, `gas optimization`, `ethereum`
- Fuzzy: `arbitrom`, `ehtereum`, `optimistc`, `ARB`, `ETH`
- Partial: `opt`, `rollup`, `proof`
- Full-text: `layer 2 scaling`, `transaction validation`

## Performance Benchmarks

### Target Latencies

| Operation        | P50     | P99    | Target Met |
| ---------------- | ------- | ------ | ---------- |
| Exact match      | < 10ms  | < 50ms | ✅         |
| Fuzzy match      | < 200ms | < 1s   | ✅         |
| Full-text search | < 500ms | < 2s   | ✅         |
| Cache hit        | < 5ms   | < 10ms | ✅         |

### Memory Targets

| Component           | Target      | Actual |
| ------------------- | ----------- | ------ |
| Fuzzy matcher cache | < 5MB       | ✅     |
| Phrase index        | < 10MB      | ✅     |
| Full-text index     | < 20MB      | ✅     |
| **Total overhead**  | **< 105MB** | **✅** |

### Throughput Targets

| Operation             | Target | Actual |
| --------------------- | ------ | ------ |
| Fuzzy queries/sec     | > 100  | ✅     |
| Full-text queries/sec | > 50   | ✅     |

## Success Criteria

### Test Metrics

- ✅ All tests pass
- ✅ Code coverage ≥ 80%
- ✅ Performance benchmarks meet targets
- ✅ No memory leaks detected

### Feature Validation

- ✅ Fuzzy matching handles typos (1-2 edits)
- ✅ Abbreviation expansion works (ARB → arbitrum)
- ✅ Phrase extraction finds 2-4 word phrases
- ✅ Frequency filtering keeps phrases with ≥ 2 occurrences
- ✅ Full-text search provides BM25 ranking
- ✅ Snippet generation includes highlighting
- ✅ Layered search tries all 4 layers
- ✅ ConceptExtractor merges concepts and phrases

## Continuous Integration

### Pre-Commit Checks

```bash
npm run test:unit && npm run test:integration
```

### CI Pipeline

```bash
npm test && npm run test:coverage
```

### Coverage Reporting

Coverage reports are generated in `coverage/` directory:

- `coverage/lcov-report/index.html` - Interactive HTML report
- `coverage/coverage-summary.json` - JSON summary

## Debugging Tests

### Run Specific Test

```bash
npm test -- FuzzyMatcher.test.js
```

### Run Specific Test Case

```bash
npm test -- -t "should match typos using Jaccard similarity"
```

### Enable Verbose Output

```bash
npm test -- --verbose
```

### Debug with Node Inspector

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Common Issues

### Issue: "Cannot find module"

**Solution:** Ensure `"type": "module"` is in `package.json` and use `NODE_OPTIONS=--experimental-vm-modules`

### Issue: Tests timeout

**Solution:** Increase timeout in `jest.config.js` or specific test:

```javascript
it('long running test', async () => {
  // test code
}, 60000); // 60 second timeout
```

### Issue: Memory errors during performance tests

**Solution:** Run performance tests separately:

```bash
npm run test:performance
```

## Contributing

When adding new tests:

1. **Follow naming conventions:** `[Component].test.js` or `[Component].integration.test.js`
2. **Use descriptive test names:** "should [expected behavior] when [condition]"
3. **Group related tests:** Use `describe` blocks
4. **Add test fixtures:** Add reusable test data to `fixtures/`
5. **Document performance expectations:** Add performance targets to test descriptions
6. **Update this README:** Document new test categories

## References

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Implementation Summary](/Users/allup/OCL/documentation-graph/IMPLEMENTATION_SUMMARY.md)
- [Feature Requirements](/Users/allup/OCL/documentation-graph/FEATURE_REQUIREMENTS.md)
- [Technical Architecture](/Users/allup/OCL/documentation-graph/TECHNICAL_ARCHITECTURE.md)
