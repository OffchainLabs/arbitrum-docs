#!/usr/bin/env bash
# PostToolUse: optimize an edited SVG under static/img with svgo, in place.
# Non-blocking — any failure is swallowed so it never interrupts the workflow.
set -uo pipefail

input=$(cat)
path=$(printf '%s' "$input" | python3 -c "import json,sys; print(json.load(sys.stdin).get('tool_input',{}).get('file_path',''))" 2>/dev/null || true)

case "$path" in
  *static/img/*.svg)
    svgo="${CLAUDE_PROJECT_DIR:-.}/node_modules/.bin/svgo"
    if [ -x "$svgo" ] && [ -f "$path" ]; then
      before=$(wc -c <"$path" | tr -d ' ')
      if "$svgo" --config "${CLAUDE_PROJECT_DIR:-.}/svgo.config.mjs" --quiet "$path" -o "$path" 2>/dev/null; then
        after=$(wc -c <"$path" | tr -d ' ')
        echo "svgo: ${path##*/} ${before}B -> ${after}B"
      fi
    fi
    ;;
esac
exit 0
