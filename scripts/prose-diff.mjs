/**
 * prose-diff — compare a legacy page against its port by prose, ignoring dialect.
 *
 * Usage:
 *   pnpm prose:diff <legacy.mdx> <ported.mdx>
 *   pnpm prose:diff --pair <legacy-rel> <dest-rel>   # paths relative to the two trees
 *   pnpm prose:diff --gutted                         # every page `drift` calls GUTTED
 *
 * `drift` decides GUTTED from body line counts, which cannot tell content loss from a change of
 * shape. A page whose bullets became a table, or whose four `<include>` lines gained a
 * `content/` prefix, reads as gutted while saying exactly the same thing. Of the nine GUTTED
 * findings on 2026-09-17, four were that: `chain-info` and `get-started/index` differed only in
 * dialect, `stf` was paired with the wrong file, and `oracles-content-map` is a Docusaurus card
 * grid whose nav lives in meta.json here.
 *
 * So this compares sentences instead. Both sides are reduced with the same `proseProbe` the gap
 * report uses — markup stripped, leaving the prose that survives both dialects — and what prints
 * is the sentences one side has and the other does not.
 *
 * A zero/zero result means the port is complete. Anything else needs reading: `ours-only` prose is
 * usually local work that a re-port would destroy, which is why this exists rather than a copy.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { proseProbe } from './upstream-pr-gap.mjs';

const DEFAULT_TREE_A = '/Users/allup/OCL/arbitrum-docs';

/** Strip frontmatter; it is metadata, not prose, and the two schemas differ by design. */
function body(text) {
  const m = /^---\n[\s\S]*?\n---\n/.exec(text);
  return m ? text.slice(m[0].length) : text;
}

/**
 * Reduce a page to the set of distinctive sentences it contains.
 *
 * @param {string} text MDX source.
 * @returns {Set<string>} One probe per line that carries prose.
 */
export function proseSet(text) {
  const out = new Set();
  for (const line of body(text).split('\n')) {
    // The two trees point at a partial differently: `import X from '../../partials/_y.mdx'`
    // upstream, `<include cwd>content/partials/_y.mdx</include>` here. Both are pointers, not
    // prose, and the path is exactly what the port rewrites — counted, a page built out of
    // partials reports as wholly lost and wholly added. chain-info.mdx is entirely this.
    if (/^\s*<include\b/.test(line) || /^\s*import\s.+\sfrom\s/.test(line)) continue;
    const probe = proseProbe(line);
    if (probe) out.add(probe);
  }
  return out;
}

/**
 * Sentences present on one side and absent on the other.
 *
 * @returns {{lost: string[], added: string[]}} `lost` is upstream-only, `added` is ours-only.
 */
export function proseDiff(upstream, ours) {
  const a = proseSet(upstream);
  const b = proseSet(ours);
  return {
    lost: [...a].filter((s) => !b.has(s)),
    added: [...b].filter((s) => !a.has(s)),
  };
}

function report(label, upPath, ourPath, limit) {
  if (!existsSync(upPath) || !existsSync(ourPath)) {
    console.log(`  ${label}: missing one side (${existsSync(upPath) ? ourPath : upPath})`);
    return 0;
  }
  const { lost, added } = proseDiff(readFileSync(upPath, 'utf8'), readFileSync(ourPath, 'utf8'));
  const verdict = lost.length === 0 && added.length === 0 ? 'in sync' : `${lost.length} lost`;
  console.log(`\n${label}  —  ${verdict}, ${added.length} ours-only`);
  for (const s of lost.slice(0, limit)) console.log(`    LOST  ${s.slice(0, 130)}`);
  for (const s of added.slice(0, limit)) console.log(`    OURS  ${s.slice(0, 130)}`);
  return lost.length;
}

function main() {
  const argv = process.argv.slice(2);
  const limit = Number(argv.includes('--limit') ? argv[argv.indexOf('--limit') + 1] : 8);
  const treeA = argv.includes('--tree-a') ? argv[argv.indexOf('--tree-a') + 1] : DEFAULT_TREE_A;
  const positional = argv.filter((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'));

  if (argv.includes('--gutted')) {
    const raw = readFileSync(0, 'utf8');
    let total = 0;
    for (const line of raw.split('\n')) {
      const m = /GUTTED\s+ratio\s+\S+\s+\d+->\d+\s+(\S+)\s+->\s+(\S+)/.exec(line);
      if (!m) continue;
      total += report(
        path.basename(m[2]),
        path.join(treeA, 'docs', m[1]),
        path.join(process.cwd(), 'content/docs', m[2]),
        limit,
      );
    }
    if (total) process.exitCode = 1;
    return;
  }

  if (positional.length !== 2) {
    console.error(
      'usage: pnpm prose:diff <legacy.mdx> <ported.mdx>   (or --gutted, reading drift)',
    );
    process.exitCode = 1;
    return;
  }

  if (report(path.basename(positional[1]), positional[0], positional[1], limit)) {
    process.exitCode = 1;
  }
}

// Guarded so the test file can import the pure helpers without running the report.
if (process.argv[1]?.endsWith('prose-diff.mjs')) main();
