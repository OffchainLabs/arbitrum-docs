# Import remaining arbitrum-docs content into Fumadocs — design (2026-07-14)

## Purpose

Port the not-yet-migrated Docusaurus content from `/Users/allup/OCL/arbitrum-docs` (canonical
`master`) into the Fumadocs app at `/Users/allup/OCL/Fumadocs-test`, following the restructured
information architecture rather than mirroring the source tree 1:1. This is a content **port with
format conversion**, not a copy.

## Scope

Source has ~322 non-partial doc files; Fumadocs currently has 165. Already ported (largely complete):
`launch-arbitrum-chain`, `stylus` (core). Remaining to import:

| Source section | Source files | In Fumadocs now |
| --- | --- | --- |
| `for-devs` | 52 | 0 (dissolved — see below) |
| `run-arbitrum-node` (+ `node-running`) | 44 | 5 (as `run-a-node`, recomposed) |
| `arbitrum-essentials` | 32 | 6 |
| `how-arbitrum-works` | 22 | 5 (deep pages missing) |
| `stylus-by-example` | 19 | 0 |
| `arbitrum-bridge` | 5 | 1 |
| `build-decentralized-apps` | 3 | 1 |
| `get-started` / `intro` / `learn-more` / `notices` | ~8 | ~3 |

## Target IA changes

- **Remove** the `for-devs` section; dissolve into the pieces below.
- **Add two top-level sections** to `content/docs/en/meta.json` and the nav (`lib/layout.shared.tsx`):
  `oracles`, `third-party-docs`.
- **Two pinned pages** — `chain-info` and `contribute` — each lives once at `/docs/<slug>` and gets a
  `[label](/docs/<slug>)` link entry appended to **every** top-level section `meta.json`, so it appears
  in all sidebars. No physical duplication.

## Section mapping (source → target)

| Source | Target | Notes |
| --- | --- | --- |
| `for-devs/oracles/*` **+** `arbitrum-essentials/oracles/overview-oracles.mdx` | `/docs/oracles/` (new) | consolidate both oracle sources |
| `for-devs/third-party-docs/*` (~22 providers) | `/docs/third-party-docs/` (new) | its `contribute.mdx` stays inside this section |
| `for-devs/dev-tools-and-resources/chain-info.mdx` (+ precompile-table partials) | `/docs/chain-info` (pinned) | linked in every sidebar |
| `for-devs/contribute.mdx` | `/docs/contribute` (pinned) | linked in every sidebar |
| `for-devs/troubleshooting-building.mdx` | `/docs/build-decentralized-apps/` | assumption |
| `run-arbitrum-node/*` **+** `node-running/*` | `/docs/run-a-node/` | merge; do not clobber the 5 existing files |
| `how-arbitrum-works/*` (deep content) | `/docs/how-arbitrum-works/{deep-dives,reference,bold,timeboost}` | source subdirs already match target |
| `arbitrum-essentials/*` (missing) | `/docs/arbitrum-essentials/` | mirror substructure |
| `stylus-by-example/*` (19) | `/docs/stylus/stylus-by-example/` | nested under stylus |
| `stylus/*` (missing) | `/docs/stylus/` | merge |
| `arbitrum-bridge/*` | `/docs/arbitrum-bridge/` | merge |
| `build-decentralized-apps/*` | `/docs/build-decentralized-apps/` | merge |
| `get-started/*`, `intro/glossary`, `learn-more/faq`, `notices/*` | respective same-name targets | small |

## Porting mechanism

1. Extract the proven transform pipeline from `scripts/codemods/port-stylus.mjs` into a shared
   `scripts/lib/port-pipeline.mjs` (pure functions, no side effects). The two existing already-run
   codemods (`port-stylus.mjs`, `port-launch-arbitrum-chain.mjs`) are left untouched.
2. A config-driven `scripts/codemods/port-remaining.mjs` runs the pipeline per mapping entry
   (source dir → dest dir, plus pinned-page and consolidation rules).

Transforms (identical to the established standard):

- Frontmatter → Zod schema: drop Docusaurus-only keys (`slug`, `displayed_sidebar`, `id`,
  `sidebar_position`, `pagination_*`, `target_audience`); coerce `content_type` to the enum
  (`how-to|concept|quickstart|tutorial|reference|troubleshooting|faq`, default `concept`); default
  `author`/`sme` to `gblanchemain`; synthesize `title`/`description` when missing; emit in the fixed
  field order.
- `@@var@@` → `<Var name="…" />` (literal substitution inside fenced code).
- Strip `@site/src/components/*` imports (components are globally registered).
- Partial imports → `<include cwd>content/partials/…</include>`; referenced partials copied into the
  `content/partials/` registry (section-local subfolder where applicable).
- `:::type` admonitions → `<VanillaAdmonition type="…">`; `<details><summary>` → `<Accordions>/<Accordion>`.
- HTML comments → `{/* … */}`; strip `{#heading-anchors}`; Shiki language fixes.
- Relative (`./`, `../`) and absolute links → clean `/docs/…` (strip numeric prefixes + `.md(x)`).
- Fenced code blocks pass through untouched.

Per-directory `meta.json` generated (ordered by `sidebar_position`, then alphabetical; `index` first);
new sections wired into root `meta.json`.

## Pinned pages

`chain-info` and `contribute` are written once (top-level `/docs/chain-info`, `/docs/contribute`). A
post-step appends `[Chain info](/docs/chain-info)` and `[Contribute](/docs/contribute)` to the `pages`
array of every top-level section `meta.json`. The precompile-table partials that `chain-info` imports
land in the partials registry.

## Post-processing (per wave and final)

`pnpm quicklooks:migrate` → `pnpm partials:catalog` → `pnpm references:check` → `pnpm check-links`
(+ `pnpm fix-links` where it resolves cleanly) → `pnpm format`.

## Verification

- **Gates:** `pnpm types:check` and `pnpm check-links` (the `onBrokenLinks: 'throw'` analog).
- Dev-server render spot-check per new/changed section (`pnpm dev`, curl the routes — bypass the `rtk`
  curl proxy which truncates output).
- `pnpm partials:check` for partials integrity.
- Full `next build` stays blocked by the known Next 16.2.6 prerender crash (compile mode); it is **not**
  the gate.

## Sequencing (independently verifiable waves; commit after each)

1. `oracles` + `third-party-docs` (new, self-contained sections).
2. `chain-info` + `contribute` pinned pages (+ precompile partials + sidebar link injection).
3. `run-a-node` merge (`run-arbitrum-node` + `node-running`).
4. `how-arbitrum-works` deep + `arbitrum-essentials` + `stylus`/`stylus-by-example`.
5. `arbitrum-bridge` + `build-decentralized-apps` + `get-started`/`intro`/`learn-more`/`notices`.
6. Global post-processing + final verification.

Each wave: run porter → `types:check` → `check-links` → render spot-check → commit.

## Assumptions (vetoable)

- `troubleshooting-building.mdx` → `build-decentralized-apps`.
- Both oracle sources (`for-devs/oracles`, `arbitrum-essentials/oracles`) consolidate into new `oracles`.
- `run-arbitrum-node` + `node-running` both merge into `run-a-node`.
- `*-content-map.mdx` Docusaurus landing helpers are ported as-is and flagged for manual review.

## Out of scope

- Editorial rewrites of ported content (verbatim port; format conversion only).
- Restructuring the already-ported `launch-arbitrum-chain` / `stylus` core.
- Vercel/CI wiring (Phase 0.5).
- Translations beyond `en` (move `zh-CN`/`ja` counterparts only if they already exist).
