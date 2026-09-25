# Partials registry — design

Date: 2026-07-09
Status: implemented (branch `partials-registry`)

## Problem

Reusable `_`-prefixed MDX fragments ("partials") had two good properties — a single source of truth,
and includability anywhere — but two problems:

- **Discoverability.** A writer creating new content might not know a partial exists and duplicate it.
- **Fragility.** Includes broke builds and induced edge cases: broken relative paths on file moves,
  routing/frontmatter leaks, context-dependent MDX, and i18n drift.

Scope: the Fumadocs target only. Discoverability is solved by making partials easy to find (a
generated catalog), not by fuzzy duplication detection.

## Approach: keep `<include>`, fix its management

Partials stay markdown and keep the native Fumadocs `<include>` mechanism. Everything around it is
fixed:

### 1. Single un-routable root

Partials live in **`content/partials/`**, outside the doc collection `dir`. They are structurally
un-routable, so the `_`-prefix + glob-exclusion machinery in `source.config.ts` is deleted. Mapping
from the old location drops the locale and the `partials/` path segment, preserving grouping:
`content/docs/<locale>/A/B/partials/_x.mdx` → `content/partials/A/B/_x.mdx`.

### 2. Root-anchored includes for doc→partial

Doc→partial includes use `<include cwd>content/partials/…</include>`. `cwd` resolves from the repo
root, so moving a consuming page never touches its includes. `move-doc`/`restructure` recognize
`cwd` includes (via `doc-links.extractRefs`) and never rewrite them.

**Partial→partial includes are file-relative**, not `cwd`. A partial may be compiled outside the docs
pipeline (when ESM-imported as a component — see below), where fumadocs-mdx's `cwd` context is
`undefined` and crashes the build. Relative includes resolve correctly in both compile contexts.

### 3. Two consumption paths, both tracked

Partials are consumed as `<include>` directives **and** as ESM imports of MDX component modules
(e.g. `FloatingHoverModal`: `import X from '@/content/partials/…/_x.mdx'`). The tooling knows about
both: usage counts, migration rewrites, and lint resolution all cover imports as well as includes.

### 4. Generated catalog for discoverability

`scripts/generate-partials-catalog.mjs` emits, always fresh:

- `content/partials/CATALOG.md` — human index grouped by area: title, summary, tags, usage count,
  and a copy-paste `<include cwd>` snippet. Search by **intent** (summary + tags), not filename.
- `content/partials/manifest.json` — machine index so agents grep it and reuse instead of duplicating.

Titles/summaries/tags are auto-derived (frontmatter title → first heading → humanized name; first
prose sentence; path + filename words). An optional `content/partials/registry.json` overrides
`summary`/`tags`/`scope` per partial. Zero required maintenance.

### 5. Lint (`scripts/partials-check.mjs`)

- **R1** every `<include>` and every partial ESM import resolves; no `cwd` include inside a partial.
- **R2** no `_`-prefixed partial under `content/docs/` (routing-leak guard).
- **R3** (warnings) vestigial frontmatter; top-level H1; component neither globally registered nor imported.
- **R4** `registry.json` entries map to real partials; `scope ∈ {neutral, localized}`.
- **R6** `CATALOG.md` / `manifest.json` are up to date.

### i18n

Partials are `neutral` (one shared copy) by default. Prose that needs translation is marked
`localized` and mirrored per-locale; R5 (inert until non-`en` content exists) enforces coverage.

## Files

- `scripts/lib/partials.mjs` — shared layer (locate, parse/resolve includes + imports, derive metadata).
- `scripts/migrate-partials.mjs` — one-shot codemod (move + rewrite includes + rewrite imports).
- `scripts/generate-partials-catalog.mjs` — catalog + manifest (`--check` for CI).
- `scripts/partials-check.mjs` — the guardrail lint.
- `scripts/lib/doc-links.mjs` — extended so `cwd` includes are recognized and never rewritten on move.
- `source.config.ts` — dropped the now-dead partial-exclusion globs.

## Verification

`pnpm partials:check` passes (2 expected frontmatter warnings); `pnpm types:check` and `pnpm build`
succeed with both consumption paths resolving. The codemod was validated by resetting the content
tree and re-running end-to-end.
