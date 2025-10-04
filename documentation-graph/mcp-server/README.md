# Documentation Analysis MCP Server v2.0.0

A production-ready Model Context Protocol (MCP) server for interactive documentation analysis, specializing in content duplication detection and topic scattering analysis for the Arbitrum documentation.

## What's New in v2.0.0 🚀

Following MCP 2025 specification and best practices:

- ✅ **Environment-based Configuration** - Configure via `.env` file, no code changes
- ✅ **Structured Error Handling** - MCP-compliant errors with codes and context
- ✅ **Enhanced Logging** - Request IDs, structured logs, performance metrics
- ✅ **Health Monitoring** - Track component status and system health
- ✅ **Tool Middleware** - Automatic validation, timeouts, circuit breakers
- ✅ **Security Enhancements** - Path validation, input sanitization, rate limiting
- ✅ **Performance Metrics** - Track tool execution, cache hits, error rates

**See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for upgrading from v1.0.0**

## Overview

This MCP server provides AI-powered tools for technical writers to identify and resolve documentation quality issues:

- **Content Duplication Detection**: Find exact text duplication, conceptual overlap, and redundant coverage
- **Topic Scattering Analysis**: Identify topics fragmented across multiple documents
- **Consolidation Recommendations**: Get actionable suggestions for merging, reorganizing, or creating canonical references
- **Interactive Workflows**: Chain multiple queries together for comprehensive analysis
- **Production-Ready**: Error handling, monitoring, security, and observability built-in

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
│   ├── index.js                 # Main MCP server (v2.0.0)
│   ├── config/
│   │   └── serverConfig.js      # Environment-based configuration
│   ├── core/
│   │   ├── DataLoader.js        # Load and index analysis outputs
│   │   ├── SimilarityEngine.js  # Duplication detection algorithms
│   │   ├── ScatteringAnalyzer.js # Topic scattering detection
│   │   ├── ConsolidationEngine.js # Consolidation recommendations
│   │   ├── CacheManager.js      # In-memory caching
│   │   ├── QueryParser.js       # Natural language query parsing
│   │   └── FileWatcher.js       # Auto-refresh on file changes
│   ├── middleware/
│   │   └── toolMiddleware.js    # Tool execution middleware
│   ├── tools/
│   │   └── ToolRegistry.js      # MCP tool definitions and handlers
│   ├── resources/
│   │   └── ResourceManager.js   # MCP resource definitions
│   └── utils/
│       ├── logger.js            # Enhanced structured logging
│       ├── errors.js            # MCP error classes
│       ├── healthCheck.js       # Health monitoring system
│       └── security.js          # Path validation & sanitization
├── .env.example                 # Environment configuration template
├── MIGRATION_GUIDE.md           # v1 → v2 migration guide
├── package.json
└── README.md
```

### Data Flow

```
1. documentation-graph tool runs analysis
   ↓
2. Generates JSON outputs in dist/
   ↓
3. MCP server loads and indexes data
   ↓
4. File watcher monitors for changes
   ↓
5. Claude Code CLI calls MCP tools
   ↓
6. Tools execute with cached results
   ↓
7. Formatted output returned to Claude
```

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

**v2.0.0 uses environment-based configuration. Copy `.env.example` to `.env` and customize:**

```bash
# Paths
DIST_PATH=/absolute/path/to/dist
DOCS_PATH=/absolute/path/to/docs

# Server Behavior
ENABLE_AUTO_REFRESH=true
ENABLE_CACHE=true

# Cache Settings
CACHE_TTL=300000                # 5 minutes
CACHE_CLEANUP_INTERVAL=60000    # 1 minute

# Performance
PERFORMANCE_TARGET=20000         # 20 seconds
TOOL_TIMEOUT=30000              # 30 seconds

# Logging
LOG_LEVEL=INFO                  # DEBUG, INFO, WARN, ERROR
ENABLE_STRUCTURED_LOGS=false
ENABLE_METRICS=true

# Health Monitoring
ENABLE_HEALTH_CHECK=true
HEALTH_CHECK_INTERVAL=30000     # 30 seconds

# Security
ENABLE_PATH_VALIDATION=true
ENABLE_INPUT_SANITIZATION=true

# Circuit Breaker
ENABLE_CIRCUIT_BREAKER=true
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=60000   # 1 minute

# Environment
NODE_ENV=production
```

**See `.env.example` for complete configuration options and examples.**

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

The server exposes analysis data as resources:

- `docs://graph` - Complete knowledge graph
- `docs://documents` - All extracted documents
- `docs://concepts` - Top concepts with weights
- `docs://analysis` - Graph analysis metrics
- `docs://summary` - High-level summary

Access from Claude:

```
Read the docs://summary resource
```

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

### Optimization Tips

- First query on a topic is slowest (cache miss)
- Subsequent queries on same topic are fast (cache hit)
- Auto-refresh clears cache but preserves indexes
- Disable caching for debugging: set `ENABLE_CACHE=false`

## Monitoring and Observability (v2.0.0)

### Performance Metrics

Track server performance automatically:

```bash
# Enable metrics tracking
ENABLE_METRICS=true node src/index.js
```

**Metrics tracked:**

- Tool execution count and average time
- Cache hit/miss rates
- Error counts by type
- Total requests and average response time

**View metrics:**

```bash
# Metrics printed on shutdown (Ctrl+C)
# Or enable DEBUG logging to see periodic metrics

LOG_LEVEL=DEBUG ENABLE_METRICS=true node src/index.js
```

**Example output:**

```
=== Performance Metrics ===
Total requests: 25
Average execution time: 1,250ms

Cache performance:
  Hits: 20
  Misses: 5
  Hit rate: 80.00%

Tool execution stats:
  find_duplicate_content: 10 calls, 1,200ms avg, 100.0% success
  find_scattered_topics: 8 calls, 1,100ms avg, 100.0% success
  suggest_consolidation: 7 calls, 1,500ms avg, 100.0% success

Error summary:
  TIMEOUT: 1
===========================
```

### Health Monitoring

Monitor component health automatically:

```bash
# Enable health checks (runs every 30s)
ENABLE_HEALTH_CHECK=true node src/index.js
```

**Components monitored:**

- Data loader (documents/concepts loaded)
- Cache (hit rate, size)
- Memory usage (heap, RSS)
- Similarity engine
- Scattering analyzer
- Tool registry
- File watcher (if enabled)

**Health statuses:**

- `healthy` - Component operating normally
- `degraded` - Component working but performance issues
- `unhealthy` - Component not functioning
- `unknown` - Component not checked yet

**View health status:**

```bash
# Health checks logged periodically
# Warnings logged if any component is degraded/unhealthy
```

### Error Handling and Codes

All errors include structured information:

```javascript
{
  "name": "DocumentNotFoundError",
  "message": "Document not found: invalid/path.md",
  "code": "DOCUMENT_NOT_FOUND",
  "details": {
    "docPath": "invalid/path.md",
    "suggestion": "Check the path is correct"
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Common error codes:**

- `TOOL_NOT_FOUND` - Invalid tool name
- `RESOURCE_NOT_FOUND` - Invalid resource URI
- `DOCUMENT_NOT_FOUND` - Document path not in dataset
- `CONCEPT_NOT_FOUND` - Concept not in analysis
- `VALIDATION_ERROR` - Invalid input parameters
- `TIMEOUT` - Operation exceeded timeout
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `CIRCUIT_BREAKER_OPEN` - Circuit breaker triggered
- `SERVER_NOT_INITIALIZED` - Server startup incomplete

### Structured Logging

**Request ID tracking:**
Every request gets a unique ID for tracing:

```
[2025-01-15T10:30:00.000Z] [INFO] {"requestId":"abc-123"} Tool call received
[2025-01-15T10:30:01.250Z] [INFO] {"requestId":"abc-123"} Tool execution complete
```

**Structured logs (production):**

```bash
# Enable JSON logs
ENABLE_STRUCTURED_LOGS=true NODE_ENV=production node src/index.js
```

Output:

```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "level": "INFO",
  "message": "Tool call received",
  "requestId": "abc-123",
  "toolName": "find_duplicate_content"
}
```

**Human-readable logs (development):**

```bash
# Disable structured logs
ENABLE_STRUCTURED_LOGS=false LOG_LEVEL=DEBUG node src/index.js
```

Output:

```
[2025-01-15T10:30:00.000Z] [DEBUG] {"requestId":"abc-123"} Tool call received {"toolName":"find_duplicate_content","hasArgs":true}
```

### Security Features

**Path Validation:**

- Prevents directory traversal attacks (`../../../etc/passwd`)
- Validates all path inputs (doc_path, doc_paths, filter_directory)
- Ensures paths are within allowed directories

**Input Sanitization:**

- Removes dangerous characters (`<`, `>`, `&`, `'`, `"`)
- Prevents XSS and injection attacks
- Sanitizes all string inputs automatically

**Rate Limiting (optional):**

```bash
ENABLE_RATE_LIMIT=true
RATE_LIMIT_WINDOW=60000  # 1 minute
RATE_LIMIT_MAX=60        # 60 requests per minute
```

**Circuit Breaker:**
Prevents cascading failures:

- Opens after 5 consecutive failures (configurable)
- Blocks requests for 60 seconds (configurable)
- Automatically resets on success

```bash
ENABLE_CIRCUIT_BREAKER=true
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=60000
```

## Troubleshooting

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

```shell
npm test
```

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
