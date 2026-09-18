# Migration continuity: findings from the test bench

> **What this is.** `docs-migration-destination` is a staging repo used to test assumptions and build
> tooling for the real migration of [`OffchainLabs/arbitrum-docs`](https://github.com/OffchainLabs/arbitrum-docs)
> off Docusaurus onto Fumadocs. Nothing here is production. This document records what was measured,
> what worked, and what the real migration should do differently.
>
> Measured 2026-09-15 against arbitrum-docs `master` @ `6a2738fba` (13,038 commits, 2022-07-19 →
> 2026-09-15) and this repo's `main` @ `0b3a5731` (211 commits).

## The headline

**Git blame can be carried across the Docusaurus → Fumadocs migration, and this repo's import
destroyed it unnecessarily.** Reconstructing the import recovers original authorship on **72.67% of
all content lines** (78.64% of lines in pages that have a legacy origin), up from **0%** today.

The rule is one sentence: **move files in their own commit, with no content change.**

---

## 1. Why blame was lost, and why it was not squash-merging

This repo began as a fresh `git init` — root commit `b378b3d`, 2026-05-22, 346 files — and content
arrived across ~10 later "wave" commits. Git had no predecessor to trace to, so every one of the 431
content files was recorded as an **addition**, not a rename.

Squash-merging was investigated and **cleared**:

- 516 renames are correctly detected inside this repo's own history.
- `arbchain-restructure-pt1` records 19 renames vs 2 adds — restructures preserved lineage fine.
- The one commit that shows 53 adds and 0 renames is Wave 3 (`2b4dab9`), the *import* commit. The
  legacy files were never in the tree to be renamed from.

The loss is structural and happens exactly once, at import.

## 2. The mechanism

Git does not store renames; it infers them per-commit-diff. Crucially, **exact renames are matched
in a hash-equality pass that runs before the similarity pass**, so a byte-identical move is detected
with certainty and `diff.renameLimit` never applies to it. Tuning rename limits is not the lever.

The lever is commit structure:

| | Commit | Why |
|---|---|---|
| S | Scaffold | Adds the Next.js/Fumadocs app files. Must not create anything under `content/`, so the move commit's diff is unambiguously rename-only. |
| **M** | **Move** | `git mv` every legacy file to its new path, **byte-identical**. 591 renames, zero content change. This is the commit that does the work. |
| D | Delete | Remove the Docusaurus scaffold. After M, so rename sources are not orphaned. |
| T1–T5 | Transforms | One commit per mechanical transform class: frontmatter, links, `<Term>`, admonitions, includes/vars. |
| E | Editorial delta | Everything else. Forces the tree to equal the target exactly. |
| G | Blame ignore | Writes `.git-blame-ignore-revs` listing T1–T5. |

Build M with plumbing, never through a checkout:

```bash
git read-tree <parent>
git update-index --index-info   # mode<TAB>oid<TAB>stage<TAB>newpath, reusing the ORIGINAL blob OID
git update-index --force-remove -- <oldpath>
git commit-tree ...
```

Round-tripping content through the worktree exposes it to `core.autocrlf`, `.gitattributes` and LFS
smudge filters. Any of those mutates the blob, the OID changes, exact-rename matching fails, and the
entire exercise silently produces nothing. Neither repo currently has a `.gitattributes`; this repo
*does* have an active LFS filter in `.git/config` that matches no path. **Do not add a
`.gitattributes` before the move commit.**

### Gate the move commit before going further

```bash
git show --numstat --format='' <M> | awk '($1+0)!=0 || ($2+0)!=0' | wc -l   # must be 0
git show --name-status -M --find-renames=100% <M> | grep -c '^R100'         # must equal map size
```

Binary files report `- -` in numstat rather than `0 0`; that is expected and not a failure.

## 3. `.git-blame-ignore-revs` — useful, but not the mechanism

A repo-root `.git-blame-ignore-revs` listing the transform commits is honored by `git blame`, by
GitLens, and by GitHub's web blame UI. Lines whose only change came from an ignored commit are
attributed to the previous commit that touched them.

**Measured contribution: +2.45 points.** It is a finishing touch, not the mechanism — the move commit
does essentially all the work. Plan accordingly; do not build a migration around this expecting a
step change.

**The purity rule: ignore commits that changed form, never substance.** A transform commit must be
mechanically pure to be safely ignorable. If an editorial judgement leaks into one, the attribution
it produces becomes a lie. Anything that cannot be done purely mechanically belongs in the editorial
commit instead. Two consequences observed in practice:

- `:::caution` was **not** retyped to `warning` inside a transform commit, because the target mapping
  was not uniform. It cost ~70 lines of attribution and was the right trade.
- Four files whose admonition markers do not balance in the legacy source were left untransformed
  rather than guessed at.

## 4. Measured results

Full population, all 61,416 lines across all 339 `content/docs/**/*.mdx` pages — not a sample:

| Scope | Baseline (`main`) | Reconstructed | + ignore-revs |
|---|---|---|---|
| All 339 pages | 0.00% | **72.67%** | 75.12% |
| The 273 with a legacy origin | 0.00% | **78.64%** | 81.29% |

The gap between rows is the 66 orphan pages that have no arbitrum-docs ancestor and score 0% by
definition.

Other verified outcomes:

- `--follow` reaches **2022-12-07** on `content/docs/arbitrum-bridge/quickstart.mdx` (92 commits) and
  2023-03-30 on both FAQ pages.
- The editorial commit's tree is **byte-identical** to the target tree (`900cf046`), proving the
  reconstruction introduced no corruption. This is the gate that can fail silently; treat it as
  mandatory.
- 13,048 commits reachable from the reconstructed branch.

### Caveats to set expectations with

- **GitHub's web blame does not follow renames.** Crossing the rename boundary on github.com is a
  click-through ("View blame prior to this change") per file. The CLI and editor integrations do
  follow it. File *history* on GitHub does follow renames.
- **Repo size:** legacy pack 515 MiB + this repo 198 MiB ≈ 690–710 MiB after `gc`. There are zero
  shared md/mdx blobs, so dedup is minimal. Prefer `--filter=blob:none` in CI over `git filter-repo`,
  which would rewrite every SHA and destroy the correspondence to arbitrum-docs that makes the blame
  meaningful in the first place.

## 5. Path mapping

`scripts/lib/tree-compare.mjs` resolves legacy paths to current ones. Coverage was extended from 54%
to **92.1%** (591 of 642 files), with **zero duplicate destinations** — a `git mv` map must be
injective, so a collision is a correctness bug rather than a coverage gap. `pnpm tree:map` reports
coverage, collisions, unmapped files, and orphans; it exits non-zero on any collision.

Four genuine doc-vs-doc collisions were resolved by content-similarity comparison. Seven apparent
collisions dissolved once glossary terms were routed to their own namespace rather than forced
through the docs index.

**Known weakness:** the resolver's bare-slug fallback can mispair when a slug is unique but the
semantic target is elsewhere. It sent `launch-arbitrum-chain/extend-the-protocol/stf.mdx` to
`how-arbitrum-works/deep-dives/stf.mdx`. A silent mismap survives every gate in the repo, so every
synthesized destination must be human-reviewed.

## 6. PR replay

See `scripts/replay-prs.mjs` (`pnpm pr:replay`). Eleven upstream PRs were run end to end; six opened as
drafts (this repo's #3–#8).

| Wave | clean | partial | declined |
|---|---|---|---|
| 1 (#2644, #3536, #3500, #3561, #3563) | 2 | 2 | 1 |
| 2 (#3538, #3564, #3533, #3472) | 0 | 2 | 2 |
| 3 (#3569, #3573) | — | — | 2 — **the correct outcome** |

**CI matched the local gates exactly** — same three failures, same three passes, same counts, PR for PR.

### Two traps worth carrying forward

**A signed commit can never be SHA-stable.** The first idempotency re-run force-pushed all six
branches with new SHAs despite byte-identical trees. Two causes stacked: the commit timestamp, and —
after pinning that — the GPG signature nonce. **Key idempotency on the tree OID, not the commit SHA.**
Only the re-run caught this; a single run looks perfectly correct.

**Conflict markers pass every gate.** `types:check` validates frontmatter, not MDX bodies, so a branch
containing `<<<<<<<` goes green through the whole blocking `Gates` job. This repo's #8 is Gates-green
with 7 conflict hunks in it. Add a marker grep to `content:lint` or to `Gates`.

### Judging the tool

A "2 of 5 clean" rate reads like failure and is not. #3536 was declined because the legacy page is 293
lines and this one is 125 on a different premise — declining is correct. #2644 conflicts because that
page diverged 43.8% — a conflict is the honest answer. Three of the four gate failures are real
content gaps in this repo (section 7), not tool defects.

**The metric that actually matters is zero silent mismaps**, and it held across both waves. Every
destination is recorded and hand-checkable. A wrong-path write passes every gate in the repo, so it is
the only failure class nothing downstream catches.

### Pre-existing breakage this surfaced

The non-blocking `Build` job fails on every branch *and* on `main` — a 404 on a Google-hosted image in
`content/docs/third-party-docs/TheGraph/thegraph.mdx`. Exactly the third-party link rot that job is
non-blocking for, but it currently masks any genuine build regression.

### The apply strategy that works

Rewriting a diff's paths and running `git apply --3way` **does not work here** and should not be
attempted. Hunk context lines are made of internal links, glossary anchors and `:::note` blocks —
precisely the lines the migration rewrote — so patches reject on fuzz. Zero of the 114 files that
share a path between the trees are byte-identical.

What works instead: transform the *legacy* file into the new dialect at **both** the PR's merge-base
and its head, then three-way merge with the current file as *ours*. Because base and theirs are both
in the new dialect, the migration's rewrites cancel out of the base↔ours delta, leaving only the PR's
real semantic change against the current file's real divergence. Collisions with post-migration edits
then surface as explicit conflict hunks instead of silent overwrites.

### Decline, don't guess

Any file above ~60% divergence should be declined rather than merged. `docs/how-arbitrum-works/01-inside-arbitrum-nitro.mdx`
and its counterpart here share a title and nothing else — the legacy page is 293 lines, this one is
125, and they open on different premises. **A clean merge on such a file is a false positive**, and a
plausible-looking wrong page is worse than no page.

## 7. Content gaps the replay surfaced

Replaying PRs turns out to double as a drift detector. Three items exist upstream and were never
migrated here:

| Missing from this repo | Exists upstream at |
|---|---|
| ArbOS 61 release notes | `docs/run-arbitrum-node/arbos-releases/arbos61.mdx` |
| Priority fees page | `docs/launch-arbitrum-chain/chain-config/costs/priority-fees.mdx` |
| Sequencer feed ticketing audit report (PDF) | `docs/hosted-pdfs/audit-reports/2026_07_31_sequencer_feed_ticketing_summary_report.pdf` |

This repo has `arbos11/20/32/40/51` and no `61`. These are reported, not fixed — porting content is
editorial work. Note that one in-flight PR (#3561) exists specifically to link the ArbOS 61 notes and
cannot land here until that page is migrated.

Only 9 PRs touching a small slice of the tree produced these three. A full `pnpm drift` sweep would
likely find more.

## 8. Recommendations for the real migration

1. **Import as move-then-transform.** One byte-pure rename commit, then separate mechanical transform
   commits. This is the whole finding. It costs nothing extra at import time and cannot be retrofitted
   cheaply afterwards.
2. **Gate the move commit** on zero content delta and an R100 count equal to the map size, and gate
   the final tree against the intended tree byte-for-byte.
3. **Build the path map first and require injectivity.** Treat a duplicate destination as a build
   failure.
4. **Ship `.git-blame-ignore-revs`** plus the `git config blame.ignoreRevsFile .git-blame-ignore-revs`
   instruction, but budget it as a ~2-point improvement.
5. **Land the Fumadocs tree on `arbitrum-docs` itself — decided 2026-09-15.** GitHub cannot transfer
   pull requests between repositories, only issues. Landing on arbitrum-docs preserves all history, PR
   numbering, permalinks and contributor attribution natively, and makes the cross-repo PR replay in
   section 6 unnecessary. **This supersedes the direction the rest of this document was written in** —
   the reconstruction described above was validated in a separate repo, but the same commit sequence
   is what lands on arbitrum-docs, so every finding here still applies. Chosen shape: a long-lived
   branch off `master`, rebased until cutover, then promoted to default. See
   [LANDING.md](LANDING.md) for that work.
6. **Re-authoring beats porting for large in-flight PRs.** Decline anything heavily divergent and
   hand a semantic summary to a human.
7. **Add a conflict-marker check.** `types:check` validates frontmatter, not MDX bodies, so a branch
   containing `<<<<<<<` currently passes every gate in the repo.
