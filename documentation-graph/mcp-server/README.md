# Documentation Analysis MCP Server - End User Summary

## What It Does

A Model Context Protocol (MCP) server that helps you analyze and improve technical documentation by:

- **Finding duplicate content** - Detects exact copies and similar content across your docs
- **Identifying scattered topics** - Finds when information about a topic is fragmented across multiple documents
- **Suggesting consolidations** - Recommends how to merge or reorganize related documents
- **Comparing documents** - Shows detailed overlaps between any two documents

## Quick Setup

### Prerequisites

- Node.js 18.0.0 or higher
- Pre-generated analysis data in `../dist/` (run the documentation-graph tool first)

### Installation

```bash
cd documentation-graph/mcp-server
npm install
npm test  # Verify setup
```

### Connect to Claude Code CLI

Add to `~/.config/claude-code/config.json`:

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

## Available Tools

### Essential Tools

1. **`find_duplicate_content`** - Find duplicates for a topic

   - Example: `Use find_duplicate_content with topic "gas optimization"`
   - Returns: Duplicate pairs, similarity scores, consolidation recommendations

2. **`find_scattered_topics`** - Find topics spread across multiple documents

   - Example: `Use find_scattered_topics with concept "Orbit deployment" and depth "full"`
   - Returns: Fragmentation score, document distribution, navigation issues

3. **`suggest_consolidation`** - Get recommendations for merging documents

   - Example: `Use suggest_consolidation with doc_paths ["path1.md", "path2.md"]`
   - Returns: Strategy (MERGE/REORGANIZE/CANONICAL), confidence score, steps

4. **`find_content_overlaps`** - Compare two documents in detail
   - Example: `Use find_content_overlaps with doc_path_1 "concepts/gas.md" and doc_path_2 "how-tos/optimize-gas.md"`
   - Returns: Detailed segment-by-segment comparison

### Additional Tools

5. **`find_similar_documents`** - Find documents similar to a given one
6. **`analyze_topic_distribution`** - See how a concept is distributed across docs
7. **`find_orphaned_content`** - Find isolated or disconnected documents
8. **`suggest_canonical_reference`** - Recommend the best reference document for a topic

## Accessing Data (Resources)

The server provides lightweight data access to prevent context overflow:

### Recommended (Lightweight)

- `docs://documents` - Document summaries without full content (90% smaller)
- `docs://documents/list` - Simple list of paths and titles
- `docs://graph/summary` - Graph statistics
- `docs://analysis/summary` - High-level metrics

### Full Data (Use Sparingly)

- `docs://documents/full` - Complete documents with content (large responses)
- `docs://graph` - Full knowledge graph
- `docs://concepts` - All concepts with weights

All resources support pagination: `?limit=10&offset=0`

## Key Features

- **Fast Performance**: Sub-20 second responses with smart caching
- **Auto-Refresh**: Automatically reloads when analysis data changes
- **Smart Search**: Handles typos, abbreviations, and finds content even with different wording
- **Comprehensive Analysis**: Uses multiple algorithms (exact text, conceptual, semantic similarity)

## Common Use Cases

1. **Finding Duplicates**: "Find all duplicate content about gas optimization"
2. **Identifying Fragmentation**: "Is the Orbit deployment topic scattered across multiple docs?"
3. **Planning Consolidation**: "Should I merge these two deployment guides?"
4. **Comparing Documents**: "Show me the overlap between these two tutorials"

## Troubleshooting

### Tools Not Appearing

- Verify Node.js version: `node --version` (must be ≥18.0.0)
- Check Claude Code debug logs for errors
- Validate tool schemas: `node test-tool-schema.js`

### Server Won't Start

- Ensure analysis outputs exist in `../dist/`
- Run documentation-graph tool first: `cd .. && npm start`

### Slow Responses

- First query is slowest (cache miss), subsequent queries are faster
- Reduce similarity threshold to limit comparisons
- Use `depth: "basic"` for faster analysis

### "Concept not found" Errors

- Check for typos (matching is case-insensitive)
- Run `find_scattered_topics` without parameters to see all available concepts

## Performance Tips

- First query on a topic is slowest (5-20s), subsequent queries are fast (<5ms cache hits)
- Use metadata queries when full graph not needed
- Auto-refresh clears cache but preserves indexes
- Disable caching for debugging: set `CACHE_ENABLED=false` in config

## Getting Help

- Check the [Troubleshooting](#troubleshooting) section above
- Enable debug logging: `LOG_LEVEL=DEBUG npm start`
- Review cache statistics in logs after queries
- See main documentation-graph README for complete toolchain guide

---

**Ready to start?** Run `npm test` to verify setup, then ask Claude to use any of the tools above!
