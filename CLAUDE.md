# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Arbitrum Docs — a Docusaurus 3.6.3 site serving technical documentation at docs.arbitrum.io. The repo contains 450+ MDX docs organized by audience (developers, node operators, chain builders, users) plus React components, build scripts, and two git submodules (arbitrum-sdk, stylus-by-example).

## Commands

```bash
# Install dependencies
yarn

# Initialize submodules (required for first setup)
git submodule update --init --recursive

# Development server
yarn start

# Production build (installs SDK deps, syncs stylus content, then builds)
yarn build

# Serve production build locally
yarn serve

# Format all files (docs + app code)
yarn format

# Check formatting only
yarn format:check

# Lint markdown (excludes docs/sdk/)
yarn lint:markdown
yarn lint:markdown:fix

# TypeScript type checking
yarn typecheck

# Generate SDK docs from submodule source
yarn generate-sdk-docs

# Build glossary from partial files
npx tsx scripts/build-glossary.ts

# Generate doc manifest (scans all docs into .audit/doc-manifest.json)
yarn generate-doc-manifest

# Run doc audit (generates manifest then audits)
yarn audit-docs

# Update variable references in docs after changing globalVars.js
yarn update-variable-refs

# Generate precompile reference tables
yarn generate-precompiles-ref-tables
```

Node >= 22.0.0 is required. Yarn is the package manager.

## Validation workflow

**IMPORTANT**: `yarn build` is slow (~30-40s). Use faster commands for iteration:

```bash
# Quick validation (1-2 seconds) - use this for most checks
yarn lint:markdown && yarn format:check

# Dev server with hot reload (10-15s initial, then instant updates)
yarn start

# Full production build (slow, only use before committing)
yarn build
```

**Recommended workflow when making doc changes:**

1. Make changes to MDX files
2. Run quick validation: `yarn lint:markdown && yarn format:check`
3. If you need to verify links/sidebar structure, use `yarn start` (has hot reload)
4. Only run `yarn build` as final verification before committing

Common issues caught by each:

- `lint:markdown` - Markdown syntax errors, formatting issues
- `format:check` - Code/doc formatting problems
- `start` - Broken links, missing sidebar docs, MDX compilation errors
- `build` - Everything above + production-specific issues

## Architecture

### Content organization

- `docs/` — MDX documentation files organized by section (build-decentralized-apps, stylus, how-arbitrum-works, run-arbitrum-node, launch-arbitrum-chain, etc.)
- `docs/partials/` — Reusable content fragments; filenames start with `_` (Docusaurus strips their frontmatter automatically via `docusaurus.config.js` `parseFrontMatter`)
- `docs/sdk/` — **Auto-generated** from TypeDoc; do not edit manually
- `docs/stylus-by-example/` — **Auto-generated** from submodule; do not edit manually
- `docs/partials/glossary/` — Glossary term files with specific frontmatter format (`title`, `key`, `titleforSort`)

### Doc frontmatter

Documents use frontmatter with fields: `title`, `description`, `sidebar_label`, `sidebar_position`, `content_type` (quickstart | how-to | concept | reference | faq | gentle-introduction | troubleshooting), `author`, `sme`.

### Application code

- `src/components/` — React components used within docs (ImageZoom, InteractiveDiagrams, Quicklooks, etc.)
- `src/resources/globalVars.js` — Chain-specific parameters (docker images, RPC endpoints, contract addresses, block times). After modifying, run `yarn update-variable-refs` to propagate changes into docs.
- `src/resources/precompilesInformation.js` — Precompile metadata
- `src/theme/` — Docusaurus theme overrides
- `src/css/custom.scss` — Global styles

### Navigation

`sidebars.js` (1600+ lines) defines all sidebar navigation. There are 8+ sidebars: getStartedSidebar, buildAppsSidebar, stylusSidebar, runArbitrumChainSidebar, runNodeSidebar, bridgeSidebar, howItWorksSidebar, noticeSidebar.

### Build pipeline

- `docusaurus.config.js` — Main config; uses a custom markdown preprocessor (`scripts/markdown-preprocessor.js`), remark-math/rehype-katex for LaTeX, Mermaid diagrams, and TypeDoc plugin for SDK generation
- Docusaurus routes docs at `/` (not `/docs/`)
- Broken links and broken markdown links both configured to `throw` (build fails on broken links)
- Vercel deployment with extensive URL redirects in `vercel.json`

### Submodules

- `submodules/arbitrum-sdk/` — TypeScript SDK source; TypeDoc generates `docs/sdk/` from this
- `submodules/stylus-by-example/` — Stylus examples; synced via `yarn sync-stylus-content`

### Scripts

`scripts/` contains tooling for content generation and maintenance:

- `generate-doc-manifest.ts` — Scans all docs, outputs compact JSON manifest to `.audit/doc-manifest.json`
- `audit-docs.ts` — Documentation quality auditing
- `sync-stylus-content.js` — Copies content from stylus-by-example submodule
- `build-glossary.ts` — Generates glossary page from `docs/partials/glossary/_*.mdx` files
- `precompile-reference-generator.ts` — Generates precompile reference tables
- `update-variable-references.ts` — Propagates globalVars.js values into docs
- `markdown-preprocessor.js` — Custom MDX preprocessing for Docusaurus

## Style conventions

- Sentence-case for titles, headers, sidebar labels
- Address reader as "you"; informal professional tone
- Descriptive link text (avoid "click here")
- Prettier formatting via `@offchainlabs/prettier-config`; MDX files use mdx parser
- Markdown linting via markdownlint with many rules relaxed (see `.markdownlint.json`)
- Prism syntax highlighting supports: solidity, rust, bash, toml (in addition to defaults)
