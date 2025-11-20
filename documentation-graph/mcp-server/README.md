# Documentation Analysis MCP Server

A Model Context Protocol (MCP) server for interactive documentation analysis, specializing in content duplication detection and topic scattering analysis for the Arbitrum documentation.

## Overview

This MCP server provides AI-powered tools for technical writers to identify and resolve documentation quality issues:

- **Content Duplication Detection**: Find exact text duplication, conceptual overlap, and redundant coverage
- **Topic Scattering Analysis**: Identify topics fragmented across multiple documents
- **Consolidation Recommendations**: Get actionable suggestions for merging, reorganizing, or creating canonical references
- **Interactive Workflows**: Chain multiple queries together for comprehensive analysis

## Features

### Core Capabilities

1. **Multi-Dimensional Similarity Detection**

   - Exact text duplication using n-grams and Jaccard similarity
   - Conceptual overlap based on shared concepts from knowledge graph
   - Semantic similarity using TF-IDF weighted vectors
   - Comprehensive scoring combining all measures

2. **Topic Scattering Detection**

   - Fragmentation score calculation
   - Gini coefficient for distribution analysis
   - Cross-directory scattering detection
   - Navigation and discoverability issue identification

3. **Smart Consolidation**

   - Strategy recommendations (merge, reorganize, canonical reference)
   - Confidence scoring for each strategy
   - Step-by-step implementation guidance
   - Alternative approach suggestions

4. **Auto-Refresh**
   - Automatic data reload when analysis outputs change
   - File system watching with debouncing
   - Cache invalidation on refresh

### Performance

- **Response Time**: <20 seconds per query (optimized for ~100 documents)
- **Caching**: In-memory cache with 5-minute TTL
- **Indexing**: Pre-built indexes for fast lookups
- **Batch Processing**: Similarity calculations cached and reused

## Architecture

### Directory Structure

```
mcp-server/
├── src/
│   ├── index.js                  # Main MCP server
│   ├── core/
│   │   ├── DataLoader.js         # Load and index analysis outputs
│   │   ├── DataPreprocessor.js   # Generate optimized metadata
│   │   ├── SmartCache.js         # LRU cache with prefetching
│   │   ├── SimilarityEngine.js   # Duplication detection algorithms
│   │   ├── ScatteringAnalyzer.js # Topic scattering detection
│   │   ├── ConsolidationEngine.js # Consolidation recommendations
│   │   ├── CacheManager.js       # In-memory caching (enhanced)
│   │   ├── QueryParser.js        # Natural language query parsing
│   │   └── FileWatcher.js        # Auto-refresh on file changes
│   ├── tools/
│   │   └── ToolRegistry.js       # MCP tool definitions and handlers
│   ├── resources/
│   │   └── ResourceManager.js    # MCP resource definitions
│   └── utils/
│       └── logger.js             # Structured logging
├── test/
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   ├── performance/              # Performance benchmarks
│   ├── fixtures/                 # Test data
│   ├── mocks/                    # Mock implementations
│   └── helpers/                  # Test utilities
├── jest.config.js                # Main Jest configuration
├── jest.config.unit.js           # Unit test configuration
├── jest.config.integration.js    # Integration test configuration
├── jest.config.performance.js    # Performance test configuration
├── package.json
└── README.md
```

### Core Modules

#### DataPreprocessor

Generates optimized data formats for fast querying:

- **Metadata Generation**: Compressed summaries under 100KB
- **Inverted Indexing**: Concept ↔ Document bidirectional mapping
- **Similarity Matrices**: Sparse matrix generation for similarity calculations
- **File Chunking**: Splits large files into 500KB chunks
- **Statistics Generation**: Comprehensive preprocessing metrics

#### SmartCache

Intelligent caching system with predictive capabilities:

- **LRU Cache**: Size-limited (50MB) with TTL expiration
- **Pattern Detection**: Learns query patterns over time
- **Predictive Prefetching**: Preloads related data based on patterns
- **Query Planning**: Selects optimal data access strategy
- **Cache Warming**: Initializes from access logs on startup
- **Memory Management**: Automatic eviction when size limits reached

### Data Flow

```
1. documentation-graph tool runs analysis
   ↓
2. Generates JSON outputs in dist/
   ↓
3. MCP server loads and indexes data
   ↓
4. DataPreprocessor generates optimized metadata
   ↓
5. SmartCache initializes with warmup data
   ↓
6. File watcher monitors for changes
   ↓
7. Claude Code CLI calls MCP tools
   ↓
8. Query planner selects optimal strategy
   ↓
9. Tools execute with cached/chunked results
   ↓
10. Formatted output returned to Claude
```

## Data Access Strategy

The server implements a three-tier data access strategy optimized for Claude's consumption of large documentation graphs:

### Tier 1: Metadata Summary (<100KB)

Fast initial responses with compressed metadata containing:

- Node/edge type counts
- Top 100 concepts with frequencies
- Document index (path → metadata)
- Concept index (concept → document count)
- Inverted indexes for rapid lookups

### Tier 2: Cached Data (50MB LRU Cache)

Frequently accessed data with intelligent caching:

- **SmartCache**: LRU eviction with TTL (5 minutes default)
- **Predictive Prefetching**: Pattern-based data preloading
- **Query Planning**: Optimal strategy selection (METADATA_ONLY, CACHED, FULL_LOAD)
- **Request Deduplication**: Prevents duplicate concurrent requests
- **Performance Tracking**: Query execution time analysis

### Tier 3: Full Data Load

Complete graph data for comprehensive analysis:

- **Chunked Loading**: 500KB chunks for memory efficiency
- **Sparse Matrices**: Optimized similarity calculations
- **Progressive Enhancement**: Start with metadata, load details as needed

## Installation

### Prerequisites

- Node.js >= 18.0.0
- Completed documentation-graph analysis (dist/ directory with JSON outputs)

### Setup

1. Navigate to the mcp-server directory:

```shell
cd documentation-graph/mcp-server
```

2. Install dependencies:

```shell
npm install
```

3. Configure Claude Code CLI to use this MCP server (see Configuration section below)

## Configuration

### Claude Code CLI Configuration

Add to your Claude Code configuration file (`~/.config/claude-code/config.json` or workspace-specific):

```json
{
  "mcpServers": {
    "documentation-analysis": {
      "command": "node",
      "args": ["/absolute/path/to/documentation-graph/mcp-server/src/index.js"],
      "env": {
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

### Environment Variables

- `LOG_LEVEL`: Set logging level (`DEBUG`, `INFO`, `WARN`, `ERROR`). Default: `INFO`

### Server Configuration

Edit `src/index.js` to customize:

```javascript
this.config = {
  distPath: '../dist', // Path to analysis outputs
  docsPath: '../../docs', // Path to source documentation
  enableAutoRefresh: true, // Auto-reload on file changes
  cacheEnabled: true, // Enable in-memory caching
  cacheTTL: 300000, // Cache TTL in ms (5 minutes)
  performanceTarget: 20000, // Target response time in ms
};
```

## Available Tools

### Tier 1 Tools (Must Have)

#### 1. `find_duplicate_content`

Find exact and conceptual duplicates for a topic.

**Parameters:**

- `topic` (string, required): Topic or concept to search for duplicates
- `min_similarity` (number, optional): Minimum similarity threshold (0-1, default 0.7)
- `include_exact` (boolean, optional): Include exact text duplication analysis (default true)
- `include_conceptual` (boolean, optional): Include conceptual overlap analysis (default true)

**Example:**

```
Use find_duplicate_content with topic "gas optimization"
```

**Output:**

```json
{
  "found": true,
  "topic": "gas optimization",
  "totalDocuments": 15,
  "duplicatePairs": 8,
  "clusters": [
    {
      "documents": [...],
      "avgSimilarity": 0.85,
      "recommendation": "HIGH PRIORITY: Consider consolidating these 5 documents"
    }
  ],
  "topDuplicatePairs": [...]
}
```

#### 2. `find_scattered_topics`

Identify topics fragmented across multiple documents.

**Parameters:**

- `concept` (string, optional): Specific concept to analyze (omit to find all scattered topics)
- `depth` (enum, optional): Analysis depth - `basic`, `semantic`, `full` (default `semantic`)
- `min_fragmentation` (number, optional): Minimum fragmentation score (0-1, default 0.6)

**Example:**

```
Use find_scattered_topics with concept "Orbit deployment" and depth "full"
```

**Output:**

```json
{
  "found": true,
  "conceptName": "Orbit deployment",
  "isScattered": true,
  "fragmentationScore": 0.78,
  "metrics": {
    "totalDocuments": 12,
    "maxConcentration": "18.5%",
    "giniCoefficient": "0.234"
  },
  "documentMentions": [...],
  "directoryDistribution": [...],
  "navigationIssues": [...],
  "recommendation": [...]
}
```

#### 3. `suggest_consolidation`

Recommend consolidation strategy for a group of documents.

**Parameters:**

- `doc_paths` (array of strings, required): Document paths to analyze (minimum 2)
- `include_alternatives` (boolean, optional): Include alternative strategies (default true)

**Example:**

```
Use suggest_consolidation with doc_paths ["build-dapps/orbit/quickstart.md", "build-dapps/orbit/how-to-deploy.md"]
```

**Output:**

```json
{
  "documentCount": 2,
  "averageSimilarity": "0.825",
  "strategy": [
    {
      "strategy": "MERGE",
      "priority": "HIGH",
      "confidence": "0.825",
      "description": "Documents are highly similar (82.5%) - strong candidate for merging",
      "steps": [
        "Identify the best base document",
        "Merge unique content from other documents",
        "Update all internal links"
      ]
    }
  ]
}
```

#### 4. `find_content_overlaps`

Compare two documents in detail.

**Parameters:**

- `doc_path_1` (string, required): First document path
- `doc_path_2` (string, required): Second document path
- `detailed` (boolean, optional): Include detailed segment-by-segment comparison (default true)

**Example:**

```
Use find_content_overlaps with doc_path_1 "concepts/gas.md" and doc_path_2 "how-tos/optimize-gas.md"
```

### Tier 2 Tools (Nice to Have)

#### 5. `find_similar_documents`

Find documents similar to a given document.

**Parameters:**

- `doc_path` (string, required): Document path to find similar documents for
- `limit` (number, optional): Maximum results (1-50, default 10)
- `min_similarity` (number, optional): Minimum similarity threshold (0-1, default 0.6)

#### 6. `analyze_topic_distribution`

Show how a concept is distributed across documentation.

**Parameters:**

- `concept` (string, required): Concept name to analyze
- `include_recommendations` (boolean, optional): Include recommendations (default true)

#### 7. `find_orphaned_content`

Find isolated or disconnected documents.

**Parameters:**

- `include_partial_orphans` (boolean, optional): Include weakly connected documents (default false)
- `filter_directory` (string, optional): Filter to specific directory
- `filter_content_type` (string, optional): Filter to specific content type

#### 8. `suggest_canonical_reference`

Recommend the best canonical reference for a topic.

**Parameters:**

- `topic` (string, required): Topic or concept name
- `include_alternatives` (boolean, optional): Include alternative candidates (default true)

## Usage Examples

### Scenario A: Consolidation Exploration

**Writer:** "Show me all docs about Orbit deployment"

**Claude (using MCP):**

```javascript
// Uses find_duplicate_content or analyze_topic_distribution
{
  topic: "Orbit deployment",
  totalDocuments: 15,
  ...
}
```

**Writer:** "Which ones have overlapping content?"

**Claude (using MCP):**

```javascript
// Uses find_duplicate_content with the topic
{
  duplicatePairs: 5,
  topDuplicatePairs: [
    { doc1: "...", doc2: "...", overallSimilarity: 0.85 }
  ]
}
```

**Writer:** "Suggest how to consolidate them"

**Claude (using MCP):**

```javascript
// Uses suggest_consolidation with the duplicate paths
{
  strategy: "MERGE",
  steps: [...]
}
```

### Scenario B: Canonical Reference Selection

**Writer:** "Find all mentions of 'gas optimization'"

**Claude (using MCP):**

```javascript
// Uses analyze_topic_distribution
{
  concept: "gas optimization",
  distribution: {
    totalDocuments: 23
  }
}
```

**Writer:** "Are there duplicated explanations?"

**Claude (using MCP):**

```javascript
// Uses find_duplicate_content
{
  clusters: [{ documents: 8, avgSimilarity: 0.78 }];
}
```

**Writer:** "Which should be the canonical reference?"

**Claude (using MCP):**

```javascript
// Uses suggest_canonical_reference
{
  recommendation: {
    document: "concepts/gas-optimization.md",
    confidence: "0.892",
    reasoning: "High topic focus (45.2% of total weight); Comprehensive (1,250 words); Appropriate content type (concept)"
  }
}
```

## MCP Resources

The server exposes optimized analysis data as resources with pagination and summary views to prevent context overflow:

### Document Resources

- `docs://documents` - Document metadata **without content field** (default, lightweight)
  - Supports: `?limit=10&offset=0` for pagination (default limit: 10)
  - ~90% smaller than full documents - prevents context overflow
  - **Recommended for most queries**
- `docs://documents/full` - Complete documents with full content field
  - Supports: `?limit=10&offset=0` for pagination (default limit: 10)
  - ⚠️ **WARNING**: Large responses, use sparingly to avoid context overflow
  - Only use when you need actual document content

### Other Full Resources (with Pagination)

- `docs://graph` - Complete knowledge graph with nodes and edges
  - Supports: `?limit=10&offset=0` for pagination (default limit: 10)
- `docs://concepts` - Top concepts with TF-IDF weights
  - Supports: `?limit=10&offset=0` for pagination (default limit: 10)

### Summary Resources (Lightweight)
- `docs://documents/list` - Simple list of document paths and titles
  - Minimal data for quick document discovery
- `docs://graph/summary` - Graph statistics without full node/edge data
  - Node/edge counts, type distributions, density metrics
- `docs://analysis/summary` - High-level analysis metrics without full centrality data
  - Includes basic graph stats, top 10 hubs by each centrality metric, community summary
  - Prevents context overflow (replaces 1.2MB full analysis with ~5KB summary)

### Granular Resources (Specific Data)

- `docs://concepts/top` - Top 20 concepts by frequency
  - Pre-filtered most important concepts
- `docs://analysis/hubs` - Top hub documents by centrality metrics
  - Supports: `?limit=50` to control result count (default 50)
  - Supports: `?metric=degree|betweenness|closeness` to select centrality measure (default degree)
  - Returns nodes with scores, types, labels, and paths
- `docs://analysis/communities` - Community detection and clustering results
  - Community count, modularity score, and cluster information
- `docs://summary` - High-level analysis summary
  - Includes query hints for optimal usage

### Usage Examples

Access from Claude:

```
# Get document summaries (default, no content field - prevents context overflow)
Read the docs://documents resource
Read the docs://documents?limit=20&offset=0 resource  # Customize pagination

# Get full documents with content (use sparingly, large responses)
Read the docs://documents/full resource
Read the docs://documents/full?limit=5 resource  # Smaller batches recommended

# Get just document paths and titles (minimal data)
Read the docs://documents/list resource

# Get top concepts only
Read the docs://concepts/top resource

# Get graph statistics
Read the docs://graph/summary resource

# Get analysis summary (prevents 1.2MB overflow)
Read the docs://analysis/summary resource

# Get top 50 hub documents by degree centrality
Read the docs://analysis/hubs?limit=50&metric=degree resource

# Get top hubs by betweenness centrality
Read the docs://analysis/hubs?metric=betweenness resource

# Get community structure information
Read the docs://analysis/communities resource
```

### Performance Improvements

The optimized ResourceManager provides:
- **90% reduction** in response size - `docs://documents` now returns summaries by default (no content field)
- **Reduced default pagination** - Changed from 50 to 10 items per page to prevent context overflow
- **Explicit full content access** - Use `docs://documents/full` only when you need actual document text
- **Pagination** prevents loading entire datasets - use `?limit` and `?offset` parameters
- **Compact JSON** (no pretty printing) saves ~50% in formatting
- **Granular endpoints** for targeted queries
- **Query parameters** for flexible data access

## Algorithms

### Similarity Detection

#### Exact Text Similarity

- **Method**: N-gram (trigrams) + Jaccard similarity + Jaro-Winkler distance
- **Threshold**: 85% for duplication flag
- **Use Case**: Detect copy-pasted content

#### Conceptual Overlap

- **Method**: Weighted Jaccard on shared concepts from knowledge graph
- **Threshold**: 70% for duplication flag
- **Use Case**: Detect documents covering same topics differently

#### Semantic Similarity

- **Method**: TF-IDF vectors + cosine similarity
- **Threshold**: 75% for duplication flag
- **Use Case**: Detect similar meaning with different words

#### Comprehensive Score

- **Formula**: `exact × 0.4 + conceptual × 0.35 + semantic × 0.25`
- **Threshold**: 70% for overall duplication
- **Output**: Single similarity score with breakdown

### Topic Scattering Detection

#### Fragmentation Score

Composite metric combining:

1. **Document Count Score** (30%): More documents = higher fragmentation
2. **Concentration Score** (40%): Low max concentration = higher fragmentation
3. **Gini Score** (30%): Even distribution = higher fragmentation

**Formula:**

```javascript
fragmentationScore =
  min(docCount / 10, 1.0) * 0.3 + (1 - maxConcentration / 100) * 0.4 + (1 - giniCoefficient) * 0.3;
```

#### Gini Coefficient

Measures distribution inequality (0 = perfectly even, 1 = perfectly concentrated)

**Interpretation:**

- Gini < 0.3: Evenly distributed (scattered)
- Gini > 0.6: Concentrated in few documents

### Canonical Reference Selection

Scores candidates based on:

1. **Weight Score** (35%): Concept weight in document / total weight
2. **Centrality Score** (25%): Graph degree centrality
3. **Word Count Score** (15%): Document comprehensiveness
4. **Content Type Score** (20%): Preference for concept/tutorial over quickstart
5. **Navigation Score** (5%): Bonus if not orphaned

## Performance Optimization

### Caching Strategy

1. **Similarity Cache**: All pairwise similarities cached with 5-minute TTL
2. **Scattering Cache**: Concept scattering analysis cached
3. **Auto-Invalidation**: Cache cleared on data refresh

### Pre-Computation

1. **Indexes**: Built on startup for fast lookups

   - Documents by path
   - Documents by directory
   - Documents by content type
   - Concepts by name
   - Reverse index: concept → documents

2. **TF-IDF Model**: Pre-computed for all documents

### Data Preprocessing Pipeline

The DataPreprocessor runs during server initialization:

1. **Metadata Generation** (~2 seconds for 500 documents)

   - Compressed to <100KB for instant loading
   - Contains 80% of commonly needed information

2. **Index Building** (~1 second)

   - Inverted indexes for O(1) concept lookups
   - Sparse similarity matrices for fast comparisons

3. **Chunk Generation** (as needed)
   - Large files split into 500KB chunks
   - Loaded on-demand to reduce memory footprint

### Smart Caching Strategy

The SmartCache optimizes repeated queries:

1. **Pattern Learning**

   - Tracks last 100 queries for pattern detection
   - Threshold of 5 occurrences triggers pattern recognition

2. **Predictive Prefetching**

   - Automatically loads related data based on patterns
   - Maximum 10MB prefetch to prevent memory bloat

3. **Query Planning**
   - METADATA_ONLY: For simple lookups (<100ms)
   - CACHED: For frequently accessed data (<500ms)
   - FULL_LOAD: For comprehensive analysis (5-20s)

### Memory Management

- **Cache Size**: 50MB maximum with automatic LRU eviction
- **Chunk Size**: 500KB for streaming large files
- **TTL**: 5-minute expiration for stale data cleanup
- **Pattern History**: Last 100 queries tracked for learning

### Optimization Tips

- First query on a topic is slowest (cache miss)
- Subsequent queries on same topic are fast (cache hit)
- Auto-refresh clears cache but preserves indexes
- Disable caching for debugging: set `cacheEnabled: false`
- Use metadata queries when full graph not needed

## Troubleshooting

### Tools Not Appearing in Claude Code

**Symptom:** MCP server starts successfully but tools don't appear in Claude Code.

**Check Claude Code debug logs:**

```shell
grep "Failed to fetch tools" ~/.claude/debug/latest
```

**Common issue:** "Invalid literal value, expected 'object'" error means the tool schemas aren't properly formatted as JSON Schema.

**Solution:** This should be fixed in the current version (v2.0.0+). If you're still seeing this, verify you're running the latest code with proper Zod-to-JSON-Schema conversion.

**To verify tool schemas are valid:**

```shell
node test-tool-schema.js
```

This will validate that all 8 tools have proper JSON Schema format.

### Server Won't Start

**Check:**

1. Are analysis outputs present in `../dist/`?
2. Run the documentation-graph tool first: `cd .. && npm start`
3. Check Node version: `node --version` (must be >= 18.0.0)

### Slow Responses

**Solutions:**

1. Reduce similarity threshold to limit comparisons
2. Check cache hit rate in logs
3. Disable file watching if not needed: `enableAutoRefresh: false`
4. Use `depth: "basic"` for faster analysis

### "Concept not found" Errors

**Causes:**

1. Typo in concept name (case-insensitive matching)
2. Concept below frequency threshold
3. Analysis data outdated

**Solution:** Run `find_scattered_topics` without concept parameter to see all available concepts

### High Memory Usage

**Solutions:**

1. Reduce cache TTL: `cacheTTL: 60000` (1 minute)
2. Run periodic cache cleanup
3. Disable caching for very large documentation sets

## Development

### Running in Development

```shell
npm run dev
```

Uses `--watch` flag for auto-restart on code changes.

### Testing

The MCP server follows Test-Driven Development (TDD) practices with comprehensive test coverage.

#### Test Infrastructure

- **Framework**: Jest with ES modules support
- **Coverage Target**: 70% branches, 75% functions/lines/statements
- **Test Types**: Unit, Integration, and Performance tests
- **Execution Time**: <1 second for unit tests, optimized for rapid feedback

#### Running Tests

```shell
# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:performance   # Performance benchmarks

# Development mode
npm run test:watch         # Watch mode for TDD workflow
npm run test:coverage      # Generate coverage report
```

#### Test Organization

```
test/
├── unit/              # Unit tests for individual modules
│   └── core/          # Core module tests (DataPreprocessor, SmartCache, etc.)
├── integration/       # Integration tests for module interactions
├── performance/       # Performance benchmarks and load tests
├── fixtures/          # Test data organized by type
│   ├── concepts/      # Concept extraction test data
│   ├── documents/     # Document analysis test data
│   └── graphs/        # Knowledge graph test data
├── mocks/            # Mock implementations for external dependencies
├── helpers/          # Test utilities (fixture loaders, assertions)
└── setup/            # Jest configuration and global setup
```

#### Test Naming Convention

Tests follow a structured naming pattern for traceability:

- Format: `[MODULE]-[TYPE]-[NUMBER]: [Description]`
- Example: `DP-U-003: Should generate summary under 100KB`
- Types: U (Unit), I (Integration), P (Performance)

### Debugging

Set log level to DEBUG:

```shell
LOG_LEVEL=DEBUG npm start
```

View cache statistics in logs after queries.

### Adding New Tools

1. Add tool definition to `ToolRegistry.defineTools()`
2. Implement handler method in `ToolRegistry`
3. Add tests
4. Update documentation

### Test-Driven Development Workflow

The project follows RED-GREEN-REFACTOR cycle:

1. **RED Phase**: Write failing tests first

   ```shell
   # Create test file
   touch test/unit/core/NewModule.test.js

   # Run tests (should fail)
   npm run test:unit -- NewModule
   ```

2. **GREEN Phase**: Implement minimum code to pass

   ```shell
   # Implement module
   touch src/core/NewModule.js

   # Run tests until passing
   npm run test:watch -- NewModule
   ```

3. **REFACTOR Phase**: Optimize while maintaining green
   ```shell
   # Refactor with confidence
   npm run test:coverage
   ```

## Architecture Decisions

### Why MCP?

- **Interactive Workflows**: Chain multiple queries naturally through conversation
- **Claude Code Integration**: Native support in Claude Code CLI
- **Type Safety**: Zod schemas for input validation
- **Resource Access**: Direct access to analysis outputs

### Why In-Memory Cache?

- **Performance**: Sub-second responses for cached queries
- **Simplicity**: No external dependencies (Redis, etc.)
- **Single-User**: Technical Writing team, no concurrent access needed
- **Auto-Refresh**: Cache invalidation on data changes

### Why File Watching?

- **Developer Experience**: Automatic updates when re-running analysis
- **No Manual Refresh**: Just re-run `npm start` in documentation-graph
- **Debouncing**: Waits for all file changes to settle

## Future Enhancements

### Potential Features

1. **Graph Visualization**: Generate visual cluster diagrams
2. **Diff Generation**: Show exact text differences between documents
3. **Batch Operations**: Analyze entire directories at once
4. **Export Reports**: Generate markdown consolidation reports
5. **Link Analysis**: Suggest cross-links between related documents
6. **Quality Scores**: Overall documentation quality metrics
7. **Change Tracking**: Historical analysis over time

### Performance Improvements

1. **Persistent Cache**: Redis or file-based cache
2. **Incremental Updates**: Only re-analyze changed documents
3. **Parallel Processing**: Worker threads for similarity calculations
4. **Sparse Indexes**: Only index top N concepts per document

## Contributing

### Code Style

- ES modules (import/export)
- Async/await for asynchronous operations
- Destructured imports
- JSDoc comments for public APIs

### Testing Requirements

- Unit tests for core algorithms
- Integration tests for tool handlers
- Performance benchmarks for <20s target

## License

MIT

## Support

For issues or questions:

1. Check troubleshooting section
2. Review logs with `LOG_LEVEL=DEBUG`
3. Open issue in repository
