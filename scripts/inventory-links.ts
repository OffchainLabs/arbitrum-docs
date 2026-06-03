/**
 * inventory-links — print the blast radius for a doc path before a restructure.
 *
 * Usage:
 *   yarn inventory-links <path-or-glob>
 *
 * Lists every internal link in the docs tree that resolves to the given file(s), grouped by
 * the file that contains the link, with line numbers and the surface (markdown link, JSX
 * attribute, or partial import). Run this before `move-doc` to confirm the count matches
 * expectations.
 */

import path from 'node:path';
import { glob } from 'glob';

import { buildDocsIndex, scanLinks, isPartial, type LinkRecord } from './lib/docs-link-index';

function surfaceLabel(record: LinkRecord): string {
  const { ref } = record;
  if (ref.surface === 'markdown') return 'link';
  if (ref.surface === 'esm-import') return 'import';
  return `<${ref.elementName ?? 'jsx'} ${ref.attrName ?? ''}>`.trim();
}

async function main(): Promise<void> {
  const arg = process.argv[2];
  if (!arg) {
    console.error('usage: yarn inventory-links <path-or-glob>');
    process.exit(1);
  }

  const repoRoot = process.cwd();
  const matched = await glob(arg, { cwd: repoRoot, absolute: true, nodir: true });
  const targets = matched.filter((file) => /\.mdx?$/.test(file)).map((file) => path.resolve(file));

  if (targets.length === 0) {
    console.error(`no .md/.mdx files matched: ${arg}`);
    process.exit(1);
  }

  const index = await buildDocsIndex(repoRoot);
  const { records, unparsed } = scanLinks(index);

  const byTarget = new Map<string, LinkRecord[]>();
  for (const record of records) {
    if (!record.toFile) continue;
    const bucket = byTarget.get(record.toFile);
    if (bucket) bucket.push(record);
    else byTarget.set(record.toFile, [record]);
  }

  const expressionLinks = records.filter((record) => record.ref.skipped === 'expression');

  for (const target of targets) {
    const url = index.fileToUrl.get(target);
    const descriptor = isPartial(target) ? '(partial — imported, not routed)' : url ?? '(no route)';
    const hits = (byTarget.get(target) ?? []).slice().sort((a, b) => {
      if (a.fromFile !== b.fromFile) return a.fromFile < b.fromFile ? -1 : 1;
      return (a.line ?? 0) - (b.line ?? 0);
    });

    console.log(`\nTarget: ${path.relative(repoRoot, target)}  →  ${descriptor}`);

    if (hits.length === 0) {
      console.log('  No internal references found.');
      continue;
    }

    const fileCount = new Set(hits.map((hit) => hit.fromFile)).size;
    console.log(
      `  ${hits.length} reference${hits.length === 1 ? '' : 's'} across ${fileCount} file${
        fileCount === 1 ? '' : 's'
      }:`,
    );

    let currentFile = '';
    for (const hit of hits) {
      if (hit.fromFile !== currentFile) {
        currentFile = hit.fromFile;
        console.log(`\n  ${path.relative(repoRoot, hit.fromFile)}`);
      }
      const where = hit.line === null ? '   ?' : `L${hit.line}`.padStart(6);
      console.log(`  ${where}  ${surfaceLabel(hit).padEnd(12)} ${hit.ref.rawUrl}`);
    }
  }

  if (expressionLinks.length > 0) {
    console.log(
      `\nNote: ${expressionLinks.length} expression-valued <… to={…}/href={…}> link${
        expressionLinks.length === 1 ? '' : 's'
      } in the tree cannot be resolved statically and need manual review during any restructure.`,
    );
  }

  if (unparsed.length > 0) {
    console.warn(
      `\nWarning: ${unparsed.length} file${
        unparsed.length === 1 ? '' : 's'
      } could not be parsed; their links were not analyzed:`,
    );
    for (const { file, reason } of unparsed) {
      console.warn(`  ${path.relative(repoRoot, file)} — ${reason.split('\n')[0]}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
