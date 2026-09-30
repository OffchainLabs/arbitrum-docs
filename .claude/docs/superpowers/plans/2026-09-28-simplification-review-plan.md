# Review plan: `fionna/fumadocs-migration` against `fumadocs`

Date: 2026-09-28. Author: Fionna, with Claude.

## 1. What is being reviewed

- Base: `fumadocs` at `0afea2181`. The merge base equals the tip of `fumadocs`, so the branch is
  exactly two commits ahead: `c90021017 add latest changes` (a squash of the whole migration) and
  `1e1d897c6 Remove the postinstall git history fetch`.
- Size: 569 files, about 44,000 lines added and 16,400 removed.
- Baseline at HEAD: `pnpm test` passes (602 tests, 6 skipped, 31 files) and `pnpm types:check`
  passes. So this review is about shape and cost, not about broken behavior.

Where the lines went (added / removed):

| Area                                            | Files | Added  | Removed |
| ----------------------------------------------- | ----- | ------ | ------- |
| `scripts/lib/`                                  | 61    | 9,965  | 4,466   |
| `scripts/*.ts` (commands and tests)             | ~45   | ~7,000 | ~3,500  |
| Root (INTERNALS, redirects, configs, lockfile)  | 31    | 6,974  | 3,672   |
| `public/` (mostly one 5,004-line JSON snapshot) | 49    | 6,517  | 0       |
| `components/mdx/`                               | 32    | 6,214  | 24      |
| `content/docs/`                                 | 231   | 2,587  | 2,261   |
| `lib/`                                          | ~20   | ~3,300 | ~150    |
| `app/`                                          | ~17   | ~1,900 | ~250    |

Size of the codebase at HEAD, which is what the review has to shrink:

| Surface                                                 | Lines            | Note                                                         |
| ------------------------------------------------------- | ---------------- | ------------------------------------------------------------ |
| `scripts/` + `scripts/lib/`                             | 17,700           | 33 commands, 31 test files, 62 `package.json` script entries |
| `components/`                                           | 9,080            | 2,337 of them in one component used on one page              |
| `lib/`                                                  | 3,286            | 1,407 of them are the sidebar manifest JSON                  |
| `app/`                                                  | 1,945            | 712 of them `global.css`                                     |
| Non-Tailwind CSS                                        | 1,690            | `global.css` plus 5 component CSS files                      |
| INTERNALS.md + CLAUDE.md                                | 40,000 words     | 66 + 15 ticket references                                    |
| Comment lines in `lib/`, `proxy.ts`, `source.config.ts` | 40 to 53 percent | measured per file                                            |

## 2. Review criteria

Every change on the branch is judged against these six questions. A change that fails one is a
candidate for simplification, and the review records which question it failed.

1. **Writers touch only `content/`.** Can a technical writer add, move, rename, reorder, or archive
   a page, add a callout, a variable, a glossary term, or an FAQ, without opening a `.ts`, `.tsx`,
   `.css`, or `lib/*.json` file? Where the answer is no, name the file they must touch.
2. **Built-in before custom.** Does Fumadocs, Next.js, or Tailwind already do this? A custom
   component, plugin, script, or patch has to name the built-in it replaces and why the built-in
   was not enough.
3. **Tailwind, not stylesheets.** Is styling expressed as Tailwind utilities on React elements? CSS
   modules, hand-written CSS files, and `global.css` overrides of Fumadocs internals are debt
   unless they style something Tailwind cannot reach.
4. **Every gate earns its place.** For each script and CI step: what defect does it catch, has that
   defect happened, does another tool already catch it, and what does it cost to keep?
5. **Code explains the present, git explains the past.** Comments and docs describe what the code
   does now. Ticket numbers, measurements from past experiments, and rejected alternatives belong
   in commit messages and PR descriptions, not in source files or INTERNALS.md.
6. **No scaffolding left behind.** Migration tooling, review notes, snapshots of the old repo, and
   documents describing the migration itself are removed once the migration lands.

## 3. Review tracks

Each track lists what to read, what to check, the simplification candidates found during scoping,
and the decision the track ends with. Candidates are labelled **remove**, **replace**, **shrink**,
or **keep**, as a starting position to confirm or overturn during the review.

### Track A. Repository hygiene (criterion 6)

Read: the repo root, `.claude/docs/`, `dependencies.json`, `public/data/`.

Check:

- Four `code-review-fionna-fumadocs-migration*.md` files sit at the repo root, committed. They are
  review notes about this very branch. **Remove.**
- `dependencies.json` is a 55-line verbatim snapshot of the old repo's release ledger. Its own note
  says nothing reads it. **Remove.**
- `.claude/docs/code-review-backlog.md` and the eight specs and five plans under
  `.claude/docs/superpowers/` describe the migration as it happened. Decide which are still design
  records worth keeping and which are done work. Likely **remove** most; keep at most the
  partials, references, and versioning designs if those features survive Tracks D and G.
- `public/data/edge-challenge-flow.json` (5,004 lines) is a chain-state snapshot for one widget on
  one page. Its fate follows the widget's fate in Track D.
- `public/img/undraw_docusaurus_*.svg` (3 files) are Docusaurus template art. Confirm nothing
  references them, then **remove**.
- The migration scripts were deleted on this branch (49 `.mjs` files: replay-prs, upstream-drift,
  reconstruct-history, migrate-\*, and so on). Confirm no `package.json` script or doc still names
  one. **Keep the deletion.**

Decision: a list of files to delete in one PR.

### Track B. Writer workflow (criterion 1)

Read: `CONTRIBUTE.md` sections "Add or edit a page" and "Place your page in the sidebar",
`source.config.ts`, `content/vars.ts`, `lib/versions-constants.ts`,
`components/mdx/FAQStructuredData/data/`.

Walk each writer task and record which files it needs today:

| Writer task                                    | Files touched today                                      | Non-content file? |
| ---------------------------------------------- | -------------------------------------------------------- | ----------------- |
| Add a page to a section's reading order        | `.mdx`, `meta.json`, `lib/docs-navigation.json`          | yes               |
| Add a page that may sit in "Additional guides" | `.mdx`, `meta.json`                                      | no                |
| Rename or move a page                          | `pnpm move-doc` writes `redirects.config.ts`             | yes, via script   |
| Archive a version of a page                    | `content/_versions/…`, `lib/versions-constants.ts`       | yes               |
| Add a global variable                          | `content/vars.json`, `content/vars.ts` (Zod schema)      | yes               |
| Add or edit an FAQ                             | `components/mdx/FAQStructuredData/data/*.json`, the page | yes               |
| Add a glossary term                            | `content/glossary/*.mdx`                                 | no                |
| Change the top navbar                          | `lib/layout.shared.tsx`                                  | yes               |
| Change the home page cards                     | `app/(home)/page.tsx`                                    | yes               |
| Change the sidebar footer links                | `lib/shared.ts`                                          | yes               |
| Change the announcement banner                 | `content/vars.json`                                      | no                |

Check the frontmatter contract. Five fields are required on all 352 pages (`title`,
`description`, `content_type`, `author`, `sme`) and `user_story` is on 160. Nothing in `app/`,
`lib/`, or `components/` reads `content_type`, `author`, `sme`, `user_story`, or `draft`
(measured: the only matches are in comments). A required field nothing renders is a build failure
waiting for a writer with no benefit to a reader.

Candidates:

- **Shrink** the schema to what is rendered: `title`, `description`, optional `sidebar_label`.
  Keep `content_type` only if the team wants it as an editorial convention, and then make it
  optional. Drop `author`, `sme`, `user_story`, `draft` from the schema; leave existing values in
  place since Fumadocs ignores unknown keys, or strip them in the same PR.
- **Replace** `content/vars.ts` Zod schema with a plain JSON read plus the two rules that matter
  (announcement id shape, announcement link resolves). Writers then add a key with no TS edit.
- **Replace** FAQ JSON under `components/` with FAQ content written in the page as MDX
  (Fumadocs `Accordions`), and either generate JSON-LD from the page's headings or drop JSON-LD.
  This removes `faq:check`, `scripts/lib/faq-data.ts`, and the `faqsId` indirection.
- Navbar, home cards, and sidebar footer links: decide whether these move to a JSON or MDX
  file under `content/`. Low urgency, these change rarely.

Decision: the new frontmatter contract and which writer tasks must become content-only.

### Track C. Navigation model (criteria 1, 2)

This is the largest single decision. Two systems currently decide the sidebar: 94 `meta.json`
files (Fumadocs native) and `lib/docs-navigation.json` (1,407 lines, 241 page entries, 39 hrefs,
53 nested groups), applied by `lib/docs-navigation.ts` (229 lines) and
`lib/docs-navigation-rules.ts` (156 lines), checked by `scripts/nav-check.ts` (169 lines),
`scripts/lib/nav.ts` (461 lines), and 950 lines of tests. About 3,400 lines exist to override what
`meta.json` already expresses, and `CONTRIBUTE.md` spends 60 lines warning writers about the ways
the two systems collide (duplicate claims, landing claims, link entries stealing roots).

Read: `lib/docs-navigation.ts`, `lib/docs-navigation.json`, the CONTRIBUTE section, and the
Fumadocs page-tree docs at https://www.fumadocs.dev/llms.txt (folders, `root: true`, `...`,
separators, link entries).

Check:

- Which manifest entries cannot be expressed in `meta.json`? Candidates are cross-section `href`
  entries and pages listed under a section other than their directory. `meta.json` supports link
  entries, separators, nested folders, `...` rest globs, and `root: true` per section. Enumerate
  the exceptions concretely rather than by category.
- The "Additional guides" fallback holds 58 pages across seven sections. Under a `meta.json`-only
  model these pages sit wherever their directory puts them, which is what `...` does natively.
- The original reason for the manifest was reproducing the Docusaurus `sidebars.js` hierarchy,
  which the JSON's `reference` field still points at. That constraint no longer applies.

Candidates:

- **Replace** the manifest with `meta.json` only: move pages so directory structure equals sidebar
  structure, put `root: true` on the nine section folders, and use `meta.json` link entries for the
  handful of cross-section links. Removes `lib/docs-navigation*.{ts,json}`, `scripts/nav-check.ts`,
  `scripts/lib/nav.ts`, and their tests. `move-doc` writes the redirects for the moves.
- If a spike shows the manifest is still needed for a few groups, **shrink** it: keep only
  `page` and `href` entries and delete `folder`, `flatten`, `defaultOpen`, the two static rules,
  and the "Additional guides" machinery.

Decision: spike the `meta.json`-only model on one section (suggest `run-a-node`, 43 pages in
Additional guides today) and compare the rendered sidebar before committing to the rest.

### Track D. Custom MDX components (criteria 1, 2, 3)

Read: `components/mdx.tsx` and every directory under `components/mdx/`.

Usage measured across `content/` (files / occurrences):

| Component                         | Files    | Uses  | Position                                                                                                                                     |
| --------------------------------- | -------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `VanillaAdmonition`               | 198      | 474   | **replace** with Fumadocs `Callout` (`info`, `warn`, `error`, `idea`); mechanical codemod, deletes 110 lines of CSS module and the icon file |
| `Term`                            | 139      | 1,256 | **keep**; confirm `HoverPopover` styling moves to Tailwind                                                                                   |
| `include` directive               | 85       | 295   | **keep** (fumadocs-mdx native)                                                                                                               |
| `Card` / `Cards`                  | 44       | 229   | **keep** (Fumadocs native); check the `global.css` restyle                                                                                   |
| `ImageZoom` wrapper               | 35       | 85    | **replace** with Fumadocs `ImageZoom`; two components with one name is a trap                                                                |
| `Var`                             | 22       | 61    | **keep**; see Track B for the schema                                                                                                         |
| `Tabs` / `Tab`                    | 10       | 41    | keep (Fumadocs native)                                                                                                                       |
| `Accordions`                      | 6        | 48    | keep (Fumadocs native)                                                                                                                       |
| `CustomDetails`                   | 6        | 36    | **replace** with `Accordion` or a plain `<details>`                                                                                          |
| `FAQStructuredDataJsonLd`         | 6        | 6     | see Track B                                                                                                                                  |
| `AEL`                             | 3        | 141   | **keep**; drop the long alias or the short one, not both                                                                                     |
| `Steps` / `Step`                  | 1        | 20    | keep (Fumadocs native)                                                                                                                       |
| `Troubleshooting*` (5 components) | 1        | 7     | **shrink or remove**; one page, 540 lines plus a store                                                                                       |
| `VendingMachine`                  | 1        | 3     | **remove or extract**; brings `viem` into the docs site                                                                                      |
| `EdgeChallengeFlow`               | 1        | 1     | **remove or extract**; d3 (4 packages + types), 560-line CSS, 5,004-line JSON                                                                |
| `FlowChart` (CentralizedAuction)  | 1        | 1     | **remove or extract**; 2,337 lines plus a CSS module                                                                                         |
| `ReferenceList`                   | 1        | 1     | keep (glossary page)                                                                                                                         |
| `Reference`                       | 0        | 0     | **remove**                                                                                                                                   |
| `PdfModal` and the `a` wrapper    | 0 direct | n/a   | **remove**; a PDF link can be a link                                                                                                         |
| `Popup*` (Twoslash)               | 0        | 0     | **remove** with `fumadocs-twoslash` and the `serverExternalPackages` entry                                                                   |
| `FAQStructuredData` (unaliased)   | 0        | 0     | one name per component                                                                                                                       |

For the three heavy single-page widgets (about 4,700 lines, three CSS files, nine npm packages):
decide per widget whether the page needs an interactive figure, whether a static SVG or a short
video conveys the same idea, or whether the widget should live in its own package and be embedded.
None of the three should stay in `components/mdx/` as they are.

Decision: the final component registry, with a one-line justification per entry.

### Track E. Styling (criterion 3)

Read: `app/global.css` (712 lines), the five component CSS files (978 lines), `app/layout.tsx` font
declarations, `components/home-header.tsx`, `components/footer.tsx`.

Check:

- Which `global.css` blocks are brand tokens (keep, as Tailwind theme variables), which restyle
  Fumadocs internals by selector (candidates to drop or to express through Fumadocs' documented
  CSS variables), and which port Docusaurus typography (`_typography.scss`) that Fumadocs' prose
  styles already cover.
- Every CSS module goes away with its component (Track D) or becomes utilities.
- `edge-challenge-flow.css` (560 lines) follows its widget.
- Fonts: four self-hosted faces plus one committed Google slice with an OFL file. Confirm the
  set is the minimum the brand requires. The italic-as-separate-declaration trick and the
  `unicode-range` carry-over are each a paragraph of explanation for a small gain; decide whether
  the gain is measured or assumed.

Decision: target line count for `global.css` and the rule that no new `.css` file is added under
`components/`.

### Track F. Scripts and gates (criterion 4)

Read: `package.json` scripts, `.github/workflows/ci.yml`, `.github/workflows/upstream-refresh.yml`,
`.lintstagedrc.mjs`, `.husky/pre-commit`, and each script's header comment.

Score every command with four columns: defect caught, has it happened here, caught elsewhere,
lines (script + lib + tests). Starting positions:

| Command                                                                                  | Position                          | Reason                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `types:check`, `test`, `format:check`, `build`                                           | keep                              | standard                                                                                                                                                                                                                                                                                                                                                         |
| `check-links`                                                                            | keep                              | Fumadocs has no broken-link gate                                                                                                                                                                                                                                                                                                                                 |
| `partials:check`, `partials:catalog`                                                     | shrink                            | `include` is native; the catalog and registry can be a README listing; keep only "no partial is routed"                                                                                                                                                                                                                                                          |
| `vars:check`                                                                             | shrink                            | keep "every `<Var>` resolves"; drop the unreferenced-key audit (`vars-audit.ts`, 180 lines)                                                                                                                                                                                                                                                                      |
| `content:lint` (14 rules, 520 + 703 lines, plus `strip-code.ts` 454 + 604)               | shrink hard                       | A1 to A5 and A7 covered Docusaurus leftovers that are now zero; A8 to A10 (HTML nesting) and A12 to A13 (fence closers) are real but ask whether Prettier's MDX parser or `pnpm build` already fails on them; A6 and A11 (`<Var>` in code or link) go away if `Var` in prose is the only supported form; A14 (whitespace in titles) is a `.trim()` in the schema |
| `nav:check`                                                                              | remove                            | with Track C                                                                                                                                                                                                                                                                                                                                                     |
| `references:check`                                                                       | keep                              | small                                                                                                                                                                                                                                                                                                                                                            |
| `faq:check`                                                                              | remove                            | with Track B                                                                                                                                                                                                                                                                                                                                                     |
| `images:presence`, `images:check`                                                        | shrink                            | one rule ("no remote markdown image") can be a content-lint line or a schema-free grep; the network mode is hand-only anyway                                                                                                                                                                                                                                     |
| `versioned-docs-check`                                                                   | follows Track G                   |                                                                                                                                                                                                                                                                                                                                                                  |
| `redirects:check` + `redirects-config.test.ts`                                           | keep one                          | the offline test already proves destinations exist; the online check needs a running server in CI                                                                                                                                                                                                                                                                |
| `move-doc` (449 + 230 lines) + `restructure.ts` (113)                                    | shrink                            | a move is `git mv` plus one redirect line; keep the redirect append and the link rewrite, drop the retarget-and-dedupe pass if redirects live in a simpler file                                                                                                                                                                                                  |
| `precompiles:generate/check`                                                             | keep generate, drop check from CI | non-blocking already; network dependent                                                                                                                                                                                                                                                                                                                          |
| `contracts:generate/check`                                                               | keep                              | pins `@arbitrum/sdk` as a devDependency for one table; acceptable                                                                                                                                                                                                                                                                                                |
| `cli:generate/check` (277 + 1,007 `nitro-cli-flags.ts` + 401 `go-source.ts` + 482 tests) | question                          | 2,200 lines to parse Go source for one reference page; consider running `nitro --help` in the weekly job, or maintaining the page by hand with a diff against the release notes                                                                                                                                                                                  |
| `stylus:generate/check` (244 + 436 + 417)                                                | question                          | republishes 19 pages from a third-party repo with no releases; consider linking to that repo instead                                                                                                                                                                                                                                                             |
| `edge-challenge:fetch` (340 lines)                                                       | follows Track D                   |                                                                                                                                                                                                                                                                                                                                                                  |
| `nitro:check-release` (205 + 168 + `nitro-node-image.ts` 104 + 106)                      | shrink                            | the `sync-with-var` marker mechanism exists because `<Var>` cannot render inside a code fence; decide whether a rendered `docker run` with the version beside it is acceptable instead                                                                                                                                                                           |
| `inventory-links`                                                                        | remove                            | one-off audit                                                                                                                                                                                                                                                                                                                                                    |
| `fonts.test.ts`                                                                          | remove                            | guards against re-adding `next/font/google`; a code-review rule, not a test                                                                                                                                                                                                                                                                                      |

Also check:

- `ci.yml` at HEAD has two jobs (`Gates`, `Build`) and no `fetch-depth`, no `precompiles:check`,
  and `upstream-refresh.yml` has one job. CLAUDE.md and INTERNALS.md describe three CI jobs,
  `fetch-depth: 2`, a `stylus` job, `contracts:generate` and `cli:generate` in the weekly job, and a
  `.lintstagedrc.ts` that does not exist (the file is `.lintstagedrc.mjs`, and `tsconfig.json`
  includes the `.ts` name). Either the docs describe uncommitted work or the work was lost.
  Resolve this first, since the rest of the review reads those docs.
- The pre-commit hook runs a full `pnpm types:check` for any staged `.ts` file. Decide whether
  the hook should exist at all given CI runs the same gates.

Decision: the gate list for CI, the command list for `package.json`, and a deletion list.

### Track G. Routing and runtime (criteria 2, 4, 5)

Read: `proxy.ts`, `next.config.ts`, `patches/next@16.3.4.patch`, `lib/llms-tracking.ts`,
`lib/versions.ts`, `lib/versions-constants.ts`, `lib/var-links.ts`, `lib/mdx-comments.ts`,
`lib/site-url.ts`, `app/docs/[[...slug]]/page.tsx`, `app/llms.mdx/`.

Check:

- **Markdown negotiation.** Three URL shapes serve the same markdown (`/docs/x.md`,
  `/llms.mdx/docs/x/content.md`, `Accept: text/markdown`). The `Accept` path needs a private
  header, a `beforeFiles` rewrite, `Vary: Accept`, and a patch to Next's runtime to append rather
  than set `Vary`. **Shrink** to the `.md` suffix and the `/llms.mdx/` route, which drops the Next
  patch, `pnpm-workspace.yaml`'s `patchedDependencies`, `lib/markdown-routing.ts`, and half of
  `proxy.ts`. Confirm what Fumadocs' own `llms` guidance recommends before deciding.
- **PostHog tracking in the proxy** (`lib/llms-tracking.ts` 235 lines + 588 lines of tests, plus
  100 lines in `proxy.ts`). Is anyone reading the `llms_file_fetched` series? If not, **remove**.
  If yes, ask whether Vercel or PostHog server-side analytics gives the same count without
  hand-hashed IPs in a proxy.
- **Partial versioning.** Three archived pages (`content/_versions/v1/…`) are served by a second
  collection, a registry in a TS file, `lib/versions.ts`, a version switcher, archive markdown
  mirrors, archive static params, a legacy `?v=` redirect, `versioned-docs-check` and its
  comparison module, and about 400 lines of tests. Ask the owners of those three pages whether the
  archives are still needed. If yes, **shrink** to Fumadocs' documented approach (a `versions`
  folder in the same collection with `root: true`, or a plain "previous version" link). If no,
  **remove** all of it.
- **`{var:name}` in link destinations** (`lib/var-links.ts` 171 lines + tests + lint rule A11).
  Measured: 200 uses, 180 of them Nitro source links (`nitroVersionTag`, `nitroRepositorySlug`,
  `nitroPathToPrecompiles`, `nitroPrecompilesCommit`) and most of those inside the generated
  precompile partials. **Keep** the plugin; it is what lets a version bump retarget every source
  link. Ask instead whether the generator should write the final URLs itself, which would let the
  plugin serve only the twenty hand-written uses.
- **MDX comment stripping** (`lib/mdx-comments.ts` 126 lines + tests) exists so editor notes do
  not reach `/llms.txt`. Decide whether editor notes in MDX are allowed at all; if not, the plugin
  goes.
- **`lib/site-url.ts`** and the module-scope throws: keep the rule, cut it to one function and one
  paragraph.
- The legacy `.md`-on-legacy-URL redirect in `proxy.ts` reads the whole redirect table into the
  proxy. Decide whether a 404 on `/old-url.md` is acceptable.
- Static params and `dynamicParams = false`: **keep**, it is the correct Next 16 shape.

Decision: the final list of URL shapes the site serves, and whether the Next patch survives.

### Track H. Documentation and comments (criterion 5)

Read: `INTERNALS.md` (29,000 words), `CLAUDE.md` (10,900 words), `README.md`, `CONTRIBUTE.md`,
`STYLE-GUIDE.md`, and the header comments of `proxy.ts`, `source.config.ts`, `lib/shared.ts`.

Check:

- 104 `FS-` ticket references in source files and 81 in the two internal docs. Each is a pointer to
  a tracker a reader may not have. **Replace** with a plain statement of the current rule, and move
  the history to the commit that lands the simplification.
- Comments that record measurements ("26.6 MB chunk", "82,424 bytes, same ETag", "sha256
  1e06740a") or rejected alternatives. These are commit-message material.
- CLAUDE.md duplicates INTERNALS.md by design and is 153 lines of 300-character paragraphs. Once
  the codebase is smaller the file should fit on one screen: commands, the frontmatter contract,
  the three rules that break builds, and pointers.
- The `README.md`, `CONTRIBUTE.md`, `STYLE-GUIDE.md` trio is the right shape for writers. Re-read
  after Tracks B and C so they describe the simpler workflow.
- Docs-versus-tree drift listed in Track F.

Target: INTERNALS.md under 5,000 words, CLAUDE.md under 1,500, no ticket ids in source files,
comment ratio in `lib/` and `proxy.ts` under 20 percent.

### Track I. Dependencies (criterion 2)

Read: `package.json` diff against `fumadocs`.

Check:

- `fumadocs-core` and `fumadocs-ui` moved from 16.15.12 to 16.15.9 and `fumadocs-mdx` from 15.4.3
  to 15.4.0 relative to the base branch. A downgrade on a migration branch is either a merge
  artifact or a workaround for a bug; find out which and move to the latest.
- `next` is patched (Track G). `typescript` 7 is pinned for `fumadocs-twoslash`, which no page
  uses (Track D).
- Packages that exist for one component: `d3-hierarchy`, `d3-selection`, `d3-shape`, `d3-zoom`
  and their four `@types` packages (EdgeChallengeFlow), `viem` (VendingMachine),
  `@radix-ui/react-dialog` (PdfModal and the auction FlowChart), `class-variance-authority` (the
  feedback widget only). `katex`, `remark-math`, `rehype-katex` stay: five pages use math.
- `posthog-js` follows the Track G decision; the page-feedback widget also uses it, so check both.
- `husky` and `lint-staged` follow the Track F decision.

Decision: the dependency list, with each non-Fumadocs, non-Next package justified.

### Track J. Content changes (criteria 1, 6)

Read: the `content/docs` diff (231 files), `content/partials` diff (38 files).

Check:

- 34 `meta.json` files changed and three pages moved between `batch-poster`, `data-availability`,
  and `sequencer`. Confirm each move has a redirect and that the moves still make sense under the
  Track C model, so pages are not moved twice.
- Frontmatter noise: `content_type: 'how-to'` to `content_type: how-to` on a few pages. Pick one
  quoting style and let Prettier or the schema enforce it, or stop caring once the field is
  optional.
- `{/* sync-with-var: latestNitroNodeImage */}` markers on 11 pages and the autogenerated markers
  on 19 Stylus pages follow Tracks F and G.
- The deleted `Offchain-pattern-guide.mdx` and the two deleted partials: confirm intent.
- Prose edits: sample ten modified pages and confirm they are content improvements rather than
  migration side effects (the bullet-label rewrites such as "Your benefit" to "User benefit" look
  like a style pass; confirm the style guide asks for it).

Decision: none needed beyond confirming the moves; this track is a spot check.

## 4. Order of work

1. **Resolve the docs-versus-tree drift** (Track F, last bullet). Everything else reads those docs.
2. **Track A** in one PR: pure deletions, no behavior change.
3. **Track C spike** on one section, because the answer changes how much of Tracks B, F, and H
   remains. Run it before touching navigation elsewhere.
4. **Track D and Track E together**, one PR per component family: admonitions first (198 files,
   mechanical), then the wrapper components, then the three heavy widgets.
5. **Track B** frontmatter and vars schema, after C so the sidebar-label rules are settled.
6. **Track G** routing, one PR for negotiation and the patch, one for versioning, one for
   tracking.
7. **Track F** gate pruning, after B to G so the gates being deleted have nothing left to guard.
8. **Track I** dependency cleanup falls out of D and G.
9. **Track H** last: rewrite the internal docs to describe what is left.

Each PR: `pnpm types:check`, `pnpm test`, `pnpm build`, then open the affected pages on
`http://localhost:3000` (not `127.0.0.1`, where hydration does not run) and check the sidebar,
one callout, one included partial, and one `.md` URL by hand. For content-wide codemods, diff the
rendered HTML of five pages before and after.

## 5. Decisions the review needs from the team

1. Which frontmatter fields, if any, beyond `title` and `description` are worth failing a build
   over.
2. Whether the sidebar can be directory-driven (`meta.json` only), accepting that some pages move.
3. Whether the three interactive widgets (auction flow chart, edge-challenge tree, vending
   machine) stay, become static figures, or move to their own package.
4. Whether the three archived page versions are still needed.
5. Whether anyone consumes the `llms_file_fetched` PostHog series.
6. Whether the Nitro CLI flags page and the Stylus-by-example pages keep being generated from
   upstream source, or become hand-maintained pages and links.
7. Whether editor comments inside MDX are allowed.

## 6. Out of scope

- Prose quality of individual pages (STYLE-GUIDE.md covers it and is not under review here).
- Visual redesign. The brand tokens stay; only how they are expressed changes.
- Cutover to the `OffchainLabs/arbitrum-docs` name.
