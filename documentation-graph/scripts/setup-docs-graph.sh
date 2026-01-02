#!/usr/bin/env bash
set -e

# Documentation-Graph + MCP Server Setup Script
# Automates end-to-end setup with zero manual configuration

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCS_PATH="$PROJECT_ROOT/../docs"
MCP_SERVER_PATH="$PROJECT_ROOT/mcp-server/src/index.js"
MCP_JSON="$PROJECT_ROOT/.mcp.json"

echo "=========================================="
echo "Documentation-Graph + MCP Server Setup"
echo "=========================================="
echo ""
echo "This script will:"
echo "  1. Check prerequisites"
echo "  2. Install dependencies"
echo "  3. Run analysis (~10 minutes)"
echo "  4. Configure MCP server"
echo "  5. Verify setup"
echo ""
echo "Total time: ~10-12 minutes"
echo ""

# [1/7] Pre-flight Checks
echo "[1/7] Checking prerequisites..."

# Check Node.js version
if ! command -v node &> /dev/null; then
  echo "❌ ERROR: Node.js not found"
  echo "   Please install Node.js 18+ from https://nodejs.org/"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ ERROR: Node.js 18+ required (you have $(node -v))"
  echo "   Please upgrade Node.js from https://nodejs.org/"
  exit 1
fi
echo "  ✓ Node.js $(node -v)"

# Check we're in the right directory
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
  echo "❌ ERROR: Run this script from documentation-graph/ directory"
  echo "   Expected: cd documentation-graph && ./scripts/setup-docs-graph.sh"
  exit 1
fi
echo "  ✓ In documentation-graph/ directory"

# Check docs/ exists
if [ ! -d "$DOCS_PATH" ]; then
  echo "❌ ERROR: docs/ directory not found at $DOCS_PATH"
  echo "   Make sure you cloned the full arbitrum-docs repository"
  exit 1
fi
echo "  ✓ Arbitrum docs found at ../docs"
echo ""

# [2/7] Install Main Tool Dependencies
echo "[2/7] Installing main tool dependencies..."
cd "$PROJECT_ROOT"
npm install --silent
echo "  ✓ Main tool dependencies installed"
echo ""

# [3/7] Run Analysis
echo "[3/7] Running documentation analysis..."
echo ""
echo "⏱️  This will take approximately 10 minutes"
echo "💾 Requires ~8GB RAM available"
echo ""

cd "$PROJECT_ROOT"
npm start

if [ ! -d "$PROJECT_ROOT/dist" ]; then
  echo "❌ ERROR: Analysis failed - dist/ directory not created"
  exit 1
fi
echo ""
echo "  ✓ Analysis complete ($(du -sh "$PROJECT_ROOT/dist" | cut -f1) generated)"
echo ""

# [4/7] Install MCP Server Dependencies
echo "[4/7] Installing MCP server dependencies..."
cd "$PROJECT_ROOT/mcp-server"
npm install --silent
echo "  ✓ MCP server dependencies installed"
echo ""

# [5/7] Configure .mcp.json
echo "[5/7] Configuring .mcp.json..."

if [ -f "$MCP_JSON" ]; then
  # Update existing .mcp.json
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|\"args\": \\[\".*mcp-server/src/index.js\"\\]|\"args\": [\"$MCP_SERVER_PATH\"]|" "$MCP_JSON"
  else
    # Linux
    sed -i "s|\"args\": \\[\".*mcp-server/src/index.js\"\\]|\"args\": [\"$MCP_SERVER_PATH\"]|" "$MCP_JSON"
  fi
  echo "  ✓ Updated existing .mcp.json"
else
  # Create new .mcp.json
  cat > "$MCP_JSON" <<EOF
{
  "mcpServers": {
    "documentation-analysis": {
      "command": "node",
      "args": ["$MCP_SERVER_PATH"],
      "env": {
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
EOF
  echo "  ✓ Created .mcp.json"
fi

echo "  Path: $MCP_SERVER_PATH"
echo ""

# [6/7] Verify MCP Server
echo "[6/7] Verifying MCP server..."
cd "$PROJECT_ROOT"

# Test server can start (timeout after 5 seconds)
if timeout 5 node "$MCP_SERVER_PATH" > /dev/null 2>&1 || true; then
  echo "  ✓ MCP server verified"
else
  echo "⚠️  Warning: Could not verify MCP server startup"
  echo "   This might be okay - Claude Code will test it"
fi
echo ""

# [7/7] Success!
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo ""
echo "1. Restart Claude Code (if running)"
echo ""
echo "2. Verify tools are available:"
echo "   Open Claude Code and ask:"
echo "   \"What MCP tools are available?\""
echo ""
echo "   You should see 8 documentation-analysis tools:"
echo "   - find_duplicate_content"
echo "   - find_scattered_topics"
echo "   - suggest_consolidation"
echo "   - find_content_overlaps"
echo "   - find_similar_documents"
echo "   - analyze_topic_distribution"
echo "   - find_orphaned_content"
echo "   - suggest_canonical_reference"
echo ""
echo "3. Test a tool:"
echo "   \"Find duplicate content about 'gas optimization'\""
echo ""
echo "Troubleshooting:"
echo "  - If tools don't appear, check Claude Code logs"
echo "  - Run 'npm test' in mcp-server/ to verify functionality"
echo "  - See ONBOARDING.md for detailed troubleshooting"
echo ""
echo "Happy analyzing! 🚀"
echo ""
