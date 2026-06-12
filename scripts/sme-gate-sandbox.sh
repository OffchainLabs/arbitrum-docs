#!/usr/bin/env bash
#
# sme-gate-sandbox — set up and exercise the SME review gate in a sandbox repo.
#
# Two modes:
#   --bootstrap : copy the gate files from this arbitrum-docs checkout into the
#                 sandbox repo's default branch (run once, from an arbitrum-docs
#                 checkout) and generate a sandbox-tailored workflow.
#   (default)   : open the gate test matrix as internal-branch PRs against the
#                 sandbox (run after the SME team + SME_GATE_TOKEN secret exist).
#
# Prereqs for enforcement testing (admin — see .github/SME_REVIEW_GATE.md):
#   an `stylus-sme` team with WRITE access on the sandbox + the SME_GATE_TOKEN
#   secret (members:read). The matrix uses `stylus-sme` / docs/stylus/**.
#
# Usage:
#   scripts/sme-gate-sandbox.sh --repo <owner/name> --bootstrap [--dry-run]
#   scripts/sme-gate-sandbox.sh --repo <owner/name> [--dry-run]

set -euo pipefail

REPO=""
DRY_RUN=false
BOOTSTRAP=false
SRC_DIR="$(pwd)"       # arbitrum-docs checkout; source of gate files for --bootstrap
SME_TEAM="stylus-sme"  # must match .github/sme-config.json in the sandbox
SME_PATH="docs/stylus" # a path that maps to $SME_TEAM
EDIT_PATH="docs/intro" # a path that maps to no SME team

# Files copied verbatim into the sandbox by --bootstrap (the workflow is generated).
GATE_FILES=(
  ".github/sme-config.json"
  ".github/CODEOWNERS"
  ".github/SME_REVIEW_GATE.md"
  "scripts/sme-review-gate.ts"
  "scripts/sme-markers.ts"
  "scripts/strip-sme-markers.ts"
  "scripts/sme-gate-sandbox.sh"
)

usage() {
  echo "Usage: scripts/sme-gate-sandbox.sh --repo <owner/name> [--bootstrap] [--dry-run]" >&2
  exit 2
}

while [ $# -gt 0 ]; do
  case "$1" in
  --repo)
    REPO="${2:-}"
    shift 2
    ;;
  --bootstrap)
    BOOTSTRAP=true
    shift
    ;;
  --dry-run)
    DRY_RUN=true
    shift
    ;;
  *)
    echo "Unknown argument: $1" >&2
    usage
    ;;
  esac
done

[ -n "$REPO" ] || usage

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

clone_sandbox() {
  gh repo clone "$REPO" "$TMP" -- --depth 1 >/dev/null 2>&1
  cd "$TMP"
  git config user.name "sme-gate-sandbox"
  git config user.email "sme-gate-sandbox@local"
}

write_sandbox_workflow() {
  mkdir -p .github/workflows
  # Quoted heredoc delimiter: keeps ${{ ... }} literal for GitHub Actions.
  cat >.github/workflows/sme-review-gate.yml <<'YAML'
name: SME review gate (sandbox)

# Sandbox variant: same triggers / permissions / pull_request_target model as the
# real workflow, with a simplified install (npx tsx) since the script has no npm deps.

on:
  pull_request_target:
    types: [opened, synchronize, reopened]
  pull_request_review:
    types: [submitted, dismissed, edited]
  workflow_dispatch:
    inputs:
      pr:
        description: 'PR number to evaluate'
        required: true
        type: string

permissions:
  contents: read
  checks: write
  pull-requests: read

jobs:
  # Job name MUST differ from the published check-run context (`sme-review-gate`)
  # to avoid the job's always-green check colliding with the script's verdict.
  evaluate:
    name: 'evaluate'
    runs-on: ubuntu-latest
    steps:
      - name: Resolve PR number
        id: resolve
        env:
          GH_TOKEN: ${{ secrets.SME_GATE_TOKEN || secrets.GITHUB_TOKEN }}
          INPUT_PR: ${{ inputs.pr }}
          EVENT_PR: ${{ github.event.pull_request.number }}
        run: |
          PR="${INPUT_PR:-$EVENT_PR}"
          if [ -z "$PR" ]; then echo "No PR number"; exit 1; fi
          echo "pr=$PR" >> "$GITHUB_OUTPUT"
      - name: Checkout base
        uses: actions/checkout@v4
        with:
          fetch-depth: 1
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22.x'
      - name: Run SME review gate
        env:
          GH_TOKEN: ${{ secrets.SME_GATE_TOKEN || secrets.GITHUB_TOKEN }}
          PR_NUMBER: ${{ steps.resolve.outputs.pr }}
        run: npx -y tsx scripts/sme-review-gate.ts
YAML
}

write_sandbox_cleanup_workflow() {
  # Quoted heredoc delimiter keeps ${{ ... }} literal for GitHub Actions.
  cat >.github/workflows/sme-marker-cleanup.yml <<'YAML'
name: SME marker cleanup (sandbox)

# Sandbox variant of the post-merge marker stripper. Same pull_request_target
# model; simplified install (npx tsx). Needs the SME_CLEANUP_TOKEN secret and a
# bot on the sandbox ruleset bypass list to push to the default branch.

on:
  pull_request_target:
    types: [closed]

permissions:
  contents: write
  pull-requests: read

concurrency:
  group: sme-marker-cleanup
  cancel-in-progress: false

jobs:
  strip:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - name: Checkout default branch
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.SME_CLEANUP_TOKEN }}
          persist-credentials: true
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22.x'
      - name: Collect merged PR's markdown files
        id: files
        env:
          GH_TOKEN: ${{ secrets.SME_CLEANUP_TOKEN }}
          PR: ${{ github.event.pull_request.number }}
          REPO: ${{ github.repository }}
        run: |
          gh api "repos/$REPO/pulls/$PR/files" --paginate --jq '.[].filename' \
            | grep -E '\.mdx?$' > "$RUNNER_TEMP/sme-files.txt" || true
          echo "count=$(wc -l < "$RUNNER_TEMP/sme-files.txt" | tr -d ' ')" >> "$GITHUB_OUTPUT"
      - name: Strip and push
        if: steps.files.outputs.count != '0'
        run: |
          mapfile -t FILES < "$RUNNER_TEMP/sme-files.txt"
          npx -y tsx scripts/strip-sme-markers.ts "${FILES[@]}"
          if git diff --quiet; then echo "nothing to strip"; exit 0; fi
          git config user.name "sme-gate-sandbox"
          git config user.email "sme-gate-sandbox@local"
          git commit -am "chore: strip transient SME markers (post-merge of #${{ github.event.pull_request.number }})"
          git push
YAML
}

bootstrap() {
  for f in "${GATE_FILES[@]}"; do
    [ -f "$SRC_DIR/$f" ] || {
      echo "Missing $f in $SRC_DIR — run --bootstrap from an arbitrum-docs checkout." >&2
      exit 1
    }
  done
  if [ "$DRY_RUN" = true ]; then
    echo "[dry-run] would install into ${REPO}@${DEFAULT_BRANCH}:"
    printf '  %s\n' "${GATE_FILES[@]}" \
      ".github/workflows/sme-review-gate.yml (sandbox variant)" \
      ".github/workflows/sme-marker-cleanup.yml (sandbox variant)"
    return
  fi
  clone_sandbox
  for f in "${GATE_FILES[@]}"; do
    mkdir -p "$(dirname "$f")"
    cp "$SRC_DIR/$f" "$f"
  done
  write_sandbox_workflow
  write_sandbox_cleanup_workflow
  chmod +x scripts/sme-gate-sandbox.sh
  git add -A
  git commit -q -m "Bootstrap SME review gate (sandbox)"
  git push -q origin "$DEFAULT_BRANCH"
  echo "Installed gate files into ${REPO}@${DEFAULT_BRANCH}."
  echo "Next: create an ${SME_TEAM} team with write access + the SME_GATE_TOKEN secret, then:"
  echo "  scripts/sme-gate-sandbox.sh --repo ${REPO}"
}

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

MODE=matrix
if [ "$BOOTSTRAP" = true ]; then MODE=bootstrap; fi
echo "Sandbox repo : $REPO (default branch: $DEFAULT_BRANCH)"
echo "Mode         : $MODE (dry-run: $DRY_RUN)"
echo

if [ "$BOOTSTRAP" = true ]; then
  bootstrap
  exit 0
fi

if [ "$DRY_RUN" = false ]; then clone_sandbox; fi

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
echo "Done. Observe the sme-review-gate check on each PR (flip reportOnly:false in"
echo "the sandbox to see pass/fail instead of neutral)."
echo
echo "Manual rows not scripted:"
echo "  5. Have an $SME_TEAM member approve the path-fallback PR -> check flips to success."
echo "  6. Dismiss that approval -> check re-blocks."
echo "  Fork case: open a PR from a fork (second account) -> confirm the check still"
echo "  posts and resolves (this is the pull_request_target path)."
echo "  Cleanup: merge the region-tag PR, then confirm the marker is gone:"
echo "    gh api repos/${REPO}/contents/${EDIT_PATH}/_sandbox-region-tag.mdx \\"
echo "      --jq '.content' | base64 -d | grep -c 'sme:start' # expect 0 after cleanup runs"
