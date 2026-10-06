# Notion FAQ import: design

Date: 2026-09-30. Branch: `notion-faq-import`, based on `fumadocs` at `a4d770d07`.

## Context

The Docusaurus site pulled six FAQ and troubleshooting pages from the Notion "FAQ CMS" database with
`scripts/notion-update.ts` and the `@offchainlabs/notion-docs-generator` library, and emitted
schema.org `FAQPage` data from six JSON files. Commit `423321704` ("chore: remove Docusaurus
scaffold") deleted all of it. The generator's output survived as six ordinary partials under
`content/partials/`, which have been edited by hand on this branch since 2026-09-17 while master
kept running the pipeline. The two copies have diverged.

This design brings the import back as a first-class generator in this codebase. It is not a port:
the old script, the library and its Docusaurus conventions are not reused.

## Decisions taken with the owner

| Question                             | Decision                                                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Source of truth for the six partials | Notion. The partials become generated files with a do-not-edit marker; a CI gate fails when one is stale.                       |
| Site variables in FAQ answers        | None. Values stay literal in Notion and in the output. No `<Var>` or `{var:}` in generated FAQ content.                         |
| Schema.org `FAQPage` structured data | Restored, from the same snapshot that feeds the partials.                                                                       |
| Approach                             | Two stages: a network fetch writes a committed snapshot; an offline generator writes the partials from it.                      |
| Notion client                        | `@notionhq/client`, current major, pinned exact. Not `@offchainlabs/notion-docs-generator`.                                     |
| Out of scope                         | Writing back to Notion. The Inkeep CSV export (it read a different database). A FAQ search index. `CATALOG.md`/`manifest.json`. |

## Data source

- Database "FAQs [Database]", id `a8a9af20f33d4cc1b32bbd2be8459733`, data source
  `collection://a2a87b1e-7077-4e85-86e4-b67df34307d4`, inside the "FAQ CMS" page
  `3374b489c2d642628e7373977c7e1e9a`.
- Properties used: `Question` (title), page body (answer), `Short answer (HTML)` (text, fallback
  answer), `Target document slugs` (multi-select), `Publishable?` (select), `Status` (status),
  `FAQ order index` (number).
- Auth: `NOTION_TOKEN` from the environment, with `.env` read when present. The token is a
  repository secret for the refresh workflow only. CI gates and the Vercel build never see it.

## Architecture

```
Notion ──faq:fetch──▶ content/faq/<key>.json ──faq:generate──▶ content/partials/_troubleshooting-<key>-partial.mdx
                              │                                              │
                              └──▶ lib/faq.ts ──▶ FAQPage JSON-LD            └──▶ <include> on six pages
```

### Mapping `scripts/data/faq.data.ts`

The only place the Notion slugs and page paths are written.

```ts
export const faqDatabaseId = 'a8a9af20f33d4cc1b32bbd2be8459733';
export const faqPages = [
  { key: 'users', notionSlug: 'troubleshooting-using-arbitrum', page: 'get-started/faq' },
  { key: 'nodes', notionSlug: 'troubleshooting-running-nodes', page: 'run-a-node/faq' },
  { key: 'building', notionSlug: 'troubleshooting-building', page: 'build-decentralized-apps/troubleshooting-building' },
  { key: 'bridging', notionSlug: 'troubleshooting-bridging', page: 'arbitrum-bridge/troubleshooting' },
  { key: 'arbitrum-chain', notionSlug: 'troubleshooting-building-orbit', page: 'launch-arbitrum-chain/overview/faq' },
  { key: 'stylus', notionSlug: 'troubleshooting-building-stylus', page: 'stylus/troubleshooting-building-stylus' },
] as const;
```

The partial path is derived: `content/partials/_troubleshooting-<key>-partial.mdx`.

### Fetch `scripts/faq-fetch.ts` (`pnpm faq:fetch`)

I/O only: client setup, the query, block fetching, `runScript(main)`.

- One paginated query with the filter `Publishable? equals "Publishable"` AND
  `Status equals "4 - Continuously publishing"`. In code, keep rows whose `Target document slugs`
  contains at least one mapped slug. A row mapped to several slugs is emitted under each.
- Order within a page: ascending `FAQ order index`. A missing index or a tie fails the run and
  names the question. Nothing is dropped silently.
- Blocks: fetch children recursively. Retry three times with a fixed delay on HTTP 429, 500 and
  502, honoring `Retry-After` when present. Nothing else is retried.
- Render each answer to MDX (next section). Collect every render error across all questions, then
  exit 1 with one line per error: Notion page URL, question, reason.
- Validate links: every site-relative link the renderer produced must resolve to a page under
  `content/docs`, using the resolution helpers in `scripts/check-links.ts`. Unresolved links are
  reported like render errors, with the Notion page URL, so the author fixes them in Notion.
- Write `content/faq/<key>.json` through `writeOrCheck` with `format: false`, two-space indent,
  trailing newline. A run with no Notion changes writes nothing.

Pure core in `scripts/lib/faq-snapshot.ts`: row filter, slug grouping, ordering rule, snapshot
builder. Tested with fixture rows, including the no-index and tie failures.

### Snapshot `content/faq/<key>.json`

```json
{
  "source": "https://www.notion.so/a8a9af20f33d4cc1b32bbd2be8459733",
  "items": [{ "id": "<notion page id>", "question": "…", "answer": "<MDX string>" }]
}
```

No timestamps, so the file only changes when content changes. `content/faq/` is outside both
Fumadocs collections (`content/docs`, `content/glossary`), so nothing compiles it as a page. JSON
imports are enabled in `tsconfig.json`, as `content/vars.json` already relies on.

### Rendering `scripts/lib/notion-mdx.ts`

Pure functions from the Notion block tree to an MDX string. No I/O.

Answer source: the page body. If empty, `Short answer (HTML)` rendered as rich text. If both are
empty, fail.

| Notion block                                                               | Output                                                                                 |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| paragraph                                                                  | paragraph                                                                              |
| heading_1, heading_2, heading_3                                            | `####` heading, all three levels; nothing inside an answer outranks the `###` question |
| bulleted_list_item, numbered_list_item                                     | markdown list, nesting preserved                                                       |
| code                                                                       | fenced block, Notion language string as-is                                             |
| quote                                                                      | blockquote                                                                             |
| callout                                                                    | `<Callout type="info">`, icon dropped                                                  |
| divider                                                                    | `---`                                                                                  |
| table                                                                      | markdown table, header row from `has_column_header`                                    |
| image, video, file, embed, bookmark                                        | fail (the `remote-image` lint rule bans remote images)                                 |
| link_to_page, child_page, synced_block, toggle, column_list, anything else | fail with block type and page URL                                                      |

Rich text: bold, italic, inline code, strikethrough. Curly quotes become straight. Underline and
color are dropped. Page and user mentions fail.

Links: a `docs.arbitrum.io/<path>` URL becomes `/docs/<path>`; a `notion.so` or `app.notion.com`
URL fails; any other `https://` URL passes through. No link inside a heading (rule
`link-in-heading`). Question text containing a link fails.

Partial layout: the marker line, a blank line, then for each item `### <question>`, blank line,
answer, blank line. No wrapper element.

Tests: `scripts/lib/notion-mdx.test.ts` with fixture block JSON captured from the real API, one
fixture per block type, plus the failure cases.

### Generator `scripts/generate-faq.ts` (`pnpm faq:generate`, `pnpm faq:check`)

Mirrors `scripts/generate-contract-addresses.ts`:

- Module-level `MDX_FORMAT` (`parser: 'mdx'`, `printWidth: 9999`, `proseWrap: 'preserve'`), so
  Prettier never rewraps answers and `format:check` stays green.
- For each mapping entry: read the snapshot, build the partial with a pure function in
  `scripts/lib/faq-partial.ts`, `writeOrCheck(partial, text, { check: isCheckMode(), format: MDX_FORMAT })`.
- Header from `generatedMarker('pnpm faq:generate', 'a faq:fetch')`.
- On `StaleFileError`, print `diffSummary` before rethrowing.
- A missing snapshot fails with the exact `faq:fetch` command to run.

Tests: `scripts/lib/faq-partial.test.ts` for the builder; `scripts/generate-faq.test.ts` for the
write and check paths against a `mkdtemp` directory.

### Scripts and CI

```json
"faq:fetch": "node scripts/faq-fetch.ts",
"faq:generate": "node scripts/generate-faq.ts",
"faq:check": "node scripts/generate-faq.ts --check"
```

`faq:check` joins `.github/workflows/ci.yml` after `contracts:check`. It is offline and
deterministic. It catches a hand edit to a partial, a snapshot edited without regenerating, and a
generator change not applied. `faq:fetch` never runs in CI.

### Refresh workflow `.github/workflows/faq-refresh.yml`

Copy of the `upstream-refresh.yml` skeleton: Mondays 08:00 UTC and `workflow_dispatch`; checkout
with `persist-credentials: false`; pnpm; Node 22; `pnpm install --frozen-lockfile`;
`pnpm faq:fetch` with `NOTION_TOKEN` from secrets; `pnpm faq:generate`; `create-pull-request` on
`automated/faq-refresh`, no-op when the tree is clean. Permissions `contents: write` and
`pull-requests: write` on the job, `contents: read` at the top. The PR body states that the PR
gets no CI run of its own and the reviewer runs the gates locally. Same zizmor conventions as the
existing workflows: values reach the shell through `env`, never `${{ }}` inside `run`.

One-time admin step: add `NOTION_TOKEN` as a repository secret.

### Structured data `lib/faq.ts`

Imports the six snapshots statically. Exports `faqJsonLd(slugs: string[])`, which looks the page
path up in the mapping and returns `undefined` for any other page. For a match:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{ "@type": "Question", "name": "…", "acceptedAnswer": { "@type": "Answer", "text": "…" } }]
}
```

`text` is the answer with markdown stripped to plain text: fences and inline code keep their text,
links keep their label, headings and list markers go, emphasis markers go. A small pure function
with its own test.

`app/docs/[[...slug]]/page.tsx` calls it once and, when defined, renders
`<script type="application/ld+json">` with the JSON serialized and `<` escaped as `\u003c`.
`lib/faq.ts` imports nothing from `lib/source`.

## Migration of the existing partials

The first generator run overwrites all six partials. Hand edits made in the repo since the
relocation must reach Notion first. Question sets, compared on 2026-09-30:

| Partial        | Repo | Notion | Difference                                                                 |
| -------------- | ---- | ------ | -------------------------------------------------------------------------- |
| arbitrum-chain | 31   | 31     | none                                                                       |
| building       | 28   | 28     | none                                                                       |
| nodes          | 14   | 14     | none                                                                       |
| stylus         | 15   | 15     | none                                                                       |
| users          | 21   | 21     | none                                                                       |
| bridging       | 7    | 6      | "What's the difference between USDC and USDC.e on Arbitrum One?" repo only |

Procedure:

1. Run `pnpm faq:fetch && pnpm faq:generate` on this branch. Do not commit yet.
2. `git diff content/partials/`. Also diff the bridging and users partials against
   `origin/master:docs/partials/…`, which carry prose edits from 2026-09-29.
3. Classify each hunk:
   - **Link prefix** (`/x` became `/docs/x`): do nothing. The renderer rewrites links.
   - **Variable placeholder resolved to a literal** (`@@l2BlockTimeMs=250@@` became `250`): do
     nothing. Values are literal by decision.
   - **Prose edit in the repo**: where the repo text is newer, paste it into the Notion page body;
     where Notion is newer, accept Notion. The two bridging answers edited on master on 2026-09-29
     show a Notion edit the same day, so the diff is expected to be empty there.
   - **Question only in the repo**: create the USDC question in the FAQ database with the repo's
     answer as the body, `Publishable? = Publishable`, `Status = 4 - Continuously publishing`,
     `Target document slugs = troubleshooting-bridging`, `FAQ order index = 55`.
4. Re-run both commands until the diff holds only the first two kinds.
5. Commit snapshots and partials together as the migration commit.

This step is done by a person with edit rights on the FAQ database.

## Documentation

- `INTERNALS.md`: a "FAQ pages from Notion" subsection under Generated pages; two rows in the
  hand-run tools table; a line in the workflows paragraph; `faq:check` in the gates table.
- `CLAUDE.md`: the three commands and a Generated pages bullet, mirrored from INTERNALS.
- `README.md`: `faq:check` in the gates list.

## Testing summary

| Module                        | Test                                                           | Network |
| ----------------------------- | -------------------------------------------------------------- | ------- |
| `scripts/lib/notion-mdx.ts`   | fixture blocks → MDX, one per block type, plus failures        | no      |
| `scripts/lib/faq-snapshot.ts` | fixture rows → grouping, ordering, no-index and tie failures   | no      |
| `scripts/lib/faq-partial.ts`  | snapshot → partial text                                        | no      |
| `scripts/generate-faq.ts`     | write and check paths in a `mkdtemp` directory                 | no      |
| `lib/faq.ts`                  | mapping lookup, markdown stripping, JSON-LD shape              | no      |
| `scripts/faq-fetch.ts`        | not unit tested; exercised by hand and by the refresh workflow | yes     |

## Open items

- `NOTION_TOKEN` repository secret (admin).
- Current `@notionhq/client` version, looked up at implementation time.
