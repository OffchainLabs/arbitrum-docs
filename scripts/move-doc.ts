/**
 * move-doc: move a doc file and rewrite everything that points at it.
 *
 * Usage:
 *   pnpm move-doc <from> <to> [--dry-run]
 *
 * In one command this:
 *   1. rewrites every internal link that resolves to <from> so it points at <to>, preserving each
 *      link's written form (absolute URL, `.mdx` file link, relative link, `<include>`, with any
 *      `#anchor`/`?query`);
 *   2. moves the file with `git mv`, re-basing the file's own relative links;
 *   3. updates the doc's entry in the surrounding `meta.json`;
 *   4. appends the old-to-new URL to `redirects.config.ts` between the AUTO-GENERATED markers.
 *
 * Existing redirects are left as written. If one pointed at the old URL it now chains, and
 * `pnpm test` (`scripts/lib/redirects-config.test.ts`) fails on it until it is retargeted by hand.
 *
 * Paths are repo-relative files under `content/docs/`, not site URLs. `--dry-run` prints every
 * change without touching the filesystem. After a real run, verify with `pnpm check-links`.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { format, resolveConfig } from 'prettier';

import {
  CONTENT_DIR,
  type DocIndex,
  type LinkRef,
  type MetaFile,
  type Rewrite,
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
} from './lib/doc-links.ts';

const REDIRECTS_CONFIG_PATH = 'redirects.config.ts';
const REDIRECTS_END = '// AUTO-GENERATED REDIRECTS END';

/** One link occurrence, with the file that holds it and the file it resolves to. */
interface LinkRecord {
  fromAbs: string;
  ref: LinkRef;
  placeholder: boolean;
  toAbs: string | null;
}

/** A planned rewrite, for the report. */
interface Change {
  file: string;
  old: string;
  next: string;
}

function parseArgs(argv: string[]): { from: string; to: string; dryRun: boolean } {
  const positional = argv.filter((a) => !a.startsWith('--'));
  if (positional.length !== 2) {
    console.error('usage: pnpm move-doc <from> <to> [--dry-run]');
    process.exit(1);
  }
  return { from: positional[0], to: positional[1], dryRun: argv.includes('--dry-run') };
}

function validatePath(label: string, raw: string, abs: string, docsRoot: string): void {
  if (raw.startsWith('/')) {
    console.error(
      `move-doc: <${label}> starts with '/': ${raw}\n` +
        `  Pass a repo-relative file path under ${CONTENT_DIR}/, not a site URL, e.g. '${raw.replace(/^\/+/, '')}'.`,
    );
    process.exit(1);
  }
  if (!abs.startsWith(docsRoot + path.sep) || !/\.mdx?$/i.test(abs)) {
    console.error(`move-doc: <${label}> must be a .md/.mdx file under ${CONTENT_DIR}/: ${abs}`);
    process.exit(1);
  }
}

/**
 * Scan every file for links, resolving each to the file it targets. Partials under
 * `content/partials/` and glossary entries are scanned too: `check-links` checks their
 * root-absolute links, so a move must rewrite them.
 */
function scanLinks(index: DocIndex): LinkRecord[] {
  const records: LinkRecord[] = [];
  for (const file of [...index.files, ...index.sharedFiles]) {
    for (const ref of extractRefs(file.content)) {
      // A destination holding a `{var:name}` placeholder resolves, because the resolver expands it
      // the way the build does, but it must never be rewritten: `renderRef` writes a literal path,
      // which would bake the variable's current value into the file. It is still resolved here so
      // that one pointing at the moved page is reported as unrenderable, like an expression
      // include, rather than passed over in silence.
      records.push({
        fromAbs: file.abs,
        ref,
        placeholder: ref.rawUrl.includes('{var:'),
        toAbs: ref.range !== null ? resolveRefToFile(ref.rawUrl, file.abs, index) : null,
      });
    }
  }
  return records;
}

/** Plan one link's rewrite, preserving its form. Returns null when unchanged, `false` when unrenderable. */
function planRewrite(
  ref: LinkRef & { range: [number, number] },
  targetAbs: string,
  containerAbs: string,
  index: DocIndex,
): Rewrite | null | false {
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
function planMove(
  records: LinkRecord[],
  index: DocIndex,
  fromAbs: string,
  toAbs: string,
): { editsByFile: Map<string, Rewrite[]>; changes: Change[]; unrenderable: LinkRecord[] } {
  const editsByFile = new Map<string, Rewrite[]>();
  const changes: Change[] = [];
  const unrenderable: LinkRecord[] = [];
  const pushEdit = (abs: string, rewrite: Rewrite): void => {
    const bucket = editsByFile.get(abs);
    if (bucket) bucket.push(rewrite);
    else editsByFile.set(abs, [rewrite]);
  };

  for (const rec of records) {
    const container = rec.fromAbs === fromAbs ? toAbs : rec.fromAbs;

    // Inbound: someone else links to the moved file.
    if (rec.toAbs === fromAbs && rec.fromAbs !== fromAbs) {
      if (rec.ref.range === null || rec.placeholder) {
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
    if (
      rec.fromAbs === fromAbs &&
      rec.ref.range !== null &&
      rec.toAbs !== null &&
      !rec.placeholder
    ) {
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
function moveFile(fromAbs: string, toAbs: string, repoRoot: string): boolean {
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
 * (only when the dest lists explicit pages without a `...` rest-glob). Never corrupts; returns
 * human-readable notes for anything it declines to touch.
 */
function updateMeta(fromAbs: string, toAbs: string, dryRun: boolean): string[] {
  const notes: string[] = [];
  const oldBase = path.basename(fromAbs).replace(/\.mdx?$/i, '');
  const newBase = path.basename(toAbs).replace(/\.mdx?$/i, '');
  const fromDir = path.dirname(fromAbs);
  const toDir = path.dirname(toAbs);

  if (/^index$/i.test(oldBase) || /^index$/i.test(newBase)) {
    notes.push('index page move: update meta.json navigation manually (folder-level entry).');
    return notes;
  }

  const write = (meta: MetaFile): void => {
    if (!dryRun) writeFileSync(meta.path, stringifyMeta(meta.data));
  };

  if (fromDir === toDir) {
    const meta = readMeta(fromDir);
    const pages = meta && pagesOf(meta);
    if (meta && pages) {
      const i = pages.indexOf(oldBase);
      if (i !== -1) {
        pages[i] = newBase;
        write(meta);
        notes.push(
          `meta.json: renamed '${oldBase}' -> '${newBase}' in ${toPosix(path.basename(path.dirname(meta.path)))}/meta.json`,
        );
      }
    }
    return notes;
  }

  const srcMeta = readMeta(fromDir);
  const srcPages = srcMeta && pagesOf(srcMeta);
  if (srcMeta && srcPages) {
    const i = srcPages.indexOf(oldBase);
    if (i !== -1) {
      srcPages.splice(i, 1);
      write(srcMeta);
      notes.push(`meta.json: removed '${oldBase}' from source dir`);
    }
  }

  const dstMeta = readMeta(toDir);
  const dstPages = dstMeta && pagesOf(dstMeta);
  if (!dstMeta || !dstPages) {
    notes.push(
      `meta.json: dest dir has no explicit pages list; '${newBase}' auto-included by file order (verify ordering).`,
    );
  } else if (pagesHasRest(dstPages)) {
    notes.push(
      `meta.json: dest dir uses '...' rest-glob; '${newBase}' auto-included (verify ordering).`,
    );
  } else if (dstPages.includes(newBase)) {
    notes.push(`meta.json: '${newBase}' already listed in dest dir`);
  } else {
    dstPages.push(newBase);
    write(dstMeta);
    notes.push(`meta.json: appended '${newBase}' to dest dir`);
  }
  return notes;
}

/**
 * A `meta.json`'s `pages` array, the same array object so an edit lands in `meta.data`, or `null`
 * when the file holds no such array.
 */
function pagesOf(meta: MetaFile): unknown[] | null {
  const { data } = meta;
  if (typeof data !== 'object' || data === null || !('pages' in data)) return null;
  return Array.isArray(data.pages) ? data.pages : null;
}

/** Append one redirect before the AUTO-GENERATED END marker and format the file with Prettier. */
async function appendRedirect(
  redirectsPath: string,
  source: string,
  destination: string,
): Promise<void> {
  const current = readFileSync(redirectsPath, 'utf8');
  if (!current.includes(REDIRECTS_END)) {
    throw new Error(`move-doc: ${REDIRECTS_CONFIG_PATH} is missing the ${REDIRECTS_END} marker`);
  }
  // JSON string literals are valid TypeScript ones, so a quote or backslash in a file name cannot
  // end the string early; Prettier then re-quotes them to the repo's style. The replacement is a
  // callback so a `$&` or `$1` in a path is inserted literally rather than expanded.
  const entry =
    `  { source: ${JSON.stringify(source)}, destination: ${JSON.stringify(destination)}, ` +
    `permanent: true },\n  ${REDIRECTS_END}`;
  const next = current.replace(`  ${REDIRECTS_END}`, () => entry);
  const config = await resolveConfig(redirectsPath);
  writeFileSync(redirectsPath, await format(next, { ...config, filepath: redirectsPath }));
}

/** The set of relative links inside partials that can't be auto-resolved (a partial has no fixed URL). */
function ambiguousPartialLinks(records: LinkRecord[]): LinkRecord[] {
  return records.filter((rec) => {
    if (rec.toAbs !== null || !isPartial(rec.fromAbs)) return false;
    const { pathPart } = splitSuffix(rec.ref.rawUrl);
    return (
      !isExternalOrFragment(pathPart) && pathPart.startsWith('.') && !/\.mdx?$/i.test(pathPart)
    );
  });
}

/** An indexed file's content; every path this is asked for came out of the index. */
function contentOf(index: DocIndex, abs: string): string {
  const file = [...index.files, ...index.sharedFiles].find((f) => f.abs === abs);
  if (!file) throw new Error(`move-doc: not an indexed doc: ${abs}`);
  return file.content;
}

async function main(): Promise<void> {
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
  // A partial has no URL, so moving one needs no redirect.
  const redirect =
    fromMeta.url && toMeta.url && fromMeta.url !== toMeta.url
      ? { source: fromMeta.url, destination: toMeta.url }
      : null;
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
    if (redirect) {
      console.log(
        `  redirect: { source: '${redirect.source}', destination: '${redirect.destination}', permanent: true }`,
      );
    }
    console.log('\n[dry-run] no files were changed.');
    return;
  }

  // Apply inbound edits (every file except the moved one, which is written post-move with its edits).
  for (const [abs, rewrites] of editsByFile) {
    if (abs === fromAbs) continue;
    writeFileSync(abs, applyRewrites(contentOf(index, abs), rewrites));
  }

  // Move the primary file, then write it with its own re-based links applied.
  const movedContent = applyRewrites(contentOf(index, fromAbs), editsByFile.get(fromAbs) ?? []);
  const staged = moveFile(fromAbs, toAbs, repoRoot);
  writeFileSync(toAbs, movedContent);
  if (!staged)
    console.warn('  note: moved without git (untracked source or no work tree); move is unstaged');

  for (const n of updateMeta(fromAbs, toAbs, false)) console.log(`  ${n}`);

  if (redirect) {
    await appendRedirect(
      path.join(repoRoot, REDIRECTS_CONFIG_PATH),
      redirect.source,
      redirect.destination,
    );
    console.log(
      `  ${REDIRECTS_CONFIG_PATH}: appended ${redirect.source} -> ${redirect.destination}`,
    );
  }

  console.log('\nDone. Verify with `pnpm check-links`.');
}

function exitErr(msg: string): never {
  console.error(`move-doc: ${msg}`);
  process.exit(1);
}

await main();
