/**
 * migrate-partials — one-shot codemod: move partials out of the routed tree into `content/partials/`
 * and rewrite every `<include>` to the root-anchored `<include cwd>` form.
 *
 * Mapping: a partial at `content/docs/<locale>/<…dirs…>/partials/[parameters/]<file>` moves to
 * `content/partials/<…dirs…>/[parameters/]<file>` (locale and the `partials/` segment dropped;
 * grouping preserved). Includes in every doc and every moved partial are resolved against their old
 * location, remapped to the partial's new location, and re-emitted as `<include cwd>…</include>`.
 *
 * Idempotent: exits early when no partials remain under `content/docs/`.
 *
 *   node scripts/migrate-partials.mjs
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { applyRewrites } from './lib/doc-links.mjs';
import {
  DOCS_DIR,
  PARTIALS_DIR,
  cwdIncludePath,
  isPartial,
  listDocs,
  listImporters,
  mapLegacySpecifier,
  parsePartialImports,
  walk,
} from './lib/partials.mjs';

const repoRoot = process.cwd();

/** New absolute location for a legacy partial under content/docs. */
function newPartialAbs(oldAbs) {
  const relFromDocs = path.relative(path.join(repoRoot, DOCS_DIR), oldAbs);
  const segs = relFromDocs.split(path.sep);
  segs.shift(); // drop locale
  const kept = segs.filter((s) => s !== 'partials');
  return path.join(repoRoot, PARTIALS_DIR, ...kept);
}

/**
 * Rewrite every include in `source` to point at the partial's new location.
 * Doc→partial includes become root-anchored `<include cwd>` (invariant under page moves).
 * Partial→partial includes become file-relative `<include>` — a partial may be compiled outside the
 * docs pipeline (when ESM-imported as a component), where fumadocs-mdx's `cwd` context is undefined.
 */
function rewriteIncludes(source, fromAbs, moveMap) {
  const fromIsPartial = isPartial(fromAbs);
  const newFromAbs = moveMap.get(fromAbs) ?? fromAbs;
  return source.replace(/<include\b([^>]*)>([\s\S]*?)<\/include>/g, (full, attrs, inner) => {
    const target = inner.trim();
    if (target === '') return full;
    const clean = target.replace(/#.*$/, '');
    const cwd = /\bcwd\b/.test(attrs);
    const targetAbs = cwd
      ? path.resolve(repoRoot, clean)
      : path.resolve(path.dirname(fromAbs), clean);
    const mapped = moveMap.get(targetAbs) ?? targetAbs;
    return fromIsPartial
      ? `<include>${toPosixRel(newFromAbs, mapped)}</include>`
      : `<include cwd>${cwdIncludePath(repoRoot, mapped)}</include>`;
  });
}

/** Posix relative path from the directory of `fromAbs` to `targetAbs`, always dot-prefixed. */
function toPosixRel(fromAbs, targetAbs) {
  const rel = path.relative(path.dirname(fromAbs), targetAbs).split(path.sep).join('/');
  return rel.startsWith('.') ? rel : './' + rel;
}

/** Remove directories left empty under content/docs after the move. */
function pruneEmptyPartialDirs() {
  const scan = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const abs = path.join(dir, entry.name);
      scan(abs);
      if (readdirSync(abs).length === 0) rmSync(abs, { recursive: true, force: true });
    }
  };
  scan(path.join(repoRoot, DOCS_DIR));
}

/** Rewrite ESM imports of legacy content/docs partials to their content/partials location. */
function rewriteImports() {
  let count = 0;
  for (const abs of listImporters(repoRoot)) {
    const src = readFileSync(abs, 'utf8');
    const rewrites = [];
    for (const imp of parsePartialImports(src)) {
      const mapped = mapLegacySpecifier(imp.specifier);
      if (mapped && mapped !== imp.specifier) rewrites.push({ range: imp.range, newText: mapped });
    }
    if (rewrites.length) {
      writeFileSync(abs, applyRewrites(src, rewrites));
      count += rewrites.length;
    }
  }
  return count;
}

function main() {
  // ESM imports reference partials by their old content/docs path as a literal string; rewrite them
  // first (idempotent, string-based) so this fixes stale imports even after the files have moved.
  const importRewrites = rewriteImports();

  const legacy = walk(path.join(repoRoot, DOCS_DIR), isPartial);
  if (legacy.length === 0) {
    const note = importRewrites ? ` (rewrote ${importRewrites} partial import(s))` : '';
    console.log(`migrate-partials: no partials under content/docs — nothing to move${note}.`);
    return;
  }

  const moveMap = new Map(legacy.map((abs) => [abs, newPartialAbs(abs)]));

  // Rewrite consuming docs in place. Exclude partials (still under content/docs at this point) —
  // they are handled by the move pass below, so processing them here would double-rewrite includes.
  let includeRewrites = 0;
  for (const abs of listDocs(repoRoot).filter((abs) => !isPartial(abs))) {
    const src = readFileSync(abs, 'utf8');
    const out = rewriteIncludes(src, abs, moveMap);
    if (out !== src) {
      writeFileSync(abs, out);
      includeRewrites++;
    }
  }

  // Move partials to their new home, rewriting any includes they themselves contain.
  for (const [oldAbs, newAbs] of moveMap) {
    const rewritten = rewriteIncludes(readFileSync(oldAbs, 'utf8'), oldAbs, moveMap);
    mkdirSync(path.dirname(newAbs), { recursive: true });
    writeFileSync(newAbs, rewritten);
    rmSync(oldAbs);
  }

  pruneEmptyPartialDirs();

  console.log(
    `migrate-partials: moved ${moveMap.size} partials, updated includes in ${includeRewrites} docs, rewrote ${importRewrites} partial import(s).`,
  );
  for (const [oldAbs, newAbs] of moveMap) {
    console.log(`  ${path.relative(repoRoot, oldAbs)}  ->  ${path.relative(repoRoot, newAbs)}`);
  }
}

main();
