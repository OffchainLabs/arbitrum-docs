/**
 * nitro-node-image — keep opted-in hardcoded copies of `latestNitroNodeImage` in step with vars.json.
 *
 * `<Var name="latestNitroNodeImage" />` renders nothing inside a fenced code block or an inline code
 * span (content-lint rule A6), so a `docker run` command a reader is meant to copy has to carry the
 * image tag literally. `check-nitro-release` bumps the variable and opens a PR; without this, those
 * literals keep the old tag while the prose beside them advertises the new one, and no gate sees it.
 *
 * **Matching the outgoing value is not sufficient on its own.** The obvious rule, "rewrite every
 * occurrence of the string vars.json is moving away from", looks safe because it can only touch a
 * copy of what was current. It is not: `content/docs/run-a-node/arbos-releases/*.mdx` pin the
 * minimum Nitro version for each ArbOS release, and that is a permanent historical fact that happens
 * to equal the current image for as long as the newest release is the newest. Rewriting `arbos61.mdx`
 * on the next bump would make it claim ArbOS 61 requires a version published after it.
 *
 * So a file opts in explicitly, by carrying the marker below. Nothing is rewritten by inference.
 * The cost is one comment line per page that hardcodes the tag; the benefit is that a page stating
 * a fact about the past can never be rewritten into a falsehood by an unattended Monday job.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { toPosix, walk } from './partials.ts';

const isMdx = (p: string): boolean => /\.mdx?$/i.test(p);

/**
 * The opt-in marker, an MDX comment that renders as nothing:
 *
 *   {\/* sync-with-var: latestNitroNodeImage *\/}
 *
 * Anywhere in a file, it opts that whole file in. File-level rather than per-block because a page
 * that hardcodes the current image once usually does so in every command on it, and a per-block
 * marker would be repeated noise. The tradeoff: do not put the marker on a page that also states a
 * historical version, which is why the two live on different pages today.
 */
export const SYNC_MARKER = 'sync-with-var: latestNitroNodeImage';

const markerRe = /\{\s*\/\*\s*sync-with-var:\s*latestNitroNodeImage\s*\*\/\s*\}/;

/** Whether `source` opts in to having its hardcoded image tag rewritten. */
export function optsIntoSync(source: string): boolean {
  return markerRe.test(source);
}

/**
 * Replace every occurrence of `from` with `to` in `source`.
 * Returns the new text and the number of replacements, so a caller can report what it changed.
 */
export function rewriteImage(
  source: string,
  from: string | undefined,
  to: string,
): { text: string; count: number } {
  if (!from || from === to) return { text: source, count: 0 };

  const parts = source.split(from);
  return { text: parts.join(to), count: parts.length - 1 };
}

/**
 * `content/_versions/` is a frozen archive: each page there is a snapshot of how the docs read at
 * one point in time, which is the entire reason it is a separate non-routed collection. Bumping an
 * image tag inside a snapshot would rewrite history, so the walk skips it even if a snapshot was
 * taken of a page that carried the marker. Partials are live content and opt in like any page.
 */
const ARCHIVE_DIR = '_versions';

/** One file {@link syncImageInContent} changed, repo-relative, and how many copies it rewrote. */
export interface SyncedFile {
  rel: string;
  count: number;
}

/**
 * Rewrite the outgoing image tag in every opted-in file, skipping the frozen archive.
 *
 * Returns one entry per file changed, `{ rel, count }`, repo-relative and POSIX-separated so the
 * caller's log reads the same on every platform. Pass `write: false` to report without touching
 * disk.
 */
export function syncImageInContent(
  repoRoot: string,
  from: string | undefined,
  to: string,
  { dir = 'content', write = true }: { dir?: string; write?: boolean } = {},
): SyncedFile[] {
  const changed: SyncedFile[] = [];
  if (!from || from === to) return changed;

  const root = path.join(repoRoot, dir);
  const archive = path.join(root, ARCHIVE_DIR) + path.sep;
  const files: string[] = walk(root, isMdx);
  for (const abs of files) {
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
