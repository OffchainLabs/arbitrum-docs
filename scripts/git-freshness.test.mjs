import assert from 'node:assert/strict';
import { test } from 'node:test';

import { STALE_FETCH_HOURS, baselineVerdict } from './lib/git-freshness.mjs';

const fresh = { behind: 0, fetchAgeHours: 1, dirty: false };

test('a current, recently fetched, clean clone is a usable baseline', () => {
  const v = baselineVerdict(fresh);
  assert.equal(v.ok, true);
  assert.deepEqual(v.blockers, []);
  assert.deepEqual(v.warnings, []);
});

test('being behind upstream blocks, and the count is reported', () => {
  const v = baselineVerdict({ ...fresh, behind: 30 });
  assert.equal(v.ok, false);
  assert.match(v.blockers.join(' '), /30 commits behind/);
});

test('behind by one is not pluralized', () => {
  assert.match(baselineVerdict({ ...fresh, behind: 1 }).blockers.join(' '), /1 commit behind/);
});

test('a stale fetch blocks even when behind reads zero', () => {
  // The Nitro failure mode: HEAD matches the cached origin ref, so `behind` is 0, but the ref
  // itself was last updated two months ago. Zero here means "no new information", not "current".
  const v = baselineVerdict({ behind: 0, fetchAgeHours: 24 * 60, dirty: false });
  assert.equal(v.ok, false);
  assert.match(v.blockers.join(' '), /last fetched 1440h ago/);
});

test('a never-fetched clone blocks', () => {
  const v = baselineVerdict({ behind: 0, fetchAgeHours: null, dirty: false });
  assert.equal(v.ok, false);
  assert.match(v.blockers.join(' '), /never fetched/);
});

test('a missing upstream tracking branch blocks', () => {
  const v = baselineVerdict({ behind: null, fetchAgeHours: 1, dirty: false });
  assert.equal(v.ok, false);
  assert.match(v.blockers.join(' '), /no upstream tracking branch/);
});

test('the fetch-age limit is exclusive at the boundary', () => {
  assert.equal(baselineVerdict({ ...fresh, fetchAgeHours: STALE_FETCH_HOURS }).ok, true);
  assert.equal(baselineVerdict({ ...fresh, fetchAgeHours: STALE_FETCH_HOURS + 0.1 }).ok, false);
});

test('a dirty tree warns but does not block', () => {
  const v = baselineVerdict({ ...fresh, dirty: true });
  assert.equal(v.ok, true);
  assert.deepEqual(v.warnings, ['working tree is dirty']);
});

test('every independent problem is reported, not just the first', () => {
  const v = baselineVerdict({ behind: 5, fetchAgeHours: null, dirty: true });
  assert.equal(v.blockers.length, 2);
  assert.deepEqual(v.warnings, ['working tree is dirty']);
});
