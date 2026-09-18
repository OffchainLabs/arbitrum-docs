# Partial Page Versioning — Design

**Date:** 2026-07-17
**Status:** Approved, in implementation
**Branches:** `versioning-test` (option #1, sibling files), `versioning-folders` (option #2, subfolders)

## Goal

Add per-page version selection to a **hand-picked set of pages**, not the whole doc set.
Initial set (English only):

- `run-a-node/start-here.mdx`
- `run-a-node/run-batch-poster.mdx`
- `run-a-node/nitro/build-nitro-locally.mdx`

Each versioned page exposes **Latest** (the live page) plus **one archived** version. Readers
switch via a dropdown on the page; switching navigates to a shareable URL (`?v=<id>`). Latest is
the clean canonical URL. Non-English locales always render Latest.

## Reader UX

- A version dropdown appears **only** on versioned pages, in the existing title row (beside
  `MarkdownCopyButton`).
- Selecting an older version links to `?v=<id>` (SSR-rendered, bookmarkable). Selecting Latest links
  to the bare path.
- The dropdown label per version is a free-form string (e.g. `"ArbOS 20 (v1)"`), read from the
  archive file's `version` frontmatter field. Latest's label is a constant in the registry.

## Key platform constraint (verified)

Fumadocs matches collection files with **picomatch**. Array patterns are pure **OR** — a `!`-negated
pattern does **not** subtract from positive matches (verified against the installed `picomatch@4.0.4`).
Consequences:

- **Excluding a suffix** (`*.vN.mdx`) is possible with a single **extglob** include:
  `**/!(*.v+([0-9])).mdx` matches every `.mdx` except `*.v<digits>.mdx` (verified).
- **Excluding a subfolder** cannot be done via negation, so subfolder-based versions must live
  **outside** the routed collection dir.

## Shared architecture (both branches)

1. **Second, non-routed collection `docsVersions`** in `source.config.ts`, using
   `defineCollections({ type: 'doc' })` — the same idiom the repo already uses for `glossary`. It
   compiles the archive MDX but is **not** passed to the routing `loader()`, so archives never appear
   in nav, search, sitemap, or `llms.txt`.
2. **Schema:** add an optional `version: z.string().optional()` field to the shared page schema so
   archive files can carry a human label while still satisfying the doc contract (title, description,
   content_type, author, sme).
3. **`lib/versions.ts`** — registry module mirroring `lib/references.ts`:
   - Declares an explicit `VersionedEntry` interface (`title`, `description`, `body`, `toc`,
     `version`, `path`) because the generated collection module is `@ts-nocheck`/`any`.
   - Casts the imported `docsVersions` collection to `VersionedEntry[]`.
   - `VERSIONED: Record<canonicalSlug, VersionMeta[]>` — ordered version list per slug, where
     `VersionMeta = { id, label, archivePath? }`. `id: 'latest'` is the live page (no archivePath).
   - `getVersions(slug): VersionMeta[] | undefined`.
   - `getArchive(slug, id): VersionedEntry | undefined` — looks up the archive entry by path.
4. **`components/VersionSwitcher.tsx`** — client dropdown, rendered only when `getVersions(slug)` is
   defined. Uses `next/link` to `?v=<id>` (or bare path for Latest). Marks the current selection from
   the `v` search param.
5. **`app/[lang]/docs/[[...slug]]/page.tsx`** — add `searchParams`:
   - Resolve live `page = source.getPage(slug, lang)` as today; 404 if absent.
   - Compute `canonicalSlug = (slug ?? []).join('/')`. If `lang === 'en'` and `getVersions(slug)` is
     defined, render the switcher.
   - If `?v=<id>` names a valid archive, render that entry's `body`/`toc`/`title`/`description`
     instead of the live page's, and point the GitHub "edit" link at the archive file path.
   - Unknown/absent `v`, or non-versioned page → render Latest exactly as today.

## Branch `versioning-test` — sibling files (option #1)

- Archives live beside the page: `content/docs/en/run-a-node/start-here.v1.mdx`, etc.
- Main `docs` collection: `files: ["**/!(*.v+([0-9])).mdx", "**/*.json"]` (exclude archive suffix,
  keep meta).
- `docsVersions`: `dir: 'content/docs'`, `files: ["**/*.v+([0-9]).mdx"]`.

## Branch `versioning-folders` — subfolders (option #2)

- Versions root **outside** `content/docs` (router never sees it), mirroring how `content/partials/`
  sits outside the routed tree: `content/_versions/<id>/<locale>/run-a-node/start-here.mdx`.
- Main `docs` collection: **unchanged** (no glob override needed).
- `docsVersions`: `dir: 'content/_versions'`, `files: ["**/*.mdx"]`.
- `lib/versions.ts` differs only in the `archivePath` values it maps to.

## Edge cases

- `?v=` with an unknown/unregistered id → fall back to Latest (no 404).
- Non-versioned pages ignore `searchParams` — zero behavior change.
- Non-English locales → Latest only (archives are English for this initial set).
- Archive relative links reuse the live `page` for `createRelativeLink` (same slug location).

## Out of scope (YAGNI)

- More than one archived version per page (registry structure already supports N; content not
  authored).
- A global/site-wide version switcher.
- Versioning nav/meta structure or partials.
- Localized archives.

## Rollout plan

1. Implement fully on `versioning-test` (option #1); verify build + rendering.
2. Branch `versioning-folders` off `main`; reimplement with only storage + config + registry-path
   differences. Component and page logic are identical.
