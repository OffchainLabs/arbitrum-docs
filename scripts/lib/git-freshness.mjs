/**
 * git-freshness — decide whether a local clone is a trustworthy comparison baseline.
 *
 * A stale clone does not make a comparison fail, it makes it lie: every upstream change made after
 * the last fetch looks identical to ours, so the report comes back cleaner than reality. Two
 * separate things can be stale and both must be checked:
 *
 *   - the working tree, if HEAD is behind the upstream branch
 *   - the upstream ref itself, if nothing has fetched recently; `HEAD..origin/master` compares
 *     against a cached pointer, so it returns 0 whether or not the clone is current
 */
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import path from 'node:path';

/** A fetch older than this makes the upstream ref untrustworthy as a baseline. */
export const STALE_FETCH_HOURS = 24;

/**
 * Turn raw clone facts into a verdict. Pure — all git access happens in `readBaseline`.
 *
 * @param {object} facts
 * @param {number|null} facts.behind Commits HEAD is behind upstream, or null if there is no upstream ref.
 * @param {number|null} facts.fetchAgeHours Hours since the last fetch, or null if never fetched.
 * @param {boolean} facts.dirty Whether the working tree has uncommitted changes.
 * @returns {{ok: boolean, blockers: string[], warnings: string[]}}
 */
export function baselineVerdict({ behind, fetchAgeHours, dirty }) {
  const blockers = [];

  if (fetchAgeHours === null) {
    blockers.push('never fetched, so the upstream ref means nothing');
  } else if (fetchAgeHours > STALE_FETCH_HOURS) {
    blockers.push(`last fetched ${Math.round(fetchAgeHours)}h ago (limit ${STALE_FETCH_HOURS}h)`);
  }

  if (behind === null) {
    blockers.push('no upstream tracking branch');
  } else if (behind > 0) {
    blockers.push(`${behind} commit${behind === 1 ? '' : 's'} behind upstream`);
  }

  return { ok: blockers.length === 0, blockers, warnings: dirty ? ['working tree is dirty'] : [] };
}

function git(repoDir, args) {
  return execFileSync('git', ['-C', repoDir, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

/**
 * The remote-tracking ref to compare HEAD against. Prefers a configured `@{upstream}`, but falls
 * back to `origin/<branch>`: a clone can have an up-to-date `origin/master` with no branch tracking
 * configured, and refusing there would be a false alarm.
 */
function upstreamRef(repoDir) {
  try {
    return git(repoDir, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}']);
  } catch {
    const branch = git(repoDir, ['rev-parse', '--abbrev-ref', 'HEAD']);
    const ref = `origin/${branch}`;
    git(repoDir, ['rev-parse', '--verify', '--quiet', ref]);
    return ref;
  }
}

/**
 * Read the freshness facts for a clone. Never fetches — a check script must not reach the network.
 *
 * @param {string} repoDir Absolute path to the clone.
 * @param {(ms: number) => number} [now] Injectable clock, for tests.
 */
export function readBaseline(repoDir, now = Date.now) {
  let behind = null;
  try {
    behind = Number(git(repoDir, ['rev-list', '--count', `HEAD..${upstreamRef(repoDir)}`]));
  } catch {
    behind = null;
  }

  let fetchAgeHours = null;
  try {
    const mtime = statSync(path.join(repoDir, '.git', 'FETCH_HEAD')).mtimeMs;
    fetchAgeHours = (now() - mtime) / 3_600_000;
  } catch {
    fetchAgeHours = null;
  }

  let dirty = false;
  try {
    dirty = git(repoDir, ['status', '--porcelain']).length > 0;
  } catch {
    dirty = false;
  }

  return { behind, fetchAgeHours, dirty };
}
