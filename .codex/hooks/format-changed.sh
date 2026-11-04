#!/usr/bin/env bash
# PostToolUse (Edit|Write): run Prettier on every file the edit touched.
# Mirrors the format:check CI gate. Non-blocking.
set -uo pipefail

root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
prettier="$root/node_modules/.bin/prettier"
[ -x "$prettier" ] || exit 0

while IFS= read -r path; do
  [ -f "$path" ] || continue
  "$prettier" --write --log-level warn -- "$path" || true
done < <("$root/.codex/hooks/changed-paths.sh")
exit 0
