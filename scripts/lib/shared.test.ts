/**
 * Tripwire for `sidebarResourceLinks` in `lib/shared.ts`, the three cross-section links pinned in
 * the sidebar footer on every docs page (`components/sidebar-resource-links.tsx`).
 *
 * `lib/shared.ts` is imported as `.ts` directly: Node 22 strips types natively, and this module
 * imports only `./site-url.ts` (itself TypeScript that Node strips the same way), so it loads
 * under `node --test` the same way `lib/llms-tracking.ts` does for `llms-tracking.test.ts`. That
 * means this test exercises the exact object the component renders, not a copy that can drift from
 * it.
 *
 * Nothing else checks these three hrefs. `scripts/check-links.ts` walks `content/docs/**`
 * `.md(x)` files only, by its own header comment, and `pnpm move-doc` retargets
 * `redirects.config.ts` but not a `.tsx` file. Without this test, deleting or renaming one of the
 * three pages would leave a silent 404 in the footer of every section sidebar. Same ungated shape
 * `announcementLinkHref` has, which is why `buildIndex` (the content-tree walk every other tool
 * resolves URLs against) is reused here rather than writing another copy of "map a /docs/... URL
 * to a file".
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { sidebarResourceLinks } from '../../lib/shared.ts';
import { buildIndex } from './doc-links.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

test('every sidebar resource link resolves to a real page under content/docs', () => {
  const { byUrl } = buildIndex(repoRoot);
  // Next routes are case-sensitive, and so is this lookup.
  const missing = sidebarResourceLinks.map((link) => link.url).filter((url) => !byUrl.has(url));
  assert.deepEqual(missing, []);
});

test('every sidebar resource link has a non-empty label', () => {
  for (const link of sidebarResourceLinks) {
    assert.equal(typeof link.text, 'string');
    assert.ok(link.text.trim().length > 0, `empty label for ${link.url}`);
  }
});
