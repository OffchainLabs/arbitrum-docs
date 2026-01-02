# Documentation-Graph + MCP Server Setup

Get the Arbitrum documentation analysis tool and its 8 AI-powered MCP tools working in Claude Code.

## What You Get

8 AI-powered documentation analysis tools for Claude Code:

- **find_duplicate_content** - Find exact and conceptual duplicates across documentation
- **find_scattered_topics** - Identify topics fragmented across multiple documents
- **suggest_consolidation** - Get recommendations for merging or reorganizing content
- **find_content_overlaps** - Detailed comparison of two documents
- **find_similar_documents** - Find documents similar to a given one
- **analyze_topic_distribution** - See how concepts are distributed across docs
- **find_orphaned_content** - Find isolated or disconnected documentation
- **suggest_canonical_reference** - Recommend the best authoritative reference for a topic

## Prerequisites

- **Node.js 18+** - Check with `node --version`
- **Claude Code** - Installed and working
- **8GB RAM available** - Needed for analysis generation
- **~15 minutes** - Most of it is unattended processing time

## Quick Start

### 1. Clone and Checkout

```bash
git clone https://github.com/OffchainLabs/arbitrum-docs.git
cd arbitrum-docs
git checkout documentation-graph
```

### 2. Run Setup Script

```bash
cd documentation-graph
./scripts/setup-docs-graph.sh
```

The script will automatically:

- ✓ Check Node.js 18+ requirement
- ✓ Install all dependencies
- ✓ Run analysis on Arbitrum documentation (~10 minutes)
- ✓ Configure MCP server for your machine
- ✓ Verify everything works

### 3. Restart Claude Code

If Claude Code is running, restart it to load the new MCP server.

### 4. Verify Setup

In Claude Code, ask:

```
What MCP tools are available?
```

You should see 8 `mcp__documentation-analysis__*` tools in the list.

### 5. Test a Tool

Try it out:

```
Find duplicate content about "gas optimization"
```

## What Happens During Setup

The setup script performs these steps:

1. **Pre-flight checks** (< 1 min)

   - Verifies Node.js 18+ is installed
   - Confirms you're in the right directory
   - Checks that Arbitrum docs exist at `../docs`

2. **Install main tool dependencies** (~2 min)

   - Runs `npm install` for the analysis tool

3. **Run analysis** (~10 min) ⏱️

   - Analyzes all Arbitrum documentation
   - Extracts concepts, builds knowledge graph
   - Generates 52MB of analysis data in `dist/`
   - **Note:** This requires 8GB RAM available

4. **Install MCP server dependencies** (~1 min)

   - Runs `npm install` for the MCP server wrapper

5. **Configure MCP** (< 1 min)

   - Auto-detects correct paths for your machine
   - Updates `.mcp.json` with your specific setup

6. **Verify MCP server** (< 1 min)

   - Tests that the server can start successfully

7. **Success!**
   - Displays next steps and verification instructions

## Troubleshooting

### Node.js Version Too Old

**Error:** `Node.js 18+ required`

**Solution:** Upgrade Node.js:

```bash
# Using nvm (recommended)
nvm install 18
nvm use 18

# Or download from https://nodejs.org/
```

### Out of Memory During Analysis

**Error:** Analysis crashes or system becomes unresponsive

**Solutions:**

- Close memory-intensive applications (browsers, IDEs, etc.)
- Ensure you have at least 8GB RAM free
- On macOS, check Activity Monitor
- On Linux, run `free -h` to check available memory

### MCP Tools Don't Appear in Claude Code

**Checks:**

1. **Verify .claude/settings.local.json exists:**

   ```bash
   cat .claude/settings.local.json
   ```

   Should contain `enableAllProjectMcpServers: true` and list of allowed tools

2. **Check .mcp.json was created:**

   ```bash
   cat .mcp.json
   ```

   Should have correct absolute path to `mcp-server/src/index.js`

3. **Restart Claude Code** completely (quit and relaunch)

4. **Check Claude Code logs** for MCP-related errors

### Analysis Takes Too Long

**Expected time:** ~10 minutes for full Arbitrum docs

If it's taking significantly longer:

- Check CPU usage (should be high during analysis)
- Check disk I/O (writing to dist/)
- Ensure no other heavy processes are running
- Consider running overnight if system is constrained

### dist/ Directory Not Created

**Error:** `Analysis failed - dist/ directory not created`

**Solutions:**

- Check you have write permissions in documentation-graph/
- Ensure there's enough disk space (~100MB free)
- Re-run the script - it will skip already completed steps
- Check for error messages earlier in the output

## Using the Tools

### Example Queries

Once set up, you can use the tools naturally in Claude Code:

**Find duplicates:**

```
Are there duplicate explanations of "retryable tickets" in the docs?
```

**Check fragmentation:**

```
Is the "Orbit deployment" topic scattered across multiple documents?
```

**Compare documents:**

```
What's the overlap between the Rollup and AnyTrust deployment guides?
```

**Get consolidation advice:**

```
Should these three gas optimization guides be merged?
[provide paths]
```

**Find similar docs:**

```
What documents are similar to docs/launch-orbit-chain/how-tos/orbit-sdk-deploying-anytrust-chain.md?
```

**Analyze distribution:**

```
How is the concept of "sequencer" distributed across the documentation?
```

**Find orphaned content:**

```
Are there any isolated documents that aren't well-connected to the main docs?
```

**Get canonical reference:**

```
What's the best canonical reference document for "gas fees"?
```

### Performance Notes

- **First query:** 5-20 seconds (cache miss, loading data)
- **Subsequent queries:** < 5 seconds (cache hit)
- **Slow queries:** Some analyses (like full graph traversal) may take longer

## Project Structure

```
arbitrum-docs/                         (repo root)
├── docs/                              (Arbitrum documentation source)
└── documentation-graph/               (this tool - on documentation-graph branch)
    ├── scripts/
    │   └── setup-docs-graph.sh       (setup script you just ran)
    ├── src/                           (analysis tool source code)
    ├── dist/                          (generated analysis - 52MB, gitignored)
    ├── mcp-server/                    (MCP server wrapper)
    │   ├── src/index.js              (MCP server entry point)
    │   └── README.md                 (detailed MCP server docs)
    ├── .mcp.json                      (MCP config - local, gitignored)
    ├── .claude/settings.local.json    (tool permissions - committed)
    ├── ONBOARDING.md                  (this file)
    └── README.md                      (main project docs)
```

## What's Committed vs. Local

**Committed to Git:**

- Setup scripts and documentation
- `.claude/settings.local.json` - Tool permissions
- All source code

**Local only (.gitignored):**

- `.mcp.json` - Contains your machine-specific absolute paths
- `dist/` - Generated analysis data (52MB)
- `node_modules/` - npm dependencies

## Advanced Usage

### Regenerate Analysis

If the Arbitrum docs change:

```bash
cd documentation-graph
npm start
```

The MCP server will auto-reload when dist/ files change (if auto-refresh is enabled).

### Enable Debug Logging

Edit `.mcp.json` and change:

```json
"env": {
  "LOG_LEVEL": "DEBUG"
}
```

Then restart Claude Code.

### Run Tests

```bash
cd documentation-graph/mcp-server
npm test
```

### Manual Configuration

If the setup script fails, see `.mcp.json.example` for the template and manually configure paths.

## Getting Help

- **MCP Server Documentation:** `mcp-server/README.md`
- **Main Tool README:** `README.md`
- **Architecture Details:** `ARCHITECTURE_SUMMARY.md`

## Contributing

This tool is part of the Arbitrum documentation project. For issues or improvements:

1. File issues on the arbitrum-docs repository
2. Include `[documentation-graph]` in the title
3. Provide logs and error messages when reporting bugs

---

**Questions?** Check the troubleshooting section above or the detailed MCP server docs in `mcp-server/README.md`.
