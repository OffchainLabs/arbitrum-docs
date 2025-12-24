#!/bin/bash

echo "=== Frontmatter Audit ==="
echo ""

missing_user_story=()
missing_content_type=()

# Check all .mdx and .md files in stylus directory (exclude partials and implementation guides)
for file in $(find docs/stylus -name "*.mdx" -o -name "*.md" | grep -v "partials" | grep -v "IMPLEMENTATION_GUIDE" | grep -v "RESTRUCTURE_README"); do
    # Check for user_story
    if ! grep -q "user_story:" "$file"; then
        missing_user_story+=("$file")
    fi

    # Check for content_type
    if ! grep -q "content_type:" "$file"; then
        missing_content_type+=("$file")
    fi
done

echo "Files missing user_story:"
printf '%s\n' "${missing_user_story[@]}"
echo ""
echo "Total: ${#missing_user_story[@]}"
echo ""

echo "Files missing content_type:"
printf '%s\n' "${missing_content_type[@]}"
echo ""
echo "Total: ${#missing_content_type[@]}"
echo ""

if [ ${#missing_user_story[@]} -eq 0 ] && [ ${#missing_content_type[@]} -eq 0 ]; then
    echo "✅ All files have complete frontmatter!"
    exit 0
else
    echo "❌ Some files missing frontmatter fields"
    exit 1
fi
