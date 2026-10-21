#!/usr/bin/env bash
# PreToolUse (Edit|Write): block edits to generated content.
# Exit 2 with the reason on stderr denies the tool call in Codex.
set -uo pipefail

root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

while IFS= read -r path; do
  case "$path" in
    */content/docs/stylus/stylus-by-example/*) cmd="pnpm stylus:generate" ;;
    */content/docs/run-a-node/nitro/cli-flags-reference.mdx) cmd="pnpm cli:generate" ;;
    */content/partials/precompile-tables/*) cmd="pnpm precompiles:generate" ;;
    */content/partials/_reference-arbitrum-contract-addresses-partial.mdx) cmd="pnpm contracts:generate" ;;
    */content/partials/_troubleshooting-*-partial.mdx) cmd="edit the FAQ in Notion, then pnpm faq:fetch && pnpm faq:generate" ;;
    *) continue ;;
  esac
  echo "BLOCKED: $path is generated. Change its generator in scripts/ instead, then run: $cmd (see CLAUDE.md, Generated pages)." >&2
  exit 2
done < <("$root/.codex/hooks/changed-paths.sh")

exit 0
