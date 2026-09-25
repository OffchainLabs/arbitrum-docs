# Contributing to the Arbitrum docs

Thank you for considering a contribution to the Arbitrum documentation portal. This repo is a
Next.js 16 / Fumadocs site. It replaced the Docusaurus site at
[`OffchainLabs/arbitrum-docs`](https://github.com/OffchainLabs/arbitrum-docs), which is archived, and
the content model, tooling and gates are different enough that this document is a rewrite, not a
port, of that repo's `CONTRIBUTE.md`. If something here
conflicts with [README.md](README.md) or [INTERNALS.md](INTERNALS.md), those two are canonical —
this file exists to get a new contributor from zero to an open PR.

## Setup

```bash
pnpm install      # runs a postinstall that generates .source/
pnpm dev          # http://localhost:3000
```

Node `22.x` (`>=22.18 <23`, enforced by `engines`; every script is a `.ts` file Node runs directly) and pnpm 10. Other Node majors are rejected.

**Browse on `localhost:3000`, not `127.0.0.1`** — on `127.0.0.1` React does not hydrate and every
component looks broken, which is a common false alarm when checking a content change.

## Add or edit a page

Every non-partial `.mdx` page needs five frontmatter fields. A missing or invalid one fails the
build:

```mdx
---
title: 'How to run a full node'
description: One-line summary shown in search results and social cards.
content_type: 'how-to'
author: your-github-handle
sme: reviewing-sme-handle
---
```

`content_type` must be exactly one of: `how-to`, `concept`, `quickstart`, `tutorial`, `reference`,
`troubleshooting`, `faq`. Pick the type that matches what the reader is trying to do, not just
what feels closest — see [Document type conventions](#document-type-conventions) below. Optional
fields: `sidebar_label`, `user_story`, `draft`. `sidebar_label` becomes the page's name in the
sidebar, but only if the page has no explicit `name` in `lib/docs-navigation.json`; a manifest
`name` always wins over `sidebar_label`, and a page the manifest never names renders its
`sidebar_label`.

**If you are porting a page a legacy redirect is waiting for, retarget the redirect.** Two legacy
`docs.arbitrum.io` URLs in `redirects.config.ts` point at a section landing because the page they
asked for was never ported; each carries a comment saying so. Nothing automated notices when the
page lands, so if yours is that page, point its entry at your page in the same PR. If yours merely
shares the title (the upstream titles are short generic nouns such as "Sequencer"), leave the
redirect alone: sending readers to a page that is not the one they asked for is worse than the
landing page they reach today.

### Place your page in the sidebar

**Two files decide where a page appears, and you may need only one of them.**

`meta.json` in each content directory lists what that directory holds and in what order. Add your
new page's basename to its `pages` array. The array also supports `...` rest-globs,
`---Separator---` headings, `[text](url)` links to other sites, and `!exclude`.

`lib/docs-navigation.json` decides the sidebar a reader sees: the nine sections, the groups inside
them, the order, and the label on each entry. To give your page a place in a section's main menu,
add an entry to that section's `children`:

```json
{ "name": "Run a full node in Docker", "page": "/docs/run-a-node/nitro/docker-and-cli-binaries" }
```

Use `page` for a page the section owns. Use `href` for a link to a page another section owns, which
renders as a normal sidebar link and leaves the destination's own sidebar alone. Never write a
second `page` entry for a URL the manifest already claims, in your section or in any other:
`pnpm nav:check` fails on it. Two claims are easy to miss because they are not written in
`children`. Every section already shows its own landing page, so a `page` entry for
`/docs/<section id>` is one node too many, in that section or in any other; use `href` there, as Get
started does. And a `folder` entry pulls in every page under it, so a `page` entry naming one of
those is too. `buildDocsNavigation` throws on either,
which fails `pnpm dev`, `pnpm build` and `pnpm test`.

**Landing pages.** A folder's `index.mdx` that no entry claims goes to Additional guides like any
other page. Twenty-nine do today and they stay there by design; the reasoning is in
[INTERNALS](INTERNALS.md#pages-the-manifest-never-lists). To put one in the reading order, give its
group a `page` of its own:

```json
{
  "name": "Chain configuration",
  "page": "/docs/launch-arbitrum-chain/configuration",
  "children": []
}
```

**If you do nothing, your page still reaches the sidebar.** A page the manifest never lists is
appended to its section under **Additional guides**, keeping the label from its `sidebar_label`, or
its `title` if it has none. That is a reasonable home for a reference page. Add an entry when the
page belongs in the reading order.

**A new top-level section needs one thing**: its directory name in some section's
`sourceFolders` array in `lib/docs-navigation.json`. Miss it and your pages render above the
sections with no sidebar of their own; `pnpm nav:check` fails and names the directory. Do not add
`"root": true` to its `meta.json`, and do not copy one from an older directory: the sidebar
transformer decides which folders are roots, and no `meta.json` under `content/docs` carries that
flag any more.

**A new loose page at the top of `content/docs`** (beside `chain-info.mdx` and the other three)
needs a `"../your-page"` entry in `content/docs/resources/meta.json`, which is the directory those
four belong to. Without it the page renders above the sections too, and `pnpm nav:check` names it.

**Do not add a `[Title](/docs/…)` entry pointing at a page in this repo.** A link entry becomes a
real node in the content tree, so it overwrites that page's sidebar label and can drag the page into
your section. `pnpm nav:check` fails on it. Reference the page as `"../name"` from the one directory
that should hold it, or link to it with an `href` entry in the manifest.

Run `pnpm nav:check` after touching either file, and open the page at `http://localhost:3000` to see
where it landed. [The sidebar and its roots](INTERNALS.md#the-sidebar-and-its-roots) in INTERNALS
covers the rest of the manifest.

## Reuse a partial before you write new prose

Reusable `_`-prefixed fragments live in `content/partials/`, outside the routed doc tree so they
can never be served as their own page. **Before writing a banner, note, config table, or
troubleshooting block, search [`content/partials/CATALOG.md`](content/partials/CATALOG.md)**
(⌘F by intent — title, summary, tags) and reuse the partial instead of duplicating the prose. The
catalog gives you a copy-paste snippet for each entry.

```mdx
<!-- From a doc page: root-anchored, so moving the page later never breaks the include -->

<include cwd>content/partials/launch-arbitrum-chain/_raas-providers-notice.mdx</include>
```

```mdx
<!-- From another partial: MUST be file-relative, never cwd -->

<include>../_hardware-requirements.mdx</include>
```

The relative form is required inside a partial; a `cwd` include there crashes the build outside
the normal docs pipeline, and `pnpm partials:check` enforces the distinction.

If nothing in the catalog fits: create `content/partials/<area>/_your-partial.mdx` with no
frontmatter (`<include>` strips it), reference it, then run `pnpm partials:catalog` to regenerate
`CATALOG.md` and `manifest.json` — never hand-edit either. Optionally curate its title, summary,
and tags in `content/partials/registry.json`.

## Use a variable, don't hardcode a value

Values that move on a release cadence — version tags, chain parameters, node image names — live
once in [`content/vars.json`](content/vars.json) and render via `<Var name="..." />`, which needs
no import:

```mdx
The current Nitro release is <Var name="nitroVersionTag" />.
```

Inside a link destination, use a `{var:name}` placeholder rather than the component. A destination
may not contain a space, `<Var name="…" />` contains two, and the result is that the link does not
parse and the reader sees the literal `[text](…)` brackets:

```mdx
[Interface](https://github.com/OffchainLabs/{var:nitroRepositorySlug}/blob/{var:nitroVersionTag}/precompiles/ArbSys.go)
```

The same form works in an `href`, `to` or `src` attribute and in an internal `/docs/…`
destination. Everywhere else, prose and link text included, use the component: a placeholder in
prose fails the build. `pnpm content:lint` (rule A11) fails on a `<Var>` left in a destination.
After you edit a value in `vars.json`, restart `pnpm dev` or a link keeps showing the old one.

A link to a file in this repository takes the same treatment, with `docsRepositoryUrl` and
`docsRepositoryBranch`: write
`[Contribute]({var:docsRepositoryUrl}/blob/{var:docsRepositoryBranch}/CONTRIBUTE.md)` rather than
the URL. Those two values also build the edit link and the "Request an update" button, so one edit
moves every link home together, and `pnpm check-links` never resolves an external URL that would
catch a hardcoded one gone dead.

To change a value, edit `vars.json` and run `pnpm vars:check`. To add a **new** variable, add the
key to both `vars.json` **and** the `varsSchema` in `content/vars.ts` — miss either side and the
gate fails, because the schema is a strict object that would otherwise silently drop the key and
render the literal string `undefined` on every page that uses it.

## Move or rename a page

```bash
pnpm move-doc <from> <to>
```

This rewrites every internal link that pointed at the old path (in whatever form it was written —
absolute, relative, `.mdx`-suffixed, `<include>`), moves the file with `git mv`, updates the
surrounding `meta.json`, and records the redirect in `redirects.config.ts` for you. **Never
hand-edit between the `AUTO-GENERATED` markers in `redirects.config.ts`**, since `move-doc` owns that
block. Use `--dry-run` first to preview the changes, and confirm afterward with `pnpm check-links`.

`move-doc` also retargets every other entry in `redirects.config.ts` that pointed at the old URL,
including the legacy `docs.arbitrum.io` entries after the markers, so nothing chains, and removes
any entry that redirected away from the new URL, so nothing shadows the page. Those legacy
entries are hand-maintained: add one by editing the file directly, in source order, then prove the
destination with `pnpm redirects:check` against a running site.

## Gates to run before you push

```bash
pnpm types:check       # regenerates .source/, generates Next types, tsc --noEmit — the main gate
pnpm test              # node --test over the tooling scripts in scripts/
pnpm vars:check        # every <Var name> resolves
pnpm nav:check         # meta.json integrity, section coverage, navigation-manifest duplicates
pnpm partials:check    # includes resolve, no routing leak, catalog fresh
pnpm references:check  # glossary ids + <Reference> targets
pnpm check-links       # broken internal doc links and MDX fragments
```

These seven are the ones a content change usually trips. `.github/workflows/ci.yml`'s blocking
`Gates` job runs them alongside `versioned-docs-check.ts`, `faq:check`, `images:presence`,
`contracts:check`, `format:check` and `content:lint`.

`Build` runs `pnpm build` as a non-blocking CI job because remote images can fail for reasons
outside this repository. It can still reveal MDX compilation errors that `types:check` does not
catch. If you touched MDX with components, imports, or raw JSX, run `pnpm build` yourself before
you push and inspect its result. The build job does not serve pages or run HTTP checks.

A green PR does not by itself mean the content renders correctly: `types:check` proves the
frontmatter schema, not the render, and it exits 0 on a page that serves a literal `:::` or the
string `undefined`. **Always open a changed page on `http://localhost:3000` and confirm it looks
right**, in light and dark mode if you touched styling.

Two of those, `pnpm format:check` and `pnpm content:lint`, reported without blocking while they
still failed on pre-existing debt. Both reached zero on 2026-09-15 and moved into `Gates`, so a
finding in either now means your change introduced it. Run `pnpm format` on the files you touched
and `pnpm content:lint` over the tree before you push.

## Document type conventions

Pick the type that matches what the reader is trying to do:

| Content type    | Frontmatter value | Purpose                                                                            |
| --------------- | ----------------- | ---------------------------------------------------------------------------------- |
| How-to          | `how-to`          | Task-oriented procedural guidance                                                  |
| Concept         | `concept`         | Explains what something is and how it works                                        |
| Quickstart      | `quickstart`      | Fast onboarding with hands-on, step-by-step instructions for one specific audience |
| Tutorial        | `tutorial`        | A comprehensive, guided learning experience                                        |
| Reference       | `reference`       | Lists and tables of things, such as API endpoints, developer resources and flags   |
| Troubleshooting | `troubleshooting` | Common problem/solution scenarios                                                  |
| FAQ             | `faq`             | Frequently asked questions                                                         |

These seven types are the whole enum, so the schema accepts nothing else. The shape guidance here
isn't exhaustive: if you're unsure, look at an existing page of the type you think you're writing
and match its shape.

A gentle introduction is a `concept` page for readers who need foundational context before a task.
Use it when several audiences need the same starting point, as in the Arbitrum introduction.

## Style conventions

These are the minimum guidelines for new content going forward; a lot of existing content
predates them and gets brought up to spec incrementally, not all at once.

1. **Sentence case.** Capitalize titles, headers, and sidebar labels like a sentence — "Deploy your
   smart contract", not "Deploy Your Smart Contract".
2. **Descriptive link text.** Never anchor a link to "here" or "this" — link text should describe
   the destination, so a reader skimming links alone still understands the page. When linking to
   another doc, use that doc's title verbatim.
3. **Separate procedural from conceptual.** A how-to or quickstart should carry only the
   conceptual detail the reader needs to finish the task at hand; put broader conceptual material
   in a `concept` page and link to it "just in case."
4. **Write for a specific reader.** Don't try to write for everyone. State your assumptions about
   the reader's prior knowledge near the top of the page.
5. **Lead with what matters.** Put the outcome or the value to the reader first, then build toward
   task completion — don't bury the point.
6. **American English, plain language, short sentences.** Address the reader as "you"; contractions
   are fine; avoid jargon your target reader won't recognize.
7. **Never put a link in a heading.** Fumadocs wraps every heading in its own anchor, so a link
   inside one renders an anchor inside an anchor and breaks React hydration on the page. Keep the
   heading as plain text and put the link in the prose under it. `pnpm content:lint` rule A8 is a
   blocking gate on this, alongside A9 (a hand-written `<p>` around block content), A10 (a `<tr>`
   outside a `<thead>`/`<tbody>`) and A11 (a `<Var>` in a link destination, which leaves no link at
   all); see [The content-lint rules](INTERNALS.md#the-content-lint-rules).

The long version lives in [STYLE-GUIDE.md](STYLE-GUIDE.md), at the root of this repo: the
plain-language rules in testable form, the words and phrases to replace or cut, the
one-term-one-meaning table, the terminology table, and the glossary-linking convention. It is the
house editorial standard, it is maintained here, and it is the file to read before a first draft
and before a review.

## Opening a pull request

Fill in the [PR template](.github/pull_request_template.md) — it asks for a description, the
document type, and a checklist mirroring the gates above. Branch from `main` and open the PR
against `main`. Every push runs CI; check the `Gates` job before requesting review.

## Third-party content

Docs that help readers use another product, service, or protocol alongside Arbitrum (rather than
docs about Arbitrum itself) are third-party content. We generally don't accept promotional
material — a page needs to give the reader actionable guidance, not just describe a product. If
you're not sure whether your contribution counts as third-party content, ask before you write a
full draft.
