#!/usr/bin/env bash
# PostToolUse: optimize an edited SVG under public/img with svgo, in place.
# Non-blocking: any failure is swallowed so it never interrupts the workflow.
# svgo is NOT an installed dependency of this repo (no node_modules/.bin/svgo),
# so this is a no-op today; it only activates if svgo is added later.
set -uo pipefail

root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
svgo="$root/node_modules/.bin/svgo"
[ -x "$svgo" ] || exit 0

while IFS= read -r path; do
  case "$path" in
    *public/img/*.svg) ;;
    *) continue ;;
  esac
  [ -f "$path" ] || continue
  before=$(wc -c <"$path" | tr -d ' ')
  if "$svgo" --config "$root/svgo.config.ts" --quiet "$path" -o "$path" 2>/dev/null; then
    after=$(wc -c <"$path" | tr -d ' ')
    echo "svgo: ${path##*/} ${before}B -> ${after}B"
  fi
done < <("$root/.codex/hooks/changed-paths.sh")
exit 0
