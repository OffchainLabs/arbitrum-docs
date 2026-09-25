# Arbitrum docs portal

Arbitrum documentation portal, on Next.js 16 and Fumadocs. It replaced the Docusaurus site at
[`OffchainLabs/arbitrum-docs`](https://github.com/OffchainLabs/arbitrum-docs), which is archived.
Serves English MDX docs; deployed on Vercel.

This file covers **how to work on the docs.** For how the codebase works and why, see
[INTERNALS.md](INTERNALS.md). Contributing a page or a PR? Start with
[CONTRIBUTE.md](CONTRIBUTE.md) instead — it covers the frontmatter contract, partials, variables,
moving pages, and the gates to run before you push. For the prose itself, the house editorial
standard is [STYLE-GUIDE.md](STYLE-GUIDE.md): plain-language rules, words and phrases to replace or
cut, the terminology table, and the glossary-linking convention.

New to Fumadocs, or arriving from the old Docusaurus site? Start with
[What Fumadocs is](INTERNALS.md#what-fumadocs-is) and
[Coming from Docusaurus](INTERNALS.md#coming-from-docusaurus) — they take about five minutes and
cover the differences that cause the most mistakes.

## Setup

```bash
pnpm install      # runs a postinstall that generates .source/
pnpm dev          # http://localhost:3000
```

Node 22 (`>=22.18 <23`) · pnpm 10. Other Node majors are rejected by `engines`.

**Browse on `localhost:3000`, not `127.0.0.1`** — on `127.0.0.1` React does not hydrate and every
component looks broken.

Search and the "Ask AI" chat button are powered by [Inkeep](https://inkeep.com). Set the
publishable key in a local `.env` (gitignored):

```bash
NEXT_PUBLIC_INKEEP_API_KEY=<inkeep-search-key>
```

Config lives in `lib/inkeep.ts`; the widgets mount in `components/inkeep/` and are wired into
`RootProvider` in `app/layout.tsx`.

### Environment variables

None of these are needed to run the site locally; everything that reads them degrades to a no-op
or a documented fallback.

| Variable                     | Used by                                                                             | Without it                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_INKEEP_API_KEY` | search and the "Ask AI" button                                                      | both are unavailable                                                        |
| `NEXT_PUBLIC_SITE_URL`       | `metadataBase`, `app/sitemap.ts`, `app/robots.ts`, request tracking                 | `http://localhost:3000` locally; a **production build fails**               |
| `NEXT_PUBLIC_POSTHOG_KEY`    | page feedback (`lib/posthog.ts`), web analytics, and request tracking in `proxy.ts` | feedback submissions and tracking events are dropped with a server-side log |
| `NEXT_PUBLIC_VERCEL_ENV`     | the production gate on web analytics and the Inkeep event bridge                    | neither fires; Vercel sets this one, you never do                           |

Set the PostHog token the same way as the Inkeep key, in a local `.env` (gitignored):

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_<posthog-project-token>
```

`NEXT_PUBLIC_POSTHOG_KEY` is PostHog's documented name for the publishable `phc_` project token
(Project settings, Project API key). It is write-only, so the `NEXT_PUBLIC_` prefix is safe even
though two of its three consumers read it on the server. Set it on Vercel for Preview and
Production.

Page feedback needs the key locally. Web analytics does not fire locally or on a preview deployment
no matter what you set, because `components/analytics/posthog-provider.tsx` also requires
`NEXT_PUBLIC_VERCEL_ENV` to be `production` and only Vercel sets that. Request tracking is gated the
same way, on the server-side `VERCEL_ENV`, so nothing is sent locally or from a preview and no key
is needed for either. See [Analytics](INTERNALS.md#analytics).

Tracking events carry a `distinct_id` derived from the reader's IP, hashed with that day's date as
the salt. The raw address is never sent. **The hash is pseudonymous rather than anonymous:** the
salt is a public date, so it stops a reader being linked across days but not re-identified by anyone
willing to hash the IPv4 space against it. Treat it as personal data when querying or exporting. See
[Routing and `proxy.ts`](INTERNALS.md#routing-and-proxyts).

## Before you push

```bash
pnpm types:check   # the main verification gate
pnpm check-links   # broken internal links and MDX fragments
```

CI runs thirteen blocking checks, including Prettier formatting and the MDX structural lint, plus a
blocking `pnpm build` that also serves the built site and checks it over HTTP.
`pnpm build` runs the same link check, so a broken link fails the Vercel deploy too. See
[The gates](INTERNALS.md#the-gates) for the full list.

A Husky pre-commit hook also runs automatically on `git commit`, scoped to staged files only
([`.lintstagedrc.mjs`](.lintstagedrc.mjs)):

- Prettier formats every staged file it understands, except `meta.json` (generator output;
  formatting it here would fight `pnpm move-doc` on every run).
- Staged `.mdx` under `content/` also gets `content:lint`, restricted to those files but running
  every rule, the same set CI blocks on (see [The gates](INTERNALS.md#the-gates)).
- A staged `.ts`/`.tsx` file triggers one full `pnpm types:check` (not per file). This regenerates
  `.source/`, runs `next typegen`, then type-checks the whole project, so it takes several seconds
  even for a one-line change. That is expected, not a hang.

It skips entirely when `HUSKY=0` or `CI=true`, and reverts to the pre-commit state if any task
fails, so a failed commit never leaves half-formatted files staged. Bypass with
`git commit --no-verify` only when you have a good reason — fix the underlying issue instead
where you can.

`types:check` proves the schema, not the render — it passes on a page that serves literal `:::` or
`undefined`. **Always confirm content changes in a browser.**

## Layout

| Path                    | Purpose                                                    |
| ----------------------- | ---------------------------------------------------------- |
| `content/docs/`         | MDX pages + source-folder `meta.json` metadata             |
| `content/partials/`     | Reusable `_`-prefixed fragments + generated `CATALOG.md`   |
| `content/glossary/`     | Glossary terms for `<Reference>` / `<Term>` (hand-written) |
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

Sidebar order, labels and groups come from `lib/docs-navigation.json`. Directory `meta.json` files
supply the underlying content tree; see
[The sidebar and its roots](INTERNALS.md#the-sidebar-and-its-roots). `sidebar_label` becomes the
page's sidebar name only if the page has no explicit `name` in that manifest; a manifest `name`
always wins, and a page the manifest never names renders its `sidebar_label`.

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

**Variables do not work inside code.** MDX does not evaluate components inside a fenced code block
or an inline code span, so `<Var name="…" />` there renders as a literal tag, not its value.
Usually the value was never code to begin with, and dropping the backticks is the whole fix. When a
reader is meant to copy the line, as in a `docker run` command, hardcode the current value in the
code and reference the variable in the prose next to it. `pnpm content:lint` (rule A6) fails on any
`<Var>` found inside code. To have a hardcoded copy of `latestNitroNodeImage` kept current for you,
put `{/* sync-with-var: latestNitroNodeImage */}` anywhere in the page and `pnpm nitro:check-release`
will rewrite it whenever it bumps that variable. Do not put that marker on a page that states a
Nitro version as a historical fact, such as an ArbOS release note, or a bump will rewrite history.

**Variables do not work in a link destination either, and that one leaves no link at all.** A
markdown link destination may not contain a space and `<Var name="…" />` contains two, so the link
never parses and the reader is served the literal `[text](…)` brackets. Write the variable as a
`{var:name}` placeholder in the destination instead:

```mdx
[Interface](https://github.com/OffchainLabs/{var:nitroRepositorySlug}/blob/{var:nitroVersionTag}/precompiles/ArbSys.go)
```

Use as many placeholders as the URL needs. The same form works in an `href`, `to` or `src`
attribute, in a link title, and in an internal `/docs/…` destination, which `pnpm check-links`
expands before it resolves. Everywhere else on the page, the link text included, keep using
`<Var name="…" />`: a placeholder written in prose is read as a JavaScript expression and fails the
build with an acorn parse error. The one destination it cannot do is a local image path
(`![a](/img/…)`), which is imported before the placeholder is expanded, so write that path out in
full. `pnpm content:lint` (rule A11) fails on a `<Var>` left in a destination, and `pnpm vars:check`
reads placeholders too, so a mistyped name is caught the way a mistyped `<Var>` name is.

**After editing a value in `vars.json`, restart `pnpm dev` to see it in a placeholder.** A `<Var>`
in prose updates on the next reload, but the placeholders are expanded by a cached MDX processor
that reads the file once, so a link keeps the old value until the server is restarted.

**To update a value:** edit [`content/vars.json`](content/vars.json), then run `pnpm vars:check`.

**To add a new variable:** add the key to `content/vars.json` **and** its type to the `varsSchema`
in [`content/vars.ts`](content/vars.ts). Miss either side and the gate fails. ([Why two
files](INTERNALS.md#global-variables).)

Never hardcode a version or chain parameter into a page.

**Links to a file in this repository are variables too.** `docsRepositoryUrl` and
`docsRepositoryBranch` hold this repository's own GitHub identity, so a link to `CONTRIBUTE.md`,
`STYLE-GUIDE.md` or the partials catalog is written
`[Contribute]({var:docsRepositoryUrl}/blob/{var:docsRepositoryBranch}/CONTRIBUTE.md)`. The same two
values build the edit link and the "Request an update" button on every page, so editing
`docsRepositoryUrl` once moves every link home at the same time. That is the one value that changes
when this repository takes over the `arbitrum-docs` name. `pnpm check-links` skips an external URL
without resolving it, so a hardcoded one would not be caught if it went dead.

### Announcement banner

The bar above the navbar is configured from the same file, so turning it on, rewording it, or
retiring it is a content edit. Five keys control it:

| Key                    | Meaning                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `announcementEnabled`  | `false` renders nothing at all                               |
| `announcementText`     | The message, shown before the link                           |
| `announcementLinkText` | The link label                                               |
| `announcementLinkHref` | Where the link goes                                          |
| `announcementId`       | Dismissal key. **Change it whenever you change the message** |

`announcementId` also lands in the page as an HTML `id` and inside a CSS selector, so it has to
start with a letter and use only letters, digits, hyphens and underscores. Anything else fails at
module load with a message naming the key.

**Keep the message short: `announcementText` plus `announcementLinkText` under roughly 140
characters combined.** The bar has a fixed height (3rem, and 4rem below 640px) because the layout
feeds that number into the sticky offsets of every page, so it cannot grow to fit a longer message.
It will not clip a message at the length above, but there is no gate on this and nothing will warn
you. After changing the text, look at the top of a docs page in a browser window narrowed to about
400px wide and confirm nothing is cut off.

**Dismissal is permanent per viewer, not per session.** A reader who closes the banner has
`announcementId` written to their browser's `localStorage`, which survives closing the tab and
every later visit, so they never see that id again on that browser. Reuse an id for a new message
and everyone who dismissed the old one misses the new one. Give each message its own id.

`announcementLinkHref` is checked by `pnpm vars:check`: it has to be an `https` URL, or a
root-absolute internal path that resolves to a real page or a file under `public/`. Nothing else
would catch a typo there, because `pnpm check-links` only reads MDX.

## Move a page

```bash
pnpm move-doc <from> <to>
```

This rewrites inbound links, re-bases the moved page's own relative links and includes, updates
`meta.json`, writes the redirect, retargets every existing redirect that pointed at the old URL so
none of them chains, and removes any redirect away from the new URL that an earlier move left
behind. Add `--dry-run` to see all of it without touching a file. One registry it
cannot fix is `VERSIONED` in `lib/versions-constants.ts`. If the page you moved has a version
dropdown, retarget its key by hand. Forgetting is not silent, at least. `pnpm test` fails on a
registry key that names no live page.

**Never hand-edit between the `AUTO-GENERATED` markers in `redirects.config.ts`**, since `move-doc`
owns that block. ([Details](INTERNALS.md#redirects).)

## Commands

```bash
pnpm dev                 # http://localhost:3000
pnpm types:check         # regenerate .source/, generate Next types, tsc --noEmit
pnpm build               # production build (runs check-links first)
pnpm start               # serve the production build

pnpm check-links         # broken internal doc links and MDX fragments
pnpm vars:check          # every <Var name> resolves
pnpm nav:check           # meta.json nav integrity + sidebar section coverage
pnpm partials:check      # includes resolve, no routing leak, catalog fresh
pnpm references:check    # glossary ids + <Reference> targets
pnpm content:lint        # MDX structural defects
pnpm format:check        # prettier
pnpm test                # tooling script test suites

pnpm partials:catalog    # regenerate CATALOG.md + manifest.json
pnpm move-doc <from> <to>
pnpm redirects:check     # every redirect destination is a real page (needs a running site)
```

Precompile, CLI and Stylus tooling runs by hand only. See
[The gates](INTERNALS.md#the-gates).

## Conventions

- Theme tokens are `--color-fd-*` (Fumadocs). Never `--ifm-*` (legacy Docusaurus).
- Route constants live in `lib/shared.ts` — reference these rather than hardcoding paths.
- Never hand-edit generated files: `.source/`, `CATALOG.md`, `manifest.json`, the
  `AUTO-GENERATED` block in `redirects.config.ts`, and every page under
  `content/docs/stylus/stylus-by-example/` (republished from
  [`offchainlabs/stylus-by-example`](https://github.com/offchainlabs/stylus-by-example) by
  `pnpm stylus:generate` — fix those upstream, or they are overwritten the next Monday).
- Fumadocs reference: <https://www.fumadocs.dev/llms.txt>
