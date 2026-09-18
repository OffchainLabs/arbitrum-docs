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
