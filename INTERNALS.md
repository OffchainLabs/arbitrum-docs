# INTERNALS

How this codebase works, and why it is built the way it is. For the docs team and anyone
maintaining the tooling.

Task-level instructions — setup, writing a page, using a partial — live in [README](README.md).
`CLAUDE.md` is machine-facing and duplicates parts of this file for coding agents; **this file is
canonical for humans, and the one to edit first.**

## Contents

- [What Fumadocs is](#what-fumadocs-is)
- [Coming from Docusaurus](#coming-from-docusaurus)
- [The pipeline](#the-pipeline)
- [`source` is a choke point](#source-is-a-choke-point)
- [The frontmatter contract](#the-frontmatter-contract)
- [Partials](#partials)
- [Global variables](#global-variables)
- [Redirects](#redirects)
- [Routing and `proxy.ts`](#routing-and-proxyts)
- [Partial versioning](#partial-versioning)
- [Glossary and inline references](#glossary-and-inline-references)
- [Custom MDX components](#custom-mdx-components)
- [The gates](#the-gates)
- [What nothing catches](#what-nothing-catches)
- [Known trade-off: no static prerendering](#known-trade-off-no-static-prerendering)
- [Design specs](#design-specs)

## What Fumadocs is

Fumadocs is **not** an all-in-one docs framework. It is a set of libraries you assemble on top of a
Next.js App Router app that you own and can edit. Its own docs describe it as "a docs framework that
you can break," in contrast to monolithic tools like Docusaurus. There is no `fumadocs build`, no
plugin system, and no theme to eject from — `pnpm dev` is `next dev`, and every route under `app/`
is ordinary Next code.

That trade is the thing to internalise: **we get full control, and in exchange we own the pieces a
monolith would have supplied.** Most of this document describes those pieces.

Four packages are installed here:

| Package             | Version | Responsible for                                                                 |
| ------------------- | ------- | ------------------------------------------------------------------------------- |
| `fumadocs-core`     | 16.15.1 | Headless engine: the Loader API, page tree, search, TOC, MDX plugins            |
| `fumadocs-mdx`      | 15.3.1  | The content source: compiles MDX into typed **collections**                     |
| `fumadocs-ui`       | 16.15.1 | The default theme: `DocsPage`/`DocsBody` layouts, tabs, accordions, code blocks |
| `fumadocs-twoslash` | 3.3.0   | Type-checked TypeScript code samples (` ```ts twoslash `)                       |

`fumadocs-ui` is a theme, not a requirement — the headless core would work without it. We use it,
and override its tokens rather than forking it.

### The four concepts

**Collections.** A collection is a typed set of content files, declared in `source.config.ts` via
`defineDocs()` or `defineCollections()`. Each declares a `dir`, a file glob, and a Zod `schema` that
every file's frontmatter must satisfy. `fumadocs-mdx` compiles them into the generated `.source/`
directory. This repo declares three: `docs` (routed), `docsVersions` (archived pages), and
`glossary` (reference entries).

**The Loader API.** `loader()` from `fumadocs-core/source` turns a compiled collection into a
`source` object — the query interface the rest of the app uses: `getPage(slug)`, `getPages()`, the
page tree, and URL derivation from the `baseUrl` you pass it. It is the seam that lets a content
source be swapped (local MDX, Notion, Sanity) without touching route code. See
[`source` is a choke point](#source-is-a-choke-point) for the rules we hold ourselves to around it.

**The page tree.** The hierarchical structure behind the sidebar and breadcrumbs, derived from the
directory layout and refined by a `meta.json` in each directory. `meta.json` controls **order and
grouping** — its `pages: []` array takes basename slugs and supports `...` rest-globs,
`---Separator---`, `[text](url)` external links, and `!exclude`. There is no global sidebar file.

**The catch-all route.** One file, `app/docs/[[...slug]]/page.tsx`, renders every docs page. It
takes the slug segments, calls `source.getPage()`, and renders. Adding an `.mdx` file creates a
route with no wiring; there is no per-page React file.

**Slugs are the file path minus the extension**, with a trailing `index` dropped —
`content/docs/stylus/quickstart.mdx` serves at `/docs/stylus/quickstart`, given `baseUrl: '/docs'`.

## Coming from Docusaurus

Most of the team is arriving from `OffchainLabs/arbitrum-docs`. The differences that actually cause
mistakes:

| Docusaurus                                          | Here                                                                |
| --------------------------------------------------- | ------------------------------------------------------------------- |
| `docusaurus.config.js`, presets, plugins            | `next.config.mjs` + `source.config.ts`; no plugin system            |
| `sidebars.js` — one global file                     | A `meta.json` per directory                                         |
| Swizzling to override a theme component             | Edit the component; it is your code                                 |
| `onBrokenLinks: 'throw'`                            | Nothing built in — hence `check-links`, see [The gates](#the-gates) |
| `02-foo/bar` → `/foo/bar` (numeric prefix stripped) | **Prefix kept verbatim** in the slug                                |
| `@@varName@@` preprocessing                         | `<Var name="…" />`, see [Global variables](#global-variables)       |
| Client-redirects plugin + synced `vercel.json`      | Next `redirects()` only, see [Redirects](#redirects)                |
| `docs:move` style tooling                           | None official — `pnpm move-doc` is ours                             |

The numeric-prefix rule is the sharpest edge when porting URLs: a path that Docusaurus served at
`/foo/bar` will serve at `/02-foo/bar` here unless the directory is renamed or a redirect is added.

`@fumadocs/cli` exists but only **installs UI components**. It does not move, rename, or restructure
docs, and it does not manage redirects. Every tool in `scripts/` exists because nothing upstream
provides it.

## The pipeline

Understanding the build requires reading `source.config.ts`, `lib/source.ts`, and
`app/docs/[[...slug]]/page.tsx` together. Nothing else reads content.

1. `fumadocs-mdx` scans `content/docs/**`, validates every page's frontmatter against the Zod
   schema in `source.config.ts`, and emits the `.source/` collection.
2. `lib/source.ts` runs Fumadocs `loader()` over that collection with the icons plugin, exporting
   the `source` object.
3. Route handlers read `source`. `app/docs/[[...slug]]/page.tsx` renders pages; the `llms.txt`,
   `llms-full.txt`, `llms.mdx/`, and `og/` routes all derive from the same object.

Change the content model in one place and every consumer follows.

`.source/` is generated — by `postinstall`, by `types:check`, and by `build`. Never hand-edit it;
regenerate instead.

## `source` is a choke point

Treat `source.config.ts` and `lib/source.ts` as one unit. Seven files under `app/` import `source`
and nothing else reads content. The constraints that follow are deliberate:

- `docs.toFumadocsSource()` is the **only** adapter for `.source/`. Never build a second read path.
- `baseUrl` is an argument to the single `loader()` call. A second loader would restate it and
  silently drift page URLs.
- Helpers are typed `(typeof source)['$inferPage']`, so editing the frontmatter schema re-types
  every helper and every consumer at once.
- `postprocess.includeProcessedMarkdown: true` is what makes `getLLMText()`'s
  `page.data.getText('processed')` work. Remove it and the `llms*` routes break, far from where
  the flag lives.
- Put URL derivation next to `source` — `getPageImage`, `getPageMarkdownUrl`, `getLLMText` — not
  in route handlers.

**`lib/source` is server-only.** Never import it, or a constant that transitively pulls it, from a
client component: it drags the compiled collection into the browser bundle. One such import once
cost a 24 MB chunk on every docs page. No gate catches this — see
[What nothing catches](#what-nothing-catches).

## The frontmatter contract

`source.config.ts` extends the Fumadocs page schema. Every non-partial `.mdx` page **must** carry
`title`, `description`, `content_type`, `author`, and `sme`.

`content_type` is a fixed enum: `how-to`, `concept`, `quickstart`, `tutorial`, `reference`,
`troubleshooting`, `faq`. Optional fields: `sidebar_label`, `user_story`, `draft`.

A missing or invalid field fails `types:check` and `build`. This is the most common reason a build
breaks after adding content.

## Partials

Reusable `_`-prefixed fragments live in `content/partials/` — **outside** the doc collection `dir`
entirely, so they can never be routed. No glob exclusion is needed. Two consumption paths, both
tracked by the tooling:

**`<include>` directive** (build-time splice). Doc→partial includes use the root-anchored
`<include cwd>content/partials/…</include>` form, so moving a page never breaks its includes.

**Partial→partial includes must be file-relative** (`<include>../x.mdx</include>`). A partial may
be compiled outside the docs pipeline when ESM-imported, and there `fumadocs-mdx`'s `cwd` context
is undefined and crashes the build. `partials:check` enforces the distinction.

**ESM import** as an MDX component module — `import X from '@/content/partials/…/_x.mdx'` — is
supported by the tooling (`scripts/lib/partials.mjs` scans the importer roots) but **currently used
by no component.** The last consumer, `FloatingHoverModal`, was deleted as dead code.

Partials carry no frontmatter; `<include>` strips it, and the lint flags vestigial frontmatter.

`CATALOG.md` and `manifest.json` are generated — never hand-edit them. Curate titles, summaries,
and tags in the optional `content/partials/registry.json`.

## Global variables

Writer-edited values live in `content/vars.json`, are validated by the Zod schema in
`content/vars.ts`, and render in MDX via `<Var name="…" />`. A bad value fails at module load.

**Why two files.** `vars.json` is plain JSON, so writing a value needs no TypeScript. `vars.ts`
validates it with a Zod `strictObject` at module load, so a missing or mistyped key throws
immediately with a field-level error — in the `pnpm dev` console and in CI.

The strictness is load-bearing. A plain `z.object` silently strips keys present in the JSON but
absent from the schema, so `<Var>` renders the literal string `undefined` into the page. That is
how 27 variables once came to render `undefined` across 85 pages.

Adding a **new** variable takes both files: the key in `vars.json` **and** its type in the
`varsSchema` in `vars.ts`. Miss either side and the gate fails.

`.mdx` never passes through `tsc`, so the `VarKey` type does not protect MDX callers and
`types:check` exits 0 on a page full of broken variables. **`vars:check` is the only gate that
catches a `<Var name>` with no matching key.**

Values mirror upstream `arbitrum-docs/src/resources/globalVars.js`. Keep them in sync while that
site is still live.

## Redirects

Every redirect lives in `redirects.config.mjs`, consumed by `next.config.mjs`'s `redirects()`.
Next compiles them into `.next/routes-manifest.json`, which Vercel reads directly — **there is no
`vercel.json` here, and adding one would be a second source of truth, not a mirror.** Vercel applies
`vercel.json` routes before framework routes, so it would silently shadow `redirects.config.mjs`.

The upstream Docusaurus site needs two copies (a client-redirects plugin for in-app navigation plus
a synced `vercel.json` for the edge). Next needs one. The sync step is what disappeared in the
migration, not the generation step.

`redirects()` runs **before** `proxy.ts`, so a redirected URL gets markdown negotiation on the
destination, not on the first hop.

Both blocks in `redirects.config.mjs` are generated. Never hand-edit it.

**Moved pages.** `pnpm move-doc <from> <to>` writes the old→new URL between the `AUTO-GENERATED`
markers.

**Legacy `docs.arbitrum.io` URLs.** `pnpm redirects:legacy` regenerates `redirects.legacy.mjs` from
the sibling repo's `vercel.json`. Legacy URLs were served at the site root (`/stylus/using-cli`)
and this site serves docs under `/docs`, so sources stay root-level — that is what real inbound
links look like — and destinations are rewritten to `/docs/…`. The output is committed, so builds
never need the sibling repo; only regeneration does.

The generator resolves a destination in this order, declining rather than guessing:

1. **`MANUAL_DESTINATIONS`** — hand-verified legacy destination → local page. A value may carry an
   `#anchor`; the page part must resolve or the generator throws.
2. **Self-URL** — the legacy path still names a live page here under `/docs`. Upstream moved the
   page and this site did not, so serve ours.
3. **Section renames** — whole sections that moved wholesale (`/run-arbitrum-node` → `/run-a-node`).
   Deep restructures are deliberately absent: their pages moved individually, so a prefix rule
   would produce confidently-wrong destinations.
4. **Basename fallback** — accepted only when exactly one local page carries that slug _and_ the
   basename was unique upstream too. Where the legacy path was doing the disambiguating, the
   fallback cannot, and declines.

It also follows upstream's own redirect chains to their terminal destination first. Many upstream
entries point at a URL that is itself a redirect source, up to three hops deep, so a raw
`destination` is often not where a reader ends up.

**The guiding rule: a redirect to a plausible-but-wrong page is worse than a 404.** It silently
sends readers somewhere wrong, and `redirects:check` cannot catch it, because the destination
exists.

Anything unresolvable lands in `redirects.legacy.todo.json`. **That file reached `[]` on
2026-08-31 and is now a tripwire, not a backlog.** A non-empty todo after a regeneration means
upstream added a redirect this site cannot resolve; map it in `MANUAL_DESTINATIONS`, confirming the
upstream page's frontmatter title against the local candidates, rather than leaving it parked.

`pnpm redirects:check` validates every destination against `/llms.txt` — the router's own page
list — and fails on a dead destination or a source that shadows a live page. It needs the site
running, so point it at a Vercel preview with `--base-url` to check a PR.

## Routing and `proxy.ts`

Single locale, no i18n. Pages live directly under `content/docs/…` and serve at `/docs/…`. There is
no `[lang]` route segment and no locale middleware; `lib/i18n.ts` was deleted on 2026-08-18 along
with the `ja` and `zh-CN` trees.

`proxy.ts` does exactly two things:

1. An explicit **bypass list** of routes served verbatim: `/_next/`, `/img/`, `/favicon.ico`,
   `/llms*`, `/og/`, `/api/`.
2. `.md`-suffix rewrites plus `Accept: text/markdown` content negotiation to the markdown route.

**A new top-level route belongs in that bypass list**, or markdown negotiation will try to rewrite
it.

Re-adding localization means restoring `defineI18n`, the `i18n` argument to `loader()`, a `[lang]`
segment, and `createI18nMiddleware`.

## Partial versioning

Archived pages live in `content/_versions/<id>/…` — a separate, non-routed collection, outside
`content/docs` for the same reason partials are. `lib/versions.ts` indexes them by path. Only
hand-registered pages are versioned.

`scripts/versioned-docs-check.mjs` text-parses `lib/versions.ts` rather than importing it, because
no plain-node script can import `lib/source` — neither the `collections/*` alias nor TypeScript
resolves. `redirects-check.mjs` hits the same wall, which is why it reads `/llms.txt` off a running
site instead.

## Glossary and inline references

`content/glossary/*.mdx` is a reference collection with its own shape — `{ id, title, sortAs? }`,
**not** the page contract. It is surfaced by `<Reference>`, `<Term>`, and `<ReferenceList>` via the
registry in `lib/references.ts`.

New reference types add a collection plus one registry entry.

## Custom MDX components

`components/mdx.tsx` is the registry and the source of truth — read it rather than trusting a list
here. Implementations live in `components/mdx/`. Fumadocs' `Accordion`/`Accordions` and `Tab`/`Tabs`
are re-exported.

Some names are aliases of the same component: `AEL` → `AddressExplorerLink`, `ImageWithCaption` →
`ImageZoom`. Unported Docusaurus widgets map to `PendingWidget`, which renders a placeholder — a
page using one is not broken, just incomplete.

Adding a component here makes it available in all MDX with no import.

**Image zoom.** `<ImageZoom>` resolves to the wrapper in `components/mdx/ImageZoom/`: plain `<img>`
child, supports `caption`, needs no dimensions, no Next image optimization. To use Fumadocs' native
component instead — for `_next/image` optimization — import it per file, which shadows the wrapper
for that file. The native component then requires `width`/`height` or the build fails; add
`style={{ width: '100%', height: 'auto' }}` for responsiveness and drop `caption`.

## The gates

CI runs on push and PR to `main` (`.github/workflows/ci.yml`) in three jobs. **Only the first
blocks.** A green PR does not mean the content is clean.

**`Gates` (blocking)** — eight steps:

| Step                       | Catches                                                                       |
| -------------------------- | ----------------------------------------------------------------------------- |
| `types:check`              | Frontmatter schema violations, TypeScript errors                              |
| `test`                     | Regressions in the tooling scripts themselves                                 |
| `vars:check`               | A `<Var name>` with no matching key in `vars.json`                            |
| `nav:check`                | `meta.json` navigation integrity                                              |
| `partials:check`           | Unresolved includes, routing leaks, stale catalog, `cwd` include in a partial |
| `versioned-docs-check.mjs` | Archived-page registry drift                                                  |
| `references:check`         | Glossary ids and `<Reference>` targets                                        |
| `check-links`              | Broken internal doc links                                                     |

`check-links` exists because Fumadocs has no equivalent of Docusaurus's `onBrokenLinks: 'throw'`.
`pnpm build` chains it ahead of `next build`, so a broken link also fails the Vercel deploy.

**`Content debt` (non-blocking)** — `format:check` and `content:lint`, each marked
`continue-on-error` because each still fails on pre-existing debt. The job comment records the
counts. **Promote a step into `Gates` once its count reaches zero** — that promotion is the point
of the split. This tier is a backlog, not a policy.

**`Build` (non-blocking)** — `pnpm build`, deliberately not blocking: the MDX image pipeline fetches
remote images at build time, so a dead third-party URL turns it red for reasons unrelated to the
change under review. It still catches MDX compile errors that `types:check` cannot see.

**Run by hand only:** `drift`, `precompiles:check`, `redirects:legacy`, `redirects:check`.
`redirects:check` cannot run in CI as-is because it reads `/llms.txt` off a running site.

`upstream-refresh.yml` runs Mondays at 08:00 UTC and on `workflow_dispatch`: `nitro:check-release`,
then `precompiles:generate`, opening `automated/upstream-refresh` as a PR if anything changed. It
never writes to `main` and no-ops when the tree is clean.

## What nothing catches

Every gate has a blind spot. These are the ones that have bitten:

- **Dead `#anchors`.** `check-links` validates pages, not fragments. A live page with a dead anchor
  passes. Verify by curling the page and grepping for `id="…"`.
- **Client components importing `lib/source`.** Costs megabytes in the browser bundle. No gate sees
  it.
- **Rendering.** `types:check` proves the schema, not the render. It exits 0 on pages that serve
  literal `:::`, `undefined`, or HTTP 500. Confirm content changes in a browser.
- **A redirect to the wrong-but-existing page.** `redirects:check` only proves the destination
  resolves.

**Browse on `localhost:3000`, not `127.0.0.1`.** On `127.0.0.1` React does not hydrate and every
component looks broken.

## Known trade-off: no static prerendering

`app/docs/[[...slug]]/page.tsx` has `generateStaticParams` return `[]`, deliberately disabling
static prerendering in favour of ISR-on-first-request. This works around a Next 16.2.6 prerender
crash, and is why `build` uses `--experimental-build-mode=compile`.

The inline comment documents the restore path. Do not "fix" it without addressing that.

## Design specs

Longer-form design documents live in `.claude/docs/superpowers/specs/`:

| Spec                                             | Topic                          |
| ------------------------------------------------ | ------------------------------ |
| `2026-07-09-partials-registry-design.md`         | Partials registry model        |
| `2026-07-10-references-glossary-design.md`       | Glossary and inline references |
| `2026-07-14-full-nav-scaffold-design.md`         | Navigation scaffold            |
| `2026-07-14-fumadocs-styling-adoption-design.md` | Styling adoption               |
| `2026-07-14-import-remaining-content-design.md`  | Content import                 |
| `2026-07-17-partial-versioning-design.md`        | Partial versioning             |
| `2026-07-29-arbitrum-docs-reskin-design.md`      | Reskin                         |
| `2026-08-13-arbitrum-docs-content-gap.md`        | Content gap analysis           |

That directory is tool-specific. If Claude Code is dropped, these should move to `docs/specs/`.
