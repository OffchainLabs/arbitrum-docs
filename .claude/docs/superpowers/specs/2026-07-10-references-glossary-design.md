# Generic References system (glossary as first consumer) — design

Date: 2026-07-10
Status: implemented (branch `glossary-port`, stacked on `partials-registry`)

## Problem

Fumadocs has no built-in glossary — and no tooltip/hover-card primitive either. The Docusaurus
implementation (per-term files → `build-glossary.ts` → `glossary.json` + a global Tippy.js component
scanning the DOM for hand-written `<a data-quicklook-from>` links) has a sound architecture but
several traits not worth porting: manual, build-time-_unvalidated_ tagging (silent runtime warns on
typos), a Tippy dependency, pre-rendered HTML strings in JSON (definitions can't use MDX), and a
bespoke build script.

The ported content already contains **347 `data-quicklook-from` links across 62 files** that
currently do nothing (no reader, no data).

## Approach

Build a general **References** system — inline hover-references backed by typed content collections —
and make the glossary its first consumer. Adding a future reference type (precompiles, config params,
contract addresses) is a collection + one registry entry; no new component, generator, or validator.

### 1. Reference collections + registry

- A shared base Zod schema in `source.config.ts`: `{ id, title, sortAs? }`. Each reference collection
  extends it via `defineCollections({ type: 'doc' })`. Glossary: `content/glossary/*.mdx` (body = the
  definition, real MDX). These files are a separate collection, so they do **not** carry the docs
  page frontmatter contract (title/description/content_type/author/sme).
- A single registry, `lib/references.ts`: name → `{ source: loader(...), route? }`, plus
  `getReference(collection, id)` and `listReferences(collection)`. The generic component, list, and
  validator all read this registry.

### 2. HoverPopover primitive

Extract the `@floating-ui/react` interaction shell from `FloatingHoverModal` into a generic client
`components/HoverPopover.tsx` (`{ trigger, children | content }`, hover/focus/dismiss/portal).
`FloatingHoverModal` is refactored to consume it (one copy of the interaction logic).

### 3. `<Reference>` (server) + `<Term>` alias

- `components/mdx/Reference.tsx` is a **server component**: `<Reference collection="glossary"
id="dapp">text</Reference>` looks the entry up in the registry, renders its title + MDX body on the
  server, and passes that node as the popover content to the client `HoverPopover`. No generated
  index module and no client bundle of all definitions — each page only carries the terms it cites.
- `components/mdx/Term.tsx`: `<Term id="dapp">text</Term>` = `<Reference collection="glossary" …>`.
- Both registered in `components/mdx.tsx`. If an `id` is missing, `<Reference>` renders the text
  plainly and (in dev) warns — but `references-check` fails the build first.

### 4. `<ReferenceList>` + glossary page

`components/mdx/ReferenceList.tsx` (server): `<ReferenceList collection="glossary" />` renders every
entry sorted by `sortAs`, each with an `#id` anchor. The glossary page
`content/docs/en/glossary.mdx` is just that component — no generated content artifact.

### 5. Validation

`scripts/references-check.mjs` (sibling to `partials-check.mjs`): every `<Reference>`/`<Term>` in
`content/**` resolves to a real collection id; ids are unique per collection; every reference
collection is registered. Fails the build — replacing the old silent runtime warn. Wired as
`pnpm references:check`.

## Glossary instance (concrete work)

- **Migrate 136 terms** from the Docusaurus source `docs/partials/glossary/_*.mdx` into
  `content/glossary/<id>.mdx` (drop the leading `_`), reshaping frontmatter `key→id`,
  `titleforSort→sortAs`, keep `title`.
- **Codemod** `scripts/migrate-quicklooks.mjs` over `content/**`:
  - Normal flow: `<a data-quicklook-from="key">text</a>` → `<Term id="key">text</Term>`. Handles
    double/single quotes and the stray-space variant (`= "key"`).
  - **Nested in a string attribute** (e.g. `<VanillaAdmonition title="… <a
data-quicklook-from=&quot;key&quot;>text</a> …">`): a JSX component can't live inside a string
    attribute, so these are unwrapped to their plain text label and **each occurrence is reported**
    (no silent loss of a working hover — this is a knowingly accepted degradation for term links
    buried in callout titles).

## i18n

English-only entries now (`content/glossary/`). Per-locale terms + en-fallback are a documented
future extension, consistent with the partials `neutral/localized` stance. Only `en` content is
substantially ported today.

## Non-goals

- No auto-linking (first-occurrence detection) — manual `<Term>` only, matching current behavior.
- No term translation yet.

## Verification

`pnpm references:check` passes; `pnpm types:check` and `pnpm build` succeed; the glossary page renders
all terms; a `<Term>` shows its definition on hover. The 136-term migration and 347-link codemod are
one-shot scripts, validated by resetting and re-running where practical.
