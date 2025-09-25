#!/bin/bash

# CLI Usage Examples for Enhanced Documentation Graph Builder
# This script demonstrates various ways to use the new CLI features

echo "========================================"
echo "Documentation Graph CLI Usage Examples"
echo "========================================"
echo ""

# Change to the documentation-graph directory
cd "$(dirname "$0")/.."

echo "1. Standard Analysis (Original Functionality - Unchanged)"
echo "   npm run analyze"
echo ""

echo "2. Topic-Based Analysis Examples:"
echo ""

echo "   a) Analyze 'Arbitrum chain' documentation:"
echo "      npm run topic \"Arbitrum chain\""
echo ""

echo "   b) Search for 'Node' documentation with fuzzy matching:"
echo "      npm run topic Node -- --fuzzy"
echo ""

echo "   c) Find 'How-tos' with higher relevance threshold:"
echo "      npm run topic \"How-tos\" -- --threshold 0.5"
echo ""

echo "   d) Generate only HTML visualization for 'SDK':"
echo "      npm run topic SDK -- --format html"
echo ""

echo "3. Keyword-Based Analysis Examples:"
echo ""

echo "   a) Search for documents about 'node' OR 'validator':"
echo "      npm run keyword node validator"
echo ""

echo "   b) Find documents containing BOTH 'smart' AND 'contract':"
echo "      npm run keyword smart contract -- --operator AND"
echo ""

echo "   c) Search with related concepts included:"
echo "      npm run keyword deployment -- --include-related --depth 2"
echo ""

echo "   d) Limit results to top 20 most relevant:"
echo "      npm run keyword security -- --max-results 20"
echo ""

echo "   e) Export only CSV format for data analysis:"
echo "      npm run keyword arbitrum chain -- --format csv"
echo ""

echo "4. Advanced Combinations:"
echo ""

echo "   a) Fresh analysis without cache:"
echo "      npm run topic \"Arbitrum chain\" -- --no-use-cache"
echo ""

echo "   b) Verbose output for debugging:"
echo "      npm run keyword node -- --verbose"
echo ""

echo "   c) Case-sensitive topic matching:"
echo "      npm run topic SDK -- --case-sensitive"
echo ""

echo "   d) Custom output directory:"
echo "      npm run topic \"How-tos\" -- -o ./custom-reports"
echo ""

echo "5. Workflow Example:"
echo ""
echo "   # Step 1: Generate full graph and cache"
echo "   npm run start"
echo ""
echo "   # Step 2: Analyze specific topics using cache"
echo "   npm run topic \"Arbitrum chain\""
echo "   npm run topic \"Node\""
echo ""
echo "   # Step 3: Search for specific keywords"
echo "   npm run keyword security vulnerability"
echo ""
echo "   # Step 4: Serve visualizations"
echo "   npm run serve"
echo "   # Open browser to http://localhost:8080"
echo ""

echo "========================================"
echo "Output Files Location: ./dist/"
echo "========================================"
echo ""
echo "Topic Analysis:"
echo "  - knowledge-graph-visualization-{topic}.html"
echo "  - topic-analysis-{topic}.json"
echo "  - topic-report-{topic}.md"
echo ""
echo "Keyword Analysis:"
echo "  - knowledge-graph-visualization-{keywords}.html"
echo "  - keyword-analysis-{keywords}.json"
echo "  - keyword-report-{keywords}.md"
echo "  - keyword-matches-{keywords}.csv"
echo ""

echo "For more information, see README-ENHANCED.md"