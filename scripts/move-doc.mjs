/**
 * move-doc — move a doc file and rewrite everything that points at it.
 *
 * Usage:
 *   pnpm move-doc <from> <to> [--dry-run]
 *
 * In one command this:
 *   1. rewrites every internal link in the tree that resolves to <from> so it points at <to>,
 *      preserving each link's written form (absolute URL, `.mdx` file link, relative link, `<include>`,
 *      with any `#anchor`/`?query`);
 *   2. moves the file (via `git mv`), recomputing the file's *own* relative links so they stay valid;
 *   3. updates the doc's entry in the surrounding `meta.json` navigation;
 *   4. records the old→new URL in `redirects.config.mjs`.
 *
 * `--dry-run` prints every change without touching the filesystem. Paths are repo-relative files under
 * `content/docs/` (not site URLs). After a real run, verify with `pnpm restructure` or `pnpm check-links`.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  CONTENT_DIR,
  applyRewrites,
  buildIndex,
  computeFileMeta,
  detectStyle,
  extractRefs,
  isExternalOrFragment,
  isPartial,
  pagesHasRest,
  readMeta,
  renderRef,
  resolveRefToFile,
  splitSuffix,
  stringifyMeta,
  toPosix,
} from './lib/doc-links.mjs';

const REDIRECTS_START = '// AUTO-GENERATED REDIRECTS START';
const REDIRECTS_END = '// AUTO-GENERATED REDIRECTS END';

function parseArgs(argv) {
  const positional = argv.filter((a) => !a.startsWith('--'));
  if (positional.length !== 2) {
    console.error('usage: pnpm move-doc <from> <to> [--dry-run]');
    process.exit(1);
  }
  return { from: positional[0], to: positional[1], dryRun: argv.includes('--dry-run') };
}

function validatePath(label, raw, abs, docsRoot) {
  if (raw.startsWith('/')) {
    console.error(
      `move-doc: <${label}> starts with '/': ${raw}\n` +
        `  Pass a repo-relative file path under ${CONTENT_DIR}/, not a site URL — e.g. '${raw.replace(/^\/+/, '')}'.`,
    );
    process.exit(1);
  }
  if (!abs.startsWith(docsRoot + path.sep) || !/\.mdx?$/i.test(abs)) {
    console.error(`move-doc: <${label}> must be a .md/.mdx file under ${CONTENT_DIR}/: ${abs}`);
    process.exit(1);
  }
}

/** Scan every file for links, resolving each to the file it targets. */
function scanLinks(index) {
  const records = [];
  for (const file of index.files) {
    for (const ref of extractRefs(file.content)) {
      records.push({
        fromAbs: file.abs,
        ref,
        toAbs: ref.range === null ? null : resolveRefToFile(ref.rawUrl, file.abs, index),
      });
    }
  }
  return records;
}

/** Plan one link's rewrite, preserving its form. Returns null when unchanged, `false` when unrenderable. */
function planRewrite(ref, targetAbs, containerAbs, index) {
  const { pathPart, suffix } = splitSuffix(ref.rawUrl);
  const style = detectStyle(pathPart, ref.surface);
  const next = renderRef(style, targetAbs, containerAbs, pathPart, index);
  if (next === null) return false;
  const full = next + suffix;
  if (full === ref.rawUrl) return null;
  return { range: ref.range, newText: full };
}

/**
 * Build inbound rewrites (links across the tree that point AT the moved file) and outbound rewrites
 * (the moved file's own relative links, re-based from its new directory). Returns per-file edits,
 * a flat change list for reporting, and links that resolve to the move but can't be auto-rewritten.
 */
function planMove(records, index, fromAbs, toAbs) {
  const editsByFile = new Map();
  const changes = [];
  const unrenderable = [];
  const pushEdit = (abs, rewrite) => {
    const bucket = editsByFile.get(abs);
    if (bucket) bucket.push(rewrite);
    else editsByFile.set(abs, [rewrite]);
  };

  for (const rec of records) {
    const container = rec.fromAbs === fromAbs ? toAbs : rec.fromAbs;

    // Inbound: someone else links to the moved file.
    if (rec.toAbs === fromAbs && rec.fromAbs !== fromAbs) {
      if (rec.ref.range === null) {
        unrenderable.push(rec);
        continue;
      }
      const plan = planRewrite(rec.ref, toAbs, container, index);
      if (plan === false) unrenderable.push(rec);
      else if (plan) {
        pushEdit(rec.fromAbs, plan);
        changes.push({ file: rec.fromAbs, old: rec.ref.rawUrl, next: plan.newText });
      }
      continue;
    }

    // Outbound: the moved file's own relative links must survive the new location.
    if (rec.fromAbs === fromAbs && rec.ref.range !== null && rec.toAbs !== null) {
      const style = detectStyle(splitSuffix(rec.ref.rawUrl).pathPart, rec.ref.surface);
      if (style !== 'fileRel' && style !== 'urlRel' && style !== 'include') continue;
      const target = rec.toAbs === fromAbs ? toAbs : rec.toAbs;
      const plan = planRewrite(rec.ref, target, toAbs, index);
      if (plan) {
        pushEdit(fromAbs, plan); // keyed under fromAbs; applied to the moved content before write
        changes.push({ file: toAbs, old: rec.ref.rawUrl, next: plan.newText });
      }
    }
  }

  return { editsByFile, changes, unrenderable };
}

/** Move a file with `git mv` (staged rename); fall back to a filesystem move. Returns true if staged. */
function moveFile(fromAbs, toAbs, repoRoot) {
  mkdirSync(path.dirname(toAbs), { recursive: true });
  try {
    execFileSync('git', ['mv', fromAbs, toAbs], { cwd: repoRoot, stdio: 'pipe' });
    return true;
  } catch {
    renameSync(fromAbs, toAbs);
    return false;
  }
}

/**
 * Update the surrounding `meta.json` `pages` ordering for a move. Same-directory rename replaces the
 * basename token; cross-directory move removes it from the source dir and appends it to the dest dir
 * (only when the dest lists explicit pages without a `...` rest-glob). Never corrupts — returns
 * human-readable notes for anything it declines to touch.
 */
function updateMeta(fromAbs, toAbs, dryRun) {
  const notes = [];
  const oldBase = path.basename(fromAbs).replace(/\.mdx?$/i, '');
  const newBase = path.basename(toAbs).replace(/\.mdx?$/i, '');
  const fromDir = path.dirname(fromAbs);
  const toDir = path.dirname(toAbs);

  if (/^index$/i.test(oldBase) || /^index$/i.test(newBase)) {
    notes.push('index page move — update meta.json navigation manually (folder-level entry).');
    return notes;
  }

  const write = (meta) => {
    if (!dryRun) writeFileSync(meta.path, stringifyMeta(meta.data));
  };

  if (fromDir === toDir) {
    const meta = readMeta(fromDir);
    if (meta && Array.isArray(meta.data.pages)) {
      const i = meta.data.pages.indexOf(oldBase);
      if (i !== -1) {
        meta.data.pages[i] = newBase;
        write(meta);
        notes.push(
          `meta.json: renamed '${oldBase}' -> '${newBase}' in ${toPosix(path.basename(path.dirname(meta.path)))}/meta.json`,
        );
      }
    }
    return notes;
  }

  const srcMeta = readMeta(fromDir);
  if (srcMeta && Array.isArray(srcMeta.data.pages)) {
    const i = srcMeta.data.pages.indexOf(oldBase);
    if (i !== -1) {
      srcMeta.data.pages.splice(i, 1);
      write(srcMeta);
      notes.push(`meta.json: removed '${oldBase}' from source dir`);
    }
  }

  const dstMeta = readMeta(toDir);
  if (!dstMeta || !Array.isArray(dstMeta.data.pages)) {
    notes.push(
      `meta.json: dest dir has no explicit pages list — '${newBase}' auto-included by file order (verify ordering).`,
    );
  } else if (pagesHasRest(dstMeta.data.pages)) {
    notes.push(
      `meta.json: dest dir uses '...' rest-glob — '${newBase}' auto-included (verify ordering).`,
    );
  } else if (dstMeta.data.pages.includes(newBase)) {
    notes.push(`meta.json: '${newBase}' already listed in dest dir`);
  } else {
    dstMeta.data.pages.push(newBase);
    write(dstMeta);
    notes.push(`meta.json: appended '${newBase}' to dest dir`);
  }
  return notes;
}

function redirectsTemplate() {
  return `// Single source of truth for internal doc redirects. Consumed by next.config.mjs.
// Entries between the AUTO-GENERATED markers are maintained by \`pnpm move-doc\`.
/** @type {{ source: string, destination: string, permanent: boolean }[]} */
export const redirects = [
  ${REDIRECTS_START}
  ${REDIRECTS_END}
];
`;
}

/** Append one redirect to redirects.config.mjs (creating it if absent). Idempotent on `source`. */
function appendRedirect(redirectsPath, source, destination, dryRun) {
  const existed = existsSync(redirectsPath);
  const current = existed ? readFileSync(redirectsPath, 'utf8') : redirectsTemplate();
  if (current.includes(`source: '${source}'`)) return 'exists';
  if (!current.includes(REDIRECTS_END)) {
    throw new Error(
      `move-doc: ${path.basename(redirectsPath)} is missing the ${REDIRECTS_END} sentinel`,
    );
  }
  const entry = `  { source: '${source}', destination: '${destination}', permanent: true },\n  ${REDIRECTS_END}`;
  const next = current.replace(`  ${REDIRECTS_END}`, entry);
  if (!dryRun) writeFileSync(redirectsPath, next);
  return existed ? 'appended' : 'created';
}

/** The set of relative links inside partials that can't be auto-resolved (a partial has no fixed URL). */
function ambiguousPartialLinks(records) {
  return records.filter((rec) => {
    if (rec.toAbs !== null || !isPartial(rec.fromAbs)) return false;
    const { pathPart } = splitSuffix(rec.ref.rawUrl);
    return (
      !isExternalOrFragment(pathPart) && pathPart.startsWith('.') && !/\.mdx?$/i.test(pathPart)
    );
  });
}

function main() {
  const { from, to, dryRun } = parseArgs(process.argv.slice(2));
  const repoRoot = process.cwd();
  const docsRoot = path.join(repoRoot, CONTENT_DIR);
  const fromAbs = path.resolve(repoRoot, from);
  const toAbs = path.resolve(repoRoot, to);

  validatePath('from', from, fromAbs, docsRoot);
  validatePath('to', to, toAbs, docsRoot);
  if (fromAbs === toAbs) exitErr('<from> and <to> are the same path');
  if (!existsSync(fromAbs)) exitErr(`<from> does not exist: ${fromAbs}`);
  if (existsSync(toAbs)) exitErr(`<to> already exists: ${toAbs}`);

  const index = buildIndex(repoRoot);
  if (!index.byAbs.has(fromAbs)) exitErr(`<from> is not an indexed doc: ${fromAbs}`);

  const fromMeta = computeFileMeta(docsRoot, fromAbs);
  const toMeta = computeFileMeta(docsRoot, toAbs);

  const records = scanLinks(index);
  const { editsByFile, changes, unrenderable } = planMove(records, index, fromAbs, toAbs);

  const relFrom = toPosix(path.relative(repoRoot, fromAbs));
  const relTo = toPosix(path.relative(repoRoot, toAbs));
  const inboundCount = [...editsByFile].reduce(
    (n, [abs, rw]) => (abs === fromAbs ? n : n + rw.length),
    0,
  );
  const outboundCount = (editsByFile.get(fromAbs) ?? []).length;

  console.log(`${dryRun ? '[dry-run] ' : ''}move ${relFrom} -> ${relTo}`);
  console.log(`  url:  ${fromMeta.url}  ->  ${toMeta.url}`);
  console.log(
    `  inbound link rewrites: ${inboundCount} across ${[...editsByFile.keys()].filter((a) => a !== fromAbs).length} file(s)`,
  );
  console.log(`  moved-file relative links rewritten: ${outboundCount}`);

  const partialWarns = ambiguousPartialLinks(records);
  if (unrenderable.length) {
    console.warn(
      `  WARNING: ${unrenderable.length} reference(s) resolve to the move but can't be auto-rewritten:`,
    );
    for (const rec of unrenderable)
      console.warn(
        `    ${toPosix(path.relative(repoRoot, rec.fromAbs))}: ${rec.ref.rawUrl || '(expression)'}`,
      );
  }
  if (partialWarns.length) {
    console.warn(
      `  WARNING: ${partialWarns.length} relative link(s) inside partials can't be resolved (no fixed URL); update manually if affected:`,
    );
    for (const rec of partialWarns)
      console.warn(`    ${toPosix(path.relative(repoRoot, rec.fromAbs))}: ${rec.ref.rawUrl}`);
  }

  if (dryRun) {
    if (changes.length) {
      console.log('\n  rewrites:');
      for (const c of changes)
        console.log(`    ${toPosix(path.relative(repoRoot, c.file))}: ${c.old}  ->  ${c.next}`);
    }
    const metaNotes = updateMeta(fromAbs, toAbs, true);
    for (const n of metaNotes) console.log(`  ${n}`);
    if (fromMeta.url !== toMeta.url) {
      console.log(
        `  redirect: { source: '${fromMeta.url}', destination: '${toMeta.url}', permanent: true }`,
      );
    }
    console.log('\n[dry-run] no files were changed.');
    return;
  }

  // Apply inbound edits (every file except the moved one, which is written post-move with its edits).
  for (const [abs, rewrites] of editsByFile) {
    if (abs === fromAbs) continue;
    const file = index.files.find((f) => f.abs === abs);
    writeFileSync(abs, applyRewrites(file.content, rewrites));
  }

  // Move the primary file, then write it with its own re-based links applied.
  const movedContent = applyRewrites(
    index.files.find((f) => f.abs === fromAbs).content,
    editsByFile.get(fromAbs) ?? [],
  );
  const staged = moveFile(fromAbs, toAbs, repoRoot);
  writeFileSync(toAbs, movedContent);
  if (!staged)
    console.warn('  note: moved without git (untracked source or no work tree) — move is unstaged');

  for (const n of updateMeta(fromAbs, toAbs, false)) console.log(`  ${n}`);

  // Redirect for the moved URL.
  const redirectsPath = path.join(repoRoot, 'redirects.config.mjs');
  if (fromMeta.url !== toMeta.url) {
    console.log(
      `  redirects.config.mjs: ${appendRedirect(redirectsPath, fromMeta.url, toMeta.url, false)} ${fromMeta.url} -> ${toMeta.url}`,
    );
  }

  console.log('\nDone. Verify with `pnpm check-links` (or `pnpm restructure` runs it for you).');
}

function exitErr(msg) {
  console.error(`move-doc: ${msg}`);
  process.exit(1);
}

main();
