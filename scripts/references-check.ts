/**
 * references-check: the whole-repository half of the glossary reference gate. The per-file half,
 * that every `<Term id>` and `<Reference collection id>` in content resolves to a real entry of a
 * registered collection, is ESLint rule `docs/unknown-term` (`eslint/rules/unknown-term.ts`), run
 * by `pnpm lint`.
 *
 * Errors (exit 1):
 *   R1  every collection entry carries an `id` frontmatter
 *   R3  a partial that holds <Term>/<Reference> is never ESM-imported. A partial spliced into a
 *       page by <include> compiles as part of that server-rendered page, so these server
 *       components are legal there; an imported partial can end up in a client module, where
 *       they are not
 *   R4  collection entry ids are unique
 *
 *   node scripts/references-check.ts
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { walk } from './lib/partials.ts';

const repoRoot = process.cwd();
const rel = (abs: string): string => path.relative(repoRoot, abs);
const errors: string[] = [];

// Keep in sync with lib/references.ts (the registry the app uses) and eslint/rules/unknown-term.ts.
const COLLECTION_DIRS: Readonly<Record<string, string>> = { glossary: 'content/glossary' };

/** The entry count of a collection, erroring on a missing id (R1) or a duplicate (R4). */
function checkCollection(name: string): number {
  const ids = new Map<string, string>();
  for (const abs of walk(path.join(repoRoot, COLLECTION_DIRS[name]), (p) => /\.mdx?$/i.test(p))) {
    const m = /^---\n([\s\S]*?)\n---/.exec(readFileSync(abs, 'utf8'));
    const id =
      m &&
      /^id:\s*(.+)$/m
        .exec(m[1])?.[1]
        ?.trim()
        .replace(/^['"]|['"]$/g, '');
    if (!id) {
      errors.push(`R1 ${rel(abs)}: reference entry missing \`id\` frontmatter.`);
      continue;
    }
    if (ids.has(id))
      errors.push(
        `R4 duplicate id "${id}" in ${COLLECTION_DIRS[name]} (${rel(abs)} and ${ids.get(id)}).`,
      );
    else ids.set(id, rel(abs));
  }
  return ids.size;
}

/** Partials that some file pulls in with an ESM `import` instead of `<include>` (R3). */
function importedPartials(): Set<string> {
  const out = new Set<string>();
  for (const root of ['app', 'components', 'content', 'lib']) {
    for (const abs of walk(path.join(repoRoot, root), (p) => /\.(mdx?|tsx?)$/i.test(p))) {
      const src = readFileSync(abs, 'utf8');
      for (const m of src.matchAll(/^\s*import\s[^'"]*['"]([^'"]+\.mdx?)['"]/gm)) {
        const spec = m[1];
        const target = spec.startsWith('.')
          ? path.resolve(path.dirname(abs), spec)
          : path.resolve(repoRoot, spec.replace(/^@\//, ''));
        out.add(rel(target));
      }
    }
  }
  return out;
}

const HOLDS_REFERENCE = /<Term\s+id="|<Reference\b/;

function main(): void {
  const counts = Object.keys(COLLECTION_DIRS).map((name) => `${checkCollection(name)} ${name}`);

  const imported = importedPartials();
  const partialsDir = path.join(repoRoot, 'content', 'partials');
  for (const abs of walk(partialsDir, (p) => /\.mdx?$/i.test(p))) {
    if (imported.has(rel(abs)) && HOLDS_REFERENCE.test(readFileSync(abs, 'utf8'))) {
      errors.push(
        `R3 ${rel(abs)}: <Term>/<Reference> in a partial that is ESM-imported. Include it with <include> instead; an imported partial can be compiled into a client module, where these server components are illegal.`,
      );
    }
  }

  if (errors.length) {
    for (const e of errors) console.error(`error: ${e}`);
    console.error(`\nreferences-check: ${errors.length} error(s).`);
    process.exit(1);
  }
  console.log(`references-check: passed (${counts.join(', ')}).`);
}

main();
