# Re-syncing the Fumadocs tree against `master` before landing

> Prerequisite to step 1 of the [LANDING.md](LANDING.md) sequence. That document measured the
> blame-preserving build; this one lists the content that has to be carried over before the build is
> worth repeating.
>
> Measured 2026-09-17 against `OffchainLabs/arbitrum-docs@1023c40f1`, window opening 2026-08-17.
> **The counts below are a snapshot and go out of date daily — re-run `pnpm pr:gap`, do not trust
> these numbers on a later day.** Four PRs merged during the day this was written and moved them.

## Why this exists

`pnpm drift` compares the two trees and reports pages with no counterpart. That catches new pages and
gutted ones, but it cannot see the larger half of the gap: a page that exists on both sides and is
still months behind, because the upstream edit landed after the snapshot was taken. `pnpm pr:gap`
works from merged PRs instead and reports both.

It decides "behind" by searching the destination for distinctive prose the PR added, with markup
stripped first — the dialect transforms rewrite links, admonitions and variables, so a raw substring
match would report every file stale.

It also reads the three legacy config files a doc change touches outside `docs/`, because each maps
to a different surface here and a content-tree comparison cannot see any of them:

| Upstream                      | Here                   | Reported as    |
| ----------------------------- | ---------------------- | -------------- |
| `sidebars.js`                 | `meta.json`            | `NAV-GAP`      |
| `vercel.json`                 | `redirects.legacy.mjs` | `REDIRECT-GAP` |
| `src/resources/globalVars.js` | `content/vars.json`    | `UNBOUND`      |

```bash
pnpm pr:gap                      # human report; exits 1 if anything is missing or stale
pnpm pr:gap --json               # machine-readable, for tooling
pnpm pr:gap --since 2026-08-17   # window start (default: 30 days ago)
```

**Pull `~/OCL/arbitrum-docs` before every run.** The PR list comes from the GitHub API but every file
it resolves comes from the local clone, so a stale clone produces a confidently wrong report. The
freshness gate does not reliably catch this: it blocks on a fetch older than 24h, so a clone fetched
20h ago that is 16 commits behind passes. That happened here — the first measurement understated the
gap by 28 files.

## Resolved: `master` briefly had a month of merged work reverted

Kept because it explains why an earlier draft of this document read 47 MISSING, and because the
failure mode — a long-lived branch carrying a stale revert onto `master` — will recur.

PR #3536 (`tw1013`) was opened 2026-08-19 and merged 2026-09-17. Somewhere in that month it reverted
a merge from `master`, and merging the branch carried the revert onto `master`, **deleting 36 files
that other PRs had landed in the meantime**:

- **13 pages** — `bold/bold-faq.mdx` (#3556), `deep-dives/finality.mdx` (#3537),
  `deep-dives/batchposter.mdx` (#3535), `operate/error-index.mdx` and
  `validation/test-chain-configuration.mdx` (#3501), `sequencer/sequencer-config-reference.mdx` and
  `operate/sequencer-troubleshooting.mdx` (#3529), `deploy/token-bridge-troubleshooting.mdx`
  (#3491), `costs/parent-chain-data-fee-pricing.mdx` (#3541), `deploy/custom-genesis-state.mdx`, and
  the entire `how-arbitrum-works/priority-gas-auction/` directory from #3559/#3563/#3564.
- **18 glossary terms** — the BOLD set from #3553 and the PGA set from #3559/#3564, removed from
  `_glossary-partial.mdx` as well.
- **5 assets** — `batchposter-path.svg`, the three `haw-pga-*.svg`, and `pga-rounds-animation-brand.mp4`.

It also removed `finality` and `batchposter` from `sidebars.js`, which is where the two NAV-GAPs came
from. That it was a revert of a merge, not a considered deletion, is why it was treated as an
upstream accident rather than mirrored.

**Pete fixed it upstream the same day.** PR #3585 (`docs: revert-of-reverts`, merged 2026-09-17,
`master` now at `1023c40f1`) restores all 36 files and both `sidebars.js` entries. Nothing here had
to change: the deletions were never mirrored, so the correct response to the whole episode turned out
to be the one taken — wait, and confirm.

Two consequences for the rest of this document:

- **Phase 1 is empty.** Every page that read MISSING has an upstream source again, and the three
  genuinely unported files have since been ported. `pr:gap` reports 0 missing.
- **Both NAV-GAPs are closed**, and `pr:gap` reports 0 config gaps of any kind.

`DELETED-UPSTREAM` is now 4 rows, all from #3540 and all deliberate — see 2c.

## Resolved: remote images used to 500 every docs route

Kept here because the failure mode is migration-specific and will recur.

`remark-image` resolves image dimensions at build time and, by default, throws when it cannot. One
unreachable third-party URL therefore failed the whole render — every `/docs` route and `/llms.txt`
returned 500, not just the page carrying the image. Upstream carries the identical URLs, but
Docusaurus never fetches them, so there the page merely shows a broken image. **No gate catches
either state:** `types:check` validates frontmatter, `check-links` validates internal links. All
eight blocking gates passed while the site served 500s.

Three commits close it:

| Commit    | Fix                                                                                                                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `2f7e92f` | `remarkImageOptions: { onError: 'ignore' }` in `source.config.ts` — a dead URL degrades that one page instead of the whole site                                                                                                             |
| `8133423` | Dropped the 8 dead images from `third-party-docs/TheGraph` (7× googleusercontent 404, 1× notion 302). Cherry-picked from the throwaway clone at `~/OCL/landing-test/arb-docs-to-fumadocs`, where it was written 2026-09-15 and never pushed |
| `8d18aaa` | `third-party-docs/Flair` — its image is alive but behind a redirect; repointed at the post-redirect `i.imgur.com` URL and switched to `<ImageZoom>`                                                                                         |

**The two rules that come out of this:**

- A remote image in markdown (`![…](https://…)`) becomes a `next/image`, which needs both readable
  dimensions and an `images.remotePatterns` entry — `next.config.mjs` has none. Use `<ImageZoom>` for
  a remote image instead; it renders a plain `<img>` and needs neither. `Particle/particle.mdx:15`
  is the existing precedent.
- `onError: 'ignore'` means a dead image now fails silently. Nothing reports one. 82 of the 83 image
  references in `content/docs` are local, and the remaining two remote ones are third-party hosts
  (imgur, mintcdn) that can vanish the way TheGraph's did. Vendoring them into `public/img/` is the
  durable fix.

## Where it stands

44 PRs merged upstream between 2026-08-17 and 2026-09-17. Half touch content; the rest are
Dependabot, `CLAUDE.md` and build config, and need nothing.

|                  | Files | Meaning                                                         |
| ---------------- | ----- | --------------------------------------------------------------- |
| MISSING          | 0     | Phase 1 is done                                                 |
| STALE            | 163   | A destination exists, holding pre-migration text                |
| DELETED-UPSTREAM | 4     | We carry it, upstream has dropped it — all from #3540, see 2c   |
| unverifiable     | 51    | Added lines carry no prose to search for                        |
| config gaps      | 0     | No NAV-GAP or REDIRECT-GAP; #3585 restored both sidebar entries |
| UNBOUND          | 12    | Legacy variables with no `content/vars.json` key                |

Measured after pulling the clone current at `1023c40f1`.

**The report prints 385 STALE rows but only 163 distinct files.** A row is a PR×file pair, so a file
edited by four PRs in the window appears four times. Read the header count, not the row count. The
revert pair (#3536 deleting, #3585 restoring) is the worst offender: 75 files between them, 73 of
which another PR in the window already covers. Only two are theirs alone —
`launch-arbitrum-chain/deploy/configure-node.mdx` and `.../deploy/custom-genesis-state.mdx`.

**An earlier draft of this table read 75 MISSING.** That number was wrong three ways, and each way is
worth knowing because they will recur: 37 were images deliberately deleted here when mirroring #3540,
19 were files upstream deleted in the revert above, and 18 of those were glossary terms already
ported in 1d. `pr:gap` now separates `DELETED-UPSTREAM` from `MISSING` — the content tree cannot tell
"never ported" from "ported, then dropped upstream", and collapsing the two let an upstream accident
read as a month of unported work.

**No substantive upstream edit from this window is present in `content/`.** A handful of files report
current, and each one is a PR that only re-wrapped or re-anchored prose that already existed — #3532
wrapping existing sentences in `<a data-quicklook-from>`, for instance. Confirmed by hand on #3578:
upstream now reads _"you need both an execution layer client and a consensus layer client"_;
`content/partials/run-a-node/_dao-chains-parameters.mdx:21` still reads the old _"If you choose to
self-host an EVM node"_.

---

## Phase 1 — DONE, 0 files with no destination

`pr:gap` reports 0 MISSING against `1023c40f1`. The last three were closed by `ec9670d` (the
`_state-history-defaults.mdx` partial and its consumer) and `3ecf213` (the feed relay and Sequencer
timing pages, carrying `feed-relay-reference-architecture.svg`); the Trail of Bits PDF landed with
`audit-reports.mdx`.

> **Sections 1a–1e below are kept for the record and are no longer a worklist.** They were written
> against the 47 found on 2026-09-16, when the revert had not yet landed. All of it is now either
> done or moot: 1c and 1d are done, and the pages in 1a, 1b and 1e were deleted by #3536 and restored
> by #3585, so they exist upstream again and report STALE — the ordinary Phase 2 kind of work — rather
> than MISSING.

### 1a. Decide first: three PGA pages merged the day of measurement

PR #3559, #3563 and #3564 all landed 2026-09-16 and carry a whole new section that has no home here.

| Upstream                                                     | Notes                                   |
| ------------------------------------------------------------ | --------------------------------------- |
| `docs/how-arbitrum-works/priority-gas-auction/pga.md`        | `.md`, not `.mdx` — needs converting    |
| `docs/how-arbitrum-works/priority-gas-auction/fast-feed.mdx` |                                         |
| `docs/launch-arbitrum-chain/chain-config/sequencer/pga.mdx`  | Maps to `configuration/sequencer/` here |

Plus 6 glossary terms (`_eip-1559`, `_eip-4844`, `_fast-feed`, `_priority-fee`, `_propamm`,
`_searcher`) and 4 assets (3 `haw-pga-*.svg`, `pga-rounds-animation-brand.mp4`). The `.mp4` is the
only video in either tree — decide whether it ships before porting the page that embeds it.

**Open question:** `how-arbitrum-works/priority-gas-auction/` is a new top-level section. It needs a
`meta.json` and a position in the sidebar; neither is derivable from the upstream tree, where
ordering comes from numeric filename prefixes.

### 1b. Eight pages, mechanical once a destination is picked

| Upstream                                                                      | PR           |
| ----------------------------------------------------------------------------- | ------------ |
| `how-arbitrum-works/bold/bold-faq.mdx`                                        | #3556        |
| `launch-arbitrum-chain/chain-config/costs/parent-chain-data-fee-pricing.mdx`  | #3541        |
| `launch-arbitrum-chain/chain-config/sequencer/sequencer-config-reference.mdx` | #3529        |
| `launch-arbitrum-chain/chain-config/validation/test-chain-configuration.mdx`  | #3501        |
| `launch-arbitrum-chain/deploy/token-bridge-troubleshooting.mdx`               | #3491        |
| `launch-arbitrum-chain/operate/error-index.mdx`                               | #3501        |
| `launch-arbitrum-chain/operate/sequencer-troubleshooting.mdx`                 | #3529        |
| `run-arbitrum-node/partials/run-full-node/_state-history-defaults.mdx`        | #3543, #3544 |

`sequencer-troubleshooting.mdx` is also on LANDING.md's no-destination list, so it has been missing
since before this window — it is not new drift.

### 1c. One false positive — fix the map, not the content — DONE (8d14e23)

`launch-arbitrum-chain/extend-the-protocol/da-api-guide.mdx` (#3532) reports MISSING but was ported
as `launch-arbitrum-chain/integrations/da-api-integration-guide.mdx`. The rename is absent from
`RENAME_MAP` in `scripts/lib/tree-compare.mjs`. **Add the entry** — until then both `pr:gap` and
`drift` mis-report this page, and LANDING.md's note that it lands with 0% attribution at 1,966 lines
stays hidden behind a wrong verdict.

### 1d. 28 glossary terms — DONE (85dc8ed)

Ported with `scripts/migrate-glossary.mjs` against a staging directory holding only these 28, so the
137 terms already here were left untouched. `/intro/glossary#` links rewritten to `/docs/glossary#`;
all anchors they reference resolve to a real id. **Still not confirmed in a browser** — the render
blocker that stopped this is fixed, so this check is now just outstanding, not blocked.

12 BOLD terms from #3553 (`_bonding`, `_chain-bindings`, `_challenge-manager`,
`_challenge-manager-client`, `_delay-attack`, `_honest-validator`, `_one-step-prover`,
`_rollup-contract`, `_state-manager-backend`, `_timer`, `_validating-bridge`, `_validator-client`),
11 node terms from #3532 (`_archive-node`, `_blob`, `_data-availability-server-das`,
`_database-snapshot`, `_feed-relay`, `_hashdb`, `_pathdb`, `_pebble`, `_state-pruning`,
`_state-scheme`), and the 6 PGA terms from 1a.

Each becomes a `content/glossary/<id>.mdx` entry under the `{ id, title, sortAs? }` contract — not
the page contract. `pnpm glossary:migrate` already does this shape; check it before hand-writing 28
files. Gate on `pnpm references:check`.

### 1e. 7 assets

3 PGA SVGs and the PGA `.mp4` (see 1a), plus `batchposter-path.svg` (#3535),
`feed-relay-reference-architecture.svg` (#3531), and the Trail of Bits PDF (#3530). The two SVGs
belong to pages that are themselves stale, so port them with their pages, not separately.

---

## Phase 2 — the 163 files that exist but are behind

Ordered by cluster, because the two sweeps are a different kind of work from the rest. Each file is
counted once, in the first cluster that claims it:

| Cluster                               | Files | How to port                        |
| ------------------------------------- | ----- | ---------------------------------- |
| 2a. Variable sweeps #3543 + #3544     | 54    | Reconcile values, **not** as diffs |
| 2b. `run-arbitrum-node` rewrite #3532 | 43    | Whole-section task                 |
| 2b. 19 editorial PRs                  | 64    | As diffs                           |
| The revert pair's own two files       | 2     | As diffs                           |

### 2a. The two variable sweeps — 103 files, and a lost binding

| PR    | Merged     | Files | Title                                                           |
| ----- | ---------- | ----- | --------------------------------------------------------------- |
| #3544 | 2026-08-21 | 50    | Centralize recurring numeric literals into globalVars           |
| #3543 | 2026-08-22 | 53    | Fix required versions numbers across the docs + other variables |

These replace hardcoded numbers with Docusaurus `@@var@@` references across nearly every section.
**Do not port them as diffs** — that would re-introduce the legacy syntax the transform exists to
remove. But the job is bigger than reconciling values, because the two sides do not carry the same
information.

The legacy marker holds the variable's name _and_ its last-rendered value:

```
stylus-sdk = "@@stylusSdkVersion=0.10.7@@"     upstream, quickstart.mdx:383
stylus-sdk = { version = "0.10.7", ... }       here,     quickstart.mdx:378
```

Upstream edits `globalVars.js` once and `yarn update-variable-refs` rewrites the value half
everywhere. **`T5` kept the value and dropped the name**, so here the number is anonymous: nothing
records where it came from, `vars:check` cannot flag it (it only validates references that exist),
`drift` cannot see it (the line count is unchanged), and `pr:gap` can only say the page is STALE
without saying a version is wrong. A hardcoded wrong version passes all eight gates.

`pnpm pr:gap` now counts this: **38 of the 50 variables the legacy tree interpolates have a
`content/vars.json` key; 12 do not.** Ranked by how many legacy pages use them:

| Uses | Variable                  | Uses | Variable                         |
| ---- | ------------------------- | ---- | -------------------------------- |
| 8    | `stylusRustToolchain`     | 3    | `timeboostAuctionClosingSeconds` |
| 8    | `stylusSdkVersion`        | 3    | `timeboostRoundSeconds`          |
| 4    | `cargoStylusVersion`      | 2    | `aepRevenueSharePercent`         |
| 4    | `stylusRustToolchainFull` | 2    | `dasMaxStoreChunkBytes`          |
| 3    | `maxDataSizeL2`           | 2    | `maxCodeSizeBytes`               |
| 3    | `maxDataSizeL3`           | 1    | `gasTargetSpeedLimit`            |

`l2BlockTimeMs`, `timeboostNonExpressDelayMs` and `l1SlotTimeSeconds` were bound since the previous
measurement, which is why the count moved 15 → 12 while the list lost its three highest-usage rows.

**Restore these bindings before the values drift further.** For each one, add the key to
`content/vars.json` and replace the inlined literal with `<Var name="…" />` on every page the legacy
tree marks — the legacy `@@name=value@@` markers are the map of where to look. Then `vars:check` can
do its job for the first time on these values.

Six other keys look like mismatches and are not: upstream stores a computed expression
(`blocksToDays(45818)`) where we store the result (`6.4`). Same values.

### 2b. Editorial PRs — 64 distinct files, port as diffs

**The `Files` column is each PR's own row count and the columns overlap** — several PRs edit the same
page, and the 19 rows sum to more than the 64 distinct files they touch. Work the list top-down and
re-run `pr:gap` rather than adding these up.

| PR    | Merged     | Author         | Files | Title                                              |
| ----- | ---------- | -------------- | ----- | -------------------------------------------------- |
| #3553 | 2026-08-27 | anegg0         | 16    | Merge bold glossary into canonical one             |
| #3552 | 2026-09-01 | pete-vielhaber | 14    | tw-1036-fixing-launch-chain-tables                 |
| #3533 | 2026-09-17 | pete-vielhaber | 13    | tw-1009-stf-deep-dive                              |
| #3535 | 2026-09-01 | pete-vielhaber | 10    | tw-1011-batchposter                                |
| #3501 | 2026-09-02 | pete-vielhaber | 9     | tw711-bold-tuning-docs                             |
| #3537 | 2026-09-01 | pete-vielhaber | 8     | tw-1012-finality                                   |
| #3556 | 2026-09-01 | pete-vielhaber | 6     | tw-1037-bold                                       |
| #3559 | 2026-09-16 | anegg0         | 6     | PGA intro (the `read-sequencer-feed` edit)         |
| #3583 | 2026-09-17 | pete-vielhaber | 6     | restore-pga                                        |
| #3529 | 2026-08-25 | pete-vielhaber | 4     | tw700-sequencer-config-ref                         |
| #3541 | 2026-09-02 | pete-vielhaber | 4     | tw-795-arbowner-method-explanation-expansion       |
| #3564 | 2026-09-16 | anegg0         | 4     | fast-feed article (the `read-sequencer-feed` edit) |
| #3491 | 2026-09-09 | pete-vielhaber | 3     | tw-767-token-bridge-troubleshooting                |
| #3534 | 2026-09-02 | pete-vielhaber | 2     | tw-1010-arbos                                      |
| #3578 | 2026-09-15 | Jason-W123     | 2     | fix consensus client word                          |
| #3530 | 2026-08-18 | anegg0         | 1     | Trail of Bits audit, yield-bearing bridge          |
| #3531 | 2026-08-20 | a-thomas-22    | 1     | feed relay reference architecture                  |
| #3545 | 2026-08-21 | Jason-W123     | 1     | fix: fast withdrawal period                        |
| #3563 | 2026-09-16 | anegg0         | 1     | PGA (the `read-sequencer-feed` edit)               |

Two of these postdate the first draft of this document: **#3533** (`tw-1009-stf-deep-dive`) and
**#3583** (`restore-pga`), both merged 2026-09-17 alongside the revert fix.

PR #3532 (43 stale files) is deliberately absent from this table: it is a whole-section rewrite of
`run-arbitrum-node`, which maps to `run-a-node` here. Treat it as its own task, not as a diff to
apply — and pair it with the 11 node glossary terms in 1d, which it introduced.

### 2c. Mirror #3540's deletions — 41 images — DONE (d5c33a6)

37 removed. Four kept: the two mint-burn diagrams, still rendered by
`choose-native-mint-burn.mdx` here (upstream orphaned them by editing that page, so mirroring the
deletion needs the page edit too); `img/favicon.ico`, which the reskin plan swaps in as the Arbitrum
favicon and which is a different file from the `public/favicon.ico` the app serves today; and
`img/logo_black.svg`, named in that plan as the dark-mode escalation fallback.

Original assessment below.

PR #3540 deleted 41 orphaned images upstream (0 additions, 1,351 deletions). **All 41 are still present
in `public/img/`.** They report `unverifiable` rather than stale because a deletion adds no prose to
search for.

Do not delete them on that evidence alone: orphaned upstream does not mean orphaned here, and the
MDX image pipeline is the one thing no gate covers. Check each against `content/` first, then remove
the genuinely unreferenced ones. `docusaurus.png` and the three `undraw_docusaurus_*.svg` are safe —
they are scaffold leftovers of a framework this repo no longer uses.

---

### 2d. Two nav entries dropped by the revert — RESOLVED, no action

PR #3536 removed `how-arbitrum-works/deep-dives/finality` and `.../batchposter` from `sidebars.js`;
PR #3585 put both back. `pr:gap` reports 0 config gaps. Nothing here was ever changed in response, which
was the right call.

Worth keeping for the technique: only the `sidebars.js` check surfaced these. Both pages existed on
both sides throughout, so no content comparison — `drift` included — would have seen anything.

---

## One finding that changes the transform assumptions

Upstream has started adopting this repo's component dialect. #3578 replaced `:::info` with
`<VanillaAdmonition type="tip" title="…">` **in the legacy tree**. `T4` converts `:::` admonitions;
pages already converted upstream pass through it untouched, and a re-sync pulls `<VanillaAdmonition>`
in from the legacy side.

This is not yet a problem — the component exists here and renders — but it means the legacy tree is
no longer purely Docusaurus, so "the transform handles every page" stops being true silently rather
than loudly. Re-check `T4`'s coverage after the re-sync.

## Definition of done

1. `pnpm pr:gap` reports 0 missing and 0 stale against a freshly pulled `~/OCL/arbitrum-docs`.
2. `pnpm drift` reports no new ABSENT entries (the two standing non-work-items excepted).
3. The eight blocking gates pass: `types:check`, `test`, `vars:check`, `nav:check`, `partials:check`,
   `versioned-docs-check`, `references:check`, `check-links`.
4. Every new page renders on `http://localhost:3000` — not `127.0.0.1`, where React does not hydrate
   and every component looks broken.

Only then is LANDING.md step 2 (split `T1`) and step 3 (rebuild, re-measure blame) worth starting.
