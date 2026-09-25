# INTERNALS

How this codebase works, and why it is built the way it is. For the docs team and anyone
maintaining the tooling.

Task-level instructions — setup, writing a page, using a partial — live in [README](README.md).
Getting a first contribution to an open PR is [CONTRIBUTE](CONTRIBUTE.md). The house prose rules
are [STYLE-GUIDE](STYLE-GUIDE.md), which is editorial, not technical, and nothing in this file
governs it. `CLAUDE.md` is machine-facing and duplicates parts of this file for coding agents;
**this file is canonical for humans, and the one to edit first.**

## Contents

- [What Fumadocs is](#what-fumadocs-is)
- [Coming from Docusaurus](#coming-from-docusaurus)
- [The pipeline](#the-pipeline)
- [`source` is a choke point](#source-is-a-choke-point)
- [The sidebar and its roots](#the-sidebar-and-its-roots)
- [The frontmatter contract](#the-frontmatter-contract)
- [Last modified dates](#last-modified-dates)
- [Page metadata](#page-metadata)
- [Partials](#partials)
- [Global variables](#global-variables)
- [Redirects](#redirects)
- [Routing and `proxy.ts`](#routing-and-proxyts)
- [Partial versioning](#partial-versioning)
- [Glossary and inline references](#glossary-and-inline-references)
- [Custom MDX components](#custom-mdx-components)
- [Remote images are never fetched at build](#remote-images-are-never-fetched-at-build)
- [Page weight and what loads late](#page-weight-and-what-loads-late)
- [The Node runtime](#the-node-runtime)
- [Scripts are TypeScript, run by Node](#scripts-are-typescript-run-by-node)
- [Analytics](#analytics)
- [The gates](#the-gates) (including [Generated pages](#generated-pages) and
  [Stylus by Example](#stylus-by-example))
- [The content-lint rules](#the-content-lint-rules)
- [What nothing catches](#what-nothing-catches)
- [Static routing under `/docs`](#static-routing-under-docs)
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
| `fumadocs-core`     | 16.15.9 | Headless engine: the Loader API, page tree, search, TOC, MDX plugins            |
| `fumadocs-mdx`      | 15.4.0  | The content source: compiles MDX into typed **collections**                     |
| `fumadocs-ui`       | 16.15.9 | The default theme: `DocsPage`/`DocsBody` layouts, tabs, accordions, code blocks |
| `fumadocs-twoslash` | 4.0.1   | Type-checked TypeScript code samples (` ```ts twoslash `)                       |

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
directory layout and refined by a `meta.json` in each directory. `meta.json` builds the content
tree: its `pages: []` array takes basename slugs and supports `...` rest-globs, `---Separator---`,
`[text](url)` link entries, and `!exclude`. What the reader sees is a rearrangement of that tree,
applied by the transformer in `lib/docs-navigation.ts` from the editorial manifest
`lib/docs-navigation.json`, which builds the nine section roots, one per navbar section. See
[The sidebar and its roots](#the-sidebar-and-its-roots).

**The catch-all route.** One file, `app/docs/[[...slug]]/page.tsx`, renders every docs page. It
takes the slug segments, calls `source.getPage()`, and renders. Adding an `.mdx` file creates a
route with no wiring; there is no per-page React file.

**The action row** under the title holds `MarkdownCopyButton`, `ViewOptionsPopover`,
`RequestUpdateLink` (`components/RequestUpdateLink.tsx`, the port of the Docusaurus `HeaderBadges`
"Request an update" badge: a server-rendered link to a prefilled GitHub issue, built from
`gitConfig`, which reads the repository URL from
[`content/vars.json`](#this-repositorys-own-url-has-one-owner), plus `page.url` and
`NEXT_PUBLIC_SITE_URL`), and, on versioned pages only,
`VersionSwitcher`. The [last updated](#last-modified-dates) line sits above it, between the
description and the row.

**Slugs are the file path minus the extension**, with a trailing `index` dropped —
`content/docs/stylus/quickstart.mdx` serves at `/docs/stylus/quickstart`, given `baseUrl: '/docs'`.

## Coming from Docusaurus

This repo replaced the Docusaurus site at `OffchainLabs/arbitrum-docs`, which is archived. Nothing
here reads that repo any more, and nothing may start to. Most of the team arrived from it, though,
so the differences that actually cause mistakes are worth keeping written down:

| Docusaurus                                          | Here                                                                |
| --------------------------------------------------- | ------------------------------------------------------------------- |
| `docusaurus.config.js`, presets, plugins            | `next.config.ts` + `source.config.ts`; no plugin system             |
| `sidebars.js` — one global file                     | A `meta.json` per directory                                         |
| Swizzling to override a theme component             | Edit the component; it is your code                                 |
| `onBrokenLinks: 'throw'`                            | Nothing built in — hence `check-links`, see [The gates](#the-gates) |
| `02-foo/bar` → `/foo/bar` (numeric prefix stripped) | **Prefix kept verbatim** in the slug                                |
| `@@varName@@` preprocessing                         | `<Var name="…" />`, see [Global variables](#global-variables)       |
| Client-redirects plugin + synced `vercel.json`      | Next `redirects()` only, see [Redirects](#redirects)                |
| `docs:move` style tooling                           | None official — `pnpm move-doc` is ours                             |

The numeric-prefix rule was the sharpest edge when porting URLs: a path that Docusaurus served at
`/foo/bar` serves at `/02-foo/bar` here unless the directory is renamed or a redirect is added. It
is why the legacy block of `redirects.config.ts` exists, and it still decides where a hand-added
legacy redirect should point.

`@fumadocs/cli` exists but only **installs UI components**. It does not move, rename, or restructure
docs, and it does not manage redirects. Every tool in `scripts/` exists because nothing else
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

**The markdown mirror is stringified from the page's own mdast, not compiled separately.**
`fumadocs-mdx` builds one processor per collection and appends its own postprocess plugin last
(`remarkPlugins: [remarkInclude, ...mdxOptions.remarkPlugins, [remarkPostprocess, …]]`), and that
plugin calls `remarkLLMs` on the tree the page compile is about to turn into JSX. So a remark plugin
listed in `lib/mdx-options.ts` runs after includes are spliced in and before the mirror is written,
and it cannot tell which output it is feeding: the fork is downstream of every plugin the site owns.

**MDX comments are stripped from that output, deliberately (FS-2732).** `{/* … */}` renders as
nothing, so it was never in the HTML, but it is an expression node in that shared tree and
`remarkLLMs` wrote it back out verbatim: 100 comments reached `/llms-full.txt`, three reached
`/docs/contribute.md`, two reached an archive mirror. `remarkStripMdxComments` in
`lib/mdx-comments.ts` now deletes every expression node whose parsed program has no statements and
at least one comment, wherever it sits, including inside a JSX element's children. A comment is not
content: every one of them is addressed to somebody editing the `.mdx` file, which is the one file
the mirror's reader does not have. That holds for the do-not-edit banners too, which name a `pnpm`
script in a checkout that reader never sees, and no generator reads a marker back out of a mirror
(`cli:generate`, `stylus:generate`, `precompiles:generate` and `nitro:check-release` all read the
raw file from disk). A comment written inside a fenced block or an inline code span is never an
expression node, so it is served exactly as written. The plugin sits in `lib/mdx-options.ts` rather
than in `postprocess`, because the page compile loses only an invisible newline per comment (each
one rendered as an empty JSX expression plus a `"\n"` text child), because that module is shared
with `check-links`, and because `postprocess` would have to state it once per collection.
`scripts/lib/mdx-comments.test.ts` runs the real processor plus the real `remarkLLMs`;
`scripts/static-docs-http.test.ts` asserts a page mirror, an archive mirror and `llms-full.txt` all
come back with no `{/*` in them.

**`lib/source` is server-only.** Never import it, or a constant that transitively pulls it, from a
client component: it drags the compiled collection into the browser bundle. One such import once
cost a 24 MB chunk on every docs page. No gate catches this — see
[What nothing catches](#what-nothing-catches).

## The sidebar and its roots

The rendered sidebar is declared in one file, `lib/docs-navigation.json`. It preserves the section
menus, labels, ordering and nested categories of the original Arbitrum documentation. The
`reference` field at the top records the `arbitrum-docs` revision the migration copied them from.
That is provenance only: no build and no request reads that repository.

### What decides what

Two files decide the sidebar, and they decide different things.

`meta.json` in each content directory still builds the **content tree** Fumadocs hands to the
transformer: which directories exist, what each folder is titled, which files a folder holds, and
what order they sit in. Its `pages` array takes basename slugs and supports `...` rest-globs,
`---Separator---` headings, `[text](url)` link entries, and `!exclude`. Everything the transformer
does is a rearrangement of the nodes that tree already contains.

`lib/docs-navigation.json` decides the **rendered hierarchy**: the sections, their names and order,
the groups inside them, the order of pages within a group, and the label on each entry. The single
`loader()` call in `lib/source.ts` attaches `docsNavigationTransformer` as a page-tree transformer,
so the sidebar, the breadcrumbs and previous/next navigation all read the one rearranged tree.
Moving a page between menu categories changes neither its URL nor its file.

### The manifest

Nine sections, one per navbar destination. `lib/layout.shared.tsx` carries ten links to them, four
of those inside the "Build apps" menu: two of the ten name the same section, and the Stylus link
points at `stylus/quickstart` rather than at that section's index. Each section has an `id` naming
its folder in the content tree, a `name`, a `sourceFolders` array assigning local content to it, and
`children`. The twelve
`sourceFolders` cover every top-level directory under `content/docs`, and each directory belongs to
exactly one section. That is an invariant, not a coincidence: `pnpm nav:check` has held it since
FS-2751, and [What `nav:check` checks](#what-navcheck-checks) says how.

An entry in `children` is one of four shapes, and `buildDocsNavigation` (`lib/docs-navigation.ts`)
throws if it is none of them:

| Field      | Uses today | What it builds                                                    |
| ---------- | ---------- | ----------------------------------------------------------------- |
| `page`     | 238        | the real page node for that URL, which gives the page its section |
| `href`     | 42         | a display-only link that claims nothing (see below)               |
| `children` | 44         | a nested category built from the entries inside it                |
| `folder`   | 2          | a whole local subtree, copied in place                            |

Two modifiers: `flatten: true` lifts an entry's children into the surrounding category, applied to
any entry that builds a folder and so to a `children` category as much as a `folder`, used once
today, on the `third-party-docs` folder; and `defaultOpen` opens a `children` category, which the
transformer supports and the manifest does not use today.

A page gets its name from the first of these that exists: the manifest entry's `name`, then the
page's own `sidebar_label` frontmatter, then its `title`. The transformer's `file()` hook renames
every page node to its `sidebar_label` before `buildDocsNavigation` runs, and a manifest entry
overrides that only when it passes a `name` of its own. See
[The frontmatter contract](#the-frontmatter-contract). 316 of the 326 entries carry a `name`; the
ten that do not are eight oracle pages and the two `folder` entries.

### How a page gets its sidebar

`TreeContextProvider` (`fumadocs-ui/contexts/tree`) resolves the current pathname against the
rendered tree with `searchPath` (`fumadocs-core/breadcrumb`), a depth-first search that stops at the
**first** page node carrying that URL and returns the chain of folders from the top of the tree down
to it. It then takes the **last** folder on that chain whose `root` is true, with
`path.findLast((item) => item.type === 'folder' && item.root)`, and renders that folder as the
sidebar. A page on no such chain, or on one holding no root folder, falls back to the whole tree.

Two consequences run through the rest of this section. A URL that sits on two page nodes gets
whichever node the depth-first walk reaches first, and the folder above the other node never gets a
look, which is why one `page` entry per URL is a rule rather than a preference. And a page nested
under two root folders gets the inner one, since that is the last on the chain.

Two places in the repository lean on this rule: the `owner()` helper in
`scripts/docs-navigation.test.ts` re-implements it to assert one section owner per page, and the
`tabs={false}` comment in `app/docs/layout.tsx` states it in words. A third used to, the comment
above `nav:check`'s root-coverage rule, and went with that rule in FS-2751.

### Cross-section links use `href`

A `page` entry is a claim, because it is the page node the search above resolves to. Repeating a
canonical `page` in a second section would therefore give the destination the wrong tree. An `href`
entry instead becomes a separator node carrying a URL, which `SidebarNavigationReference` renders as
an ordinary sidebar link while Fumadocs' page lookup and previous/next traversal skip it. Repeating
one is free, and the manifest repeats five URLs. Of the eighteen distinct internal `href` URLs,
sixteen are also claimed by a `page` entry in the section that owns them. That is what lets the
Stylus quickstart appear under Get started while opening the Stylus sidebar.

Claiming nothing also means nothing in the tree marks a reference as the current page, so
`SidebarNavigationReference` compares the URL to the pathname itself and passes `active` to
`SidebarItem`, with the notebook layout's own active classes. It matters for one row: an `href` that
points into another section is never on screen while the reader is on that page, but Get started's
landing row points inside its own section, and without this it was the one row in the sidebar that
stayed unlit under the reader's feet. See [One URL, one page node](#one-url-one-page-node-fs-2749)
for why that row is an `href` at all.

The three PGA and Fast Feed entries are local `page` entries, pointing at the pages under
`content/docs/how-arbitrum-works/priority-gas-auction/` and
`content/docs/launch-arbitrum-chain/configuration/sequencer/pga.mdx`. The synced Stylus examples
are also local: a `folder` entry pulls the whole subtree in under Build apps with Stylus, in its
Reference group.

### Pages the manifest never lists

A page inside a section's `sourceFolders` that no entry claims is collected after every explicit
claim is settled and appended to that section in an **Additional guides** folder. Nothing is lost,
and nothing is inserted into the original learning sequence. Seven of the nine sections have such a
group today, holding 58 pages between them; Run an Arbitrum chain alone holds 43. Build apps with
Solidity and Arbitrum bridge have none. To place a page in the main menu, give it an entry.

**Folder landing pages stay in that group, and that is a decision, not an oversight** (FS-2749).
**Twenty-nine of the 58 entries are an `index.mdx`, twenty of them under Run an Arbitrum chain.**
Twenty-seven of the twenty-nine are attached as a folder's index node, so they render as that
folder's own clickable title; the other two, `/docs/oracles` and
`/docs/launch-arbitrum-chain/migrate`, render as plain rows. Count the index nodes rather than the
files and the two figures read twenty-seven and nineteen, which is the same population seen from the
tree instead of from disk. Every one of the twenty-nine is a `Cards` grid: the ones under Run an
Arbitrum chain carry no prose outside the grid at all, and the rest carry one sentence each. So they
restate the sidebar, and pulling them out of the group is tempting. Do not. **Sixteen of the
twenty-nine have no incoming link from any page that is not itself one of these landings**, measured
over every `.mdx` under `content/`, counting only a link whose destination is exactly that URL. The
two plain rows are not among the sixteen, so the figure is the same under either reading of the
population. Excluding a folder index from the fallback group would therefore not move those sixteen
into the parent's card grid, which is where the argument for excluding them assumes they already
are. It would leave them reachable by URL alone, while they stay in the sitemap and in `llms.txt`:
indexed and unnavigable, which is worse than a hub page behind a collapsed toggle. It would also
remove about six folder nodes whose only content is their landing, and hide any future landing page
that does carry prose, silently, since the rule would be structural rather than editorial.

The fix that does work, if a landing belongs in the reading order, is the one Docusaurus spelled
`link: { type: 'doc' }`: give the manifest group a `page` of its own, which `buildDocsNavigation`
attaches as that group's index. The manifest already supports it and nothing has to change in code.
It is editorial work rather than a rule, because the manifest's groups deliberately do not mirror
the folder tree: "Chain configuration" holds pages from `configuration/sequencer`,
`configuration/costs`, `configuration/validation` and `operate`, so no folder's landing maps onto
one group.

A page in a directory that **no** `sourceFolders` list covers is still reachable, but it is
appended to the top of the tree beside the sections rather than inside one, so it gets no section
root and no section sidebar. `content/docs/index.mdx` already sits there by design, because the
docs index is the section list, and `SECTIONLESS_BY_DESIGN` in `scripts/lib/nav.ts` is that
exemption. A new top-level directory that nobody adds to a `sourceFolders` array lands in the same
place, and since FS-2751 `pnpm nav:check` reports it. Measured, with a `scratch-zone` directory
holding one page and a loose `loose-probe.mdx` at the top of `content/docs`: the rendered tree's
top-level children read `index`, `loose-probe`, `Scratch zone`, then the nine section folders, and
the first three carry no section root.

`_fallback` is fumadocs-core's, not ours. `transformerFallback` counts the files the tree build
reached; when that count is short of the storage's own file count, it runs a **second** tree build
over the files nothing reached, stores the result as `root.fallback`, and passes `_fallback: true`
in the build context. Our `root()` hook returns that second tree untouched, because rebuilding the
manifest sections from a partial file set would produce a wrong tree. i18n is one way to leave files
unreached, not the condition.

That branch never runs here, and nothing about the branch is i18n-specific. Measured: `root.fallback`
is `undefined` on the real content, and dropping one page from a `meta.json` is enough to make it
defined with that one page in it. What keeps it undefined is `nav:check`'s hidden-page rule, which
fails on a file no `pages` entry and no `"..."` lets through. Note that `root()` itself, the hook
holding the guard, fires on every build: it is what installs the whole navigation.

### There is no root switcher

Fumadocs would render a dropdown above the tree, its `tabs` option, naming the current section and
listing every sibling. That is a second copy of the navbar's section list, and it let a reader hop
between main-menu sections from inside the sidebar, which is not what a sidebar is for.
`app/docs/layout.tsx` passes `tabs={false}`: the navbar chooses the section, the sidebar shows that
section's tree, as the Docusaurus site behaved.

The footer pins Chain info, Glossary and Contribute below every section tree, matching the original
section menus. `SidebarResourceLinks` is passed as a component so the notebook layout's hidden
footer wrapper does not hide the links on desktop. Its links live in `lib/shared.ts` and
`scripts/lib/shared.test.ts` asserts each resolves to a real page.

### `"root": true` is gone from `content/docs` (FS-2751)

Twelve `meta.json` files used to declare it. **Nothing in a content directory declares it now**, and
a new one should not: the transformer decides which folders are roots. It sets `root: true` on the
nine section folders it builds and `root: false` on every folder it copies or carries over, and
leaves the categories it builds from a `children` array with no `root` key at all, which every
consumer reads as false. Counted in the rendered tree: of 117 folder nodes, 9 are `true`, 57 are
`false` and 51 carry no such key.

The flags decided nothing a reader saw. Measured, by rebuilding the tree through Fumadocs with all
twelve deleted and comparing leaf keys (URL, name and the folder chain above each node): 391 keys
both ways, 0 differing, identical order. The one thing `metadata.root` changes inside fumadocs-core
is that a root folder's `index.mdx` is not auto-attached as `node.index`, and `buildDocsNavigation`
already falls back to `pages.get('/docs/<section id>')` for exactly that case, which is why nothing
moved. Nothing else in `app/`, `lib/`, `components/` or `scripts/` read a node's `root`.

There is one branch where a meta.json `root` would still decide a sidebar, and it does not run here:
`root.fallback`, the second tree `transformerFallback` builds over unreached files, which our
`root()` hook returns untransformed. Measured `undefined` on the real content, for the reason
[Pages the manifest never lists](#pages-the-manifest-never-lists) gives.

**The rule that read them went too.** Root coverage failed on a page under no `"root": true` folder,
but the flags were also its only input, so all it proved was that the flags existed: circular. Worse,
it reported zero on a `scratch-zone` directory that declared the flag and appeared in no
`sourceFolders` array, while that directory's page rendered above the nine sections with no section
sidebar. `pnpm nav:check` now checks `sourceFolders` against the content tree instead, which is the
question that actually decides where a top-level directory's pages land. See
[What `nav:check` checks](#what-navcheck-checks).

### Link entries in a `meta.json` still cause damage, differently

FS-2716 was a `"[Chain info](/docs/chain-info)"` entry in every root folder's `pages`. A link entry
becomes a real page node in the content tree, so `/docs/chain-info` had two nodes, the depth-first
search in [How a page gets its sidebar](#how-a-page-gets-its-sidebar) found the injected copy first,
and the page served the Get started tree under a "Third-party docs" label.

The transformer rebuilds every root from the manifest, so that exact failure is gone: with such an
entry added back, `/docs/chain-info` still has one node and still belongs to Get started. Two
failures remain, both against a page the manifest does not name explicitly, and each is decided by a
different ordering, so a given entry can produce either, both, or neither:

- **The label leaks, if the linking directory is walked after the page.** `collect()` indexes page
  nodes by URL as it walks the content tree and the last write wins, so the link entry's text
  becomes the page's sidebar name only when its copy is the last node collected for that URL.
  Measured: `"[Docker](/docs/run-a-node/nitro/docker-and-cli-binaries)"` in `notices/meta.json`
  renamed that page to "Docker", because `notices` follows `run-a-node` in
  `content/docs/meta.json`; the same entry in `get-started/meta.json` left the page's own name
  standing, because the real node is collected last.
- **The page moves, if the linking section is processed first.** Sections are processed in manifest
  order, and the first to reach an unclaimed page keeps it. Measured: that same entry in
  `notices/meta.json` left the page under Run an Arbitrum node, which the manifest lists earlier;
  in `get-started/meta.json`, which it lists first, the page was pulled into Get started's
  Additional guides.

The two orderings are independent, and both failures land together when they disagree. Measured:
`"[Zzz](/docs/how-arbitrum-works/bold/bold-faq)"` in `arbitrum-bridge/meta.json` both renamed that
page to "Zzz" and moved it into Arbitrum bridge's Additional guides, because `arbitrum-bridge`
follows `how-arbitrum-works` in `content/docs/meta.json` while the manifest lists it first. So do
not reason from which failure you can see.

So the rule stands: never write a `[Title](/docs/…)` entry pointing at a page in this repo. It
applies to all three shapes Fumadocs accepts, `[Title](/docs/…)`, `[Icon][Title](/docs/…)` and
`external:[Title](/docs/…)`, which `LINK_ENTRY` in `scripts/lib/nav.ts` matches with the regex
copied from `fumadocs-core`. Reference the page as `"../name"` from the one folder that should hold
it, or link to it with an `href` entry in the manifest.

`content/docs/resources/` is the reference-only shape done right. It is a `meta.json` and nothing
else, and it claims the four loose pages at the top of `content/docs` through `"../chain-info"`-style
references: a `pages` entry is joined onto the directory holding the meta.json, and `..` pops a
segment, so a page joins a folder without moving and without a redirect. Claims are arbitrated by
`own()` on a first-come basis at equal priority, so `"resources"` must precede those pages in
`content/docs/meta.json` and their names must not also be listed there. `resources` is then a
`sourceFolder` of Get started, which is what puts those four pages in that section.

**That claim is the directory's whole job now.** It carried `"root": true` as well until FS-2751,
which is gone with the other eleven, and it holds no `.mdx` file of its own. **Deleting it takes two
edits, not one**: the directory and Get started's `"resources"` entry in `sourceFolders`. Measured,
dropping the directory alone: `buildDocsNavigation` throws
`Navigation source folder does not exist: resources`, so the dev server dies rather than the sidebar
rearranging. Dropping both, the four pages still land in Get started, because a manifest `page`
entry names each of them. What the directory buys is the fifth loose page: without it, a new `.mdx`
at the top of `content/docs` has no covered directory to claim it, and `nav:check` reports it. The
`missingFolders` rule is what forces the second edit.

### What `nav:check` checks

Six rules, none of them visible to `types:check` or `build`:

1. **Ghost entries.** A `pages` entry naming nothing on disk, which Fumadocs ignores in silence.
2. **Hidden pages.** A file on disk that no `pages` entry and no `"..."` lets through.
3. **Section coverage** (FS-2751), in four reports from one pass. `checkSections` in
   `scripts/lib/nav.ts` models fumadocs-core's `own()` to work out which directory owns each page
   and each folder, then asks whether that chain of claims reaches a directory some section names in
   `sourceFolders`, which is the set `buildDocsNavigation` sweeps for leftovers. It reports a
   `sourceFolders` entry that will not resolve to a folder node (the transformer throws on this, so
   the gate turns a stack trace into a named entry), a folder named more than once across those
   arrays, whether by two sections or twice by one (only the first listing collects anything, in
   silence), a top-level directory no section covers, and a page no section covers, which in
   practice means a loose `.mdx` at the top of `content/docs` that no directory's `pages` array
   claims. The first of those four tests for what the transformer needs rather than for a directory
   on disk: fumadocs-core builds a folder node only where `storage.readDir` finds a file, and that
   storage holds only `.mdx` pages and `meta.json`, so a directory of images alone gets no node.
   Measured, with a `content/docs/empty-zone/` holding one `.txt` and named in a `sourceFolders`
   array: a plain directory-exists test reported no defect while the transformer threw
   `Navigation source folder does not exist: empty-zone`. A page inside an already-reported directory is left out of the last list, so
   one root cause gives one message. `content/docs/index.mdx` is the one exemption,
   `SECTIONLESS_BY_DESIGN`.
4. **Shadowing links.** A `pages` link entry pointing at a real page in this repo (FS-2716). Under
   the manifest it no longer gives the page a second node, but it still renames the page and can
   still pull it into the linking directory's section: see
   [Link entries in a `meta.json` still cause damage, differently](#link-entries-in-a-metajson-still-cause-damage-differently).
5. **Manifest duplicates.** A `page` URL that `lib/docs-navigation.json` claims twice, which always
   means one entry names a page it does not open while the page it was meant to name falls into
   Additional guides (FS-2740). A URL claimed twice is a URL on two nodes, and
   [How a page gets its sidebar](#how-a-page-gets-its-sidebar) is why only one of them is ever
   found. The rule lives in `lib/docs-navigation-rules.ts` and both
   `buildDocsNavigation` and the gate import it, so a duplicate throws in a dev server as well as in
   CI. A repeated `href` is exempt, because a shortcut claims nothing.
6. **Section landings** (FS-2749). A `page` entry claiming any section's landing URL, its own or
   another's, which rule 5 cannot see because the landing node is derived rather than listed. `sectionLandingClaims`
   sits beside the duplicate rule in `lib/docs-navigation-rules.ts` and the transformer imports it
   too, and it checks every section's landing against every section's `children`, because a `page`
   entry in one section naming another's landing builds the identical two-node defect. The rule is
   exact with no content tree, because the landing node exists whenever `/docs/<section id>` exists.
   Where it judges without knowing is a manifest already broken twice over, one whose landing URL
   does not exist at all: the rule runs ahead of the build, so it fires first and the reader gets a
   landing-flavoured message for what is really a nonexistent page. The build fails either way.

One shape gets past rule 5, recorded in FS-2749: an entry can point at a folder index that exists
while the page it was meant to name sits in Additional guides. Every URL involved is real and every
URL is on one node, so neither the missing-page throw, nor the duplicate rule, nor the one-node rule
below sees it. Three of the 238 `page` claims name a folder index, and all three look like this
shape: "Test chain configuration" points at `/docs/launch-arbitrum-chain/configuration/validation`
while `configuration/validation/test-chain-configuration.mdx` sits in Additional guides, "Token
bridge troubleshooting" points at `/docs/launch-arbitrum-chain/deploy` while
`deploy/token-bridge-troubleshooting.mdx` does, and "FAQ" points at `/docs/how-arbitrum-works/bold`.
A fourth was Get started's landing, one of the 239 claims the manifest carried before FS-2749 made
it an `href`.

### One URL, one page node (FS-2749)

`buildDocsNavigation` walks the tree it has just built and throws when any URL sits on more than one
page node. That check is the authority; the two manifest reads above it are a fast path that can
name the offending entries, which a finished tree cannot.

It exists because a static read of the manifest cannot see every way a URL gets two nodes. Rule 5
walks each section's `children`, and two things put a page in the tree from outside `children`: the
section landing, derived from the source folder's index, and a `folder` entry, which expands through
`copyFolder` and claims every page in the subtree. Measured: a `page` entry for
`/docs/stylus/stylus-by-example/basic_examples/hello_world`, a page the Stylus Reference group
already reaches through its `folder` entry, repeated nothing in the manifest, returned zero from the
duplicate rule, built without complaint, and put that URL on two nodes.

The real tree now carries 349 page nodes over 349 distinct URLs. It carried 350 over 349 until this
ticket: Get started's first `children` entry claimed `/docs/get-started`, the same URL the section
landing derives, so `searchPath` reached the `children` copy and the landing node above it was never
looked at. That entry is now an `href`, which builds a display-only separator claiming nothing, so
the sidebar keeps the row a reader clicks while the page keeps one node.

The gate does not run this check, and does not need to. `pnpm test` is a
blocking gate and `scripts/docs-navigation.test.ts` already builds the real content through the
real transformer, so the check runs there, on the real tree, with no model of `copyFolder` to drift
against. `pnpm build` and `pnpm dev` fail on it too.

`scripts/docs-navigation.test.ts` loads the real content through Fumadocs and asserts the finished
hierarchy: section landing pages, complete page coverage, one section owner per page, the learning
sequences, cross-section destinations, name precedence, and that a missing page or a duplicate
throws. Check rendered desktop and mobile navigation by hand when you change the layout or the
reference renderer.

## The frontmatter contract

`source.config.ts` extends the Fumadocs page schema. Every non-partial `.mdx` page **must** carry
`title`, `description`, `content_type`, `author`, and `sme`.

`content_type` is a fixed enum: `how-to`, `concept`, `quickstart`, `tutorial`, `reference`,
`troubleshooting`, `faq`. Optional fields: `sidebar_label`, `user_story`, `draft`.

A missing or invalid field fails `types:check` and `build`. This is the most common reason a build
breaks after adding content.

`sidebar_label`, when set, becomes the page's name in the sidebar tree, but only if the page has no
explicit `name` in `lib/docs-navigation.json`; a manifest `name` always wins. A page the manifest
never names, whether it has an unnamed entry, arrives through a `folder` entry, or falls into an
Additional guides group, renders its `sidebar_label`. See
[The sidebar and its roots](#the-sidebar-and-its-roots).

## Last modified dates

Each docs page prints "Last updated on <date>" under its description, the equivalent of upstream
Docusaurus' `showLastUpdateTime`. The date is not frontmatter and writers never set it: the
`lastModified` option on the `docs` and `docsVersions` collections makes `fumadocs-mdx` read it
from git, and `page.data.lastModified` (a `Date`) reaches the page component through the same
`source` object as everything else. An archived version shows the archive file's own date, not the
live page's.

**No date is resolved unless the checkout has complete git history**, decided by the
`hasFullGitHistory()` probe at the top of `source.config.ts`. In a
shallow clone the oldest commit is grafted in as a parentless root, so git diffs it against the
empty tree and reports it as adding every file under it. Measured on this repo at `--depth=10`:
430 of about 450 pages came back stamped with a single boundary commit that in full history
touched no content at all. A wrong date on every page is worse than no date, so the probe yields
no dates instead. Nothing renders, no error appears, and nothing fails.

**The option is never set to `false`, and that detail is load-bearing.** `lastModified` is part of
the collection's _type_ contract, not only its behaviour: fumadocs-mdx adds the
`lastModified?: Date` field to the generated `DocData` only when the option is truthy. Setting it
to `false` in a shallow checkout deletes the field from the type, and the docs page then fails
`types:check` with TS2339. That makes the gate pass or fail according to how the repository
happened to be cloned, which is exactly what happened on the first attempt at this change: green
locally, red in CI, because `actions/checkout` clones shallow. The probe therefore chooses between
two _truthy_ values. With full history it passes `true`, which uses fumadocs-mdx's batched
`git log`. Without it, it passes a resolver that returns `undefined` for every file, which keeps
the field typed while yielding no dates.

The choice is made in `source.config.ts` at build time rather than at render time because pages
render on demand in a serverless runtime that has neither git nor the repository.

**Vercel builds fetch full history during `postinstall`.** `scripts/ensure-docs-history.ts` checks
for a shallow checkout and fetches the public repository's history before `fumadocs-mdx` generates
the pages. It fails the install if that fetch fails, so a deployment cannot silently omit the dates.
A deep clone skips the fetch. Local shallow clones still omit dates until their history is filled in.
The same applies to any CI job that wants the dates, since `actions/checkout` defaults to
`fetch-depth: 1`. No gate depends on the dates, so `ci.yml` never asks for a deep clone. Its `Gates`
and `Build` checkouts do set `fetch-depth: 2`, for `versioned-docs-check.ts`
(see [The gates](#the-gates)), and that is deliberately the largest depth that changes nothing here:
a depth-2 clone is still shallow, so this probe still answers `false` and the dates stay off. Raising
it further, or to `0`, would switch them on in CI and re-type the docs page's `lastModified`, so
treat any change to those two lines as a change to this section as well.

The rendered date is formatted in UTC so that the output does not depend on which machine rendered
the page. A commit made late in the evening in a western timezone therefore reads as the next day.
The machine-readable `dateTime` attribute on the `<time>` element always carries the exact instant.

## Page metadata

`generateMetadata` in `app/docs/[[...slug]]/page.tsx` emits the per-page title and description, an
Open Graph image from the `og/` route, a canonical URL, and the Twitter card tags
(`summary_large_image`, site `@arbitrum`). The canonical deliberately uses `page.url`, the live
page's URL, so an archived view at `/docs/<slug>/<id>` canonicalizes to its live page rather than
splitting one document in two. Archives also carry `robots: noindex, follow`. **`og:site_name`,
`og:url` and `og:type` (FS-2724)**: `og:site_name` is `appName` from `lib/shared.ts`, the same
constant the site root's `openGraph.siteName` uses, so the two cannot drift. `og:url` is the same
absolute string `alternates.canonical` carries, computed once into one `canonical` constant and
spent on both, since they are one claim addressed to two readers; an archive therefore names its
live page in both. Next emits `og:url` only from an explicit `openGraph.url` and synthesizes
nothing from the canonical, so before this ticket a docs page had none while `/` did. `og:type` is
`article`, not the `website` the root uses, and it is applied **uniformly to everything the
catch-all serves**, `/docs` and the section landing pages included. The distinction being drawn is
root versus docs, not index versus document: nothing in either collection marks a page as an index,
so singling out the landing pages would take a hand-kept list of URLs that goes stale the moment a
section is added, and `og:type` drives no crawler behaviour that would pay for it.
`scripts/static-docs-http.test.ts` asserts `/docs` is `article` so that uniformity is recorded as
a decision rather than read later as an oversight. `article` also unlocks `article:modified_time`,
set from the same `lastModified` (`page.data.lastModified` for Latest, `archive.entry.lastModified`
for an archive) the page body already renders as "Last updated on …", and omitted along with that
line when the checkout has no full git history (`hasFullGitHistory` in source.config.ts). Because
that makes the tag absent in CI, which checks out shallow, the test asserts it is present **if and
only if** the body carries the "Last updated on" `<time dateTime>` and that the two instants match,
rather than skipping the assertion when the tag is missing, which would never execute in the one
place the suite runs automatically. `article:published_time` is deliberately not set, because
nothing in the frontmatter or either collection records when a page was first published, only git's
last-touched date, which is what `modifiedTime` already is. Archives get all three new tags too:
`noindex` controls crawling, not what kind of object the URL is, and an archive's own `lastModified`
is a real per-document date, not the live page's. That leaves an archive's OG object naming the
live page's URL while dating the archive itself, and the two coincide today only because one commit
last touched both files; accepted, because `og:url` is the OG object's canonical, which for an
archive is its live page, while the date describes the document actually served.

**The site root publishes the same set, from a static `metadata` object in `app/(home)/page.tsx`**
(FS-2713). It shipped with none of it: measured on a production build of `3064177`, the only
`<meta name>` tags on `/` were `viewport` and `next-size-adjust`, `grep -c '<title'` returned 0,
and Lighthouse scored the page 83 on SEO with `document-title` and `meta-description` both failing,
against 100 for every docs page. The root is the URL most likely to be shared and indexed.

Its title and description are `siteTitle` and `siteDescription` in `lib/shared.ts`, beside
`appName`, so the page and its social card render from one pair of strings. **They are deliberately
not the docs landing page's own title and description.** `content/docs/index.mdx` is titled
"Arbitrum docs", and `/` and `/docs` are two separately indexable portal pages: one title across
both would make each compete with the other for the same query. `scripts/static-docs-http.test.ts`
asserts the two differ, so reusing one is a test failure rather than a silent regression.

**The root's card is `app/(home)/opengraph-image.tsx`, Next's file convention, not a second handler
under `app/og/`.** The existing route resolves its slug through `source.getPage()`, and the site
root is not a page in the docs collection, so it cannot serve `/` under any URL. The convention
buys two things a hand-written route would not: Next emits `og:image:width`, `og:image:height`,
`og:image:type` and `og:image:alt` beside the URL, and the file's position scopes the image to the
`(home)` route group, which holds only `/`. At the app root it would apply to `/docs/**` too, where
each page already generates a card of its own. The card itself, colours and 1200x630 size included,
is `renderOgImage` in `lib/og.tsx`, shared with the docs route so the two cannot drift apart;
nothing else would catch that, because an OG image is only ever seen in somebody else's feed. Next
serves it from `/opengraph-image-<hash>`, where the suffix is derived from the file's position in
`app/`, which is why the entry on the proxy's bypass list is a prefix test rather than an equality
one. A rejected alternative was pointing the root at `/og/docs/image.png`, the docs landing page's
card: it exists and is already prerendered, but its text comes from `content/docs/index.mdx`
frontmatter, so a writer editing that page would silently change what `/` looks like on X and in
Slack.

**No `title.template` in `app/layout.tsx`.** A site-wide `%s | Arbitrum docs` suffix is the
conventional shape and was rejected on two measurements, though only the first carries weight.
`content/docs/index.mdx` is titled "Arbitrum docs", so `/docs` would render "Arbitrum docs | Arbitrum
docs", and that reason stands on its own. The second reason is weaker than it first looks: the
longest frontmatter title across `content/docs` is 96 characters, not 105, and at 96 characters a
title is already well past the roughly 60 characters a search result shows, so a suffix costs nothing
on the handful of pages long enough to raise the concern. The suffix would instead land on the many
short titles that make up most of the tree, where it is brand value rather than truncation risk.
Adding a template later means giving `content/docs/index.mdx` (or any page that would otherwise
double the suffix) a `title.absolute`, which is an editorial pass and not a metadata change.

`app/not-found.tsx` already exported a title and a description and needed nothing. Every other
route under `app/` is a route handler or a metadata route and emits no document head at all.

**Every absolute URL a page publishes as metadata traces back to `getSiteUrl()` in
`lib/shared.ts`, and that helper throws rather than guessing.** It returns `NEXT_PUBLIC_SITE_URL`, falls back to `http://localhost:3000`
outside production, throws when `VERCEL_ENV` or `NEXT_PUBLIC_VERCEL_ENV` is `production` and the
variable is unset, and throws when a configured value does not parse as an absolute URL. The throw exists because `NEXT_PUBLIC_*` values are inlined at build time:
a production build with the variable missing would bake `http://localhost:3000` into the canonical
and social image URL of every page in the deployed output. Those pages then tell crawlers the
canonical copy lives on localhost, which is worse than emitting no canonical at all, and nothing
about the running site reveals it. Failing the build is the last cheap moment to catch it.

**The rule lives in `lib/site-url.ts`, and both `lib/shared.ts` and `next.config.ts` import
it.** That split is not stylistic. `next.config.ts` is the earliest thing the build evaluates, which
makes it the gate that always fires (Next transpiles the config file and the `.ts` files it imports
with its own hook, before anything else is compiled). It is no longer the _only_ thing that fires: before FS-2689 dropped
`--experimental-build-mode=compile`, no page or layout module was evaluated at build time at all, so
`getSiteUrl()`'s throw in `lib/shared.ts` never ran during a build and `next.config.ts` was the sole
enforcement point. Now that 1061 routes prerender, the docs pages among them (see
[static routing](#static-routing-under-docs)), the root layout's module scope does run at build and
would throw too. Keep both anyway: `next.config.ts` is evaluated before any route is, so it is the
one check that does not depend on what a given build happens to render. The rule used to be
written out by hand in both files, which meant the copy with the tests was the backstop and the
copy without them was the gate, one edit away from silently diverging. One module imported by both
removes the question. A malformed value is caught in the same place and for the same reason: an
origin pasted without a scheme (`docs.arbitrum.io`) satisfies a presence check, then throws inside
`new URL()` at the root layout's module scope on the first request after promotion and 500s every
route, which is the unset failure again but worse, because the unset case at least fails the build.

`app/layout.tsx` calls `getSiteUrl()` at module scope for `metadataBase`, which keeps the failure a
module-load one rather than a per-request one for anything reached outside a build. The docs page calls it again to build the
canonical absolutely rather than leaning on `metadataBase` resolution, so the one value that a
wrong canonical depends on is read through the one helper that refuses to invent it. The helper imports
nothing but the rule module, and must stay that way: it is what lets `app/sitemap.ts` and
`app/robots.ts` use it without pulling `lib/source` toward a client bundle. `scripts/lib/site-url.test.ts` covers it, calling the rule directly and
then checking both wrappers: `getSiteUrl()` in a subprocess that imports `lib/shared.ts` under
Node's own type stripping, and `next.config.ts` by importing it the same way under a controlled
environment, which is the case that pins the build failure itself.

**`RequestUpdateLink` is the one deliberate exception, and it should stay one.** It reads
`NEXT_PUBLIC_SITE_URL` directly (`components/RequestUpdateLink.tsx`) and falls back to the
site-relative path rather than to the helper's localhost. Its URL is not metadata: it goes into the
body of a GitHub issue that a person reads, and `/docs/stylus/quickstart` tells that person which
page the report is about, while `http://localhost:3000/docs/stylus/quickstart` is noise from
whoever happened to file it from a dev server. In production the two are identical, because the
build fails when the variable is unset. Do not "fix" this into a `getSiteUrl()` call.

`app/(home)/page.tsx` builds its canonical the same way, absolutely from `getSiteUrl()`, so no
route in the app leans on `metadataBase` resolution for the one tag a wrong origin ruins.

## Partials

Reusable `_`-prefixed fragments live in `content/partials/` — **outside** the doc collection `dir`
entirely, so they can never be routed. No glob exclusion is needed. Two consumption paths, both
tracked by the tooling:

**`<include>` directive** (build-time splice). Doc→partial includes use the root-anchored
`<include cwd>content/partials/…</include>` form, so moving a page never breaks its includes.

**Partial→partial includes must be file-relative** (`<include>../x.mdx</include>`). A partial may
be compiled outside the docs pipeline when ESM-imported, and there `fumadocs-mdx`'s `cwd` context
is undefined and crashes the build. `partials:check` enforces the distinction.

**Neither scanner sees code.** `parseIncludes` and `parsePartialImports` strip fenced blocks and
inline code spans before they match, so a directive quoted as an example is not validated as a real
include and is not counted in the catalog's "used in" totals. They strip it with
`scripts/lib/strip-code.ts`, which since FS-2729 is the single scanner behind every content gate.
`content:lint` asks it three different things: masking for A1 to A5 and A7 to A11, the code regions
themselves for A6, and where each fence closes for A12 and A13. `check-links` and `move-doc` mask
with it (frontmatter and HTML comments included), and `images:check` masks with it too. It is one
line-based, block-then-inline scan with one contract
(same length, same offsets, same line count in and out) and a per-consumer choice of which region
kinds to blank. Four separate implementations of "ignore code" used to exist, each with its own edge
cases, and a one-line change to one of them silently hid 6,914 characters of prose from a blocking
gate. `fumadocs-mdx` agrees at the other end:
`remarkInclude` visits JSX and directive nodes only, so a fenced `<include>` is a `code` node it
never expands. That is what lets the contribute guide print the syntax it teaches (FS-2723).

**ESM import** as an MDX component module — `import X from '@/content/partials/…/_x.mdx'` — is
supported by the tooling (`scripts/lib/partials.ts` scans the importer roots) but **currently used
by no component.** The last consumer, `FloatingHoverModal`, was deleted as dead code.

Partials carry no frontmatter; `<include>` strips it, and the lint flags vestigial frontmatter.

**Two partials are generated, not written.** `content/partials/precompile-tables/*.mdx` comes from
`pnpm precompiles:generate`, and `content/partials/_reference-arbitrum-contract-addresses-partial.mdx`
from `pnpm contracts:generate` (the `@arbitrum/sdk` network registry plus
`scripts/data/contract-addresses.data.ts`, every address normalised to its EIP-55 checksum because
`<AddressExplorerLink>` throws on a bad one). Each carries a do-not-edit marker at the top. Edit the
generator or its data file, never the `.mdx`. These two are also the only partials Prettier touches,
via the generators themselves; `.prettierignore` excludes `**/*.mdx` from `pnpm format`.

The contract-addresses partial is the one that still carries frontmatter, so `partials:check` warns
R3 on it. The generator reproduces it rather than dropping it: the title and summary in `CATALOG.md`
are read from those keys, so removing them is a catalog change, not a formatting one, and belongs in
its own commit.

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

Values started as a copy of the Docusaurus site's `src/resources/globalVars.js`. That site is
archived, so `content/vars.json` is now the only copy and there is nothing left to keep it in sync
with.

**`<Var>` does not render inside code.** MDX does not evaluate components inside a fenced code
block or an inline code span, so a `<Var name="…" />` placed there ships as the literal tag text.
Neither `vars:check` nor `types:check` sees this, since both only prove the variable exists, not
where it's used. `content-lint` rule A6 catches it. Fix a finding by removing the code span if the
value was never code to begin with, which is the common case; a `docker run` command a reader copies
genuinely needs the value spelled out, so hardcode it there and put the live `<Var>` in the prose
next to it.

The hardcoded copies are kept in step by `pnpm nitro:check-release`, which rewrites the **outgoing**
`latestNitroNodeImage` value when it bumps the variable, but only in a file that opts in by carrying
the marker `{/* sync-with-var: latestNitroNodeImage */}`. Two weaker rules were tried and rejected:

- Flagging every `offchainlabs/nitro-node:` literal that is not the current value. `content/` holds
  47 older tags pinned deliberately in historical examples, so the rule would open with 47 findings,
  none of them defects, in a check that blocks every PR.
- Rewriting every occurrence of the outgoing value with no marker. That looks safe, since the
  outgoing value can only ever be a copy of what was current, and it is not:
  `content/docs/run-a-node/arbos-releases/*.mdx` pin the minimum Nitro version for each ArbOS
  release, and `arbos61.mdx` pins `v3.11.3-beb2108`, which _is_ the current image right up until the
  next release ships. An unattended rewrite would make that page claim ArbOS 61 requires a build
  published after it. A version stated as a fact about the past and a version stated as "the latest"
  are the same string, and nothing but an explicit marker tells them apart.

So do not put the marker on a page that states a Nitro version historically.

The root `dependencies.json` is **not** part of that machinery. It is a verbatim snapshot of
upstream `arbitrum-docs`' release ledger for five projects (`nitro`, `stylus-sdk`, `orbit-sdk`,
`nitro-contracts`, `token-bridge-contracts`), salvaged under FS-2702 so the per-project detail
survives that repo's archival. Nothing here reads it, its version numbers are frozen as of the
copy, and `content/vars.json`'s `nitroVersionTag` is the live Nitro pin wherever the two
disagree. Its own `_note` key says so in the file. What extending `check-nitro-release.ts` to
the other four projects would take is written up in that file's commit message; the short
version is that the Docker-Hub tag resolution at the heart of the script is Nitro-specific and
does not generalize.

### A variable in a link destination is a placeholder, not a component

`<Var>` cannot be used in a link destination, and nothing about the failure is loud:

```mdx
[Interface](https://github.com/OffchainLabs/<Var name="nitroRepositorySlug" />/blob/x.sol)
```

CommonMark reads an unbracketed link destination as one raw token that may not contain a space, and
the tag holds two. The resource never parses, so the whole construct falls back to literal text: the
reader sees the `[Interface](…)` brackets, with only the bare URL prefix before the first `<Var>`
autolinked by GFM, and there is no working `<a>` for the intended target at all. Seventy-three links
across five pages shipped that way with every gate green (FS-2725), because `vars:check` only proves
the key exists, `check-links` skips an external destination, and rule A6 reads code fences and spans.

The destination takes a `{var:name}` placeholder instead. It holds no space, so the link parses
normally and the braces survive verbatim in the mdast `link` node's `url`:

```mdx
[Interface](https://github.com/OffchainLabs/{var:nitroRepositorySlug}/blob/{var:nitroVersionTag}/x.sol)
```

`remarkVarLinks` (`lib/var-links.ts`) expands it. What follows from where it is wired:

- It sits in `lib/mdx-options.ts`, the transform set the site and the fragment half of
  `check-links` share, so `scripts/lib/doc-anchors.ts` validates the `#anchor` of an expanded URL.
  The path half is a separate code path: `scripts/lib/doc-links.ts` reads destinations out of the
  raw MDX with regexes, because it also has to rewrite them in place for `pnpm move-doc`, so it
  expands a placeholder itself through `expandRefUrl`, which calls the plugin's own
  `expandVarPlaceholders`. Without that an internal destination written with a placeholder was
  reported broken even though the built page carried a working URL. One expansion function, two
  callers. A component that built the `href` itself would be invisible to both, which is the blind
  spot rule `A7` already exists for.
- `move-doc` resolves such a link but never rewrites it. `renderRef` writes a literal path, which
  would bake the variable's current value into the file, so a destination holding `{var:` is passed
  over the way a `cwd` include is.
- It runs after fumadocs-mdx splices `<include>`, so a placeholder inside a partial expands too.
  Verified by adding one to an included partial and reading the served HTML, not inferred from the
  plugin order.
- It rewrites the url and title of a `link`, `image` or `definition` node, and the `href`, `to` and
  `src` attributes of a JSX element. The `image` case only reaches a remote src: fumadocs runs its
  own remark-image first, so a local src is already an import of the written path by the time this
  plugin sees the tree, and a placeholder in one fails the build on a file that does not exist.
  Nothing silent survives either way, and `pnpm images:presence` blocks a markdown image with a
  remote src regardless.
- A placeholder is expanded nowhere else, and the two contexts a writer might reach for by mistake
  both fail loudly rather than shipping. In prose the MDX compiler reads `{…}` as an expression and
  throws `Could not parse expression with acorn`, so the page cannot build; use `<Var name="…" />`
  there, which is what it is for. In a fenced block or an inline code span it stays literal, which
  is correct, and matches what `<Var>` does in the same place.

The `var:` prefix is what lets the gate be strict. A bare `{name}` is indistinguishable from a URL
documenting a path template (`…/{chainId}/…`), so `vars:check` would have to choose between letting
a mistyped name ship and failing on a real template. With the prefix, `scripts/lib/vars-audit.ts`
counts a placeholder as a variable reference and an unknown name is unambiguously a mistake.

One thing does not follow the component: **a `vars.json` edit does not reach a placeholder until the
dev server restarts.** fumadocs-mdx caches one processor per collection, so `readVars()` runs once at
attach time, while `<Var>` reads the imported `content/vars.ts` on every render. Measured on `pnpm
dev`: with one page holding both forms, changing `nitroVersionTag` updated the prose immediately and
left the link on the old value until a restart. A production build reads the file once and is
unaffected.

An unknown name is left in place rather than thrown on, which matches what `<Var>` does with one:
the defect reaches the page and `vars:check` fails on it. Throwing inside a plugin that loads before
any page is rendered would take the whole site down for a single typo. `content:lint` rule `A11`
blocks the old syntax, and a placeholder whose name is not an identifier, so neither can come back.

### This repository's own URL has one owner

`content/vars.json` owns the docs repository's GitHub identity, as `docsRepositoryUrl` and
`docsRepositoryBranch`. Both sides read it from there: `gitConfig` in `lib/shared.ts` composes the
edit link on every docs page and the "Request an update" issue link, and the contribute guide writes
its own links as `{var:docsRepositoryUrl}/blob/{var:docsRepositoryBranch}/…` destinations. The
"know more tools?" partial also writes `{var:docsRepositoryUrl}/issues/new`, which offers a
reader the same issue tracker the "Request an update" button beside it opens. It named the other
repository until the round 1 review of FS-2733 found it.

Before FS-2733 the guide hardcoded six of those URLs beside a comment asking a human to retarget
them by hand, because `<Var>` does not work in a destination and FS-2725 declined to move them onto
a variable while `lib/shared.ts` held a second copy of the same string. `check-links` skips every
external destination, so a repository rename would have left six dead links on `/docs/contribute`
with no gate turning red. The two comments are gone; the mechanism replaces them.

The configured destination is `OffchainLabs/arbitrum-docs` on `master`. This change will only be
merged into that repository when the migration is ready. The fork link now uses
`{var:docsRepositoryUrl}` too, so every repository link in the contribute guide follows the same
owner and the old fork-step exception is retired.

Three details are load-bearing:

- `gitConfig` is `{ url, branch }`, not `{ user, repo, branch }`. Both call sites joined the first
  two immediately, so the split only offered a way for the halves to disagree.
- `lib/shared.ts` imports `content/vars.json` **with an explicit `with { type: 'json' }`
  attribute**. `scripts/lib/shared.test.ts`, `scripts/lib/contribute-repo-links.test.ts` and
  `scripts/static-docs-http.test.ts` all import that module as `.ts` under `node --test`, where
  Node 22 strips the types but still rejects a bare JSON import with `ERR_IMPORT_ATTRIBUTE_MISSING`.
  `content/vars.ts` keeps its plain import, because nothing runs that file under bare Node.
- It imports the JSON, never `content/vars.ts`, which would pull Zod into the module a client
  component (`components/sidebar-resource-links.tsx`) imports from. Measured either way: with the
  JSON import, `pnpm build` produced byte-identical client chunks (16,618,175 bytes over 379 files,
  the chunk carrying `SidebarResourceLinks` still 2,530 bytes), because the two keys are read in
  server components only and get inlined there. **State that measurement as key names**, plus
  `docsRepositoryUrl`'s value: no `vars.json` key name appears under `.next/static`, and neither
  does that URL. Do not state it as "no value appears", which does not reproduce. Nine of the
  thirty-six string values are short or generic enough to match unrelated code as substrings, among
  them `0.02`, `1.91`, `nitro`, and `docsRepositoryBranch`'s own value, `main`. A value grep
  therefore cannot tell a leak from a coincidence, and the key names can.

`proxy.ts` imports `lib/shared.ts` too, for `docsRoute`, `docsContentRoute` and `getSiteUrl`, so
that module's closure is the second consumer to weigh before importing anything heavier here.
Nothing arrived in it: the traced proxy closure is 98 files and 1,782,299 bytes
(`.next/server/middleware.js.nft.json`), it does not list `content/vars.json`, and no traced file
contains a `vars.json` key name or `docsRepositoryUrl`'s value, because `gitConfig` goes unused
there and is dropped. (`docsRepositoryBranch`'s value, `main`, does appear, in 16 of the 98 files,
as the ordinary word; the same coincidence rule as the client chunks applies.) Had it not been, the whole JSON is 2,653 bytes against that 1.78 MB, about 0.15 percent.
CLAUDE.md quotes that closure size as load-bearing, so weigh both consumers, not just the client
chunks, before importing anything heavier into `lib/shared.ts`.

Two tests hold the agreement. `scripts/lib/contribute-repo-links.test.ts` expands the partial's
destinations and asserts each one belongs to the repository `gitConfig` names, which also proves the
code value and the JSON value are the same string with no server running. Its third assertion is
repository-wide: no `.mdx` file anywhere under `content/` may write a docs-repository URL out in
full, including the fork step, with no exceptions. That rule is what a check pinned to the contribute guide
could not give, and it is what caught the reader-facing issue link in
`content/partials/_know-more-tools-box-partial.mdx`. The HTTP half in
`scripts/static-docs-http.test.ts` fetches `/docs/contribute` and applies the same rule to the
rendered hrefs, which is what proves the placeholders expanded rather than shipping as braces.

`docsRepositoryBranch` is `z.string().min(1)`. An empty branch renders `…/blob//CONTRIBUTE.md`,
which GitHub redirects to `…/tree/CONTRIBUTE.md` and answers 404, and no other gate sees it:
`vars:check` only proves the key exists and `check-links` skips every external destination. A
trailing slash on `docsRepositoryUrl` is deliberately not rejected, because the doubled slash it
produces is answered 200.

The two URLs in `.github/pull_request_template.md` remain literal because GitHub renders that
file. A fourth offline assertion checks that their repository and branch match `gitConfig`, so a
future identity change requires updating those links as well. The obsolete fork-step exception and
its comment have been removed from both the content and the tests.

### Announcement banner

`app/layout.tsx` renders Fumadocs' `Banner` above everything else in `RootProvider`, which puts it
above the navbar because every layout's header lives inside `{children}`. Its text, link, enabled
flag, and id all come from `vars.json`, so writers change the message without touching code. It
replaces the Docusaurus `announcementBar`.

Three things about it are not obvious:

- **The keys are not `<Var>` substitutions.** `pnpm vars:check` reports them as configured but
  unreferenced in MDX. That warning is expected for this block and is not a defect.
- **`announcementId` is the dismissal key, and dismissal is permanent.** Fumadocs writes
  `nd-banner-<base32(id)>` to the viewer's `localStorage` on close and injects a script that hides
  the banner before hydration. `localStorage` outlives the tab and the session, so a reader who
  closes the banner is done with that id on that browser for good. The ticket asked for "per
  session"; this is stronger, and it is what Fumadocs' component does. Reusing an id for a new
  message therefore hides it from everyone who dismissed the old one.
- **`announcementLinkHref` is gated.** `pnpm vars:check` requires an `https` URL or a root-absolute
  internal path that resolves to a page or a `public/` file, with the rule in
  `scripts/lib/announcement-link.ts` and its tests beside it. `check-links` walks MDX only and this
  value lives in JSON, so without that check the most visible link on the site is the one nothing
  validates. Relative hrefs are rejected rather than resolved: the banner renders on every route, so
  there is no page to resolve them against.
- **`height` has to be a real length.** The prop lands in an inline style and in
  `--fd-banner-height`, which the docs and notebook containers feed into `calc()` and a sticky
  `top`. `auto` breaks the grid. The message fits one line from 640px up and wraps to two below, so
  the layout passes a custom property that a media query switches between `3rem` and `4rem` rather
  than a constant.
- **The height and the text are coupled, and only the text is writer-facing.** The heights above
  were chosen for a message of the current length, and that message is a `vars.json` value a writer
  is meant to change without a code review. `3rem` holds two lines of `text-sm`, `4rem` holds three,
  and a long enough message overflows. No gate sees this, because the text lives in JSON and the
  height lives in TSX. The constraint is therefore stated in the [README](README.md#announcement-banner)
  next to the key, as a budget of roughly 140 characters for `announcementText` plus
  `announcementLinkText`. A character gate was considered and rejected: any threshold would be a
  guess at Aeonik's metrics, and a gate that fires on a message which actually renders fine is worse
  than the prose. Measuring the rendered bar and writing `--fd-banner-height` from a
  `ResizeObserver` would remove the coupling properly; it needs a client component and was out of
  scope here.
- **`announcementId` is constrained by a pattern in the schema.** Banner writes it into the
  element's `id` and into a generated `.<key> #<id> { display: none }` rule. The class half is
  `nd-banner-<base32(id)>` and is always a legal identifier; the `#<id>` half is the raw value. A
  space or a leading digit makes that selector match nothing, so closing the banner would look like
  it worked and the banner would return on the next page load, silently. `content/vars.ts` requires
  `^[A-Za-z][A-Za-z0-9_-]*$` so the failure happens at module load instead.

## Redirects

Every redirect lives in `redirects.config.ts`, consumed by `next.config.ts`'s `redirects()`.
Next compiles them into `.next/routes-manifest.json`, which Vercel reads directly — **there is no
`vercel.json` here, and adding one would be a second source of truth, not a mirror.** Vercel applies
`vercel.json` routes before framework routes, so it would silently shadow `redirects.config.ts`.

The Docusaurus site needed two copies (a client-redirects plugin for in-app navigation plus a synced
`vercel.json` for the edge). Next needs one.

`redirects()` runs **before** `proxy.ts`, so a redirected URL gets markdown negotiation on the
destination, not on the first hop.

The file has two blocks. Between the `AUTO-GENERATED` markers, one entry per moved page, written by
`pnpm move-doc`; never hand-edit between the markers. After them, the legacy `docs.arbitrum.io`
entries, hand-maintained. The two used to be separate files (`redirects.legacy.ts` held the
legacy block, and a further module under `scripts/lib/` held the hand-written maps the legacy
entries had been generated from); both were folded into this one file on 2026-09-24 so that a
redirect has exactly one place to live and `move-doc` has exactly one file to keep correct.

**Moved pages.** `pnpm move-doc <from> <to>` writes the old→new URL between the `AUTO-GENERATED`
markers, and then, as its last step, **retargets every other entry in the file whose destination was
the old URL** (`retargetRedirects` in `scripts/lib/redirects-config.ts`). Readers would reach the
page either way, since Next serves one redirect per request and a chain still lands, but
`pnpm redirects:check` follows one hop only and would report every chained entry `DEAD`. The
rewrite matches `destination: '<old URL>'` with an optional `#anchor` carried across, in either
quote style; a `source` cannot match because the pattern starts with the `destination` key, and a
child page cannot match because the closing quote has to follow the URL immediately. **The same
step deletes any entry whose source is the new URL.** That is the out-and-back move: an earlier
move left `X -> Y` on file, the page comes back to `X`, and without the deletion the retarget
would turn that entry into `X -> X`, a loop that Next's `redirects()` serves before the route, so
the restored page is unreachable (the base had the same defect as a two-entry loop). The result is
run through Prettier before it is written, so a value that changed length cannot leave the file
failing `format:check`. The step runs after the new entry is appended only so the notes print in
the order the steps happened; the appended entry has the old URL as its source and the new one as
its destination, so neither rewrite can touch it in either order. A partial (no URL) and a move
that keeps its URL are no-ops. `scripts/move-doc.test.ts` runs the real CLI against a fixture
repo for the real run, the dry run, a move only some entries name, and the out-and-back move;
`scripts/lib/redirects-config.test.ts` unit-tests both rewrites, including the wrapped and
double-quoted shapes and the two no-ops.

**`VERSIONED` in `lib/versions-constants.ts` is still on the mover, but it is no longer silent.**
That registry keys the partial versioning registry by canonical slug (`'run-a-node/start-here'`) and
`move-doc` does not touch it, so moving a versioned page still leaves a dead key. What changed is
the consequence: FS-2698 added `scripts/versions-routing.test.ts`, which asserts that every key
names a live page, so a dead key now fails `pnpm test`, a blocking gate. It used to pass 346/346
with `lib/versions.ts` untouched, and the page silently lost its version dropdown while its
archives became unreachable. `scripts/versioned-docs-check.ts` is still only an advisory (see
"Archived page registry drift" below for what it now compares, and where) and still always exits 0;
it is not what catches this. Retargeting the key is a
judgement call (`archivePath` mirrors the old slug on every current entry but is not required to),
so after moving a versioned page, retarget its `VERSIONED` key by hand.

**Legacy `docs.arbitrum.io` URLs.** The legacy block holds 853 of them. Legacy URLs were served at
the site root (`/stylus/using-cli`) and this site serves docs under `/docs`, so sources stay
root-level (that is what real inbound links look like) and destinations point at `/docs/…`. The
block is **hand-maintained**: add an entry by writing it, in source order, and prove the destination
with `pnpm redirects:check`.

It was originally generated, from two inputs that no longer exist: the Docusaurus repo's own
`vercel.json` redirect sources, and every canonical page URL derived from its `docs/` tree by
reimplementing Docusaurus routing. That generator was deleted in FS-2706 along with the rest of the
upstream coupling, and the hand-written maps it read (`MANUAL_DESTINATIONS`, `SECTION_LANDINGS`,
`SECTION_RENAMES`, `UPSTREAM_TITLES`) were deleted on 2026-09-24, since nothing served from them.
What survives is the record of the resolution order below, which is how every committed entry was
decided and how a new one should be. Each legacy URL took the first rule that matched, and a rule
that could not decide declined rather than guessing.

1. **A hand-verified destination**, confirmed by comparing the upstream page's frontmatter title
   against the local candidates. A value may carry an `#anchor`; the page part has to resolve.
2. **Self-URL**, where the legacy path still names a live page here under `/docs`. This resolved most of
   the canonical URLs, which had only ever needed the `/docs` prefix.
3. **Section renames**, whole sections that moved wholesale (`/run-arbitrum-node` →
   `/run-a-node`). Deep restructures are deliberately absent: their pages moved individually, so a
   prefix rule would produce confidently-wrong destinations.
4. **Exact title**, when exactly one local page carried the upstream page's frontmatter title
   verbatim. Ahead of the basename, because a title identifies a page where a basename only suggests
   one. This site pairs a `features/…/choose-X` page answering "why would I want X" with a
   `configuration/…/X` how-to, and the two often share a basename or differ only by a `config-`
   prefix; the basename alone kept picking the "why" half, so a reader after a procedure landed on a
   page that has none. It declined when two local pages shared the title, _and_ when two upstream
   pages shared it, for the same reason rule 5 does: there the legacy path was doing the
   disambiguating and the title cannot.
5. **Basename fallback**, accepted only when exactly one local page carried that slug _and_ the
   basename was unique upstream too.
6. **The nearest live section landing**, for a page upstream had and this site never ported. Not an
   equivalence, and last on purpose, so it never masks a page that does exist.

**Rule 6 entries do not correct themselves when the page is ported.** Nine of them were already
wrong in the commit that introduced them (FS-2748): the pages had been ported four days before the
redirects were seeded from a stale computation, so a reader asking for "Common error messages" was
sent to a section landing from day one. One rule 6 entry remains and carries a comment in the file:
`/node-running/sequencer-content-map`. **Porting that page means retargeting its entry**, and
nothing automated will remind you; `redirects:check` asks only whether a destination exists, and a
section landing exists. The Batch Poster entry now points to the consolidated batch posting and
assertion control guide.

**The guiding rule: a redirect to a plausible-but-wrong page is worse than a 404.** It silently
sends readers somewhere wrong, and `redirects:check` cannot catch it, because the destination
exists. Anything no rule resolved was left unmapped rather than pointed at a plausible page, and the
same judgement applies to a hand-added entry. A title match is evidence, not proof: a page that
takes a short generic title such as "Sequencer" for reasons of its own is not thereby the port of
the upstream page of that name.

**A source that names a live route here must never be added.** Next runs `redirects()` before
anything renders, so such a redirect wins over the route and makes it unreachable. The site root,
`/llms*`, `/og`, `/api`, `/img`, the `public/` asset directories and the icon and PDF files are all
in that category; `redirects:check` reports one as `SHADOWED`.

**Three offline tests pin the file** (`scripts/lib/redirects-config.test.ts`, run by `pnpm test`):
every internal destination names a page under `content/docs`, case-sensitively; no source is a
live page or redirects to itself; and no source is listed twice. They guard against a hand edit and against a page leaving the tree some other way;
`move-doc` guards against the move.

`pnpm redirects:check` validates every destination against `/llms.txt` — the router's own page
list — and fails on a dead destination or a source that shadows a live page. It needs the site
running, so run it with `pnpm dev` up, or point it at any other origin with `--base-url`.

**CI runs it in the `Build` job**, as a step after `pnpm build`: it starts `next start`, polls
`/llms.txt` until the server answers, runs the check, and kills the server on the way out. The
build is already happening in that job, so the whole step costs about three seconds. It blocks,
because that job does: FS-2746 dropped `continue-on-error` from `Build` and this check was
promoted with it.

`next start` directly, not `pnpm start`: backgrounding the pnpm script makes `$!` the wrapper's
PID, so the cleanup trap kills the wrapper and leaves the Next server orphaned on port 3000.

**It deliberately does not check a Vercel preview, and should not be changed back.** The obvious
design, a `deployment_status` workflow pointed at the PR's preview URL, was built on `fs-2675` and
abandoned once this repository went public. `deployment_status` runs from the default branch with
full secrets access, so checking out the PR's commit and running its copy of `redirects-check.ts`
executes contributor code beside whatever secret the step holds. The secret is the worse half:
`VERCEL_AUTOMATION_BYPASS_SECRET` bypasses Deployment Protection on **every** deployment in the
project, production included, and Vercel injects it into every build, so creating it at all hands it
to any fork preview a maintainer authorizes. A localhost server needs no credential, so a fork PR is
checked exactly like a branch PR.

The site does not have to be a _deployed_ site for the router to be the authority on what is
routable. That is the whole trick.

## Routing and `proxy.ts`

Single locale, no i18n. Pages live directly under `content/docs/…` and serve at `/docs/…`. There is
no `[lang]` route segment and no locale middleware; `lib/i18n.ts` was deleted on 2026-08-18 along
with the `ja` and `zh-CN` trees.

`proxy.ts` does exactly four things, in this order:

1. A 308 for the **legacy `?v=<id>`** archive selector, onto the path form FS-2698 introduced
   (`/docs/<slug>/<id>`, and `/docs/<slug>/<id>.md` when the request carried the markdown suffix).
   An id naming no registered archive has the param dropped and nothing else, because the contract
   has always been that an unknown version falls back to Latest, and `dynamicParams = false` would
   now 404 it. This runs **before** tracking, deliberately: a 308 delivers no markdown, the
   reader's follow-up request is counted on its own, and counting the hop would file an archive
   read under the live page's path.
2. **Request tracking** for markdown and `llms*.txt` fetches, production only (below).
3. An explicit **bypass list** of routes served verbatim: `/_next/`, `/img/`, `/favicon.ico`,
   `/icon.png`, `/apple-icon.png`, `/nitro-whitepaper.pdf`, `/audit-reports/`, `/data/`,
   `/.well-known/`, `/sitemap.xml`, `/robots.txt`, `/llms*`, `/og/`, `/api/`.
4. `.md`-suffix rewrites plus `Accept: text/markdown` content negotiation to the markdown route.
   Both patterns are written over the whole path under `/docs`, which is why an archive needs no
   rewrite of its own (see [Partial versioning](#partial-versioning)).

**A new top-level route belongs in that bypass list**, or markdown negotiation will try to rewrite
it. `proxy.ts` exports no `config.matcher`, and Next's proxy reference is explicit that without one
the proxy runs on every request, `public/` assets included, so nothing else keeps a static file out
of the rewrite branches.

Re-adding localization means restoring `defineI18n`, the `i18n` argument to `loader()`, a `[lang]`
segment, and `createI18nMiddleware`.

### `/.well-known/` and the MCP discovery card

`public/.well-known/mcp/server-card.json` is the MCP server discovery card, ported verbatim from
upstream `static/.well-known/mcp/server-card.json` in OffchainLabs/arbitrum-docs (FS-2704). It is
the document a client finds when it has only the site origin and wants to know whether the docs
expose an MCP server: it names `https://mcp.inkeep.com/offchainlabs/mcp` as a `streamable-http`
endpoint, which is the same Inkeep service behind the site's search. Without it, a discovery fetch
of `/.well-known/mcp/server-card.json` against docs.arbitrum.io 404s after cutover while the search
it advertises works, which is an inconsistency rather than a decision.

The path is a well-known URI (RFC 8615), so it is fixed and cannot be moved. Two consequences:

- **It is on the bypass list**, not by the convention that covers `/sitemap.xml` and `/data/`, but
  because a discovery client sends whatever `Accept` header it likes and must still get the JSON on
  disk. The rewrite patterns are anchored at `/docs` today, so the bypass is defence in depth, and
  the assertion that it holds is in `scripts/static-docs-http.test.ts`, which requests the card
  under `Accept: text/markdown` as well as `application/json`.
- **The card is untracked.** `pathInfo()` in `lib/llms-tracking.ts` classifies it as `ignored`,
  which its tests pin: a discovery fetch is not a markdown read and must not join the
  `llms_file_fetched` series.

**Nothing regenerates or checks this file.** It is a hand-copied snapshot of somebody else's
document, so an upstream edit to the card goes unnoticed here. Its two facts that can rot are the
endpoint URL and the transport type; both were confirmed live when it landed, by sending an MCP
`initialize` to the endpoint. Upstream's `capabilities` block lists `tools` only, while the live
server also advertises `prompts` and `resources`; the copy stays byte-identical to upstream anyway,
because capabilities are negotiated at `initialize` and a divergent copy would be harder to re-sync
than it is worth.

### Request tracking

`proxy.ts` also records who fetches the markdown, continuing the `llms_file_fetched` PostHog event
upstream's `middleware.ts` produced. The point is to answer "which pages are AI assistants and
crawlers actually reading", which server logs alone do not.

**It runs before the bypass list**, because `/llms.txt`, `/llms-full.txt` and the `/llms.mdx/`
mirrors are all in that list and are exactly the fetches worth counting. It runs **after** the
legacy `?v=` redirect, for the opposite reason: that branch answers with a 308 and no body.

Four request shapes are tracked, and the classification lives in `lib/llms-tracking.ts`:

| Request                                     | Tracked as        | `file_type` |
| ------------------------------------------- | ----------------- | ----------- |
| `/llms.txt`, `/llms-full.txt`               | as-is             | `index`     |
| `/docs/<slug>.md`                           | as-is             | `page`      |
| `/llms.mdx/docs/<slug>/content.md`          | `/docs/<slug>.md` | `page`      |
| `/docs/<slug>` with `Accept: text/markdown` | `/docs/<slug>.md` | `page`      |

All three markdown shapes normalise to the one canonical `.md` path, so a page's fetches are one
number rather than three. **Each request is counted once:** a Next rewrite does not re-enter the
proxy, so `/docs/x.md` fires one event, not a second one for the mirror it rewrites to. Neither a
`.md` on a legacy URL nor a legacy `?v=` link is tracked, because both are answered with a redirect
and the destination request is tracked instead.

**Archives need no rule of their own.** An archived version is `/docs/<slug>/<id>`, so its three
markdown shapes are the rows above with the version id inside the slug, and they normalise through
the same code to `/docs/<slug>/<id>.md`. That is a different series from the live page's
`/docs/<slug>.md`, which is the point: "who is reading the ArbOS 20 archive" is a question worth
being able to answer. `scripts/lib/llms-tracking.test.ts` pins it, since nothing in
`lib/llms-tracking.ts` mentions versions and the behaviour is therefore easy to lose.

Two upstream rules are dropped: the `/sdk/` exclusion (there is no `/sdk` route here) and tracking
of `.md` outside the docs tree.

**Production only.** Nothing is sent unless `VERCEL_ENV === 'production'`, so local development and
preview deployments stay out of the numbers and need no key. The key is `NEXT_PUBLIC_POSTHOG_KEY`,
the same publishable `phc_` token `lib/posthog.ts` uses, posted to the same `us.i.posthog.com` host.

**Tracking can never break a response.** The capture is handed to `event.waitUntil()` so the
response is not held for it, and every failure path is caught and logged. A missing key logs once
per request and drops the event. A **rejected** event is logged too, which needs its own line of
code: `fetch` rejects only on a network failure, so a 401 from a revoked project token resolves
normally, and without a `response.ok` check it would read exactly like no traffic at all.

**Schedule it with the `NextFetchEvent` Next passes as the proxy's second argument, never with
`waitUntil` from `@vercel/functions`.** That helper resolves the request context through
`globalThis[Symbol.for('@vercel/request-context')]`; when the symbol is absent its `getContext()`
returns `{}`, the call becomes `undefined?.(promise)`, and the promise is dropped with no error, no
log and no type error. **Next 16 does not install that symbol** (it installs
`@next/request-context`), so the capture would be at the mercy of whether the invocation happened to
outlive the response. Upstream's middleware used the framework's event for the same reason.

Nothing catches that locally, which is what makes it worth a paragraph: the promise chain starts
executing the moment it is constructed, so in `next dev` the fetch completes either way and an
end-to-end check passes while production loses events. `waitUntil` only extends the runtime's
lifetime past the response. Two tests in `scripts/lib/llms-tracking.test.ts` assert the wiring
directly, because no runtime check can.

**The `distinct_id` is pseudonymous, not anonymous.** `buildTrackingPayload` hashes the client IP
with a UTC daily salt and sends only the hash; the raw address is never in the payload. Rotating the
salt daily prevents linking a reader across days, while one client's requests within a day still
collapse into a single PostHog person rather than one per hit. **It does not prevent re-identification:**
the salt is a public date string, so the whole IPv4 space can be hashed against it in seconds and a
stored id matched back to an address. Treat the id as personal data. Making it genuinely one-way
needs a secret salt and a decision about the unset case, which is deliberately left as follow-up
rather than half-built here.

A request with no `x-forwarded-for` gets a random id instead of the hash of the empty string, which
is a constant and would pile every such request onto one shared person that reads as a single
extraordinarily busy client. **That branch, and only that branch, also sets
`$process_person_profile: false`,** because a unique id per request would otherwise mint a person
profile per request and none of them could ever be related to anything. On the hashed path the
profile is the point: it is what makes "how many distinct crawlers fetched this page today"
answerable, at the cost of one profile per client per day, and it is upstream's behaviour.

**Tracking applies exactly the condition the negotiation rewrite applies, and no more.** That
rewrite is `/docs{/*path}`, which matches dotted slugs, so requiring a dot-free path in
`lib/llms-tracking.ts` made a slug like `/docs/v1.2/guide` serve markdown and record nothing. The
proxy cannot check that a page exists, since it cannot import `lib/source`, so this can track a
request that 404s, exactly as the `.md` branch already does for `/docs/nope.md`. That is the right
way round: an overcount shows up in PostHog as a `file` value nobody recognises, an undercount
shows up as silence.

**The `$current_url` origin comes from `getSiteUrl()`,** not from `request.nextUrl.origin`. A
production deployment answers on its `*.vercel.app` alias as well as on the custom domain, so the
request origin would record two `$current_url` values for one page and split the series. It also
keeps the site-URL rule in the one module that owns it (see [Page metadata](#page-metadata)).

`lib/llms-tracking.ts` is **deliberately import-free**, including of `lib/shared.ts`, so that
`scripts/lib/llms-tracking.test.ts` can import it directly under `node --test` using Node 22's
native type stripping. That is what lets `pnpm test` exercise the exact module `proxy.ts` runs
instead of a copy that would drift from it. The price is two local copies of the route constants;
`proxy.ts` pins them with two `satisfies` statements, so moving `docsRoute` or `docsContentRoute`
without mirroring it fails `types:check`.

### `/sitemap.xml` and `/robots.txt`

Both are Next **metadata routes** (`app/sitemap.ts`, `app/robots.ts`), file conventions rather than
route handlers, so there is no `route.ts` and no hand-written XML. Neither sets `revalidate`: a
metadata route with no request-time input is already cached at build time by default.

**Both read the deployed origin through `getSiteUrl()`** (see [Page metadata](#page-metadata)),
the same helper behind `metadataBase` in `app/layout.tsx` and the docs page canonical, so the four
can never disagree. `NEXT_PUBLIC_SITE_URL` is inlined at build time, so an unset value would
otherwise ship a production sitemap and robots.txt pointing at localhost with nothing failing
loudly; the helper throws on that condition instead. Outside production it falls back to
`http://localhost:3000`, so a local build stays self-consistent rather than broken.

**The sitemap derives every entry from `source.getPages()`**, the same choke point every other
content consumer reads. Adding a page to `content/docs/` puts it in the sitemap with no further
change. The home page at `/` is not in the doc collection and is prepended by hand.

Upstream's Docusaurus sitemap needed a `nonCanonicalRoutePatterns` ignore list because Docusaurus
routed partials, `_`-prefixed files, and auto-generated `/category/` index pages. **Here there is
nothing to exclude:** partials live in `content/partials/`, archived versions in
`content/_versions/`, and the glossary in `content/glossary/`, all outside the doc collection `dir`,
so `source.getPages()` cannot return them. Verified 2026-09-11: the sitemap's URL set is exactly the
339 unique doc URLs in `/llms.txt`, plus `/`.

`lastModified` is emitted per page only when `page.data.lastModified` exists. It comes from the
`lastModified` option on the docs collection, which is itself gated behind a full-git-history probe
(see [Last modified dates](#last-modified-dates)). In a shallow checkout every page resolves to
`undefined` and `<lastmod>` is simply absent, which is valid.

`app/robots.ts` ports upstream `static/robots.txt` and differs from it in two deliberate ways:

- **No `Disallow` lines.** Upstream disallowed `/category/` and `/hosted-pdfs/`; neither route
  exists here, and disallowing paths that 404 is noise.
- **`Content-Signal: search=yes, ai-input=yes, ai-train=no` is emitted through the rule's `other`
  field.** The directive is not RFC 9309; it is draft-romm-aipref-contentsignals
  ([contentsignals.org](https://contentsignals.org/)). Next models only the standard directives and
  documents `other` as the pass-through for exactly this, available since Next 16.3.0, so no
  separate `app/robots.txt/route.ts` handler is needed. Next emits `Allow` before `other`, which
  reorders the lines relative to upstream's file; robots.txt directives are order-independent
  within a group, so the meaning is unchanged.

Neither route is reachable by the rewrite patterns today (both are anchored at `/docs`). They are
in the bypass list by convention, because that list is where a route that must be served verbatim
is cheap to state and hard to break from a distance.

## Partial versioning

Archived pages live in `content/_versions/<id>/…` — a separate, non-routed collection, outside
`content/docs` for the same reason partials are. `lib/versions.ts` indexes them by path. Only
hand-registered pages are versioned, in the `VERSIONED` registry in `lib/versions-constants.ts`.

An archive is served at `/docs/<slug>/<id>` (FS-2698 moved it off `?v=<id>`, which made every docs
page dynamic). `lib/source.ts` `resolveDocsPath()` reads that path, **page first**: `/docs/a/b` is
only reinterpreted as archive `b` of page `a` when no page exists at `a/b`, so an archive id can
never shadow a child page. `scripts/versions-routing.test.ts` separately asserts that no such
collision exists, so creating one is a reviewed act.

### The archive's markdown mirror

An archive answers the same three markdown shapes a live page does (FS-2711):

| Request                                          | Serves                            |
| ------------------------------------------------ | --------------------------------- |
| `/llms.mdx/docs/<slug>/<id>/content.md`          | the archive's processed markdown  |
| `/docs/<slug>/<id>.md`                           | the same, via the suffix rewrite  |
| `/docs/<slug>/<id>` with `Accept: text/markdown` | the same, via content negotiation |

**None of that is a new URL family.** Both rewrites in `proxy.ts` are written over the whole path
under `/docs`, so they already mapped an archive path onto `/llms.mdx/docs/<slug>/<id>/content.md`;
what was missing was a route handler that resolved it, which is why the three shapes 404ed rather
than serving the wrong version. The handler now shares `resolveDocsPath()` with the docs page, so
the two cannot disagree about what a path means, and its `generateStaticParams` prerenders the
three archive mirrors alongside the live ones (1060 prerendered routes, up from 1057).

One shape changed as a side effect. The handler now carries `dynamicParams = false`, so a markdown
request for a slug outside the generated set (`/docs/nope.md`, `/llms.mdx/docs/nope/content.md`, or
`Accept: text/markdown` on `/docs/nope`) is answered the way `/docs/nope` is: the 82 KB HTML
`app/not-found.tsx` body with status 404 and `no-store`, where the base sent an empty body with
`s-maxage=31536000`. A markdown client gets HTML on a miss and misses are no longer edge-cacheable;
no consumer here ever requests a miss, so it is recorded rather than worked around.

Three things this must keep getting right:

- **`postprocess.includeProcessedMarkdown` is per collection.** The `docsVersions` collection sets
  it separately from `docs`; without it `getText('processed')` rejects and the archive mirrors fail
  at request time, a long way from `source.config.ts`. What the mirror _contains_ is not per
  collection, because the MDX comment stripping rides in `lib/mdx-options.ts` rather than here (see
  [`source` is a choke point](#source-is-a-choke-point)), so an archive is covered by the same
  plugin a live page is.
- **An archive is `noindex` with a canonical to the live page.** The HTML carries both tags. A
  markdown body can carry neither, so the mirror sends `X-Robots-Tag: noindex, follow` instead.
  Live markdown sends no such header.
- **Archives stay out of discovery.** `llms.txt`, `llms-full.txt`, the sitemap and `og/` all derive
  from `source.getPages()`, which never sees the `docsVersions` collection, so this holds by
  construction rather than by exclusion. `scripts/static-docs-http.test.ts` asserts it against the
  built site anyway, because "by construction" is exactly the kind of claim that quietly stops
  being true.

The page's own copy and view-as-markdown controls point at whichever version is on screen. Serving
Latest's text under an archive URL is the specific mistake this closes: `/docs/<slug>.md?v=v1` did
it silently before FS-2698, and answering 404 afterwards was a deliberate stopgap rather than an
end state.

**An archive is a path, not a query parameter.** FS-2698 moved the selector from
`/docs/<slug>?v=<id>` to `/docs/<slug>/<id>`, which is what lets the docs route prerender at all
(see [static routing](#static-routing-under-docs)). `proxy.ts` 308-redirects the legacy `?v=` form,
a registered id to the path and anything else to the bare path, which renders Latest exactly as an
unknown `?v=` always did. A real page always wins: `/docs/a/b` is only read as archive `b` of page
`a` when no page exists at `a/b`.

The registry itself lives in `lib/versions-constants.ts`, which imports nothing, because `proxy.ts`
needs `isArchiveId` and cannot afford `collections/server`. `lib/versions.ts` keeps the lookups
that need the compiled archive bodies. `scripts/lib/versions-registry.ts` text-parses the registry
rather than importing it, because no plain-node script can import `lib/source` — neither the
`collections/*` alias nor TypeScript resolves. `redirects-check.ts` hits the same wall, which is
why it reads `/llms.txt` off a running site instead. Two scripts read that parse:
`scripts/versioned-docs-check.ts` (the advisory) and `scripts/versions-routing.test.ts` (the
invariants that fail).

## Glossary and inline references

`content/glossary/*.mdx` is a reference collection with its own shape — `{ id, title, sortAs? }`,
**not** the page contract. It is surfaced by `<Reference>`, `<Term>`, and `<ReferenceList>` via the
registry in `lib/references.ts`.

**It is hand-maintained here.** Until FS-2706 a script resynced it from the Docusaurus repo's
glossary partials on demand; that repo is archived and the script is gone, so a new term is written
as a new `.mdx` file in this directory and nothing else has to happen. `pnpm references:check`
proves every `<Term id>` and `<Reference>` names a real entry, which is the only gate over this
collection.

New reference types add a collection plus one registry entry.

## Custom MDX components

`components/mdx.tsx` is the registry and the source of truth — read it rather than trusting a list
here. Implementations live in `components/mdx/`. Fumadocs' `Accordion`/`Accordions` and `Tab`/`Tabs`
are re-exported.

Some names are aliases of the same component: `AEL` → `AddressExplorerLink`, `ImageWithCaption` →
`ImageZoom`. Every Docusaurus widget the content uses is now ported, so there is no placeholder
component any more.

Adding a component here makes it available in all MDX with no import.

**Heavy widgets load lazily.** Every docs page imports `components/mdx.tsx`, so a static import
there puts the component's library in every page's client bundle. A widget with a large dependency
therefore sits behind a `'use client'` wrapper that `next/dynamic`s the implementation:
`components/mdx/VendingMachine/index.tsx` is the pattern. Server rendering stays on, so the markup
is still in the HTML and only the JavaScript is deferred.

**VendingMachine.** The quickstart's "free cupcakes" demo (`components/mdx/VendingMachine/`), ported
from the Docusaurus component of the same name. `type` is a closed union: `web2` keeps balances in
tab memory, while `web3-localhost` and `web3-arb-sepolia` talk to a `VendingMachine.sol` the reader
deploys themselves, through the injected EIP-1193 wallet using viem. Reads go through a public
client and writes through a wallet client, with no chain or contract address hardcoded. Anything
outside the union falls back to the web2 widget, because MDX call sites are not type-checked and a
misspelling must not put a reader on a web2 page in front of a wallet prompt. The ABI is transcribed
into `abi.ts` as a TypeScript `as const` (the compiled artifact's bytecode was never used) so viem
can infer argument and return types. With no wallet installed the widget renders a notice instead of
throwing.

**EdgeChallengeFlow.** The BoLD bisection replay (`components/mdx/EdgeChallengeFlow/`), ported from
the Docusaurus interactive diagram. d3 draws one tree per challenge level; the reader plays, steps,
or jumps to the end of a recorded Arbitrum Sepolia challenge. The 236 KB event log stays a static
asset at `public/data/edge-challenge-flow.json` and is fetched on mount, so it never enters a
JavaScript bundle; `/data/` is on `proxy.ts`'s bypass list, by the same convention as every other
top-level route and not because a rewrite currently reaches it. Its stylesheet
(`edge-challenge-flow.css`) reads `--color-fd-*` tokens for every surface and text colour, and
declares only the four status hues (active, bisected, has-rival, OSP confirmed) itself, once per
theme, so no colour is hardcoded in the d3 code. Panel labels are `h4`/`h5`: the widget sits inside
a page section, so its labels nest under that section's heading rather than competing with it in a
screen reader's heading list. Tree nodes are focusable, with Enter/Space to inspect and the arrow
keys to expand or collapse, and wheel zoom needs a modifier key so scrolling past the diagram does
not trap the page.

That snapshot has a generator: `pnpm edge-challenge:fetch`
(`scripts/fetch-edge-challenge-data.ts`). It reads every `EdgeAdded` / `EdgeBisected` /
`EdgeConfirmedByOneStepProof` log the BoLD `ChallengeManager` contract has emitted on Arbitrum
Sepolia, backfills the `EdgeAdded` event for any edge only ever referenced (never directly logged)
by a later event, resolves the staker address behind each `EdgeAdded` transaction, and overwrites
`public/data/edge-challenge-flow.json`. **Nothing runs it automatically** — not the build, not CI,
not `upstream-refresh.yml`. Run it by hand when the rendered flow looks out of date, review the
diff, and commit it deliberately. It has **no `--check` mode**, unlike `contracts:check` or
`cli:check`: those compare against a pinned, deterministic input, while this one's source is live
chain state, so a second run legitimately returns a superset of the first. There is no "stale" to
detect here, only "older", and a check that goes red the moment anyone opens a challenge on Sepolia
is not something to gate a build on. The script was ported from upstream `arbitrum-docs` under
FS-2702, before that repo is archived, because the decoding and backfill logic is not recoverable
from the committed JSON.

**FlowChart.** The Timeboost centralized auction diagram (`components/mdx/CentralizedAuction/`),
registered under the name the MDX already used. The artwork is a 2300-line inline SVG exported from
a design tool and keeps its own palette, because recolouring an illustration per theme is not the
same as theming a UI. On top of it sit five numbered markers; three of them open a step dialog, as
upstream had it, built on the same Radix dialog as `PdfModal` with the code sample highlighted by
Fumadocs' `DynamicCodeBlock`. The upstream `@react-spring/web` animations (a pulsing ring, a hover
grow, a dialog fade) are CSS here, so the dependency was not carried over, and all three respect
`prefers-reduced-motion`.

**Image zoom.** `<ImageZoom>` resolves to the wrapper in `components/mdx/ImageZoom/`: plain `<img>`
child, supports `caption`, needs no dimensions, no Next image optimization. To use Fumadocs' native
component instead — for `_next/image` optimization — import it per file, which shadows the wrapper
for that file. The native component then requires `width`/`height` or the build fails; add
`style={{ width: '100%', height: 'auto' }}` for responsiveness and drop `caption`.

## Remote images are never fetched at build

`source.config.ts` sets `remarkImageOptions: { external: false }`. Nothing in the build requests a
third-party image.

**Why.** Fumadocs' `remark-image` probes each image for its intrinsic size so it can emit
`width`/`height`. For an `https://` src that probe is an HTTP request made while MDX compiles, and
its `onError` default is `error`. One third-party URL that started answering 403 therefore threw
during compilation and took down **every** docs page, not only the page holding the image:
`/docs/get-started` served a 500 with `[Remark Image] Failed obtain image size for
https://imgur.com/0q5bHZK.png`. That is the failure FS-2681 removed.

**What this means per syntax.** The two ways to put an image on a page are no longer equivalent, and
the difference is the thing to remember:

| Syntax                          | Component                                    | Remote src after this change |
| ------------------------------- | -------------------------------------------- | ---------------------------- |
| `![alt](https://…)`             | `next/image`, via `defaultMdxComponents.img` | **The page 500s.**           |
| `<ImageZoom src="https://…" />` | `components/mdx/ImageZoom`, a plain `<img>`  | Renders.                     |
| `![alt](/img/…)`                | `next/image`, measured from disk             | Renders, optimized.          |

Markdown is the broken one because `next/image` requires dimensions it can no longer obtain.
Measured on a scratch page, not inferred: a reachable remote src in markdown syntax returns HTTP 500
with `Image with src "…" is missing required "width" property`, while the same URL through
`<ImageZoom>` returns 200 and emits `<img src="https://…">`. A remote markdown image would fail for
a second reason as well if it got past the first, since `next.config.ts` declares no
`images.remotePatterns`.

**So:** commit images under `public/` and reference them as `/img/…`. That is the only form that is
both reliable and optimized. Where a third party's own CDN copy has to be used, `<ImageZoom>` is the
supported way, as `content/docs/third-party-docs/Particle/particle.mdx` does.

**Why `external: false` and not `onError: 'ignore'`.** Both stop the compile from throwing.
`external: false` also stops the compile from touching the network for images at all, which keeps
it deterministic and is what let the `Build` job become blocking in FS-2746. `onError: 'ignore'`
would keep a network
round trip per remote image for a `width` that markdown cannot use anyway. Local images are still
measured from disk, and `onError` stays at its default `error`, so a missing or corrupt file under
`public/` still fails the build rather than shipping a broken page.

**Finding them.** One script, two modes:

- `pnpm images:presence` is offline and **blocking in CI**. It fails when a markdown image with a
  remote src appears anywhere in content, which is exactly the case that 500s.
- `pnpm images:check` requests every remote image, markdown or JSX, and prints the ones that no
  longer answer. Report only, exits 0 unless `--strict`, and deliberately not in CI: a third party's
  outage is not a reason to fail somebody else's pull request.

## Page weight and what loads late

Lighthouse scored the three sampled pages 81, 84 and 80 against a bar of 90 (plan M-50), and the
cost was payload rather than execution: main-thread work and script bootup both scored 1 while
Largest Contentful Paint sat at 3.9 to 4.4 seconds. FS-2715 worked through that. What follows is
what moved and why, because every one of these is the kind of change someone undoes by accident.

**Measure it the same way or the numbers mean nothing.** Lighthouse 13.4.1, mobile form factor,
simulated throttling, against `next start` on localhost:

```bash
CHROME_PATH="<Chrome for Testing>" npx lighthouse@13.4.1 <origin>/<path> \
  --output=json --output-path=<file>.json \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu" \
  --only-categories=performance,accessibility,best-practices,seo
```

Take the median of at least three runs, and interleave the pages rather than running one page three
times: a loaded machine moves a single score by ten points, and a run of three that all land in the
same busy window looks like a regression. **A local server is a floor, not the number.** There is no
CDN in front of it, so every request pays a full round trip under simulated throttling, which is why
a 1.3 KB stylesheet can be charged 300 ms here and almost nothing in production.

**Three runs is not enough on `cli-flags-reference`, and the reason is in the change itself.** The
baseline is tight: across three independent sessions its scores span 74 to 81 with a median of 76.
This branch is bimodal on that page, roughly 77 to 78 in the slow state and 82 to 86 in the fast one
(one run reached 92), so a median jumps between modes from session to session (82, 81.5 and 78 in
the three sessions) and no single "+N" is honest. Quote the two modes: the win is **+2 to +10**
depending on the run. The spread is in simulated First Contentful Paint, which
the score tracks one for one on this page, because the Largest Contentful Paint element is text
painted at first paint. In one session the baseline's FCP sat at 1.66 to 1.68 s on all five runs
while ours landed at 1.97 s on four and 1.67 s on the fifth, and that fifth run is the one that
scored 92. The cause is the font change below: this page is dense with inline code, so it genuinely
needs Aeonik Fono, which is no longer preloaded and therefore starts at 127 to 146 ms discovered by
CSS instead of 62 ms discovered by a preload link. Whether Lighthouse's simulator charges that later
start to FCP varies run to run. **It is not the Inkeep chunk**, which was the first guess: that chunk
downloads at `Low` priority starting 251 to 337 ms on _both_ builds, while observed LCP equals
observed FCP at 119 to 185 ms on both, so it is outside the paint window either way. Take nine runs
on this page, not three, and do not read a single preview run on it as evidence of anything.

**The Inkeep chat widget is loaded on idle, after `load`.** `@inkeep/cxkit-react` is by a wide margin
the heaviest thing this site ships: its built chunk is 1.19 MB on disk (the package directory itself
is only 200 KB, so measure the chunk, not `node_modules`), about 321 KiB transferred, of which Lighthouse
measured 190 KiB as unused on a page where nobody has asked a question. It used to be requested
during hydration on every page, putting a third of a megabyte in direct contention with LCP for a
floating button that is worth nothing until it is clicked. `components/inkeep/inkeep-chat-button.tsx`
now waits for the `load` event and then a `requestIdleCallback` before rendering it. **Both halves
matter**: gating on idle alone was not enough, because hydration finishes early and the main thread
goes quiet while images and fonts are still in flight, so the callback fired around 300 ms, back
inside the window it was meant to avoid. This is not the search path. Cmd-K search goes through
`components/inkeep/inkeep-search.tsx`, whose own dynamic import fires when Fumadocs opens the dialog
and is untouched.

**Only the two upright body faces are preloaded.** The root layout declared five `next/font`
families and every one of them preloaded on every route, which is 230 KiB of high-priority requests
racing the LCP element. Three are now `preload: false`: Aeonik Fono (inline code), JetBrains Mono
(fenced blocks) and FK Screamer (the home hero heading, and nothing at all on the other 349 pages).
The 349 pages that never use them stop paying entirely. **A page that does use one pays a little
more, so this is a trade and not a free win.** On `cli-flags-reference`, which is dense with inline
code, Aeonik Fono is now discovered by the CSS rather than by a preload link, so it starts at 127 to
146 ms instead of 62 ms, at `VeryHigh` rather than `High`. Simulated FCP on that page moved from
1.66 to 1.68 s on the baseline to about 1.97 s on four of five runs here. LCP still improves by
roughly a second, so the page is a clear net win, but "no slower" would be wrong.

**Every face this repo declares is self-hosted, and the build makes no font request** (FS-2750).
JetBrains Mono was the last one loaded through `next/font/google`, which fetched its CSS from
`fonts.googleapis.com` and six `woff2` slices from `fonts.gstatic.com` on every `next build`, then
self-hosted them into `.next/static/media`. The declaration is now `next/font/local` over
`public/fonts/jetbrains-mono-latin.woff2`, beside the four Aeonik faces and FK Screamer. **The
committed file is the one Google served, not a rebuild of it**: a `curl` of
`https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbV2o-flEEny0FZhsfKu5WU4xD7OwGtT0rU.woff2` and the
file the previous build wrote into `.next/static/media` share sha256
`1e06740a02a443fb7f3eeda8fcaa685a0f6c620e3f01e6666e847295469ce3ad`, and the built asset keeps its
content hash (`…3t6q91iet4nsy.woff2`), so no reader's download moved by a byte. The licence is SIL
Open Font License 1.1, committed beside it as `public/fonts/jetbrains-mono-OFL.txt`. **Replacing
that file means copying its range too**: the `unicode-range` in `app/layout.tsx` was transcribed by
hand from the CSS Google served on the day, and nothing ties the two together, so a swapped slice
with a stale range fails at neither build nor request time, only in rendering.

**"Every face this repo declares" is the exact scope, because a reader's browser still fetches one
from Google.** `@inkeep/cxkit-primitives` hardcodes
`https://fonts.googleapis.com/css2?family=Inter:…` in its theme provider, so the chat chunk
requests it at runtime on every docs page. It is in the chunk rather than the HTML, which is why
grepping the served page for `googleapis` comes back clean, and why this is easy to rediscover as a
regression. Nothing here causes it and nothing here can remove it short of dropping the widget; it
is recorded so the next network trace does not read as one.

**Only the `latin` slice is committed, and that is the decision worth recording.** Google splits
this face into six unicode-range slices, and a browser fetches only the ones the rendered text
needs:

| slice        | bytes  | requested |
| ------------ | ------ | --------- |
| latin        | 40,480 | yes       |
| latin-ext    | 15,204 | no        |
| cyrillic     | 12,064 | no        |
| greek        | 9,084  | no        |
| vietnamese   | 7,468  | no        |
| cyrillic-ext | 2,020  | no        |

`--font-code` is spent by exactly one rule, `pre, pre code` in `app/global.css`, and a scan of every
fenced block and inline code span under `content/` found **no character** the other five cover. So
45,840 bytes were built into `.next` on every build and requested by nobody. The `unicode-range` is
carried over verbatim through `next/font/local`'s `declarations` option, **for fidelity rather than
for rendering**: it makes the one emitted `@font-face` mean what the `latin` member of the six it
replaces meant. It is not what makes an out-of-range character fall back, and believing otherwise is
the way this option gets deleted as decoration. CSS font matching runs per character, so a face with
no glyph hands the character to the next family in the list with or without the range; measured
through `CSS.getPlatformFontsForNode`, Cyrillic, Greek and box drawing render in the fallback face
either way, and the woff2 downloads either way. All the range changes is which font draws the
missing-glyph box for a character no family in the chain covers. **Adding a slice back is not a
second `src` entry**: one `localFont` call emits one `unicode-range` across all of them, so it takes
a second call and a second CSS variable chained in `font-family`.

**Two things did change, both small and both deliberate.** `weight` is pinned to the variable range
`100 800` rather than a single value, because `font-synthesis: none` on `body` would otherwise
render a bold code token at 400 against a static face. And the generated metric-adjusted fallback
moved from Google's family-level metadata (`ascent-override: 75.79%`, `descent-override: 22.29%`,
`size-adjust: 134.59%`) to metrics the local loader computes from the file itself (`77.57%`,
`22.82%`, `131.49%`). The local numbers describe the file actually being served, so the drift is
toward accuracy, and it is visible only during the swap and on a character outside the range.

**The italic face is its own `next/font` declaration.** `preload` is per declaration in `next/font`,
not per `src` entry, so while Aeonik Italic sat beside the two uprights it was preloaded wherever
they were. At 48 KiB it was the single largest preload on the site and the first request after the
HTML, to serve the handful of `<em>` runs a page contains. It is now `sansItalic` with
`preload: false`, and `app/global.css` points `em, i, cite, dfn, var, address, .italic` at
`--font-sans-italic`. **That CSS rule is what re-attaches the face**: `--font-sans` no longer carries
an italic `src`, so without it `font-style: italic` plus `font-synthesis: none` renders `<em>`
upright. Delete one and you must delete the other.

**A component's own stylesheet is render-blocking if a server module can reach it.**
`components/mdx.tsx` is a server module, so Next cannot code-split anything it imports (the same
wall the comment in `components/mdx/Twoslash.tsx` describes). Every client component reachable from
that registry therefore contributes its CSS to the critical path of all 349 docs pages, whether or
not the page renders the component. Two did: `components/HoverPopover/styles.css` (glossary
popovers) and `components/mdx/reference-list.css` (two rules, for the one page that renders
`<ReferenceList>`). Both moved into `app/global.css`, which the page already blocks on.

**Folding one of them was not enough, and that is the part worth remembering.** Turbopack groups
these imports into a shared chunk, so with `reference-list.css` still importing, the chunk simply
got smaller and `/docs/stylus` still blocked on four stylesheets. Folding the second one deleted the
chunk: the CSS _modules_ left behind (`VanillaAdmonition`, `ImageZoom`, `PdfModal`) merged into the
chunk that already carried the image-zoom vendor CSS, and the page went to **three**. Total CSS
bytes are the same either way, near enough to the byte; what goes is one round trip, which is what
costs on this critical path. The modules cannot be folded the same way, because their class names
are hashed at build.

**Adding a plain `.css` import to a component in that registry adds a render-blocking request to
every docs page.** Measured, not inferred: adding a single 46-byte stylesheet to `ReferenceList`
splits the module chunk back out and takes `/docs/stylus` from three stylesheets to four. Put the
rules in `app/global.css` instead, or put the component behind a `next/dynamic` boundary the way
`VendingMachine`, `EdgeChallengeFlow`, `CentralizedAuction` and `Twoslash` already are. Check with
`curl -s <origin>/docs/stylus | grep -o '<link rel="stylesheet"' | wc -l`, which should read 3.
Every stylesheet link sits on the document's first line, so `grep -c` counts that line once whatever
the number is.

**`lucide-react` is pinned to the version `fumadocs-ui` resolves.** `package.json` asked for
`^1.33.0` while `fumadocs-ui` requires `^1.43.0`, so pnpm installed both and both shipped to the
browser. The direct dependency is now `^1.45.0`, which lets `fumadocs-core`'s `*` peer and
`fumadocs-ui`'s range collapse onto one copy. Check with `pnpm why lucide-react` after any Fumadocs
bump; a second copy reappearing is silent.

**The home hero image carries all three priority hints.** It is the home page's LCP element
(measured). Next 16 deprecated `priority` in favour of `preload`, and `preload` on its own emits the
`<link>` with no priority hint, which is exactly what Lighthouse's LCP discovery check was failing
on: discoverable early, but queued behind everything else. `components/home-hero.tsx` now passes
`preload`, `fetchPriority="high"` and `loading="eager"` together. **That is a deliberate deviation
from Next's own advice**, which lists `loading` and `fetchPriority` under "when not to use"
`preload` and says to pick one
(`node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`). Picking one leaves
the audit failing, and the combination raises nothing: `get-img-props.js` throws only for `preload`
with `loading="lazy"` or with the deprecated `priority`. Do not "fix" it back to the documented
shape without re-running the LCP discovery audit.

**What is left, and was deliberately not done.** The largest remaining render-blocking cost is
`katex/dist/katex.css`, imported in `app/layout.tsx`: 29 KB raw, 5.7 KiB transferred, blocking on all
350 routes, and **exactly three pages render any KaTeX markup**. Splitting it would mean deciding per
page whether a page contains math, and the only signal available before render is a regex over the
raw markdown, which over-matches every `$` in a shell command and, worse, fails quietly the other
way: a page whose math the regex misses renders raw KaTeX markup with no styling. That is a bad
trade for a saving Lighthouse charges at ~162 ms largely because localhost pays a full round trip per
request. Revisit it against a Vercel preview, where the real number will be much smaller. Two other
items are outside this repo: about 13 KiB of legacy JavaScript inside Next's own framework chunk
(worth ~150 ms of LCP, nothing here controls it), and the `?_rsc=` route prefetches Next issues for
in-viewport links, which are 60 to 106 KiB per page and are the price of instant navigation.

## The Node runtime

**Node 22 LTS, everywhere.** Three files state it and they must agree:

| Where                            | What it says        | Who reads it                                                                                                        |
| -------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `engines.node` in `package.json` | `>=22.18.0 <23.0.0` | pnpm, which refuses to install on another major, or on a 22.x older than the first that runs a `.ts` file unflagged |
| `.node-version`                  | `22`                | Vercel, nvm, fnm, asdf                                                                                              |
| Vercel project settings          | Node.js 22.x        | the build and the serverless functions                                                                              |

`.node-version` is the one that makes a fresh machine and a fresh Vercel build agree without anyone
remembering to configure it. Vercel reads it on every build and pins the runtime to that major;
without it Vercel uses its own current default, which is ahead of `engines` and drifts again each
time Vercel moves.

**The Vercel project setting still has to be set to Node.js 22.x by hand** (Settings, then Build and
Deployment, then Node.js Version). `.node-version` pins the build; the project setting is what the
deployed functions run on, and a mismatch between them is not reported anywhere.

**Locally, use nvm**: `nvm use 22` in this directory, or `nvm install 22` first. nvm reads
`.node-version` as well as `.nvmrc`, so no argument is needed once the file is present. Node 24 and
26 are rejected by `engines` before anything installs, which is the intended behaviour and not a bug
to work around with `--ignore-engines`. The floor inside the major is 22.18.0, the first release
that runs a `.ts` file with no flag; see the next section for why every script needs that.

## Scripts are TypeScript, run by Node

Everything outside `app/` and `components/` that the build, the gates or a writer runs is a `.ts`
file that Node executes directly: `scripts/**`, the tests, the two redirect tables,
`next.config.ts`, `prettier.config.ts`, `.lintstagedrc.ts` and `svgo.config.ts`. There is no `.mjs`
or `.js` file in the repository and no runner (tsx, ts-node, jiti) to install. Node 22.18 and later
strip the type annotations from a `.ts` file and run what is left, so `node scripts/nav-check.ts`
is the whole invocation. That is what sets the `engines` floor at 22.18.0 rather than 22.0.0.

Four settings make that safe, and each closes a failure that would otherwise surface only at
runtime:

- **`"type": "module"` in `package.json`.** Without it Node has to sniff every `.ts` file for
  module syntax and prints `MODULE_TYPELESS_PACKAGE_JSON` each time. There was no `.js` or `.cjs`
  file whose meaning could change.
- **`erasableSyntaxOnly` in `tsconfig.json`.** Node strips types and compiles nothing else: an
  enum, a namespace, a parameter property or `import x = require()` is a syntax error at runtime.
  `tsc` rejects them first, in `types:check`.
- **`verbatimModuleSyntax`.** Node leaves `import { Foo } from './x.ts'` in place; if `Foo` is only
  a type, the import throws for a missing export. `tsc` requires `import type` for those.
- **`allowImportingTsExtensions`.** Node resolves a relative import only with its extension, so
  every relative import in a file Node runs is written `./x.ts`. TypeScript allows that only with
  `noEmit`, which is set. Turbopack resolves the same specifiers, which is why `lib/shared.ts` can
  say `./site-url.ts` and be imported by both the app and a test.

`tsconfig.json`'s `include` covers `**/*.ts`, so every script is type-checked under `strict` by the
same `types:check` gate that checks the app; `.lintstagedrc.ts` is listed on its own because a
`**/*.ts` glob never matches a dotfile. Config loaders were checked in `node_modules`, not assumed:
Next transpiles `next.config.ts` and the `.ts` files it imports, Prettier 3.9 and lint-staged 17
both search for a `.ts` config, and svgo loads an explicit `--config` path with a dynamic `import`.
Next's PostCSS loader is the exception: it accepts `.json`, `.js`, `.mjs` and `.cjs` only, and
reads the `postcss` key of `package.json` before any file, so the Tailwind plugin is declared
there. **A `postcss.config.ts` would be ignored silently and Tailwind would stop compiling**, with
nothing reporting it. `@offchainlabs/prettier-config` ships no types;
`types/offchainlabs-prettier-config.d.ts` declares it.

## Analytics

Four independent paths send events to the same PostHog project. They share nothing but the
project token, so one being off does not affect the others.

| Path                                   | Where                                               | Runs on                                           |
| -------------------------------------- | --------------------------------------------------- | ------------------------------------------------- |
| Page feedback                          | `lib/posthog.ts`, a server action                   | everywhere, including local                       |
| Web analytics (`$pageview`)            | `components/analytics/posthog-provider.tsx`, client | production only                                   |
| Inkeep search and chat (`inkeep_*`)    | the bridge in `lib/inkeep.ts`, client               | production only, piggybacking on the client above |
| Markdown fetches (`llms_file_fetched`) | `proxy.ts` via `lib/llms-tracking.ts`, server       | production only                                   |

The fourth path is documented in full under [Request tracking](#request-tracking); the rest of this
section is about the three client and server-action paths.

**The production gate.** `VERCEL_ENV` is a server-only variable, so a client component cannot read
it. Vercel exposes the same value to the browser as `NEXT_PUBLIC_VERCEL_ENV`, which is what the
provider checks. Request tracking runs in the proxy and so reads the server-side `VERCEL_ENV`
directly; the two gates are the same value reached from different sides. It is `production` on the
production deployment, `preview` on every preview build, and unset locally.

That check has to stay written as a literal `process.env.NEXT_PUBLIC_VERCEL_ENV` member expression.
Next inlines those at build time, so on a non-production build the enabled flag folds to `false`
and the guarded `import('posthog-js')` is dead code. Destructuring `process.env` into a local first
turns it into a runtime lookup and loses that.

The SDK sits behind `import()`, so it compiles to its own async chunk (~290 kB) rather than joining
the chunk the layout loads. Turbopack emits that chunk either way, but with the gate off the
browser never requests it: no script fetch, no `init`, no events, and `window.posthog` stays
undefined.

**Pageviews are manual.** `capture_pageview` is `false` because the App Router never does a full
page load on navigation. `PageviewTracker` captures `$pageview` from an effect keyed on
`usePathname()` and `useSearchParams()`. `useSearchParams` forces client-side rendering up to the
nearest Suspense boundary, so the tracker is wrapped in its own `<Suspense>` and the rest of the
tree still prerenders.

**The `window.posthog` contract.** `lib/inkeep.ts` predates this component and looks for a global
with a `capture` method; it no-oped for as long as nothing set one. The provider assigns the
initialised client to `window.posthog` after `init()`, which is the only reason the `inkeep_*`
events start flowing. Anything that replaces the provider has to keep that assignment.

**Capture settings** mirror the Docusaurus `posthog-docusaurus` config: `persistence: 'memory'` (no
cookies, no localStorage), session replay off, autocapture off, and the remote-config request
disabled. `defaults` is pinned to a dated value so upgrading `posthog-js` cannot silently change
what is captured.

**The 404 page** (`app/not-found.tsx`) captures `404_error` through
`components/analytics/not-found-tracker.tsx`, with the same fields the Docusaurus `NotFound`
swizzle sent: pathname, search, hash, referrer, user agent, and full URL. It reads `window.posthog`
rather than importing the SDK, so it captures nothing outside production instead of pulling a few
hundred kilobytes into every deployment. Because the SDK initialises from an effect of its own, out
of a ~290 kB async chunk, and no ordering between the two effects is guaranteed, the tracker retries
on a backoff spanning about sixteen seconds rather than losing the event to that race. It snapshots
the location at mount, so a late attempt still reports the URL the reader landed on. These events are what M-53 monitors after cutover to find inbound URLs the
redirect map still misses.

**Environment variables.** `NEXT_PUBLIC_POSTHOG_KEY` is the PostHog project token (`phc_…`), which
is write-only and safe to expose. `NEXT_PUBLIC_VERCEL_ENV` is set by Vercel; you never set it by
hand. Setting the key locally does nothing on its own, which is deliberate: local browsing must not
pollute production data.

## The gates

CI runs on push and PR to `main` (`.github/workflows/ci.yml`) in three jobs. **Two of them block**,
`Gates` and `Build`. Only `Network checks` reports without blocking, and it does so for a reason
about the network rather than about content quality.

"Blocking" here is a statement about intent that the workflow file can only half express. A job
without `continue-on-error` fails its run, but what holds a merge is a branch protection rule or
ruleset on `main` that lists required checks by job name. Measured 2026-09-22 through the GitHub
API: `fionnachan/fumadocs-migration` has no protection and no rulesets on `main`, so a rule or
ruleset has to be created there. `OffchainLabs/Fumadocs-test` reports `protected: true`, but that
flag comes from its ruleset layer: classic branch protection is off (`protection.enabled: false`,
zero required contexts) and the one active ruleset, "Merge control", requires only an
integration's `merge-controlled` context, so it lives under Settings, Rules, not Settings,
Branches. On both repositories, then, **no CI job holds a merge today, `Gates` included**. The fix
is the same on each: add both `Gates` and `Build` as required checks, to a new rule or ruleset on
the fork and to the "Merge control" ruleset on origin. Renaming a job renames its check, and a
required check that never reports blocks every pull request indefinitely, which is why the old
"Build (non-blocking)" name must not be listed.

**`Gates` (blocking)** — thirteen steps:

| Step                      | Catches                                                                       |
| ------------------------- | ----------------------------------------------------------------------------- |
| `types:check`             | Frontmatter schema violations, TypeScript errors                              |
| `test`                    | Regressions in the tooling scripts themselves                                 |
| `vars:check`              | A `<Var name>` with no matching key in `vars.json`                            |
| `nav:check`               | `meta.json` navigation integrity, section coverage, manifest duplicates       |
| `partials:check`          | Unresolved includes, routing leaks, stale catalog, `cwd` include in a partial |
| `versioned-docs-check.ts` | Archived-page registry drift                                                  |
| `references:check`        | Glossary ids and `<Reference>` targets                                        |
| `faq:check`               | A `faqsId` with no matching entry in the FAQ data                             |
| `images:presence`         | A markdown image with a remote src, which renders as a 500                    |
| `check-links`             | Broken internal doc links and MDX fragments                                   |
| `contracts:check`         | The generated contract-address partial matches `@arbitrum/sdk`                |
| `format:check`            | Prettier style drift                                                          |
| `content:lint`            | MDX structural defects, rules A1 through A14 except A7                        |

**Archived page registry drift, and what `versioned-docs-check.ts` actually compares (FS-2747).**
Before this ticket the script always ran `git diff --name-only HEAD -- <pinned docs>`, working tree
and staged changes against `HEAD`. That is empty by construction in this job: `actions/checkout`
here takes no `fetch-depth`, so it defaults to a depth-1 checkout, and a freshly checked-out tree
has no working-tree changes to diff against its own `HEAD` in the first place. The step had run in
`Gates` since it was added and never once fired there, on any PR, including the one that edited an
archive's frontmatter (FS-2745) and shipped the change this warning exists to flag. Reproduced by
committing a one-line body edit to an archived page on a throwaway local branch: the old script
printed nothing, while `git diff HEAD^ HEAD --name-only -- content/_versions` plainly listed the
file.

The fix keeps the check advisory (always exits 0) and keeps its local behavior (working tree +
staged vs `HEAD`, what fires before a `git commit`) unchanged, but gives it a comparison that can
actually see a _committed_ change on a `pull_request` run. **It reads that comparison out of the
checkout rather than fetching it.** `actions/checkout` on a `pull_request` event checks out the
synthetic merge commit GitHub builds for the pull request (`refs/pull/<n>/merge`), whose **first**
parent is the base branch's tip at event time and whose second is the PR head. So `git diff HEAD^1
HEAD` is exactly the pull request's own change set, and the only thing missing was the parent:
`fetch-depth: 2` on the `Gates` and `Build` checkout steps keeps it, where the default depth-1
checkout grafts `HEAD` parentless. Proved in a scratch clone that reproduces the action's documented
refspec: at depth 1 both `HEAD^1` and `HEAD^2` fail to resolve, at depth 2 both resolve and
`git diff --name-only HEAD^1 HEAD` names the archive edit and nothing else.

The rejected alternative was fetching the base branch's tip at depth 1 into
`refs/remotes/origin/<base>` and diffing that. It works, and it was the first implementation, but
every `actions/checkout` step in this repo passes `persist-credentials: false`, so that fetch is an
anonymous request that succeeds only while both repositories stay public, and any failure of it,
transient or permanent, silently returns this check to reporting nothing, which is the exact
invisible-green this ticket exists to remove. It also put a network call at the front of `pnpm
build`, and so inside the blocking `Build` job whose one accepted network dependency is Google
Fonts, working against the effort to remove that one. Reading `HEAD^1` needs no network, no
credentials and no `origin` remote at all.

`fetch-depth: 2` costs one extra commit's objects and changes nothing else. In particular the clone
is **still shallow**, so `hasFullGitHistory()` in `source.config.ts` keeps answering false and
`lastModified` stays off in CI, which is what stops every page being stamped with one boundary
commit's date. Measured in the same scratch clone: `git rev-parse --is-shallow-repository` answers
`true` at depth 2.

Two signals pick the comparison, and neither substitutes for the other. `GITHUB_BASE_REF`, which
GitHub Actions sets only for a `pull_request`-triggered run, says the run has a base at all. The
merge-commit probe (`HEAD^2` resolves) says the checkout actually holds that shape, so a checkout
pinned to the PR head, where `HEAD^1` is merely the previous commit on the branch, is not mistaken
for one and diffed against the wrong tree. When the run is a pull request and either signal is
missing, the script falls back to the local comparison **and raises a `::warning::` annotation**, so
a checkout that loses `fetch-depth: 2` shows up in the run summary instead of in one line inside a
collapsed step log. Every other CI run (a direct `push` to `main`, and `upstream-refresh.yml`'s
scheduled `stylus` job) falls back with a plain printed note and no annotation, because that is the
expected shape there rather than a misconfiguration. For `push` it is a residual gap, accepted on
the reasoning that a merge to `main` goes through a PR first and that PR's own run already warned.
For `stylus` it is not a gap at all: `pnpm stylus:generate` runs before the gate list there, so the
working tree genuinely is dirty and the local comparison is the meaningful one, which is why that
job needs no `fetch-depth` of its own. The script always prints which comparison it ran, so a quiet
`Gates` step can be told apart from one that had nothing to report.

`pickComparison` in `scripts/lib/versioned-docs-comparison.ts` is that decision on its own, pure and
exported, taking the environment and the two git probe results as plain booleans. It lives outside
the CLI so `pnpm test` can pin all five shapes (local, pull request with the merge commit, pull
request with no parent, pull request whose `HEAD` is not a merge, and a CI run that is not a pull
request) without a git fixture. The check ran green while doing nothing for months, so the decision
that made it do nothing is the part that needed a test.

`check-links` exists because Fumadocs has no equivalent of Docusaurus's `onBrokenLinks: 'throw'`.
`pnpm build` chains it ahead of `next build`, so a broken link or fragment also fails the Vercel deploy.

Fragment validation compiles each routed document with `@mdx-js/mdx`, Fumadocs' `applyMdxPreset`
and `remarkInclude`, and the same options the site imports from `lib/mdx-options.ts`. It reads
IDs from the resulting HTML syntax tree instead of approximating heading slugs. Nested and repeated
includes retain their position in the document, so duplicate headings and `[#custom-id]` headings
resolve as they do on the site. Markdown and literal JSX links in included partials are checked in
each containing page's URL context; errors name the partial's original file and line. The checker
drops one preset plugin, `rehypeCode`: syntax highlighting never produces an id, and shiki plus
the twoslash transformer were two thirds of the run (15.5 s against 5.1 s on 348 pages, identical
findings). Everything else, remark plugins and `rehypeKatex` included, runs exactly as on the site.

Same-page, relative, and root-relative fragments are checked, including percent-encoded IDs and
query strings. External URLs, public-asset fragments, and dynamic JSX expressions are outside this
check. It does not execute React components: anchors generated only at component runtime still need
browser verification, as do scrolling and heading visibility. `--json` retains its reporting-only
exit status of 0 for link findings; MDX compilation errors exit 1 in either mode. The default command
blocks on both broken paths and missing fragments, through the existing CI gate and build command.

`format:check` and `content:lint` are the two newest entries, promoted on 2026-09-15. Until then
they sat in a third, non-blocking `Content debt` tier, which existed to hold a check whose count
was not yet zero: `format:check` opened at 49 unformatted files and `content:lint` at 181
findings, and blocking on either would have rejected every PR over defects the migration
inherited rather than introduced. Both reached zero, so the tier had done its job and was retired.
No promote-when-zero rule is left to apply, and a failure in either step now means the PR under
review introduced it.

**`Build` (blocking since FS-2746)** runs `pnpm build`, then starts `next start` and runs
`redirects:check` and `scripts/static-docs-http.test.ts` against it. It was advisory until then
because the MDX image pipeline fetched remote images at build time, so a dead third-party URL
turned it red for reasons unrelated to the change under review. That reason is gone: the build no
longer touches the network for images (see
[Remote images are never fetched at build](#remote-images-are-never-fetched-at-build)).

What only this job sees, and what therefore blocked nothing until the promotion: render-time MDX
failures, a page that compiles but throws at prerender (an undefined component, for instance);
a plain MDX syntax error was already caught by `check-links`, which compiles every page to
validate anchors, and `types:check` sees neither, because it proves the frontmatter schema and
the TypeScript, not the compile; the 404 shape and prerendered-route assertions of FS-2688 and
FS-2698; `redirects:check`; FS-2724's `og:*` tags; FS-2732's three "no MDX comment in the
mirrors" assertions; and FS-2733's assertion that the rendered contribute page links back into
this repository. Every one of them reported and passed anyway.

**It stays a job of its own rather than folding into `Gates`.** The two run in parallel, so
promoting the build costs no pull-request latency: a run already waits on whichever job is slower,
and folding the build (53 s cold, 37 s warm, measured 2026-09-22) plus a few seconds of HTTP behind thirteen checks
that do not need it would only serialise work that is already free.

**The build reaches the network nowhere, since FS-2750.** The one dependency left was
`app/layout.tsx` declaring `--font-code` with `JetBrains_Mono` from `next/font/google`, which made
`next build` fetch that face's CSS from `fonts.googleapis.com` and its `woff2` files from
`fonts.gstatic.com` and self-host them into `.next/static/media`. The loader retries three times
and falls back to a local face only in dev
(`node_modules/next/dist/compiled/@next/font/dist/google/loader.js`), so in a production build an
outage threw, and CI caches only the pnpm store, so every run refetched. That face is now committed
under `public/fonts/` and loaded with `next/font/local` (see
[Page weight and what loads late](#page-weight-and-what-loads-late) for which slice and why).
**Proved rather than assumed**, with `HTTPS_PROXY` and `HTTP_PROXY` pointed at a closed port, which
the Google loader honours through `get-proxy-agent.js`: on the parent commit `pnpm build` exits 1
with `Failed to fetch JetBrains Mono from Google Fonts` as its only error, while on this one it
exits cleanly. Nothing after `pnpm install` reaches out either: `redirects:check` reports an
external destination as `SKIPPED` without fetching it, and the HTTP suite talks only to
`STATIC_DOCS_TEST_URL`. The checkout and the install still do, as they must, which is why the claim
is about the build step rather than the job. **Do not reintroduce a `next/font/google`
declaration**; a new face belongs in `public/fonts/` with its licence beside it, and
`scripts/lib/fonts.test.ts` fails the `test` gate if one returns.

The same removal reaches `upstream-refresh.yml`'s `stylus` job, whose gate list
mirrors `Gates` plus the build: a Google Fonts outage on a Monday used to fail it before
`create-pull-request`, so no PR opened, and the only signal was a red run emailed to whoever last
edited the cron schedule. That cause is gone; the job can still fail on any of its thirteen gates
the same way.

**`Network checks` (non-blocking)** runs `precompiles:check`, marked `continue-on-error`, and is
the only job here that does not block. Reaching zero is not what would promote this one: it is already
green. It fetches about thirty Solidity sources from `raw.githubusercontent` on every run with no
retry, so a GitHub blip turns it red for reasons unrelated to the change under review. That was
already a different failure profile from the build's one host, two requests and three retries, which
is why the two ended up on opposite sides; since FS-2750 the build step makes no request at all, so
this is the only step left that reaches a host of its own, `actions/checkout` and `pnpm install`
aside. Its sibling `contracts:check` reads a registry that ships
inside `@arbitrum/sdk` at an exact pin, so it is offline and blocks. Losing the network dependency
is what would promote `precompiles:check`.

**Run by hand only:** `cli:check`, `stylus:check`, and the network mode of `images:check`.
`images:check` reaches out to third-party hosts, so its result depends on somebody else's uptime;
its offline sibling `images:presence` does run in CI. `redirects:check` is not on this list at
all: it runs as the last step of the `Build` job, against `next start` on localhost (see
[Redirects](#redirects)), and blocks there since FS-2746. It is not a step in `Gates` because it
needs a running site, and the only cheap way to get one is to reuse the build that `Build` already
does. It is still available by hand with `--base-url`, against a local `pnpm dev` or any other
URL.

`upstream-refresh.yml` runs Mondays at 08:00 UTC and on `workflow_dispatch`, in two independent
jobs. **"Upstream" in its name means the pinned Nitro release, go-ethereum, the `@arbitrum/sdk`
network registry and `offchainlabs/stylus-by-example`.** It has not meant the Docusaurus repo since
FS-2706 deleted the third job, `drift`, which compared the two content trees and maintained an
"Upstream drift" issue from the result.

- **`refresh`** runs `nitro:check-release`, then `precompiles:generate`, `contracts:generate` and
  `cli:generate`, opening `automated/upstream-refresh` as a PR if anything changed. It never writes
  to `main` and no-ops when the tree is clean.
- **`stylus`** regenerates `content/docs/stylus/stylus-by-example/`, runs `ci.yml`'s whole blocking
  set against the result (the `Gates` list, then `pnpm build` and the server step that is the
  `Build` job), and only then opens `automated/stylus-by-example` as its own PR.

The two jobs have no `needs` between them on purpose, so a failing generator never hides the other
job's result.

`nitro:check-release` also derives `goEthereumCommit` from the `go-ethereum` submodule at
`nitroVersionTag`, including when the Nitro tag is unchanged but the submodule pin needs repair.
Source links use `{var:goEthereumCommit}` rather than an upstream Geth tag, which may lack
Arbitrum-specific files. Avoid fixed line anchors on these links: line numbers move as the pin
updates. The release script resolves the submodule and node image before writing any changes.

The three generators' `--check` modes sit in three different places, because they are not the same
kind of check.

`contracts:check` blocks. Its input does not move on its own: the generator reads the network
registry that ships inside `@arbitrum/sdk`, and that pin is exact, so the step can only go red on
a human act. There are two, and both should block. One is a hand edit to the generated partial,
against the do-not-edit marker inside it; before this gate existed such an edit passed CI, merged,
and was then silently reverted by the next weekly refresh under the automation's authorship rather
than its author's. The other is a PR bumping the SDK to a release that moves a published address,
which is a value a reader pastes into a transaction and must never change unreviewed.

A Dependabot bump of the SDK therefore reddens only the bumping PR, not every open one: CI installs
from each branch's own lockfile, so no other branch sees the new registry until that PR merges. The
fix in that PR is one command, `pnpm contracts:generate`, and a commit of the regenerated partial.
Note the gate fires only when a bump actually moves an address; a release that changes nothing the
partial renders stays green.

`precompiles:check` does not block, for the network reason given above rather than for any
statement about its input.

`cli:check` runs nowhere automatically, and blocking on it would be a category error: its input is
a moving upstream, the Nitro tag pinned in `content/vars.json` and whatever that tag's Go source
says, so a red gate would mean "someone published a Nitro release", not "this PR is wrong". The
weekly refresh PR is where that gets noticed instead.

`stylus:check` is out of CI for the same reason, more sharply: it clones a third-party repository's
default branch with no pin at all, so a red gate would mean "someone edited stylus-by-example". The
`stylus` job in the weekly refresh does it instead, and because the PR that job opens receives no
CI of its own, that job also runs every gate on this list against the tree it is about to propose.
See [Stylus by Example](#stylus-by-example).

When `contracts:check`, `cli:check` or `stylus:check` fails it prints a line-level diff, so a reviewer can see
whether a value moved or only the formatting did. That diff is a real one, computed over a longest common
subsequence in `scripts/lib/line-diff.ts`: comparing the two files by line index instead reported
every line after an insertion as changed, which on this 112-line partial meant 53 lines for a
two-line edit and defeated the point of printing it.

### Generated pages

Four things in `content/` are written by a generator and must never be hand-edited: the precompile
tables, the contract-address partial (both under `content/partials/`, see
[Partials](#partials)), `content/docs/run-a-node/nitro/cli-flags-reference.mdx`, and the nineteen
pages under `content/docs/stylus/stylus-by-example/`.

The CLI flags page is the only _partly_ generated file under `content/docs/`, so it is the only one
with frontmatter a writer owns. `pnpm cli:generate` replaces only the region between
`{/* GENERATED:START */}` and `{/* GENERATED:END */}`; the frontmatter and any prose outside those
markers survive untouched.

**It reads Nitro's Go source, not `nitro --help`.** The flag list is really the output of
`--help`, but producing it means building Nitro, which means a Go toolchain and the Rust arbitrator
artifacts in a workflow that otherwise installs nothing but Node. So the generator parses the
`…ConfigAddOptions` functions instead, composing each dotted name from the prefix its caller passes
and following every default back to the `var …Default = T{…}` literal it points at. Two consequences
worth knowing:

- **go-ethereum is not optional.** Nitro registers the whole `execution.rpc.*` namespace by calling
  into the submodule's `arbitrum` package, so the generator materialises that submodule at its
  pinned commit and fails loudly if it is missing, rather than dropping 19 flags silently.
- **Anything it cannot evaluate fails the run.** Five flags default to `util.GoMaxProcs()`, decided
  at process start, and three are registered with `f.Var` and a custom `pflag.Value`. Those are
  declared in `scripts/data/nitro-cli-reference.data.ts`; a new one with no entry stops the
  generator instead of publishing a blank cell. **The check runs in both directions**: an entry in
  either list that matches no flag Nitro still registers also stops the run, so a curated
  exemption cannot rot into a no-op the way it could when both lists were plain lookups.

`--nitro-path <dir>` (or `NITRO_REPO_PATH` in the environment, which the flag overrides) reads an
existing Nitro clone. It still extracts the tree at the pinned tag, so a local run and a CI run see
the same source no matter what the checkout has checked out. `--verbose` additionally names every
flag the exclusion rules dropped, grouped by the rule that dropped it; without it the run prints
only the per-rule counts. One rule matches on the flag's **description**, so a Nitro release that
reworks a docstring can drop a flag off the page, and the counts are what make that visible in the
weekly refresh PR's log.

### Stylus by Example

`content/docs/stylus/stylus-by-example/` is nineteen pages republished from
[`offchainlabs/stylus-by-example`](https://github.com/offchainlabs/stylus-by-example), a live
third-party repository. `pnpm stylus:generate` clones it and rewrites every page; `pnpm
stylus:check` fails with a line diff when the committed tree has drifted from it. Unlike the CLI
flags page these are generated whole, frontmatter included, so there is nothing on them a writer
owns — a fix belongs upstream, or in `scripts/data/stylus-examples.data.ts`.

They arrived here as a hand port of an arbitrum-docs pipeline
(`scripts/sync-stylus-content.js` plus a `stylus-content` job in `update-external-content.yml`),
which did not survive that repo being archived. Without the port, an edit in stylus-by-example would
have reached this site through nobody and nothing, and nobody would have been told.

Six things about it are worth knowing:

- **Nothing is pinned.** stylus-by-example publishes no releases and this site has always tracked
  its default branch, so the generator clones that. A pin would only be a second version number to
  forget to bump. The cost is that `stylus:check` depends on the network _and_ on somebody else's
  default branch, which is why **it is deliberately not a CI gate**: it would redden every open PR
  the moment an unrelated repository edited a page. The `stylus` job in
  [`upstream-refresh.yml`](.github/workflows/upstream-refresh.yml) runs it weekly instead, where a
  change becomes a PR on `automated/stylus-by-example`. That is its own job on its own branch, not
  another step in `refresh`: a failure here must not hide a Nitro pin bump, and nineteen pages of
  changed prose in the same PR as a regenerated address table is a PR nobody reviews.
- **That job runs the blocking gates itself**, between the generator and the pull request, and
  that is not belt-and-braces. A pull request opened with `GITHUB_TOKEN` triggers no workflow
  runs — GitHub's own rule, so a workflow cannot recurse — and `ci.yml` fires only on
  push/pull_request against `main`, so **nothing checks the PR this job opens**; its checks tab
  arrives empty, which reads as green. The payload is prose and frontmatter from a repository this
  project neither controls nor pins, which makes it the automated PR most in need of checking, so
  the job runs `ci.yml`'s blocking set step for step against the regenerated tree and fails the
  weekly run rather than shipping a PR nothing has verified. That set is the `Gates` list plus
  `pnpm build` and the server step behind it, added when FS-2746 promoted the `Build` job; the
  build is the half this payload most needs, since a render-time MDX failure is the defect no other
  step catches and upstream prose is where one would come from. **Keep the two lists in sync**: a
  gate added to `ci.yml` and not there is a gate that PR does not get. The alternative, a PAT or
  GitHub App token on `create-pull-request` so `ci.yml` runs for real, needs a secret nobody has
  provisioned. The sibling `refresh` job has the same no-CI shape and no gates of its own; its
  payload is generator output over pinned inputs, so the exposure is smaller, but it is the same
  gap and worth closing separately.
- **The published set is an allowlist**, in `scripts/data/stylus-examples.data.ts`, and that list
  doubles as the `meta.json` order. That order is **upstream's teaching sequence, not
  alphabetical**: `hello_world`, then the primitives, then what builds on them, straight from the
  `allowLists` block of arbitrum-docs `scripts/sync-stylus-content.js`. The hand port alphabetized
  it, which opened a beginner's section on "ABI Decode" and pushed "Hello World" to tenth; the
  parity this pipeline exists for is the reason it is back. Reordering that array is a rendered
  change to the sidebar, not a tidy-up. The order of the two sections comes from the same place,
  `basic_examples` before `applications`, and the parent
  `content/docs/stylus/stylus-by-example/meta.json` is **hand-owned, not generated**, so it has to
  be kept in step by hand. Upstream publishes sixteen more examples than these. Every run **names
  the ones it skipped**, because that log line is the only notice anyone gets that a new example
  exists; adding one is a deliberate act, since it is a new page on this site.
- **A relative link resolves against the section that publishes the slug**, and a slug this site
  does not publish stops the run. Upstream's version of that rule hardcodes `basic_examples`, which
  is only ever right because the one relative link in the published set happens to live there.
- **The `metadata` export is parsed, never evaluated.** Upstream's `title` and `description` live
  in a JavaScript object literal, not JSON, so `parseObjectLiteral` in
  `scripts/lib/stylus-examples.ts` reads a grammar of JSON plus the four things upstream actually
  writes — single quotes, bare keys, trailing commas, a value wrapped onto the next line — and
  throws on every other token, with no fallback. It replaced a `new Function(…)()`, which is a
  different thing from cloning: a clone copies bytes, evaluating one runs it, unpinned, weekly, in
  a job holding `contents: write`, and on any maintainer's machine that runs `pnpm
stylus:generate`.
- **`meta.json` is written without Prettier** (`format: false` on `writeOrCheck`).
  `.prettierignore` excludes `**/meta.json` because `stringifyMeta` writes one array entry per line
  and Prettier collapses a short array; formatting it here would make this generator and `pnpm
move-doc` undo each other on every run.

Regenerating in September 2026 restored two things a human had changed on a generated page after
the last sync: eleven blank lines inside Rust snippets, squeezed during the Fumadocs port, and the
word "seamlessly" in the opening line of `primitive_data_types`, dropped in arbitrum-docs
`2665b2643`. Both were edits to a file that carried a `DONT-EDIT-THIS-FOLDER` marker. **An
editorial fix to one of these pages has to be made upstream** or it will not survive the next
Monday.

## The content-lint rules

`pnpm content:lint` (`scripts/content-lint.ts`, rules in `scripts/lib/content-lint.ts`) is the
gate for MDX that compiles and type-checks but renders wrong. Every rule but `A6` ignores fenced
blocks and inline code spans, so a page that documents syntax is never mistaken for a page that uses
it. `A6` is the deliberate exception and reads inside them, because a `<Var>` that ships as a
literal tag is exactly the defect it looks for.

| Rule  | What it catches                                                               |
| ----- | ----------------------------------------------------------------------------- |
| `A1`  | `VanillaAdmonition` with an empty body, prose stranded in `title=`            |
| `A2`  | `VanillaAdmonition` `type` outside `note\|tip\|info\|warning\|danger`         |
| `A3`  | An unconverted Docusaurus `:::` directive                                     |
| `A4`  | Markdown syntax inside a `title=` attribute, which renders literally          |
| `A5`  | An internal link target that keeps its `.md`/`.mdx` suffix                    |
| `A6`  | `<Var>` inside code, which ships as the literal tag                           |
| `A7`  | A local image `src` with no file under `public/` (**not** in the default set) |
| `A8`  | A link inside a heading                                                       |
| `A9`  | A hand-written `<p>` around block content                                     |
| `A10` | A `<tr>` that is a direct child of `<table>`                                  |
| `A11` | `<Var>` in a link destination, which never substitutes and never parses       |
| `A12` | A fenced code block with no closer, which runs to the end of the file         |
| `A13` | A fence closer indented past the column every code-masking gate reads it at   |
| `A14` | `title`/`sidebar_label`/`description` with leading, trailing or doubled space |

`A5` judges a destination **after** `{var:name}` expansion, the way `check-links` does (FS-2733). A
destination opening with a placeholder that holds an absolute URL reads as a relative path as
written and is external once expanded, so judging the written string would flag a `.md` suffix that
is correct: the target is a file in a git repository, not a route on this site.

`A7` is the one rule the bare command does not run. It has three findings left, all on
`content/docs/stylus/cli-tools/verify-contracts.mdx`, tracked as FS-2709; the command prints a note
saying so. Run `--rule=A7` or `--all` to see them, and fold `A7` back into the default set once that
page is fixed.

### A8, A9 and A10 are one family: invalid nesting breaks hydration

These three catch HTML the browser's parser has to restructure before it can build a tree. React
then hydrates a client tree that does not match the server tree, throws
[error #418](https://react.dev/errors/418), and discards and re-renders the affected subtree. The
reader sees a flash and loses any client state in it.

**Nothing else sees this.** The page still compiles, still returns HTTP 200, and still passes
`types:check`, `check-links` and every other gate. The production readiness audit found eighteen of
350 routes failing this way (FS-2714), and the rules above were written from those three shapes:

- **`A8`, a link inside a heading.** Fumadocs wraps every heading's content in its own
  `<a href="#slug">`, so a heading that already contains a link renders `<a><a>…</a></a>`, which no
  HTML parser can represent. A markdown link, a reference link, a bare URL or angle autolink (GFM
  anchors both) and a raw `<a>` all count. A markdown **image** does not: `<img>` nests inside an
  anchor legally, and neither does `[#custom-id]`, which is how a heading pins its slug. The fix is
  to keep the heading as plain text and move the link into the prose under it, which also leaves the
  heading's slug untouched. Where a slug is load-bearing and the heading has to change anyway,
  `## Heading text [#old-slug]` keeps the old anchor. One shape stays out of reach: a shortcut
  reference link (`[ref]` alone) is indistinguishable from `[#custom-id]` without resolving link
  definitions. The tree holds one link definition today, an image reference in
  `third-party-docs/Circle/usdc-paymaster-quickstart.mdx`, used in body prose and never in a heading.
- **`A9`, a hand-written `<p>` around block content.** MDX parses a JSX element's children as flow
  content when they start on their own line, so remark wraps the prose in a paragraph and the
  element becomes `<p><p>…</p></p>`. Written inline, `<p>text</p>` renders one paragraph and is not
  flagged; the generated precompile partials use that form, and a rule that flagged it would demand
  an edit to a generated file (`generate-precompile-tables.ts` writes them from fetched Solidity
  sources) for markup that renders correctly.
- **`A10`, a `<tr>` directly inside a `<table>`.** The parser inserts the `<tbody>` the source
  omitted, so the client tree gains an element the server tree does not have. Put every row inside a
  `<thead>`, `<tbody>` or `<tfoot>`. A raw table is still the right choice when it needs the
  `small-table` class, which `app/global.css` styles and a markdown table cannot carry.

They are three ids rather than one because the report groups by id and each shape has its own fix. A
single "invalid nesting" id would print one count covering three unrelated edits.

### A12 and A13 are a pair: this repo has two markdown parsers and they disagree

`scripts/lib/strip-code.ts` models CommonMark. The site compiles with `remark-mdx`, which turns off
indented code blocks and, with them, CommonMark's three-column cap on a closing fence. Measured
across closer indentations 0 to 6 on one input (FS-2743):

| Closer indent | `mdast-util-from-markdown` | `remark-parse` + `remark-mdx` (this site) |
| ------------- | -------------------------- | ----------------------------------------- |
| 0 to 3        | closes                     | closes                                    |
| 4 and deeper  | does **not** close         | closes                                    |

So a fence boundary has two readings here, and the two rules cover the two ways they part company.
Like A8, A9 and A10 they are separate ids because the report groups by id, and here the fixes are
opposite.

- **`A12`, a fence with no closer at any indentation.** It runs to the end of the file, which is
  what the page renders. Reader-visible either way: a stray trailing fence renders an empty code box
  with a copy button (that is what `stylus/how-tos/trait-based-composition.mdx` shipped under its
  closing prose list), and a real opener whose closer went missing swallows the rest of the page into
  it. Fix by deleting the stray line, or by writing the closer that is missing. Read what the page
  renders before choosing: the two look identical in the source and the fixes are not
  interchangeable.
- **`A13`, a closer indented more than three columns past its opener.** The site's parser ends the
  fence at that line and `strip-code.ts` does not, so every gate reading MDX through it (A1 to A11
  above, `check-links`, `partials:check`, `images:presence`) treats the lines between as fence body
  and blanks them. One stray indent switched eighteen lines of
  `launch-arbitrum-chain/integrations/da-api-integration-guide.mdx` off from all of them, two of
  those lines being `Tab` element tags. Fix by aligning the closer with its opener, the one form both
  parsers read alike. A fence nested four or more columns deep inside a list item is not flagged: the
  allowance is measured against its own opener, not against column 0.

  **The message does not promise the page renders correctly, and neither does this entry.** On the
  shape that prompted the rule it does: the fence was meant to end there, MDX ended it there, and
  a writer sent to the page finds nothing wrong, which is why the reason has to be written down.
  But the rule fires on two shapes where it does not. A fence whose own closer is missing, followed
  later in the file by an unrelated over-indented closer, has MDX ending it at that later line and
  swallowing the prose in between; and an outer fence documenting an indented inner fence ends at
  the inner closer, early. Both were measured through this repo's processor (FS-2743). Neither
  exists in `content/` today and a line-based scanner cannot tell any of the three apart from the
  source alone, so the message names what the scanner saw and tells the writer to read the rendered
  page before dedenting rather than asserting a render it cannot know.

**The masking deliberately stays at the CommonMark reading.** Widening it so the scanner matches the
renderer would remove the disagreement at its root, but it changes what every consumer sees across
the whole tree and could regress any gate that reads it, so it wants its own ticket. With `A13`
blocking, no file in `content/` relies on the difference meanwhile.

Neither rule brings a parser of its own. `scanFences` in `strip-code.ts` is one generator yielding
each fence with both readings of its closer; `codeRegions` takes the offsets it already used and
`fenceDefects` takes the two closer positions. A rule about where a fence ends cannot disagree with
the masking that acts on it, which is the whole point of the FS-2729 convergence.

### A14: whitespace noise in title, sidebar_label or description (FS-2747)

`title`, `sidebar_label` and `description` all reach the reader verbatim: `title`/`description`
become the page's `<title>` tag and `<meta name="description">`, and the same `description` feeds
the OG and Twitter card `generateMetadata` builds (`app/docs/[[...slug]]/page.tsx`); `sidebar_label`
becomes the sidebar tree's label text when no `lib/docs-navigation.json` entry names the page. A
value carrying a leading or trailing space, or a doubled internal space, ships that whitespace into
whichever of those it feeds.

A `.trim()` in the frontmatter Zod schema (`source.config.ts`) would fix the leading/trailing case
silently and say nothing about a doubled internal space, which trimming never touches. `A14` reports
both instead, on the theory that a generated page's whitespace defect belongs fixed at its
generator, so it survives the next regeneration, rather than papered over at read time on every
build.

The rule reads the raw frontmatter block off `source`, not the code-stripped `text` every other rule
but `A6` reads. `stripCode`'s inline-code masking has no notion of a YAML string's quoting: a
backtick pair inside a frontmatter value, like
``description: 'a minimal `entrypoint` function'``, gets blanked the same way a real inline code
span in prose would, and reading that blanked run back would misreport it as a doubled space of its
own (measured on `content/docs/stylus/stylus-by-example/basic_examples/bytes_in_bytes_out.mdx`
during this rule's own development). `stripCode` blanks 1:1 and never moves a newline, so an offset
found in `source` is still valid when handed to `text`-based line-number lookup. A quoted value's
surrounding `'…'`/`"…"` is stripped before the whitespace check runs. The `[ \t]*` separator right
after the field name is deliberately greedy and absorbs every space between the colon and the value:
in real YAML that run is separator, not content, so `title:  x` and `title: x` name the same value
and neither is flagged; only _trailing_ whitespace and a doubled run in the middle are real.

Whitespace at the **end of the line** is separator too, and comes off before the quoted test runs.
YAML ends a scalar at the last non-space character of the line, so `description: 'Clean'` followed
by two spaces holds the value `Clean`, and so does the same line without the quotes (measured
against a real `js-yaml` parse, and against Prettier, which normalizes neither shape and so lets
both through `format:check`). Judging the untrimmed line instead failed the quoted test, because the
line no longer ends in a quote, kept the quote characters inside the value, and reported a value
with no defect at all as carrying both leading-or-trailing whitespace _and_ a doubled internal
space. It is still reported, because nothing else in the toolchain removes it, but as its own
problem with its own wording: `trailing whitespace on the line, outside the value`. The
doubled-space probe reads the trimmed value for the same naming reason, so a run at the end is
reported once, as trailing whitespace, rather than sending the writer looking for a space in the
middle of a string that has none.

Two limits are deliberate. A **folded or literal block scalar** (`description: >` or `| `, with the
text on the following indented lines) is skipped rather than read: the value is not on the key's
line at all, and reading the indicator character as the value would be worse than reading nothing.
There are none in `content/` today, across all 524 files carrying frontmatter, and the frontmatter
contract gives no reason to reach for one; a writer who does gets no whitespace checking on that
field. And the rule is **path-agnostic**, so it covers `content/_versions/**` as well: a whitespace
defect frozen into an archive is a blocking `content:lint` finding whose only fix is editing the
archive, which then trips `versioned-docs-check.ts` in turn. That warning is expected in that case,
not a second defect. No such finding exists today.

Three findings existed when the rule landed. Two were hand-owned pages with a trailing space in
`description` (`launch-arbitrum-chain/deploy/deploying-an-arbitrum-chain.mdx` and
`deploying-token-bridge.mdx` in the same directory), fixed by hand. The third was a doubled space in
`stylus/stylus-by-example/basic_examples/variables.mdx`, a page `pnpm stylus:generate` writes; that
one is fixed in the generator (`parseMetadata` in `scripts/lib/stylus-examples.ts` now collapses
whitespace runs and trims `title`/`description` after reading them), not in the committed `.mdx`,
because a hand-edit there would be overwritten by the next weekly `stylus` job. The doubled space
was in upstream's own metadata string verbatim, not introduced by this generator, and normalizing it
is a whitespace fix rather than the kind of wording change the "Stylus by Example" section above
says has to be made upstream.

## The local pre-commit hook

A Husky pre-commit hook (`.husky/pre-commit`) runs `pnpm exec lint-staged` on every `git commit`,
configured in `.lintstagedrc.ts`. It exists to catch what the gates above only catch several
commits later, in CI. It is a separate, third tier from the two CI tiers, not a copy of either
one:

- Prettier runs on every staged file type it understands, except `meta.json`. `meta.json` is
  generator output (`stringifyMeta` in `scripts/lib/doc-links.ts`), written one array entry per
  line on purpose; Prettier collapses a short array onto one line, so the two would fight each
  other on every `pnpm move-doc` run. `.prettierignore` excludes `**/meta.json` repo-wide for the
  same reason, so `format:check` does not report them either and nothing is hidden here.
- Staged `content/**/*.mdx` files get `content:lint`, restricted to the staged files but running
  the full rule set. It was limited to `A1,A3,A4` while `A2` and `A5` still had pre-existing
  findings, because a hook enforcing a rule CI itself did not enforce would reject a commit over a
  defect the contributor did not introduce, with `--no-verify` as the only way out. Both reached
  zero on 2026-09-15 and `content:lint` became blocking in CI, so the filter came off and the hook
  and the gate now agree. If a rule added later lands with pre-existing findings, name the clean
  rules explicitly again until it reaches zero.
- Prettier and content-lint run as one sequential array entry for `content/**/*.mdx`, not as two
  separate glob entries. lint-staged runs separate glob entries concurrently by default, and an
  `.mdx` file under `content/` would otherwise match both the general Prettier glob and the
  content-lint glob at the same time, letting one read a file the other is still rewriting.
- A staged `.ts`/`.tsx` file runs one full `pnpm types:check`, not a bare `tsc --noEmit`. Next's
  route-handler types and the fumadocs-mdx `.source/` collection are both generated, so plain
  `tsc` fails on a fresh checkout with no `.next/types` yet; `types:check` regenerates both first.
  This also means the hook cost is not proportional to the edit: even a one-line `.ts` change pays
  for a full regenerate-and-typecheck pass.

The hook skips entirely when `CI=true` (CI already runs the full `Gates` job) and when `HUSKY=0`.

## What nothing catches

Every gate has a blind spot. These are the ones that have bitten:

- **Runtime-generated anchors and obscured headings.** `check-links` validates compiled MDX IDs,
  but does not execute React components or measure the viewport. Click changed anchors in a browser
  and confirm the target is visible below sticky navigation.
- **Client components importing `lib/source`.** Costs megabytes in the browser bundle. No gate sees
  it.
- **Rendering.** `types:check` proves the schema, not the render. It exits 0 on pages that serve
  literal `:::`, `undefined`, or HTTP 500. Confirm content changes in a browser.
- **A redirect to the wrong-but-existing page.** `redirects:check` only proves the destination
  resolves.
- **A page deleted without a redirect.** `check-links` validates the links that exist, so deleting
  a page along with its inbound links passes every gate while the page's published URL starts
  404ing. `move-doc` covers a move, and `redirects:check` proves a destination resolves, but
  neither sees a plain deletion, and the upstream comparison that would have reported the page
  absent after the fact went with FS-2706. Write the redirect into `redirects.config.ts` by hand
  in the same commit as the deletion.
- **A third-party image that has rotted.** Nothing in CI requests it, so a dead URL behind
  `<ImageZoom src="https://…">` is silent. `pnpm images:check` is the manual sweep. The one case CI
  does catch is a remote image in markdown syntax, via the offline `images:presence` gate.

**Browse on `localhost:3000`, not `127.0.0.1`.** On `127.0.0.1` React does not hydrate and every
component looks broken.

## Static routing under `/docs`

Every live docs page and every archived version is prerendered at build, and a slug that is in
neither list returns 404 without the page ever rendering. Two exports in
`app/docs/[[...slug]]/page.tsx` do that, and each one closes a different ticket:

- **`generateStaticParams()`** returns `source.generateParams()` plus `archiveParams()`, so the
  build enumerates all 349 live pages and all three archived versions (FS-2698). This became
  possible only when `?v=` moved off `searchParams` and onto a path segment in the same change: a
  page that awaits `searchParams` is dynamic by definition, and a dynamic route prerenders nothing
  whatever `generateStaticParams` returns.
- **`dynamicParams = false`** makes Next answer 404 for every slug outside that generated set,
  without rendering the page (FS-2688).

Measured on Next 16.3.4 (2026-09-17) with a full `pnpm build`, counting
`.next/prerender-manifest.json` rather than reading the route table:

| Prerendered routes    | Count |
| --------------------- | ----- |
| `/docs/**` pages      | 352   |
| `/og/docs/**` images  | 349   |
| `/llms.mdx/docs/**`   | 352   |
| Static routes and `/` | 8     |
| Total                 | 1061  |

The 352 is 349 live pages plus the three archives, and the markdown mirrors match it one for one
since FS-2711. The eight are `/`, `/_not-found`, `/_global-error`, `/llms.txt`, `/llms-full.txt`,
`/robots.txt`, `/sitemap.xml` and `/opengraph-image-<hash>`, the home page's social card
(FS-2713).

### The `/docs/*` 404 is a real page (FS-2688)

**`dynamicParams = false` is what gives an unknown `/docs` URL a visible body.** The slug is absent
from the generated param set, so Next answers 404 before rendering starts: the request lands on
Next's internal `/_not-found` entry and `app/not-found.tsx` is served as an ordinary prerendered
page, with the status set before any render happens.

What that replaced was not a styling problem. `notFound()` thrown from a **dynamically** rendered
page, outside a Suspense boundary, aborts the flight render, and Next discards the response in
favour of its hardcoded `<html id="__next_error__">` shell, which carries no visible body until
hydration. The status was 404 and the `noindex` was correct throughout, so nothing in CI or in a
header check ever noticed. The page was simply blank to crawlers and to any client without
JavaScript, and nearly every inbound 404 after cutover is expected to land under `/docs/`.

Verified by building and serving the production output:

```bash
pnpm build
# `pnpm start --port 3000` works too; only an explicit `pnpm start -- --port 3000` fails, with
# "Invalid project directory provided". CI reaches for `npx` for a different reason: backgrounded,
# `$!` would be the pnpm wrapper's PID and killing that orphans the server (ci.yml).
npx next start -p 3000
curl -sS -D - -o body.html http://localhost:3000/docs/does-not-exist
```

| URL                                              | Status | Bytes   | Body                          |
| ------------------------------------------------ | ------ | ------- | ----------------------------- |
| `/does-not-exist` (control)                      | 404    | 82,424  | full 404 page                 |
| `/docs/does-not-exist`                           | 404    | 82,424  | full 404 page, byte identical |
| `/docs/does/not/exist/deep`                      | 404    | 82,424  | full 404 page, byte identical |
| `/docs/run-a-node/start-here/v99`                | 404    | 82,424  | full 404 page, byte identical |
| `/docs/stylus/quickstart` (control)              | 200    | 526,891 | the page                      |
| `/docs/run-a-node/start-here/v1`                 | 200    | 386,107 | the archived page             |
| `/docs/does-not-exist` + `Accept: text/markdown` | 404    | 0       | empty, and deliberately so    |
| `/docs/does-not-exist.md`                        | 404    | 0       | empty, and deliberately so    |
| `/llms.mdx/docs/does-not-exist/content.md`       | 404    | 0       | empty, and deliberately so    |

The three HTML 404s carry the same `ETag` as `/does-not-exist` and diff clean against it, because
all four are one prerendered `/_not-found` response. Strip `<script>` blocks before grepping a body:
a **200** docs page also contains the 404 copy, inside the router's prefetched flight payload, which
is why `scripts/static-docs-http.test.ts` matches on `documentOnly(html)`.

**The three markdown shapes answer 404 with an empty body on purpose.** A client that asked for
`text/markdown` has no use for 82 KB of HTML chrome, and the reader-facing case, a browser following
a dead link, never takes that path. They are worth re-checking only if something starts linking to
`.md` URLs.

### Cache-Control, and why markdown negotiation carries `Vary: Accept`

A prerendered route serves `cache-control: s-maxage=31536000` with `x-nextjs-cache: HIT`, so docs
pages are now edge-cacheable where they previously carried
`private, no-cache, no-store, max-age=0, must-revalidate` on every request. The 404 response keeps
those no-store directives, being Next's own `/_not-found` output rather than ours.

That year-long `s-maxage` is why markdown negotiation carries `Vary: Accept`. `proxy.ts` rewrites an
`Accept: text/markdown` request for a docs URL onto that page's `/llms.mdx/**/content.md` path, so
one URL can answer either with HTML or with a markdown body a shared cache will hold for a year.
Under `next start` the cache keys on the rewritten path and the bare URL without the header still
returns HTML, so nothing leaked locally either way; the header is what keeps that true on a cache
that keys on the original URL instead. Next sets its own `Vary` on the app-page response, so
`patches/next@16.3.4.patch` turns that `setHeader` into `appendHeader`, which is what stops the
framework value overwriting the proxy's. **Vercel's edge keying for a proxy rewrite is a different
code path and has still not been confirmed on a preview.** Confirm it by fetching one docs URL with
and without the header against a preview deployment and checking that the bare one is still HTML.

### The accepted costs

- **A page added without a rebuild 404s rather than being stale**, and a failed build takes _new_
  pages offline. Existing pages keep serving the last good build. This is the direct consequence of
  `dynamicParams = false` and it is the trade the ticket accepted.
- **Build time and disk.** Roughly +25 s and +370 MB of `.next` against the pre-FS-2698 build (three
  interleaved cold builds each: 48.2/44.8/37.2 s and 653 MB before, 78.5/66.3/68.3 s and 1.0 GB
  after). The bought work is 352 page renders (349 live pages plus the three archives), 349 satori
  images and 349 markdown files that used to happen on first request.

**Do not count prerendered pages from the route table.** It never states the total: the parent line
prints bare as `/docs/[[...slug]]`, with no `●` marker at all, and the markers sit on three sample
child paths plus a `[+349 more paths]` line, so the count is only recoverable by adding the samples
to the remainder. An earlier shape of that same output produced the old "339 docs pages prerendered"
misreading and its correction. Count `.next/prerender-manifest.json`, or
`find .next/server/app/docs -name '*.html'`.

### What was tried and rejected

- **A Suspense boundary** (`app/docs/loading.tsx`) removes the error shell but answers **200**,
  which is worse than an empty 404.
- **`global-not-found`** never runs here: the `/docs/[[...slug]]` segment pattern still matches
  everything under `/docs`, so the URL is a matched route whose params were rejected, not an
  unmatched one.
- **Checking the slug in `proxy.ts`** needs the page list, and importing `lib/source` there takes
  the traced proxy closure from 1.70 MB to 28.26 MB with a 26.6 MB chunk on every cold start. A
  generated slug manifest instead is a feature whose failure mode is 404ing a live page.
- **`connection()` from `next/server`** was measured against the older dynamic shape and made every
  docs page a 500. It is a render-time bailout, so it could not stop a fallback shell being
  generated. It is history now that the route is static, and it is recorded here only so the
  experiment is not repeated.

### Two things that would regress this

**Reading `searchParams` in the page again.** That makes the route dynamic, which empties
`generateStaticParams` of effect and brings the `__next_error__` shell back with it. The two
tickets share one root cause and would come back together.

**Enabling Cache Components.** Next 16.0.0 removed `dynamic`, `dynamicParams`, `revalidate` and
`fetchCache` from the route segment config when `cacheComponents` is on, and exporting
`dynamicParams` then fails the build outright with "Route segment config `dynamicParams` is not
compatible with `nextConfig.cacheComponents`". The migration guide's replacement is to call
`notFound()` in the page for a param that does not resolve, which is precisely the shape that
produced the empty shell here, so enabling that flag is a migration for this route and not a flag
flip. `next.config.ts` does not set it today. If it ever does, re-run the curl recipe above before
believing the route still 404s visibly.

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
