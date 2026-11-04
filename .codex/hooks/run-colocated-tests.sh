#!/usr/bin/env bash
# PostToolUse (Edit|Write): when a script under scripts/ changes, run its
# colocated *.test.ts with the repo test runner (node --test). Exit 2 with the
# failure on stderr so Codex sees it. Edits to a test file run that file.
set -uo pipefail

root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
status=0

while IFS= read -r path; do
  case "$path" in
    *.test.ts) test_file="$path" ;;
    *scripts/*.ts) test_file="${path%.ts}.test.ts" ;;
    *) continue ;;
  esac
  [ -f "$test_file" ] || continue
  if ! output=$(cd "$root" && node --test "$test_file" 2>&1); then
    printf 'Tests failed for %s:\n%s\n' "$test_file" "$output" >&2
    status=2
  fi
done < <("$root/.codex/hooks/changed-paths.sh")
exit "$status"
