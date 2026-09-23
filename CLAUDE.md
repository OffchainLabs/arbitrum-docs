# CLAUDE.md

> **Machine-facing. Not written for humans, and not the canonical documentation.**
>
> This file provides guidance to Claude Code (claude.ai/code) when working with code in this
> repository. It is tied to a specific commercial tool; parts of it are rewritten automatically by
> `next dev`.
>
> The canonical docs are [README.md](README.md) (how to work on the docs) and
> [INTERNALS.md](INTERNALS.md) (how the codebase works, and why). Humans should read those.
>
> **Duplication here is expected and fine** — agents need the context in-session, so anything
> canonical that an agent needs belongs in this file too. When the same material lives in both
> places, **edit INTERNALS.md first**, then mirror what agents need back here.

Arbitrum documentation portal — a Next.js 16 / Fumadocs migration of [`OffchainLabs/arbitrum-docs`](https://github.com/OffchainLabs/arbitrum-docs) off Docusaurus. Serves English MDX docs (single locale; i18n was removed 2026-08-18). Phase 0 MVP: single-committer. CI landed 2026-08-17 (`.github/workflows/`); the repo is linked to the Vercel project `fumadocs-test`.

## Commands

```bash
pnpm install        # runs `fumadocs-mdx` postinstall → regenerates .source/
pnpm dev            # http://localhost:3000
pnpm types:check    # fumadocs-mdx && next typegen && tsc --noEmit — the verification gate
pnpm build          # next build --experimental-build-mode=compile
pnpm start          # serve the production build
pnpm partials:catalog  # regenerate content/partials/CATALOG.md + manifest.json
pnpm partials:check    # validate partials: include/import resolution, no routing leak, catalog freshness
pnpm test              # node --test over scripts/**/*.test.mjs (6 suites)
pnpm check-links       # broken internal doc links
pnpm content:lint      # MDX structural defects (stray :::, admonition shape)
pnpm vars:check        # every <Var name> resolves in content/vars.json
pnpm nav:check         # meta.json nav integrity
pnpm references:check  # glossary ids + <Reference> targets
pnpm drift             # compare content tree against upstream arbitrum-docs
pnpm tree:map          # injective legacy-path -> current-path map; fails on a duplicate target
pnpm redirects:legacy  # regenerate the legacy docs.arbitrum.io redirect map
pnpm redirects:current # regenerate the live docs.arbitrum.io -> /docs redirect map
pnpm redirects:check   # every redirect destination is a real page (needs `pnpm dev` running)
pnpm format:check      # prettier
pnpm precompiles:check # precompile tables match the pinned Nitro refs (--check = no writes)
pnpm nitro:check-release  # bump the pinned Nitro release in content/vars.json
pnpm nitro:image-check    # hardcoded nitro-node image tags match the pin (blocking gate)
```

- **CI runs on push and PR to `main` ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) in three jobs — only the first one blocks.** A green PR does not mean the content is clean: ten checks block, two report and pass anyway.
  - **`Gates` (blocking):** `types:check`, `test`, `vars:check`, `nav:check`, `partials:check`, `node scripts/versioned-docs-check.mjs`, `references:check`, `nitro:image-check`, `check-links`, `content:lint`. Fumadocs has no `onBrokenLinks: 'throw'`, so `check-links` supplies it — `pnpm build` now chains it ahead of `next build`, which fails the Vercel deploy on a broken link as well. It does **not** validate anchors, so a live page with a dead `#anchor` still passes; verify those in a browser.
  - **`Content debt` (non-blocking):** `format:check` alone now, marked `continue-on-error`; it still fails on pre-existing debt (49 files as of 2026-09-21). `content:lint` reached zero and moved into `Gates` on 2026-09-21, after `references:check` (2026-08-20) and `check-links` (2026-08-31). The job comment records the count as of the last update; **promote a step into `Gates` once its count reaches zero.** That promotion is the point of the split — the tier is a backlog, not a policy.
  - **`Build` (non-blocking):** `pnpm build`, deliberately not blocking — the MDX image pipeline fetches remote images at build time, so a dead third-party URL turns it red for reasons unrelated to the change under review. It still catches MDX compile errors that `types:check` cannot see.
- **`drift`, `precompiles:check`, `redirects:legacy` and `redirects:check` run nowhere automatically** — invoke them by hand. `redirects:check` cannot run in CI as-is: it reads `/llms.txt` off a running site, because no plain-node script can import `lib/source` (neither the `collections/*` alias nor TypeScript resolves — the same wall `versioned-docs-check` hits, which is why that one text-parses `lib/versions.ts`). Point it at a Vercel preview with `--base-url` to check a PR. `types:check` regenerates the collection, generates Next types, then type-checks. `build` runs `versioned-docs-check` then `check-links` first.
- **`upstream-refresh.yml`** runs Mondays 08:00 UTC (and on `workflow_dispatch`): `nitro:check-release`, then `precompiles:generate`, then opens `automated/upstream-refresh` as a PR if anything changed. It never writes to `main`, and no-ops when the tree is clean.
- **`types:check` proves the schema, not the render.** It exits 0 on pages that serve literal `:::`, `undefined`, or HTTP 500. Confirm content changes in a browser on `http://localhost:3000` — on `127.0.0.1` React does not hydrate and every component looks broken.
- **Node 22 only** (`>=22 <23`), pnpm 10. Other Node majors are rejected by `engines`.
- The `.source/` directory is generated by `fumadocs-mdx` (postinstall / `types:check` / build). Never hand-edit it; regenerate instead.

## Architecture

**Build → render pipeline** (understanding it requires reading `source.config.ts`, `lib/source.ts`, and `app/docs/[[...slug]]/page.tsx` together):

1. `fumadocs-mdx` scans `content/docs/**`, validates every page's frontmatter against the Zod schema in `source.config.ts`, and emits the `.source/` collection.
2. `lib/source.ts` runs Fumadocs `loader()` over that collection with the icons plugin → the exported `source` object.
3. Route handlers read `source`: `app/docs/[[...slug]]/page.tsx` renders pages; the `llms.txt`, `llms-full.txt`, `llms.mdx/`, and `og/` routes all derive from the same `source`. Change the content model in one place and every consumer follows.

**`source` is a deliberate choke point — treat `source.config.ts` + `lib/source.ts` as one unit.** Seven files under `app/` import it (five routes, the docs page, the docs layout) and nothing else reads content:

- `docs.toFumadocsSource()` is the **only** adapter for `.source/`. Never build a second read path.
- `baseUrl` is an argument to the single `loader()` call. A second loader would restate it and silently drift page URLs.
- Helpers are typed `(typeof source)['$inferPage']`, so editing the frontmatter schema re-types every helper and every consumer at once.
- `postprocess.includeProcessedMarkdown: true` is what makes `getLLMText()`'s `page.data.getText('processed')` work — remove it and the `llms*` routes break, far from where the flag lives.
- Put URL derivation next to `source` (`getPageImage`, `getPageMarkdownUrl`, `getLLMText`), not in routes.
- **Server-only.** Never import `lib/source` — or a constant that transitively pulls it — from a client component; it drags the compiled collection into the browser bundle (one such import cost a 24 MB chunk on every docs page). No gate catches this.

**Frontmatter contract (enforced at build).** `source.config.ts` extends the Fumadocs page schema so every non-partial `.mdx` page **must** have `title`, `description`, `content_type`, `author`, `sme`. `content_type` is a fixed enum: `how-to | concept | quickstart | tutorial | reference | troubleshooting | faq`. Optional: `sidebar_label`, `user_story`, `draft`. A missing/invalid field fails `types:check` and `build` — this is the primary reason a build breaks after adding content.

**Partials (registry model).** Reusable `_`-prefixed fragments live in **`content/partials/`** — outside the doc collection `dir` entirely, so they can never be routed (no glob exclusion needed). Two consumption paths, both tracked by the tooling:

- **`<include>` directive** (build-time splice). Doc→partial includes use the root-anchored `<include cwd>content/partials/…</include>` form, so moving a page never breaks its includes. **Partial→partial includes must be file-relative** (`<include>../x.mdx</include>`) — a partial may be compiled outside the docs pipeline when ESM-imported, where fumadocs-mdx's `cwd` context is undefined and crashes. `partials-check` enforces this.
- **ESM import** as an MDX component module: `import X from '@/content/partials/…/_x.mdx'`. Supported by the tooling (`scripts/lib/partials.mjs` scans the importer roots) but **currently used by no component** — the last consumer, `FloatingHoverModal`, was deleted as dead code. See the [README](README.md) for the shape.

**Discoverability: before writing a banner, note, config table, or troubleshooting block, search [`content/partials/CATALOG.md`](content/partials/CATALOG.md)** (⌘F by intent) and reuse the partial instead of duplicating prose. `CATALOG.md` + `manifest.json` (for agents) are generated — never hand-edit. Curate titles/summaries/tags in the optional `content/partials/registry.json` (`{ "content/partials/…/_x.mdx": { "summary": "…", "tags": ["…"], "scope": "neutral|localized" } }`). Partials carry no frontmatter (`<include>` strips it; the lint flags vestigial frontmatter).

Design: [`.claude/docs/superpowers/specs/2026-07-09-partials-registry-design.md`](.claude/docs/superpowers/specs/2026-07-09-partials-registry-design.md).

**Routing.** Single locale, no i18n: pages live directly under `content/docs/...` and serve at `/docs/...`. There is no `[lang]` route segment and no locale middleware — `lib/i18n.ts` was deleted 2026-08-18 along with the `ja` and `zh-CN` trees. `proxy.ts` now does exactly two things: (1) an explicit **bypass list** of routes served verbatim (`/_next/`, `/img/`, `/favicon.ico`, `/llms*`, `/og/`, `/api/`), and (2) `.md`-suffix rewrites plus `Accept: text/markdown` content negotiation to the markdown route. **A new top-level route still belongs in that bypass list** or markdown negotiation will try to rewrite it. Re-adding localization means restoring `defineI18n`, the `i18n` argument to `loader()`, a `[lang]` segment, and `createI18nMiddleware`.

**Global variables.** Writer-edited values live in `content/vars.json`, validated by the Zod schema in `content/vars.ts`, and rendered in MDX via `<Var name="..." />`. A bad value fails at module load.

**Never put `<Var>` inside a Markdown link destination** — `[x](https://…/<Var name="y" />/…)`. A destination admits neither JSX nor whitespace, so the link does not parse: MDX emits `[x](` as literal text and GFM autolinks the bare URL prefix, giving the reader a link followed by a raw URL in parentheses. Use `@@varName@@` there instead — `[x](https://github.com/OffchainLabs/@@nitroRepositorySlug@@/blob/@@nitroVersionTag@@/ArbSys.sol)` — which `lib/remark-var-urls.ts` (wired into `remarkPlugins` in `source.config.ts`) resolves against the same `vars` object at build time. **`@@varName@@` in a link destination, `<Var>` everywhere else:** the plugin only walks `link` and `definition` nodes, so a token in prose renders literally. An unknown name fails twice — `vars:check` (blocking) and a render-time throw naming the file. This is the one surviving piece of Docusaurus's `markdown-preprocessor.js`; the migration dropped it, and 73 links across 5 pages rendered broken until 2026-09-21. See [INTERNALS](INTERNALS.md#variables-in-link-destinations-varname).

**Partial versioning.** Archived pages live in `content/_versions/<id>/…` — a separate non-routed collection, outside `content/docs` for the same reason partials are. `lib/versions.ts` indexes them by path; only hand-registered pages are versioned. Spec: [`.claude/docs/superpowers/specs/2026-07-17-partial-versioning-design.md`](.claude/docs/superpowers/specs/2026-07-17-partial-versioning-design.md).

**Glossary / inline references.** `content/glossary/*.mdx` is a reference collection (`{ id, title, sortAs? }` — *not* the page contract), surfaced by `<Reference>` / `<Term>` / `<ReferenceList>` via the registry in `lib/references.ts`. New reference types add a collection plus one registry entry. Spec: [`.claude/docs/superpowers/specs/2026-07-10-references-glossary-design.md`](.claude/docs/superpowers/specs/2026-07-10-references-glossary-design.md).

**Custom MDX components.** `components/mdx.tsx` is the registry and the source of truth — read it rather than trusting a list here. Implementations in `components/mdx/`; Fumadocs' `Accordion`/`Accordions` and `Tab`/`Tabs` are re-exported. Some names are aliases of the same component (`AEL` → `AddressExplorerLink`, `ImageWithCaption` → `ImageZoom`). Unported Docusaurus widgets are mapped to `PendingWidget`, which renders a placeholder — a page using one is not broken, just incomplete. Add a component here to make it available in all MDX.

**Sidebar ordering** is controlled by `meta.json` in each content directory, not by file names.

## Known trade-off (not a bug)

`app/docs/[[...slug]]/page.tsx` has `generateStaticParams` return `[]`, deliberately disabling static prerendering (ISR-on-first-request) to work around a Next 16.2.6 prerender crash — hence `build` uses `--experimental-build-mode=compile`. The inline comment documents the restore path; don't "fix" it without addressing that.

## Conventions

- Theme tokens are `--color-fd-*` (Fumadocs). Never use `--ifm-*` (legacy Docusaurus).
- `lib/shared.ts` holds route constants (`docsRoute`, `docsImageRoute`, `docsContentRoute`) and the git config used for edit links — reference these rather than hardcoding paths.
- **Redirects.** All of them live in `redirects.config.mjs`, consumed by `next.config.mjs`. All three blocks in it are generated — `pnpm move-doc` writes moved-page entries between the `AUTO-GENERATED` markers, `pnpm redirects:legacy` writes `redirects.legacy.mjs`, and `pnpm redirects:current` writes `redirects.current.mjs` (every URL docs.arbitrum.io serves today → the same page under `/docs`, with unresolvable ones parked in `redirects.current.todo.json`) — so never hand-edit it. Next's `redirects()` runs **before** `proxy.ts`, so a redirected URL gets markdown negotiation on the destination, not the first hop. Unresolvable legacy URLs are parked in `redirects.legacy.todo.json` rather than pointed at a plausible page: a redirect to the wrong page is worse than a 404, and `redirects:check` cannot catch one because the destination exists. **That file reached `[]` on 2026-08-31 and is now a tripwire, not a backlog** — a non-empty todo after `pnpm redirects:legacy` means upstream added a redirect this site cannot resolve, so map it in `MANUAL_DESTINATIONS` (confirm the upstream page's frontmatter title against the local candidates) instead of leaving it parked. See [INTERNALS](INTERNALS.md#redirects).
- **Image zoom.** `<ImageZoom>` resolves to the wrapper in `components/mdx/ImageZoom/` (plain `<img>` child; supports `caption`; no dimensions needed; no Next image optimization). To use Fumadocs' native component instead — for `_next/image` optimization — import it per file: `import { ImageZoom } from 'fumadocs-ui/components/image-zoom'` (shadows the wrapper for that file). The native component then requires `width`/`height` or the build fails; add `style={{ width: '100%', height: 'auto' }}` for responsiveness and drop `caption`. Live example: `content/docs/get-started/arbitrum-introduction.mdx`.

- **Page weight.** Four things are deliberately kept off the critical path; none of them is guarded by a gate, so all four are easy to undo by accident. (1) **Never add a plain `.css` import to a component reachable from `components/mdx.tsx`** — that file is a server module, so Turbopack groups such imports into one chunk that blocks every docs page. Put the rules in `app/global.css` instead; the two that existed were folded in, and removing only one of them would have achieved nothing. (2) `preload: false` on the `mono` and `code` fonts in `app/layout.tsx` is intentional — only the two upright Aeonik faces carry an LCP element. (3) The Inkeep chat button waits for `load` **and then** `requestIdleCallback`; idle alone fires too early, because hydration finishes while images and fonts are still in flight. (4) Keep `lucide-react` at or above the floor `fumadocs-ui` requires, or pnpm installs two copies and every shared icon ships twice — `pnpm why lucide-react` after any Fumadocs bump. See [INTERNALS](INTERNALS.md#page-weight-and-what-loads-late).

- **Cookies.** A docs page sets none, and one line keeps it that way: `privacyPreferences: { optOutAnalyticalCookies: true, optOutFunctionalCookies: true }` in `lib/inkeep.ts`. **Both flags are load-bearing** — the Inkeep SDK checks them in two different layers, so removing either restores a 365-day cookie (the visitor id, or the chat-session id after the first message). Do not "simplify" it to one flag, and do not treat it as unused config. It is a persistence opt-out, not an analytics one: events still reach Inkeep and `onEvent` still fires. No gate checks this; verify in a fresh browser profile after touching `lib/inkeep.ts` or bumping `@inkeep/cxkit-react`. Anything that adds a cookie to the site (PostHog will, by default) reopens the consent question. See [INTERNALS](INTERNALS.md#cookies-and-client-side-storage).

- Always get your fumadocs-related information on https://www.fumadocs.dev/llms.txt

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
