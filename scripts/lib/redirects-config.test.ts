/**
 * Offline checks over `redirects.config.ts` and the `.md` twins next.config.ts derives from it
 * (`lib/markdown-redirects.ts`). Destinations are checked case-sensitively, because Next routes are
 * and a redirect to the wrong case still 404s.
 *
 * `pnpm move-doc` appends one entry per move and touches no other. When a move leaves an older
 * entry pointing at the old URL, or moves a page back to a URL an earlier move redirected away,
 * these tests fail and name the entry to fix by hand.
 */
import assert from 'node:assert/strict';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { markdownTwins } from '../../lib/markdown-redirects.ts';
import { redirects } from '../../redirects.config.ts';
import { buildIndex } from './doc-links.ts';

/** The slice of Next's bundled path-to-regexp (v6) these tests use; it ships no types. */
interface PathToRegexp {
  match(pattern: string): (path: string) => false | { params: Record<string, string> };
  compile(pattern: string): (params: Record<string, string>) => string;
}
const { match, compile } = createRequire(import.meta.url)(
  'next/dist/compiled/path-to-regexp',
) as PathToRegexp;

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const { byUrl } = buildIndex(repoRoot);
const all = [...redirects, ...markdownTwins(redirects, new Set(byUrl.keys()))];
const isExternal = (value: string): boolean => /^https?:\/\//.test(value);
const pageOf = (destination: string): string => destination.split('#')[0];
/** A destination Next fills from the source's named parameters. */
const isPattern = (value: string): boolean => /:[A-Za-z_]/.test(value);
/** Root page mirrors use `/index.md`; every other page appends `.md`. */
const pageOfMarkdown = (destination: string): string =>
  pageOf(destination) === '/index.md' ? '/' : pageOf(destination).replace(/\.md$/, '');
const isPublicFile = (destination: string): boolean => {
  const file = path.join(repoRoot, 'public', pageOf(destination));
  return (
    file.startsWith(path.join(repoRoot, 'public') + path.sep) &&
    existsSync(file) &&
    statSync(file).isFile()
  );
};
const resolves = (destination: string): boolean =>
  byUrl.has(pageOf(destination)) ||
  (destination.endsWith('.md') && byUrl.has(pageOfMarkdown(destination))) ||
  isPublicFile(destination);

test('every internal redirect destination names a page under content/docs or a public file', () => {
  const dead = all
    .filter((r) => !isExternal(r.destination) && !isPattern(r.destination))
    .filter((r) => !resolves(r.destination))
    .map((r) => `${r.source} -> ${r.destination}`);
  assert.deepEqual(dead, []);
});

test('every pattern redirect maps each file it is written for onto an existing file', () => {
  // The audit-report entry: Docusaurus published `/assets/files/<name>-<32 hex>.pdf`, and each
  // `<name>.pdf` sits in public/audit-reports/. The hash is arbitrary here; the source pins its shape.
  const entry = redirects.find((r) => r.source.startsWith('/assets/files/'));
  assert.ok(entry, 'no /assets/files/ redirect');
  const reports = readdirSync(path.join(repoRoot, 'public', 'audit-reports')).filter((f) =>
    f.endsWith('.pdf'),
  );
  assert.ok(reports.length > 0);
  const toDestination = compile(entry.destination);
  const matches = match(entry.source);
  const broken = reports.filter((file) => {
    const name = file.replace(/\.pdf$/, '');
    const hit = matches(`/assets/files/${name}-0123456789abcdef0123456789abcdef.pdf`);
    return !hit || toDestination(hit.params) !== `/audit-reports/${file}`;
  });
  assert.deepEqual(broken, []);
  assert.equal(matches('/assets/files/report-not-a-hash.pdf'), false);

  const unchecked = redirects
    .filter((r) => isPattern(r.destination) && r !== entry)
    .map((r) => r.source);
  assert.deepEqual(unchecked, [], 'a new pattern redirect needs a test like the one above');
});

test('no redirect source is a live page or a live mirror', () => {
  assert.deepEqual(
    all
      .filter(
        (r) =>
          byUrl.has(r.source) || (r.source.endsWith('.md') && byUrl.has(pageOfMarkdown(r.source))),
      )
      .map((r) => r.source),
    [],
  );
});

test('no redirect chains into another redirect or loops to itself', () => {
  const sources = new Set(all.map((r) => r.source));
  const chained = all
    .filter((r) => sources.has(pageOf(r.destination)))
    .map((r) => `${r.source} -> ${r.destination}`);
  assert.deepEqual(chained, []);
});

test('no redirect source is listed twice', () => {
  const seen = new Set<string>();
  const dupes = all.map((r) => r.source).filter((s) => seen.size === seen.add(s).size);
  assert.deepEqual(dupes, []);
});

test('unchanged master page routes have no redirects, while genuine moves retain theirs', () => {
  for (const source of [
    '/',
    '/index.md',
    '/how-arbitrum-works/deep-dives/stf',
    '/how-arbitrum-works/deep-dives/stf.md',
  ]) {
    assert.equal(
      all.some((redirect) => redirect.source === source),
      false,
      source,
    );
  }
  assert.ok(byUrl.has('/how-arbitrum-works/deep-dives/stf'));
  assert.ok(byUrl.has('/'));
  for (const suffix of ['', '.md']) {
    assert.deepEqual(
      all.find((redirect) => redirect.source === `/run-a-node/run-batch-poster${suffix}`),
      {
        source: `/run-a-node/run-batch-poster${suffix}`,
        destination: `/launch-arbitrum-chain/run-a-node/batch-poster${suffix}`,
        permanent: true,
      },
    );
  }
});

test('redirects use root page paths without the migration-only docs prefix', () => {
  const prefixed = all.filter((redirect) =>
    [redirect.source, redirect.destination].some((url) => /^\/docs(?:[/.#]|$)/.test(url)),
  );
  assert.deepEqual(prefixed, []);
});
