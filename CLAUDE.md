# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working with branches

Always confirm with the user before choosing which branch to commit to, push to, or modify — especially when multiple branches are in play (stacked PRs, feature branches). Do not assume the user agrees with a branch choice just because it seems logical. Ask first, act after confirmation.

## Project overview

Arbitrum documentation portal ([docs.arbitrum.io](https://docs.arbitrum.io/)), built with Docusaurus 3.10.x, React 19, MDX, TypeScript 6.x. Package manager: Yarn. Node 22.x.

## Commands

```shell
yarn                              # Install dependencies
yarn start --no-open              # Dev server (always use --no-open)
yarn build                        # Production build (installs SDK deps, syncs Stylus, builds)
vercel build                      # Vercel-parity build (use to verify before deploying)
yarn serve --no-open              # Serve built site locally
yarn typecheck                    # TypeScript checking (tsc --noEmit)
yarn format                       # Prettier (docs + app + check)
yarn lint:markdown                # Markdownlint on docs/**/*.{md,mdx} (excludes docs/sdk/)
yarn lint:markdown:fix            # Auto-fix markdown lint issues
yarn generate-precompiles-ref-tables  # Regenerate precompile reference tables
yarn update-variable-refs         # Propagate globalVars.js changes into doc files
yarn build-glossary               # Rebuild glossary from partials/glossary/*.mdx
node scripts/sync-stylus-content.js   # Refresh checked-in Stylus examples in docs/stylus-by-example/
yarn find-orphan-pages            # Find docs not linked in sidebars
yarn sync-redirects               # Sync redirects.config.js → vercel.json
```

## Architecture

### Strict link enforcement

`onBrokenLinks: 'throw'` and `onBrokenMarkdownLinks: 'throw'` in `docusaurus.config.js`. Builds fail on any dead link. Always verify links after renaming/moving files.

`onBrokenAnchors` is set to `'warn'` (not `'throw'`) because the generated SDK pages in `docs/sdk/` emit false-positive anchor warnings. These are expected and not actionable.

### Edge middleware

`middleware.ts` runs on Vercel Edge (`@vercel/edge`). It serves raw Markdown to LLM/agent user-agents via content negotiation and dispatches PostHog server-side tracking. The tracking logic lives in `lib/llms-tracking.ts` and is tested via `yarn test:llms-tracking`.

### Stylus and SDK content origins

- `docs/stylus-by-example/` is checked into this repo directly (no submodule, no `.gitmodules`). To refresh from the upstream `stylus-by-example` source, run `node scripts/sync-stylus-content.js`.
- `docs/sdk/` contains previously generated TypeDoc output. There is no live regeneration script in this repo today — treat the files as checked-in content and edit cautiously if needed.

### Global variables and markdown preprocessor

`src/resources/globalVars.js` defines version numbers, snapshot URLs, gas parameters, and chain config used across docs. Variables are embedded in MDX files as `@@variableName=value@@` and resolved by `scripts/markdown-preprocessor.js` at build time.

**After modifying globalVars.js**, run `yarn update-variable-refs` to update all doc files (required for Vercel cache invalidation).

### Partials convention

Files starting with `_` in `docs/partials/` are reusable content fragments. The `parseFrontMatter` hook in `docusaurus.config.js` clears their frontmatter to suppress Docusaurus warnings. Partials are content-rich and imported across many pages — changes propagate widely, so trace imports before editing.

### Sidebar configuration

`sidebars.js` defines all navigation sidebars. It imports generated sidebars from:

- `sdk-sidebar.js` — auto-generated SDK API sidebar
- `docs/stylus-by-example/*/sidebar.js` — Stylus examples sidebars

### Pre-commit hooks (Husky)

The pre-commit hook (`.husky/pre-commit`) runs on staged files only:

1. Prettier formatting + re-stage
2. Markdownlint (excludes `docs/sdk/`)
3. TypeScript type checking (if .ts/.tsx files staged)

The hook also contains a submodule-update step, but it only fires if `.gitmodules` is staged — the repo has no submodules, so it never runs.

Skip with `HUSKY=0 git commit` when needed.

### Key directories

- `docs/` — MDX documentation content (routed at `/`)
- `docs/partials/` — reusable content (prefixed with `_`) + ~110 glossary partials
- `src/components/` — React components (interactive diagrams, address helpers, quicklooks)
- `src/plugins/` — remark/rehype transforms that generate the LLM-crawlable `llms.txt` output
- `src/resources/globalVars.js` — shared variables injected into docs
- `src/theme/` — Docusaurus theme overrides (Footer, Layout, NotFound)
- `scripts/` — build tooling, content sync, doc auditing
- `static/` — images, PDFs, JSON data

### Path aliases

`tsconfig.json` defines `@/*` and `@site/*` both mapping to project root.

## Content writing guidelines

The canonical editorial reference is [`docs/Offchain-pattern-guide.md`](docs/Offchain-pattern-guide.md) — it defines content types, writing principles, and the full terminology guide. The rules below are a condensed quick-reference; when they're silent or ambiguous, defer to the pattern guide.

### Terminology

| Use                     | Don't use             |
| ----------------------- | --------------------- |
| decentralized app → app | dapp, dApp            |
| onchain                 | on-chain              |
| cross-chain             | crosschain            |
| Rollup (capital R)      | rollup                |
| AnyTrust                | anytrust              |
| `ERC-20`, `ERC-721`     | ERC20                 |
| allowlist/denylist      | whitelist/blacklist   |
| Your Arbitrum chain     | L3 Orbit chain        |
| bond                    | stake (for proposing) |

### Document frontmatter

Every doc must include:

```yaml
---
title: 'Document title (appears as H1)'
sidebar_label: 'Shortened title for sidebar'
description: 'SEO-friendly description'
user_story: 'As a <role>, I want to <goal>'
content_type: 'how-to | concept | quickstart | tutorial | reference | troubleshooting'
author: '<github-username>'
sme: '<github-username>'
---
```

### Style rules

- Sentence case for headings
- Tag code blocks with `shell` not `bash`
- American English spelling
- Spell out "and"/"or" (not & or /)
- Separate procedural from conceptual content

### Authoring conventions

- Use `<VanillaAdmonition type="…">` instead of Docusaurus `:::info` / `:::note` for callouts in MDX. The component is registered globally via `src/theme/MDXComponents.js`, so no import is needed.
- PR descriptions start from `.github/pull_request_template.md` — preserve its top-level headings (`## Description`, `## Document type`, `## Checklist`, `## Additional Notes`) and fill the sections rather than replacing them.
- See `AGENTS.md` at the repo root for notes on relevant agents/subagents/skills used while working in this repo.

## Known harmless build noise

Don't chase these — they're transitive-dep noise from upstream packages:

- `image at "...svg" can't be read correctly` / `unsupported file type: undefined` — `image-size` v2 dropped SVG support; Docusaurus's mdx-loader still calls it on every image. Affects build output only; rendered SVGs are fine.
- `Critical dependency: require function is used in a way...` (`vscode-languageserver-types`) — UMD dynamic require from `mermaid` → `chevrotain` → `vscode-languageserver`.
- `Can't resolve 'bufferutil' / 'utf-8-validate'` (in `ws/lib/...`) — optional native bindings; `ws` falls back to JS without them.
- `[docusaurus-plugin-llms-txt] WARNING: Excluded N routes by current config` — informational; the plugin reports how many routes matched `nonCanonicalRoutePatterns` in `docusaurus.config.js` (SDK subtrees, hosted PDFs, partials, category pages). Not an error, just a count.

## Security audit workflow

- `yarn audit --level moderate` lists advisories at moderate or higher.
- `package.json` has a `resolutions` block to pin transitive deps with security fixes (currently `elliptic` and `serialize-javascript`). Update resolutions when new advisories appear that aren't reachable through a direct-dep bump.
- Dependabot opens PRs labeled `dependencies`. Some are obsoleted by `resolutions` entries — check before merging.
