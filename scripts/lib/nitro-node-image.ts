/**
 * nitro-node-image: keep opted-in hardcoded copies of `latestNitroNodeImage` in step with vars.json.
 *
 * `<Var>` renders nothing inside a code fence or an inline code span, so a copy-pasteable
 * `docker run` command has to carry the image tag literally. When `check-nitro-release` bumps the
 * variable, this rewrites the outgoing tag in those commands.
 *
 * A file opts in by carrying the marker `{/* sync-with-var: latestNitroNodeImage *\/}` anywhere.
 * Matching the outgoing value alone is not safe: `content/docs/run-a-node/arbos-releases/*.mdx`
 * pin the minimum Nitro version per ArbOS release, which can equal the current image, and must
 * never be rewritten. Never put the marker on a page that states a version historically.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { toPosix, walk } from './partials.ts';

const isMdx = (p: string): boolean => /\.mdx?$/i.test(p);

const markerRe = /\{\s*\/\*\s*sync-with-var:\s*latestNitroNodeImage\s*\*\/\s*\}/;

/** Whether `source` opts in to having its hardcoded image tag rewritten. */
export function optsIntoSync(source: string): boolean {
  return markerRe.test(source);
}

/** Replace every occurrence of `from` with `to` in `source`, returning the text and the count. */
export function rewriteImage(
  source: string,
  from: string | undefined,
  to: string,
): { text: string; count: number } {
  if (!from || from === to) return { text: source, count: 0 };
  const parts = source.split(from);
  return { text: parts.join(to), count: parts.length - 1 };
}

/** One file {@link syncImageInContent} changed, repo-relative, and how many copies it rewrote. */
export interface SyncedFile {
  rel: string;
  count: number;
}

/**
 * Rewrite the outgoing image tag in every opted-in file under `content/`. A `content/_versions/`
 * directory, if present, is left alone. Pass `write: false` to report without touching disk.
 */
export function syncImageInContent(
  repoRoot: string,
  from: string | undefined,
  to: string,
  { write = true }: { write?: boolean } = {},
): SyncedFile[] {
  const changed: SyncedFile[] = [];
  if (!from || from === to) return changed;

  const root = path.join(repoRoot, 'content');
  const archive = path.join(root, '_versions') + path.sep;
  for (const abs of walk(root, isMdx)) {
    if (abs.startsWith(archive)) continue;
    const source = readFileSync(abs, 'utf8');
    if (!optsIntoSync(source)) continue;
    const { text, count } = rewriteImage(source, from, to);
    if (count === 0) continue;
    if (write) writeFileSync(abs, text);
    changed.push({ rel: toPosix(path.relative(repoRoot, abs)), count });
  }
  return changed;
}
