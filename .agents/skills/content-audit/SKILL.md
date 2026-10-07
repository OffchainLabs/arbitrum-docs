---
name: content-audit
description: Run full documentation quality audit, covering sidebar orphans, unused-file review, MDX structure, internal links, glossary references, contract addresses, variables, formatting, frontmatter, tests, and types. Triggers on "audit docs", "check docs quality", "find problems", "content audit".
disable-model-invocation: true
---

# Content Audit

Orchestrate all doc quality checks into a single unified report.

## Checks (run in order)

### 1. MDX structure

```shell
pnpm content:lint 2>&1
```

Reports structural MDX defects: stray `:::` fences left by the old Docusaurus site, malformed
admonitions, and other hydration-breaking or parser-ambiguous MDX shapes (see the content-lint rules
in the project's `CLAUDE.md`). Not auto-fixable: each finding is an edit.

### 2. Orphan pages

```shell
node --test scripts/sidebar.test.ts
```

Builds the Fumadocs sidebar from `content/docs/**/meta.json` and checks that every article
appears on exactly one sidebar node and belongs to a section. The root overview is intentionally
hidden. Failures name the page and the `meta.json` entry to fix. This replaces the old
`yarn find-orphan-pages` check; it also runs as part of `pnpm test`.

### 3. Orphaned files

The legacy `scripts/find-orphaned-files.js` is absent from this checkout. Keep this audit step,
but report it as a manual review; the link and sidebar gates do not prove assets or partials are used.

1. Inventory images and partials with `rg --files public/img content/partials`.
2. For each candidate, search its filename and repository/URL path with `rg -n -F` across
   `content`, `components`, `app`, `lib`, `scripts`, and `public`. Exclude the candidate's own
   contents from its reference count. Follow references from CSS, SVGs, components, and generators,
   including paths assembled at runtime; a basename search alone is not proof of non-use.
3. Report unreferenced candidates with the searches performed and any unresolved dynamic consumers.
   Public URLs and contributor-local configurations can have consumers outside the repository.
   Do not delete files as part of this audit or mark the check PASS from a text search alone.

If the inventory or reference review is not completed, report NOT RUN with the reason. The
image-debt scanner can help identify heavy images, but is not a complete unused-file audit.

### 4. Internal links

```shell
pnpm check-links 2>&1
```

Every internal doc link resolves to a real page. This is the gate that supplies Fumadocs'
`onBrokenLinks: 'throw'`, and `pnpm build` runs it first, so a failure here also fails the Vercel
deploy. It also validates `#anchor` fragments against the compiled heading ids, so a dead anchor
fails; only anchors created at runtime are outside its reach.

### 5. Glossary and inline references

```shell
pnpm references:check 2>&1
```

Every `<Term>` / `<ReferenceList>` target resolves to a real `content/glossary/` entry.

### 6. Contract addresses

```shell
pnpm contracts:check 2>&1
```

Regenerates the contract-address partial (`content/partials/_reference-arbitrum-contract-addresses-partial.mdx`)
from `@arbitrum/sdk` and `scripts/data/contract-addresses.data.ts`, and exits 1 with a line diff if
the committed partial is stale. Never hand-edit that partial; edit the generator or its data file.

### 7. Variables

```shell
pnpm vars:check 2>&1
```

Every `<Var name="…" />` and `{var:name}` resolves to a key in `content/vars.json`, and the banner
keys (`announcementId`, `announcementLinkHref`) are valid.

### 8. Formatting

```shell
pnpm format:check 2>&1
```

Prettier across content and app code without modifying files. `pnpm format` writes the fixes.

### 9. Tests

```shell
pnpm test 2>&1
```

`node --test` over `scripts/**/*.test.ts`: unit coverage for the gate scripts themselves (link
resolution, redirects, variable expansion, and so on), plus `scripts/sidebar.test.ts`, which
builds the real sidebar tree and fails when a page is on no `meta.json` node or on two.

### 10. TypeScript

```shell
pnpm types:check 2>&1
```

Regenerates the `.source/` collection, generates Next types, then runs `tsc --noEmit`. This checks
TypeScript; it does not validate every page's frontmatter or prove a page renders. Confirm content changes
in a browser on `http://localhost:3000` (on `127.0.0.1` React does not hydrate and every component
looks broken).

### 11. Frontmatter

```shell
pnpm frontmatter:check 2>&1
```

Validates every documentation page against `lib/page-schema.ts`. Required: `title` and
`description`; `sidebar_label`, `content_type`, `author`, and `sme` are optional. Run this gate
explicitly: `types:check` does not apply the schema to every page.

### 12. Build

```shell
pnpm build 2>&1
```

Chains `check-links` ahead of `next build`. Expensive (a full production build), so treat it as the
final confirmation rather than something to iterate against: prefer the faster gates above while
fixing findings, then run this once before calling the audit done.

## Not available

- **Doc manifest audit** (terminology consistency, missing metadata). The frontmatter contract
  (`title` and `description` required; `sidebar_label`, `content_type`, `author`, `sme` optional) is
  enforced by `pnpm frontmatter:check` and when a page compiles during the build, using the Zod
  schema in `lib/page-schema.ts`. There is no `user_story` or `draft` field in this schema, so don't add
  one when scaffolding a page. Terminology consistency itself is a `STYLE-GUIDE.md` review-time rule,
  not a gate.

## Output format

Produce a summary table first, then details per check:

```
| Check              | Status    | Issues          |
|--------------------|-----------|-----------------|
| MDX structure      | PASS/FAIL | N defects       |
| Orphan pages       | PASS/FAIL | N orphans       |
| Orphaned files     | REVIEW/NOT RUN | N candidates |
| Internal links     | PASS/FAIL | N broken        |
| References         | PASS/FAIL | N missing       |
| Contract addresses | PASS/FAIL | N stale         |
| Variables          | PASS/FAIL | N unresolved    |
| Formatting         | PASS/FAIL | N unformatted   |
| Tests              | PASS/FAIL | N failures      |
| TypeScript         | PASS/FAIL | N errors        |
| Frontmatter        | PASS/FAIL | N invalid pages |
| Build              | PASS/FAIL | N errors        |
```

Then for each FAIL or REVIEW, list:

- File path and line number
- Issue description
- Suggested fix (if auto-fixable, say so)

## Arguments

- No args: run all checks, including the manual unused-file review
- `--fix`: auto-fix what's possible (`pnpm format`), then report remaining
- `--quick`: skip `types:check` and `build` (faster, covers content only)
