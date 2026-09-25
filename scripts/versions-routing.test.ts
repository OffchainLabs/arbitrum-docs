/**
 * Routing invariants for the partial-versioning registry (`VERSIONED` in
 * `lib/versions-constants.ts`).
 *
 * These stopped being cosmetic when FS-2698 moved archives from `?v=<id>` onto a path suffix
 * (`/docs/<slug>/<id>`). An archive id is now a real URL segment enumerated by the docs route's
 * `generateStaticParams`, under `dynamicParams = false`:
 *
 *   - A registry key naming a page that no longer exists emits a static param the route cannot
 *     resolve, so `pnpm build` would prerender a 404 at that URL. `pnpm move-doc` does not retarget
 *     `VERSIONED` and nothing else catches it (see INTERNALS, "Moving a page").
 *   - An archive id that also names a child page of the same page is a collision: the route
 *     resolves the real page first, so the archive becomes unreachable. None exists today, and
 *     this is what makes creating one a reviewed act rather than a silent shadowing.
 */
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { archiveParams, isArchiveId, versionSources } from '../lib/versions-constants.ts';
import {
  ARCHIVE_ROOT,
  DOCS_ROOT,
  VERSIONS_FILE,
  parseVersionedRegistry,
} from './lib/versions-registry.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registry = parseVersionedRegistry(repoRoot);

test('only registered archive ids are accepted by the legacy redirect', () => {
  assert.equal(isArchiveId('run-a-node/start-here', 'v1'), true);
  for (const id of ['latest', 'v99', '', '__proto__']) {
    assert.equal(isArchiveId('run-a-node/start-here', id), false);
  }
  for (const slug of ['missing', 'constructor', '__proto__', 'toString']) {
    assert.equal(isArchiveId(slug, 'v1'), false);
  }
});

/**
 * The registry is a plain object literal and slugs come off the URL, so an `Object.prototype` key
 * is a request anyone can send. Every registry lookup goes through `versionSources` for this
 * reason: a plain `VERSIONED[slug]` answers `constructor` with a function, and the caller's
 * `?.find`/`?.some`/`.map` then throws instead of short-circuiting, which is an unhandled HTTP 500
 * where the answer is a 404 (`/docs/constructor/v1.md` and six sibling shapes, FS-2711 round 1).
 * `getArchive` and `getVersions` in `lib/versions.ts` are the callers this pins; they cannot be
 * imported under `node --test` themselves, because that module resolves `collections/server`
 * through a tsconfig path alias.
 */
test('prototype keys are not registry entries', () => {
  for (const slug of ['constructor', '__proto__', 'toString', 'valueOf', 'hasOwnProperty']) {
    assert.equal(versionSources(slug), undefined, slug);
  }
  assert.equal(versionSources('missing'), undefined);
  assert.ok(Array.isArray(versionSources('run-a-node/start-here')));
});

test('static params enumerate every archive without Latest or duplicate paths', () => {
  const paths = archiveParams().map(({ slug }) => slug.join('/'));
  const expected = registry.flatMap(({ slug, archives }) =>
    archives.map(({ id }) => `${slug}/${id}`),
  );
  assert.deepEqual(paths, expected);
  assert.equal(new Set(paths).size, paths.length);
  assert.ok(paths.every((slug) => !slug.endsWith('/latest')));
});

/** Absolute path of the file serving `<slug>`, or `null` when no page does. */
function livePageFile(slug: string): string | null {
  for (const candidate of [`${slug}.mdx`, path.posix.join(slug, 'index.mdx')]) {
    const file = path.join(repoRoot, DOCS_ROOT, candidate);
    if (existsSync(file)) return file;
  }
  return null;
}

test('the registry parses, and every versioned page has at least one archive', () => {
  assert.ok(
    registry.length > 0,
    `parsed no VERSIONED entries out of ${VERSIONS_FILE} — the literal moved or changed shape, ` +
      'and every check in this file silently passes on an empty registry',
  );

  for (const { slug, archives } of registry) {
    assert.ok(
      archives.length > 0,
      `${slug} is in VERSIONED with no archived version, so its dropdown offers only Latest`,
    );
  }
});

test('every registry key names a live page', () => {
  for (const { slug } of registry) {
    assert.ok(
      livePageFile(slug),
      `VERSIONED key '${slug}' names no page under ${DOCS_ROOT}. A moved or renamed page leaves a ` +
        'dead key: the page loses its version dropdown and generateStaticParams emits archive ' +
        'params the docs route cannot resolve. Retarget the key by hand after moving a versioned page.',
    );
  }
});

test('every archivePath names a real archive file', () => {
  for (const { slug, archives } of registry) {
    for (const { id, archivePath } of archives) {
      const file = path.join(repoRoot, ARCHIVE_ROOT, archivePath);
      assert.ok(
        existsSync(file),
        `archive '${id}' of '${slug}' points at ${ARCHIVE_ROOT}/${archivePath}, which does not exist`,
      );
    }
  }
});

test('no archive id collides with a child page of the page it archives', () => {
  for (const { slug, archives } of registry) {
    for (const { id } of archives) {
      const childSlug = path.posix.join(slug, id);

      assert.equal(
        livePageFile(childSlug),
        null,
        `archive '${id}' of '${slug}' would be served at /docs/${childSlug}, but a real page ` +
          'already claims that URL. The docs route resolves the page first, so the archive would ' +
          'be unreachable. Rename one of them.',
      );

      // A directory alone is enough: `content/docs/<slug>/<id>/anything.mdx` puts real pages under
      // the archive's URL, and /docs/<slug>/<id> would then be a section with an archive sitting
      // in the middle of it.
      const childDir = path.join(repoRoot, DOCS_ROOT, childSlug);
      assert.ok(
        !existsSync(childDir) || !statSync(childDir).isDirectory(),
        `archive '${id}' of '${slug}' would be served at /docs/${childSlug}, but ` +
          `${DOCS_ROOT}/${childSlug}/ is a real content directory. Rename one of them.`,
      );
    }
  }
});

test('archive ids are unique per page', () => {
  for (const { slug, archives } of registry) {
    const ids = archives.map((archive) => archive.id);
    assert.equal(
      new Set(ids).size,
      ids.length,
      `'${slug}' registers the same archive id twice; the second is unreachable`,
    );
  }
});
