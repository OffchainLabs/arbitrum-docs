# Contributing to the Arbitrum docs

Thank you for considering a contribution to the Arbitrum documentation portal. This repo is a
Next.js 16 / Fumadocs site. It replaced the Docusaurus site at
[`OffchainLabs/arbitrum-docs`](https://github.com/OffchainLabs/arbitrum-docs), which is archived, and
the content model, tooling and gates are different enough that this document is a rewrite, not a
port, of that repo's `CONTRIBUTE.md`. If something here
conflicts with [README.md](README.md) or [INTERNALS.md](INTERNALS.md), those two are canonical.
This file exists to get a new contributor from zero to an open PR.

## Setup

```bash
pnpm install      # runs a postinstall that generates .source/
pnpm dev          # http://localhost:3000
```

Node `22.x` (`>=22.18 <23`, enforced by `engines`; every script is a `.ts` file Node runs directly) and pnpm 10. Other Node majors are rejected.

**Browse on `localhost:3000`, not `127.0.0.1`.** On `127.0.0.1` React does not hydrate and every
component looks broken, which is a common false alarm when checking a content change.

If you write with Claude Code, expect its first edit to a page or partial in a session to be
refused: a project hook (`.claude/settings.json`) returns `STYLE-GUIDE.md` as the reason so the
guide is in context, and every later edit in that session goes through.

## Add or edit a page

Every page needs a `title` and a `description` in its frontmatter. A missing one fails
`pnpm frontmatter:check` and the build:

```mdx
---
title: 'How to run a full node'
description: One-line summary shown in search results and social cards.
content_type: how-to
author: your-github-handle
sme: reviewing-sme-handle
---
```

The other fields are optional. `content_type`, when set, must be exactly one of `how-to`,
`concept`, `quickstart`, `tutorial`, `reference`, `troubleshooting`, `faq`. Pick the type that
matches what the reader is trying to do, not just what feels closest. See
[Document type conventions](#document-type-conventions) below. `author` and `sme` name the writer
and the subject-matter reviewer. `sidebar_label` replaces the title as the page's name in the
sidebar.

Callouts use Fumadocs' `<Callout>` component, with `type` set to `info`, `warn`, `error`, `idea`
or `success`. A Docusaurus `:::note` line renders as plain text and fails `pnpm content:lint`.

```mdx
<Callout type="info" title="Optional title">
  The callout body.
</Callout>
```

**If you are porting the page a legacy redirect is waiting for, retarget the redirect.** One legacy
`docs.arbitrum.io` URL in `redirects.config.ts` points at a section landing because the page it
asked for, upstream's "Sequencer" page, was never ported. It carries a comment saying so. Nothing
automated notices when the page lands, so if yours is that page, point its entry at your page in
the same PR. If yours merely shares the title, leave the redirect alone: sending readers to a page
that is not the one they asked for is worse than the landing page they reach today.

### Place your page in the sidebar

**A page's directory is its place in the sidebar, and that directory's `meta.json` orders it.**
Nothing else decides the sidebar.

Each of the nine sections is a top-level directory under `content/docs` whose `meta.json` sets
`"root": true`. The navbar picks the section, and the sidebar shows the tree of the section folder
the current page sits in. A subdirectory is a collapsible group in that tree, titled by the
`title` in its own `meta.json`. A subdirectory's `index.mdx` is what opens when a reader clicks the
group's name.

To add a page, put the `.mdx` file in the directory where it belongs and add its basename to the
`pages` array of that directory's `meta.json`, in the position you want:

```json
{
  "title": "Sequencer",
  "pages": ["run-sequencer-node", "read-sequencer-feed", "your-new-page", "..."]
}
```

`"..."` lists every page and folder the array does not name yet, pages before folders, each sorted
by file name. Most directories end with it, so a page you forget to list still appears, at the end
of its group. Not all do: a page dropped into a directory whose `meta.json` has no `"..."` is
absent from the sidebar, and only `pnpm test` says so. To see which directories those are:

```bash
grep -L '"\.\.\."' $(find content/docs -name meta.json)
```

The `pages` array also accepts these entries:

- **A subdirectory name**, such as `"sequencer"`, places that whole group.
- **A path into another directory**, such as `"../oracles/overview-oracles"`, shows that page
  here without moving it or changing its URL. List each page in exactly one `meta.json`. When two
  files list the same page, the one Fumadocs reads first silently wins.
- **`"...nitro"`** lists the pages of the `nitro` subdirectory directly, without a group.
- **`"external:[Label](https://example.com)"`** adds a link to another site.
- **`"---Heading---"`** adds a heading between entries.

The sidebar name is the page's `sidebar_label`, or its `title` when it has none.

Never write a `[Label](/docs/...)` link entry for a page in this repository. It puts the page in
the tree a second time, and the reader lands in whichever section Fumadocs finds first. Use a path
entry instead. Links to other sections are not needed at all, because the navbar lists every section
and the sidebar footer pins Chain info, Glossary and Contribute under every section.

A new top-level directory needs `"root": true` in its `meta.json` and an entry in
`content/docs/meta.json`. A new page at the top of `content/docs`, beside `chain-info.mdx`, needs a
`"../your-page"` entry in the `meta.json` of the section that should show it.

`pnpm test` fails when a page is on no sidebar node, is on two, or sits outside every section, and
names the page and the change to make. The page renders at its URL either way, so a browser check
means looking for it in the sidebar, not opening it.

## Reuse a partial before you write new prose

Reusable `_`-prefixed fragments live in `content/partials/`, outside the routed doc tree so they
can never be served as their own page. **Before writing a banner, note, config table, or
troubleshooting block, look in `content/partials/`** and reuse a partial instead of duplicating the
prose. File names say what each one holds.

```mdx
<!-- From a doc page: root-anchored, so moving the page later never breaks the include -->

<include cwd>content/partials/_hardware-requirements.mdx</include>
```

```mdx
<!-- From another partial: file-relative -->

<include>../_hardware-requirements.mdx</include>
```

If nothing fits, create `content/partials/<area>/_your-partial.mdx` with no frontmatter and include
it. `pnpm check-links` reports a missing include with the including page and its line, checks every
`/docs/…` link written inside the partial (and inside every glossary entry) against the page index,
and validates the partial's `#anchors` once for every page that includes it. A relative link inside
a partial is not checked, so write partial links root-absolute.

## Use a variable, don't hardcode a value

Values that move on a release cadence (version tags, chain parameters, node image names) live
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
prose fails the build. `pnpm content:lint` (rule `var-in-link`) fails on a `<Var>` left in a
destination.
After you edit a value in `vars.json`, restart `pnpm dev` or a link keeps showing the old one.

A link to a file in this repository takes the same treatment, with `docsRepositoryUrl` and
`docsRepositoryBranch`: write
`[Contribute]({var:docsRepositoryUrl}/blob/{var:docsRepositoryBranch}/CONTRIBUTE.md)` rather than
the URL. Those two values also build the edit link and the "Request an update" button, so one edit
moves every link home together, and `pnpm check-links` never resolves an external URL that would
catch a hardcoded one gone dead.

To change a value or add a new one, edit `vars.json` and run `pnpm vars:check`. No other file
changes. The check fails on a name that `vars.json` does not hold, which would otherwise render the
literal string `undefined`.

## Components

Every component below is registered globally in `components/mdx.tsx`, so a page never needs an
`import` line. Copy the form you need; each is written the way the lint rules expect it (a
component on its own lines, with a blank line before and after, and markdown inside it separated
by blank lines).

| Need                     | Write                                                                 | Notes                                                                                             |
| ------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Note or warning box      | `<Callout type="info" title="…">`                                     | `type` is `info`, `warn`, `error`, `idea` or `success`; the title is plain text, no markdown      |
| Glossary hover           | `<Term id="dapp">decentralized app</Term>`                            | `id` is the glossary entry's id; once per file, first mention. Works inside partials              |
| A value from `vars.json` | `<Var name="nitroVersionTag" />`, or `{var:nitroVersionTag}` in a URL | See [Use a variable](#use-a-variable-dont-hardcode-a-value)                                       |
| Reusable fragment        | `<include cwd>content/partials/_x.mdx</include>`                      | See [Reuse a partial](#reuse-a-partial-before-you-write-new-prose)                                |
| Card grid                | `<Cards><Card title href description /></Cards>`                      | `href` is a `/docs/…` path or an external URL                                                     |
| Tabs                     | `<Tabs items={['A', 'B']}><Tab value="A">…</Tab></Tabs>`              | `value` must match an entry in `items`; never `defaultValue={null}`                               |
| Collapsible              | `<Accordions><Accordion title="…">…</Accordion></Accordions>`         | The Docusaurus `<details>` form                                                                   |
| Numbered steps           | `<Steps><Step>…</Step></Steps>`                                       | Registered globally; no import                                                                    |
| Explorer-linked address  | `<AEL address="0x…" chainID={42161} />`                               | The address must be EIP-55 checksummed or the page throws                                         |
| Image with caption       | `<figure>` + markdown image + `<figcaption>`                          | See the example below                                                                             |
| Wide image               | `data-wide` on the image                                              | Prose images are capped at 600px; see [Image sizing](#image-sizing)                               |
| Remote image             | `<ImageZoom><img src="https://…" alt="…" /></ImageZoom>`              | A markdown image with a remote src renders broken; prefer committing the file under `public/img/` |
| Dense table              | `<table className="small-table">` with `<thead>` and `<tbody>`        | Smaller type and padding; a `<tr>` directly in `<table>` breaks hydration                         |
| Math                     | `$$ … $$`                                                             | KaTeX, unchanged from Docusaurus                                                                  |

Callout:

```mdx
<Callout type="warn" title="Before you start">
  Fund the batch poster account first.
</Callout>
```

Tabs, with markdown inside each tab separated by blank lines:

```mdx
<Tabs items={['Arbitrum One', 'Your Arbitrum chain']}>
<Tab value="Arbitrum One">

The chart defaults to Arbitrum One, so a node needs only three values.

</Tab>
<Tab value="Your Arbitrum chain">

Set `chain.id` and `parent-chain.id` to your chain's values.

</Tab>
</Tabs>
```

Accordion:

```mdx
<Accordions>
<Accordion title="Rust toolchain">

Follow the instructions on the Rust installation page.

</Accordion>
</Accordions>
```

Steps:

```mdx
<Steps>
<Step>

**Learn Rust basics.** Work through the first ten chapters of the Rust book.

</Step>
<Step>

**Write a contract.** Start from the quickstart.

</Step>
</Steps>
```

Cards:

```mdx
<Cards>
  <Card title="Get started" href="/docs/get-started" description="Quickstarts and guides." />
  <Card title="Run a node" href="/docs/run-a-node" description="Node operator docs." />
</Cards>
```

Address explorer link, in a table cell or in prose:

```mdx
<AEL address="0xB90e53fd945Cd28Ec4728cBfB566981dD571eB8b" chainID={42161} />
```

Image with a caption. The image sits on its own line between blank lines so MDX reads it as
markdown rather than as JSX text:

```mdx
<figure>

![Nitro support windows](/img/nitro-support-policy.png)

<figcaption>Nitro support windows</figcaption>
</figure>
```

### Image sizing

A markdown image renders through `ImageZoom` at its file's intrinsic size, capped by
`app/global.css` at 600px wide inside prose, so a phone screenshot no longer fills the column. That
cap replaces the Docusaurus `img-400px`, `img-600px` and `img-900px` classes, which no stylesheet
defines here. For a diagram that needs the full column, add `data-wide` to the image:

```mdx
<ImageZoom>
  <img src="/img/haw-transaction-lifecycle.svg" alt="Transaction lifecycle" data-wide />
</ImageZoom>
```

There is no per-image width. If a diagram is unreadable at 600px, it is a wide image; if it is
unreadable at the full column, redraw it.

## Move or rename a page

```bash
pnpm move-doc <from> <to>
```

This rewrites every internal link that pointed at the old path (in whatever form it was written:
absolute, relative, `.mdx`-suffixed, `<include>`), moves the file with `git mv`, updates the
surrounding `meta.json`, and records the redirect in `redirects.config.ts` for you. **Never
hand-edit between the `AUTO-GENERATED` markers in `redirects.config.ts`**, since `move-doc` owns that
block. Use `--dry-run` first to preview the changes, and confirm afterward with `pnpm check-links`.

`move-doc` touches no other redirect. If an older entry pointed at the old URL, it now chains, and
`pnpm test` fails and names it. Retarget that entry by hand. The legacy `docs.arbitrum.io` entries
after the markers are hand-maintained: add one by editing the file directly, in source order, and
run `pnpm test`. Deleting a page is not a move, so write its redirect by hand in the same PR.

## Gates to run before you push

```bash
pnpm frontmatter:check # every page's frontmatter satisfies the schema (title, description, content_type)
pnpm types:check       # regenerates .source/, generates Next types, tsc --noEmit
pnpm test              # tooling tests, including the sidebar tree and redirects
pnpm vars:check        # every <Var name> and {var:name} resolves
pnpm references:check  # every <Term id> resolves
pnpm check-links       # broken internal doc links and MDX fragments
pnpm content:lint      # MDX that compiles but renders wrong
pnpm format            # prettier, in place (CI runs format:check)
```

These are the ones a content change usually trips. The `Gates` job in `.github/workflows/ci.yml`
runs them all, plus `contracts:check`. A second job runs `pnpm build`, serves the result, and checks
it over HTTP. Both block. There is no pre-commit hook, so nothing runs on `git commit`.

If you touched MDX with components, imports or raw JSX, run `pnpm build` yourself before you push.
It catches a page that compiles but throws while rendering, which no gate above does.

A green PR does not by itself mean the content renders correctly: `frontmatter:check` proves the
schema and `types:check` proves the types, not the render, and both exit 0 on a page that serves a
literal `:::` or the string `undefined`. **Always open a changed page on `http://localhost:3000`
and confirm it looks right**, in light and dark mode if you touched styling.

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

1. **Sentence case.** Capitalize titles, headers, and sidebar labels like a sentence: "Deploy your
   smart contract", not "Deploy Your Smart Contract".
2. **Descriptive link text.** Never anchor a link to "here" or "this". Link text should describe
   the destination, so a reader skimming links alone still understands the page. When linking to
   another doc, use that doc's title verbatim.
3. **Separate procedural from conceptual.** A how-to or quickstart should carry only the
   conceptual detail the reader needs to finish the task at hand; put broader conceptual material
   in a `concept` page and link to it "just in case."
4. **Write for a specific reader.** Don't try to write for everyone. State your assumptions about
   the reader's prior knowledge near the top of the page.
5. **Lead with what matters.** Put the outcome or the value to the reader first, then build toward
   task completion. Don't bury the point.
6. **American English, plain language, short sentences.** Address the reader as "you"; contractions
   are fine; avoid jargon your target reader won't recognize.
7. **Never put a link in a heading.** Fumadocs wraps every heading in its own anchor, so a link
   inside one renders an anchor inside an anchor and breaks React hydration on the page. Keep the
   heading as plain text and put the link in the prose under it. `pnpm content:lint` rule
   `link-in-heading` is a blocking gate on this, alongside `tr-in-table` (a `<tr>` outside a
   `<thead>`/`<tbody>`) and `var-in-link` (a `<Var>` in a link destination, which leaves no link at
   all). See [The content-lint rules](INTERNALS.md#the-content-lint-rules).

The long version lives in [STYLE-GUIDE.md](STYLE-GUIDE.md), at the root of this repo: the
plain-language rules in testable form, the words and phrases to replace or cut, the
one-term-one-meaning table, the terminology table, and the glossary-linking convention. It is the
house editorial standard, it is maintained here, and it is the file to read before a first draft
and before a review.

## Opening a pull request

Fill in the [PR template](.github/pull_request_template.md). It asks for a description, the
document type, and a checklist mirroring the gates above. Branch from `master` and open the PR
against `master`. Every push runs CI; check both jobs before requesting review.

## Third-party content

Docs that help readers use another product, service, or protocol alongside Arbitrum (rather than
docs about Arbitrum itself) are third-party content. We generally don't accept promotional
material. A page needs to give the reader actionable guidance, not just describe a product. If
you're not sure whether your contribution counts as third-party content, ask before you write a
full draft.
