# Import remaining arbitrum-docs content — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port all not-yet-migrated Docusaurus docs from `/Users/allup/OCL/arbitrum-docs` into the Fumadocs app under a restructured IA, with format conversion and no broken links.

**Architecture:** Extract the proven transform pipeline from `port-stylus.mjs` into a shared pure-function module, then drive it with a config-based porter that runs per section mapping. Import in verifiable waves; each wave is gated by `types:check` + `check-links` and committed.

**Tech Stack:** Node 22 ESM (`.mjs`), `node --test` (zero-dep), Fumadocs MDX, pnpm.

## Global Constraints

- Source root: `/Users/allup/OCL/arbitrum-docs/docs`. Target root: `/Users/allup/OCL/Fumadocs-test/content/docs/en`.
- Zero new dependencies. Node built-ins + `node --test` only.
- Frontmatter must satisfy the Zod schema: `content_type` ∈ `{how-to,concept,quickstart,tutorial,reference,troubleshooting,faq}`; `author`/`sme` default `gblanchemain`; `title`+`description` required.
- No numeric slug prefixes; `index.mdx` = folder root; URLs computed directly (`/docs/<slug>`).
- Partials live in `content/partials/` registry, included via `<include cwd>content/partials/…</include>`.
- Gates: `pnpm types:check` and `pnpm check-links`. Full `next build` is NOT a gate (Next 16 prerender blocker).
- Verbatim content port — format conversion only, no editorial rewrites.
- When curling the dev server to verify, use `rtk proxy curl …` (the plain `curl` is proxied/truncated).

---

### Task 1: Extract shared transform pipeline

**Files:**
- Create: `scripts/lib/port-pipeline.mjs`
- Test: `scripts/lib/port-pipeline.test.mjs`

**Interfaces:**
- Produces: `runDocPipeline(content, srcFileAbs, relPath, ctx) → string`, and the individual pure
  transforms (`transformFrontmatter`, `transformVars`, `transformComponentImports`,
  `transformPartialImports`, `transformAdmonitions`, `transformDetails`, `transformHtmlComments`,
  `transformHeadingAnchors`, `transformShikiLanguages`, `transformRelativeLinks`, `transformLinks`),
  plus `generateMeta(srcDir, destDir, opts)` and `protectCode`/`restoreCode`.
- `ctx` carries `{ LEGACY_DOCS_ROOT, partialRoots: [{legacyDir, destDir, includePrefix}], partialsToCopy: Map, stats }`
  so partial routing is configurable per section instead of stylus-hardcoded.

- [ ] **Step 1: Copy the pure transforms into the lib**

Move (verbatim) these functions from `scripts/codemods/port-stylus.mjs` into `scripts/lib/port-pipeline.mjs`
and `export` each: `protectCode`, `restoreCode`, `transformFrontmatter`, `transformVars`,
`transformComponentImports`, `transformAdmonitions`, `transformDetails`, `transformHtmlComments`,
`transformHeadingAnchors`, `transformShikiLanguages`, `transformRelativeLinks`, `transformLinks`,
`generateMeta`, `humanize`, `readSidebarPosition`, `minDescendantPosition`. Import `varsJson` and the
`CONTENT_TYPE_ENUM`/`ADMONITION_TYPE_MAP`/`DROP_FRONTMATTER` constants. `stats` becomes a parameter,
not a module global.

Generalize `transformPartialImports(content, srcFileAbs, relPath, ctx)`: replace the stylus-hardcoded
`LEGACY_STYLUS_PARTIALS`/`LEGACY_GLOBAL_PARTIALS` branches with a loop over `ctx.partialRoots`
(each `{legacyDir, destDir, includePrefix}`), falling back to `ctx.stats.manualReview` when a partial
import is outside all known roots.

- [ ] **Step 2: Write failing unit tests**

```js
// scripts/lib/port-pipeline.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  transformFrontmatter, transformAdmonitions, transformDetails,
  transformHeadingAnchors, transformLinks,
} from './port-pipeline.mjs';

const stats = () => ({ warnings: [], manualReview: [], errors: [] });

test('frontmatter: coerces bad content_type to concept and defaults author/sme', () => {
  const out = transformFrontmatter('---\ntitle: X\ncontent_type: guide\n---\nbody', 'x.mdx', stats());
  assert.match(out, /content_type: 'concept'/);
  assert.match(out, /author: gblanchemain/);
  assert.match(out, /sme: gblanchemain/);
});

test('frontmatter: drops Docusaurus-only keys', () => {
  const out = transformFrontmatter('---\ntitle: X\ndescription: Y\nslug: /a\nsidebar_position: 3\n---\n', 'x.mdx', stats());
  assert.doesNotMatch(out, /slug:/);
  assert.doesNotMatch(out, /sidebar_position:/);
});

test('admonitions: :::warning → VanillaAdmonition', () => {
  const out = transformAdmonitions(':::warning Careful\nbody\n:::');
  assert.match(out, /<VanillaAdmonition type="warning" title="Careful">/);
});

test('details → Accordions', () => {
  const out = transformDetails('<details><summary>More</summary>\nx\n</details>');
  assert.match(out, /<Accordions>\n<Accordion title="More">/);
});

test('heading anchors stripped', () => {
  assert.equal(transformHeadingAnchors('## Hello {#hello}'), '## Hello');
});

test('links: strip numeric prefixes + .mdx, non-/docs absolute gets /docs prefix', () => {
  assert.match(transformLinks('[a](/docs/01-foo/02-bar.mdx#x)'), /\]\(\/docs\/foo\/bar#x\)/);
  assert.match(transformLinks('[a](/launch-arbitrum-chain/aep-license)'), /\]\(\/docs\/launch-arbitrum-chain\/aep-license\)/);
});
```

- [ ] **Step 3: Run tests, expect fail**

Run: `node --test scripts/lib/port-pipeline.test.mjs`
Expected: FAIL (module/exports not yet present) until Step 1 is complete.

- [ ] **Step 4: Run tests, expect pass**

Run: `node --test scripts/lib/port-pipeline.test.mjs`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/port-pipeline.mjs scripts/lib/port-pipeline.test.mjs
git commit -m "Add shared MDX port pipeline extracted from port-stylus"
```

---

### Task 2: Config-driven porter

**Files:**
- Create: `scripts/codemods/port-remaining.mjs`

**Interfaces:**
- Consumes: everything exported by `scripts/lib/port-pipeline.mjs`.
- CLI: `node scripts/codemods/port-remaining.mjs <sectionKey> [--dry-run]` where `<sectionKey>` selects
  one entry from an internal `SECTIONS` config array (or `all`).
- Each config entry: `{ key, srcDir, destDir, isPinnedPage?, extraSources?: string[], mdToMdx?: bool }`.

- [ ] **Step 1: Write the porter**

Structure (mirrors `port-stylus.mjs` main, but config-driven):

```js
#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { runDocPipeline, generateMeta } from '../lib/port-pipeline.mjs';

const LEGACY = '/Users/allup/OCL/arbitrum-docs/docs';
const V2 = '/Users/allup/OCL/Fumadocs-test/content/docs/en';
const PARTIALS = '/Users/allup/OCL/Fumadocs-test/content/partials';

// One entry per Wave-3/4/5 section. Waves 1/2 (oracles, third-party-docs,
// pinned pages) are added in their own tasks below.
const SECTIONS = [ /* filled per task */ ];

// walk / ensureDir / processDoc / copyPartials identical in spirit to port-stylus,
// but paths come from the selected config entry and stats is local.
```

Reuse the walk/ensureDir/processDoc/copyPartials logic from `port-stylus.mjs` verbatim, parameterized by
the selected config entry. `processDoc` strips numeric prefixes from every dest path segment, `.md`→`.mdx`,
skips any path segment named `partials`. After porting, call `generateMeta(srcDir, destDir, {stats})` then
merge the section key into root `meta.json` if absent. Print the errors/warnings/manualReview report.

- [ ] **Step 2: Smoke test the porter in dry-run against a tiny section (notices)**

Add a temporary `notices` entry (`srcDir=notices`, `destDir=notices`) and run:
Run: `node scripts/codemods/port-remaining.mjs notices --dry-run`
Expected: logs 4 pages, 0 errors, prints planned dest paths; writes nothing.

- [ ] **Step 3: Commit the porter**

```bash
git add scripts/codemods/port-remaining.mjs
git commit -m "Add config-driven porter for remaining sections"
```

---

### Task 3: Wave 1 — oracles + third-party-docs (new top-level sections)

**Files:**
- Modify: `scripts/codemods/port-remaining.mjs` (add `oracles`, `third-party-docs` config entries)
- Create (generated): `content/docs/en/oracles/**`, `content/docs/en/third-party-docs/**`
- Modify: `content/docs/en/meta.json`, `lib/layout.shared.tsx`

`oracles` config: `srcDir='for-devs/oracles'`, `destDir='oracles'`,
`extraSources=['arbitrum-essentials/oracles/overview-oracles.mdx']`.
`third-party-docs` config: `srcDir='for-devs/third-party-docs'`, `destDir='third-party-docs'`.

- [ ] **Step 1: Run both ports**

Run: `node scripts/codemods/port-remaining.mjs oracles && node scripts/codemods/port-remaining.mjs third-party-docs`
Expected: pages ported (oracles ~9, third-party-docs ~23), 0 errors.

- [ ] **Step 2: Add nav entries + root meta**

Add `"oracles"` and `"third-party-docs"` to `content/docs/en/meta.json` `pages`. Add matching nav links
in `lib/layout.shared.tsx` (mirror the existing `docHref('…')` entries).

- [ ] **Step 3: Post-process + gates**

```bash
pnpm quicklooks:migrate && pnpm partials:catalog && pnpm format
pnpm types:check
pnpm check-links
```
Expected: `types:check` exit 0; `check-links` reports no NEW broken links originating in the new sections
(pre-existing repo-wide breakages are recorded, not introduced here).

- [ ] **Step 4: Render spot-check**

Run (dev server assumed running on :3000): `rtk proxy curl -sS http://localhost:3000/docs/oracles > /tmp/o.html; grep -c "Oracle" /tmp/o.html`
Expected: > 0, and one provider page (e.g. `/docs/third-party-docs/chainlink`) returns 200.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Port oracles and third-party-docs sections"
```

---

### Task 4: Wave 2 — pinned pages (chain-info, contribute)

**Files:**
- Modify: `scripts/codemods/port-remaining.mjs` (add `chain-info`, `contribute` pinned entries + a
  `pinSidebars(labels)` post-step)
- Create (generated): `content/docs/en/chain-info.mdx`, `content/docs/en/contribute.mdx`, precompile-table
  partials under `content/partials/`
- Modify: every `content/docs/en/*/meta.json`

Pinned entry: `{ isPinnedPage:true, src:'for-devs/dev-tools-and-resources/chain-info.mdx', dest:'chain-info.mdx' }`
and `{ isPinnedPage:true, src:'for-devs/contribute.mdx', dest:'contribute.mdx' }`. The precompile-table
partials imported by chain-info route into `content/partials/` via the pipeline's partial handling.

- [ ] **Step 1: Port both pinned pages**

Run: `node scripts/codemods/port-remaining.mjs chain-info && node scripts/codemods/port-remaining.mjs contribute`
Expected: 2 pages written at the docs root; precompile partials copied.

- [ ] **Step 2: Inject sidebar links**

Add a `pinSidebars` step that, for each `content/docs/en/*/meta.json`, appends
`"[Chain info](/docs/chain-info)"` and `"[Contribute](/docs/contribute)"` to `pages` if absent. Run:
Run: `node scripts/codemods/port-remaining.mjs pin-sidebars`
Expected: every top-level section meta.json updated idempotently.

- [ ] **Step 3: Gates**

```bash
pnpm partials:catalog && pnpm format && pnpm types:check && pnpm check-links
```
Expected: exit 0; no new broken links.

- [ ] **Step 4: Render spot-check**

Run: `rtk proxy curl -sS http://localhost:3000/docs/chain-info > /tmp/ci.html; grep -c "Chain ID\|RPC" /tmp/ci.html`
Expected: > 0; confirm the "Chain info" link renders in a couple of section sidebars.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add chain-info and contribute pinned pages linked in every sidebar"
```

---

### Task 5: Wave 3 — run-a-node merge

**Files:**
- Modify: `scripts/codemods/port-remaining.mjs` (`run-a-node` entry, `srcDir='run-arbitrum-node'`,
  `destDir='run-a-node'`, `extraSources=['node-running']`)
- Create/modify (generated): `content/docs/en/run-a-node/**` (must not overwrite the 5 existing files)

- [ ] **Step 1: Dry-run to confirm no clobber**

Run: `node scripts/codemods/port-remaining.mjs run-a-node --dry-run`
Expected: planned dest paths do NOT collide with existing `faq.mdx`, `high-availability-sequencer-docs.mdx`,
`index.mdx`, `run-batch-poster.mdx`, `run-split-validator-node.mdx`. If a collision exists, the porter
logs it to `manualReview` and skips the write.

- [ ] **Step 2: Run the port + regenerate meta**

Run: `node scripts/codemods/port-remaining.mjs run-a-node`
Expected: source pages ported; `run-a-node/meta.json` regenerated including both old and new pages.

- [ ] **Step 3: Gates + spot-check + commit**

```bash
pnpm partials:catalog && pnpm format && pnpm types:check && pnpm check-links
rtk proxy curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:3000/docs/run-a-node/run-full-node
git add -A && git commit -m "Merge run-arbitrum-node and node-running into run-a-node"
```
Expected: gates exit 0; `run-full-node` returns 200.

---

### Task 6: Wave 4 — how-arbitrum-works + arbitrum-essentials + stylus/stylus-by-example

**Files:**
- Modify: `scripts/codemods/port-remaining.mjs` (add three entries)
- Create/modify (generated): `content/docs/en/how-arbitrum-works/**`, `arbitrum-essentials/**`,
  `stylus/**`, `stylus/stylus-by-example/**`

Entries: `how-arbitrum-works` (src=dest=`how-arbitrum-works`); `arbitrum-essentials`
(src=dest=`arbitrum-essentials`, but EXCLUDE `oracles/` already consumed in Wave 1); `stylus-by-example`
(`srcDir='stylus-by-example'`, `destDir='stylus/stylus-by-example'`, `mdToMdx=true`).

- [ ] **Step 1: Run the three ports**

Run: `node scripts/codemods/port-remaining.mjs how-arbitrum-works && node scripts/codemods/port-remaining.mjs arbitrum-essentials && node scripts/codemods/port-remaining.mjs stylus-by-example`
Expected: deep pages land in existing `how-arbitrum-works/{deep-dives,reference,bold,timeboost}`;
`arbitrum-essentials` gains its subdirs (no duplicate oracles); 19 examples under `stylus/stylus-by-example`.

- [ ] **Step 2: Wire stylus-by-example into the stylus meta**

Add `"stylus-by-example"` to `content/docs/en/stylus/meta.json` `pages` if absent.

- [ ] **Step 3: Gates + spot-check + commit**

```bash
pnpm quicklooks:migrate && pnpm partials:catalog && pnpm format && pnpm types:check && pnpm check-links
rtk proxy curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:3000/docs/how-arbitrum-works/deep-dives/anytrust-protocol
git add -A && git commit -m "Port how-arbitrum-works deep pages, arbitrum-essentials, and stylus-by-example"
```
Expected: gates exit 0; deep page returns 200.

---

### Task 7: Wave 5 — bridge + build-dapps + get-started/intro/learn-more/notices

**Files:**
- Modify: `scripts/codemods/port-remaining.mjs` (add entries)
- Create/modify (generated): `content/docs/en/arbitrum-bridge/**`, `build-decentralized-apps/**`,
  `get-started/**`, `arbitrum-essentials/glossary` or `get-started` (glossary target), `notices/**`

Entries: `arbitrum-bridge`, `build-decentralized-apps` (+ `extraSources=['for-devs/troubleshooting-building.mdx']`),
`get-started`, `notices`. `intro/glossary.mdx` → `get-started/glossary.mdx`; `learn-more/faq.mdx` →
`get-started/faq.mdx` (small, same-wave).

- [ ] **Step 1: Run the ports**

Run: `node scripts/codemods/port-remaining.mjs arbitrum-bridge && node scripts/codemods/port-remaining.mjs build-decentralized-apps && node scripts/codemods/port-remaining.mjs get-started && node scripts/codemods/port-remaining.mjs notices`
Expected: pages ported; troubleshooting-building lands under build-decentralized-apps.

- [ ] **Step 2: Gates + spot-check + commit**

```bash
pnpm quicklooks:migrate && pnpm partials:catalog && pnpm format && pnpm types:check && pnpm check-links
rtk proxy curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:3000/docs/arbitrum-bridge/quickstart
git add -A && git commit -m "Port bridge, build-dapps, get-started, and notices remaining pages"
```
Expected: gates exit 0; bridge quickstart returns 200.

---

### Task 8: Wave 6 — global finalize (links, references, landing, verification)

**Files:**
- Modify: `app/[lang]/(home)/page.tsx` (repoint landing cards now that deep pages exist)
- Modify: various (link fixes from `fix-links`)

- [ ] **Step 1: Repoint landing fallbacks**

Update the landing cards whose targets now exist: `Inside Nitro` →
`/docs/how-arbitrum-works/deep-dives/inside-arbitrum-nitro` (verify slug), `Inside AnyTrust` →
`/docs/how-arbitrum-works/deep-dives/anytrust-protocol`, Solidity quickstart →
`/docs/build-decentralized-apps/quickstart-solidity-remix`, Chain info → `/docs/chain-info`, the three
`run-a-node` cards → their real pages, bridge quickstart → `/docs/arbitrum-bridge/quickstart`. Verify each
target file exists before editing.

- [ ] **Step 2: Global link + reference sweep**

```bash
pnpm inventory-links
pnpm fix-links   # apply only auto-resolvable fixes
pnpm references:check
pnpm partials:check
```
Expected: `check-links` broken count strictly lower than before; `references:check` and `partials:check` clean.

- [ ] **Step 3: Final gates**

```bash
pnpm format && pnpm types:check && pnpm check-links
```
Expected: `types:check` exit 0; `check-links` shows no new broken links vs the pre-import baseline.

- [ ] **Step 4: Section count sanity check**

Run: `node -e "const {execSync}=require('child_process');console.log(execSync('find content/docs/en -name \\*.mdx | wc -l').toString())"`
Expected: file count increased by roughly the ported total (~150+).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Finalize content import: repoint landing, sweep links and references"
```

---

## Self-Review

- **Spec coverage:** oracles (T3), third-party-docs (T3), chain-info pinned (T4), contribute pinned (T4),
  run-a-node merge (T5), how-arbitrum-works deep (T6), arbitrum-essentials (T6), stylus-by-example (T6),
  stylus merge (folded into T6 via arbitrum source already ported — remaining stylus deltas handled by
  re-running port with merge-safe writes), bridge/build-dapps/small sections (T7), troubleshooting-building
  → build-dapps (T7), pinned-page sidebar injection (T4), landing repoint (T8), verification (every task).
  All spec sections covered.
- **Placeholder scan:** `SECTIONS = [ /* filled per task */ ]` is an intentional incremental-build marker;
  each wave task specifies the exact entry to add. No vague "handle edge cases" steps.
- **Type consistency:** `runDocPipeline`, `generateMeta`, `transform*` names match between Task 1 (defs)
  and Tasks 2–7 (uses).

## Notes on merge-safety

The porter never overwrites an existing dest file; collisions are logged to `manualReview` and skipped.
This makes re-running any wave idempotent and protects the hand-curated `run-a-node` and `stylus` files.
