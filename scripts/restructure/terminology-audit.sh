#!/bin/bash

echo "=== Stylus Terminology Audit ==="
echo ""

violations=0

# Check for "js" instead of "JavaScript" (excluding .js file extensions, ts.js, etc.)
echo "Checking for 'js' (should be 'JavaScript')..."
results=$(grep -rn '\bjs\b' docs/stylus/ --include="*.mdx" --include="*.md" 2>/dev/null | grep -v "\.js" | grep -v "ts\.js" | grep -v "js/" | grep -v "jsx" || true)
if [ ! -z "$results" ]; then
    echo "$results"
    violations=$((violations + 1))
fi

# Check for "smartcontract" instead of "smart contract"
echo ""
echo "Checking for 'smartcontract' (should be 'smart contract')..."
results=$(grep -rin 'smartcontract' docs/stylus/ --include="*.mdx" --include="*.md" 2>/dev/null || true)
if [ ! -z "$results" ]; then
    echo "$results"
    violations=$((violations + 1))
fi

# Check for "whitelist/blacklist" instead of "allowlist/denylist"
echo ""
echo "Checking for 'whitelist/blacklist' (should be 'allowlist/denylist')..."
results=$(grep -rin 'whitelist\|blacklist' docs/stylus/ --include="*.mdx" --include="*.md" 2>/dev/null || true)
if [ ! -z "$results" ]; then
    echo "$results"
    violations=$((violations + 1))
fi

# Check for "on-chain" instead of "onchain"
echo ""
echo "Checking for 'on-chain/on chain' (should be 'onchain')..."
results=$(grep -rn 'on-chain\|on chain' docs/stylus/ --include="*.mdx" --include="*.md" 2>/dev/null || true)
if [ ! -z "$results" ]; then
    echo "$results"
    violations=$((violations + 1))
fi

# Check for "ERC20" instead of "ERC-20"
echo ""
echo "Checking for 'ERC20/ERC721' (should be 'ERC-20/ERC-721')..."
results=$(grep -rn 'ERC20\|ERC721\|ERC1155' docs/stylus/ --include="*.mdx" --include="*.md" 2>/dev/null | grep -v "ERC-" || true)
if [ ! -z "$results" ]; then
    echo "$results"
    violations=$((violations + 1))
fi

# Check for "Layer-1/L1" instead of "Parent chain"
echo ""
echo "Checking for 'Layer-1/L1/layer 1' (should be 'Parent chain')..."
results=$(grep -rin 'Layer-1\|Layer 1\|\bL1\b' docs/stylus/ --include="*.mdx" --include="*.md" 2>/dev/null || true)
if [ ! -z "$results" ]; then
    echo "$results"
    violations=$((violations + 1))
fi

# Check for "Layer-2/L2" instead of "Child chain"
echo ""
echo "Checking for 'Layer-2/L2/layer 2' (should be 'Child chain')..."
results=$(grep -rin 'Layer-2\|Layer 2\|\bL2\b' docs/stylus/ --include="*.mdx" --include="*.md" 2>/dev/null || true)
if [ ! -z "$results" ]; then
    echo "$results"
    violations=$((violations + 1))
fi

echo ""
echo "=== Audit Complete ==="
echo "Total violation types found: $violations"
echo ""

if [ $violations -eq 0 ]; then
    echo "✅ No terminology violations found!"
    exit 0
else
    echo "❌ Terminology violations found. Please fix manually."
    exit 1
fi
