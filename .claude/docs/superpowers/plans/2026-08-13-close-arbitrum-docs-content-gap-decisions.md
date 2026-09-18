# SDD ledger — plan: .claude/docs/superpowers/plans/2026-08-13-close-arbitrum-docs-content-gap.md

Spec: `.claude/docs/superpowers/specs/2026-08-13-arbitrum-docs-content-gap.md` (reachable — rulings are binding, not provisional)

## Setup

- Worktree: `/Users/allup/OCL/Fumadocs-test/.claude/worktrees/close-content-gap`, branch `worktree-close-content-gap`, based on `origin/main` @ `2656727` (verified identical to local `main`).
- Spec + plan were untracked on `main`; copied into the worktree and committed as `0249690`.
- `pnpm install` clean. `pnpm types:check` passes at baseline.

## Baseline (recorded before any task)

- `pnpm types:check` — PASSES
- `pnpm check-links` — **FAILS: 112 broken internal links pre-existing.** Breakdown:
  - 10 asset links (`/img/*.svg`, `/img/*.png`) — **false positives**: verified `public/img/stylus-wasm-deploy.svg` exists on disk. `check-links` validates against content files only, not `public/`.
  - ~100 `audit-reports/*.pdf` relative links from `content/docs/en/audit-reports.mdx` and `stylus/reference/overview.mdx` — **real breakage**. Tree A serves these from `docs/hosted-pdfs/`; no `hosted-pdfs` directory exists anywhere in Tree B.
  - 1 raw `.mdx` path link, 1 `run-full-node-with-helm` (the known dangling link from the spec).

## Preflight conflict scan

One row per task pair sharing a file or interface, plus one row per task for self-consistency.

| Rows checked | Finding |
|---|---|
| T1 ↔ T3 — both modify `package.json` scripts block | OK. T3 explicitly inserts after T1's `nav:check` line. Sequential, no overlap. |
| T2 ↔ T5 — both modify `run-a-node/run-full-node.mdx:20` | OK by design. T2 removes the dangling link; T5 Step 6 restores it once the target exists. Documented in both tasks. |
| T2 ↔ T6 — both list `notices/arbos61-upgrade-notice.mdx` | OK. T6's file list marks it "already done in Task 2, skip". |
| T5 ↔ T6 — both modify `run-a-node/run-full-node.mdx` | OK. T5 touches line 20 (link); T6 restores the "Choose a state scheme" section. Disjoint edits, T5 runs first. |
| T1 ↔ T5/T7 — new pages added to metas T1 repaired | OK. T1 appends `"..."` to every repaired `pages` array, so a page added later is visible even if its meta entry is forgotten. |
| T3 ↔ T5/T6/T7 — drift script used as the verification gate | **DEFECT — see Ruling 2.** |
| T1 self-consistency — tests vs implementation | OK. Executed against the real tree during planning; expectations (13 dirs / 48 hidden) are measured, not estimated. |
| T3 self-consistency — tests vs implementation vs Step 7 calibration | **DEFECT — see Ruling 2.** |
| T4, T5, T7, T8 self-consistency | OK. No task creates a file another task also creates. |

## Rulings

**Ruling 1: `check-links` gate is a regression gate, not an absolute one.**
The plan's Task 1 Step 10 ("Expected: 1 broken link") and Task 2 Step 3 ("Expected: no broken internal links") assume a clean baseline. The real baseline is 112 broken links. Fixing them is not in this plan's scope — it is separate pre-existing breakage (missing `hosted-pdfs/` PDFs) plus a `check-links` blind spot for `public/` assets.
Decision: snapshot the baseline to `.superpowers/sdd/<plan>/baseline-links.json` and gate every task on **no NEW broken links relative to baseline**, not on zero.
Cost if wrong: the ~100 missing audit PDFs stay broken. They are already broken today, and this ledger records them, so nothing is lost silently. Flagged to the human at finish.

**Ruling 2: Task 3's drift script needs an explicit rename map.**
`upstream-drift.mjs` pairs pages by normalized *slug*. Several known migration renames change the filename itself, so slug matching cannot pair them:
`operate/monitoring.mdx`→`monitoring-tools-and-considerations.mdx`; `operate/ownership-and-access.mdx`→`ownership-access-control.mdx`; `overview/introduction.mdx`→`a-gentle-introduction.mdx`; `chain-config/sequencer/sequencer-timing-adjustments.mdx`→`configuration/sequencer/config-sequencer-timing-adjustments.mdx`.
As written, the script would report all of these as ABSENT and could never emit the GUTTED verdict Step 7 uses as its calibration check — so the plan's own acceptance criterion is unreachable.
Decision: add a `RENAME_MAP` (Tree A relative path → Tree B relative path) applied before slug lookup, with a test covering one entry, and correct Step 7's expected output. Amending the plan text before Task 3's brief is extracted.
Cost if wrong: a handful of renamed pages are reported ABSENT rather than GUTTED. Both verdicts surface the same page for the same work, so the worst case is a mislabeled report, not a missed gap.

## Task log

Task 1: complete (commits c09d590..5404c76, review clean — spec ✅, quality Approved, 0 Critical/Important)
  Verified independently by reviewer: 13 dirs/48 hidden at base, 0 defects at head, links 112->112 (0 new), tests 6/6 pristine.
Task 1: minor (deferred): nav.mjs checkTree JSON.parse unguarded — malformed meta.json throws SyntaxError with no file path. Plan-mandated (brief's own code).
Task 1: minor (deferred): nav.mjs ghosts filter skips entries containing "/", so a broken cross-directory reference is never flagged. Plan-mandated.
Task 1: minor (deferred): titles invented for configuration/{core,costs,data-availability,sequencer} — no canonical source; worth a content-owner glance.
Task 1: ⚠️ open: content/docs/{zh-CN,ja} were not checked for the same navigation defect class. Out of scope (en only) but the defect class is not closed repo-wide until checked.
Task 1: Ruling: the repaired meta.json sidebar titles now disagree with the still-stale index.mdx frontmatter titles in operate/ and all 6 configuration/* dirs ("Operate your chain" vs "Validation and security"). Real and user-visible, but outside Task 1's declared meta.json-only scope. Folding it into Task 8 rather than reopening Task 1 — it is the same class of copy-paste damage Task 8 already cleans up. Cost if wrong: sidebar label and page H1 disagree for 7 pages until Task 8 lands.

Task 2: complete (commit 8e26c5b, review clean — spec ✅, quality Approved, 0 Critical/Important)
  Reviewer independently re-ran the link regression check: 112 -> 111, 0 new, removed entry is exactly the Helm link. Content fidelity vs Tree A checked line-for-line.
Task 2: minor (deferred): run-full-node.mdx:18 admonition title ("Running on Kubernetes...?") no longer matches its body until Task 5 restores the Helm sentence. Transient by design.
Task 2: minor (deferred): arbos61 notice table column padding differs cosmetically from Tree A. Renders identically.
Task 2: Ruling: implementer dropped Tree A's "Compliance filtering" link because no such page exists here yet; linking it would have added a new broken link. Upheld — same precedent as the mandated Helm-link removal. Carried into Task 7: when compliance-filtering.mdx is ported, restore that link in arbos61-upgrade-notice.mdx. Cost if wrong: one cross-reference missing from the notice until Task 7 lands.

Task 3: fix round 1/5 dispatched — 1 Important (missing regression test for the bodyLineCount trailing-newline fix). Minors deliberately not fixed.
Task 3: Ruling: the implementer deviated from brief-verbatim bodyLineCount, popping a trailing empty element before counting. Upheld. Reviewer independently verified the arithmetic against the real files (176 lines, frontmatter closes at 9 -> 167; 42 -> 33) and confirmed it is a real bug in MY plan's code, invisible to the brief's own fixtures because none end in a newline. Adjusting the code rather than the expected numbers is what the brief itself instructs. Cost if wrong: every GUTTED line count would be off by one — cosmetic, no classification changes.
Task 3: ⚠️ open (SCOPING RISK for Tasks 5-7): the real run reports 53 ABSENT (12 DRIFT, 41 MISS) and 11 GUTTED, far more than the spec's curated 10 drift / 5 absent / 10 gutted. Cause: RENAME_MAP covers only 4 of roughly 34 known migration renames, so pages my analysis already classified as RENAMED or MERGED still surface as ABSENT.
Task 3: Ruling: Tasks 5, 6 and 7 port the SPEC's curated lists, not the raw drift report. The report is a cross-check for items that should disappear, never the work list. Blindly porting all 53 would re-create pages that already exist under different names. Before `pnpm drift` can be trusted as a standalone weekly work list, RENAME_MAP must be completed for the remaining renames — deferred to a follow-up, flagged to the human at finish. Cost if wrong: an implementer takes the report literally and duplicates ~30 existing pages; mitigated by stating the curated list explicitly in each dispatch.
Task 3: fix round 1/5 (1 addressed, 0 open — regression test for bodyLineCount trailing newline; commits 426adb5..e5440e4)
Task 3: complete (commits 8e26c5b..e5440e4, review clean — 7/7 tests, RED verified by reverting the fix, calibration exact)
Task 3: minor (deferred): DEFAULT_TREE_A is a machine-specific absolute path; script cannot run in CI without --tree-a. Plan-mandated.
Task 3: minor (deferred): unguarded readFileSync in the comparison loop; an unreadable file crashes the run rather than reporting one finding.
Task 3: minor (deferred): edge cases untested — empty file, unterminated frontmatter.
Task 4: fix round 1/5 dispatched — 1 Important (render verification was inferred from the compiled collection and a running server, not from rendered output). No code change expected; evidence only.
Task 4: fix round 1/5 (0 addressed, 1 open — implementer claimed rendered HTML was unobservable "due to Next.js client-side rendering" and reasoned from the compiled collection instead; no commit)
Task 4: Ruling: that claim is false and I verified it myself before escalating. components/mdx/ReferenceList.tsx has no 'use client' directive, so it is a server component and renders into the initial HTML. Two earlier implementers already scraped rendered HTML on this same site (Task 1 sidebar hrefs, Task 2 notice body). Dispatched round 2 with the correction rather than accepting the inference. Cost if wrong: one extra fix round on a task whose file content was already verified correct.
Task 4: fix round 2/5 (1 addressed, 0 open — rendered HTML confirmed: <section id="forwarder" class="reference-list__item"><h3 class="reference-list__term">Forwarder</h3>, correct alphabetical neighbours; no commit, evidence only)
Task 4: Ruling: no scoped re-review dispatched for round 2. The round changed no code, so the diff is empty and a reviewer would have nothing to read. The finding was evidentiary, and the evidence is now self-verifying rendered markup carrying the component's own reference-list__item class — distinguishable from the embedded search-index blob that a bare grep would have matched. Accepted directly. Cost if wrong: a fabricated HTML quote would go unchallenged; judged low since the class name matches components/mdx/ReferenceList.tsx.
Task 4: complete (commit 6782925, review clean after 2 fix rounds)

Task 5: implementer returned DONE_WITH_CONCERNS (commits 6782925..8d7a0f0: 5 page ports + Helm link restore). Links 111->111, drift ABSENT 53->48 (exactly -5), all five pages verified from served markup.
Task 5: Ruling: chainConfig-reference.mdx has no author/sme in the legacy source; implementer used gblanchemain following the sibling additional-configuration-parameters.mdx precedent from the same legacy directory. Upheld — following a disclosed in-repo precedent beats inventing a name. Cost if wrong: one page attributed to the wrong SME; trivially correctable and flagged in the report.
Task 5: Ruling: MY dispatch brief wrongly listed type="caution" as a valid VanillaAdmonition variant. Verified components/mdx/VanillaAdmonition/index.tsx:6 — AdmonitionType is 'note' | 'tip' | 'info' | 'warning' | 'danger'; there is no 'caution', so it renders unstyled. Sent a correction to fix the 2 instances in the newly ported pages only, mapping caution -> warning (or danger where the text describes irreversible loss). Cost if wrong: an admonition carries slightly the wrong severity colour.
Task 5: deferred (PRE-EXISTING, flag to human at finish): 6 pages elsewhere in content/docs/en use type="caution" and therefore render unstyled admonitions. Not introduced by this branch; out of scope here.
Task 5: fix round 1/5 (1 addressed, 0 open — 5 caution admonitions remapped to warning/danger; commits 8d7a0f0..81ac033)
Task 5: complete (commits 6782925..81ac033, review clean — spec ✅, quality Approved, 0 Critical/Important)
  Reviewer verified content fidelity line-for-line against all 5 legacy sources, checked all 8 rewritten links resolve including anchors, and confirmed 111->111 links, nav clean, drift ABSENT 53->48.
Task 5: minor (deferred): bp-recovery.mdx is content_type reference but ends with an imperative cheat-sheet; mirrors the legacy classification.
Task 5: deferred (flag to human at finish): public/img/bp-recovery.png is 2.3 MB, copied unmodified — wants an image-optimization pass.

Task 6: all 9 pages restored (commits 81ac033..52ef001). Links 111->79 — verified by reviewer as legitimate: 0 of the 79 are in the 9 touched files, and the fixes are genuinely-dead chain-config/*.md paths on pages already being edited. No scope creep beyond the work list.
Task 6: Ruling: the brief said "do not fix pre-existing broken links", and the implementer fixed 32 while restoring content. Upheld as within scope — every fix was inside a file this task was already rewriting, which is fixing what you touch, not ranging beyond the work list. Reviewer confirmed no link was repointed to a wrong target merely to satisfy the checker. Cost if wrong: none identified; the repo has 32 fewer broken links.
Task 6: Ruling: the brief's table gave batch-poster-troubleshooting.mdx under operate/; its real path is configuration/sequencer/. The implementer used the real path. Upheld — reviewer confirmed only one such file exists on disk and its legacy line count matches the brief's stated 0.39 ratio, so the brief's table was stale, not the implementer.
Task 6: fix round 1/5 dispatched — 3 Important:
  (a) REGRESSION: working <Term id="..."> glossary components replaced in-place with inert <a data-quicklook-from="..."> legacy markup on config-sequencer-timing-adjustments.mdx and ownership-access-control.mdx. data-quicklook-from has no runtime handler here.
  (b) Compliance skip on a-gentle-introduction.mdx half-justified — the second subsection's link target (cli-flags-reference.mdx) does exist; protocol-level sanctioned-address filtering is currently undocumented repo-wide.
  (c) "How the time window is enforced" skip not covered by the cited page — Nitro source (arbstate/inbox.go:370-373) shows out-of-window messages are clamped, not rejected; neither page states this.
Task 6: deferred (minor): newly restored prose introduces fresh data-quicklook-from tags rather than <Term>; both patterns already coexist in 50+ repo files.
Task 6: fix round 1/5 (3 addressed, 0 open — Term regression swept across all 9 files finding 9 instances in 3 files; Compliance both subsections restored; clamp behaviour restored with cross-link; commit 304ee2c)
Task 6: complete (commits 81ac033..304ee2c, review clean after 1 fix round)
  Re-reviewer verified all 14 restored <Term id> values resolve to real files under content/glossary/, confirmed the other 6 touched files had zero pre-existing <Term> usage at base, and checked the clamp wording against both the legacy source and Nitro's actual behaviour.

Task 7: complete (commits 304ee2c..cfb928c, 11 commits / 10 pages, review clean — spec ✅, quality Approved, 0 Critical/Important)
  Reviewer verified all ~55 <Term id> values resolve to real glossary files, 0 surviving data-quicklook-from, 0 surviving caution, both compliance-filtering links live.
Task 7: ⚠️ RESOLVED by controller: reviewer could not re-run the numeric gates, so I ran them myself — types:check exit 0, broken links 79 (unchanged), nav-check clean, partials-check pass.
Task 7: Ruling: implementer kept BOTH finality.mdx (two-level soft/hard model) and the new finality-and-reorgs.mdx (three RPC-visible levels) rather than replacing. Upheld — reviewer read both and found no contradiction: the new page's own tip box reconciles them ("Hard finality—the safe and finalized tags—is inherited from the parent chain"), so the three levels are a refinement of the two, not a competing claim. Cost if wrong: readers meet two finality framings; mitigated by the bidirectional cross-links.
Task 7: NEW UPSTREAM DRIFT FOUND (not ported, for the human to schedule): 5 pages added upstream after this plan was written — 3 Timeboost/PGA pages (2026-07-29) and 2 extend-the-protocol pages (2026-08-03). This is the drift detector doing its job on its first real run.
Task 7: minor (deferred): withdrawal-monitoring.mdx and bridge-transaction-traceability.mdx both carry near-identical ethers boilerplate for querying Rollup/Outbox state; candidate for a shared partial.
Task 7: carried into Task 8: a-gentle-introduction.mdx (and possibly others) retain .mdx-suffixed absolute links like /docs/run-a-node/nitro/cli-flags-reference.mdx — check-links accepts them because the file resolves, but the route likely 404s at runtime. Needs investigation, not an assumed fix.

Task 8: complete (commits cfb928c..ed26ee4, 6 commits / 6 items, review clean — spec ✅, quality Approved, 0 Critical/Important)
  pnpm build SUCCEEDED (exit 0). types:check, check-links (79, unchanged), partials-check, nav-check, references-check all pass. drift exits 1 as expected (40 absent, 7 gutted).
Task 8: Ruling: item 1 partially refused — only the Supra VRF card was added. Upheld. Reviewer traced it into the legacy tree: no pyth/ or quex/ directories exist in EITHER repo; the legacy oracles-content-map.mdx references cards for pages that were never authored. My spec's premise was wrong. Adding cards pointing at nonexistent pages would have created broken links.
Task 8: ⚠️ RESOLVED by controller (item 6's 404 evidence): I re-ran it myself and initially measured 200 — because a stray legacy DOCUSAURUS dev server holds [::1]:3000 while the Fumadocs server binds *:3000, so `localhost` (which resolves ::1 first) reaches the wrong app. Against 127.0.0.1:3000 the .mdx-suffixed URL returns 404, confirming the implementer's finding and justifying the 90-occurrence edit. The paired plain-URL 200 could not be recaptured before the dev process exited; corroborated instead by pnpm build compiling all routes and check-links holding at 79.
Task 8: minor (deferred, for final review to triage): roughly 30 `.mdx#anchor)` links across ~20 files carry the identical runtime-404 defect. The brief's grep pattern did not cover the anchored form. Fix pattern is already proven.

FINAL REVIEW (whole branch 2656727..ed26ee4, 42 commits): "Ready to merge after fixes". One must-fix.
Final: Ruling: promoting TWO items into the single fix wave.
  (1) The reviewer's must-fix: 10 branch-introduced `.mdx#anchor` links that resolve to a 404 page. Task 8's grep covered plain `.mdx)` but not the anchored form, leaving the sweep visibly half-applied inside a single file (arbitrum-chain-finality.mdx:12 fixed, :16 not). Fix pattern already proven on this branch.
  (2) The reviewer filed as follow-up #1, but I am promoting it: upstream-drift.mjs:67 keys bIndex on bare slug alone, so the last file walked wins. 43 files normalize to "index", 8 to "overview"; 26 of 279 legacy pages (9%) pair against an arbitrary sibling, producing visibly wrong output (BoLD gentle-introduction compared against Stylus gentle-introduction). The user's stated requirement for this branch was ongoing sync between two live trees — a detector that mispairs 9% of pages does not meet it. Small fix: key on mapped directory + slug.
  Cost if wrong: (1) is mechanical and low-risk; (2) risks touching working code late, mitigated by its existing test suite.
