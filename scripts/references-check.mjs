/**
 * references-check — build-time guardrail for the inline hover-reference system
 * (.claude/docs/superpowers/specs/2026-07-10-references-glossary-design.md). Replaces the old glossary's
 * silent runtime `console.warn` on unknown terms.
 *
 * Errors (exit 1):
 *   R1  every <Term id> / <Reference collection id> in content resolves to a real collection entry
 *   R2  <Reference> names a registered collection
 *   R3  no <Term>/<Reference> under content/partials (partials may be client-rendered by
 *       FloatingHoverModal, where the server components are illegal)
 *   R4  collection entry ids are unique
 *
 *   node scripts/references-check.mjs
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { walk } from './lib/partials.mjs';

const repoRoot = process.cwd();
const rel = (abs) => path.relative(repoRoot, abs);
const errors = [];

// Keep in sync with lib/references.ts (the registry the app uses).
const COLLECTION_DIRS = { glossary: 'content/glossary' };

/** id → source file for a collection, erroring on duplicates (R4). */
function collectionIds(name) {
  const ids = new Map();
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
  return new Set(ids.keys());
}

/** Every <Term id> and <Reference collection id> occurrence in `src`, as {collection, id}. */
function referencesIn(src) {
  const out = [];
  for (const m of src.matchAll(/<Term\s+id="([^"]+)"/g))
    out.push({ collection: 'glossary', id: m[1] });
  for (const m of src.matchAll(/<Reference\b([^>]*?)>/g)) {
    const attrs = m[1];
    const collection = /collection="([^"]+)"/.exec(attrs)?.[1];
    const id = /id="([^"]+)"/.exec(attrs)?.[1];
    if (collection && id) out.push({ collection, id });
  }
  return out;
}

function main() {
  const ids = Object.fromEntries(
    Object.keys(COLLECTION_DIRS).map((name) => [name, collectionIds(name)]),
  );

  for (const abs of walk(path.join(repoRoot, 'content'), (p) => /\.mdx?$/i.test(p))) {
    const src = readFileSync(abs, 'utf8');
    const inPartials =
      rel(abs).startsWith(`content${path.sep}partials`) || rel(abs).startsWith('content/partials');
    const refs = referencesIn(src);
    if (inPartials && refs.length) {
      errors.push(
        `R3 ${rel(abs)}: <Term>/<Reference> in a partial — partials may be client-rendered, where these server components are illegal.`,
      );
      continue;
    }
    for (const { collection, id } of refs) {
      if (!ids[collection])
        errors.push(`R2 ${rel(abs)}: unknown reference collection "${collection}".`);
      else if (!ids[collection].has(id))
        errors.push(`R1 ${rel(abs)}: no "${collection}" entry for id "${id}".`);
    }
  }

  if (errors.length) {
    for (const e of errors) console.error(`error: ${e}`);
    console.error(`\nreferences-check: ${errors.length} error(s).`);
    process.exit(1);
  }
  const total = Object.entries(ids)
    .map(([n, s]) => `${s.size} ${n}`)
    .join(', ');
  console.log(`references-check: passed (${total}).`);
}

main();
