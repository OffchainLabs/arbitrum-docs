#!/usr/bin/env bash
# PreToolUse (Edit|Write): require the editorial pattern guide before prose docs
# are written. Denies the first matching write of a session and returns the guide
# so it lands in context; every later write in that session passes silently.
# Fails open — a missing guide or a parse error never blocks the workflow.
set -uo pipefail

input=$(cat)
path=$(printf '%s' "$input" | python3 -c "import json,sys; print(json.load(sys.stdin).get('tool_input',{}).get('file_path',''))" 2>/dev/null || true)
session=$(printf '%s' "$input" | python3 -c "import json,sys; print(json.load(sys.stdin).get('session_id','unknown'))" 2>/dev/null || true)

guide="${CLAUDE_PROJECT_DIR:-.}/docs/Offchain-pattern-guide.md"

# Generated trees and the guide itself are exempt.
case "$path" in
  */docs/sdk/* | */docs/stylus-by-example/* | */docs/Offchain-pattern-guide.md) exit 0 ;;
esac

# Prose docs only.
case "$path" in
  */docs/*.md | */docs/*.mdx) ;;
  *) exit 0 ;;
esac

[ -f "$guide" ] || exit 0

marker="${TMPDIR:-/tmp}/claude-pattern-guide-${session:-unknown}"
if [ -f "$marker" ]; then
  exit 0
fi
touch "$marker" 2>/dev/null || true

GUIDE_PATH="$guide" python3 <<'PY'
import json
import os
import sys

with open(os.environ['GUIDE_PATH'], encoding='utf-8') as fh:
    guide = fh.read()

reason = (
    'Offchain editorial standards apply to this file and have not been read in '
    'this session. Revise your content against the guide below, then retry the '
    'write. Source: docs/Offchain-pattern-guide.md\n\n' + guide
)

json.dump(
    {
        'hookSpecificOutput': {
            'hookEventName': 'PreToolUse',
            'permissionDecision': 'deny',
            'permissionDecisionReason': reason,
        }
    },
    sys.stdout,
)
PY

exit 0
