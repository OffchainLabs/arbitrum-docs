#!/usr/bin/env bash
#
# sme-gate-sandbox — open the SME-review-gate test matrix against a sandbox repo.
#
# Prereqs (one-time, admin — see .github/SME_REVIEW_GATE.md):
#   - A private sandbox repo with the gate installed on its default branch
#     (.github/workflows/sme-review-gate.yml, scripts/sme-review-gate.ts,
#      .github/sme-config.json, .github/CODEOWNERS — same config as this repo, so
#      `stylus-sme` maps to docs/stylus/**).
#   - An `stylus-sme` team with WRITE access and the SME_GATE_TOKEN secret set,
#     so the gate can resolve membership and approvals.
#
# This creates four internal-branch PRs, one per matrix row that is driven by PR
# content. The two review-action rows (SME approves; approval dismissed) are manual
# and printed at the end, as is the fork-PR case (needs a second account's fork).
#
# Usage: scripts/sme-gate-sandbox.sh --repo <owner/name> [--dry-run]

set -euo pipefail

REPO=""
DRY_RUN=false
SME_TEAM="stylus-sme"  # must match .github/sme-config.json in the sandbox
SME_PATH="docs/stylus" # a path that maps to $SME_TEAM
EDIT_PATH="docs/intro" # a path that maps to no SME team

while [ $# -gt 0 ]; do
  case "$1" in
  --repo)
    REPO="${2:-}"
    shift 2
    ;;
  --dry-run)
    DRY_RUN=true
    shift
    ;;
  *)
    echo "Unknown argument: $1" >&2
    exit 2
    ;;
  esac
done

if [ -z "$REPO" ]; then
  echo "Usage: scripts/sme-gate-sandbox.sh --repo <owner/name> [--dry-run]" >&2
  exit 2
fi

command -v gh >/dev/null 2>&1 || {
  echo "gh CLI is required" >&2
  exit 1
}
gh auth status >/dev/null 2>&1 || {
  echo "gh is not authenticated" >&2
  exit 1
}

DEFAULT_BRANCH="$(gh repo view "$REPO" --json defaultBranchRef --jq .defaultBranchRef.name)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "Sandbox repo : $REPO (default branch: $DEFAULT_BRANCH)"
echo "Dry run      : $DRY_RUN"
echo

if [ "$DRY_RUN" = false ]; then
  gh repo clone "$REPO" "$TMP" -- --depth 1 >/dev/null 2>&1
  cd "$TMP"
  git config user.name "sme-gate-sandbox"
  git config user.email "sme-gate-sandbox@local"
fi

# make_pr <branch> <relpath> <title> <body> <file-content>
make_pr() {
  branch="$1"
  relpath="$2"
  title="$3"
  body="$4"
  content="$5"
  if [ "$DRY_RUN" = true ]; then
    echo "[dry-run] would open PR '$title' on branch '$branch' adding $relpath"
    return
  fi
  git checkout -q -B "$branch" "origin/$DEFAULT_BRANCH"
  mkdir -p "$(dirname "$relpath")"
  printf '%s\n' "$content" >"$relpath"
  git add "$relpath"
  git commit -q -m "$title"
  git push -q -f -u origin "$branch"
  gh pr create --repo "$REPO" --base "$DEFAULT_BRANCH" --head "$branch" \
    --title "$title" --body "$body"
}

editorial_doc='---
title: Sandbox editorial
---

Purely editorial change. Expect: SME gate green (no SME content), TW approval suffices.'

path_doc='---
title: Sandbox path fallback
---

Untagged technical edit under '"$SME_PATH"'. Expect: requires '"$SME_TEAM"' via path fallback.'

region_doc='---
title: Sandbox region tag
---

Editorial-path doc with one tagged region.

{/* sme:start team='"$SME_TEAM"' reason="sandbox region test" */}

This paragraph needs SME review. Expect: requires '"$SME_TEAM"'.

{/* sme:end */}'

malformed_doc='---
title: Sandbox malformed marker
---

{/* sme:start team=nonexistent-sme reason="unknown team" */}

Expect: action_required (unknown SME team slug).

{/* sme:end */}'

make_pr "sandbox/editorial-only" "$EDIT_PATH/_sandbox-editorial.mdx" \
  "[sandbox] editorial-only — expect SME gate green" \
  "Matrix row 1. No SME path/marker. Expected check: success (report-only: neutral)." \
  "$editorial_doc"

make_pr "sandbox/path-fallback" "$SME_PATH/_sandbox-path-fallback.mdx" \
  "[sandbox] path fallback — expect needs $SME_TEAM" \
  "Matrix row 2. Untagged edit under $SME_PATH/**. Expected: requires $SME_TEAM." \
  "$path_doc"

make_pr "sandbox/region-tag" "$EDIT_PATH/_sandbox-region-tag.mdx" \
  "[sandbox] region tag — expect needs $SME_TEAM" \
  "Matrix row 3. Editorial path, change inside an sme:start region. Expected: requires $SME_TEAM." \
  "$region_doc"

make_pr "sandbox/malformed-marker" "$EDIT_PATH/_sandbox-malformed.mdx" \
  "[sandbox] malformed marker — expect action_required" \
  "Matrix row 4. Unknown team slug. Expected: action_required." \
  "$malformed_doc"

echo
echo "Done. Now observe the sme-review-gate check on each PR (flip reportOnly:false"
echo "in the sandbox to see pass/fail instead of neutral)."
echo
echo "Manual rows not scripted:"
echo "  5. Have an $SME_TEAM member approve the path-fallback PR -> check flips to success."
echo "  6. Dismiss that approval -> check re-blocks."
echo "  Fork case: open a PR from a fork (second account) -> confirm the check still"
echo "  posts and resolves (this is the pull_request_target path)."
