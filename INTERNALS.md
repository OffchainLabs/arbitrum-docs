# INTERNALS

How the Arbitrum docs portal works, and why it is built the way it is. For how to work on the docs,
see [README.md](README.md). For the path from a first edit to an open PR, see
[CONTRIBUTE.md](CONTRIBUTE.md). For the prose rules, see [STYLE-GUIDE.md](STYLE-GUIDE.md).

## Contents

- [What Fumadocs is](#what-fumadocs-is)
- [Coming from Docusaurus](#coming-from-docusaurus)
- [The pipeline](#the-pipeline)
- [`source` is a choke point](#source-is-a-choke-point)
- [The frontmatter contract](#the-frontmatter-contract)
- [Last modified dates](#last-modified-dates)
- [The sidebar and its roots](#the-sidebar-and-its-roots)
- [Page metadata](#page-metadata)
- [Partials](#partials)
- [Global variables](#global-variables)
- [Glossary and inline references](#glossary-and-inline-references)
- [Custom MDX components](#custom-mdx-components)
- [Page weight and what loads late](#page-weight-and-what-loads-late)
- [Redirects](#redirects)
- [Routing and `proxy.ts`](#routing-and-proxyts)
- [Static routing under `/docs`](#static-routing-under-docs)
- [Analytics](#analytics)
- [Scripts are TypeScript, run by Node](#scripts-are-typescript-run-by-node)
- [The gates](#the-gates)
- [What nothing catches](#what-nothing-catches)

## What Fumadocs is

Fumadocs is a set of libraries on top of a Next.js App Router app that we own. There is no
`fumadocs build`, no plugin system and no theme to eject from. `pnpm dev` is `next dev`, and every
route under `app/` is ordinary Next code. We get full control, and in exchange we own the pieces a
monolithic docs framework would supply. Most of this document describes those pieces.

| Package         | Responsible for                                                          |
| --------------- | ------------------------------------------------------------------------ |
| `fumadocs-core` | The headless engine: the loader, the page tree, search, TOC, MDX plugins |
| `fumadocs-mdx`  | The content source: compiles MDX into typed collections in `.source/`    |
| `fumadocs-ui`   | The theme: the notebook docs layout, tabs, accordions, callouts, images  |

Fumadocs' own reference is <https://www.fumadocs.dev/llms.txt>. Read it rather than guessing at an
API.

Four concepts carry the site:

- **Collections.** A typed set of content files, declared in `source.config.ts`. Each has a `dir`
  and a Zod schema every file's frontmatter must satisfy. This repo declares two: `docs` (routed)
  and `glossary` (reference entries).
- **The loader.** `loader()` turns a compiled collection into the `source` object the rest of the
  app queries: `getPage(slug)`, `getPages()`, the page tree, and URLs derived from `baseUrl`.
- **The page tree.** The structure behind the sidebar, breadcrumbs and previous/next links, built
  from the directory layout and the `meta.json` in each directory.
- **The catch-all route.** `app/docs/[[...slug]]/page.tsx` renders every docs page. Adding an
  `.mdx` file creates a route with no wiring.

A slug is the file path minus the extension, with a trailing `index` dropped:
`content/docs/stylus/quickstart.mdx` serves at `/docs/stylus/quickstart`.

The action row under a page's title holds the copy-markdown button, the view-options menu (with the
edit link) and `RequestUpdateLink`, which opens a prefilled GitHub issue.

## Coming from Docusaurus

Most of the team knows the Docusaurus site this one replaced. These are the differences that cause
mistakes:

| Docusaurus                                 | Here                                                          |
| ------------------------------------------ | ------------------------------------------------------------- |
| `docusaurus.config.js`, presets, plugins   | `next.config.ts` and `source.config.ts`; no plugin system     |
| `sidebars.js`, one global file             | A `meta.json` per directory                                   |
| Swizzling a theme component                | Edit the component; it is our code                            |
| `onBrokenLinks: 'throw'`                   | Nothing built in, so `pnpm check-links` supplies it           |
| `02-foo/bar` serves at `/foo/bar`          | The numeric prefix stays in the slug                          |
| `@@varName@@` preprocessing                | `<Var name="…" />`, see [Global variables](#global-variables) |
| Client-redirects plugin plus `vercel.json` | Next `redirects()` only, see [Redirects](#redirects)          |

## The pipeline

Read `source.config.ts`, `lib/source.ts` and `app/docs/[[...slug]]/page.tsx` together. Nothing else
reads the `docs` collection. The `glossary` collection has one reader, `lib/references.ts`.

1. `fumadocs-mdx` scans `content/docs/**` and `content/glossary/**`, validates every docs page's
   frontmatter against the schema in `source.config.ts`, and emits the `.source/` collections.
2. `lib/source.ts` runs `loader()` over that collection with the Lucide icons plugin and exports
   `source`.
3. Route handlers read `source`. The docs page renders pages; the `llms.txt`, `llms-full.txt`,
   `llms.mdx/`, `og/`, search and sitemap routes derive from the same object.

`.source/` is generated by `postinstall`, `types:check` and the build. Never hand-edit it.

MDX options live in `lib/mdx-options.ts`, shared by the site and by `check-links`, so anchor
validation sees the transforms the reader gets. The remark plugins are `remark-math` (with
`rehype-katex`), `remarkVarLinks` (see [Global variables](#global-variables)) and
`remarkStripMdxComments`, which removes `{/* … */}` comments. Those comments never reach the HTML,
but the markdown mirrors are stringified from the same tree and would otherwise print them. A
comment inside a fence or an inline code span is not an expression node and is served as written.
Generators that depend on a marker comment read the raw `.mdx` file from disk.

## `source` is a choke point

Seven files under `app/` import `source`: the docs page and layout, the `llms.txt`,
`llms-full.txt`, `llms.mdx` and `og` routes, and the sitemap. The rules around it:

- `docs.toFumadocsSource()` is the only adapter for `.source/`. Never build a second read path.
- `baseUrl` is an argument to the single `loader()` call. A second loader would restate it and let
  page URLs drift.
- Helpers are typed `(typeof source)['$inferPage']`, so a schema edit re-types every consumer.
- URL derivation lives next to `source` (`getPageImage`, `getPageMarkdownUrl`, `getLLMText`), not
  in routes.
- `postprocess.includeProcessedMarkdown: true` on the collection is what makes
  `page.data.getText('processed')` work. Remove it and the `llms-full.txt` and `llms.mdx` routes
  break. `llms.txt` only lists pages and does not read their text.
- **Server only.** Never import `lib/source`, or a module that imports it, from a client
  component. It drags the compiled collection into the browser bundle, and no gate notices.

## The frontmatter contract

`source.config.ts` extends the Fumadocs page schema:

| Field           | Rule                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| `title`         | Required, trimmed, not empty                                                                          |
| `description`   | Required, trimmed                                                                                     |
| `sidebar_label` | Optional; replaces the title as the page's sidebar name                                               |
| `content_type`  | Optional; one of `how-to`, `concept`, `quickstart`, `tutorial`, `reference`, `troubleshooting`, `faq` |
| `author`, `sme` | Optional strings                                                                                      |

A missing title or description, or a `content_type` outside the enum, fails `types:check` and the
build. Nothing renders `content_type`; it is an editorial label kept to one enum so values stay
comparable. Partials and glossary entries do not carry this contract.

## Last modified dates

The `lastModified` option on the `docs` collection makes `fumadocs-mdx` read each file's date from
git. The docs page prints it as "Last updated on …", the sitemap emits it as `<lastmod>`, and page
metadata emits it as `article:modified_time`. It is not frontmatter, so never add a date field to a
page.

The option is gated by `hasFullGitHistory()` in `source.config.ts`. A shallow clone reports its
oldest commit as having added every file, which would stamp most pages with one wrong date, so a
shallow checkout resolves no dates at all. Two consequences:

- **Vercel clones shallow**, so production shows no dates until `VERCEL_DEEP_CLONE=true` is set in
  the project's environment variables.
- **CI checks out shallow**, so the HTTP smoke suite never sees a date and asserts only that the
  metadata tag and the visible line agree.

Never express the fallback as `lastModified: false`. The generated type carries the field only
while the option is truthy, so `false` deletes it and the docs page fails `types:check`. The guard
chooses between `true` and a resolver that returns `undefined`.

Dates are formatted in UTC, so a prerendered page reads the same wherever it was built.

## The sidebar and its roots

**The sidebar is the directory tree, ordered by `meta.json`.** Nothing else decides it.

- Each of the nine sections is a top-level directory under `content/docs` whose `meta.json` sets
  `"root": true`. The navbar (`lib/layout.shared.tsx`) links into each section. Two entries do
  not point at a landing page: Stylus goes to `stylus/quickstart`, and the Build menu carries an
  extra entry for `build-decentralized-apps/machine-payments-protocol`.
- `tabs={false}` in `app/docs/layout.tsx` turns off the root switcher. Fumadocs resolves the current
  URL to its node in the tree and renders the nearest `root: true` folder above it. A page outside
  every root folder gets the whole tree.
- A subdirectory is a collapsible group titled by its own `meta.json`. Its `index.mdx` opens when a
  reader clicks the group name.
- The `pages` array orders entries. It takes basenames, subdirectory names, paths into other
  directories such as `"../chain-info"` (which place a page without moving it), `"...name"` to
  inline a subdirectory, `"..."` for everything not yet listed, `"---Heading---"` separators and
  `external:[Label](https://…)` links. CONTRIBUTE.md has the writer's version.
- A page's sidebar name is its `sidebar_label`, else its `title`. The one page-tree transformer in
  `lib/source.ts` applies `sidebar_label`.
- The footer under every section tree pins Chain info, Glossary and Contribute
  (`components/sidebar-resource-links.tsx`, links from `sidebarResourceLinks` in `lib/shared.ts`).
  It sits outside the page tree, so it cannot claim a page for another section.

**Never write a `[Label](/docs/…)` link entry for a page in this repo.** It puts the page on a
second node, and the reader lands in whichever section Fumadocs finds first. Use a path entry.

`scripts/sidebar.test.ts` builds the real tree with Fumadocs' loader and fails when a page is on no
node, on more than one, or outside every root folder. The docs index, `/docs`, is exempt from the
root-folder check. It runs under `pnpm test`.

## Page metadata

`generateMetadata` in the docs page emits:

- the title and description from frontmatter;
- `alternates.canonical`, the absolute page URL;
- Open Graph: `type: article`, `siteName` from `appName` in `lib/shared.ts`, `url` equal to the
  canonical, the page image from the `og/` route, and `modifiedTime` when a date is known;
- a `summary_large_image` Twitter card with `site: @arbitrum`.

`og:type` is `article` for everything under `/docs`, the landing pages included. The site root
publishes its own title, description and card from `app/(home)/page.tsx`, built on `siteTitle` and
`siteDescription` in `lib/shared.ts`. Those are deliberately not the docs index's "Arbitrum docs",
so `/` and `/docs` do not compete for the same query. The root's card is
`app/(home)/opengraph-image.tsx`, Next's file convention. Both cards come from `renderOgImage` in
`lib/og.tsx`, so they cannot drift.

**Do not add a `title.template` to `app/layout.tsx`.** `/docs` is titled "Arbitrum docs", so a
`%s | Arbitrum docs` template would double the suffix.

### The site URL rule

Every absolute URL in metadata, the sitemap and robots.txt comes from `getSiteUrl()` in
`lib/shared.ts`. The rule itself is `resolveSiteUrl` in `lib/site-url.ts`:

- `NEXT_PUBLIC_SITE_URL` when set, and it must parse as an absolute URL or the call throws;
- otherwise `http://localhost:3000`;
- **except in a production build** (`VERCEL_ENV` or `NEXT_PUBLIC_VERCEL_ENV` is `production`),
  where a missing value throws.

`NEXT_PUBLIC_*` is inlined at build time, so without the throw a misconfigured production build
would ship every canonical pointing at localhost. `next.config.ts` imports the same module and calls
it first, which makes it the check that always fires. `app/layout.tsx` also calls it at module scope
for `metadataBase`. `lib/shared.ts` imports nothing heavier than that module, so the sitemap and
robots routes can use it without pulling in `lib/source`. `scripts/lib/site-url.test.ts` covers the
rule.

`RequestUpdateLink` is the one exception. It reads `NEXT_PUBLIC_SITE_URL` directly and falls back
to the site-relative path, because its URL goes into a GitHub issue a human reads.

### `/sitemap.xml` and `/robots.txt`

Both are Next metadata routes. `app/sitemap.ts` emits one entry per page from `source.getPages()`,
plus `/`, with `<lastmod>` when a date is known. Partials and the glossary are outside the docs
collection, so there is nothing to exclude. `app/robots.ts` allows everything and adds
`Content-Signal: search=yes, ai-input=yes, ai-train=no` through a rule's `other` field.

## Partials

Reusable `_`-prefixed fragments live in `content/partials/`, outside the docs collection, so they
can never be routed. They carry no frontmatter that matters: `<include>` strips it.

A page includes one with the root-anchored form, which survives the page moving:

```mdx
<include cwd>content/partials/_hardware-requirements.mdx</include>
```

Inside a partial, write the include file-relative (`<include>../_x.mdx</include>`), so the
fragment resolves from its own location.

The include is spliced in at build time, so its headings join the page's table of contents and
`check-links` validates its links per including page. Writers find partials by browsing
`content/partials/`; there is no catalog.

Two partials are generated and carry a do-not-edit comment: `content/partials/precompile-tables/`
(`pnpm precompiles:generate`) and `_reference-arbitrum-contract-addresses-partial.mdx`
(`pnpm contracts:generate`, from the `@arbitrum/sdk` network registry plus
`scripts/data/contract-addresses.data.ts`). Edit the generator or its data, never the output.
Every address is EIP-55 checksummed, because `<AEL>` throws on a bad checksum.

## Global variables

Values that move on a release cadence live in `content/vars.json`. `content/vars.ts` re-exports
the JSON with a `VarKey` type, so adding a key needs no code change. `<Var name="…" />` renders a
value inline. A few keys are read by code, not MDX, and `vars:check` does not complain about them.

`pnpm vars:check` fails when a `<Var name>` or `{var:name}` in `content/` names no key, because MDX
is not type-checked and a missing key renders the string `undefined`.

**`<Var>` does not evaluate inside a fenced block or an inline code span.** The reader sees the
literal tag. `content:lint` rule `var-in-code` fails on it. When a command must be copy-pasteable,
hardcode the value in the code and put `<Var>` in the prose beside it. For `latestNitroNodeImage`,
`pnpm nitro:check-release --to <tag>` keeps those copies current, but only in files that carry the
marker `{/* sync-with-var: latestNitroNodeImage */}`. Never add the marker to a page that states a
Nitro version historically, such as an ArbOS release page, or a bump rewrites history.

### A variable in a link destination is a placeholder

A CommonMark link destination may not contain a space, so `[text](…<Var name="x" />…)` never
parses as a link. Write `{var:name}` in the destination instead:

```mdx
[Interface](https://github.com/OffchainLabs/{var:nitroRepositorySlug}/blob/{var:nitroVersionTag}/precompiles/ArbSys.go)
```

`remarkVarLinks` in `lib/var-links.ts` expands placeholders in link and image URLs, link titles,
definitions, and JSX `href`, `to` and `src` attributes. `check-links` expands them before it
resolves an internal `/docs/…` link. Two limits:

- A placeholder in prose fails the build, because MDX reads the braces as an expression.
- A local image path is imported before the plugin runs, so write it in full.

`content:lint` rule `var-in-link` fails on a `<Var>` in a destination or URL attribute, and on a
placeholder whose name is not an identifier. The plugin reads `vars.json` once, so after editing a
value, restart `pnpm dev` to see it in a placeholder.

### This repository's own URL has one owner

`docsRepositoryUrl` and `docsRepositoryBranch` in `content/vars.json` are this repo's GitHub
identity. `gitConfig` in `lib/shared.ts` reads them for the edit link and the "Request an update"
link, and the contribute partials write their links home as
`{var:docsRepositoryUrl}/blob/{var:docsRepositoryBranch}/…`. `lib/shared.ts` imports the JSON with
`with { type: 'json' }` because tests import it under `node --test`.
`scripts/lib/contribute-repo-links.test.ts` asserts that the links in
`_contribute-docs-partial.mdx` and in the PR template match `gitConfig`, and that no `.mdx` file
writes a docs-repository URL in full. `_know-more-tools-box-partial.mdx` also uses the placeholders
and is covered only by that last check.
`.github/pull_request_template.md` stays hardcoded because GitHub renders it, not this site.

### Announcement banner

The bar above the navbar is Fumadocs' `Banner`, rendered in `app/layout.tsx` before `{children}`.
Five `vars.json` keys drive it: `announcementEnabled`, `announcementText`, `announcementLinkText`,
`announcementLinkHref` and `announcementId`. Three constraints:

- `vars:check` requires `announcementLinkHref` to be an `https` URL or a root-absolute path to a
  real page or `public/` file (`scripts/lib/announcement-link.ts`). `check-links` reads MDX only.
- `vars:check` requires `announcementId` to start with a letter and hold only letters, digits, `-`
  and `_`, since it becomes an element id and a selector. It is also the dismissal key in
  `localStorage`, so **a new message needs a new id**.
- The bar's height is fixed (`3rem`, `4rem` below 640px) because it feeds the layout's sticky
  offsets. No gate couples it to the text; the budget is in README.

### When Nitro moves a directory

Paths into the Nitro repository live as `nitroPathTo*` keys in `content/vars.json`. The prefix is
what registers them: `nitro:check-release` verifies each one, plus every content link under
`github.com/OffchainLabs/<nitroRepositorySlug>/blob/<nitroVersionTag>/`, against the GitHub
contents API at the target tag before it writes anything (`scripts/lib/nitro-upstream-paths.ts`).
The NodeInterface pins for `nitro-contracts` stay in `scripts/generate-precompile-tables.ts`
because they point at a fixed commit.

When a release moves a directory:

1. `pnpm nitro:check-release --to <tag>`, locally or in `nitro-bump.yml`, fails naming the pin or
   link that no longer resolves at the new tag.
2. Find the new path in the Nitro release diff.
3. Edit the pin in `content/vars.json`, or the link when a file moved but its directory did not.
4. Rerun `pnpm nitro:check-release --to <tag>` when the move came with a release bump, or plain
   `pnpm nitro:check-release` when it did not, then `pnpm precompiles:generate` and
   `pnpm cli:generate`.
5. Open the PR by hand and run the gates locally, since the automated branch gets no CI run.

`check-links` skips external URLs, so this check is the only thing that sees these links, and it
runs only here, not in CI, because the gates stay offline.

## Glossary and inline references

`content/glossary/*.mdx` is a reference collection (`{ id, title, sortAs? }`, body is the
definition). `lib/references.ts` is the registry. `<Term id="…">text</Term>` renders the text with
the definition in a hover popover (`components/HoverPopover`), rendered on the server so each page
ships only the definitions it cites. `<ReferenceList collection="glossary" />` renders the whole
collection on the glossary page.

`pnpm references:check` fails on an unknown id, a duplicate id, an entry with no `id` frontmatter,
an unknown `<Reference collection>`, or a `<Term>` or `<Reference>` inside a partial. A new term is
a new file in `content/glossary/`. A new reference type is a new collection in `source.config.ts`
plus one registry entry.

## Custom MDX components

`components/mdx.tsx` is the registry and the source of truth. It spreads Fumadocs' defaults (which
include `Callout`, `Card`, `Cards` and code blocks) and adds:

- Fumadocs' `Accordions`, `Tabs` and `ImageZoom`. Markdown images render through
  `ImageZoom` too.
- `Accordion` from `components/mdx/Accordion.tsx`, Fumadocs' own with the panel force-mounted.
  Fumadocs unmounts a closed accordion panel and an inactive tab, so their text never reaches the
  server HTML that search engines index. The registry force-mounts both (using the local
  `FindableTab.tsx` wrapper for tabs). `use-findable-panel.ts` sets `hidden="until-found"` after
  hydration and synchronously activates the panel on the browser's `beforematch` event. Search
  reveals skip the accordion animation so the browser can immediately highlight and scroll to
  the match. Let the browser apply `content-visibility` through `hidden="until-found"`; an explicit
  closed-state `content-visibility: hidden` can prevent Chromium from discovering the text when
  the hook adds the attribute. Browser tests exercise native text search and text-fragment reveal.
- `AEL`, an address explorer link (`components/mdx/AddressExplorerLink.tsx`).
- `Term`, `ReferenceList` and `Var` from `components/mdx/`.
- Four widgets under `components/widgets/`, each used by one page and each behind a `next/dynamic`
  boundary in its `index.tsx`: `FlowChart` from `CentralizedAuction/` (the Timeboost auction), `EdgeChallengeFlow` (BoLD,
  client only), `VendingMachine` (the cupcake demo, which pulls in viem) and the node
  troubleshooting set (`TroubleshootingChecklist`, `ChecklistItem`, `ConfigGuidance`,
  `TroubleshootingConfig`, `TroubleshootingReport`).

Callouts are `<Callout type="info|warn|error|idea|success" title="…">`. Fumadocs also accepts
`warning` as a spelling of `warn`; write `warn`. A Docusaurus `:::` line renders as text, and
`content:lint` fails on one.

The registry also overrides `a`: an internal link ending in `.pdf` renders as a plain anchor so
Next's `<Link>` does not prefetch the file. Every other link goes through Fumadocs' relative-link
resolver.

### Image captions

Fumadocs' `ImageZoom` has no caption prop: its props are the image props plus `zoomInProps` and
`rmiz`. A caption is a sibling `<figcaption>` inside a `<figure>`, with the markdown image on its
own line between blank lines so MDX parses it as markdown rather than as JSX text:

```mdx
<figure>

![Nitro support windows](/img/nitro-support-policy.png)

<figcaption>Nitro support windows</figcaption>
</figure>
```

Nothing in the registry maps `figure` or `figcaption`; both pass through as HTML, and Fumadocs'
prose styles size and color the caption.

`EdgeChallengeFlow` renders a committed snapshot, `public/data/edge-challenge-flow.json`, refreshed
by hand with `pnpm edge-challenge:fetch` from Arbitrum Sepolia. It has no `--check` mode because a
live source is never stale, only older.

### Remote images are never fetched at build

`lib/mdx-options.ts` sets `remarkImageOptions: { external: false }`, so the build never requests a
third-party image. A local `/img/…` src is measured from `public/`, and a missing raster file fails
the build. A missing `.svg` is skipped silently by the remark image plugin, so check SVG paths by
eye. A markdown image with a remote src reaches Next's image component with no dimensions and
renders broken. Commit the file under `public/img/`, or wrap a plain `<img>`:

```mdx
<ImageZoom>
  <img src="https://…" alt="…" />
</ImageZoom>
```

`content:lint` rule `remote-image` blocks the markdown form.

## Page weight and what loads late

`components/mdx.tsx` is a server module that every docs page imports, so Next cannot split what it
references. Every client component it reaches statically lands in every docs page, and any plain
`.css` file one of them imports becomes a render-blocking stylesheet on all of them. That is why
each widget sits behind `next/dynamic`, and why shared component styles live in `app/global.css`
or as Tailwind utilities.

A docs page loads three stylesheets. Check after any component change:

```bash
curl -s http://localhost:3000/docs/stylus | grep -o '<link rel="stylesheet"' | wc -l
```

Use `grep -o … | wc -l`, not `grep -c`: every stylesheet link sits on the document's first line.

Other things not to undo:

- **The Inkeep chat widget** (`components/inkeep/inkeep-chat-button.tsx`) waits for `load` and then
  an idle callback before it loads its chunk, so it downloads after the resources that decide
  Largest Contentful Paint.
- **The search dialog mounts on first open.** `app/layout.tsx` passes `preload: false` to
  Fumadocs' search options; its default of `true` mounts the dialog at once, which fetches the
  Inkeep bundle on every page load.
- **Fonts are self-hosted** under `public/fonts/` and loaded with `next/font/local` in
  `app/layout.tsx`. Never add `next/font/google`: it makes the build fetch from Google. Only the two
  upright Aeonik faces preload. The italic is its own declaration so it can skip preloading, and
  the `em, i, …` rule in `app/global.css` points italic elements at it. JetBrains Mono (fenced
  code) is the latin subset with its licence beside it, and keeps a variable `100 800` weight so
  bold tokens stay bold.
- **`lucide-react` stays on the version `fumadocs-ui` resolves** (`pnpm why lucide-react`), or two
  copies ship.
- **The home hero image** sets `preload`, `fetchPriority="high"` and `loading="eager"` together on
  purpose.

`@inkeep/cxkit-primitives` requests the Inter face from Google Fonts at runtime, from inside the
chat chunk. Nothing here can remove that short of dropping the widget.

## Redirects

Every redirect lives in `redirects.config.ts`, consumed by `next.config.ts`. Next compiles them into
the routes manifest Vercel reads, so there is no `vercel.json`. Adding one would shadow this file,
because Vercel applies `vercel.json` routes first.

The file has two blocks:

- **Between the `AUTO-GENERATED` markers**, one entry per moved page, appended by
  `pnpm move-doc`. Never hand-edit between the markers.
- **After them**, hand-maintained entries: two site-local ones for the retired pattern guide,
  then legacy `docs.arbitrum.io` paths mapped to `/docs/…`.

`pnpm move-doc <from> <to>` rewrites every internal link that resolves to the page (keeping each
link's written form), moves the file with `git mv`, re-bases its relative links, updates
`meta.json`, and appends the redirect. `--dry-run` prints the changes. It touches no other redirect.
When an older entry pointed at the old URL, or a page moves back to a URL an earlier move
redirected away, `scripts/lib/redirects-config.test.ts` fails and names the entry to fix by hand.
That test asserts that every internal destination names a page under `content/docs`
(case-sensitively), that no source is a live page, that nothing chains or loops, and that no source
is listed twice.

**Choosing a legacy destination**, in order:

1. A destination verified by hand, by comparing the old page's title with the candidates.
2. The same path under `/docs`, when it names a live page.
3. A whole-section rename, such as `/run-arbitrum-node` to `/run-a-node`.
4. The one local page with the same title.
5. The one local page with the same basename, when the basename was unique upstream too.
6. The nearest section landing, for a page that was never ported.

One entry falls under rule 6 and carries a comment: upstream's "Sequencer" page. Porting that page
means retargeting its entry by hand. **A redirect to a wrong page that exists is worse than a 404**,
and no test can see it, so decline rather than guess. Never add a source that names a live route:
Next's redirects run before routes.

Deleting a page is not a move. Write its redirect by hand in the same commit.

## Routing and `proxy.ts`

There is one locale and no `[lang]` segment. Pages live under `content/docs/` and serve at
`/docs/…`.

**Markdown mirrors.** `app/llms.mdx/docs/[[...slug]]/route.ts` serves every page as markdown at
`/llms.mdx/docs/<slug>/content.md`. `next.config.ts` rewrites `/docs/<slug>.md` (and `/docs.md`)
onto it. There is no `Accept` header negotiation: a `/docs` URL always serves HTML.
`/llms.txt` lists every page and `/llms-full.txt` concatenates them.

**`/.well-known/`** holds the MCP discovery card, `public/.well-known/mcp/server-card.json`. It
advertises the Inkeep MCP server over these docs, the same service behind search. Nothing
regenerates it; the HTTP smoke suite checks that it is served.

### Request tracking

`proxy.ts` records a PostHog `llms_file_fetched` event for `/llms.txt`, `/llms-full.txt`,
`/docs/<slug>.md` and the `/llms.mdx/` mirror. Its `config.matcher` lists exactly those paths, so
no other request runs the proxy.

- **Production only**: it checks `VERCEL_ENV === 'production'`, so nothing fires locally or on a
  preview, and no key is needed to run the app.
- **Both markdown shapes count as `/docs/<slug>.md`**, so one page is one series. The matcher sees
  the request before the rewrite, and a rewrite does not re-enter the proxy, so each request counts
  once.
- **Each event gets a random `distinct_id`** and `$process_person_profile: false`. The series
  counts fetches and bot categories, not readers. No IP address is read.
- **`$current_url` uses `getSiteUrl()`**, so the `*.vercel.app` alias does not split a page into two
  series.
- **The capture goes through `event.waitUntil()`** on the `NextFetchEvent`, so the response is
  never delayed. Do not swap in `waitUntil` from `@vercel/functions`, which reads a request context
  Next 16 does not set and drops the promise silently. A non-OK PostHog response is logged, since
  `fetch` resolves on HTTP errors.

Classification lives in `lib/llms-tracking.ts`, which imports only `lib/shared.ts`, so
`scripts/lib/llms-tracking.test.ts` tests the real module.

## Static routing under `/docs`

`app/docs/[[...slug]]/page.tsx` exports `generateStaticParams()` over `source.generateParams()` and
`dynamicParams = false`. Every page is prerendered at build, and any other slug under `/docs` gets
the prerendered 404 page from `app/not-found.tsx` with status 404, without rendering the docs page.
The `og/` and `llms.mdx/` routes prerender one entry per page as well.

Docs pages serve a `Cache-Control` header carrying an `s-maxage` directive; the value is Next's
own, and the smoke suite asserts the directive, not the number. The 404 keeps Next's `no-store`
directives.

Two consequences to accept:

- A page added without a rebuild answers 404. A failed build keeps new pages offline while existing
  pages keep serving the last good build.
- Anything that makes the route dynamic, such as reading `searchParams` in the page, breaks the 404. Next would then render `notFound()` mid-stream and replace the body with an empty error shell
  that still returns 404. Enabling Cache Components removes `dynamicParams` and has the same effect.

To check the 404 by hand:

```bash
pnpm build && pnpm start
curl -sS -D - -o body.html http://localhost:3000/docs/does-not-exist
```

Strip `<script>` blocks before grepping the body: a 200 page also carries the 404 copy in its
flight payload. `scripts/static-docs-http.test.ts` asserts this against a running build.

## Analytics

Four paths send events to one PostHog project. They share only the project token and the ingest
host.

| Path                                   | Where                                               | Runs            |
| -------------------------------------- | --------------------------------------------------- | --------------- |
| Page feedback (`docs_feedback`)        | `lib/posthog.ts`, a server action                   | everywhere      |
| Web analytics (`$pageview`)            | `components/analytics/posthog-provider.tsx`, client | production only |
| Inkeep search and chat (`inkeep_*`)    | `lib/inkeep.ts`, through the same client            | production only |
| Markdown fetches (`llms_file_fetched`) | `proxy.ts`, server                                  | production only |

The client gate is `NEXT_PUBLIC_VERCEL_ENV === 'production'` plus a key; Vercel sets that
variable. The client runs cookieless and in memory, with no session recording or feature flags, and
a pinned `defaults` date so an SDK upgrade cannot change what is captured. The 404 page reports `404_error` through
`components/analytics/not-found-tracker.tsx`, which retries until the client is ready and snapshots
the URL at mount. Those events show inbound URLs the redirect map misses.

`NEXT_PUBLIC_POSTHOG_KEY` is the publishable, write-only `phc_` token. Page feedback posts
server-side, so it works locally with the key set.

## Scripts are TypeScript, run by Node

Every script, test, data table and root config is TypeScript that Node 22.18 or later runs
directly (`node scripts/x.ts`). There is no tsx, ts-node, `.mjs` or `.js`.

- `package.json` has `"type": "module"`.
- `tsconfig.json` sets `erasableSyntaxOnly` (no enums, namespaces or parameter properties),
  `verbatimModuleSyntax` (a type-only import says `import type`) and `allowImportingTsExtensions`.
- A relative import in any file Node runs carries its `.ts` extension.
- `tsconfig.json` includes `**/*.ts`, so `types:check` type-checks every script.
- PostCSS is configured in the `postcss` key of `package.json`. Next ignores a `postcss.config.ts`
  silently, and Tailwind would stop compiling.

Node 22 is stated in three places that must agree: `engines.node`, the `node-version` key in each
workflow that sets up Node (`ci.yml` and `upstream-refresh.yml`), and the Vercel project's Node.js
Version setting, which is set by hand.
Never bypass `engines`.

## The gates

`.github/workflows/ci.yml` runs on pushes and PRs to `main`, `master` and `fumadocs`, in two jobs.

**`Gates`**, in order:

| Step               | What it proves                                                               |
| ------------------ | ---------------------------------------------------------------------------- |
| `types:check`      | Frontmatter schema, generated Next types, and `tsc` over the project         |
| `test`             | Every `scripts/**/*.test.ts` suite, including the sidebar and redirect tests |
| `vars:check`       | Every variable reference resolves; the banner keys are valid                 |
| `references:check` | Every glossary id resolves                                                   |
| `contracts:check`  | The contract-address partial matches `@arbitrum/sdk` and its data file       |
| `faq:check`        | The six FAQ partials match their `content/faq/*.json` snapshots              |
| `check-links`      | Internal links and their `#fragments` resolve, using the real MDX transforms |
| `content:lint`     | MDX that compiles but renders wrong (below)                                  |
| `format:check`     | Prettier                                                                     |

**`Build and HTTP smoke tests`** runs `pnpm build` (which runs `check-links` first), starts the
server, and runs `scripts/static-docs-http.test.ts`. That suite checks what only a built site
shows: prerendered pages, markdown URLs, the 404 shape, mirrors free of MDX comments, the MCP card,
home and docs metadata, and the contribute guide's links home. The build also catches a page that
compiles but throws at prerender. Nothing in the build reaches the network after `pnpm install`.

`merge-controlled.yml` fails a PR while it carries the `merge-controlled` label. Which checks block
a merge is decided by branch rules on GitHub, not by these files.

There is no pre-commit hook. Run the gates yourself before you push.

### The content-lint rules

`scripts/lib/content-lint.ts` reads each MDX file under `content/` with code masked by
`scripts/lib/strip-code.ts`, so an example inside a fence is never reported. The one exception is
`var-in-code`, which looks only inside code.

| Rule                   | Catches                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `docusaurus-directive` | A `:::note` line, which renders as literal colons                                        |
| `var-in-code`          | `<Var>` inside a fence or inline code, which renders as a literal tag                    |
| `var-in-link`          | `<Var>` in a link destination or URL attribute, or a malformed `{var:…}` placeholder     |
| `link-in-heading`      | A link or bare URL in a heading, which nests `<a>` in `<a>` and breaks hydration         |
| `tr-in-table`          | `<tr>` directly in `<table>`, where the browser inserts a `<tbody>` and hydration breaks |
| `remote-image`         | A markdown image with a remote src, which renders broken                                 |

`strip-code.ts` is the one "ignore code" scanner for every script; import it rather than writing
another.

### Hand-run tools

None of these is a CI gate. Two workflows run some of them (below):

| Command                                 | Does                                                                                                                                                                                                                                                                                                                               |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm move-doc <from> <to>`             | Moves a page, see [Redirects](#redirects)                                                                                                                                                                                                                                                                                          |
| `pnpm nitro:check-release [--to <tag>]` | Reports a newer Nitro release and a stale go-ethereum submodule pin, verifies every `nitroPathTo*` pin and Nitro source link at the pinned tag, writes nothing; `--to <tag>` is the only writer: it bumps the pinned release, the node image and the marked image tags to that tag, or repairs the submodule pin at the pinned tag |
| `pnpm precompiles:generate` / `:check`  | Precompile tables from the pinned Nitro refs (fetches from GitHub)                                                                                                                                                                                                                                                                 |
| `pnpm contracts:generate`               | The contract-address partial                                                                                                                                                                                                                                                                                                       |
| `pnpm cli:generate` / `:check`          | The Nitro CLI flags page from the pinned tag's Go source                                                                                                                                                                                                                                                                           |
| `pnpm stylus:generate` / `:check`       | The Stylus by Example pages from `offchainlabs/stylus-by-example`                                                                                                                                                                                                                                                                  |
| `pnpm edge-challenge:fetch`             | The BoLD challenge snapshot from Arbitrum Sepolia                                                                                                                                                                                                                                                                                  |
| `pnpm faq:fetch`                        | The FAQ snapshots in `content/faq/` from the Notion "FAQ CMS" database (needs `NOTION_TOKEN`)                                                                                                                                                                                                                                      |
| `pnpm faq:generate` / `:check`          | The six `_troubleshooting-*-partial.mdx` partials from the snapshots; offline                                                                                                                                                                                                                                                      |

`upstream-refresh.yml` runs `nitro:check-release` and `precompiles:generate` every Monday at 08:00
UTC. It never writes `content/vars.json`. It opens `automated/upstream-refresh` as a maintenance
PR when the tables changed, and one "Nitro vX.Y.Z is available" issue per newer release, with the
bump checklist. A stale submodule pin is only reported in the job log; a human repairs it with
`pnpm nitro:check-release --to <pinned tag>`. `nitro-bump.yml` is a `workflow_dispatch` that takes
the agreed version, runs `nitro:check-release --to <tag>` plus both generators, and opens
`automated/nitro-bump` as a PR. A PR opened with `GITHUB_TOKEN` triggers no CI run, so review
either PR's diff and run the gates locally.

`faq-refresh.yml` runs `faq:fetch` and `faq:generate` every Monday at 08:00 UTC with the
`NOTION_TOKEN` repository secret, and opens `automated/faq-refresh` as a PR when a snapshot or a
partial changed. It is the only place the token is used; `faq:check` in CI is offline.

### Generated pages

- **`content/docs/run-a-node/nitro/cli-flags-reference.mdx`** is written by `pnpm cli:generate`
  from the Nitro source at `nitroVersionTag`, including its go-ethereum submodule. Only the region
  between `{/* GENERATED:START */}` and `{/* GENERATED:END */}` is replaced, so frontmatter and
  surrounding prose survive. Flags whose default is not a static value are declared in
  `scripts/data/nitro-cli-reference.data.ts`; anything else the reader cannot evaluate fails the
  run.
- **`content/docs/stylus/stylus-by-example/`** is republished whole, frontmatter included, by
  `pnpm stylus:generate`. Each page carries a do-not-edit comment, so fix those pages upstream. The
  published set is the allowlist in `scripts/data/stylus-examples.data.ts`, whose order is the
  sidebar order and follows upstream's teaching sequence. The parent `meta.json` is hand-owned.
  Upstream's `metadata` export is parsed, never evaluated. A relative link to a slug this site does
  not publish stops the run. Nothing upstream is pinned, so `stylus:check` is not a CI gate.
- **`content/partials/_troubleshooting-{users,nodes,building,bridging,arbitrum-chain,stylus}-partial.mdx`**
  are written by `pnpm faq:generate` from `content/faq/<key>.json`, which `pnpm faq:fetch` reads
  from the Notion "FAQ CMS" database: rows that are `Publishable` and `4 - Continuously
publishing`, routed by `Target document slugs` and ordered by `FAQ order index`. The mapping is
  `lib/faq-pages.ts`. Edit a question in Notion, never in the partial; `faq:check` fails on a hand
  edit. Answers carry literal values, no `<Var>`, and no `<Term>`. A block the renderer does not
  support, a Notion link, or a link to no page fails the fetch and names the Notion page. The same
  snapshots feed the `FAQPage` JSON-LD that `lib/faq.ts` emits on those six pages.

Generated `meta.json` files are not formatted: `.prettierignore` excludes `content/**/meta.json`,
and the generators write them with `format: false`.

## What nothing catches

- **Rendering.** `types:check` proves the schema, not the render. Open changed pages on
  `http://localhost:3000`, not `127.0.0.1`, where React does not hydrate.
- **Runtime anchors.** `check-links` validates compiled heading ids but runs no components. Click
  changed anchors and confirm the target is visible under the sticky header.
- **A client component importing `lib/source`.** It bloats every bundle that loads it.
- **A new plain `.css` import in a registered component.** Recount the stylesheets.
- **A redirect to the wrong page that exists.**
- **A page deleted without a redirect.** Every gate passes while its URL starts to 404.
- **A remote image that has rotted.** Nothing requests third-party images.
