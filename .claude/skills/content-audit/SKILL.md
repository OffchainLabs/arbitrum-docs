---
name: content-audit
description: Run full documentation quality audit — MDX structure, internal links, nav integrity, partials, glossary references, variables, formatting, and types. Triggers on "audit docs", "check docs quality", "find problems", "content audit".
disable-model-invocation: true
---

# Content Audit

Orchestrate all doc quality checks into a single unified report.

## Checks (run in order)

### 1. MDX structure

```shell
pnpm content:lint 2>&1
```

Reports structural MDX defects: stray `:::` fences left by the Docusaurus migration, malformed
admonitions, and link targets that keep a `.md`/`.mdx` suffix. Not auto-fixable — each finding is an
edit.

### 2. Internal links

```shell
pnpm check-links 2>&1
```

Every internal doc link resolves to a real page. This is the gate that stands in for Docusaurus'
`onBrokenLinks: 'throw'`, and `pnpm build` runs it first, so a failure here also fails the Vercel
deploy. It does **not** validate `#anchor` fragments — a live page with a dead anchor passes. Check
those in a browser.

### 3. Nav integrity

```shell
pnpm nav:check 2>&1
```

Validates the `meta.json` files that control sidebar ordering: entries pointing at pages that do not
exist, and pages missing from their directory's nav.

### 4. Partials

```shell
pnpm partials:check 2>&1
```

Resolves every `<include>` and ESM import, confirms no partial leaks into routing, and confirms
`content/partials/CATALOG.md` is current. Regenerate the catalog with `pnpm partials:catalog` — never
hand-edit it.

### 5. Glossary and inline references

```shell
pnpm references:check 2>&1
```

Every `<Reference>` / `<Term>` target resolves to a real `content/glossary/` entry.

### 6. Variables

```shell
pnpm vars:check 2>&1
```

Every `<Var name="…" />` resolves to a key in `content/vars.json`.

### 7. Formatting

```shell
pnpm format:check 2>&1
```

Prettier across content and app code without modifying files. `pnpm format` writes the fixes.

### 8. TypeScript

```shell
pnpm types:check 2>&1
```

Regenerates the `.source/` collection, generates Next types, then runs `tsc --noEmit`. This proves
the frontmatter schema and the types — it does **not** prove a page renders. Confirm content changes
in a browser on `http://localhost:3000` (on `127.0.0.1` React does not hydrate and every component
looks broken).

## Not available

Two checks from the Docusaurus toolchain have no Fumadocs equivalent. Do not substitute another
command for them — say they were not run:

- **Orphan pages** (`find-orphan-pages`) — pages absent from every sidebar. `nav:check` validates
  what `meta.json` claims, not what it omits.
- **Doc manifest audit** (`audit-docs`) — missing `user_story`, terminology consistency. The
  frontmatter half is now enforced at build time by the Zod schema in `source.config.ts`, which fails
  `types:check` on a missing `title`, `description`, `content_type`, `author` or `sme`.

## Output format

Produce a summary table first, then details per check:

```
| Check            | Status    | Issues          |
|------------------|-----------|-----------------|
| MDX structure    | PASS/FAIL | N defects       |
| Internal links   | PASS/FAIL | N broken        |
| Nav integrity    | PASS/FAIL | N problems      |
| Partials         | PASS/FAIL | N unresolved    |
| References       | PASS/FAIL | N missing       |
| Variables        | PASS/FAIL | N unresolved    |
| Formatting       | PASS/FAIL | N unformatted   |
| TypeScript       | PASS/FAIL | N errors        |
```

Then for each FAIL, list:

- File path and line number
- Issue description
- Suggested fix (if auto-fixable, say so)

## Arguments

- No args: run all checks
- `--fix`: auto-fix what's possible (`pnpm format`), then report remaining
- `--quick`: skip `types:check` (faster, covers content only)
