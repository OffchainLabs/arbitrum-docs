# MCP Server Architecture Design

## Executive Summary

This document provides a comprehensive architecture design for a Model Context Protocol (MCP) server that enables interactive documentation analysis through AI-powered tools for detecting content duplication and topic scattering.

**Key Metrics:**

- Target response time: <20 seconds per query
- Scale: ~100 documentation files
- Users: Technical Writing team (single-user)
- Client: Claude Code CLI

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Claude Code CLI                         │
│                    (User Interface)                          │
└────────────────────────┬────────────────────────────────────┘
                         │ MCP Protocol (stdio)
                         │
┌────────────────────────▼────────────────────────────────────┐
│              MCP Server (index.js)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Request Handlers                                     │  │
│  │  - ListTools    - CallTool                           │  │
│  │  - ListResources - ReadResource                      │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
    │  Tools  │    │  Core   │    │Resources│
    │Registry │    │ Engines │    │ Manager │
    └────┬────┘    └────┬────┘    └────┬────┘
         │              │              │
         └──────────────┼──────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
    ┌────▼──────┐  ┌───▼────┐   ┌────▼─────┐
    │   Data    │  │ Cache  │   │   File   │
    │  Loader   │  │Manager │   │ Watcher  │
    └────┬──────┘  └────────┘   └──────────┘
         │
         │ Loads from
         │
    ┌────▼──────────────────────────────────┐
    │     dist/ (Analysis Outputs)          │
    │  - knowledge-graph.json               │
    │  - extracted-documents.json           │
    │  - extracted-concepts.json            │
    │  - graph-analysis.json                │
    └───────────────────────────────────────┘
```

### 1.2 Component Breakdown

#### Main Server (index.js)

- **Responsibility**: MCP protocol handling, lifecycle management
- **Key Features**:
  - Stdio transport for Claude Code CLI
  - Component initialization and coordination
  - Error handling and logging
  - Graceful shutdown

#### Core Engines

1. **DataLoader**

   - Loads JSON outputs from documentation-graph tool
   - Builds optimized indexes for fast querying
   - Provides lookup methods

2. **SimilarityEngine**

   - Implements 3 similarity algorithms (exact, conceptual, semantic)
   - Calculates comprehensive similarity scores
   - Finds duplicate clusters

3. **ScatteringAnalyzer**

   - Calculates fragmentation scores
   - Detects navigation issues
   - Identifies cross-directory scattering

4. **ConsolidationEngine**

   - Generates consolidation strategies
   - Selects canonical references
   - Identifies content gaps

5. **CacheManager**

   - In-memory LRU cache with TTL
   - Automatic expiration and cleanup
   - Cache statistics tracking

6. **QueryParser**

   - Natural language query parsing
   - Filter extraction and application
   - Concept fuzzy matching

7. **FileWatcher**
   - Monitors dist/ directory for changes
   - Debounced refresh triggering
   - Graceful restart on data updates

#### Tool Registry

- Defines all MCP tools (Tier 1 and Tier 2)
- Validates input with Zod schemas
- Routes tool calls to appropriate handlers
- Formats outputs for Claude consumption

#### Resource Manager

- Exposes analysis data as MCP resources
- Provides summary statistics
- Read-only access to graph, documents, concepts

## 2. Similarity Detection Algorithm

### 2.1 Three-Dimensional Similarity

#### Algorithm 1: Exact Text Similarity

**Purpose:** Detect copy-pasted or near-identical text

**Method:**

1. Normalize text (lowercase, remove punctuation, collapse whitespace)
2. Generate trigrams (3-character n-grams)
3. Calculate Jaccard similarity: `|intersection| / |union|`
4. Calculate Jaro-Winkler distance for shorter texts
5. Weighted combination: `jaccard × 0.7 + jaroWinkler × 0.3`

**Complexity:** O(n × m) where n, m are text lengths

**Threshold:** 0.85 (85% similarity) for duplication flag

**Example:**

```javascript
Text 1: "Arbitrum uses optimistic rollups"
Text 2: "Arbitrum utilizes optimistic rollups"

Trigrams 1: ["arb", "rbi", "bit", "itr", "tru", ...]
Trigrams 2: ["arb", "rbi", "bit", "itr", "tru", ...]

Jaccard: 0.87
Jaro-Winkler: 0.92
Final Score: 0.89 → DUPLICATE
```

#### Algorithm 2: Conceptual Overlap

**Purpose:** Detect documents covering same topics with different wording

**Method:**

1. Extract concepts from knowledge graph for each document
2. Build concept weight maps
3. Find shared concepts with weights
4. Calculate weighted Jaccard:
   ```
   overlapScore = sharedWeight / avgTotalWeight
   ```

**Complexity:** O(c1 + c2) where c1, c2 are concept counts

**Threshold:** 0.70 (70% overlap) for duplication flag

**Example:**

```javascript
Doc 1 concepts: {gas: 10, transaction: 8, fee: 5}
Doc 2 concepts: {gas: 12, transaction: 9, optimization: 7}

Shared: {gas: 11, transaction: 8.5}
Shared weight: 19.5
Avg total: (23 + 28) / 2 = 25.5
Overlap: 19.5 / 25.5 = 0.76 → DUPLICATE
```

#### Algorithm 3: Semantic Similarity

**Purpose:** Detect similar meaning with different vocabulary

**Method:**

1. Build TF-IDF model from all documents
2. Extract TF-IDF vectors for each document
3. Calculate cosine similarity:
   ```
   similarity = (vec1 · vec2) / (||vec1|| × ||vec2||)
   ```

**Complexity:** O(v) where v is vocabulary size

**Threshold:** 0.75 (75% similarity) for duplication flag

**Example:**

```javascript
Doc 1 TF-IDF: [0.2, 0.8, 0.1, 0.5, ...]
Doc 2 TF-IDF: [0.3, 0.7, 0.2, 0.6, ...]

Cosine similarity: 0.82 → DUPLICATE
```

### 2.2 Comprehensive Similarity Score

**Formula:**

```javascript
comprehensive = exact × 0.4 + conceptual × 0.35 + semantic × 0.25
```

**Rationale:**

- Exact text (40%): Most direct indicator of duplication
- Conceptual (35%): Captures topic overlap
- Semantic (25%): Catches similar meaning

**Threshold:** 0.70 overall for duplication flag

**Output Format:**

```javascript
{
  overallScore: 0.78,
  isDuplicate: true,
  exact: { score: 0.85, duplicatedSegments: [...] },
  conceptual: { score: 0.72, sharedConcepts: [...] },
  semantic: { score: 0.75 },
  recommendation: "DUPLICATE - Consider merging or creating canonical reference"
}
```

### 2.3 Cluster Detection

**Algorithm:** Connected Components

1. Build adjacency graph: edge exists if similarity > threshold
2. Use BFS to find connected components
3. Each component is a duplicate cluster

**Complexity:** O(n²) for pairwise comparisons, O(n + e) for clustering

**Optimization:** Only compare documents sharing concepts

## 3. Topic Scattering Detection Algorithm

### 3.1 Fragmentation Score

**Purpose:** Quantify how scattered a topic is across documentation

**Components:**

1. **Document Count Score** (30% weight)

   ```javascript
   docCountScore = min(documentCount / 10, 1.0);
   ```

   - More documents = higher fragmentation
   - Caps at 10 documents

2. **Concentration Score** (40% weight)

   ```javascript
   concentrationScore = 1 - maxConcentration / 100;
   ```

   - Low max concentration = no dominant document
   - Inverted: high concentration = low score

3. **Gini Score** (30% weight)
   ```javascript
   giniScore = 1 - giniCoefficient;
   ```
   - Low Gini = even distribution = scattered
   - Inverted: high Gini = low score

**Formula:**

```javascript
fragmentationScore =
  docCountScore × 0.3 +
  concentrationScore × 0.4 +
  giniScore × 0.3
```

**Threshold:** 0.6 for "scattered" classification

### 3.2 Gini Coefficient Calculation

**Purpose:** Measure distribution inequality

**Algorithm:**

1. Sort weights ascending
2. Calculate:
   ```javascript
   gini = Σ((2i - n - 1) × weight[i]) / (n × sum)
   ```

**Range:** 0 (perfectly even) to 1 (perfectly concentrated)

**Interpretation:**

- Gini < 0.3: Evenly distributed (scattered)
- Gini 0.3-0.6: Moderate concentration
- Gini > 0.6: Concentrated in few documents

### 3.3 Navigation Issue Detection

**Checks:**

1. **Orphaned Content**

   - Documents not in navigation structure
   - Severity: HIGH

2. **Scattered Navigation**

   - Content across >3 top-level categories
   - Severity: MEDIUM

3. **Mixed Content Types**
   - Same topic in >2 content types without clear hierarchy
   - Severity: LOW

**Output:**

```javascript
navigationIssues: [
  {
    type: "ORPHANED_CONTENT",
    severity: "HIGH",
    count: 3,
    description: "3 documents are orphaned (not in navigation)",
    documents: [...]
  }
]
```

## 4. Consolidation Strategy Selection

### 4.1 Strategy Decision Tree

```
avgSimilarity >= 0.8?
├─ YES → MERGE strategy
│         (High priority)
└─ NO
   │
   contentTypes.size === 1 && directories.size === 1?
   ├─ YES → CONSOLIDATE strategy
   │         (Medium priority)
   └─ NO
      │
      contentTypes.size > 1?
      ├─ YES → CANONICAL_WITH_CROSSLINKS
      │         (Medium priority)
      └─ NO
         │
         directories.size > 2?
         ├─ YES → CENTRALIZE
         │         (High priority)
         └─ NO → REORGANIZE
                  (Low priority)
```

### 4.2 Canonical Reference Selection

**Scoring Algorithm:**

```javascript
score =
  weightScore × 0.35 +        // Focus on this topic
  centralityScore × 0.25 +    // Well-connected
  wordCountScore × 0.15 +     // Comprehensive
  contentTypeScore × 0.20 +   // Appropriate type
  navigationScore × 0.05      // In navigation
```

**Component Calculations:**

1. **Weight Score**

   ```javascript
   weightScore = documentWeight / totalTopicWeight;
   ```

2. **Centrality Score**

   ```javascript
   centralityScore = graphDegree / 100; // Normalized
   ```

3. **Word Count Score**

   ```javascript
   wordCountScore = min(wordCount / 1000, 1.0);
   ```

4. **Content Type Score**

   ```javascript
   contentTypeScores = {
     'concept': 1.0,
     'gentle-introduction': 0.9,
     'tutorial': 0.8,
     'reference': 0.7,
     'how-to': 0.6,
     'quickstart': 0.4,
     'troubleshooting': 0.3,
   };
   ```

5. **Navigation Score**
   ```javascript
   navigationScore = isOrphaned ? 0 : 0.2;
   ```

**Output:** Top candidate + alternatives with confidence scores

## 5. Performance Optimization

### 5.1 Indexing Strategy

**Built on Startup:**

1. **documentsByPath**: Map<string, Document>

   - O(1) lookup by path or relativePath
   - Size: ~100 entries

2. **documentsByDirectory**: Map<string, Document[]>

   - O(1) lookup by directory
   - Size: ~10-20 directories

3. **documentsByContentType**: Map<string, Document[]>

   - O(1) lookup by content type
   - Size: ~7 content types

4. **conceptsByName**: Map<string, Concept>

   - O(1) lookup by concept name
   - Size: ~3000 concepts

5. **documentsByConcept**: Map<string, DocumentRef[]>
   - Reverse index for concept → documents
   - O(1) lookup for all docs mentioning concept
   - Size: ~3000 × ~10 = 30K entries

**Memory Usage:** ~10-20 MB for all indexes

**Build Time:** <500ms for 100 documents

### 5.2 Caching Strategy

**Cache Keys:**

```
exact:{doc1_path}:{doc2_path}
conceptual:{doc1_path}:{doc2_path}
semantic:{doc1_path}:{doc2_path}
scattering:{concept_name}
```

**Cache Policy:**

- **Type**: LRU (Least Recently Used)
- **TTL**: 5 minutes (300,000 ms)
- **Max Size**: Unlimited (memory-bound)
- **Invalidation**: On data refresh

**Cache Hit Rates (Expected):**

- First query on topic: 0% (cold start)
- Subsequent queries: 80-95%
- After refinement queries: 95%+

**Performance Gains:**

- Cached similarity: <1ms
- Uncached similarity: 100-500ms
- Speedup: 100-500x

### 5.3 Pre-Computation

**On Startup:**

1. Build all indexes (~500ms)
2. Initialize TF-IDF model (~1-2s for 100 docs)
3. Start file watcher (~100ms)

**On Demand:**

1. Similarity calculations (cached)
2. Scattering analysis (cached)
3. Cluster detection (uses cached similarities)

**Total Startup Time:** ~3 seconds

### 5.4 Query Optimization

**For find_duplicate_content:**

1. Filter to documents mentioning topic (index lookup: O(1))
2. Only compare within filtered set (reduces O(n²) to O(k²) where k << n)
3. Cache all pairwise similarities
4. Reuse for cluster detection

**Example:**

- All docs: 100
- Docs mentioning "gas": 15
- Comparisons: (100 choose 2) = 4,950 → (15 choose 2) = 105
- Speedup: 47x reduction

### 5.5 Performance Budget

**Target: <20 seconds per query**

**Breakdown (worst case, no cache):**

- Data loading: 0ms (already loaded)
- Index lookup: <10ms
- Similarity calculations: 100ms × 105 pairs = 10.5s
- Cluster detection: 500ms
- Result formatting: 100ms
- **Total:** ~11 seconds ✓

**With cache (subsequent queries):**

- All lookups: <100ms ✓

## 6. Auto-Refresh Mechanism

### 6.1 File Watching

**Library:** chokidar (cross-platform file watcher)

**Watched Files:**

- `dist/knowledge-graph.json`
- `dist/extracted-documents.json`
- `dist/extracted-concepts.json`
- `dist/graph-analysis.json`

**Events:**

- `change`: File modified
- `add`: File created (initial analysis)

**Debouncing:**

- Wait 2 seconds after last change
- Prevents multiple refreshes during batch writes

### 6.2 Refresh Process

**Triggered by:** File system change event

**Steps:**

1. Log refresh start
2. Reload all JSON files (`DataLoader.load()`)
3. Clear cache (`CacheManager.clear()`)
4. Rebuild indexes (automatic in DataLoader)
5. Update core engines with new data
6. Log refresh complete

**Downtime:** ~3 seconds (new data loading + index rebuild)

**Impact:** Queries during refresh use stale data

### 6.3 Notification to Claude

**Current:** No active notification (MCP limitation)

**Workaround:** Next query uses fresh data automatically

**Future:** MCP notifications feature (when available)

## 7. Output Formatting

### 7.1 Format A: Duplicate Clusters

**Use Case:** Show groups of similar documents

**Structure:**

```json
{
  "topic": "gas optimization",
  "totalDocuments": 15,
  "clusters": [
    {
      "documents": [
        {
          "path": "concepts/gas.md",
          "title": "Understanding Gas",
          "contentType": "concept",
          "wordCount": 850
        },
        ...
      ],
      "avgSimilarity": 0.85,
      "recommendation": "HIGH PRIORITY: Consider consolidating these 5 documents"
    }
  ]
}
```

**Benefits:**

- Clear grouping of related documents
- Similarity scores for prioritization
- Actionable recommendations

### 7.2 Format C: Topic-Centric View

**Use Case:** Show all documents covering a topic

**Structure:**

```json
{
  "concept": "gas optimization",
  "distribution": {
    "totalDocuments": 23,
    "maxConcentration": "18.5%"
  },
  "topDocuments": [
    {
      "path": "concepts/gas.md",
      "weight": 42.5,
      "percentage": "18.5%"
    },
    ...
  ],
  "byDirectory": [
    {
      "directory": "concepts",
      "documentCount": 8,
      "percentage": "45.2%"
    },
    ...
  ]
}
```

**Benefits:**

- Overview of topic coverage
- Weight distribution visibility
- Directory spread analysis

### 7.3 Token Efficiency

**Strategies:**

1. **Limit top results**: Top 10 concepts, top 20 documents
2. **Omit full content**: Only paths and metadata
3. **Nested structures**: Group related data
4. **Conditional details**: Include only if `detailed: true`

**Token Counts (estimated):**

- Duplicate cluster response: 2,000-5,000 tokens
- Topic distribution: 1,500-3,000 tokens
- Consolidation suggestion: 1,000-2,000 tokens

## 8. Tool Implementation Details

### 8.1 Input Validation

**Library:** Zod

**Example Schema:**

```javascript
z.object({
  topic: z.string().describe('Topic to search'),
  min_similarity: z.number().min(0).max(1).default(0.7).optional(),
  include_exact: z.boolean().default(true).optional(),
});
```

**Validation:**

- Type checking
- Range validation
- Required vs optional
- Default values
- Custom error messages

### 8.2 Error Handling

**Categories:**

1. **Input Errors**

   - Invalid parameters → 400-style error
   - Missing required fields → Validation error

2. **Data Errors**

   - Concept not found → Friendly error with suggestion
   - Document not found → Error with available documents

3. **System Errors**
   - File read failure → Retry with exponential backoff
   - Out of memory → Clear cache and retry

**Error Format:**

```json
{
  "error": "Concept not found",
  "topic": "gas optimisation",
  "suggestion": "Did you mean 'gas optimization'?"
}
```

### 8.3 Tool Response Format

**MCP Standard:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{...JSON result...}"
    }
  ]
}
```

**Claude Receives:** JSON string, parses and formats for user

## 9. Testing Strategy

### 9.1 Unit Tests

**Coverage:**

- SimilarityEngine algorithms
- ScatteringAnalyzer calculations
- ConsolidationEngine logic
- CacheManager operations

**Example:**

```javascript
test('calculateExactSimilarity', () => {
  const doc1 = { content: 'Arbitrum uses optimistic rollups' };
  const doc2 = { content: 'Arbitrum utilizes optimistic rollups' };
  const result = similarityEngine.calculateExactSimilarity(doc1, doc2);
  expect(result.score).toBeGreaterThan(0.85);
});
```

### 9.2 Integration Tests

**Scenarios:**

- Tool execution end-to-end
- Data loading and indexing
- File watching and refresh
- Cache invalidation

### 9.3 Performance Tests

**Benchmarks:**

- find_duplicate_content with 15 docs: <5s
- find_scattered_topics (all): <10s
- suggest_consolidation: <3s

**Memory:**

- Startup memory: <100 MB
- After 100 queries: <200 MB
- Memory leak detection

## 10. Deployment

### 10.1 Installation

**Requirements:**

- Node.js >= 18.0.0
- documentation-graph outputs in `dist/`

**Steps:**

```shell
cd mcp-server
npm install
```

### 10.2 Configuration

**Claude Code CLI config:**

```json
{
  "mcpServers": {
    "documentation-analysis": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/src/index.js"],
      "env": {
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

### 10.3 Monitoring

**Logs:**

- All logs to stderr (MCP requirement)
- Structured logging with timestamps
- Log levels: DEBUG, INFO, WARN, ERROR

**Metrics:**

- Query execution time
- Cache hit rate
- Memory usage
- Error frequency

**Example Log:**

```
[2025-10-03T12:34:56.789Z] [INFO] MCP Server initialized successfully
[2025-10-03T12:35:01.234Z] [DEBUG] Executing tool: find_duplicate_content
[2025-10-03T12:35:03.567Z] [INFO] Tool find_duplicate_content executed in 2333ms
```

## 11. Future Enhancements

### 11.1 Advanced Similarity

1. **Transformer Embeddings**

   - Use sentence-transformers for semantic embeddings
   - More accurate semantic similarity
   - Trade-off: Slower, requires model download

2. **Hierarchical Clustering**
   - Build dendrogram of document similarity
   - Visualize relationships
   - Suggest optimal cluster count

### 11.2 Intelligent Caching

1. **Persistent Cache**

   - Store cache to disk (SQLite or JSON)
   - Survive server restarts
   - Invalidation on source doc changes

2. **Predictive Pre-Computation**
   - Pre-compute likely queries
   - Background processing
   - Instant responses

### 11.3 Advanced Features

1. **Diff Generation**

   - Show exact text differences
   - Highlight unique content
   - Suggest merge conflicts

2. **Automated Consolidation**

   - Generate merged document
   - Preserve all unique content
   - Create redirect rules

3. **Quality Scores**
   - Overall documentation health
   - Coverage metrics
   - Trend analysis

## 12. Conclusion

This MCP server architecture provides a production-ready, performant solution for interactive documentation analysis. Key strengths:

- **Multi-dimensional similarity** captures different types of duplication
- **Fragmentation scoring** quantifies topic scattering
- **Smart caching** ensures <20s response times
- **Auto-refresh** provides seamless developer experience
- **Comprehensive tools** support interactive workflows

The architecture is optimized for the specific use case (Technical Writing team, ~100 docs) while remaining extensible for future enhancements.
