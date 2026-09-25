# Code Review and Fix Verification: fionna/fumadocs-migration

## Context

- Base: freshly fetched `origin/fumadocs` at `0afea2181d1b73cd7fe443f492c05daab953d5e6`.
- Target: the current uncommitted working tree on `fionna/fumadocs-migration`. `HEAD` equals `origin/fumadocs`; there is no committed branch diff.
- PR: `gh pr view` found no PR, so intent is inferred from the migration changes.
- This file replaces the earlier review against `master` and records verification and fixes against the user-requested `fumadocs` base.

## Verdict

The six actionable findings from the first `fumadocs` review have been verified and addressed in the working tree. The exact CI gates now pass locally. A live onchain quickstart run, a deployed redirect audit, and production cache behavior have not been exercised.

## Verified Findings and Fixes

### High: CI used deleted commands and did not run for `fumadocs` PRs — fixed

- The unchanged base workflow called deleted `scripts/versioned-docs-check.mjs` and three removed package commands. Its triggers covered `main` and `master`, but not the review base `fumadocs`.
- `.github/workflows/ci.yml` now includes `fumadocs`, invokes `scripts/versioned-docs-check.ts`, and uses available FAQ, contract-address, and remote-image presence checks. The old Nitro image, Markdown lint, and offline redirect commands were retired because the current tooling has no direct equivalent; `pnpm redirects:check` needs a running site.
- The old image audit's absence remains a coverage tradeoff. It should not be restored unchanged: historical image examples and validator images have different purposes from the current pinned node image.

### High: New contributor files required a missing PR template — fixed

- The template was already absent in `origin/fumadocs`; the new `CONTRIBUTE.md` and test made that absence a regression. `.github/pull_request_template.md` now exists with repository/branch links matching `content/vars.json`.
- The contributor guide was also corrected to describe the actual nonblocking Build job. The template test and full `pnpm test` suite pass.

### High: Quickstart image downgrade and staker behavior — fixed with corrected diagnosis

- The working tree had changed the quickstart image from Nitro `v3.11.4-7d5ac27` to the older `v3.9.4-7f582c3` and removed a base comment that disabled staking. The original review suggested restoring that guard.
- Verification changed the conclusion: the [Chain SDK's `prepareNodeConfig`](https://github.com/OffchainLabs/arbitrum-chain-sdk/blob/main/src/prepareNodeConfig.ts) enables the staker when supplied a validator key, and the guide promises to run a validator. [Nitro v3.11.4](https://github.com/OffchainLabs/nitro/releases/tag/v3.11.4) provides a `-validator` image with the local validation server needed for that setup. The quickstart now uses `v3.11.4-7d5ac27-validator` and explains the choice; it keeps staking enabled.
- The unsupported WIP Node.js v23+ prerequisite was restored to the base's v20+ requirement. SDK imports and all four code snippets were checked against the package versions installed by the guide. An onchain deployment was not run.

### High: Batch-poster guide reverted to deprecated sizing flags — fixed

- `content/docs/run-a-node/run-batch-poster.mdx` again uses `--node.batch-poster.max-calldata-batch-size` and separately explains `--node.da.anytrust.max-batch-size`. This matches the local CLI reference and the consolidated batch-poster configuration page.
- `run-a-node/sequencer/run-sequencer-node.mdx` contains older `max-size` examples already present in `origin/fumadocs`; they are outside this working-tree regression.

### Medium: Quickstart removed manual WETH retryable recovery — fixed

- The fallback is restored in `content/docs/launch-arbitrum-chain/quickstart/deploy-your-first-rollup.mdx`. Its new script obtains the chain ID from RPC, decodes the official [`RedeemScheduled` event](https://github.com/OffchainLabs/nitro-precompile-interfaces/blob/main/ArbRetryableTx.sol), and checks the separate execution receipt before reporting success.
- Verification caught and removed a draft use of `parseEventLogs`, which the guide's Chain SDK 0.28.0 / viem 1.21.4 dependency set does not export. Event decoding, imports, and snippet syntax passed locally. No live ticket was redeemed.

### Medium: Generated CLI reference printed a Go expression — fixed

- `scripts/lib/nitro-cli-flags.ts` now resolves the concatenated `strings.Join` help text. The regenerated `init.latest` row lists `archive`, `pruned`, and `genesis` rather than Go source.
- A fixture covers this expression. The generator tests pass (41/41), and `pnpm cli:check --nitro-path ../nitro` matches the local pinned Nitro tree.

## Additional Gate Fixes

- The TypeScript Prettier config had dropped the base branch's MDX override, causing 219 formatting failures. Restoring it reduced the failures to 107 files, all already modified in this working tree. Those files were formatted.
- Prettier corrupts MDX comments or adds trailing fences in a small set of pages. Their valid comments/fences were restored and the affected paths were added to `.prettierignore`; content lint, link validation, and the production build still cover them.
- `content/partials/CATALOG.md` and `content/partials/manifest.json` were regenerated after the content edits. The two whitespace errors noted in the initial review were fixed.

## Deletion Audit

- There are 82 tracked deletions relative to `fumadocs`. The deleted batch-poster and assertion pages have consolidated replacements and redirects. The state-history partial is incorporated into the full-node guide; the pattern guide is split into `CONTRIBUTE.md` and `STYLE-GUIDE.md`; the removed JPEG has an SVG replacement.
- Most deleted `.mjs` files have `.ts` replacements. One-off migration and upstream comparison scripts appear intentionally retired; no active references to them were found. `LANDING.md`, `MIGRATION-FINDINGS.md`, and `RESYNC.md` are migration notes, not routed pages. The quickstart recovery path was the reader-facing deletion found and has been restored.
- Formatting touched 107 files already changed by the migration. The extra edits are formatting only; unchanged base files were not reformatted.

## Validation

- Passing: `pnpm test` (606 total, 600 passed, 6 skipped), `pnpm build` (1,071 static pages), `pnpm types:check`, `pnpm format:check`, `pnpm content:lint`, `pnpm check-links`, `pnpm vars:check`, `pnpm nav:check`, `pnpm partials:check`, `pnpm references:check`, `pnpm faq:check`, `pnpm contracts:check`, `pnpm images:presence`, and `git diff --check origin/fumadocs`.
- `pnpm partials:check` passes with 211 nonblocking warnings. The build warns that three versioned-document files or their live counterparts differ from the archive registry; this is advisory and should be reviewed when the migration is committed.
- Local Node is v26 while `package.json` requests v22.18–22.x. The commands above passed despite that engine warning.
- The HTTP suite's six tests skip without a running server. A deployed redirect check, Vercel cache validation, and onchain quickstart execution remain untested.
