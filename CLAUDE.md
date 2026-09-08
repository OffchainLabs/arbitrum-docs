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
yarn build                        # Production build (yarn && yarn clear && docusaurus build — always a cold rebuild)
vercel build                      # Vercel-parity build (use to verify before deploying)
yarn serve --no-open              # Serve built site locally
yarn typecheck                    # TypeScript checking (tsc --noEmit)
yarn format                       # Prettier (docs + app + check)
yarn lint:markdown                # Markdownlint on docs/**/*.{md,mdx}
yarn lint:markdown:fix            # Auto-fix markdown lint issues
yarn generate-precompiles-ref-tables  # Regenerate precompile reference tables
yarn update-variable-refs         # Propagate globalVars.js changes into doc files
yarn build-glossary               # Rebuild glossary from partials/glossary/*.mdx
yarn generate                     # Run all generators (precompiles, contract addresses, glossary, variable refs)
yarn generate:check               # Same, --check mode — CI fails if generated files are stale
yarn test:llms-tracking           # Test middleware tracking logic
node scripts/sync-stylus-content.js   # Refresh Stylus examples — NOTE: expects submodules/stylus-by-example, which no longer exists
yarn find-orphan-pages            # Find docs not linked in sidebars
yarn sync-redirects               # Sync redirects.config.js → vercel.json
```

## Architecture

### Strict link enforcement

`onBrokenLinks: 'throw'` and `onBrokenMarkdownLinks: 'throw'` in `docusaurus.config.js`. Builds fail on any dead link. Always verify links after renaming/moving files.

`onBrokenAnchors` is set to `'warn'` (not `'throw'`) because TypeDoc-generated pages emit false-positive anchor warnings. These are expected and not actionable.

### Edge middleware

`middleware.ts` runs on Vercel Edge (`@vercel/edge`). It serves raw Markdown to LLM/agent user-agents via content negotiation and dispatches PostHog server-side tracking. The tracking logic lives in `lib/llms-tracking.ts` and is tested via `yarn test:llms-tracking`.

### Stylus and SDK content origins

- `docs/stylus-by-example/` is checked into this repo directly (no submodule, no `.gitmodules`). Its `DONT-EDIT-THIS-FOLDER` marker points at `submodules/stylus-by-example`, which no longer exists — so edit the files here directly. `node scripts/sync-stylus-content.js` still exists but expects that missing submodule.
- **The SDK API docs subsystem is dead.** `docs/sdk/` and `scripts/sdkDocsHandler.ts` no longer exist; `sdk-sidebar.js` is orphaned; `docs/api/` is a 3-file stub not referenced by `docusaurus.config.js`. The `sdk-docs` job in `.github/workflows/update-external-content.yml` still targets them and would fail if run. Do not treat any of these as a live pipeline.

### Global variables and markdown preprocessor

`src/resources/globalVars.js` defines version numbers, snapshot URLs, gas parameters, and chain config used across docs. Variables are embedded in MDX files as `@@variableName=value@@` and resolved by `scripts/markdown-preprocessor.js` at build time.

**After modifying globalVars.js**, run `yarn update-variable-refs` to update all doc files (required for Vercel cache invalidation).

### Partials convention

Files starting with `_` in `docs/partials/` are reusable content fragments. The `parseFrontMatter` hook in `docusaurus.config.js` clears their frontmatter to suppress Docusaurus warnings. Partials are content-rich and imported across many pages — changes propagate widely, so trace imports before editing.

### Generated content — do not hand-edit

`docs/api/`, `docs/stylus-by-example/`, `docs/partials/glossary/` (138 files), `docs/partials/_reference-arbitrum-contract-addresses-partial.mdx`, `docs/run-arbitrum-node/nitro/cli-flags-reference.mdx`, `docs/run-arbitrum-node/assign-node-roles.mdx`, and `vercel.json` (generated from `redirects.config.js`). `docs/superpowers/` holds internal plans/specs, not published docs.

### Sidebar configuration

`sidebars.js` (1855 lines) defines all navigation sidebars and is **self-contained — it imports nothing**. `sdk-sidebar.js` and `docs/stylus-by-example/*/sidebar.js` exist on disk but are not imported by it.

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

ALWAYS READ THE [PATTERN GUIDE](docs/Offchain-pattern-guide.md) AND APPLY ITS RULES IN YOUR WRITING

- **One Quicklook per term per file.** Wrap a term in `<a data-quicklook-from='…'>` on its first mention only. Leave every later mention of that same term as plain text.

## PR Authoring conventions

- PR descriptions start from `.github/pull_request_template.md` — preserve its top-level headings (`## Description`, `## Document type`, `## Checklist`, `## Additional Notes`) and fill the sections rather than replacing them.
- See `AGENTS.md` at the repo root for notes on relevant agents/subagents/skills used while working in this repo.

## Security audit workflow

- `yarn audit --level moderate` lists advisories at moderate or higher.
- `package.json` has a `resolutions` block to pin transitive deps with security fixes (currently `elliptic` and `serialize-javascript`). Update resolutions when new advisories appear that aren't reachable through a direct-dep bump.
- Dependabot opens PRs labeled `dependencies`. Some are obsoleted by `resolutions` entries — check before merging.
