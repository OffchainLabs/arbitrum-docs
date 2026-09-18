# Close the arbitrum-docs Content Gap — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `Fumadocs-test/content` to parity with `arbitrum-docs/docs`, and leave behind tooling that detects future drift automatically.

**Architecture:** Two script deliverables plus content work. `scripts/nav-check.mjs` catches `meta.json` navigation corruption (which currently hides 34+ pages and would swallow any newly ported page). `scripts/upstream-drift.mjs` mechanises the normalized tree comparison so drift is a command, not a manual audit. Content tasks then port 5 absent pages, restore 10 gutted pages, forward-port 10 drift pages, and restore 1 glossary term. Nav tooling comes first because it is a precondition: content ported into `configuration/` today is invisible in the sidebar.

**Tech Stack:** Node 22 (ESM `.mjs`, no new dependencies), `node --test` (built-in) for script tests, Fumadocs 16.11.1, Next 16.2.6, pnpm 10.29.3.

**Spec:** `.claude/docs/superpowers/specs/2026-08-13-arbitrum-docs-content-gap.md`

## Global Constraints

- **Node 22 only** (`engines: >=22 <23`), pnpm 10.29.3. Other Node majors are rejected.
- **Tree A path** (content of record, read-only in this plan): `/Users/allup/OCL/arbitrum-docs/docs/`. Do not edit Tree A.
- **Port-window boundary: `2026-07-10`.** Tree A files added after this are upstream drift; on or before are migration misses.
- **Frontmatter contract** (Zod, `source.config.ts`): every non-partial page needs `title`, `description`, `content_type`, `author`, `sme`. `content_type` ∈ `how-to | concept | quickstart | tutorial | reference | troubleshooting | faq`. Optional: `sidebar_label`, `user_story`, `draft`. Missing field = build failure.
- **Partials carry no frontmatter.** Doc→partial: root-anchored `<include cwd>content/partials/…</include>`. Partial→partial: file-relative `<include>../x.mdx</include>`.
- **Docusaurus→Fumadocs syntax conversions**, apply to every ported page: `:::note`/`:::warning`/`:::caution` → `<VanillaAdmonition type="note|warning|caution">`; `import Tabs from '@theme/Tabs'` → Fumadocs `Tabs`/`Tab`; strip numeric filename prefixes (`01-foo.mdx` → `foo.mdx`); convert `import X from './partials/_x.mdx'` + `<X />` to `<include>`.
- **Never hand-edit** `.source/`, `content/partials/CATALOG.md`, `content/partials/manifest.json`. Regenerate with `pnpm partials:catalog`.
- **`pnpm types:check` validates frontmatter and types only** — not links, not rendering, not correctness. Every content task must additionally pass the link check and be viewed in `pnpm dev`.
- **The link gate is a regression gate, never "zero broken links".** The repo has **112 pre-existing broken internal links** — roughly 100 `audit-reports/*.pdf` targets with no `hosted-pdfs/` directory in this repo, plus 10 false positives where `check-links` flags `/img/` assets that do exist under `public/`. The baseline is snapshotted at `.superpowers/sdd/2026-08-13-close-arbitrum-docs-content-gap/baseline-links.json`. Every task must introduce **no new** broken links; do not try to fix the pre-existing ones.
- **Use `node scripts/<name>.mjs --json`, not `pnpm <script> --json`,** when parsing output. pnpm prints a banner to stdout that corrupts JSON.
- **Commit per task.** Never push to `main`; work on a feature branch.

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `scripts/lib/nav.mjs` | Parse `meta.json`, classify entries, compare against disk. Pure functions, no I/O side effects. | 1 |
| `scripts/nav-check.mjs` | CLI wrapper over `lib/nav.mjs`; human + `--json` output; exit 1 on defects. | 1 |
| `scripts/nav-check.test.mjs` | `node --test` unit tests for `lib/nav.mjs`. | 1 |
| `content/docs/en/**/meta.json` | Repaired navigation (11 dirs with ghosts, 10 with hidden pages). | 1 |
| `content/docs/en/run-a-node/run-full-node.mdx` | Dangling-link fix. | 2 |
| `content/docs/en/notices/arbos61-upgrade-notice.mdx` | Corrected ArbOS 61 notice. | 2 |
| `scripts/lib/tree-compare.mjs` | Normalization + pairing + body-size ratio. Pure functions. | 3 |
| `scripts/upstream-drift.mjs` | CLI: report absent / gutted / drift vs miss. | 3 |
| `scripts/upstream-drift.test.mjs` | `node --test` unit tests for `lib/tree-compare.mjs`. | 3 |
| `content/glossary/forwarder.mdx` | Restored glossary term. | 4 |
| 5 new pages under `content/docs/en/launch-arbitrum-chain/` | Ported absent pages. | 5 |
| 10 existing pages | Restored gutted sections. | 6 |
| 10 new pages | Forward-ported drift. | 7 |

---

### Task 1: Navigation integrity checker, then repair navigation

Blocking. `meta.json` `pages` is an allowlist (`fumadocs-core` `packages/core/src/source/page-tree/builder.ts:397-428`); unlisted siblings are excluded unless `"..."` is present, and entries naming a non-existent page are silently ignored (`:330-338`). Today `launch-arbitrum-chain/configuration/meta.json` lists 3 ghost slugs with no `"..."`, so **34 pages are sidebar-unreachable**. Any page added in Tasks 5–7 would be invisible.

**Files:**
- Create: `scripts/lib/nav.mjs`
- Create: `scripts/nav-check.mjs`
- Create: `scripts/nav-check.test.mjs`
- Modify: `package.json` (add `nav:check` script)
- Modify: `content/docs/en/**/meta.json` (21 directories)

**Interfaces:**
- Produces: `classifyEntry(entry) -> {kind: 'page'|'rest'|'link'|'separator'|'exclude'}`, `checkDir({dir, meta, entries}) -> {ghosts: string[], hidden: string[], hasRest: boolean}`, `checkTree(contentDocsDir) -> Array<{dir, ghosts, hidden, hasRest}>`. Task 3 does not depend on these.

- [ ] **Step 1: Write the failing test**

Create `scripts/nav-check.test.mjs`:

```js
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkDir, classifyEntry } from './lib/nav.mjs';

test('classifyEntry recognises every meta.json entry form', () => {
  assert.equal(classifyEntry('my-page').kind, 'page');
  assert.equal(classifyEntry('...').kind, 'rest');
  assert.equal(classifyEntry('z...a').kind, 'rest');
  assert.equal(classifyEntry('[Chain info](/docs/chain-info)').kind, 'link');
  assert.equal(classifyEntry('---Section---').kind, 'separator');
  assert.equal(classifyEntry('!hidden-page').kind, 'exclude');
});

test('checkDir flags entries with no file on disk as ghosts', () => {
  const result = checkDir({
    dir: 'configuration',
    meta: { pages: ['layer-leap', 'core'] },
    entries: [
      { name: 'core', isDir: true },
      { name: 'index.mdx', isDir: false },
    ],
  });
  assert.deepEqual(result.ghosts, ['layer-leap']);
});

test('checkDir flags on-disk pages absent from pages[] when no rest operator', () => {
  const result = checkDir({
    dir: 'operate',
    meta: { pages: ['arbos-upgrade'] },
    entries: [
      { name: 'arbos-upgrade.mdx', isDir: false },
      { name: 'gas-target.mdx', isDir: false },
      { name: 'index.mdx', isDir: false },
    ],
  });
  assert.deepEqual(result.hidden, ['gas-target']);
  assert.equal(result.hasRest, false);
});

test('rest operator means nothing is hidden', () => {
  const result = checkDir({
    dir: 'operate',
    meta: { pages: ['arbos-upgrade', '...'] },
    entries: [
      { name: 'arbos-upgrade.mdx', isDir: false },
      { name: 'gas-target.mdx', isDir: false },
    ],
  });
  assert.deepEqual(result.hidden, []);
  assert.equal(result.hasRest, true);
});

test('index.mdx is never reported as hidden', () => {
  const result = checkDir({
    dir: 'x',
    meta: { pages: ['a'] },
    entries: [
      { name: 'a.mdx', isDir: false },
      { name: 'index.mdx', isDir: false },
    ],
  });
  assert.deepEqual(result.hidden, []);
});

test('index may legally be listed in pages and is not a ghost', () => {
  const result = checkDir({
    dir: 'x',
    meta: { pages: ['index', 'a'] },
    entries: [
      { name: 'a.mdx', isDir: false },
      { name: 'index.mdx', isDir: false },
    ],
  });
  assert.deepEqual(result.ghosts, []);
});
```

The last test is not hypothetical. An earlier draft of `checkDir` excluded `index.mdx` from the on-disk set entirely, which reported a bogus `index` ghost in three directories and inflated the defect count from 13 to 21.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test scripts/nav-check.test.mjs`
Expected: FAIL — `Cannot find module './lib/nav.mjs'`

- [ ] **Step 3: Write the implementation**

Create `scripts/lib/nav.mjs`:

```js
/**
 * nav — detect meta.json navigation defects.
 *
 * Fumadocs treats `pages` as an allowlist: when present, on-disk siblings that are not listed are
 * excluded from the sidebar unless the `"..."` rest operator appears. Entries naming a page that does
 * not exist are silently ignored. Both failure modes are invisible at build time, so we check them here.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

/** Classify a single `pages` entry. */
export function classifyEntry(entry) {
  if (typeof entry !== 'string') return { kind: 'unknown', name: String(entry) };
  if (entry === '...' || entry === 'z...a') return { kind: 'rest', name: entry };
  if (entry.startsWith('[')) return { kind: 'link', name: entry };
  if (entry.startsWith('---')) return { kind: 'separator', name: entry };
  if (entry.startsWith('!')) return { kind: 'exclude', name: entry.slice(1) };
  return { kind: 'page', name: entry };
}

/** Compare one directory's meta.json against its on-disk entries. */
export function checkDir({ dir, meta, entries }) {
  const pages = Array.isArray(meta?.pages) ? meta.pages : null;
  if (!pages) return { dir, ghosts: [], hidden: [], hasRest: true };

  const classified = pages.map(classifyEntry);
  const hasRest = classified.some((c) => c.kind === 'rest');

  // `index.mdx` may legally be listed in `pages`, so it counts as on-disk for the ghost check —
  // but it is attached as the folder's own index regardless, so it can never be "hidden".
  const onDisk = new Set();
  const hideable = new Set();
  for (const e of entries) {
    if (e.isDir) {
      onDisk.add(e.name);
      hideable.add(e.name);
    } else if (e.name.endsWith('.mdx')) {
      const slug = e.name.replace(/\.mdx$/, '');
      onDisk.add(slug);
      if (e.name !== 'index.mdx') hideable.add(slug);
    }
  }

  const listed = new Set(
    classified.filter((c) => c.kind === 'page' || c.kind === 'exclude').map((c) => c.name),
  );

  const ghosts = [...listed].filter((name) => !onDisk.has(name) && !name.includes('/'));
  const hidden = hasRest ? [] : [...hideable].filter((name) => !listed.has(name));

  return { dir, ghosts: ghosts.sort(), hidden: hidden.sort(), hasRest };
}

/** Walk a content tree and check every directory that has a meta.json. */
export function checkTree(root) {
  const results = [];
  const walk = (abs) => {
    const entries = readdirSync(abs, { withFileTypes: true }).map((d) => ({
      name: d.name,
      isDir: d.isDirectory(),
    }));
    const metaPath = path.join(abs, 'meta.json');
    if (entries.some((e) => e.name === 'meta.json')) {
      const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
      const result = checkDir({ dir: abs, meta, entries });
      if (result.ghosts.length || result.hidden.length) results.push(result);
    }
    for (const e of entries) if (e.isDir) walk(path.join(abs, e.name));
  };
  walk(root);
  return results;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test scripts/nav-check.test.mjs`
Expected: PASS, 6 tests

- [ ] **Step 5: Write the CLI wrapper**

Create `scripts/nav-check.mjs`:

```js
/**
 * nav-check — fail on meta.json navigation defects.
 *
 * Usage:
 *   pnpm nav:check          # human report; exits 1 if any defect exists
 *   pnpm nav:check --json   # JSON to stdout; exits 0 (for tooling)
 */
import path from 'node:path';

import { checkTree } from './lib/nav.mjs';

function main() {
  const json = process.argv.slice(2).includes('--json');
  const root = path.join(process.cwd(), 'content', 'docs');
  const results = checkTree(root);

  if (json) {
    console.log(JSON.stringify(results.map((r) => ({ ...r, dir: path.relative(process.cwd(), r.dir) }))));
    return;
  }

  if (results.length === 0) {
    console.log('nav-check: no navigation defects.');
    return;
  }

  console.error(`nav-check: ${results.length} directory/directories with navigation defects:`);
  for (const r of results) {
    const rel = path.relative(process.cwd(), r.dir);
    if (r.ghosts.length) console.error(`  ${rel}\n    ghost entries (listed, not on disk): ${r.ghosts.join(', ')}`);
    if (r.hidden.length)
      console.error(`    hidden pages (on disk, not listed, no "..."): ${r.hidden.join(', ')}`);
  }
  process.exitCode = 1;
}

main();
```

- [ ] **Step 6: Register the script**

In `package.json`, add to `"scripts"` after `"check-links"`:

```json
    "nav:check": "node scripts/nav-check.mjs",
```

- [ ] **Step 7: Run it against the real tree and capture the baseline**

Run: `pnpm nav:check`
Expected: FAIL (exit 1), reporting **13 directories and 48 hidden pages**. This logic was run against the real tree while writing this plan, so these numbers are exact, not estimates. Confirm it names:

- `content/docs/en/launch-arbitrum-chain/configuration` — ghosts `config-sequencer-timing-adjustments, da-api-integration-guide, layer-leap`; hidden `core, costs, data-availability, sequencer, validation`
- `content/docs/en/launch-arbitrum-chain/operate` — 8 ghosts; hidden `gas-target, key-rotation, monitoring-tools-and-considerations, ownership-access-control, post-launch-contract-deployments, state-growth`

If you get 21 directories with `index` listed as a ghost, the `hideable`/`onDisk` distinction in Step 3 was not implemented correctly.

- [ ] **Step 8: Commit the tooling**

```bash
git add scripts/lib/nav.mjs scripts/nav-check.mjs scripts/nav-check.test.mjs package.json
git commit -m "Add nav-check to detect meta.json navigation defects"
```

- [ ] **Step 9: Repair the navigation**

For every directory `pnpm nav:check` reports, fix `meta.json` by hand. Two rules:

1. **Delete ghost entries.** They render nothing.
2. **List the real pages in reading order**, then append `"..."` as the last entry so any future page still appears.

Correct the section titles too — they were copy-pasted. `launch-arbitrum-chain/operate/meta.json` is currently titled "Validation and security"; it must describe operations. `launch-arbitrum-chain/configuration/meta.json` is titled "Advanced"; it must describe configuration.

`content/docs/en/launch-arbitrum-chain/configuration/meta.json` becomes:

```json
{
  "title": "Configure your chain",
  "pages": ["core", "costs", "data-availability", "sequencer", "validation", "..."]
}
```

`content/docs/en/launch-arbitrum-chain/operate/meta.json` becomes:

```json
{
  "title": "Operate your chain",
  "pages": [
    "arbos-upgrade",
    "monitoring-tools-and-considerations",
    "ownership-access-control",
    "key-rotation",
    "gas-target",
    "state-growth",
    "post-launch-contract-deployments",
    "..."
  ]
}
```

`content/docs/en/launch-arbitrum-chain/configuration/validation/meta.json` becomes:

```json
{
  "title": "Validation and security",
  "pages": [
    "customizable-challenge-period",
    "stake-and-validator-configurations",
    "arbitrum-chain-finality",
    "fast-withdrawals",
    "..."
  ]
}
```

For the remaining reported directories, apply the same two rules. Read each directory's actual contents first — do not copy the examples above.

- [ ] **Step 10: Verify navigation is clean**

Run: `pnpm nav:check`
Expected: `nav-check: no navigation defects.`

Run: `pnpm types:check`
Expected: exits 0

Run: `node scripts/check-links.mjs --json > /tmp/links-now.json` and compare against the recorded baseline:

```bash
node -e "
const base=new Set(require('$PWD/.superpowers/sdd/2026-08-13-close-arbitrum-docs-content-gap/baseline-links.json').map(x=>x.rel+':'+x.line+'->'+x.url));
const now=require('/tmp/links-now.json');
const added=now.filter(x=>!base.has(x.rel+':'+x.line+'->'+x.url));
console.log('new broken links:', added.length);
for(const a of added) console.log('  '+a.rel+':'+a.line+' -> '+a.url);
"
```

Expected: `new broken links: 0`.

**The repo has 112 pre-existing broken links** (mostly `audit-reports/*.pdf` targets with no `hosted-pdfs/` directory, plus 10 false positives where `check-links` flags `/img/` assets that do exist in `public/`). Fixing those is out of scope. The gate for every task in this plan is **no new broken links**, never zero.

- [ ] **Step 11: Confirm the pages actually render in the sidebar**

Run: `pnpm dev`, open `http://localhost:3000/docs/launch-arbitrum-chain/configuration/costs/`.
Expected: the `configuration` section expands in the sidebar and its child pages are listed. Before this task they were absent. Spot-check `operate/` shows all 7 pages, not just `arbos-upgrade`.

This step is the real evidence — `types:check` cannot detect this class of defect.

- [ ] **Step 12: Commit**

```bash
git add content/docs/en
git commit -m "Repair meta.json navigation: drop ghost entries, unhide 34+ pages"
```

---

### Task 2: Fix the two high-severity user-visible defects

Independent of everything else, both currently live.

**Files:**
- Modify: `content/docs/en/run-a-node/run-full-node.mdx:20`
- Modify: `content/docs/en/notices/arbos61-upgrade-notice.mdx`
- Reference: `/Users/allup/OCL/arbitrum-docs/docs/notices/arbos61-upgrade-notice.mdx`

**Interfaces:**
- Consumes: nothing. Produces: nothing consumed later. The Helm link is re-pointed at a real page in Task 5.

- [ ] **Step 1: Reproduce the broken link**

Run: `node scripts/check-links.mjs --json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const b=JSON.parse(s);console.log(b.filter(x=>x.url.includes('run-full-node-with-helm')))})"`
Expected: one entry — `content/docs/en/run-a-node/run-full-node.mdx:20 -> /docs/launch-arbitrum-chain/run-a-node/run-full-node-with-helm`

The repo carries 112 pre-existing broken links (see Global Constraints); do not attempt to fix them here.

- [ ] **Step 2: Remove the dangling link**

The Helm page does not exist yet; Task 5 ports it. Until then the sentence must not link. In `content/docs/en/run-a-node/run-full-node.mdx:20`, replace the linked sentence with an unlinked one:

```mdx
This page covers running a node with Docker.
```

Delete the rest of the sentence (the Kubernetes clause and its link). Task 5 restores it.

- [ ] **Step 3: Verify no new broken links**

Run the baseline-comparison snippet from Task 1 Step 10.
Expected: `new broken links: 0`, and the `run-full-node-with-helm` entry is gone from the current report (it was in the baseline, so removing it is an improvement, not a regression).

- [ ] **Step 4: Correct the ArbOS 61 notice**

Read both versions side by side:

```bash
diff -u /Users/allup/OCL/arbitrum-docs/docs/notices/arbos61-upgrade-notice.mdx \
        content/docs/en/notices/arbos61-upgrade-notice.mdx
```

The Tree B copy is a pre-DAO-vote draft. Port from Tree A: the "Action required" admonition naming Nitro v3.11, the Arbitrum One/Nova section, and the 2026-08-20 date row. Remove the claim that Dynamic Pricing ships enabled — it is factually wrong. Keep Tree B's frontmatter block; port body content only, converting `:::` admonitions to `<VanillaAdmonition>`.

- [ ] **Step 5: Verify**

Run: `pnpm types:check && pnpm check-links`
Expected: both exit 0

Run: `pnpm dev`, open `http://localhost:3000/docs/notices/arbos61-upgrade-notice`. Confirm the "Action required" admonition renders and no Dynamic Pricing claim remains.

- [ ] **Step 6: Commit**

```bash
git add content/docs/en/run-a-node/run-full-node.mdx content/docs/en/notices/arbos61-upgrade-notice.mdx
git commit -m "Fix dangling Helm link and correct ArbOS 61 upgrade notice"
```

---

### Task 3: Upstream drift detector

Both trees stay live, so drift reappears weekly. This turns the manual audit into one command.

**Files:**
- Create: `scripts/lib/tree-compare.mjs`
- Create: `scripts/upstream-drift.mjs`
- Create: `scripts/upstream-drift.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `normalizeSlug(filePath) -> string`, `SECTION_MAP` (object), `RENAME_MAP` (object), `mapSectionPath(relPath) -> string`, `bodyLineCount(source) -> number`. Consumed by no later task; the CLI is used in Tasks 5–7 to confirm items drop off the report.

- [ ] **Step 1: Write the failing test**

Create `scripts/upstream-drift.test.mjs`:

```js
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { bodyLineCount, mapSectionPath, normalizeSlug } from './lib/tree-compare.mjs';

test('normalizeSlug strips numeric prefixes, extension and case', () => {
  assert.equal(normalizeSlug('run-arbitrum-node/01-overview.mdx'), 'overview');
  assert.equal(normalizeSlug('a/b/Some-Page.md'), 'somepage');
  assert.equal(normalizeSlug('partials/_my-partial.mdx'), 'mypartial');
});

test('mapSectionPath applies the Tree A -> Tree B section renames', () => {
  assert.equal(mapSectionPath('run-arbitrum-node/overview.mdx'), 'run-a-node/overview.mdx');
  assert.equal(
    mapSectionPath('launch-arbitrum-chain/chain-config/costs/x.mdx'),
    'launch-arbitrum-chain/configuration/costs/x.mdx',
  );
  assert.equal(mapSectionPath('for-devs/oracles/api3/api3.mdx'), 'oracles/api3/api3.mdx');
  assert.equal(mapSectionPath('stylus-by-example/x.mdx'), 'stylus/x.mdx');
});

test('mapSectionPath leaves unmapped sections untouched', () => {
  assert.equal(mapSectionPath('how-arbitrum-works/x.mdx'), 'how-arbitrum-works/x.mdx');
});

test('mapSectionPath applies whole-file renames, and they beat section prefixes', () => {
  assert.equal(
    mapSectionPath('launch-arbitrum-chain/operate/monitoring.mdx'),
    'launch-arbitrum-chain/operate/monitoring-tools-and-considerations.mdx',
  );
  // This one also matches the chain-config -> configuration section prefix; the rename must win.
  assert.equal(
    mapSectionPath('launch-arbitrum-chain/chain-config/sequencer/sequencer-timing-adjustments.mdx'),
    'launch-arbitrum-chain/configuration/sequencer/config-sequencer-timing-adjustments.mdx',
  );
});

test('bodyLineCount excludes frontmatter', () => {
  const src = ['---', 'title: X', '---', '', 'line one', 'line two'].join('\n');
  assert.equal(bodyLineCount(src), 3);
});

test('bodyLineCount handles a file with no frontmatter', () => {
  assert.equal(bodyLineCount('just\ntwo lines'), 2);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test scripts/upstream-drift.test.mjs`
Expected: FAIL — `Cannot find module './lib/tree-compare.mjs'`

- [ ] **Step 3: Write the implementation**

Create `scripts/lib/tree-compare.mjs`:

```js
/**
 * tree-compare — normalize the legacy Docusaurus tree onto this repo's layout.
 *
 * A raw path diff between the two trees is meaningless: the legacy tree carries Docusaurus numeric
 * ordering prefixes, has no locale segment, and several sections were renamed during the migration.
 * These helpers apply those corrections so paths can be compared.
 */

/** Tree A section prefix -> Tree B section prefix. Longest match wins. */
export const SECTION_MAP = {
  'launch-arbitrum-chain/chain-config': 'launch-arbitrum-chain/configuration',
  'for-devs/third-party-docs': 'third-party-docs',
  'for-devs/oracles': 'oracles',
  'run-arbitrum-node': 'run-a-node',
  'stylus-by-example': 'stylus',
};

/**
 * Whole-file renames, Tree A relative path -> Tree B relative path.
 *
 * Pairing is otherwise done on the normalized slug, which cannot match a page whose filename changed
 * during the migration. Without these entries the renamed pages below are reported ABSENT (looks like
 * a missing page) instead of GUTTED (a present page that lost content) — the wrong verdict for the
 * wrong reason. Add an entry here whenever a port renames a file.
 */
export const RENAME_MAP = {
  'launch-arbitrum-chain/operate/monitoring.mdx':
    'launch-arbitrum-chain/operate/monitoring-tools-and-considerations.mdx',
  'launch-arbitrum-chain/operate/ownership-and-access.mdx':
    'launch-arbitrum-chain/operate/ownership-access-control.mdx',
  'launch-arbitrum-chain/overview/introduction.mdx':
    'launch-arbitrum-chain/overview/a-gentle-introduction.mdx',
  'launch-arbitrum-chain/chain-config/sequencer/sequencer-timing-adjustments.mdx':
    'launch-arbitrum-chain/configuration/sequencer/config-sequencer-timing-adjustments.mdx',
};

/** Reduce a path to a comparable slug: basename, no extension, no ordering prefix, alphanumeric only. */
export function normalizeSlug(filePath) {
  const base = filePath.split('/').pop() ?? '';
  return base
    .replace(/\.mdx?$/, '')
    .replace(/^_/, '')
    .replace(/^\d+-/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/** Rewrite a Tree A relative path onto Tree B's layout. Explicit renames win over section prefixes. */
export function mapSectionPath(relPath) {
  if (Object.hasOwn(RENAME_MAP, relPath)) return RENAME_MAP[relPath];

  const keys = Object.keys(SECTION_MAP).sort((a, b) => b.length - a.length);
  for (const from of keys) {
    if (relPath === from || relPath.startsWith(`${from}/`)) {
      return `${SECTION_MAP[from]}${relPath.slice(from.length)}`;
    }
  }
  return relPath;
}

/** Count body lines, excluding a leading YAML frontmatter block. */
export function bodyLineCount(source) {
  const lines = source.split('\n');
  if (lines[0]?.trim() !== '---') return lines.length;
  const end = lines.indexOf('---', 1);
  if (end === -1) return lines.length;
  return lines.length - end - 1;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test scripts/upstream-drift.test.mjs`
Expected: PASS, 6 tests

- [ ] **Step 5: Write the CLI**

Create `scripts/upstream-drift.mjs`:

```js
/**
 * upstream-drift — compare this repo against the legacy arbitrum-docs tree.
 *
 * Usage:
 *   pnpm drift                       # human report; exits 1 if anything is absent or gutted
 *   pnpm drift --json                # JSON to stdout; exits 0
 *   pnpm drift --tree-a <path>       # override the legacy tree location
 *
 * Reports three things:
 *   ABSENT  a legacy page with no counterpart here
 *   GUTTED  a page present here whose body is under 70% of the legacy body
 *   Each ABSENT item is labelled DRIFT (added upstream after the port window closed, never in scope)
 *   or MISS (existed before the port window closed and should have been ported).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { bodyLineCount, mapSectionPath, normalizeSlug } from './lib/tree-compare.mjs';

const PORT_WINDOW_END = '2026-07-10';
const GUTTED_RATIO = 0.7;
const DEFAULT_TREE_A = '/Users/allup/OCL/arbitrum-docs/docs';
const SKIP = [/^superpowers\//, /^api\//, /(^|\/)partials\//, /^Offchain-pattern-guide\.md$/];

function listDocs(root) {
  const out = [];
  const walk = (abs) => {
    for (const d of readdirSync(abs, { withFileTypes: true })) {
      const next = path.join(abs, d.name);
      if (d.isDirectory()) walk(next);
      else if (/\.mdx?$/.test(d.name)) out.push(path.relative(root, next));
    }
  };
  walk(root);
  return out;
}

function addedDate(treeA, relPath) {
  try {
    const out = execFileSync(
      'git',
      ['-C', treeA, 'log', '--diff-filter=A', '--format=%ad', '--date=short', '--', path.join('docs', relPath)],
      { encoding: 'utf8' },
    ).trim().split('\n');
    return out[out.length - 1] || null;
  } catch {
    return null;
  }
}

function main() {
  const argv = process.argv.slice(2);
  const json = argv.includes('--json');
  const idx = argv.indexOf('--tree-a');
  const treeA = idx !== -1 ? argv[idx + 1] : DEFAULT_TREE_A;
  const treeARepo = path.dirname(treeA);
  const treeB = path.join(process.cwd(), 'content', 'docs', 'en');

  if (!existsSync(treeA)) {
    console.error(`upstream-drift: legacy tree not found at ${treeA}. Pass --tree-a <path>.`);
    process.exitCode = 1;
    return;
  }

  const bIndex = new Map();
  for (const rel of listDocs(treeB)) bIndex.set(normalizeSlug(rel), rel);

  const absent = [];
  const gutted = [];

  for (const relA of listDocs(treeA)) {
    if (SKIP.some((re) => re.test(relA))) continue;
    const slug = normalizeSlug(mapSectionPath(relA));
    const relB = bIndex.get(slug);

    if (!relB) {
      const added = addedDate(treeARepo, relA);
      absent.push({ treeA: relA, added, kind: added && added > PORT_WINDOW_END ? 'DRIFT' : 'MISS' });
      continue;
    }

    const aLines = bodyLineCount(readFileSync(path.join(treeA, relA), 'utf8'));
    const bLines = bodyLineCount(readFileSync(path.join(treeB, relB), 'utf8'));
    if (aLines > 20 && bLines / aLines < GUTTED_RATIO) {
      gutted.push({ treeA: relA, treeB: relB, aLines, bLines, ratio: +(bLines / aLines).toFixed(2) });
    }
  }

  if (json) {
    console.log(JSON.stringify({ absent, gutted }, null, 2));
    return;
  }

  console.log(`upstream-drift: ${absent.length} absent, ${gutted.length} gutted\n`);
  for (const a of [...absent].sort((x, y) => (y.added ?? '').localeCompare(x.added ?? ''))) {
    console.log(`  ABSENT  ${a.kind}  added ${a.added ?? 'unknown'}  ${a.treeA}`);
  }
  if (absent.length && gutted.length) console.log('');
  for (const g of [...gutted].sort((x, y) => x.ratio - y.ratio)) {
    console.log(`  GUTTED  ratio ${g.ratio}  ${g.aLines}->${g.bLines}  ${g.treeA}  ->  ${g.treeB}`);
  }

  if (absent.length || gutted.length) process.exitCode = 1;
}

main();
```

- [ ] **Step 6: Register the script**

In `package.json`, add after `"nav:check"`:

```json
    "drift": "node scripts/upstream-drift.mjs",
```

- [ ] **Step 7: Run against the real trees and sanity-check the output**

Run: `pnpm drift`
Expected: exit 1. The output must include, at minimum:
- `ABSENT DRIFT added 2026-08-10 launch-arbitrum-chain/chain-config/costs/revenue-routing.mdx`
- `ABSENT MISS added 2026-06-24 launch-arbitrum-chain/chain-config/chainConfig-reference.mdx`
- `GUTTED ratio 0.2 167->33 launch-arbitrum-chain/operate/monitoring.mdx -> launch-arbitrum-chain/operate/monitoring-tools-and-considerations.mdx`

If `monitoring.mdx` does not appear with roughly that ratio, the section mapping or body counting is wrong — fix before continuing. This is the calibration check: those three numbers were verified by hand.

The `monitoring.mdx` line is specifically the `RENAME_MAP` check. Without that map the file is reported ABSENT rather than GUTTED, because slug pairing cannot match `monitoring` to `monitoring-tools-and-considerations`. If you see it under ABSENT, `RENAME_MAP` is not being applied.

- [ ] **Step 8: Commit**

```bash
git add scripts/lib/tree-compare.mjs scripts/upstream-drift.mjs scripts/upstream-drift.test.mjs package.json
git commit -m "Add upstream-drift to detect content gaps against arbitrum-docs"
```

---

### Task 4: Restore the `forwarder` glossary term

Smallest content task. Do it first to prove the content loop end to end.

**Files:**
- Create: `content/glossary/forwarder.mdx`
- Reference: `/Users/allup/OCL/arbitrum-docs/docs/partials/glossary/_forwarder.mdx`

**Interfaces:**
- Consumes: nothing. Produces: nothing.

- [ ] **Step 1: Confirm the term is absent and unreferenced**

Run: `ls content/glossary/ | grep -i forward` → expect no output
Run: `grep -rn 'quicklook-from="forwarder"' content/` → expect no output

The term is unreferenced, so adding it cannot break an existing page.

- [ ] **Step 2: Read the source definition**

Run: `cat /Users/allup/OCL/arbitrum-docs/docs/partials/glossary/_forwarder.mdx`

- [ ] **Step 3: Create the glossary file**

Glossary files use a different frontmatter shape from doc pages — `id`, `title`, optional `sortAs`, and **no** `content_type`/`author`/`sme`. Tree A's field names differ: `key` → `id`, `titleforSort` → `sortAs`. Here `titleforSort` equals the title, so `sortAs` is omitted.

Create `content/glossary/forwarder.mdx` with exactly this content:

```mdx
---
id: forwarder
title: 'Forwarder'
---

In Arbitrum, a forwarder is a component that forwards user transactions to the Sequencer. Full nodes use the forwarder to send transactions they receive via RPC to the sequencer for ordering and execution.
```

- [ ] **Step 4: Verify**

Run: `pnpm types:check`
Expected: exits 0

Run: `pnpm dev`, open `http://localhost:3000/docs/glossary`. Confirm "Forwarder" appears in the list, alphabetically between its neighbours.

- [ ] **Step 5: Commit**

```bash
git add content/glossary/forwarder.mdx
git commit -m "Restore forwarder glossary term"
```

---

### Task 5: Port the 5 fully absent pages

All five predate the port window — genuine migration misses.

**Files:**
- Create: `content/docs/en/launch-arbitrum-chain/run-a-node/run-full-node-with-helm.mdx`
- Create: `content/docs/en/launch-arbitrum-chain/integrations/exchange-integration-checklist.mdx`
- Create: `content/docs/en/launch-arbitrum-chain/integrations/bp-kms-signing-services.mdx`
- Create: `content/docs/en/launch-arbitrum-chain/operate/bp-recovery.mdx`
- Create: `content/docs/en/launch-arbitrum-chain/configuration/chain-config-reference.mdx`
- Modify: the `meta.json` in each of those four directories
- Modify: `content/docs/en/run-a-node/run-full-node.mdx` (restore the Helm link removed in Task 2)

**Interfaces:**
- Consumes: repaired `meta.json` files from Task 1 — without them these pages are invisible. Produces: the Helm page URL `/docs/launch-arbitrum-chain/run-a-node/run-full-node-with-helm`, re-linked from `run-full-node.mdx`.

Port one page per commit. For each of the five, run this cycle:

- [ ] **Step 1: Read the source page**

```bash
cat /Users/allup/OCL/arbitrum-docs/docs/launch-arbitrum-chain/run-a-node/run-full-node-with-helm.mdx
```

(Substitute the relevant Tree A path for each page. Note `chainConfig-reference.mdx` is renamed to `chain-config-reference.mdx` — this repo uses kebab-case, and the mixed-case name would produce an inconsistent URL.)

- [ ] **Step 2: Create the page with a valid frontmatter block**

Every page needs all five required fields. Use the source page's own title and description; set `content_type` from the enum by what the page does (a Helm deployment guide is `how-to`; a JSON field listing is `reference`; a checklist is `how-to`). Carry `author` and `sme` across from the Tree A frontmatter — do not invent names.

```mdx
---
title: 'How to run a full node with Helm on Kubernetes'
description: '<the description from the Tree A page>'
content_type: 'how-to'
author: '<author from Tree A frontmatter>'
sme: '<sme from Tree A frontmatter>'
---
```

Then port the body, applying the syntax conversions from Global Constraints. Check `content/partials/CATALOG.md` (⌘F by intent) before writing any banner, note, config table, or troubleshooting block — reuse the existing partial with `<include cwd>content/partials/…</include>` rather than duplicating prose.

- [ ] **Step 3: Add the page to its `meta.json`**

Insert the new slug into the `pages` array of the containing directory's `meta.json`, in reading order. The array already ends with `"..."` after Task 1, so omitting this only misorders the page — but order is the point.

- [ ] **Step 4: Verify the page**

Run: `pnpm types:check` → exits 0 (proves frontmatter is valid)
Run: `pnpm check-links` → no broken links
Run: `pnpm nav:check` → no defects
Run: `pnpm dev`, open the page URL. Confirm it renders, admonitions display correctly, code blocks are intact, and it appears in the sidebar in the intended position.

- [ ] **Step 5: Commit**

```bash
git add content/docs/en/launch-arbitrum-chain
git commit -m "Port <page title> from arbitrum-docs"
```

- [ ] **Step 6: After all five pages, restore the Helm link**

In `content/docs/en/run-a-node/run-full-node.mdx:20`, restore the sentence removed in Task 2, now that its target exists:

```mdx
This page covers running a node with Docker. If you want to deploy on Kubernetes, or you want a more production-ready setup with monitoring, log signals, and network egress guidance, follow [How to run a full node with Helm on Kubernetes](/docs/launch-arbitrum-chain/run-a-node/run-full-node-with-helm) instead.
```

Run: `pnpm check-links`
Expected: `no broken internal links` — the target now resolves.

- [ ] **Step 7: Confirm the drift report shrank**

Run: `pnpm drift`
Expected: all five pages have disappeared from the ABSENT list.

- [ ] **Step 8: Commit**

```bash
git add content/docs/en/run-a-node/run-full-node.mdx
git commit -m "Restore Helm link now that the target page exists"
```

---

### Task 6: Restore the 10 gutted pages

These pages exist here but lost body content. Per the spec decision, restore from Tree A but **read each one first** — a trim may have been deliberate.

**Files (Tree B path ← Tree A source):**
- `launch-arbitrum-chain/operate/monitoring-tools-and-considerations.mdx` ← `launch-arbitrum-chain/operate/monitoring.mdx`
- `how-arbitrum-works/deep-dives/sequencer.mdx` ← same path
- `launch-arbitrum-chain/operate/ownership-access-control.mdx` ← `launch-arbitrum-chain/operate/ownership-and-access.mdx`
- `launch-arbitrum-chain/configuration/sequencer/config-sequencer-timing-adjustments.mdx` ← `launch-arbitrum-chain/chain-config/sequencer/sequencer-timing-adjustments.mdx`
- `launch-arbitrum-chain/operate/batch-poster-troubleshooting.mdx` ← same path
- `launch-arbitrum-chain/overview/a-gentle-introduction.mdx` ← `launch-arbitrum-chain/overview/introduction.mdx`
- `run-a-node/run-full-node.mdx` ← `run-arbitrum-node/02-run-full-node.mdx`
- `run-a-node/nitro/nitro-database-snapshots.mdx` ← `run-arbitrum-node/nitro/03-nitro-database-snapshots.mdx`
- `run-a-node/more-types/run-archive-node.mdx` ← `run-arbitrum-node/more-types/01-run-archive-node.mdx`
- `notices/arbos61-upgrade-notice.mdx` — **already done in Task 2**, skip

**Interfaces:**
- Consumes: `pnpm drift` from Task 3 to confirm each page drops off the GUTTED list.

Handle one page per commit, worst ratio first (`monitoring` at 0.20, then `sequencer` at 0.23, then `ownership-access-control` at 0.26).

- [ ] **Step 1: Diff the two versions**

```bash
diff -u /Users/allup/OCL/arbitrum-docs/docs/launch-arbitrum-chain/operate/monitoring.mdx \
        content/docs/en/launch-arbitrum-chain/operate/monitoring-tools-and-considerations.mdx
```

- [ ] **Step 2: Decide, per absent section, whether the omission was deliberate**

Read the absent sections. Restore unless one of these holds:
- the content describes a Docusaurus-only mechanism that has no meaning here
- the content is already present elsewhere in Tree B (search for a distinctive phrase before concluding it is missing)
- the content was superseded by a Tree B page that covers it better

If you skip a section, record why in the commit message. Do not skip silently.

- [ ] **Step 3: Restore the absent sections**

Append or splice the missing sections, applying the Global Constraints syntax conversions. Keep Tree B's existing frontmatter untouched — only the body changes. Where a restored section duplicates an existing partial, use `<include cwd>content/partials/…</include>` instead of pasting prose.

- [ ] **Step 4: Verify**

Run: `pnpm types:check && pnpm check-links && pnpm partials:check`
Expected: all exit 0

Run: `pnpm drift`
Expected: this page no longer appears in the GUTTED list, or its ratio is now above 0.7.

Run: `pnpm dev` and view the page. Confirm restored tables render, code blocks are complete, and admonitions display.

- [ ] **Step 5: Commit**

```bash
git add content/docs/en/launch-arbitrum-chain/operate/monitoring-tools-and-considerations.mdx
git commit -m "Restore monitoring content lost in migration"
```

- [ ] **Step 6: Re-attach the orphaned sequencer diagrams**

When restoring `how-arbitrum-works/deep-dives/sequencer.mdx`, the 5 `haw-*.svg` diagrams in `content/docs/en/how-arbitrum-works/deep-dives/` are currently unreferenced. Confirm each restored section references its diagram:

```bash
grep -rn 'haw-.*\.svg' content/docs/en/how-arbitrum-works/
```

Expected: every `haw-*.svg` on disk appears in at least one page. Any still unreferenced means a section is still missing.

---

### Task 7: Forward-port the 10 drift pages

These postdate the port window. They are not migration defects — they are new upstream content that never existed here.

**Files:** 10 new pages. Tree A sources and target directories:

| Tree A source | Tree B target directory |
|---|---|
| `launch-arbitrum-chain/chain-config/costs/revenue-routing.mdx` | `launch-arbitrum-chain/configuration/costs/` |
| `launch-arbitrum-chain/chain-config/sequencer/compliance-filtering.mdx` | `launch-arbitrum-chain/configuration/sequencer/` |
| `launch-arbitrum-chain/operate/bold-upgrade-playbook.mdx` | `launch-arbitrum-chain/operate/` |
| `launch-arbitrum-chain/operate/validator-troubleshooting.mdx` | `launch-arbitrum-chain/operate/` |
| `launch-arbitrum-chain/operate/upgrade-runbook.mdx` | `launch-arbitrum-chain/operate/` |
| `launch-arbitrum-chain/chain-config/data-availability/das-docker-deployment.mdx` | `launch-arbitrum-chain/configuration/data-availability/` |
| `arbitrum-bridge/06-withdrawal-monitoring.mdx` | `arbitrum-bridge/` (drop the `06-` prefix) |
| `how-arbitrum-works/reference/finality-and-reorgs.mdx` | `how-arbitrum-works/reference/` |
| `how-arbitrum-works/deep-dives/sequencer-transaction-flow.mdx` | `how-arbitrum-works/deep-dives/` |
| `arbitrum-essentials/how-to-get-l2block-on-l1.mdx` | `arbitrum-essentials/` |

**Interfaces:**
- Consumes: repaired `meta.json` from Task 1. Produces: nothing consumed later.

Priority order by reader impact: `finality-and-reorgs` → `06-withdrawal-monitoring` → `sequencer-transaction-flow` → `revenue-routing` → the rest.

- [ ] **Step 1: Re-run drift first**

Run: `pnpm drift --json > /tmp/drift-before.json`

Both trees are live, so more drift may have landed since this plan was written. Work from the current report, not the table above — treat the table as the known minimum.

- [ ] **Step 2: Port each page**

Use the identical cycle from Task 5, Steps 1–5: read the source, create the page with a complete frontmatter block, apply syntax conversions, reuse partials from `CATALOG.md`, add to `meta.json`, verify, commit one page per commit.

Two page-specific notes:
- `finality-and-reorgs.mdx` — Tree B already has a *different, older* page at `how-arbitrum-works/deep-dives/finality.mdx` naming only two finality levels. Decide explicitly whether to replace that page or add alongside it. If replacing, use `pnpm move-doc` so links and redirects are rewritten; do not delete by hand.
- `06-withdrawal-monitoring.mdx` — roughly 60% of its content is already scattered across `arbitrum-bridge/bridging/withdraw/*.mdx` and `bridge-transaction-traceability.mdx`. Read those first and port only what is genuinely absent, or the page will duplicate existing prose.

- [ ] **Step 3: Confirm the report is clean**

Run: `pnpm drift`
Expected: exit 0, no ABSENT and no GUTTED entries. If items remain, they are either newly landed upstream drift (port them) or deliberate omissions (add them to `SKIP` in `scripts/upstream-drift.mjs` with a comment saying why).

---

### Task 8: Clear the remaining medium and low defects

**Files:**
- Modify: `content/docs/en/oracles/index.mdx`
- Modify: `content/docs/en/build-decentralized-apps/quickstart-solidity-remix.mdx`
- Rename: `content/partials/launch-arbitrum-chain/_config-evm-compatbility.mdx`
- Review: `content/partials/launch-arbitrum-chain/_config-challenge-period-l1.mdx`, `_config-l1-challenge-period.mdx`

**Interfaces:**
- Consumes: nothing. Produces: nothing.

- [ ] **Step 1: Add the missing oracle cards**

`content/docs/en/oracles/index.mdx` is missing cards for Pyth, Quex, and Supra VRF, all of which have pages on disk. Confirm:

```bash
ls content/docs/en/oracles/
grep -n 'Pyth\|Quex\|VRF' content/docs/en/oracles/index.mdx
```

Add a card for each existing oracle page, matching the markup of the cards already present.

- [ ] **Step 2: Fix the solidity learning-resources table**

In `content/docs/en/build-decentralized-apps/quickstart-solidity-remix.mdx`, in the `#learning-resources` section:
- the RareSkills row links to the Rust bootcamp — point it at the Solidity bootcamp
- the Metana row contains a leaked LLM placeholder — replace it with the real description

Compare against `/Users/allup/OCL/arbitrum-docs/docs/arbitrum-essentials/reference/solidity-references.mdx`, which is the fuller upstream version, and port the sections Tree B lacks: Cyfrin Updraft, awesome-solidity, the security/auditing section, Foundry-vs-Hardhat-vs-Remix, and the GitHub-repos section.

- [ ] **Step 3: Fix the misspelled partial filename**

```bash
git mv content/partials/launch-arbitrum-chain/_config-evm-compatbility.mdx \
       content/partials/launch-arbitrum-chain/_config-evm-compatibility.mdx
grep -rn 'config-evm-compatbility' content/
```

Update every `<include>` that referenced the old name, then regenerate the catalog:

```bash
pnpm partials:catalog
```

- [ ] **Step 4: Resolve the redundant challenge-period partials**

Read both `_config-challenge-period-l1.mdx` and `_config-l1-challenge-period.mdx`. If they are duplicates, keep one, repoint every `<include>` at it, delete the other, and regenerate the catalog. If they genuinely differ, leave both and note the distinction in `content/partials/registry.json` so the next reader does not repeat this check.

- [ ] **Step 5: Verify everything**

Run: `pnpm types:check && pnpm check-links && pnpm partials:check && pnpm nav:check && pnpm drift`
Expected: all five exit 0

Run: `pnpm build`
Expected: succeeds. This is the last gate — it runs `scripts/versioned-docs-check.mjs` first and compiles every page.

- [ ] **Step 6: Commit**

```bash
git add content package.json
git commit -m "Fix oracle index cards, solidity resources table, and partial naming"
```

---

## Explicitly out of scope

Two spec items are deliberately not tasked here:

- **`content/docs/en/run-a-node/nitro/nitro-memory-management.mdx`** — a 15-line stub whose own body says its content "is being finalized in a stacked pull request." It has no Tree A source, so it is not a migration gap; it is someone else's in-flight work. Leave it. If that PR has not landed by the time Task 8 completes, raise it rather than writing the page.
- **`content/partials/_raas-providers-notice.mdx`** links to `…/third-party-integrations/third-party-providers.mdx` with an `.mdx` suffix. `pnpm check-links` resolves `<include>` and file-style links, so if this were broken it would already be failing. Task 2 Step 3 establishes a clean `check-links` baseline; if that link is genuinely broken it surfaces there and gets fixed in that task instead.

## Ongoing sync

Both trees stay live, so this is not finished when Task 8 lands. Run `pnpm drift` on a cadence — weekly matches the observed rate of upstream change (10 drift pages accumulated in roughly 5 weeks). Each run produces the ABSENT/GUTTED work list directly; port items using the Task 5 cycle.

Two things will erode the signal if left alone:
- **`PORT_WINDOW_END` is a historical constant.** It classifies DRIFT vs MISS. Once every MISS is cleared, the distinction stops mattering and the constant can be deleted.
- **Deliberate omissions must be recorded** in the `SKIP` array in `scripts/upstream-drift.mjs` with a comment, or they resurface as noise every week and the report gets ignored.
