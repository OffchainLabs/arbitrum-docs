# Quick Start Guide

Get up and running with the Documentation Analysis MCP Server in 5 minutes.

## Prerequisites

- Node.js >= 18.0.0
- Claude Code CLI installed
- documentation-graph analysis completed

## Step 1: Run Documentation Analysis

First, ensure you have analysis outputs:

```shell
cd documentation-graph
npm install
npm start
```

This generates JSON files in `dist/` directory.

## Step 2: Install MCP Server

```shell
cd mcp-server
npm install
```

## Step 3: Configure Claude Code CLI

### For macOS/Linux:

1. Open or create `~/.config/claude-code/config.json`
2. Add the MCP server configuration:

```json
{
  "mcpServers": {
    "documentation-analysis": {
      "command": "node",
      "args": [
        "/Users/YOUR_USERNAME/dev/OCL/arbitrum-docs/documentation-graph/mcp-server/src/index.js"
      ],
      "env": {
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

**Important:** Replace `/Users/YOUR_USERNAME/...` with the absolute path to your mcp-server directory.

### For Windows:

1. Open or create `%USERPROFILE%\.config\claude-code\config.json`
2. Add the MCP server configuration:

```json
{
  "mcpServers": {
    "documentation-analysis": {
      "command": "node",
      "args": [
        "C:\\Users\\YOUR_USERNAME\\dev\\OCL\\arbitrum-docs\\documentation-graph\\mcp-server\\src\\index.js"
      ],
      "env": {
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

## Step 4: Start Claude Code CLI

Restart Claude Code CLI to load the new MCP server configuration.

## Step 5: Verify Installation

In Claude Code CLI, try:

```
List the available documentation analysis tools
```

You should see 8 tools listed:

- find_duplicate_content
- find_scattered_topics
- suggest_consolidation
- find_content_overlaps
- find_similar_documents
- analyze_topic_distribution
- find_orphaned_content
- suggest_canonical_reference

## Step 6: Try Your First Query

```
Find duplicate content for "gas optimization"
```

Claude will use the MCP server to analyze documentation and return results.

## Common First Queries

### Find All Scattered Topics

```
Find all topics that are scattered across the documentation
```

### Analyze Specific Topic

```
Is "Orbit deployment" scattered across multiple documents?
```

### Find Orphaned Documents

```
Find all orphaned content
```

### Compare Two Documents

```
Compare "build-dapps/orbit/quickstart.mdx" and "launch-orbit-chain/how-tos/orbit-quickstart.mdx"
```

## Troubleshooting

### "MCP server not found" Error

**Solution:** Check that:

1. Path in config.json is absolute (not relative)
2. Path points to `src/index.js` (not the mcp-server directory)
3. File exists: `ls /path/to/mcp-server/src/index.js`

### "Cannot find module" Error

**Solution:** Install dependencies:

```shell
cd mcp-server
npm install
```

### "No data found" Error

**Solution:** Run documentation-graph analysis:

```shell
cd ../
npm start
```

### Server Starts But No Results

**Solution:** Check logs:

1. Set `LOG_LEVEL: "DEBUG"` in config.json
2. Restart Claude Code CLI
3. Check terminal for MCP server logs

## What's Next?

- **Learn more**: Read [README.md](README.md) for full documentation
- **See examples**: Check [EXAMPLES.md](EXAMPLES.md) for usage scenarios
- **Understand architecture**: Review [ARCHITECTURE.md](ARCHITECTURE.md) for technical details

## Quick Reference

### Available Tools

| Tool                          | Purpose                          | Example                             |
| ----------------------------- | -------------------------------- | ----------------------------------- |
| `find_duplicate_content`      | Find exact/conceptual duplicates | "Find duplicates for 'gas'"         |
| `find_scattered_topics`       | Identify fragmented topics       | "Find scattered topics"             |
| `suggest_consolidation`       | Get merge recommendations        | "Suggest consolidation for [paths]" |
| `find_content_overlaps`       | Compare two documents            | "Compare doc A and doc B"           |
| `find_similar_documents`      | Find related documents           | "Find similar to quickstart.md"     |
| `analyze_topic_distribution`  | Show topic spread                | "Analyze 'Orbit' distribution"      |
| `find_orphaned_content`       | Find isolated documents          | "Find orphaned content"             |
| `suggest_canonical_reference` | Pick best canonical doc          | "Best canonical for 'gas'"          |

### Configuration Options

Edit `src/index.js` to customize:

```javascript
this.config = {
  distPath: '../dist', // Path to analysis outputs
  docsPath: '../../docs', // Path to documentation
  enableAutoRefresh: true, // Auto-reload on changes
  cacheEnabled: true, // Enable caching
  cacheTTL: 300000, // Cache TTL (5 minutes)
  performanceTarget: 20000, // Target response time (20s)
};
```

### Log Levels

- `DEBUG`: All messages (verbose)
- `INFO`: Informational messages (default)
- `WARN`: Warnings only
- `ERROR`: Errors only

## Tips for Effective Use

1. **Start broad**: Use `find_scattered_topics` to get overview
2. **Drill down**: Focus on high fragmentation scores
3. **Compare**: Use `find_content_overlaps` for specific docs
4. **Get recommendations**: Use `suggest_consolidation` for action plan
5. **Iterate**: Claude maintains context across queries

## Support

If you encounter issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Review logs with `LOG_LEVEL: "DEBUG"`
3. Verify analysis outputs exist: `ls ../dist/*.json`
4. Try restarting Claude Code CLI
5. Open an issue in the repository

## Success!

You're now ready to use the Documentation Analysis MCP Server to improve your documentation quality. Happy analyzing!
