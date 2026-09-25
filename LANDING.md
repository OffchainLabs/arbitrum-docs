# Landing the Fumadocs tree on arbitrum-docs

> Companion to [MIGRATION-FINDINGS.md](MIGRATION-FINDINGS.md). That document validated the
> blame-preserving import technique; this one records applying it in the chosen direction — the
> Fumadocs tree landing **onto** `OffchainLabs/arbitrum-docs`, so history, PR numbering, permalinks
> and contributor attribution are preserved natively.
>
> Built and measured 2026-09-15 in throwaway clones at `~/OCL/landing-test/`, both with push disabled
> at the git level (`remote set-url --push origin DISABLED-throwaway-do-not-push`). Nothing was
> pushed; the real repos were never written to.

## Result

Branch `fumadocs` = `b60b802c`, parented to `master` `6a2738fba`. 13,048 commits — the 13,038 of
arbitrum-docs plus ten.

| Gate                                   | Result                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------ |
| `master` is a true ancestor            | ✅                                                                             |
| Move commit purity                     | ✅ 591 files, **0 insertions, 0 deletions**, every entry `R100`                |
| Blob identity (10 sampled pairs)       | ✅ 10/10 identical OIDs                                                        |
| Tree equality vs shipped Fumadocs tree | ✅ exact OID match (`900cf046`); tip differs by `.git-blame-ignore-revs` alone |
| Blame traversal                        | ✅ 92 commits / oldest 2022-12-07 on `arbitrum-bridge/quickstart.mdx`          |
| **SRC authorship, full population**    | **72.73%** plain, **75.28%** with ignore-revs (0% before)                      |

The blame figure was produced twice, by two independent builds in two different repositories, agreeing
to within 0.16 points (72.67/75.12 vs 72.73/75.28). The site content is provably byte-identical to the
tested `Fumadocs-test` main, so no build is needed to establish equivalence.

Rename chains reach further back than the migration itself — git follows them through arbitrum-docs'
own earlier reorganisations:

```
R100  docs/arbitrum-bridge/01-quickstart.mdx        → content/docs/arbitrum-bridge/quickstart.mdx
R100  arbitrum-docs/arbitrum-bridge/01-quickstart.mdx → docs/…
R091  arbitrum-docs/getting-started-users.mdx        → arbitrum-docs/arbitrum-bridge/01-quickstart.md
```

11 distinct authors reached on that one file, oldest `ff53e393f` (2022-12-07).

## Two defects in the current build — fix before the real run

### 1. The transform commits assert a fact, and they must not

`T1` inserts `author: gblanchemain` / `sme: gblanchemain` into every page, because the Fumadocs Zod
schema requires both and the legacy frontmatter has neither. That is **substance, not form** — it
asserts a person. Because `T1` is listed in `.git-blame-ignore-revs`, those lines blame through to
whatever preceded them, attributing an invented claim to an original arbitrum-docs author.

**Fix:** split it. `T1a` does the pure reshaping (content_type remap to the closed enum, dropping
`id`/`sidebar_position`/`displayed_sidebar`/…) and stays in the ignore file. `T1b` synthesises
`author`/`sme` and is **excluded** from it. Everything else sampled across T1–T5 is genuinely
form-only: prose bytes are identical either side of each diff.

### 2. Do not make the editorial commit a merge

The obvious way to also preserve the Fumadocs repo's own 211 commits is to give commit `E` two
parents — `[T5, fumadocs-main]` — with the same tree. **This was tested and it is actively harmful:**

| E shape                   | SRC authorship                       |
| ------------------------- | ------------------------------------ |
| Linear, single parent     | **72.73%** (75.28% with ignore-revs) |
| Merge commit, two parents | **21.97%** (22.23%)                  |

Blame prefers the parent whose tree matches, the Fumadocs side matches exactly, so it never walks into
the legacy history at all. A two-thirds loss. **Keep `E` linear.** If Fumadocs-side attribution
matters, it needs a different mechanism entirely — a merge parent is not it.

## What the restructure does to the 23 open PRs

Every one of the 23 was merged for real against `fumadocs` with `git merge-tree`, using `master` as a
control.

**0 rebaseable · 10 needs-remap · 13 re-author.** All 23 conflict against `fumadocs`; only 11 conflict
against `master`, so the restructure is what breaks the other twelve.

Rename detection does most of the work — of 121 touched-file/moved-path pairs, 86 followed the rename
to the correct destination and conflicted only on content, 28 did not follow it at all, 5 followed to
a different destination than the map's, and 2 merged clean. The damage is not the move; it is that
T1–T5 and E touch the same lines the PRs touch.

### The dead-tree hazard, stated accurately

A PR that adds files under `docs/**` is adding to a directory that no longer exists. Git's
**directory-rename detection handles most of this correctly** — for PR #3500 the new page landed at
`content/docs/launch-arbitrum-chain/deploy/yield-bridge.mdx` with zero `docs/` entries in the merged
tree, and for #3573 448 files landed correctly under `content/docs`.

But a residue does not: **9 files in #3573 and #3569, and 1 (plus 7 assets) in #2954, land in a
resurrected `docs/` tree** that Fumadocs never reads. Those pages would merge and be silently
unpublished.

Crucially, **this is detectable, not silent — if you read the merge messages.** Git emits an explicit
message naming the correct destination:

```
CONFLICT (file location): docs/run-arbitrum-node/data-availability.mdx renamed to
docs/how-arbitrum-works/deep-dives/data-availability.mdx in pr3573, inside a directory that was
renamed in fumadocs, suggesting it should perhaps be moved to
content/docs/how-arbitrum-works/deep-dives/data-availability.mdx.
```

The risk is therefore **automation that ignores merge messages**, not git itself. Any rebase tooling
must parse `CONFLICT (file location)` and act on the suggestion, and the landing must be gated on
"zero files under `docs/` or `static/` after any merge."

### Caveats on the PR table

- **Four PRs are already broken against today's `master`**, independent of the landing: #2644 (its
  only file is already deleted), #3287 (3 files gone), #2954 (9 images gone), #3497 (16 of 20
  conflicts pre-existing).
- **#3563, #3564 and #3567 do not target `master`** — they stack on `pga`/`fast-feed`, so their diffs
  carry their base PR's commits and their control column is not meaningful.
- **`merge-tree` reports textual conflicts only.** A `needs-remap` PR with few conflicts can still be
  semantically broken — missing required `content_type`/`author`/`sme`, surviving `:::` admonitions,
  `@site/` link forms. Treat `needs-remap` as a floor, not a ceiling.

## Content that has no destination

`master` has moved on since the Fumadocs snapshot was taken, so 14 pages, 22 glossary terms, 14 assets
and 1 partial exist on `master` with nowhere to land and lose their blame chain entirely. Notable:
`arbos-releases/arbos61.mdx`, `chain-config/costs/priority-fees.mdx`, `deep-dives/01-stf-gentle-intro.mdx`,
`extend-the-protocol/precompiles.mdx`, `operate/sequencer-troubleshooting.mdx`.

Where a successor page exists it arrives via `E` with zero history — `da-api-integration-guide.mdx`
lands as 1,966 lines and 0% SRC attribution.

**This gap grows every day until cutover.** It is the strongest argument for either an early cutover
or a re-sync immediately before one.

## Recommended sequence for the real migration

1. **Re-sync the Fumadocs tree against `master` first**, so the no-destination set is as small as
   possible.
2. **Split T1** as described above, then rebuild.
3. **Build the branch off `master`, keep `E` linear**, and gate on: move-commit purity, tree equality,
   and the blame percentage.
4. **Rebase open PRs with tooling that reads `CONFLICT (file location)`**, gated on zero files landing
   under `docs/` or `static/`.
5. **Promote the branch to default at cutover.** Until then open PRs keep targeting `master` and stay
   mergeable, and the branch gets a real Vercel preview of the whole site.
