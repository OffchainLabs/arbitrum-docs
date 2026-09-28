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
admonitions, and other hydration-breaking or parser-ambiguous MDX shapes (see the content-lint rules
in the project's `CLAUDE.md`). Not auto-fixable: each finding is an edit.

### 2. Internal links

```shell
pnpm check-links 2>&1
```

Every internal doc link resolves to a real page. This is the gate that supplies Fumadocs'
`onBrokenLinks: 'throw'`, and `pnpm build` runs it first, so a failure here also fails the Vercel
deploy. It does **not** validate `#anchor` fragments — a live page with a dead anchor passes. Check
those in a browser.

### 3. Glossary and inline references

```shell
pnpm references:check 2>&1
```

Every `<Term>` / `<ReferenceList>` target resolves to a real `content/glossary/` entry.

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

Every `<Var name="…" />` resolves to a key in `content/vars.json`.

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
resolution, nav rules, redirects, variable expansion, and so on).

### 8. TypeScript

```shell
pnpm types:check 2>&1
```

Regenerates the `.source/` collection, generates Next types, then runs `tsc --noEmit`. This proves
the frontmatter schema and the types — it does **not** prove a page renders. Confirm content changes
in a browser on `http://localhost:3000` (on `127.0.0.1` React does not hydrate and every component
looks broken).

### 9. Build

```shell
pnpm build 2>&1
```

Chains `check-links` ahead of `next build`. Expensive (a full production build), so treat it as the
final confirmation rather than something to iterate against: prefer the faster gates above while
fixing findings, then run this once before calling the audit done.

## Not available

- **Orphan pages**: pages absent from every sidebar. Nothing in this toolchain reports what a
  `meta.json` omits, only what it claims incorrectly (frontmatter validation, dead links). Don't
  claim this was checked.
- **Doc manifest audit** (terminology consistency, missing metadata). The frontmatter contract
  (`title` and `description` required; `sidebar_label`, `content_type`, `author`, `sme` optional) is
  enforced at build time by the Zod schema in `source.config.ts`, which fails `types:check` on a
  missing or invalid field. There is no `user_story` or `draft` field in this schema, so don't add
  one when scaffolding a page. Terminology consistency itself is a `STYLE-GUIDE.md` review-time rule,
  not a gate.

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
