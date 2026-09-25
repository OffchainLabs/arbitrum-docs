/**
 * pinned-image-check — fail when a Nitro node image tag in content contradicts `content/vars.json`.
 *
 * Usage:
 *   pnpm nitro:image-check
 *
 * See `scripts/lib/pinned-image.mjs` for why this exists and what it deliberately does not cover.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { pinnedImage, staleTags } from './lib/pinned-image.mjs';

const repoRoot = process.cwd();
const { image, tag } = pinnedImage(repoRoot);

const findings = [];
for (const rel of readdirSync(path.join(repoRoot, 'content'), { recursive: true })) {
  const posix = rel.split(path.sep).join('/');
  if (!/\.mdx?$/i.test(posix)) continue;
  const relFromRoot = `content/${posix}`;
  const source = readFileSync(path.join(repoRoot, 'content', posix), 'utf8');
  for (const hit of staleTags(source, tag, relFromRoot)) {
    findings.push({ rel: relFromRoot, ...hit });
  }
}

if (findings.length === 0) {
  console.log(`pinned-image-check: every Nitro image tag matches ${image}.`);
  process.exit(0);
}

console.error(`pinned-image-check: ${findings.length} image tag(s) contradict content/vars.json.`);
console.error(`  pinned: ${image}\n`);
for (const { rel, line, tag: found } of findings) {
  console.error(`  ${rel}:${line}  ${found}`);
}
console.error(
  '\nUpdate the tag to the pinned value, or — if the page describes a specific past release —' +
    '\nadd it to HISTORICAL_DIRS or EXCEPTIONS in scripts/lib/pinned-image.mjs with a reason.',
);
process.exitCode = 1;
