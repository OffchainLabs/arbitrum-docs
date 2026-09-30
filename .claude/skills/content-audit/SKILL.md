---
name: content-audit
description: Run full documentation quality audit, covering MDX structure, internal links, glossary references, contract addresses, variables, formatting, tests, and types. Triggers on "audit docs", "check docs quality", "find problems", "content audit".
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
admonitions, Docusaurus habits (`@@var@@`, `data-quicklook-from`, `@site` imports, unregistered
components) and other hydration-breaking or parser-ambiguous MDX shapes (the rule table is under
"The content-lint rules" in `INTERNALS.md`). Not auto-fixable: each finding is an edit.

### 2. Internal links

```shell
pnpm check-links 2>&1
```

Every internal doc link resolves to a real page. This is the gate that supplies Fumadocs'
`onBrokenLinks: 'throw'`, and `pnpm build` runs it first, so a failure here also fails the Vercel
deploy. It also validates `#anchor` fragments against the compiled heading ids, so a dead anchor
fails; only anchors created at runtime are outside its reach.

### 3. Glossary and inline references

```shell
pnpm references:check 2>&1
```

Every `<Term>` (and `<Reference>`) id resolves to a real `content/glossary/` entry, and entry ids
are unique.

### 4. Contract addresses

```shell
pnpm contracts:check 2>&1
```

Regenerates the contract-address partial (`content/partials/_reference-arbitrum-contract-addresses-partial.mdx`)
from `@arbitrum/sdk` and `scripts/data/contract-addresses.data.ts`, and exits 1 with a line diff if
the committed partial is stale. Never hand-edit that partial; edit the generator or its data file.

### 5. Variables

```shell
pnpm vars:check 2>&1
```

Every `<Var name="…" />` and `{var:name}` resolves to a key in `content/vars.json`, and the banner
keys (`announcementId`, `announcementLinkHref`) are valid.

### 6. Formatting

```shell
pnpm format:check 2>&1
```

Prettier across content and app code without modifying files. `pnpm format` writes the fixes.

### 7. Tests

```shell
pnpm test 2>&1
```

`node --test` over `scripts/**/*.test.ts`: unit coverage for the gate scripts themselves (link
resolution, redirects, variable expansion, and so on), plus `scripts/sidebar.test.ts`, which
builds the real sidebar tree and fails when a page is on no `meta.json` node or on two.

### 8. Frontmatter

```shell
pnpm frontmatter:check 2>&1
```

Runs the page schema from `lib/page-schema.ts` over every page under `content/docs` and prints
`file: field: message` for each violation: a missing `title` or `description`, or a `content_type`
outside the enum. This is the only offline gate that reads frontmatter; `next build` and `next dev`
apply the same schema when they compile a page.

### 9. TypeScript

```shell
pnpm types:check 2>&1
```

Regenerates the `.source/` collection, generates Next types, then runs `tsc --noEmit`. This proves
the types, not the frontmatter and not the render. Confirm content changes in a browser on
`http://localhost:3000` (on `127.0.0.1` React does not hydrate and every component looks broken).

### 10. Build

```shell
pnpm build 2>&1
```

Chains `check-links` ahead of `next build`. Expensive (a full production build), so treat it as the
final confirmation rather than something to iterate against: prefer the faster gates above while
fixing findings, then run this once before calling the audit done.

## Not available

- **Doc manifest audit** (terminology consistency, missing metadata). The frontmatter contract
  (`title` and `description` required; `sidebar_label`, `content_type`, `author`, `sme` optional) is
  the Zod schema in `lib/page-schema.ts`, enforced by `pnpm frontmatter:check` (step 8) and by the
  build. `types:check` does not see it. There is no `user_story` or `draft` field in this schema, so
  don't add one when scaffolding a page. Terminology consistency itself is a `STYLE-GUIDE.md`
  review-time rule, not a gate.

## Output format

Produce a summary table first, then details per check:

```
| Check              | Status    | Issues          |
|--------------------|-----------|-----------------|
| MDX structure      | PASS/FAIL | N defects       |
| Internal links     | PASS/FAIL | N broken        |
| References         | PASS/FAIL | N missing       |
| Contract addresses | PASS/FAIL | N stale         |
| Variables          | PASS/FAIL | N unresolved    |
| Formatting         | PASS/FAIL | N unformatted   |
| Tests              | PASS/FAIL | N failures      |
| Frontmatter        | PASS/FAIL | N violations    |
| TypeScript         | PASS/FAIL | N errors        |
| Build              | PASS/FAIL | N errors        |
```

Then for each FAIL, list:

- File path and line number
- Issue description
- Suggested fix (if auto-fixable, say so)

## Arguments

- No args: run all checks
- `--fix`: auto-fix what's possible (`pnpm format`), then report remaining
- `--quick`: skip `types:check` and `build` (faster, covers content only)
