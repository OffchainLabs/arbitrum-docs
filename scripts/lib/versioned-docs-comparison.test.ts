import assert from 'node:assert/strict';
import { test } from 'node:test';

import { pickComparison } from './versioned-docs-comparison.ts';

const LOCAL = 'HEAD (working tree + staged vs HEAD)';
const merged = { firstParentPresent: true, secondParentPresent: true };

test('locally, compares the working tree and the index against HEAD', () => {
  const got = pickComparison({ ci: false, pullRequest: false, ...merged });
  assert.deepEqual(got.args, ['HEAD']);
  assert.equal(got.label, LOCAL);
  assert.equal(got.note, undefined);
});

test('a local checkout sitting on a merge commit still compares the working tree', () => {
  // The local case is the pre-commit warning. Reading a merge's first parent there would report
  // whatever that merge brought in, which is not what the person about to commit is asking about.
  assert.deepEqual(pickComparison({ ci: false, pullRequest: true, ...merged }).args, ['HEAD']);
});

test('on a pull request run with the merge commit present, compares its first parent', () => {
  const got = pickComparison({ ci: true, pullRequest: true, ...merged });
  assert.deepEqual(got.args, ['HEAD^1', 'HEAD']);
  assert.match(got.label, /HEAD\^1 vs HEAD/);
  assert.equal(got.note, undefined);
  assert.equal(got.annotate, undefined);
});

test('on a pull request run whose HEAD has no parent, falls back and asks for fetch-depth', () => {
  // The depth-1 checkout this ticket exists to fix: the graft leaves HEAD parentless.
  const got = pickComparison({
    ci: true,
    pullRequest: true,
    firstParentPresent: false,
    secondParentPresent: false,
  });
  assert.deepEqual(got.args, ['HEAD']);
  assert.equal(got.label, LOCAL);
  assert.match(got.note ?? '', /fetch-depth: 2/);
  assert.equal(got.annotate, true);
});

test('on a pull request run whose HEAD is not a merge, falls back rather than trusting HEAD^1', () => {
  // A checkout pinned to the PR head: HEAD^1 is the previous commit on the branch, not the base,
  // so diffing against it would report the wrong change set rather than none.
  const got = pickComparison({
    ci: true,
    pullRequest: true,
    firstParentPresent: true,
    secondParentPresent: false,
  });
  assert.deepEqual(got.args, ['HEAD']);
  assert.equal(got.annotate, true);
});

test('on a CI run that is not a pull request, falls back quietly and says why', () => {
  // A push to `main`, or `upstream-refresh.yml`'s scheduled `stylus` job, where the working-tree
  // comparison is the meaningful one. Expected, so it must not raise a warning annotation.
  const got = pickComparison({ ci: true, pullRequest: false, ...merged });
  assert.deepEqual(got.args, ['HEAD']);
  assert.equal(got.label, LOCAL);
  assert.match(got.note ?? '', /not a pull request run/);
  assert.equal(got.annotate, undefined);
});
