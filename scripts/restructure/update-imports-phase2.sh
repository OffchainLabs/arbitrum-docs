#!/bin/bash

echo "=== Updating imports for Phase 2 file moves ==="
echo ""

# Update imports for files moved to fundamentals/
echo "Updating fundamentals/ imports..."
find docs/stylus -name "*.mdx" -exec sed -i '' \
  -e 's|reference/project-structure|fundamentals/project-structure|g' \
  -e 's|reference/contracts|fundamentals/contracts|g' \
  -e 's|reference/global-variables-and-functions|fundamentals/global-variables-and-functions|g' \
  -e 's|reference/data-types|fundamentals/data-types|g' \
  -e 's|how-tos/testing-contracts|fundamentals/testing-contracts|g' \
  {} \;

# Update imports for CLI tools
echo "Updating cli-tools/ imports..."
find docs/stylus -name "*.mdx" -exec sed -i '' \
  -e 's|using-cli\.mdx|cli-tools/overview|g' \
  -e 's|/using-cli\)|/cli-tools/overview)|g' \
  -e 's|how-tos/check-and-deploy|cli-tools/check-and-deploy|g' \
  -e 's|how-tos/debugging-tx|cli-tools/debugging-tx|g' \
  -e 's|how-tos/verifying-contracts|cli-tools/verify-contracts|g' \
  {} \;

# Update imports for guides (how-tos → guides)
echo "Updating guides/ imports..."
find docs/stylus -name "*.mdx" -exec sed -i '' \
  -e 's|how-tos/|guides/|g' \
  {} \;

echo ""
echo "✅ All imports updated"
