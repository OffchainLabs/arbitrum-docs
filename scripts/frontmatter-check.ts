/**
 * frontmatter-check: fail when a page's frontmatter breaks the contract in `lib/page-schema.ts`.
 *
 * `types:check` does not see frontmatter: `fumadocs-mdx` only writes the file list, and the schema
 * runs when a page compiles in `next dev` or `next build`. This walks every `.md`/`.mdx` file under
 * `content/docs/`, parses its frontmatter the way Fumadocs does, and validates it with the same
 * schema, so a missing `title` or an unknown `content_type` fails in seconds with a line per issue:
 *
 *   content/docs/x.mdx: description: Invalid input: expected string, received undefined
 *
 *   node scripts/frontmatter-check.ts
 */
import { frontmatter } from 'fumadocs-core/content/md/frontmatter';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { arbitrumPageSchema } from '../lib/page-schema.ts';
import { toPosix, walk } from './lib/partials.ts';

const repoRoot = process.cwd();
const problems: string[] = [];

for (const abs of walk(path.join(repoRoot, 'content', 'docs'), (p) => /\.mdx?$/i.test(p)).sort()) {
  const rel = toPosix(path.relative(repoRoot, abs));
  let data: unknown;
  try {
    data = frontmatter(readFileSync(abs, 'utf8')).data;
  } catch (error) {
    problems.push(`${rel}: frontmatter: ${error instanceof Error ? error.message : String(error)}`);
    continue;
  }
  const result = arbitrumPageSchema.safeParse(data);
  if (result.success) continue;
  for (const issue of result.error.issues) {
    const field = issue.path.length ? issue.path.join('.') : '(frontmatter)';
    problems.push(`${rel}: ${field}: ${issue.message}`);
  }
}

if (problems.length) {
  console.error(`frontmatter-check: ${problems.length} problem(s):`);
  for (const p of problems) console.error(`  ${p}`);
  console.error('The contract is in lib/page-schema.ts; CONTRIBUTE.md lists the fields.');
  process.exit(1);
}
console.log('frontmatter-check: every page matches the schema.');
