/**
 * versioned-docs-check: build-time advisory for the partial page versioning registry
 * (`VERSIONED` in lib/versions-constants.ts, see
 * .claude/docs/superpowers/specs/2026-07-17-partial-versioning-design.md).
 *
 * The versioning registry pins a hand-picked set of documents: each versioned live page and each
 * archived snapshot. Editing any of them affects versioned content (a live page diverging from its
 * archive, or a supposedly-frozen archive being changed), which is easy to do by accident. This
 * script surfaces a loud, impossible-to-miss WARNING, never an error, when a registered document
 * changed.
 *
 * "Changed" means something different depending on where this runs, because a CI checkout has no
 * uncommitted changes to see (FS-2747):
 *
 *   - Locally: working tree + staged vs HEAD, exactly as before. This is what fires in the
 *     terminal before a `git commit`.
 *   - In a `pull_request`-triggered CI run (`GITHUB_BASE_REF` set): `HEAD^1` vs `HEAD`.
 *     `actions/checkout` checks out the synthetic merge commit GitHub builds for the pull request
 *     (`refs/pull/<n>/merge`), whose first parent is the base branch's tip at event time and whose
 *     second is the PR head, so that two-tree diff is exactly the PR's own change set. It needs
 *     `fetch-depth: 2` on the checkout step, which ci.yml sets on both jobs that run this script:
 *     the default depth-1 checkout grafts `HEAD` parentless, which is why the old `git diff HEAD`
 *     always came back empty here. Depth 2 is still a shallow clone, so `hasFullGitHistory()` in
 *     source.config.ts keeps answering false and `lastModified` stays off, as it must.
 *   - Anywhere else (a direct `push` to `main`, i.e. post-merge, or `upstream-refresh.yml`'s
 *     `stylus` job): falls back to the local behavior, and prints why. A `push` run carries no
 *     `GITHUB_BASE_REF`, so there is no base to compare against, and by the time one runs its PR's
 *     own run should already have warned, since merges go through a PR first. A residual gap, not
 *     a fix. In the `stylus` job the fallback is not a gap at all: `pnpm stylus:generate` runs
 *     before the gates there, so the working tree really is dirty and the local comparison is the
 *     meaningful one, which is also why that job needs no `fetch-depth` of its own.
 *
 * No network call and no credentials, which matters twice: every `actions/checkout` step in this
 * repo passes `persist-credentials: false`, so anything this script fetched would be an anonymous
 * request working only while both repositories stay public, and `pnpm build` runs this script
 * first, inside the blocking `Build` job whose one accepted network dependency is Google Fonts.
 *
 * Warning only: always exits 0 so it never blocks `pnpm build`. The registry invariants that *do*
 * have to hold, every key naming a live page, every archive id free of a colliding child page, are
 * asserted in scripts/versions-routing.test.ts, which fails.
 *
 *   node scripts/versioned-docs-check.ts
 */
import { execFileSync } from 'node:child_process';

import { type Comparison, pickComparison } from './lib/versioned-docs-comparison.ts';
import { VERSIONS_FILE, pinnedDocuments } from './lib/versions-registry.ts';

const repoRoot = process.cwd();

function git(args: string[]): string {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    timeout: 30_000,
  });
}

/** Whether a revision resolves in this checkout. A shallow graft removes a commit's parents. */
function revExists(rev: string): boolean {
  try {
    git(['rev-parse', '--verify', '--quiet', `${rev}^{commit}`]);
    return true;
  } catch {
    return false;
  }
}

/** Probes the environment and the shape of `HEAD`, then defers the decision to the pure picker. */
function resolveComparison(): Comparison {
  return pickComparison({
    ci: process.env.GITHUB_ACTIONS === 'true',
    // GitHub Actions sets GITHUB_BASE_REF only for a `pull_request`-triggered run.
    pullRequest: Boolean(process.env.GITHUB_BASE_REF),
    firstParentPresent: revExists('HEAD^1'),
    secondParentPresent: revExists('HEAD^2'),
  });
}

/**
 * Repo-relative paths (from `docs`) that changed under `comparison`, or `null` when git is
 * unavailable, in which case the check is skipped silently.
 */
function modifiedDocs(docs: string[], comparison: Comparison): string[] | null {
  if (docs.length === 0) return [];
  try {
    const out = git(['diff', '--name-only', ...comparison.args, '--', ...docs]);
    return out
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
  } catch {
    return null;
  }
}

const useColor = !process.env.NO_COLOR;
const paint = (codes: string, s: string): string => (useColor ? `\x1b[${codes}m${s}\x1b[0m` : s);

/** Greedy word wrap. A word longer than `width` is hard-broken rather than overflowing the box. */
function wrap(text: string, width: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (let word of text.split(/\s+/).filter(Boolean)) {
    while (word.length > width) {
      if (line) {
        lines.push(line);
        line = '';
      }
      lines.push(word.slice(0, width));
      word = word.slice(width);
    }
    if (!line) line = word;
    else if (line.length + 1 + word.length <= width) line += ` ${word}`;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Inner width of the box, between the '│ ' and ' │' that frame every content row.
const BOX_WIDTH = 72;

function printWarning(modified: string[], comparison: Comparison): void {
  const yellow = (s: string): string => paint('33;1', s);
  const banner = (s: string): string => paint('30;43;1', s); // black text on yellow background
  const line = '─'.repeat(74);
  const row = (s: string): void => console.warn(yellow('│ ') + s.padEnd(BOX_WIDTH) + yellow(' │'));
  const blank = (): void => console.warn(yellow(`│${' '.repeat(74)}│`));

  console.warn('');
  console.warn(banner('  ⚠  VERSIONED DOCUMENT MODIFIED, please review before building         '));
  console.warn(yellow(`┌${line}┐`));
  // Wrapped, not truncated: the comparison label runs past 70 characters on its own, and this
  // sentence is the one that says which two trees were compared.
  for (const l of wrap(
    `The following document(s) are pinned by the versioning registry (${VERSIONS_FILE}) and changed, per ${comparison.label}:`,
    BOX_WIDTH,
  )) {
    row(l);
  }
  blank();
  for (const file of modified) {
    console.warn(yellow('│   • ') + file.padEnd(68) + yellow(' │'));
  }
  blank();
  for (const l of wrap(
    'Editing a live page diverges it from its archived version; editing an archive changes a snapshot meant to be frozen. Confirm intended.',
    BOX_WIDTH,
  )) {
    row(l);
  }
  console.warn(yellow(`└${line}┘`));
  console.warn('');
}

const comparison = resolveComparison();
const docs = pinnedDocuments(repoRoot);
const modified = modifiedDocs(docs, comparison);
console.log(`versioned-docs-check: comparing ${comparison.label}`);
if (comparison.note) {
  // `::warning::` puts the line in the run summary instead of only in a collapsed step log, which
  // is the difference between a misconfigured checkout being noticed and this check quietly going
  // back to reporting nothing.
  const prefix = comparison.annotate && process.env.GITHUB_ACTIONS === 'true' ? '::warning::' : '';
  console.log(`${prefix}versioned-docs-check: ${comparison.note}`);
}
if (modified && modified.length > 0) {
  printWarning(modified, comparison);
}
