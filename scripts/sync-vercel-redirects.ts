/**
 * sync-vercel-redirects — mirror `redirects.config.ts` into `vercel.json`'s edge redirects.
 *
 * Usage:
 *   yarn sync-redirects
 *
 * The generated redirects are written as a contiguous block at the front of `vercel.json`'s
 * `redirects` array, bounded by two sentinel entries. The block is regenerated in full on every
 * run (idempotent); every hand-maintained redirect after it is left byte-for-byte unchanged.
 * The edit is a line splice, not a JSON re-serialization, so the file's existing formatting is
 * preserved. The script refuses to write if the result is not valid JSON, or if exactly one
 * sentinel is present (a corrupted block).
 */

import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';

import { redirects } from '../redirects.config';

// Sentinel entries: valid, non-looping redirects that mark the auto-generated region. Their
// source paths are namespaced so they never match real traffic.
const START_SOURCE = '/__redirects-autogen-start__';
const END_SOURCE = '/__redirects-autogen-end__';
const INDENT = '    ';

function entryLine(source: string, destination: string): string {
  return INDENT + JSON.stringify({ source, destination, permanent: false }) + ',';
}

// Every block line (including the END sentinel) carries a trailing comma. That is correct
// because the block is inserted at the FRONT of the `redirects` array, ahead of the existing
// hand-maintained entries — so a comma always separates it from what follows. This assumes the
// array is non-empty (always true for this repo's vercel.json); inserting into a completely
// empty `redirects: []` would leave a trailing comma before `]`, which the JSON.parse guard
// below would reject (fail-safe: it refuses to write rather than emit invalid JSON).
function buildBlock(): string[] {
  const lines = [entryLine(START_SOURCE, '/')];
  for (const redirect of redirects) lines.push(entryLine(redirect.from, redirect.to));
  lines.push(entryLine(END_SOURCE, '/'));
  return lines;
}

async function main(): Promise<void> {
  const vercelPath = path.join(process.cwd(), 'vercel.json');
  const text = await readFile(vercelPath, 'utf8');
  const lines = text.split('\n');

  const startIdx = lines.findIndex((line) => line.includes(START_SOURCE));
  const endIdx = lines.findIndex((line) => line.includes(END_SOURCE));

  if ((startIdx === -1) !== (endIdx === -1)) {
    throw new Error(
      'sync-redirects: exactly one autogen sentinel found in vercel.json — refusing to edit a corrupted block.',
    );
  }

  const block = buildBlock();
  let next: string;
  if (startIdx === -1) {
    const arrayIdx = lines.findIndex((line) => /"redirects"\s*:\s*\[/.test(line));
    if (arrayIdx === -1)
      throw new Error('sync-redirects: could not find the "redirects": [ array in vercel.json');
    next = [...lines.slice(0, arrayIdx + 1), ...block, ...lines.slice(arrayIdx + 1)].join('\n');
  } else {
    if (startIdx > endIdx)
      throw new Error('sync-redirects: autogen sentinels are out of order in vercel.json');
    next = [...lines.slice(0, startIdx), ...block, ...lines.slice(endIdx + 1)].join('\n');
  }

  try {
    JSON.parse(next);
  } catch (error) {
    throw new Error(`sync-redirects: refusing to write — result is not valid JSON: ${error}`);
  }

  if (next === text) {
    console.log('sync-redirects: vercel.json already up to date.');
    return;
  }
  await writeFile(vercelPath, next);
  console.log(`sync-redirects: wrote ${redirects.length} generated redirect(s) into vercel.json.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
