# Code Review, Round 3: `fionna/fumadocs-migration`

## Context

- Review target: the current working tree on `fionna/fumadocs-migration`.
- Base branch: freshly fetched `origin/fumadocs` at `0afea2181d1b73cd7fe443f492c05daab953d5e6`, following the requested comparison base.
- Comparison: `HEAD` equals the base commit. The migration consists of uncommitted tracked changes and untracked files, all included in this review. The tracked diff has 390 changed files.
- PR: `gh pr view` found no PR for this branch, so no PR description or URL was available.
- PR intent summary: inferred from the working tree and earlier review rounds as a Fumadocs migration that preserves documentation content and existing site behavior while porting routing, analytics, and tooling.

## Verdict

No release-blocking regression was found in this pass. At review time, two medium-severity analytics discrepancies remained: one Markdown fetch was omitted, and some HTML responses were counted as Markdown fetches. Both are fixed and verified below.

## Findings

### Medium: Count direct `/docs.md` fetches

- Location: `lib/llms-tracking.ts:101-114`; the route is declared in `next.config.ts:43`.
- Issue: `/docs.md` is a public rewrite to the docs-index Markdown mirror, but `pathInfo('/docs.md', '')` returns `ignored`. The `.md` branch accepts only `/docs/` descendants and mirror paths. Negotiated `/docs` and the direct mirror both normalize to `/docs.md`, making the direct public URL the missing request shape.
- Impact: Production `llms_file_fetched` analytics undercount docs-index Markdown reads made through the explicit `.md` URL. The existing test checks the index mirror and negotiated index, but not the direct URL.
- Recommendation: Recognize `${DOCS_ROUTE}.md` in the direct-Markdown branch and add a test asserting that the direct, mirror, and negotiated index requests share `/docs.md` as their tracked path.

### Medium: Match the router's weighted Accept negotiation before tracking

- Location: `lib/llms-tracking.ts:127-132`; the response decision uses `isMarkdownPreferred(request)` in `proxy.ts:240`.
- Issue: `pathInfo` treats any Accept header containing `text/markdown` as a Markdown request, while the router honors media-type quality weights. For `Accept: text/html;q=1, text/markdown;q=0`, the router chooses HTML but `pathInfo` returns `markdown-negotiate`. The same mismatch occurs with `text/html, text/markdown;q=0.1`.
- Impact: Production emits `llms_file_fetched` events for requests that received HTML. This inflates Markdown-read and bot-read counts and can distort comparisons with the previous site.
- Recommendation: Pass the router's `isMarkdownPreferred` result into the tracker, or share one negotiation function between both paths. Add tests for zero, lower, and higher Markdown quality weights.

## Test Expectations

- Branch intent: a documentation-platform migration with behavior changes in routing, analytics, search, and operational documentation.
- Expected tests: unit coverage for tracking classification, built-site HTTP coverage for Markdown routes and negotiation, and the existing build/content checks.
- Tests added or changed: the working tree adds `scripts/lib/llms-tracking.test.ts` and `scripts/static-docs-http.test.ts`; the latter was enabled in CI during the prior fix round.
- Gaps: the tracking unit tests omit direct `/docs.md` and weighted Accept headers. The built-site HTTP suite checks responses but does not assert emitted PostHog events.

## Unexpected Changes

- No additional unexplained deletion or content loss was identified in this pass. The v1 archive edit to `build-nitro-locally.mdx` changes link placement and explanatory prose without changing its build commands.
- The analytics mismatches above are behavior changes within the intended migration scope.

## Validation

- Commands run: `git fetch origin fumadocs`, `gh pr view --json title,body,baseRefName,headRefName,url`, `git status --short`, `git diff --shortstat origin/fumadocs`, `git diff --check origin/fumadocs`, `node --test scripts/lib/llms-tracking.test.ts`, and a direct Node comparison of `isMarkdownPreferred` with `pathInfo` for three weighted Accept headers and `/docs.md`.
- Results: fetch succeeded; no PR exists; `HEAD` and `origin/fumadocs` both equal `0afea218`; `git diff --check` passed; all 52 tracking tests passed. The direct comparison reproduced both findings: the router rejects Markdown for zero and lower Markdown quality while tracking classifies those requests as `markdown-negotiate`, and `/docs.md` is classified as `ignored`.
- Not run in this read-only pass: a new full build or complete test suite. The previous fix round reported a successful build, static checks, and 32/32 built-site HTTP assertions on this working tree. Production PostHog capture and deployed edge caching remain unverified.

## Notes

- This review follows the requested `fumadocs` base even though the review skill normally selects the repository default branch.
- Earlier review files record prior findings and their fixes. The findings above record the state at the time of this third pass; the fixes below were made afterward.

## Fix verification

- Verified the direct `/docs.md` rewrite exists and that `pathInfo` previously classified it as `ignored`. The tracker now recognizes it as a direct Markdown page. A regression test checks that direct, mirror, and negotiated docs-index requests all use `/docs.md` as their tracked path.
- Verified that `isMarkdownPreferred` chooses HTML for zero or lower Markdown quality while the previous tracker classified those headers as Markdown. The proxy now calculates the preference once and passes that same boolean to the tracker and routing logic. Tests cover zero, lower, and higher Markdown quality, plus `text/plain`, which the router also accepts as Markdown.
- Added built-site HTTP assertions for weighted Accept headers and the direct `/docs.md` route.
- Passed: `pnpm types:check`, `pnpm test` (603 passed, 6 built-site tests skipped without a running server), `pnpm build` (1,071 static pages), focused Prettier check, and `git diff --check origin/fumadocs`.
- Passed against the new production build with `next start`: `STATIC_DOCS_TEST_URL=http://127.0.0.1:3000 node --test scripts/static-docs-http.test.ts` (34/34, no skips).
- Production PostHog capture and deployed edge caching were not exercised. Local Node is v26, while the project specifies v22; the checks above passed.
