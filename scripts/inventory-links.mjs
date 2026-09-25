/**
 * inventory-links — list every internal link that points at a page (its restructure blast radius).
 *
 * Usage:
 *   pnpm inventory-links <path-or-slug>
 *
 * Accepts a repo-relative file path (`content/docs/foo/bar.mdx`) or a site URL/slug
 * (`/docs/foo/bar`). Read-only.
 */
import path from 'node:path';

import { buildIndex, extractRefs, lineAt, resolveRefToFile, toPosix } from './lib/doc-links.mjs';

function main() {
  const arg = process.argv.slice(2).find((a) => !a.startsWith('--'));
  if (!arg) {
    console.error('usage: pnpm inventory-links <path-or-slug>');
    process.exit(1);
  }

  const repoRoot = process.cwd();
  const index = buildIndex(repoRoot);

  const targetAbs = arg.startsWith('/')
    ? resolveRefToFile(arg, index.docsRoot, index)
    : path.resolve(repoRoot, arg);
  if (!targetAbs || !index.byAbs.has(targetAbs)) {
    console.error(`inventory-links: could not resolve to an indexed doc: ${arg}`);
    process.exit(1);
  }

  const byFile = new Map();
  for (const file of index.files) {
    if (file.abs === targetAbs) continue;
    for (const ref of extractRefs(file.content)) {
      if (ref.range === null) continue;
      if (resolveRefToFile(ref.rawUrl, file.abs, index) !== targetAbs) continue;
      const line = lineAt(file.content, ref.range[0]);
      const bucket = byFile.get(file.abs);
      if (bucket) bucket.push({ line, url: ref.rawUrl });
      else byFile.set(file.abs, [{ line, url: ref.rawUrl }]);
    }
  }

  const total = [...byFile.values()].reduce((n, refs) => n + refs.length, 0);
  console.log(
    `${total} inbound link(s) to ${toPosix(path.relative(repoRoot, targetAbs))} across ${byFile.size} file(s):`,
  );
  for (const [abs, refs] of byFile) {
    console.log(`  ${toPosix(path.relative(repoRoot, abs))}`);
    for (const r of refs) console.log(`    :${r.line}  ${r.url}`);
  }
}

main();
