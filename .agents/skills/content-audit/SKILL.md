---
name: content-audit
description: Run full documentation quality audit — orphan pages, markdown lint, frontmatter validation, globalVars consistency, and broken internal links. Triggers on "audit docs", "check docs quality", "find problems", "content audit".
disable-model-invocation: true
---

# Content Audit

Orchestrate all doc quality checks into a single unified report.

## Checks (run in order)

### 1. Markdown lint

```shell
yarn lint:markdown 2>&1
```

Captures all markdownlint violations (excludes `docs/sdk/`). If violations found, offer `yarn lint:markdown:fix` for auto-fixable issues.

### 2. Orphan pages

```shell
yarn find-orphan-pages
```

Finds docs not linked in any sidebar. Cross-reference with `sidebars.js` to confirm.

### 3. Orphaned files

```shell
node scripts/find-orphaned-files.js
```

Finds files in `docs/` that aren't referenced anywhere (images, partials, etc.).

### 4. Doc manifest + audit

```shell
yarn audit-docs
```

Generates a doc manifest then audits for: missing frontmatter fields, broken internal links, inconsistent terminology, missing `user_story`, and undocumented content types.

### 5. GlobalVars consistency

```shell
yarn check-globalvars-updates 2>&1 || true
```

Checks if `src/resources/globalVars.js` has been modified without running `yarn update-variable-refs`. If stale, report which files need updating.

### 6. Formatting check

```shell
yarn format:check 2>&1
```

Checks Prettier formatting across docs and app code without modifying files.

### 7. TypeScript

```shell
yarn typecheck 2>&1
```

Runs `tsc --noEmit` to catch type errors in components and scripts.

## Output format

Produce a summary table first, then details per check:

```
| Check               | Status | Issues |
|---------------------|--------|--------|
| Markdown lint       | PASS/FAIL | N violations |
| Orphan pages        | PASS/FAIL | N orphans |
| Orphaned files      | PASS/FAIL | N unused files |
| Doc audit           | PASS/FAIL | N issues |
| GlobalVars sync     | PASS/FAIL | N stale refs |
| Formatting          | PASS/FAIL | N unformatted |
| TypeScript          | PASS/FAIL | N errors |
```

Then for each FAIL, list:

- File path and line number
- Issue description
- Suggested fix (if auto-fixable, say so)

## Arguments

- No args: run all checks
- `--fix`: auto-fix what's possible (lint, format), then report remaining
- `--quick`: skip typecheck and full build (faster, covers content only)
