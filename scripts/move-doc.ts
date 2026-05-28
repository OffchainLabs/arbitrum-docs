/**
 * move-doc — move a doc file and rewrite everything that points at it.
 *
 * Usage:
 *   yarn move-doc <from> <to> [--dry-run]
 *
 * In one command this:
 *   1. rewrites every internal link in the tree that resolves to <from> so it points at <to>,
 *      preserving each link's written form (absolute URL, relative file path, `@site/…`, anchor);
 *   2. moves the file, recomputing the file's *own* relative links so they stay valid from the
 *      new location;
 *   3. updates the doc id referenced in `sidebars.js`;
 *   4. records the old→new URL in `redirects.config.ts` (created if absent).
 *
 * `--dry-run` prints every change without touching the filesystem. After a real run, verify with
 * `yarn build` and propagate the redirect to the edge with `yarn sync-redirects`.
 */

import path from 'node:path';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import matter from 'gray-matter';

import { resolveDocUrl, resolveDocId, applyRewrites, type Rewrite } from './lib/mdx-link-codemod';
import {
  buildDocsIndex,
  scanLinks,
  splitSuffix,
  detectLinkStyle,
  renderRef,
  isPartial,
  type DocsIndex,
  type LinkRecord,
} from './lib/docs-link-index';

const REDIRECTS_START = '// AUTO-GENERATED REDIRECTS START';
const REDIRECTS_END = '// AUTO-GENERATED REDIRECTS END';

interface Args {
  from: string;
  to: string;
  dryRun: boolean;
}

function parseArgs(argv: string[]): Args {
  const positional = argv.filter((arg) => !arg.startsWith('--'));
  const dryRun = argv.includes('--dry-run');
  if (positional.length !== 2) {
    console.error('usage: yarn move-doc <from> <to> [--dry-run]');
    process.exit(1);
  }
  return { from: positional[0], to: positional[1], dryRun };
}

/** A pending rewrite of a single file's contents. */
interface FileEdit {
  abs: string;
  content: string;
  rewrites: Rewrite[];
}

/** A human-readable description of one link rewrite, for `--dry-run` output. */
interface Change {
  file: string;
  old: string;
  next: string;
}

/** Build rewrites for links pointing AT the moved file (target moved, container unchanged). */
function planInbound(
  records: LinkRecord[],
  index: DocsIndex,
  fromAbs: string,
  toAbs: string,
  newUrl: string | null,
): { edits: FileEdit[]; unrenderable: LinkRecord[]; changes: Change[] } {
  const byFile = new Map<string, LinkRecord[]>();
  for (const record of records) {
    if (record.toFile !== fromAbs || record.fromFile === fromAbs) continue;
    const bucket = byFile.get(record.fromFile);
    if (bucket) bucket.push(record);
    else byFile.set(record.fromFile, [record]);
  }

  const edits: FileEdit[] = [];
  const unrenderable: LinkRecord[] = [];
  const changes: Change[] = [];
  for (const [abs, recs] of byFile) {
    const file = index.files.find((candidate) => candidate.abs === abs);
    if (!file) continue;
    const containerUrl = index.fileToUrl.get(abs) ?? null;
    const rewrites: Rewrite[] = [];
    for (const record of recs) {
      if (record.ref.range === null) {
        unrenderable.push(record);
        continue;
      }
      const { pathPart, suffix } = splitSuffix(record.ref.rawUrl);
      const style = detectLinkStyle(pathPart);
      const newPath = renderRef(
        style,
        { abs: toAbs, url: newUrl },
        { abs, url: containerUrl },
        index,
      );
      if (newPath === null) {
        unrenderable.push(record);
        continue;
      }
      const next = newPath + suffix;
      if (next !== record.ref.rawUrl) {
        rewrites.push({ range: record.ref.range, newText: next });
        changes.push({ file: abs, old: record.ref.rawUrl, next });
      }
    }
    if (rewrites.length > 0) edits.push({ abs, content: file.content, rewrites });
  }
  return { edits, unrenderable, changes };
}

/** Rewrite the moved file's own relative links so they remain valid from the new location. */
function planOutbound(
  records: LinkRecord[],
  index: DocsIndex,
  fromAbs: string,
  toAbs: string,
  newUrl: string | null,
): { rewrites: Rewrite[]; changes: Change[] } {
  const rewrites: Rewrite[] = [];
  const changes: Change[] = [];
  for (const record of records) {
    if (record.fromFile !== fromAbs || record.ref.range === null || record.toFile === null)
      continue;
    const { pathPart, suffix } = splitSuffix(record.ref.rawUrl);
    const style = detectLinkStyle(pathPart);
    // Absolute forms (`/x`, `@site/…`) are location-independent; only relative forms move.
    if (style !== 'fileRel' && style !== 'urlRel') continue;
    const targetUrl = index.fileToUrl.get(record.toFile) ?? null;
    const newPath = renderRef(
      style,
      { abs: record.toFile, url: targetUrl },
      { abs: toAbs, url: newUrl },
      index,
    );
    if (newPath === null) continue;
    const next = newPath + suffix;
    if (next !== record.ref.rawUrl) {
      rewrites.push({ range: record.ref.range, newText: next });
      changes.push({ file: toAbs, old: record.ref.rawUrl, next });
    }
  }
  return { rewrites, changes };
}

/** Replace a doc id everywhere it is referenced as a quoted string in `sidebars.js`. */
function updateSidebars(
  content: string,
  oldId: string,
  newId: string,
): { content: string; count: number } {
  let count = 0;
  let updated = content;
  for (const quote of ["'", '"']) {
    const needle = `${quote}${oldId}${quote}`;
    const replacement = `${quote}${newId}${quote}`;
    const parts = updated.split(needle);
    count += parts.length - 1;
    updated = parts.join(replacement);
  }
  return { content: updated, count };
}

function redirectsTemplate(): string {
  return `/**
 * Internal doc redirects: old URL -> new URL.
 *
 * Entries between the AUTO-GENERATED markers are maintained by \`yarn move-doc\`. Consumed by
 * \`@docusaurus/plugin-client-redirects\` (in-app) and \`yarn sync-redirects\` (which mirrors them
 * into vercel.json for the edge). Types live in redirects.config.d.ts.
 */
export const redirects = [
  ${REDIRECTS_START}
  ${REDIRECTS_END}
];
`;
}

/** Append a redirect entry to redirects.config.ts (creating the file if needed). Idempotent on `from`. */
async function appendRedirect(
  redirectsPath: string,
  from: string,
  to: string,
  dryRun: boolean,
): Promise<'created' | 'appended' | 'exists'> {
  const existed = existsSync(redirectsPath);
  const current = existed ? await readFile(redirectsPath, 'utf8') : redirectsTemplate();

  if (current.includes(`from: '${from}'`)) return 'exists';
  if (!current.includes(REDIRECTS_END)) {
    throw new Error(
      `move-doc: ${path.basename(redirectsPath)} is missing the ${REDIRECTS_END} sentinel`,
    );
  }

  const entry = `  { from: '${from}', to: '${to}' },\n  ${REDIRECTS_END}`;
  const next = current.replace(`  ${REDIRECTS_END}`, entry);
  if (!dryRun) await writeFile(redirectsPath, next);
  return existed ? 'appended' : 'created';
}

async function main(): Promise<void> {
  const { from, to, dryRun } = parseArgs(process.argv.slice(2));
  const repoRoot = process.cwd();
  const fromAbs = path.resolve(repoRoot, from);
  const toAbs = path.resolve(repoRoot, to);
  const docsRoot = path.join(repoRoot, 'docs');

  for (const [label, abs] of [
    ['from', fromAbs],
    ['to', toAbs],
  ] as const) {
    if (!abs.startsWith(docsRoot + path.sep) || !/\.mdx?$/.test(abs)) {
      console.error(`move-doc: <${label}> must be a .md/.mdx file under docs/: ${abs}`);
      process.exit(1);
    }
  }
  if (fromAbs === toAbs) {
    console.error('move-doc: <from> and <to> are the same path');
    process.exit(1);
  }
  if (!existsSync(fromAbs)) {
    console.error(`move-doc: <from> does not exist: ${fromAbs}`);
    process.exit(1);
  }
  if (existsSync(toAbs)) {
    console.error(`move-doc: <to> already exists: ${toAbs}`);
    process.exit(1);
  }

  const index = await buildDocsIndex(repoRoot);
  const fromFile = index.files.find((file) => file.abs === fromAbs);
  if (!fromFile) {
    console.error(`move-doc: <from> is not an indexed doc: ${fromAbs}`);
    process.exit(1);
  }

  const partial = isPartial(fromAbs);
  const frontmatter = matter(fromFile.content).data as Record<string, unknown>;
  const toRel = path.join('docs', path.relative(docsRoot, toAbs));
  const oldUrl = partial ? null : resolveDocUrl(fromFile.rel, frontmatter);
  const newUrl = partial ? null : resolveDocUrl(toRel, frontmatter);
  const oldId = partial ? null : resolveDocId(fromFile.rel);
  const newId = partial ? null : resolveDocId(toRel);

  const { records, unparsed } = scanLinks(index);
  const {
    edits,
    unrenderable,
    changes: inboundChanges,
  } = planInbound(records, index, fromAbs, toAbs, newUrl);
  const { rewrites: outboundRewrites, changes: outboundChanges } = planOutbound(
    records,
    index,
    fromAbs,
    toAbs,
    newUrl,
  );
  const movedContent = applyRewrites(fromFile.content, outboundRewrites);

  const sidebarsPath = path.join(repoRoot, 'sidebars.js');
  const sidebarsBefore = await readFile(sidebarsPath, 'utf8');
  const sidebarsResult =
    oldId && newId && oldId !== newId
      ? updateSidebars(sidebarsBefore, oldId, newId)
      : { content: sidebarsBefore, count: 0 };

  // Glossary terms are rendered into runtime quicklook tooltips from the generated
  // static/glossary.json, which `yarn build` does NOT validate. If a glossary source partial
  // was rewritten (or moved), the generated JSON must be regenerated separately.
  const isGlossary = (p: string) => p.replace(/\\/g, '/').includes('/partials/glossary/');
  const touchedGlossary =
    edits.some((edit) => isGlossary(edit.abs)) || isGlossary(fromAbs) || isGlossary(toAbs);
  const glossaryReminder =
    'Glossary content was affected — run `yarn build-glossary` to refresh static/glossary.json ' +
    '(the quicklook tooltips). `yarn build` does not flag stale glossary links.';

  const inboundRefCount = edits.reduce((sum, edit) => sum + edit.rewrites.length, 0);
  console.log(
    `${dryRun ? '[dry-run] ' : ''}move ${fromFile.rel} -> ${path.relative(repoRoot, toAbs)}`,
  );
  if (!partial)
    console.log(
      `  url:  ${oldUrl}  ->  ${newUrl}${oldUrl === newUrl ? '  (unchanged: slug override)' : ''}`,
    );
  console.log(`  inbound link rewrites: ${inboundRefCount} across ${edits.length} file(s)`);
  for (const edit of edits)
    console.log(`    ${path.relative(repoRoot, edit.abs)} (${edit.rewrites.length})`);
  console.log(`  moved-file relative links rewritten: ${outboundRewrites.length}`);
  console.log(`  sidebars.js id replacements: ${sidebarsResult.count}`);

  if (unrenderable.length > 0) {
    console.warn(
      `  WARNING: ${unrenderable.length} reference(s) could not be rewritten (review manually):`,
    );
    for (const record of unrenderable) {
      console.warn(`    ${path.relative(repoRoot, record.fromFile)}: ${record.ref.rawUrl}`);
    }
  }
  if (unparsed.length > 0) {
    console.warn(
      `  WARNING: ${unparsed.length} file(s) could not be parsed and were not scanned for references:`,
    );
    for (const { file } of unparsed) console.warn(`    ${path.relative(repoRoot, file)}`);
  }

  if (dryRun) {
    const allChanges = [...inboundChanges, ...outboundChanges];
    if (allChanges.length > 0) {
      console.log('\n  rewrites:');
      for (const change of allChanges) {
        console.log(
          `    ${path.relative(repoRoot, change.file)}: ${change.old}  ->  ${change.next}`,
        );
      }
    }
    if (!partial && oldUrl !== newUrl)
      console.log(`  redirect: { from: '${oldUrl}', to: '${newUrl}' }`);
    if (touchedGlossary) console.log(`\n  ${glossaryReminder}`);
    console.log('\n[dry-run] no files were changed.');
    return;
  }

  for (const edit of edits) {
    await writeFile(edit.abs, applyRewrites(edit.content, edit.rewrites));
  }
  await mkdir(path.dirname(toAbs), { recursive: true });
  await writeFile(toAbs, movedContent);
  await rm(fromAbs);
  if (sidebarsResult.count > 0) await writeFile(sidebarsPath, sidebarsResult.content);

  if (!partial && oldUrl && newUrl && oldUrl !== newUrl) {
    const status = await appendRedirect(
      path.join(repoRoot, 'redirects.config.js'),
      oldUrl,
      newUrl,
      false,
    );
    console.log(`  redirects.config.js: ${status} { from: '${oldUrl}', to: '${newUrl}' }`);
  }

  console.log(
    '\nDone. Next: `yarn build` to verify links, then `yarn sync-redirects` to update vercel.json.',
  );
  if (touchedGlossary) console.log(`Also: ${glossaryReminder}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
