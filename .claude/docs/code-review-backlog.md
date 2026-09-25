# Code review backlog

Findings from the 2026-08-21 codebase review (code smells, dead code, DRY) that were **not**
addressed at the time. Each was verified with a command when it was filed — re-verify before acting,
since the tree moves.

Already done, for context: `FloatingHoverModal` removal, the stale `scripts/codemods/` +
`scripts/fix-links.mjs` deletion, the `isPartial` unification, the four stub landing pages, and the
missing public-preview banner include.

## Decisions needed

### VanillaAdmonition vs Fumadocs `Callout`

Two parallel admonition implementations. `<VanillaAdmonition>` is used **440 times across 184
files**; Fumadocs' `Callout` is registered via `...defaultMdxComponents` and used **zero** times.

```
rg -o '<VanillaAdmonition' --glob '*.mdx' content/ | wc -l   # 440
rg -c '<Callout' --glob '*.mdx' content/                     # no matches
```

Either codemod the 440 call sites to `Callout` and delete
`components/mdx/VanillaAdmonition/` (~200 lines incl. CSS), or record in `components/mdx.tsx` that
`Callout` is deliberately unused surface. This is a migration, not a cleanup — don't start it
casually.

### 9 partials orphaned by the FloatingHoverModal deletion

`FloatingHoverModal` ESM-imported 18 partials. Nine of them (`*-pc.mdx`) are also `<include>`d by a
live `choose-*.mdx` page and stay reachable. The other nine had no second consumer:

```
content/partials/launch-arbitrum-chain/_config-account-abstraction.mdx
content/partials/launch-arbitrum-chain/_config-customizable-governance.mdx
content/partials/launch-arbitrum-chain/_config-data-posting-costs.mdx
content/partials/launch-arbitrum-chain/_config-dedicated-throughput.mdx
content/partials/launch-arbitrum-chain/_config-evm-compatibility.mdx
content/partials/launch-arbitrum-chain/_config-force-inclusion.mdx
content/partials/launch-arbitrum-chain/_config-hardware.mdx
content/partials/launch-arbitrum-chain/_config-l1-challenge-period.mdx
content/partials/launch-arbitrum-chain/_config-other-language-support.mdx
```

They had a static importer, but that importer never rendered: `FloatingHoverModal` was registered in
`components/mdx.tsx` and used by zero `.mdx` files, so the imports pulled this prose into the JS
bundle without ever displaying it. **No reader has ever seen it.** It is still prose, so deleting it
is a content call.

Verify with a literal search — a regex like `include[^>]*<basename>` silently matches nothing,
because `<include cwd>` contains a `>`:

```
rg -l -F '_config-hardware.mdx' content/ app components lib scripts \
  | grep -vE 'CATALOG.md|manifest.json|registry.json'
```

Also exclude `.claude/` when judging: `_config-evm-compatibility.mdx` and
`_config-l1-challenge-period.mdx` are _named_ in planning docs and `registry.json`, which render
nothing — counting those mentions as references undercounts the orphans.

Separately, `content/partials/launch-arbitrum-chain/_config-challenge-period-l1.mdx` (the
near-namesake) was already unreferenced before this deletion. `registry.json` asserts it is "not a
duplicate" of `_config-l1-challenge-period.mdx`, but that note tracks distinctness, not usage —
both are now dead.

Note `partials:check` has **no unused-partial rule**, so nothing catches this class.

### FAQStructuredData: port the data or delete the feature

`FAQ_MAP` resolves 1 of 6 call sites; the other 5 `console.warn` and return `null`, which also
swallows `FAQHashScroll`. Only `building-orbit-faqs.json` was ever ported.

```
rg -n --glob '*.mdx' 'FAQStructuredDataJsonLd' content   # 6 hits
ls components/mdx/FAQStructuredData/data/                # building-orbit-faqs.json
```

Either port the 5 missing datasets or delete the 5 no-op call sites. The dead `renderFaqs` prop and
its render branch (`index.tsx:34-43`, `types.ts:9`) go either way.

## Mechanical

### Content

- **Rust toolchain sentence duplicated in 6 Stylus pages** (`stylus/quickstart.mdx:28`,
  `cli-tools/overview.mdx:22`, `how-tos/using-constructors.mdx:29`, `importing-interfaces.mdx:32`,
  `trait-based-composition.mdx:25`, `fundamentals/testing-contracts.mdx:28`).
  `content/partials/stylus/_setup-rust-toolchain.mdx` exists but holds different text and is included
  by one page. Reconcile into one partial, pin the version in `content/vars.json`.
- **Duplicate card href** — `launch-arbitrum-chain/configuration/validation/index.mdx`: "Stake and
  validator configuration" and "Fast withdrawals" both point at `/validation/fast-withdrawals`. The
  only duplicate-href-within-one-`<Cards>` in the repo.
- **Dead `@site/` import block** — `run-a-node/troubleshooting.mdx:306-311`, a commented-out
  Docusaurus import of `_feed-relay-troubleshooting.md`. The only `@site/` reference left in
  `content/`. Port the partial or delete the block.
- **9 commented-out JSX blocks >100 chars.** Largest is 2,222 chars at
  `how-arbitrum-works/timeboost/how-to-use-timeboost.mdx:383`. An identical 427-char unfinished block
  with empty `- RAM:` / `- CPU:` placeholders sits in both
  `deploy-das.mdx:104` and `deploy-mirror-das.mdx:50` — those two could use the existing
  `_hardware-requirements.mdx`.
- **Duplicate sidebar titles** — `oracles/index.mdx` and `oracles/overview-oracles.mdx` are both
  titled "Oracles" (a legitimate hub/concept split, not duplication). Set `sidebar_label` on one.
- **Boilerplate descriptions** — many section landing pages carry `description: 'X documentation'`.
- **4 unreferenced `content/vars.json` keys** — `arbOneChainId`, `novaChainId`, `nitroDocsRepo`,
  `portalApplicationForm`. `vars:check` already reports these and exits 0 by design
  (`vars-audit.mjs:104`, "Informational only"), so this is a deliberate no-op unless you want them gone.

### Scripts

- **`walk()` reimplemented 5 times** (was 8 before the codemod deletion): `lib/nav.mjs:57`,
  `lib/partials.mjs:36` (exported, general form), `generate-legacy-redirects.mjs` (twice),
  `upstream-drift.mjs:35`. Keep `partials.mjs`'s and route the rest through it — **but
  `lib/partials.mjs` has no test and backs the blocking `partials:check` gate, so add one first.**
- **`'content/docs'` re-derived in 4 places under 3 different names** — `lib/doc-links.mjs`
  (`CONTENT_DIR`), `lib/partials.mjs` (`DOCS_DIR`), `versioned-docs-check.mjs` (`DOCS_ROOT`),
  `generate-legacy-redirects.mjs` (`CONTENT_DIR`). One `scripts/lib/paths.mjs`.
- **11 over-exported `scripts/lib/*` internals** referenced only inside their own module:
  `normalizeUrl` (doc-links); `REGISTRY_FILE`, `IMPORTER_ROOTS`, `deriveTitle`, `deriveSummary`,
  `deriveTags` (partials); `SECTION_MAP` (tree-compare); `VARS_TS`, `VARS_JSON` (vars-audit);
  `ADMONITION_TYPES` (content-lint); `StaleFileError` (generated-partial).
- **`lib/partials.mjs:272` re-exports `existsSync`/`readFileSync`/`statSync`/`path`** — importers
  should use `node:fs` directly.
- **No tests** for `lib/partials.mjs` (272 lines, backs a blocking gate) or `lib/generated-partial.mjs`.

### lib/ and app/

- **`lib/references.ts:30-35`** — the `route` field on `ReferenceCollection` is written but never
  read, and is the only reason `docsRoute` is imported. `const references` need not be exported.
- **`lib/reference-schema.ts`** — the module split is no longer load-bearing; its one consumer is
  `source.config.ts`, the file the split existed to keep it out of. Inline it beside
  `arbitrumPageSchema`. (Contrast `lib/versions-constants.ts`, whose split **is** load-bearing —
  `components/VersionSwitcher.tsx` is `'use client'`.)
- **`lib/versions.ts:7-8`** — re-exports `LATEST_LABEL` and `VersionOption`; neither has a consumer
  through this module.
- **`app/docs/[[...slug]]/page.tsx:84-85`** — the comment justifying `generateStaticParams`
  returning `[]` cites "~585 (195 pages × 3 locales)". i18n is gone and the corpus is 338 pages. The
  trade-off is real; only the arithmetic is stale.
- **`lib/layout.shared.tsx:19`** — an `eslint-disable-next-line` comment with no linter installed.

### components/

- **3 dead registry keys** in `components/mdx.tsx` — `AddressExplorerLink`, `FAQStructuredData`, and
  `Reference` are registered but no `.mdx` uses those names (the aliases `AEL`,
  `FAQStructuredDataJsonLd`, and `Term` carry all usage). `Reference` stays live via `Term.tsx`.
- **`components/mdx/PendingWidget.tsx:5-7`** — docstring lists `MultiDimensionalContentWidget` and
  `GenerateTroubleshootingReportWidget` as unported; both shipped as `components/mdx/Troubleshooting/`.
- **`components/mdx/Var/index.tsx:7`** — JSDoc example uses `latestNitroVersion`, a key that does not
  exist in `vars.json`.

### Docs

- **`README.md` "Layout" table is stale** — it still lists `app/[lang]/docs/`,
  `content/docs/<lang>/`, and describes `proxy.ts` as "i18n routing". i18n was removed 2026-08-18.
  The Inkeep section also points at `app/[lang]/layout.tsx`.
- **`CLAUDE.md`** references `content/docs/en/get-started/arbitrum-introduction.mdx` as the
  `ImageZoom` live example; that path no longer exists.

## Not defects (checked, cleared)

- `versioned-docs-check` text-parsing `lib/versions.ts`, and `redirects:check` reading `/llms.txt`
  off a running server — both documented constraints, not smells.
- Route-handler duplication: the `getPage` + `notFound()` shape appears in exactly 2 files, under the
  project's three-occurrence threshold.
- `AEL` → `AddressExplorerLink` and `ImageWithCaption` → `ImageZoom` are true aliases, one
  implementation each.
- `content/_versions/` is a deliberately non-routed archive.
- Zero orphan pages: all 338 pages resolve through their directory's `meta.json` (70 of 92 use the
  `"..."` wildcard). Zero dead glossary terms — `glossary.mdx` renders the whole collection.
- No repeated Tailwind class strings at 3+ occurrences; no unused imports anywhere in `lib/`, `app/`,
  or `components/`.
