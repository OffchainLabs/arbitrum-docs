#!/usr/bin/env bash
# PreToolUse (Edit|Write): require the style guide before prose docs are
# written. Denies the first matching write of a session and returns the guide
# so it lands in context; every later write in that session passes silently.
# Fails open: a missing guide or a parse error never blocks the workflow.
set -uo pipefail

root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
input=$(cat)
session=$(printf '%s' "$input" | python3 -c "import json,sys; print(json.load(sys.stdin).get('session_id','unknown'))" 2>/dev/null || true)

guide="$root/STYLE-GUIDE.md"
[ -f "$guide" ] || exit 0

prose=0
while IFS= read -r path; do
  case "$path" in
    */content/docs/stylus/stylus-by-example/* | */cli-flags-reference.mdx) continue ;;
    */content/docs/*.mdx | */content/partials/*.mdx) prose=1 ;;
  esac
done < <(printf '%s' "$input" | "$root/.codex/hooks/changed-paths.sh")
[ "$prose" -eq 1 ] || exit 0

marker="${TMPDIR:-/tmp}/codex-pattern-guide-${session:-unknown}"
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
    'write. Source: STYLE-GUIDE.md\n\n' + guide
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
