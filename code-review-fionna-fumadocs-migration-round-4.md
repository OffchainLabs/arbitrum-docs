# Code Review, Round 4: `fionna/fumadocs-migration`

## Context

- Review target: the current working tree on `fionna/fumadocs-migration`.
- Base branch: freshly fetched `origin/fumadocs` at `0afea2181d1b73cd7fe443f492c05daab953d5e6`, as requested in earlier rounds.
- Comparison: `HEAD` still equals the base commit. The migration is uncommitted, so this pass includes tracked changes and relevant untracked files; the tracked diff has 390 changed files.
- PR: `gh pr view` found no PR for this branch. No PR title, description, base, or URL was available.
- PR intent summary: inferred from the working tree and earlier review rounds as a Fumadocs migration that ports existing documentation and site behavior while updating routing, analytics, and tooling.

## Verdict

One medium-severity content regression remains: a changed verification guide points at an image that is not in the repository. I found no new issue in the routing and analytics fixes from round three.

## Findings

### Medium: Restore the verification screenshot or add its new asset

- Location: `content/docs/stylus/cli-tools/verify-contracts.mdx:198`.
- Issue: The branch changes the “already verified contract” screenshot from `/img/stylus-arbiscan-verification-5.png` to `/img/stylus/already-verified.webp`, but `public/img/stylus/already-verified.webp` does not exist. The old PNG still exists in both the base and working tree.
- Impact: The guide renders a broken image at the step where readers are meant to recognize the successful verification state. `ImageZoom` uses a plain `<img>`, so the missing asset is not caught by the Next build. The default content lint also excludes its A7 local-image rule.
- Recommendation: Restore the existing PNG reference, or add the intended `.webp` asset. Then run `node scripts/content-lint.ts --rule=A7` and verify this new finding is gone. The two other A7 findings are inherited from `fumadocs` and need separate cleanup before A7 can become a blocking gate.

## Test Expectations

- Branch intent: a documentation-platform migration with user-visible routes, analytics, and content changes.
- Expected tests: unit and built-site route checks, link and content lint, and a check that referenced local images exist.
- Tests added or changed: earlier rounds added tracking and built-site HTTP coverage; the current tree also has structural content lint and link checks.
- Gaps: the default content lint excludes A7, so a newly broken `ImageZoom` source passes the existing CI gates. The prior built-site HTTP suite does not fetch images embedded in guide pages.

## Unexpected Changes

- The verification guide replaces a working image path with an absent asset; this is unrelated to the platform migration's rendering needs.
- The other two missing `ImageZoom` assets reported by A7 were already referenced in `origin/fumadocs` and are not new branch regressions.

## Validation

- Commands run: `git fetch origin fumadocs`, `gh pr view --json title,body,baseRefName,headRefName,url`, `git status --short`, targeted `git diff` and `git show` comparisons with `origin/fumadocs`, `node --test scripts/versions-routing.test.ts scripts/redirects-check.test.ts`, `pnpm check-links`, `pnpm content:lint`, `node scripts/content-lint.ts --rule=A7`, and `git diff --check origin/fumadocs`.
- Results: fetch succeeded; no PR exists; `HEAD` and `origin/fumadocs` both equal `0afea218`; 14 focused tests passed; link check, default content lint, and diff whitespace check passed. The opt-in A7 rule failed with three missing images; comparison with the base identified one newly introduced reference and two inherited references.
- Not run in this read-only pass: a new full build or complete test suite. The immediately preceding fix turn passed `pnpm build`, `pnpm types:check`, `pnpm test`, and the built-site HTTP suite (34/34) on the same implementation tree. The deployed Vercel edge cache and production PostHog capture remain unverified.

## Notes

- This review uses the requested `fumadocs` base despite the review skill's default-branch convention.
- Earlier review files record previous findings and their fixes. This file contains new findings from the fourth pass only.
