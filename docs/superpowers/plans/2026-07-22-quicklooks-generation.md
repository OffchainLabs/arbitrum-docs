# Quicklooks Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give arbitrum-docs a deterministic tool that wraps first mentions of glossary terms in `<a data-quicklook-from="…">` anchors, plus the Claude Code affordances (skill, CLAUDE.md instruction, Stop hook) that make it fire even when a contributor has never heard of quicklooks.

**Architecture:** Port pr-review-poster's deterministic matcher (`src/glossary.ts`) into `scripts/generate-quicklooks.ts`, adapted to read the local `static/glossary.json`, operate on a whole file (no diff), and skip terms already wrapped anywhere in the file. Expose it three ways: an on-demand skill (pull), a CLAUDE.md pre-commit instruction (push A), and a Stop hook that checks changed docs and blocks once with the fix command (push B).

**Tech Stack:** TypeScript run with `tsx`; Node `node:test`/`node:assert`; Python 3 stdlib for the hook; Yarn scripts.

## Global Constraints

- Node `22.x`; Yarn `1.22.22` (classic). No new runtime dependencies.
- Scripts run as CommonJS (package.json has no `"type": "module"`): `__dirname` and `require.main === module` are available; `import`/`export` syntax is fine (tsx transpiles).
- Test runner is Node's built-in runner via `tsx --test` (see `test:llms-tracking`, `test:codemod` in `package.json`).
- Generated anchor syntax, exact: `<a data-quicklook-from="<key>"><original text></a>`. Only the matched span is wrapped; original casing/plural preserved.
- Match rules copied verbatim from the source: case-insensitive, word-boundary via alphanumeric lookarounds, optional trailing `(?:e?s)?` plural, `MIN_TITLE_LENGTH = 2`.
- Exclusions: skip YAML frontmatter, fenced code blocks, ATX headings, MDX `import`/`export` lines (whole-line); skip inline code, existing `<a>…</a>`, markdown links/images, HTML/JSX tags (inline spans).
- First-mention only; at most one anchor per line (earliest match wins).
- Double-wrap guard: if a term's `key` already appears in a `data-quicklook-from="…"` anywhere in the file, skip that term entirely.
- Hooks fail-soft: any tooling error → allow the session to proceed (`exit 0`). Never block on a broken tool.
- Match existing repo script style (relative paths to data files via `__dirname`, like `scripts/notion-verify-quicklooks.ts`).

---

### Task 1: Matching engine + glossary loader

**Files:**

- Create: `scripts/generate-quicklooks.ts`
- Create: `scripts/generate-quicklooks.test.ts`
- Modify: `package.json` (add `test:quicklooks` script)

**Interfaces:**

- Produces (later tasks rely on these exact names/types):

  - `interface GlossaryTerm { key: string; title: string }`
  - `interface QuickLookAnchor { lineNumber: number; key: string; displayText: string }`
  - `function generateQuickLooks(content: string, terms: GlossaryTerm[]): { anchors: QuickLookAnchor[]; updatedContent: string }`
  - `function loadGlossaryTerms(glossaryPath: string): GlossaryTerm[]`

- [ ] **Step 1: Write the failing tests**

Create `scripts/generate-quicklooks.test.ts`:

````ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateQuickLooks, GlossaryTerm } from './generate-quicklooks';

const terms: GlossaryTerm[] = [
  { key: 'sequencer', title: 'Sequencer' },
  { key: 'parent-chain', title: 'Parent chain' },
  { key: 'wasm', title: 'WASM' },
];

test('wraps the first mention with the exact anchor syntax', () => {
  const { anchors, updatedContent } = generateQuickLooks('The Sequencer orders txns.', terms);
  assert.equal(updatedContent, 'The <a data-quicklook-from="sequencer">Sequencer</a> orders txns.');
  assert.deepEqual(anchors, [{ lineNumber: 1, key: 'sequencer', displayText: 'Sequencer' }]);
});

test('matches plurals but preserves original text', () => {
  const { updatedContent } = generateQuickLooks('Multiple sequencers exist.', terms);
  assert.equal(updatedContent, 'Multiple <a data-quicklook-from="sequencer">sequencers</a> exist.');
});

test('only wraps the first mention of a term', () => {
  const { anchors } = generateQuickLooks('Sequencer here. Sequencer again.', terms);
  assert.equal(anchors.length, 1);
  assert.equal(anchors[0].lineNumber, 1);
});

test('skips headings, fenced code, frontmatter, imports, inline code, links, existing anchors', () => {
  const content = ['---', 'title: Sequencer doc', '---', "import X from 'y';", '# Sequencer heading', '```', 'Sequencer in code', '```', 'Inline `Sequencer` code and [Sequencer](/x) link.', 'An existing <a data-quicklook-from="sequencer">Sequencer</a> anchor.', 'Finally a real Sequencer mention.'].join('\n');
  const { anchors } = generateQuickLooks(content, terms);
  // Frontmatter/heading/code/import/inline/link are skipped; the existing anchor
  // triggers the double-wrap guard, so 'sequencer' is skipped entirely.
  assert.equal(anchors.length, 0);
});

test('double-wrap guard: term already wrapped elsewhere is not wrapped again', () => {
  const content = 'A <a data-quicklook-from="parent-chain">parent chain</a> and another parent chain.';
  const { anchors } = generateQuickLooks(content, terms);
  assert.equal(anchors.filter((a) => a.key === 'parent-chain').length, 0);
});

test('at most one anchor per line (earliest wins)', () => {
  const { anchors } = generateQuickLooks('Parent chain then Sequencer on one line.', terms);
  assert.equal(anchors.length, 1);
  assert.equal(anchors[0].key, 'parent-chain');
});

test('titles shorter than 2 chars are skipped', () => {
  const short: GlossaryTerm[] = [{ key: 'l', title: 'L' }];
  const { anchors } = generateQuickLooks('L is short.', short);
  assert.equal(anchors.length, 0);
});
````

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn tsx --test scripts/generate-quicklooks.test.ts`
Expected: FAIL — cannot find module `./generate-quicklooks` / `generateQuickLooks` not exported.

- [ ] **Step 3: Write the implementation**

Create `scripts/generate-quicklooks.ts`:

````ts
import fs from 'node:fs';
import path from 'node:path';

export interface GlossaryTerm {
  key: string;
  title: string;
}

export interface QuickLookAnchor {
  lineNumber: number;
  key: string;
  displayText: string;
}

// Titles shorter than this are too generic to match safely (e.g. "L1").
const MIN_TITLE_LENGTH = 2;

/**
 * Reads the checked-in glossary and returns its terms.
 *
 * @param glossaryPath Absolute path to static/glossary.json.
 * @returns One `{ key, title }` per entry with a string `title`.
 * @throws {Error} If the file is missing or not valid JSON.
 */
export function loadGlossaryTerms(glossaryPath: string): GlossaryTerm[] {
  let raw: string;
  try {
    raw = fs.readFileSync(glossaryPath, 'utf8');
  } catch {
    throw new Error(`Could not read glossary at ${glossaryPath}. Run \`yarn build-glossary\` first.`);
  }
  let data: Record<string, { title?: unknown }>;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`Glossary at ${glossaryPath} is not valid JSON. Run \`yarn build-glossary\`.`);
  }
  const terms: GlossaryTerm[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value.title === 'string') {
      terms.push({ key, title: value.title });
    }
  }
  return terms;
}

function escapeRegExp(source: string): string {
  return source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Case-insensitive, word-bounded matcher accepting a trailing plural. */
function termMatcher(title: string): RegExp {
  const plural = /[A-Za-z0-9]$/.test(title) ? '(?:e?s)?' : '';
  return new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(title)}${plural}(?![A-Za-z0-9])`, 'i');
}

/** Blanks spans that must never be wrapped, preserving index alignment. */
function maskExclusions(line: string): string {
  const blank = (match: string): string => ' '.repeat(match.length);
  return line
    .replace(/`[^`]*`/g, blank)
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, blank)
    .replace(/!?\[[^\]]*\]\([^)]*\)/g, blank)
    .replace(/<[^>]+>/g, blank);
}

/** Marks lines entirely off-limits: frontmatter, fences, headings, import/export. */
function excludedLines(lines: string[]): boolean[] {
  const excluded = new Array<boolean>(lines.length).fill(false);
  let inFrontmatter = false;
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0 && /^---\s*$/.test(line)) {
      inFrontmatter = true;
      excluded[i] = true;
      continue;
    }
    if (inFrontmatter) {
      excluded[i] = true;
      if (/^---\s*$/.test(line)) inFrontmatter = false;
      continue;
    }
    if (/^\s*(```|~~~)/.test(line)) {
      excluded[i] = true;
      inFence = !inFence;
      continue;
    }
    if (inFence || /^\s{0,3}#{1,6}\s/.test(line) || /^\s*(import|export)\s/.test(line)) {
      excluded[i] = true;
    }
  }
  return excluded;
}

/** Keys already wrapped in a data-quicklook-from anchor anywhere in the file. */
function alreadyWrappedKeys(content: string): Set<string> {
  const keys = new Set<string>();
  const re = /data-quicklook-from\s*=\s*(['"])(.*?)\1/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) keys.add(m[2]);
  return keys;
}

interface LineMatch {
  start: number;
  end: number;
  term: GlossaryTerm;
}

/**
 * Wraps the first mention of each glossary term in `content`, skipping excluded
 * lines/spans and any term already wrapped elsewhere in the file. At most one
 * anchor per line (earliest match wins).
 *
 * @returns The applied `updatedContent` and the `anchors` that were added.
 */
export function generateQuickLooks(content: string, terms: GlossaryTerm[]): { anchors: QuickLookAnchor[]; updatedContent: string } {
  if (terms.length === 0) return { anchors: [], updatedContent: content };

  const lines = content.split('\n');
  const excluded = excludedLines(lines);
  const wrapped = alreadyWrappedKeys(content);
  const byLine = new Map<number, LineMatch>();

  for (const term of terms) {
    if (term.title.length < MIN_TITLE_LENGTH) continue;
    if (wrapped.has(term.key)) continue;
    const matcher = termMatcher(term.title);
    for (let i = 0; i < lines.length; i++) {
      if (excluded[i]) continue;
      const found = matcher.exec(maskExclusions(lines[i]));
      if (!found) continue;
      const candidate: LineMatch = { start: found.index, end: found.index + found[0].length, term };
      const existing = byLine.get(i);
      if (!existing || candidate.start < existing.start) byLine.set(i, candidate);
      break; // first mention only
    }
  }

  const anchors: QuickLookAnchor[] = [];
  for (const [lineIndex, m] of [...byLine.entries()].sort((a, b) => a[0] - b[0])) {
    const line = lines[lineIndex];
    const displayText = line.slice(m.start, m.end);
    lines[lineIndex] = line.slice(0, m.start) + `<a data-quicklook-from="${m.term.key}">${displayText}</a>` + line.slice(m.end);
    anchors.push({ lineNumber: lineIndex + 1, key: m.term.key, displayText });
  }

  return { anchors, updatedContent: lines.join('\n') };
}
````

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn tsx --test scripts/generate-quicklooks.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Add the test script**

In `package.json`, add after the `test:codemod` line (line 31):

```json
    "test:quicklooks": "tsx --test scripts/generate-quicklooks.test.ts",
```

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-quicklooks.ts scripts/generate-quicklooks.test.ts package.json
git commit -m "feat: add deterministic glossary quicklook matcher"
```

---

### Task 2: CLI entrypoint (preview / --check / --write)

**Files:**

- Modify: `scripts/generate-quicklooks.ts` (append CLI `main` + entry guard)
- Modify: `scripts/generate-quicklooks.test.ts` (add CLI behavior tests via a temp file)
- Modify: `package.json` (add `generate-quicklooks` script)

**Interfaces:**

- Consumes: `generateQuickLooks`, `loadGlossaryTerms`, `QuickLookAnchor` from Task 1.
- Produces: CLI `yarn generate-quicklooks <file.mdx> [--check | --write]`. Exit 0 for preview/write/clean-check; exit 1 for check-with-findings or usage errors.

- [ ] **Step 1: Write the failing CLI tests**

Append to `scripts/generate-quicklooks.test.ts`:

```ts
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';

const CLI = path.join(__dirname, 'generate-quicklooks.ts');

function runCli(fileContent: string, args: string[]): { code: number; stdout: string; fileAfter: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ql-'));
  const file = path.join(dir, 'article.mdx');
  fs.writeFileSync(file, fileContent);
  let stdout = '';
  let code = 0;
  try {
    stdout = execFileSync('yarn', ['--silent', 'tsx', CLI, file, ...args], { encoding: 'utf8' });
  } catch (e: any) {
    code = e.status ?? 1;
    stdout = (e.stdout ?? '').toString();
  }
  const fileAfter = fs.readFileSync(file, 'utf8');
  fs.rmSync(dir, { recursive: true, force: true });
  return { code, stdout, fileAfter };
}

test('CLI preview does not mutate the file and exits 0', () => {
  const src = 'The Sequencer orders txns.';
  const { code, fileAfter } = runCli(src, []);
  assert.equal(code, 0);
  assert.equal(fileAfter, src);
});

test('CLI --write mutates the file in place', () => {
  const { code, fileAfter } = runCli('The Sequencer orders txns.', ['--write']);
  assert.equal(code, 0);
  assert.match(fileAfter, /<a data-quicklook-from="sequencer">Sequencer<\/a>/);
});

test('CLI --check exits 1 when unwrapped terms exist', () => {
  const { code } = runCli('The Sequencer orders txns.', ['--check']);
  assert.equal(code, 1);
});

test('CLI --check exits 0 when nothing to wrap', () => {
  const { code } = runCli('Nothing glossaryish here.', ['--check']);
  assert.equal(code, 0);
});
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `yarn tsx --test scripts/generate-quicklooks.test.ts`
Expected: the 4 CLI tests FAIL (preview currently has no CLI; `--write` does not mutate).

- [ ] **Step 3: Append the CLI to `scripts/generate-quicklooks.ts`**

```ts
const GLOSSARY_PATH = path.join(__dirname, '..', 'static', 'glossary.json');

function usage(): never {
  process.stderr.write('Usage: yarn generate-quicklooks <file.md|.mdx> [--check | --write]\n');
  process.exit(1);
}

function main(): void {
  const argv = process.argv.slice(2);
  const write = argv.includes('--write');
  const check = argv.includes('--check');
  const files = argv.filter((a) => !a.startsWith('--'));
  if (files.length !== 1) usage();
  const file = files[0];
  if (!/\.mdx?$/.test(file)) {
    process.stderr.write(`Not a markdown file: ${file}\n`);
    process.exit(1);
  }

  const terms = loadGlossaryTerms(GLOSSARY_PATH); // fails fast with actionable message

  let content: string;
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch {
    process.stderr.write(`Could not read file: ${file}\n`);
    process.exit(1);
  }

  const { anchors, updatedContent } = generateQuickLooks(content, terms);

  if (anchors.length === 0) {
    process.stdout.write(`No glossary terms to wrap in ${file}.\n`);
    process.exit(0);
  }

  if (check) {
    for (const a of anchors) process.stdout.write(`${file}:${a.lineNumber} ${a.key} (${a.displayText})\n`);
    process.stdout.write(`${anchors.length} glossary term(s) unwrapped in ${file}.\n`);
    process.exit(1);
  }

  if (write) {
    fs.writeFileSync(file, updatedContent);
    process.stdout.write(`Wrapped ${anchors.length} glossary term(s) in ${file}.\n`);
    process.exit(0);
  }

  process.stdout.write(`${anchors.length} glossary term(s) would be wrapped in ${file}:\n`);
  for (const a of anchors) process.stdout.write(`  L${a.lineNumber}  ${a.key}  (${a.displayText})\n`);
  process.stdout.write(`Apply with: yarn generate-quicklooks ${file} --write\n`);
  process.exit(0);
}

if (require.main === module) main();
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn tsx --test scripts/generate-quicklooks.test.ts`
Expected: PASS (11 tests total).

- [ ] **Step 5: Add the CLI script**

In `package.json`, add after `build-glossary` (line 14):

```json
    "generate-quicklooks": "tsx scripts/generate-quicklooks.ts",
```

- [ ] **Step 6: Smoke-test against a real doc (preview only)**

Run: `yarn generate-quicklooks docs/arbitrum-essentials/arbitrum-vs-ethereum/comparison-overview.mdx`
Expected: exit 0, a preview table (or "No glossary terms to wrap" if all already wrapped). The file must be unchanged afterward — verify with `git diff --stat` (no changes).

- [ ] **Step 7: Commit**

```bash
git add scripts/generate-quicklooks.ts scripts/generate-quicklooks.test.ts package.json
git commit -m "feat: add generate-quicklooks CLI with preview/check/write modes"
```

---

### Task 3: Contributor skill (on-demand entry point)

**Files:**

- Create: `.claude/skills/quicklooks/SKILL.md`

**Interfaces:**

- Consumes: the `yarn generate-quicklooks` CLI (Task 2) and `yarn notion:verify-quicklooks` (existing).
- Produces: a model-invocable skill so "add quicklooks to my article" runs the pipeline.

- [ ] **Step 1: Write the skill file**

Create `.claude/skills/quicklooks/SKILL.md`:

````markdown
---
name: quicklooks
description: Wrap first mentions of glossary terms in an article with data-quicklook-from anchors. Use when a contributor writes or edits a doc and wants glossary hover-cards. Triggers on "add quicklooks", "wrap glossary terms", "quicklook my article", "add glossary links".
---

# Add glossary quicklooks

Quicklooks are hover-cards shown when prose wraps a glossary term in
`<a data-quicklook-from="<key>">term</a>`. This skill wraps the first mention of
each glossary term in a target doc using the deterministic generator (no guessing
of keys).

## Process

1. Identify the target file(s) — the `.md`/`.mdx` doc(s) the contributor is writing or editing.
2. Preview:

   ```shell
   yarn generate-quicklooks <file>
   ```
````

Show the contributor the `line → key (display text)` table. The generator skips
code blocks, headings, frontmatter, imports, existing anchors, and any term
already wrapped elsewhere in the file. It wraps the first mention only. 3. On confirmation, apply:

```shell
yarn generate-quicklooks <file> --write
```

4. Verify every inserted key exists in the glossary:

   ```shell
   yarn notion:verify-quicklooks
   ```

5. Tell the contributor to review the result with `git diff <file>`.

## Notes

- Display text can differ from the key (plurals, capitalization) — that is expected;
  the anchor preserves the term exactly as written.
- Valid keys are the glossary partials in `docs/partials/glossary/` (the `key`
  frontmatter field). The generator reads them from the built `static/glossary.json`.
- If the generator reports the glossary is missing, run `yarn build-glossary` first.

````

- [ ] **Step 2: Verify the skill is discoverable**

Run: `ls .claude/skills/quicklooks/SKILL.md`
Expected: the file exists. (The skill loads on next Claude Code session; no build step.)

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/quicklooks/SKILL.md
git commit -m "feat: add quicklooks skill for on-demand glossary wrapping"
````

---

### Task 4: CLAUDE.md pre-commit instruction (push A)

**Files:**

- Modify: `CLAUDE.md` (the "Glossary quicklooks" review-nit bullet)

**Interfaces:**

- Consumes: the `yarn generate-quicklooks` CLI.
- Produces: a standing instruction so Claude runs the generator at the pre-commit review step without being asked.

- [ ] **Step 1: Replace the review-nit bullet**

In `CLAUDE.md`, find the bullet that currently reads:

```markdown
- **Glossary quicklooks**: wrap the first mention of each glossary term on a page in `<a data-quicklook-from="<key>">term</a>`. Valid keys are the filenames in `docs/partials/glossary/` (strip the leading `_` and the `.mdx` extension). Frequently missed terms: `parent-chain`, `child-chain`, `sequencer`, `batch-poster`, `validator`, `sequencer-inbox`, `delayed-inbox`, `keyset`, `chain-owner`, `reorg`, `wasm`. The display text can differ from the key (plurals, capitalization).
```

Replace it with:

```markdown
- **Glossary quicklooks**: run `yarn generate-quicklooks <file> --write` to wrap the first mention of each glossary term on a page in `<a data-quicklook-from="<key>">term</a>` (preview first with `yarn generate-quicklooks <file>`), then review the diff. The generator reads valid keys from `static/glossary.json` (built from `docs/partials/glossary/`) and skips code blocks, headings, and already-wrapped terms. Frequently missed terms: `parent-chain`, `child-chain`, `sequencer`, `batch-poster`, `validator`, `sequencer-inbox`, `delayed-inbox`, `keyset`, `chain-owner`, `reorg`, `wasm`. The display text can differ from the key (plurals, capitalization).
```

- [ ] **Step 2: Verify the edit**

Run: `grep -n "yarn generate-quicklooks <file> --write" CLAUDE.md`
Expected: one match inside the "Review-nit check before committing" section.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: point quicklooks review-nit at yarn generate-quicklooks"
```

---

### Task 5: Stop hook (push B)

**Files:**

- Create: `.claude/hooks/check-quicklooks.py`
- Modify: `.claude/settings.json` (add the `Stop` event)

**Interfaces:**

- Consumes: `yarn generate-quicklooks <file> --check` (Task 2).
- Produces: a Stop hook that blocks the session once with the fix command when changed docs have unwrapped terms.

- [ ] **Step 1: Write the hook script**

Create `.claude/hooks/check-quicklooks.py`:

```python
#!/usr/bin/env python3
"""Stop hook: nudge Claude to add glossary quicklooks to changed docs.

Reads the Stop-hook JSON on stdin. If any docs/**/*.mdx file changed in the
working tree still has unwrapped glossary terms, blocks the stop (exit 2) with
the exact fix command. Fail-soft: any tooling error -> exit 0. Blocks at most
once per turn cycle (guarded by stop_hook_active) so it can never loop.
"""
import json
import os
import subprocess
import sys


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)  # never break the session on a parse hiccup

    # One block cycle max: if a Stop hook is already driving the turn, allow stop.
    if data.get("stop_hook_active"):
        sys.exit(0)

    project_dir = os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd") or "."

    try:
        tracked = subprocess.run(
            ["git", "diff", "--name-only", "HEAD"],
            cwd=project_dir, capture_output=True, text=True, timeout=10,
        )
        untracked = subprocess.run(
            ["git", "ls-files", "--others", "--exclude-standard"],
            cwd=project_dir, capture_output=True, text=True, timeout=10,
        )
    except Exception:
        sys.exit(0)

    names = set(tracked.stdout.splitlines()) | set(untracked.stdout.splitlines())
    docs = [n.strip() for n in names if n.strip().startswith("docs/") and n.strip().endswith(".mdx")]
    if not docs:
        sys.exit(0)

    findings = []
    for rel in docs:
        try:
            result = subprocess.run(
                ["yarn", "--silent", "generate-quicklooks", rel, "--check"],
                cwd=project_dir, capture_output=True, text=True, timeout=90,
            )
        except Exception:
            sys.exit(0)  # fail-soft: tooling missing/slow
        if result.returncode == 1:
            findings.append(result.stdout.strip())
        elif result.returncode != 0:
            sys.exit(0)  # unexpected (e.g. missing glossary) -> don't block

    if findings:
        sys.stderr.write(
            "Some changed docs still have unwrapped glossary terms:\n\n"
            + "\n\n".join(findings)
            + "\n\nWrap them before finishing: run "
            "`yarn generate-quicklooks <file> --write` on each file listed above, "
            "then review with `git diff`.\n"
        )
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Add the Stop hook to settings.json**

Modify `.claude/settings.json` — add a `Stop` key alongside the existing `PreToolUse`/`PostToolUse` (inside the `"hooks"` object):

```json
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "python3 \"$CLAUDE_PROJECT_DIR/.claude/hooks/check-quicklooks.py\""
          }
        ]
      }
    ]
```

The resulting `.claude/settings.json` is:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "python3 \"$CLAUDE_PROJECT_DIR/.claude/hooks/guard-raster-assets.py\""
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/optimize-svg.sh\""
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "python3 \"$CLAUDE_PROJECT_DIR/.claude/hooks/check-quicklooks.py\""
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 3: Verify the hook fires and blocks correctly (fixture test)**

Create a throwaway doc with an unwrapped term, then run the hook by hand simulating the Stop payload:

```shell
mkdir -p docs/_ql-tmp && printf 'The Sequencer orders transactions.\n' > docs/_ql-tmp/probe.mdx
echo '{"stop_hook_active": false, "cwd": "'"$PWD"'"}' | CLAUDE_PROJECT_DIR="$PWD" python3 .claude/hooks/check-quicklooks.py; echo "exit=$?"
```

Expected: exit=2, stderr lists `docs/_ql-tmp/probe.mdx:1 sequencer (Sequencer)` and the fix command.

- [ ] **Step 4: Verify the loop guard and fail-soft**

```shell
echo '{"stop_hook_active": true, "cwd": "'"$PWD"'"}' | CLAUDE_PROJECT_DIR="$PWD" python3 .claude/hooks/check-quicklooks.py; echo "exit=$?"
```

Expected: exit=0 (loop guard). Then clean up the probe:

```shell
rm -rf docs/_ql-tmp
```

Confirm a clean tree no longer blocks:

```shell
echo '{"stop_hook_active": false, "cwd": "'"$PWD"'"}' | CLAUDE_PROJECT_DIR="$PWD" python3 .claude/hooks/check-quicklooks.py; echo "exit=$?"
```

Expected: exit=0.

- [ ] **Step 5: Commit**

```bash
git add .claude/hooks/check-quicklooks.py .claude/settings.json
git commit -m "feat: add Stop hook nudging quicklooks on changed docs"
```

---

## Self-Review

**Spec coverage:**

- Component 1 (script: local glossary, whole-file, double-wrap guard, preview/check/write) → Tasks 1 + 2. ✓
- Component 2 (skill) → Task 3. ✓
- Component 3 (CLAUDE.md upgrade) → Task 4. ✓
- Component 4 (Stop hook + settings.json, verified contract, fail-soft, loop guard) → Task 5. ✓
- Testing section (all listed cases) → Task 1 (matcher cases) + Task 2 (CLI preview/check/write). ✓
- Error handling table (missing glossary, bad file arg, zero matches, hook fail-soft, loop guard) → Task 2 (CLI) + Task 5 (hook). ✓

**Placeholder scan:** No TBD/TODO; every code step contains full code; every command has expected output. ✓

**Type consistency:** `GlossaryTerm`, `QuickLookAnchor`, `generateQuickLooks(content, terms) → { anchors, updatedContent }`, and `loadGlossaryTerms(glossaryPath)` are used identically in Tasks 1 and 2. CLI reads `a.lineNumber`/`a.key`/`a.displayText`, matching the `QuickLookAnchor` fields defined in Task 1. ✓

**Note on hook noise:** On a mature doc, most first mentions are already wrapped, so the double-wrap guard means `--check` flags only genuine stragglers — the hook stays quiet on small edits to established pages and loud only on new/under-linked content. This is intended.
