# Full nav scaffold — design

**Date:** 2026-07-14
**Repo:** `~/OCL/Fumadocs-test` · branch `restructure-content`
**Scope:** Nav shell + landings (NOT the ~250 leaf stubs)

## Goal

Mirror the 9 Docusaurus sidebars from `~/OCL/arbitrum-docs/sidebars.js` into the Fumadocs
information architecture: 9 `root:true` sidebar tabs (with Lucide icons) + a 7-entry top navbar
(incl. a "Build apps" dropdown). Un-ported trees get section + first-level-category landing
pages only; leaf pages stay unstubbed (their links are accepted 404s until ported).

## Two nav surfaces

- **Sidebar tabs** — folders with `"root": true` in `meta.json`; the tree-switcher (RootToggle).
- **Top navbar** — hand-authored `baseOptions.links` in `lib/layout.shared.tsx`, independent of the
  file tree. Home of the Build apps `type:'menu'` dropdown.

## 9 root:true trees

| Tree (folder)              | Source sidebar            | Status              | Icon             |
| -------------------------- | ------------------------- | ------------------- | ---------------- |
| `get-started`              | getStartedSidebar         | ported (patch meta) | `Rocket`         |
| `build-decentralized-apps` | buildAppsSidebar          | new                 | `Code`           |
| `stylus`                   | buildStylusSidebar        | ported (patch meta) | `Braces`         |
| `arbitrum-essentials`      | arbitrumEssentialsSidebar | new                 | `BookOpen`       |
| `launch-arbitrum-chain`    | runArbitrumChainSidebar   | ported (patch meta) | `Network`        |
| `run-a-node`               | runNodeSidebar            | ported (patch meta) | `Server`         |
| `how-arbitrum-works`       | howItWorksSidebar         | new                 | `Cog`            |
| `arbitrum-bridge`          | bridgeSidebar             | new                 | `ArrowLeftRight` |
| `notices`                  | noticeSidebar             | new                 | `Bell`           |

`audit-reports` stays a single page (not a tab), reachable via get-started.

Root `content/docs/en/meta.json` `pages` extended to list all 9 trees + `audit-reports`.

## 7 navbar entries (`lib/layout.shared.tsx`)

1. Get started → `/docs/get-started`
2. Build apps (menu) → Solidity `/docs/build-decentralized-apps`, Stylus `/docs/stylus`,
   Arbitrum essentials `/docs/arbitrum-essentials`
3. Run a chain → `/docs/launch-arbitrum-chain`
4. Run a node → `/docs/run-a-node`
5. How Arbitrum works → `/docs/how-arbitrum-works`
6. Bridge → `/docs/arbitrum-bridge`
7. Notices → `/docs/notices`

All URLs keep the existing `${prefix}` locale handling.

## Landings created (index.mdx + meta.json), first-level categories only

| Tree                       | index.mdx files                                                                               |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| `build-decentralized-apps` | section → 1                                                                                   |
| `arbitrum-essentials`      | section + `bridging`, `arbitrum-vs-ethereum`, `precompiles`, `nodeinterface`, `reference` → 6 |
| `how-arbitrum-works`       | section + `deep-dives`, `reference`, `bold`, `timeboost` → 5                                  |
| `arbitrum-bridge`          | section → 1                                                                                   |
| `notices`                  | section → 1                                                                                   |

## Stub frontmatter policy (Zod contract from `source.config.ts`)

Required: `title`, `description`, `content_type` (enum), `author`, `sme`.

- `title` — from the source sidebar label
- `description` — one-line summary
- `content_type` — `concept` (matches existing landings)
- `author` / `sme` — `gblanchemain`
- no `draft` (landings must stay visible)

## Body / link-hygiene policy

- Landing bodies link via `<Cards>` **only to pages that exist** — section landings link to their
  created category landings. No fabricated cards to unstubbed leaves (avoids in-section broken links).
- Leaf-less trees (bridge, notices, build-decentralized-apps) and leaf-less category landings get a
  short intro paragraph noting content is being ported, optionally an external link to the live
  `docs.arbitrum.io` section. External links aren't checked by `check-links`.

## Verification gate

`pnpm types:check` · `pnpm partials:check` · `pnpm references:check` ·
`pnpm check-links` (new cross-section 404s to un-ported leaves = accepted; `/img/*` = false positives) ·
`pnpm format` (MDX excluded). Manual `pnpm dev` smoke: 9 tabs render with icons, Build apps dropdown
works, all landings return 200.

## Guardrails (YAGNI)

No ~250 leaf stubs. No new generator script. No touching ported sections' internal files. en only
(no zh-CN/ja landings this pass).
