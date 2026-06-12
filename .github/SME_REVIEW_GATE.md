# SME review gate — operator runbook

How the dual editorial + SME review gate works, and the admin steps to turn on
enforcement. Canonical design lives in Notion ("Solving TW's PR Bottleneck Issue").

## What it does

A docs PR should merge only when **both** an editorial reviewer (Technical Writing)
**and** the relevant **subject-matter expert(s) (SME)** have approved. The two gates
are enforced separately:

- **Editorial gate (TW)** — a branch ruleset rule "require review from specific teams"
  requiring 1 approval from `@OffchainLabs/technical-writing` on `docs/**`.
- **SME gate** — the `sme-review-gate` status check (this repo's
  `.github/workflows/sme-review-gate.yml` + `scripts/sme-review-gate.ts`). It figures
  out which SME team(s) a PR needs and whether they've approved.

A PR needs an SME team when either:

1. **Region marker** — a changed line is inside `{/* sme:start team=<slug> */}` …
   `{/* sme:end */}` (sub-document granularity), or
2. **Path fallback** — a changed file matches that team's globs in
   `.github/sme-config.json` (so untagged technical edits still gate).

If a PR touches no SME content, the check passes on its own and editorial approval is enough.

## Status check conclusions

| Conclusion | Meaning |
| --- | --- |
| `neutral` | Report-only mode (`reportOnly: true`). Never blocks. |
| `success` | No SME content, or every required SME team approved. |
| `failure` | A required SME team has not approved yet. |
| `action_required` | Misconfiguration: malformed `sme:*` markers, an unknown team slug, or team membership could not be read (missing team / token). Fix setup — not a normal "awaiting approval". |

## Transient markers (post-merge cleanup)

SME markers are **transient per-PR signals**, not durable content. After a PR
merges to `master`, the `SME marker cleanup` workflow
(`.github/workflows/sme-marker-cleanup.yml`) strips the `{/* sme:* */}` markers
from the files that PR changed and commits the result directly to `master` as the
cleanup bot. A future edit to that area is re-tagged by its own author if the new
diff needs SME review. Always-on protection for whole technical sections still
comes from the path globs in `.github/sme-config.json`, which do not depend on
markers.

Enabling cleanup needs (admin): a dedicated bot/GitHub App token in the repo
secret `SME_CLEANUP_TOKEN` with `contents: write`, and that bot added to the
branch-ruleset **bypass list** so its commit isn't blocked by required reviews.

## Current state: report-only (Phase 0)

`.github/sme-config.json` has `"reportOnly": true`, so the check posts `neutral` and
**blocks nothing**. This lets the diff → region/path → team logic be validated on real
PRs before it gates merges. While in this state you will see SME teams reported as
`unverifiable` until the teams and token below exist — that is expected.

## Enabling enforcement (admin steps)

> Requires org owner / repo admin. Do these in order; the gate is reversible at every step.

1. **Create the per-domain SME teams** in the `OffchainLabs` org and give each **write**
   access to `arbitrum-docs` (write access is required for their approvals to count):
   - `protocol-sme` — owns `docs/how-arbitrum-works/**`
   - `stylus-sme` — owns `docs/stylus/**`, `docs/stylus-by-example/**`
   - `chain-sme` — owns `docs/launch-arbitrum-chain/**`

   (These match `.github/sme-config.json` and `.github/CODEOWNERS`. Add/rename teams by
   editing those two files in a PR.)

2. **Provision a membership-read token.** The default `GITHUB_TOKEN` cannot read org team
   membership, so the gate reports teams as `unverifiable` without one. Create a GitHub
   App installation token or a fine-grained PAT with **`members: read`** on the org, and
   add it as the repo secret **`SME_GATE_TOKEN`**. The workflow prefers it automatically.

3. **Confirm in report-only.** Open/refresh a PR touching a pilot section and check the
   `sme-review-gate` run: required teams should now show `approved`/`awaiting` instead of
   `unverifiable`. Fix any `action_required` marker problems it reports.

4. **Flip to enforcing.** In a PR, set `"reportOnly": false` in `.github/sme-config.json`.
   The check now returns `success` / `failure` / `action_required`.

5. **Apply the ruleset.** Create the branch ruleset from the API body in
   `.github/rulesets/docs-review-gates.json` (it requires the `sme-review-gate` check +
   1 code-owner approval), then set its enforcement to **active**:

   ```shell
   gh api -X POST repos/OffchainLabs/arbitrum-docs/rulesets \
     --input .github/rulesets/docs-review-gates.json
   # then, in the repo ruleset UI, switch enforcement from "Disabled" to "Active"
   ```

6. **Add the editorial (TW) gate.** In the same ruleset (or a second one), add the
   **"Require review from specific teams"** rule via the repo UI:
   `@OffchainLabs/technical-writing`, 1 approval, file path `docs/**`. (This rule is new
   enough that the UI is the reliable way to configure it; it is not in the JSON above.)

7. **Pilot, then expand.** Keep the path scope limited to the pilot sections first. To
   widen coverage later, add teams + globs to `.github/sme-config.json` and paths to
   `.github/CODEOWNERS`.

## Contributor model: forks vs internal branches

External contributors open PRs from **forks**; internal contributors push branches to
**origin**. A plain `pull_request` workflow on a fork PR gets a read-only token, no
secrets, and no `checks: write` — so it couldn't post the check or read team membership.
The workflow therefore uses **`pull_request_target`**, which runs in the base-repo context
(full token + secrets) for fork PRs too. It is safe because the job checks out only the
trusted base ref and the script reads PR content over the API (`refs/pull/N/head`) — it
never checks out or runs the PR's code. Do not add a step that builds or executes PR code.

## Smoke-testing in a sandbox

To exercise the *blocking* behavior without risking real PRs, use a throwaway private repo.

**One-time setup (admin):**

1. Create a private repo, e.g. `OffchainLabs/arbitrum-docs-gate-sandbox`.
2. Copy the gate files into its default branch: `.github/workflows/sme-review-gate.yml`,
   `scripts/sme-review-gate.ts`, `.github/sme-config.json`, `.github/CODEOWNERS`
   (plus a minimal `package.json` with `tsx`, or reuse this repo's). Keep `sme-config.json`
   identical so `stylus-sme` maps to `docs/stylus/**`.
3. Create an `stylus-sme` team with **write** access and set the `SME_GATE_TOKEN` secret
   (`members:read`).

**Run the matrix:**

```shell
scripts/sme-gate-sandbox.sh --repo OffchainLabs/arbitrum-docs-gate-sandbox --dry-run
scripts/sme-gate-sandbox.sh --repo OffchainLabs/arbitrum-docs-gate-sandbox
```

This opens four internal-branch PRs (editorial-only, path-fallback, region-tag, malformed
marker). Flip `reportOnly: false` in the sandbox to see `success`/`failure`/`action_required`
instead of `neutral`, and apply the ruleset (active) to confirm the merge button actually
locks/unlocks. The script prints the manual rows it can't drive: an SME approval flipping the
check to success, dismissing it to re-block, and a **fork PR** (from a second account) to
confirm the `pull_request_target` path posts and resolves the check.

## Rollback

Set `"reportOnly": true` in `.github/sme-config.json` (instant, code-side), and/or set the
ruleset enforcement back to **Disabled** in the UI. Either fully unblocks merges.
