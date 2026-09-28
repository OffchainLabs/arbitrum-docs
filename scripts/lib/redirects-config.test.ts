/**
 * Offline checks over `redirects.config.ts`. Destinations are checked case-sensitively, because
 * Next routes are and a redirect to the wrong case still 404s.
 *
 * `pnpm move-doc` appends one entry per move and touches no other. When a move leaves an older
 * entry pointing at the old URL, or moves a page back to a URL an earlier move redirected away,
 * these tests fail and name the entry to fix by hand.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { redirects } from '../../redirects.config.ts';
import { buildIndex } from './doc-links.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const { byUrl } = buildIndex(repoRoot);
const isExternal = (value: string): boolean => /^https?:\/\//.test(value);
const pageOf = (destination: string): string => destination.split('#')[0];

test('every internal redirect destination names a page under content/docs', () => {
  const dead = redirects
    .filter((r) => !isExternal(r.destination) && !byUrl.has(pageOf(r.destination)))
    .map((r) => `${r.source} -> ${r.destination}`);
  assert.deepEqual(dead, []);
});

test('no redirect source is a live page', () => {
  assert.deepEqual(
    redirects.filter((r) => byUrl.has(r.source)).map((r) => r.source),
    [],
  );
});

test('no redirect chains into another redirect or loops to itself', () => {
  const sources = new Set(redirects.map((r) => r.source));
  const chained = redirects
    .filter((r) => sources.has(pageOf(r.destination)))
    .map((r) => `${r.source} -> ${r.destination}`);
  assert.deepEqual(chained, []);
});

test('no redirect source is listed twice', () => {
  const seen = new Set<string>();
  const dupes = redirects.map((r) => r.source).filter((s) => seen.size === seen.add(s).size);
  assert.deepEqual(dupes, []);
});
