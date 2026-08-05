# Contributor-facing quicklook generation — design

**Date:** 2026-07-22
**Branch:** `quicklooks-generation`
**Status:** Approved for implementation

## Problem

Glossary "quicklooks" are hover-cards rendered when prose wraps a term in
`<a data-quicklook-from="<key>">term</a>`. The arbitrum-docs repo already has the
**build** and **verify** halves of the pipeline:

- `docs/partials/glossary/_*.mdx` (136 terms, each with a `key` frontmatter field)
  → `scripts/build-glossary.ts` → `static/glossary.json`
- rendered at runtime by `src/components/Quicklooks/index.tsx` (Tippy)
- validated by `scripts/notion-verify-quicklooks.ts` (`yarn notion:verify-quicklooks`),
  which only checks that keys already present in prose exist in the glossary

The **generate** half is missing: nothing inserts `data-quicklook-from` anchors into
prose. Today it is a manual "review-nit" (CLAUDE.md, "Review-nit check before
committing"). A contributor who has never heard of quicklooks will never add them.

The sibling repo `~/dev/pr-review-poster` already solved the matching problem in
`src/glossary.ts` — a fully deterministic (non-LLM) matcher that wraps first mentions
of glossary terms. This project ports that matcher into arbitrum-docs and makes it fire
without the contributor needing to know quicklooks exist.

## Goals

1. A deterministic script that wraps first mentions of glossary terms in a local
   article, previewing by default and applying with a flag.
2. On-demand invocation for contributors who ask ("add quicklooks to my article").
3. **Automatic** invocation so quicklooks land even when the contributor has never
   heard of them — the core requirement.

## Non-goals (YAGNI)

- No diff/PR mode (that is pr-review-poster's job).
- No interactive per-term prompting.
- No config file or env knobs.
- No changes to the existing build / verify / render pipeline.
- No Husky pre-commit integration (deferred; would only serve non-Claude contributors).
- No new runtime dependencies.

## Architecture

Four additive pieces. Nothing existing is modified except two lines of CLAUDE.md and
the `Stop` block of `.claude/settings.json`.

```
                         on-demand (pull)
contributor: "add quicklooks"  ──▶  .claude/skills/quicklooks/SKILL.md
                                          │
                                          ▼
              ┌───────────────────────────────────────────┐
              │  scripts/generate-quicklooks.ts            │
              │  (deterministic matcher, reads             │
              │   static/glossary.json)                    │
              └───────────────────────────────────────────┘
                                          ▲
                         automatic (push) │
CLAUDE.md review-nit  ─────────────────────┤  (A: instruction)
.claude/settings.json Stop hook ──────────┘  (B: check-quicklooks.py)
```

### Component 1 — `scripts/generate-quicklooks.ts`

A port of pr-review-poster's `src/glossary.ts` matcher, adapted for local authoring.
Written in TypeScript, run with `tsx` (the repo's existing script runtime), matching the
style of `scripts/notion-verify-quicklooks.ts`.

**Reused verbatim from the source matcher:**

- `termMatcher(title)` — per-term regex: case-insensitive, word-boundary via lookarounds
  `(?<![A-Za-z0-9]) … (?![A-Za-z0-9])`, optional trailing plural `(?:e?s)?` when the
  title ends alphanumeric.
- `maskExclusions(line)` — blanks (equal-length spaces, preserving indices) inline code
  `` `...` ``, existing `<a>…</a>` anchors, markdown links/images, and HTML/JSX tags, so
  terms inside them are not wrapped.
- `excludedLines(lines)` — whole-line exclusions: YAML frontmatter, fenced code blocks,
  ATX headings, MDX `import`/`export` lines.
- First-mention-only; one anchor per line; `MIN_TITLE_LENGTH = 2`.

**Adaptations for local authoring:**

1. **Key source → local file.** Read `static/glossary.json` from disk (shape
   `Record<key, { title: string; text: string }>`); match on `title`, wrap with `key`.
   No remote fetch. If the file is missing or malformed, fail fast with a message telling
   the contributor to run `yarn build-glossary`.
2. **Drop the diff gate.** Consider all lines of the file, not just changed/context lines.
   (The source's `firstInDiffMatches` gated on `DiffInfo`; that parameter is removed.)
3. **Double-wrap guard (new logic).** If a term is already wrapped in a
   `data-quicklook-from` anchor **anywhere** in the file, skip that term entirely.
   Without this, whole-file mode would mask out the already-linked first mention and wrap
   the _second_ occurrence, producing two anchors for one term. This case did not arise
   under diff-scoping, so it is new.

**Generated syntax** (unchanged from source):
`<a data-quicklook-from="<key>"><original text></a>` — only the matched span is wrapped;
original casing/plural is preserved because the visible text is sliced from the source
line.

**CLI:** `tsx scripts/generate-quicklooks.ts <file.mdx> [--check | --write]`

| Mode        | Behavior                                                              | Exit |
| ----------- | --------------------------------------------------------------------- | ---- |
| _(default)_ | Preview: print a `line → key (display text)` table + count. No write. | 0    |
| `--check`   | Same detection; exit 1 if any unwrapped first-mentions exist.         | 0/1  |
| `--write`   | Apply anchors in place.                                               | 0    |

Registered as `"generate-quicklooks": "tsx scripts/generate-quicklooks.ts"` in
`package.json`, so `yarn generate-quicklooks <file> [--check|--write]`.

### Component 2 — `.claude/skills/quicklooks/SKILL.md`

Model-invocable skill (triggers: "add quicklooks", "wrap glossary terms", "quicklook my
article"). Follows the format of the repo's existing 15 skills. Instructs Claude to:

1. Run `yarn generate-quicklooks <file>` (preview) on the target file(s).
2. Show the contributor the proposed `line → key` table.
3. On confirmation, run `yarn generate-quicklooks <file> --write`.
4. Run `yarn notion:verify-quicklooks` to prove every inserted key exists.
5. Tell the contributor to review `git diff <file>`.

Also documents the conventions (display text may differ from key; first mention per page)
so Claude handles borderline calls correctly.

### Component 3 — CLAUDE.md upgrade (push mechanism A)

The existing "Review-nit check before committing" → "Glossary quicklooks" bullet changes
from "manually wrap the first mention…" to instruct running
`yarn generate-quicklooks <file> --write`. Every Claude Code session that follows CLAUDE.md
at the pre-commit step then adds quicklooks automatically. Surgical two-line edit; the
frequently-missed-terms list and display-text note are preserved.

### Component 4 — Stop hook (push mechanism B)

`.claude/hooks/check-quicklooks.py` (Python 3, stdlib only — `json`, `subprocess`,
`sys`; matches the existing `guard-raster-assets.py`). Registered under the `Stop` event
in `.claude/settings.json`.

**Verified Stop-hook contract** (code.claude.com/docs/en/hooks):

- stdin JSON includes `stop_hook_active` (bool) and `cwd`; it does **not** list edited
  files. `matcher` is ignored for `Stop` — the hook fires on every turn end.
- Exit 2 with a stderr message blocks the stop and shows the message to Claude; exit 0
  allows the stop.

**Algorithm:**

1. Read stdin JSON. If `stop_hook_active` is true → `exit 0` (allow stop; caps the hook at
   one block cycle, guaranteeing no loop).
2. Determine changed docs: `git diff --name-only HEAD` + untracked files, filtered to
   `docs/**/*.mdx`. None → `exit 0`.
3. For each changed doc, run `yarn generate-quicklooks <file> --check`. **Fail-soft:** any
   error (missing `tsx`, missing `glossary.json`, non-0/1 exit) → `exit 0`. Never block a
   session on tooling failure.
4. If any file reports unwrapped first-mentions → `exit 2` with stderr:
   `article.mdx: N glossary terms unwrapped (parent-chain L12, sequencer L14, …). Run: yarn generate-quicklooks docs/…/article.mdx --write`
   Clean → `exit 0`.

**Loop termination:** first stop → hook blocks with the fix command → Claude runs
`--write`, terms get wrapped → Claude stops again → `stop_hook_active` is now true (and
`--check` would pass anyway) → hook allows stop. One cycle.

## Data flow (end to end)

```
contributor edits docs/…/article.mdx
  │
  ├─ asks Claude "add quicklooks"  ─▶ skill ─▶ preview ─▶ confirm ─▶ --write ─▶ verify
  │
  └─ never mentions quicklooks
       ├─ Claude follows CLAUDE.md at commit time ─▶ runs --write        (A)
       └─ Claude tries to stop ─▶ Stop hook checks changed docs
                                  ─▶ blocks with fix command ─▶ Claude --write (B)
```

## Error handling

| Condition                           | Behavior                                        |
| ----------------------------------- | ----------------------------------------------- |
| `static/glossary.json` missing/bad  | Script: fail fast, "run `yarn build-glossary`". |
| File arg missing / not `.md`/`.mdx` | Script: usage error, exit 1.                    |
| Zero matches                        | Script: exit 0, "no glossary terms to wrap".    |
| `--write` with zero matches         | No file mutation (no mtime change).             |
| Hook: any tooling failure           | `exit 0` — never block the session.             |
| Hook: `stop_hook_active` true       | `exit 0` — prevents loop.                       |

## Testing

Colocated `scripts/generate-quicklooks.test.ts`, run with the repo's existing test
runner: Node's built-in `node:test` + `node:assert` via `tsx --test` (matching
`test:llms-tracking` and `test:codemod` in `package.json`). A `test:quicklooks` script is
added. Cases, each a small in-memory `.mdx` string:

- Basic first-mention wrap produces the exact `<a data-quicklook-from="key">term</a>`.
- Plural match (`sequencers` → key `sequencer`).
- Case-insensitive match preserves original casing in output.
- Skip inside: fenced code block, ATX heading, YAML frontmatter, MDX import line,
  inline code span, existing anchor, markdown link.
- **Double-wrap guard:** term already wrapped earlier in file → second occurrence NOT
  wrapped.
- One-anchor-per-line dedup.
- `--check` exits 1 when unwrapped terms exist, 0 when clean.
- Preview (default) does **not** mutate the file; `--write` does.

Verify each test fails before the corresponding logic exists (or by mutation).

## Files touched

**New:**

- `scripts/generate-quicklooks.ts`
- `scripts/generate-quicklooks.test.ts`
- `.claude/skills/quicklooks/SKILL.md`
- `.claude/hooks/check-quicklooks.py`

**Modified:**

- `package.json` (two script entries: `generate-quicklooks`, `test:quicklooks`)
- `CLAUDE.md` (review-nit bullet, ~2 lines)
- `.claude/settings.json` (add `Stop` hook block)

## Open confirmations (settled at design time)

- Glossary key source: **local `static/glossary.json`** (not remote fetch).
- After `--write`, the skill runs **`yarn notion:verify-quicklooks`**.
- Stop hook is **always-on** (matcher ignored); cheap when no docs changed (git check only).
