import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import {
  LLM_SURFACE_SOURCES,
  ROOT_LINK_HEADER,
  contentSecurityPolicy,
  siteHeaders,
} from '../../lib/http-headers.ts';

const valueOf = (source: string, key: string, isProduction = true): string | undefined =>
  siteHeaders({ isProduction })
    .filter((rule) => rule.source === source)
    .flatMap((rule) => rule.headers)
    .findLast((header) => header.key === key)?.value;

test('the root sends the Link header master sent, byte for byte', () => {
  // origin/master:vercel.json, the `/` headers entry.
  assert.equal(
    ROOT_LINK_HEADER,
    '</llms.txt>; rel="service-doc"; type="text/plain"; title="LLM-friendly site index", </sitemap.xml>; rel="sitemap"; type="application/xml"',
  );
  assert.equal(valueOf('/', 'Link'), ROOT_LINK_HEADER);
});

test('every route gets the baseline security headers', () => {
  assert.equal(valueOf('/:path*', 'X-Content-Type-Options'), 'nosniff');
  assert.equal(valueOf('/:path*', 'X-Frame-Options'), 'DENY');
  assert.equal(valueOf('/:path*', 'Referrer-Policy'), 'strict-origin-when-cross-origin');
  assert.match(valueOf('/:path*', 'Permissions-Policy') ?? '', /camera=\(\)/);
  assert.ok(valueOf('/:path*', 'Content-Security-Policy-Report-Only'));
  assert.equal(valueOf('/:path*', 'Content-Security-Policy'), undefined, 'the CSP is report-only');
});

/** The slice of Next's bundled path-to-regexp these tests use; it ships no types. */
const { match } = createRequire(import.meta.url)('next/dist/compiled/path-to-regexp') as {
  match(pattern: string): (path: string) => false | object;
};
const corsRules = siteHeaders({ isProduction: true }).filter((rule) =>
  rule.headers.some((h) => h.key === 'Access-Control-Allow-Origin' && h.value === '*'),
);
const hasCors = (path: string): boolean =>
  corsRules.some((rule) => match(rule.source)(path) !== false);

test('the markdown and llms routes are readable cross-origin, and match the proxy matcher', () => {
  for (const source of LLM_SURFACE_SOURCES) {
    assert.equal(valueOf(source, 'Access-Control-Allow-Origin'), '*', source);
  }
  // Every page mirror, root-level or under /docs, and the two index files get the header.
  for (const path of [
    '/llms.txt',
    '/llms-full.txt',
    '/docs.md',
    '/docs/run-a-node/start-here.md',
    '/llms.mdx/docs/run-a-node/start-here/content.md',
    '/how-arbitrum-works/deep-dives/stf.md',
    '/index.md',
  ]) {
    assert.ok(hasCors(path), path);
  }
  for (const path of ['/', '/docs', '/docs/run-a-node/start-here', '/img/logo.svg']) {
    assert.ok(!hasCors(path), `${path} must not be readable cross-origin`);
  }
  // proxy.ts tracks exactly these paths; the two lists describe the same surface.
  const proxy = readFileSync(new URL('../../proxy.ts', import.meta.url), 'utf8');
  const matcher = /matcher:\s*\[([^\]]*)\]/.exec(proxy)?.[1] ?? '';
  const tracked = [...matcher.matchAll(/'([^']*)'/g)].map((m) => m[1].replace(/\\\\/g, '\\'));
  assert.deepEqual(tracked, [...LLM_SURFACE_SOURCES]);
});

test('the CSP allows the origins the site talks to, and the toolbar only off production', () => {
  const csp = contentSecurityPolicy(true);
  for (const origin of [
    'https://us.i.posthog.com',
    'https://us-assets.i.posthog.com',
    'https://api.inkeep.com',
  ]) {
    assert.ok(csp.includes(origin), origin);
  }
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /style-src 'self' 'unsafe-inline'/);
  assert.ok(!csp.includes('vercel.live'));
  assert.ok(contentSecurityPolicy(false).includes('https://vercel.live'));
});
