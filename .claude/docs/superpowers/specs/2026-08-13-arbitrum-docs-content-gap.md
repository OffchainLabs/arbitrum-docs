# Spec: Content gap between arbitrum-docs and Fumadocs-test

**Date:** 2026-08-13
**Tree A (legacy, content of record):** `/Users/allup/OCL/arbitrum-docs/docs/` — Docusaurus 3.10, branch `master` @ `5db59ef3e`
**Tree B (this repo):** `content/` — Next.js 16 + Fumadocs 16, branch `main` @ `2656727`

## Decisions taken

1. **Both trees stay live for a while.** arbitrum-docs keeps publishing while this repo is finished. Drift will keep appearing, so a repeatable drift-detection step is a required deliverable, not a nice-to-have.
2. **Gutted pages are restored from Tree A, reviewed individually.** The loss is treated as accidental, but each page is read before porting in case a trim was deliberate.

## How the comparison was done

A naive `diff -rq` between these trees is useless — it reports ~500 differences. Four normalizations are required, and any future tooling must apply all of them:

1. **Locale segment** — Tree A `docs/<section>/` vs Tree B `content/docs/en/<section>/`
2. **Docusaurus numeric prefixes** — Tree A `01-overview.mdx` → Tree B `overview.mdx`. Fumadocs orders via `meta.json`, so every ordered page otherwise looks renamed. This alone caused 24 false positives.
3. **Section renames** — `run-arbitrum-node`→`run-a-node`; `chain-config`→`configuration`; `stylus-by-example` folded into `stylus`; `for-devs` decomposed into `oracles/` + `third-party-docs/` + root pages
4. **Non-routed collections** — Tree B keeps `partials/` and `glossary/` outside the doc collection

After normalization: 279 Tree A user-facing docs vs 324 Tree B `docs/en` pages; 54 Tree A files without a filename counterpart, of which ~26 are real gaps.

## The port window

The migration landed progressively **2026-05-22 → 2026-07-10** (`git log --diff-filter=A -- content/docs/en`). This date is the classification boundary:

- Tree A file added **after 2026-07-10** → **upstream drift**. Never in migration scope. Not a defect.
- Tree A file added **on or before 2026-07-10** → **migration miss**. Should have been ported and wasn't.

## P0 — Navigation is broken independently of the content gap

Discovered while gathering templates for this spec. In Fumadocs, a `meta.json` `pages` array is an **allowlist**, verified in `fumadocs-core` source (`packages/core/src/source/page-tree/builder.ts:397-428`): when `pages` is present, children come only from resolved entries; the "add everything on disk" branch (:424-428) runs only when `pages` is absent. The `"..."` rest operator (:415-419) re-adds unlisted files. Entries naming a non-existent page are **silently ignored** (:330-338) — no warning, no build error. Behaviour is identical in 16.11.1 (this repo's pin) and 16.14.1.

Excluded pages remain reachable by direct URL; they are sidebar-invisible, not 404.

The `launch-arbitrum-chain` metas are copy-paste corrupted:

| Directory | `meta.json` says | Reality |
|---|---|---|
| `launch-arbitrum-chain/configuration/` | title "Advanced", 3 pages: `layer-leap`, `config-sequencer-timing-adjustments`, `da-api-integration-guide` | **all 3 are ghosts**, no `"..."` → **34 pages sidebar-unreachable** |
| `launch-arbitrum-chain/operate/` | title "Validation and security", 9 pages | 8 ghosts; only `arbos-upgrade` renders. 6 real pages hidden |
| `launch-arbitrum-chain/configuration/validation/` | title "Advanced", 3 pages | all ghosts → zero children |

Repo-wide, measured by running the checker logic against `content/docs`: **13 directories carry navigation defects, hiding 48 pages** from the sidebar. Affected: `content/docs/en` (chain-info, contribute, glossary), `launch-arbitrum-chain` and its `configuration/{core,costs,data-availability,sequencer,validation}`, `deploy`, `operate`, `overview`, `integrations`, `third-party-integrations`.

(An earlier count of 21 directories was wrong — it double-counted `index` as a ghost entry in three directories. `index.mdx` may legally appear in `pages`.)

This must be fixed before porting content — a new page dropped into `configuration/` today would be invisible.

## Gap inventory

### Category 1 — Upstream drift (10 pages, added after 2026-07-10)

| Tree A path | Added | Content |
|---|---|---|
| `launch-arbitrum-chain/chain-config/costs/revenue-routing.mdx` | 2026-08-10 | fee lifecycle, collecting addresses, fund-movement timing, fee-pool monitoring |
| `launch-arbitrum-chain/chain-config/sequencer/compliance-filtering.mdx` | 2026-08-05 | protocol-level tx filtering for sanctioned addresses |
| `launch-arbitrum-chain/operate/bold-upgrade-playbook.mdx` | 2026-07-29 | sequencing a BoLD upgrade around multi-day multisig signing |
| `launch-arbitrum-chain/operate/validator-troubleshooting.mdx` | 2026-07-29 | assertion timing flags, stuck validator txs, manual assertion confirmation |
| `launch-arbitrum-chain/operate/upgrade-runbook.mdx` | 2026-07-28 | end-to-end upgrade checklist, WASM-module-root troubleshooting, rollback |
| `arbitrum-bridge/06-withdrawal-monitoring.mdx` | 2026-07-27 | per-chain timeline table, L3 two-leg math, stuck-withdrawal diagnosis, `getFirstExecutableBlock`/`isSpent` |
| `how-arbitrum-works/reference/finality-and-reorgs.mdx` | 2026-07-24 | three finality levels, block-tag guidance, reorg-depth bound, indexer advice |
| `how-arbitrum-works/deep-dives/sequencer-transaction-flow.mdx` | 2026-07-22 | three-zone queue model, 100k surge walkthrough, operator tuning, relayer cache |
| `arbitrum-essentials/how-to-get-l2block-on-l1.mdx` | 2026-07-17 | `eth_getProof`, `Lib_MerkleTrie`, RLP/`accountProof` walkthrough |
| `launch-arbitrum-chain/chain-config/data-availability/das-docker-deployment.mdx` | 2026-07-15 | Docker/Compose DAS deployment without Kubernetes |

### Category 2a — Migration misses, fully absent (5 pages)

| Tree A path | Added | Content |
|---|---|---|
| `launch-arbitrum-chain/run-a-node/run-full-node-with-helm.mdx` | 2026-07-02 | Helm/Kubernetes full-node guide. **A live link already points at it** |
| `launch-arbitrum-chain/integrations/exchange-integration-checklist.mdx` | 2026-06-30 | CEX deposit-detection/withdrawal checklist with test vectors |
| `launch-arbitrum-chain/integrations/bp-kms-signing-services.mdx` | 2026-06-26 | external/AWS KMS signing for batch poster, signer-service contract |
| `launch-arbitrum-chain/operate/bp-recovery.mdx` | 2026-06-26 | batch-poster recovery state machine, 4 recovery mechanisms, reorg handling |
| `launch-arbitrum-chain/chain-config/chainConfig-reference.mdx` | 2026-06-24 | chainConfig JSON field reference: customizable vs intentionally-non-customizable |

### Category 2b — Migration misses, page present but gutted (10 pages)

Ratio = Tree B body lines ÷ Tree A body lines, frontmatter excluded.

| Tree A → Tree B | Ratio | Absent from Tree B |
|---|---|---|
| `operate/monitoring.mdx` → `operate/monitoring-tools-and-considerations.mdx` | **167→33 (0.20)** | entire "what to monitor, by component" half: `arbitrum-monitoring` suite, enabling Nitro metrics, 4 metric tables, hardware appendix |
| `how-arbitrum-works/deep-dives/sequencer.mdx` | 0.23 | Sequencing and broadcasting (6 subsections), Batching/compression (Brotli), Sequencer Inbox blobs-vs-calldata, Finality. Orphans 5 `haw-*.svg` diagrams |
| `operate/ownership-and-access.mdx` → `ownership-access-control.mdx` | 0.26 | whole "Per-function permissions" block: SequencerInbox, Rollup/RollupAdminLogic (24-row), Bridge, Inbox tables |
| `chain-config/sequencer/sequencer-timing-adjustments.mdx` | 0.37 | `maxTimeVariation` explanation, window enforcement, per-field guards, defaults table, `=0` risk admonition |
| `operate/batch-poster-troubleshooting.mdx` | 0.39 | 9 error-taxonomy sections, ~35 named Nitro log messages |
| `chain-config/costs/revenue-routing.mdx` | 0.45 | also Category 1 — treat as one item |
| `notices/arbos61-upgrade-notice.mdx` | 0.67 | Tree B is a **pre-DAO-vote draft**: missing "Action required" Nitro v3.11 admonition, Arbitrum One/Nova section, 2026-08-20 date. **Also still claims Dynamic Pricing ships enabled — factually wrong** |
| `overview/introduction.mdx` → `a-gentle-introduction.mdx` | 0.71 | `## Performance`, `## Compliance` (sanctioned-address screening) |
| `run-arbitrum-node/02-run-full-node.mdx` → `run-a-node/run-full-node.mdx` | 0.72 | "Choose a state scheme" (HashDB vs PathDB table, block-validation caution) |
| `nitro/03-nitro-database-snapshots.mdx`, `more-types/01-run-archive-node.mdx` | 0.77 / 0.84 | PathDB snapshots table, "Initialize a PathDB node" shell blocks |

### Category 2c — Glossary (1 term)

`forwarder` — present at Tree A `docs/partials/glossary/_forwarder.mdx`, absent from `content/glossary/`. Nothing in Tree B references the term, so restoring it breaks nothing.

### Category 3 — Verified NOT gaps (no action)

- `api/globals.md`, `api/index.md` — `docs/api/` is in Tree A's `.gitignore:21`; typedoc isn't a dependency. Dead build artifact.
- `*-content-map.mdx` — deliberately skipped by `scripts/codemods/port-remaining.mjs`, replaced by `index.mdx` + `meta.json`.
- `deep-dives/01-stf-gentle-intro.mdx` — absorbed into `deep-dives/stf.mdx`, all four Stylus sections verbatim.
- **Partials: 67 non-glossary partials → 65 present, 1 inlined, 1 transformed, 0 missing.** 60 of 65 are ≥0.9 similar; the 5 outliers are Docusaurus→Fumadocs syntax ports.
- **Glossary architecture** — Tree A had 137 per-term fragments + a generated monolith; Tree B has 136 files under `content/glossary/` rendered via `<ReferenceList collection="glossary" />`. Transformed, not lost.
- `launch-arbitrum-chain` restructure — 32 of 45 unmatched files are renames, 2 merges. Tree B is *ahead*: 20 net-new pages including an 18-page `features/` decision-guide tree.
- `content/partials/CATALOG.md` is in sync — 84 paths, 84 manifest entries, 84 files on disk.

## Other defects found

| Defect | Location | Severity |
|---|---|---|
| Dangling internal link — target does not exist in Tree B | `content/docs/en/run-a-node/run-full-node.mdx:20` → `/docs/launch-arbitrum-chain/run-a-node/run-full-node-with-helm` | High |
| ArbOS 61 notice is a pre-vote draft, states Dynamic Pricing ships enabled | `content/docs/en/notices/arbos61-upgrade-notice.mdx` | High |
| Oracle index missing Pyth, Quex, Supra VRF cards | `content/docs/en/oracles/index.mdx` | Medium |
| `solidity-references` learning-resources table degraded; RareSkills row links to the Rust bootcamp; Metana row contains a leaked LLM placeholder | `content/docs/en/build-decentralized-apps/quickstart-solidity-remix.mdx#learning-resources` | Medium |
| 5 `haw-*.svg` diagrams orphaned by the gutted sequencer page | `content/docs/en/how-arbitrum-works/deep-dives/` | Medium |
| Unfinished stub, self-described as awaiting a stacked PR | `content/docs/en/run-a-node/nitro/nitro-memory-management.mdx` (15 lines) | Low |
| Typo in partial filename `_config-evm-compatbility.mdx` | `content/partials/launch-arbitrum-chain/` | Low |
| Possibly redundant `_config-challenge-period-l1.mdx` / `_config-l1-challenge-period.mdx` | `content/partials/launch-arbitrum-chain/` | Low |

## Constraints any implementation must respect

- **Node 22 only** (`engines >=22 <23`), pnpm 10.29.3.
- **Frontmatter contract** enforced by Zod in `source.config.ts`. Every non-partial page **must** have `title`, `description`, `content_type`, `author`, `sme`. `content_type` ∈ `how-to | concept | quickstart | tutorial | reference | troubleshooting | faq`. Optional: `sidebar_label`, `user_story`, `draft`. A missing field fails `types:check` and `build`.
- **Partials carry no frontmatter.** Doc→partial includes use root-anchored `<include cwd>content/partials/…</include>`; partial→partial includes must be file-relative. Enforced by `scripts/partials-check.mjs`.
- **Docusaurus→Fumadocs syntax**: `:::note` → `<VanillaAdmonition type="note">`; `@theme/Tabs` → Fumadocs `Tabs`/`Tab`; strip numeric filename prefixes; `import`-based partials → `<include>`.
- **Never hand-edit** `.source/`, `content/partials/CATALOG.md`, or `content/partials/manifest.json` — regenerate with `pnpm partials:catalog`.
- **`pnpm types:check` validates frontmatter and types only.** It does not check links, rendering, or content correctness. Real evidence comes from `pnpm check-links`, `pnpm partials:check`, `pnpm references:check`, and viewing the page in `pnpm dev`.
