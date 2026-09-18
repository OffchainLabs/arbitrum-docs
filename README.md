# Arbitrum docs portal

Arbitrum documentation portal — a Next.js 16 / Fumadocs migration of
[`OffchainLabs/arbitrum-docs`](https://github.com/OffchainLabs/arbitrum-docs) off Docusaurus.
Serves English MDX docs; deployed on Vercel.

This file covers **how to work on the docs.** For how the codebase works and why, see
[INTERNALS.md](INTERNALS.md).

New to Fumadocs, or coming from the Docusaurus site? Start with
[What Fumadocs is](INTERNALS.md#what-fumadocs-is) and
[Coming from Docusaurus](INTERNALS.md#coming-from-docusaurus) — they take about five minutes and
cover the differences that cause the most mistakes.

## Setup

```bash
pnpm install      # runs a postinstall that generates .source/
pnpm dev          # http://localhost:3000
```

Node 22 (`>=22 <23`) · pnpm 10. Other Node majors are rejected by `engines`.

**Browse on `localhost:3000`, not `127.0.0.1`** — on `127.0.0.1` React does not hydrate and every
component looks broken.

Search and the "Ask AI" chat button are powered by [Inkeep](https://inkeep.com). Set the
publishable key in a local `.env` (gitignored):

```bash
NEXT_PUBLIC_INKEEP_API_KEY=<inkeep-search-key>
```

Config lives in `lib/inkeep.ts`; the widgets mount in `components/inkeep/` and are wired into
`RootProvider` in `app/layout.tsx`.

## Before you push

```bash
pnpm types:check   # the main verification gate
pnpm check-links   # broken internal links
```

CI runs eight blocking checks. `pnpm build` runs the same link check, so a broken link fails the
Vercel deploy too. See [The gates](INTERNALS.md#the-gates) for the full list.

`types:check` proves the schema, not the render — it passes on a page that serves literal `:::` or
`undefined`. **Always confirm content changes in a browser.**

## Layout

| Path                    | Purpose                                                    |
| ----------------------- | ---------------------------------------------------------- |
| `content/docs/`         | MDX pages + `meta.json` sidebars                           |
| `content/partials/`     | Reusable `_`-prefixed fragments + generated `CATALOG.md`   |
| `content/glossary/`     | Glossary terms for `<Reference>` / `<Term>`                |
| `content/vars.json`     | Global variables                                           |
| `app/docs/[[...slug]]/` | Docs route                                                 |
| `components/mdx/`       | Custom MDX components (registered in `components/mdx.tsx`) |
| `lib/source.ts`         | Fumadocs source adapter                                    |
| `proxy.ts`              | Markdown negotiation + static-asset bypass list            |
| `source.config.ts`      | Fumadocs MDX config (Zod-typed frontmatter)                |

## Write a page

Every page needs five frontmatter fields. A missing or invalid one fails the build.

```mdx
---
title: 'How to run a full node'
description: One-line summary shown in search results and social cards.
content_type: 'how-to'
author: your-github-handle
sme: reviewing-sme-handle
---
```

`content_type` must be one of: `how-to`, `concept`, `quickstart`, `tutorial`, `reference`,
`troubleshooting`, `faq`. Optional: `sidebar_label`, `user_story`, `draft`.

Sidebar order comes from `meta.json` in each directory, not from file names.

## Use a partial

**Before writing a banner, note, config table, or troubleshooting block, search
[`content/partials/CATALOG.md`](content/partials/CATALOG.md)** (⌘F by intent — title, summary, tags)
and reuse the partial instead of duplicating prose. The catalog gives you a copy-paste snippet for
each one.

```mdx
<!-- From a doc page: root-anchored, so moving the page never breaks it -->

<include cwd>content/partials/launch-arbitrum-chain/_raas-providers-notice.mdx</include>
```

```mdx
<!-- From another partial: MUST be file-relative, never cwd -->

<include>../_hardware-requirements.mdx</include>
```

The relative form is required inside partials — a `cwd` include there crashes the build.
`partials:check` enforces it. ([Why](INTERNALS.md#partials).)

### Add or change one

1. Create `content/partials/<area>/_your-partial.mdx`. No frontmatter — `<include>` strips it.
2. Reference it, then run `pnpm partials:catalog` to refresh the catalog and manifest.
3. Optionally curate its title, summary, tags, and scope in `content/partials/registry.json`:

   ```json
   {
     "content/partials/<area>/_your-partial.mdx": {
       "summary": "…",
       "tags": ["…"],
       "scope": "neutral"
     }
   }
   ```

`CATALOG.md` and `manifest.json` are generated — never edit them by hand.

## Use a variable

Values that move on a release cadence — version tags, chain parameters, node image names — live in
one file, so you edit them once and every page follows.

```mdx
The current Nitro release is <Var name="nitroVersionTag" />.
```

`Var` is registered globally, so pages need no import. It works inside partials too.

**To update a value:** edit [`content/vars.json`](content/vars.json), then run `pnpm vars:check`.

**To add a new variable:** add the key to `content/vars.json` **and** its type to the `varsSchema`
in [`content/vars.ts`](content/vars.ts). Miss either side and the gate fails. ([Why two
files](INTERNALS.md#global-variables).)

Never hardcode a version or chain parameter into a page.

## Move a page

```bash
pnpm move-doc <from> <to>
```

This rewrites inbound links, re-bases the moved page's own relative links and includes, updates
`meta.json`, and writes the redirect for you.

**Never hand-edit `redirects.config.mjs`** — both blocks in it are generated.
([Details](INTERNALS.md#redirects).)

## Commands

```bash
pnpm dev                 # http://localhost:3000
pnpm types:check         # regenerate .source/, generate Next types, tsc --noEmit
pnpm build               # production build (runs check-links first)
pnpm start               # serve the production build

pnpm check-links         # broken internal doc links
pnpm vars:check          # every <Var name> resolves
pnpm nav:check           # meta.json navigation integrity
pnpm partials:check      # includes resolve, no routing leak, catalog fresh
pnpm references:check    # glossary ids + <Reference> targets
pnpm content:lint        # MDX structural defects
pnpm format:check        # prettier
pnpm test                # tooling script test suites

pnpm partials:catalog    # regenerate CATALOG.md + manifest.json
pnpm move-doc <from> <to>
pnpm drift               # compare content tree against upstream arbitrum-docs
pnpm tree:map            # legacy-path -> current-path map, with coverage and collisions
```

Redirect and precompile tooling runs by hand only — see
[The gates](INTERNALS.md#the-gates).

## Conventions

- Theme tokens are `--color-fd-*` (Fumadocs). Never `--ifm-*` (legacy Docusaurus).
- Route constants live in `lib/shared.ts` — reference these rather than hardcoding paths.
- Never hand-edit generated files: `.source/`, `CATALOG.md`, `manifest.json`,
  `redirects.config.mjs`, `redirects.legacy.mjs`.
- Fumadocs reference: <https://www.fumadocs.dev/llms.txt>
