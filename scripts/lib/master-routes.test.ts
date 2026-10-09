/**
 * Every page route that was live on master before the Fumadocs cutover must still answer: either a
 * page serves that exact URL, or a redirect in `redirects.config.ts` matches it. A page deleted or
 * moved without a redirect otherwise 404s for every inbound link and search result, and no other
 * gate sees it (`redirects-config.test.ts` checks only the entries that exist).
 *
 * `scripts/data/master-routes.json` is frozen: it was generated once from `origin/master` at the
 * commit it names. Master served pages at the root (`routeBasePath: '/'`) and so does this site,
 * so an unchanged route is answered by its page and only a moved or retired route needs an entry.
 * `redirects-config.test.ts` asserts that no redirect source is a live page, so a route this gate
 * passes is served by exactly one of the two.
 *
 * Matching uses Next's own path matcher, case-insensitive like Next's redirect matching.
 */
import { getPathMatch } from 'next/dist/shared/lib/router/utils/path-match.js';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { redirects } from '../../redirects.config.ts';
import { buildIndex } from './doc-links.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const fixture: { commit: string; routes: { route: string; file: string }[] } = JSON.parse(
  readFileSync(path.join(repoRoot, 'scripts', 'data', 'master-routes.json'), 'utf8'),
);
const { byUrl } = buildIndex(repoRoot);
// `node_modules/next/dist/server/lib/router-utils/filesystem.js` `buildCustomRoute`: strict, and
// case-insensitive unless `experimental.caseSensitiveRoutes` is set (it is not here).
const matchers = redirects.map((r) => getPathMatch(r.source, { strict: true, sensitive: false }));

/** True when a page or `app/(home)` serves `route`, or a redirect source matches it. */
const answers = (route: string): boolean =>
  route === '/' || byUrl.has(route) || matchers.some((match) => match(route) !== false);

test('the frozen master route list is present and non-trivial', () => {
  assert.match(fixture.commit, /^[0-9a-f]{40}$/);
  assert.ok(fixture.routes.length > 250, `${fixture.routes.length} routes`);
});

test('every page route live on master is a page or a redirect source', () => {
  const lost = fixture.routes
    .filter(({ route }) => !answers(route))
    .map(
      ({ route, file }) =>
        `${route} (master ${file}): restore the page or add a redirect in redirects.config.ts`,
    );
  assert.deepEqual(lost, []);
});
