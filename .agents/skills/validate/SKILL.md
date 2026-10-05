---
name: validate
description: Run full validation cycle (lint, typecheck, build, test) and fix errors. Delegates to engineer. Triggers on "validate", "run checks", "verify build", "run tests".
agent: engineer
---

# Full Validation

Delegates to `engineer` to run validation and fix errors iteratively.

## Process

1. **Detect** project type (package.json, Cargo.toml, etc.)
2. **Run** validation commands:
   - This repository: `pnpm content:lint`, `pnpm frontmatter:check`, `pnpm types:check`,
     `pnpm test`, and `pnpm build`. Run the other CI gates listed in `AGENTS.md` as appropriate.
   - Other Node projects: read `package.json` and run the available validation scripts.
   - Rust: `cargo clippy && cargo build && cargo test`
   - Foundry: `forge build && forge test`
3. **Fix** each failure, re-run to verify
4. **Iterate** until all pass or report blockers

## Output

```text
| Check | Status |
|-------|--------|
| Lint  | PASS/FAIL |
| Types | PASS/FAIL |
| Build | PASS/FAIL |
| Tests | PASS/FAIL |
```
