/**
 * Offline tripwire over `redirects.config.ts`, the one redirect file, plus unit tests for the two
 * rewrites `move-doc` applies to it.
 *
 * `pnpm redirects:check` is the authoritative check (it asks the running router), but it needs a
 * server and runs only in the `Build` job. This walks `content/docs` instead, so a hand edit that
 * points a legacy URL at a page that does not exist, a page leaving the tree some other way, or an
 * entry whose source is a live page (which Next's `redirects()` would shadow) fails `pnpm test`
 * without one. Destinations are checked case-sensitively: Next routes are, and a redirect to the
 * wrong case still 404s.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { redirects } from '../../redirects.config.ts';
import { buildIndex } from './doc-links.ts';
import { removeEntriesFrom, retargetDestinations, retargetRedirects } from './redirects-config.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const isExternal = (value: string): boolean => /^https?:\/\//.test(value);
const pageOf = (destination: string): string => destination.split('#')[0];

test('every internal redirect destination names a page under content/docs', () => {
  const { byUrl } = buildIndex(repoRoot);
  const dead = redirects
    .filter((r) => !isExternal(r.destination) && !byUrl.has(pageOf(r.destination)))
    .map((r) => `${r.source} -> ${r.destination}`);
  assert.deepEqual(dead, []);
});

test('no redirect source is a live page, and none redirects to itself', () => {
  const { byUrl } = buildIndex(repoRoot);
  const shadowing = redirects.filter((r) => byUrl.has(r.source)).map((r) => r.source);
  const loops = redirects.filter((r) => pageOf(r.destination) === r.source).map((r) => r.source);
  assert.deepEqual(shadowing, []);
  assert.deepEqual(loops, []);
});

test('no redirect source is listed twice', () => {
  const seen = new Set<string>();
  const dupes = redirects.map((r) => r.source).filter((s) => seen.size === seen.add(s).size);
  assert.deepEqual(dupes, []);
});

const FIXTURE = [
  "  { source: '/docs/a/old', destination: '/docs/a/new', permanent: true },",
  "  { source: '/legacy/x', destination: '/docs/a/old', permanent: false },",
  '  {',
  "    source: '/legacy/y',",
  "    destination: '/docs/a/old#section',",
  '    permanent: false,',
  '  },',
  '  {',
  "    source: '/legacy/wrapped',",
  '    destination:',
  "      '/docs/a/old',",
  '    permanent: false,',
  '  },',
  "  { source: '/legacy/z', destination: '/docs/a/old/child', permanent: false },",
].join('\n');

test('retargetDestinations rewrites destinations only, carries anchors, and matches whole URLs', () => {
  const { source, changed } = retargetDestinations(FIXTURE, '/docs/a/old', '/docs/b/moved');
  assert.equal(changed, 3);
  assert.match(source, /source: '\/legacy\/x', destination: '\/docs\/b\/moved'/);
  assert.match(source, /destination: '\/docs\/b\/moved#section'/, 'anchor carried across');
  assert.match(
    source,
    /destination:\n\s+'\/docs\/b\/moved'/,
    'a Prettier-wrapped value is rewritten',
  );
  assert.match(source, /destination: '\/docs\/a\/old\/child'/, 'a child page is not a match');
  assert.match(
    source,
    /source: '\/docs\/a\/old', destination: '\/docs\/a\/new'/,
    'sources untouched',
  );
});

test('retargetDestinations is a no-op when nothing names the page', () => {
  const src = "  { source: '/legacy/x', destination: '/docs/other', permanent: false },";
  assert.deepEqual(retargetDestinations(src, '/docs/a/old', '/docs/b/new'), {
    source: src,
    changed: 0,
  });
});

test('removeEntriesFrom deletes whole entries by source, one-line or wrapped, and nothing else', () => {
  const { source, removed } = removeEntriesFrom(FIXTURE, '/legacy/y');
  assert.deepEqual(removed, ['/docs/a/old#section']);
  assert.ok(!source.includes('/legacy/y'));
  assert.equal(
    source.split('\n').length,
    FIXTURE.split('\n').length - 5,
    'the wrapped entry is gone whole',
  );
  const oneLine = removeEntriesFrom(FIXTURE, '/docs/a/old');
  assert.deepEqual(oneLine.removed, ['/docs/a/new']);
  assert.ok(!oneLine.source.includes("source: '/docs/a/old'"));
  assert.ok(
    oneLine.source.includes("destination: '/docs/a/old'"),
    'destinations naming the URL stay',
  );
  assert.deepEqual(removeEntriesFrom(FIXTURE, '/docs/a/old/child'), {
    source: FIXTURE,
    removed: [],
  });
});

test('both rewrites accept double-quoted entries, so a Prettier config change cannot make them miss', () => {
  const src = '  { source: "/legacy/x", destination: "/docs/a/old", permanent: false },\n';
  const r = retargetDestinations(src, '/docs/a/old', '/docs/b/new');
  assert.equal(r.changed, 1);
  assert.match(r.source, /destination: "\/docs\/b\/new"/);
  const d = removeEntriesFrom(src, '/legacy/x');
  assert.deepEqual(d, { source: '', removed: ['/docs/a/old'] });
});

test('retargetRedirects is a no-op for a partial and for a move that keeps its URL', async () => {
  assert.deepEqual(await retargetRedirects(repoRoot, null, '/docs/a', true), []);
  assert.deepEqual(await retargetRedirects(repoRoot, '/docs/a', null, true), []);
  assert.deepEqual(await retargetRedirects(repoRoot, '/docs/a', '/docs/a', true), []);
});
