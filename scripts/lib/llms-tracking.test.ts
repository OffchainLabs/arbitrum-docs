/**
 * Tests for `lib/llms-tracking.ts`, ported from upstream `lib/llms-tracking.test.ts` and adapted to
 * this site's path shapes (`/docs/...`, `/llms.mdx/docs/.../content.md`).
 *
 * The module under test is imported as `.ts` directly: Node 22 strips types natively, so
 * `pnpm test` (`node --test` over `scripts/**\/*.test.{mjs,ts}`) exercises the exact file
 * `proxy.ts` imports rather than a copy that can drift from it. This is why `lib/llms-tracking.ts` has no runtime
 * imports of its own.
 */
import { isMarkdownPreferred } from 'fumadocs-core/negotiation';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  type BuildPayloadInput,
  buildTrackingPayload,
  classifyUA,
  dailySalt,
  ipHash,
  pathInfo,
} from '../../lib/llms-tracking.ts';

const ignored = { kind: 'ignored', trackedPath: null, fileType: null };

const repoFile = (name: string): string =>
  readFileSync(fileURLToPath(new URL(`../../${name}`, import.meta.url)), 'utf8');

// --- classifyUA -------------------------------------------------------------------------------

test('classifyUA: OpenAI search bot', () => {
  assert.equal(
    classifyUA('Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)'),
    'oai-searchbot',
  );
});

test('classifyUA: GPTBot', () => {
  assert.equal(
    classifyUA(
      'Mozilla/5.0 AppleWebKit/537.36 (compatible; GPTBot/1.2; +https://openai.com/gptbot)',
    ),
    'gptbot',
  );
});

test('classifyUA: ClaudeBot (web)', () => {
  assert.equal(
    classifyUA('Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)'),
    'claudebot',
  );
});

test('classifyUA: Claude-Web', () => {
  assert.equal(classifyUA('Claude-Web/1.0'), 'claudebot');
});

test('classifyUA: anthropic-ai', () => {
  assert.equal(classifyUA('anthropic-ai/1.0'), 'anthropic');
});

test('classifyUA: Perplexity', () => {
  assert.equal(
    classifyUA('Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)'),
    'perplexitybot',
  );
});

test('classifyUA: Google-Extended (LLM-distinguished)', () => {
  assert.equal(classifyUA('Mozilla/5.0 (compatible; Google-Extended)'), 'google-extended');
});

test('classifyUA: Googlebot (regular crawler)', () => {
  assert.equal(
    classifyUA('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'),
    'googlebot',
  );
});

test('classifyUA: Bingbot', () => {
  assert.equal(
    classifyUA('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'),
    'bingbot',
  );
});

test('classifyUA: Meta external agent', () => {
  assert.equal(
    classifyUA(
      'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
    ),
    'meta-externalagent',
  );
});

test('classifyUA: generic bot keyword falls into other-bot', () => {
  assert.equal(classifyUA('Mozilla/5.0 (compatible; UnknownCrawler/1.0)'), 'other-bot');
});

test('classifyUA: spider keyword', () => {
  assert.equal(classifyUA('SomeOtherSpider/1.0'), 'other-bot');
});

test('classifyUA: archive.org', () => {
  assert.equal(
    classifyUA(
      'Mozilla/5.0 (compatible; archive.org_bot +http://archive.org/details/archive.org_bot)',
    ),
    'other-bot',
  );
});

test('classifyUA: humans (Chrome on macOS)', () => {
  assert.equal(
    classifyUA(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    ),
    'human',
  );
});

test('classifyUA: empty string is human', () => {
  assert.equal(classifyUA(''), 'human');
});

test('classifyUA: case insensitive', () => {
  assert.equal(classifyUA('gptbot/1.0'), 'gptbot');
});

test('classifyUA: OAI-SearchBot precedence over GPTBot when both appear', () => {
  assert.equal(classifyUA('OAI-SearchBot GPTBot/1.0'), 'oai-searchbot');
});

test('classifyUA: anthropic-ai wins over ClaudeBot when both tokens present', () => {
  assert.equal(classifyUA('ClaudeBot/1.0 anthropic-ai/1.0'), 'anthropic');
});

// --- pathInfo: llms indexes -------------------------------------------------------------------

test('pathInfo: /llms.txt is index, tracked as-is', () => {
  assert.deepEqual(pathInfo('/llms.txt', false), {
    kind: 'llms-index',
    trackedPath: '/llms.txt',
    fileType: 'index',
  });
});

test('pathInfo: /llms-full.txt is index', () => {
  assert.deepEqual(pathInfo('/llms-full.txt', false), {
    kind: 'llms-index',
    trackedPath: '/llms-full.txt',
    fileType: 'index',
  });
});

test('pathInfo: /llms.txt always wins regardless of negotiation', () => {
  assert.deepEqual(pathInfo('/llms.txt', true), {
    kind: 'llms-index',
    trackedPath: '/llms.txt',
    fileType: 'index',
  });
});

// --- pathInfo: explicit .md under /docs -------------------------------------------------------

test('pathInfo: /docs/<slug>.md is a markdown page, tracked as-is', () => {
  assert.deepEqual(pathInfo('/docs/get-started/faq.md', false), {
    kind: 'markdown-direct',
    trackedPath: '/docs/get-started/faq.md',
    fileType: 'page',
  });
});

test('pathInfo: /docs.md is the direct docs-index markdown page', () => {
  assert.deepEqual(pathInfo('/docs.md', false), {
    kind: 'markdown-direct',
    trackedPath: '/docs.md',
    fileType: 'page',
  });
});

test('pathInfo: a .md outside /docs is ignored (the redirect destination is tracked instead)', () => {
  // `/anytrust.md` is answered with a 307 to `/docs/anytrust.md`; counting both would double it.
  assert.deepEqual(pathInfo('/anytrust.md', false), ignored);
});

// --- pathInfo: the per-page markdown mirror ----------------------------------------------------

test('pathInfo: the mirror route canonicalises to the /docs/<slug>.md form', () => {
  assert.deepEqual(pathInfo('/llms.mdx/docs/get-started/faq/content.md', false), {
    kind: 'markdown-mirror',
    trackedPath: '/docs/get-started/faq.md',
    fileType: 'page',
  });
});

test('pathInfo: the mirror route for the docs index is /docs.md, not /docs/.md', () => {
  assert.deepEqual(pathInfo('/llms.mdx/docs/content.md', false), {
    kind: 'markdown-mirror',
    trackedPath: '/docs.md',
    fileType: 'page',
  });
});

test('pathInfo: all three request shapes for one page agree on the tracked path', () => {
  const direct = pathInfo('/docs/stylus/quickstart.md', false);
  const mirror = pathInfo('/llms.mdx/docs/stylus/quickstart/content.md', false);
  const negotiated = pathInfo('/docs/stylus/quickstart', true);

  assert.equal(direct.trackedPath, '/docs/stylus/quickstart.md');
  assert.equal(mirror.trackedPath, direct.trackedPath);
  assert.equal(negotiated.trackedPath, direct.trackedPath);
});

test('pathInfo: all three archive shapes agree, and differ from the live page', () => {
  // Archives are `/docs/<slug>/<id>` (FS-2698) and have their own markdown mirror (FS-2711). No
  // branch in `pathInfo` knows that: the version id is just another path segment, so the three
  // shapes normalise through the same rules the live ones do. This pins that, because the
  // alternative (an archive read recorded under the live page's path) is invisible in PostHog.
  const archive = '/docs/run-a-node/start-here/v1.md';
  const direct = pathInfo(archive, false);
  const mirror = pathInfo('/llms.mdx/docs/run-a-node/start-here/v1/content.md', false);
  const negotiated = pathInfo('/docs/run-a-node/start-here/v1', true);

  assert.deepEqual(direct, { kind: 'markdown-direct', trackedPath: archive, fileType: 'page' });
  assert.equal(mirror.trackedPath, archive);
  assert.equal(negotiated.trackedPath, archive);
  assert.notEqual(archive, pathInfo('/docs/run-a-node/start-here.md', false).trackedPath);
});

// --- pathInfo: Accept negotiation --------------------------------------------------------------

test('pathInfo: a clean /docs URL with Accept text/markdown is a negotiation', () => {
  assert.deepEqual(pathInfo('/docs/get-started', true), {
    kind: 'markdown-negotiate',
    trackedPath: '/docs/get-started.md',
    fileType: 'page',
  });
});

test('pathInfo: negotiating the docs index gives /docs.md', () => {
  assert.deepEqual(pathInfo('/docs', true), {
    kind: 'markdown-negotiate',
    trackedPath: '/docs.md',
    fileType: 'page',
  });
});

test('pathInfo: all docs-index markdown request shapes agree on the tracked path', () => {
  const direct = pathInfo('/docs.md', false);
  const mirror = pathInfo('/llms.mdx/docs/content.md', false);
  const negotiated = pathInfo('/docs', true);

  assert.equal(direct.trackedPath, '/docs.md');
  assert.equal(mirror.trackedPath, direct.trackedPath);
  assert.equal(negotiated.trackedPath, direct.trackedPath);
});

test('pathInfo: trailing slash is stripped before the .md suffix', () => {
  assert.deepEqual(pathInfo('/docs/get-started/', true), {
    kind: 'markdown-negotiate',
    trackedPath: '/docs/get-started.md',
    fileType: 'page',
  });
});

test('pathInfo: a clean URL without a markdown Accept is ignored', () => {
  assert.deepEqual(pathInfo('/docs/get-started', false), ignored);
});

test('pathInfo: weighted Accept headers follow the router negotiation result', () => {
  const cases = [
    ['text/html;q=1, text/markdown;q=0', false],
    ['text/html, text/markdown;q=0.1', false],
    ['text/markdown;q=1, text/html;q=0.1', true],
    ['text/plain', true],
  ] as const;

  for (const [accept, expectedMarkdown] of cases) {
    const request = new Request('https://docs.arbitrum.io/docs/get-started', {
      headers: { accept },
    });
    const markdownPreferred = isMarkdownPreferred(request);
    assert.equal(markdownPreferred, expectedMarkdown, accept);
    assert.deepEqual(
      pathInfo('/docs/get-started', markdownPreferred),
      expectedMarkdown
        ? {
            kind: 'markdown-negotiate',
            trackedPath: '/docs/get-started.md',
            fileType: 'page',
          }
        : ignored,
      accept,
    );
  }
});

test('pathInfo: a dotted docs slug is tracked, matching what the proxy actually rewrites', () => {
  // The proxy's negotiation rewrite is `/docs{/*path}`, which matches dots. Requiring a dot-free
  // path here would serve markdown for such a slug and record nothing. There are no dotted slugs
  // in content/docs today, so this pins the behaviour before one exists rather than after.
  assert.deepEqual(pathInfo('/docs/v1.2/guide', true), {
    kind: 'markdown-negotiate',
    trackedPath: '/docs/v1.2/guide.md',
    fileType: 'page',
  });
});

test('pathInfo: Accept text/markdown outside /docs is ignored', () => {
  // The home page has no markdown mirror, so there is nothing to record a fetch of.
  assert.deepEqual(pathInfo('/', true), ignored);
});

test('pathInfo: a .well-known path is ignored even with a markdown Accept', () => {
  // `proxy.ts` bypasses `/.well-known/` outright, so the request never becomes a markdown read and
  // must not be counted as one. Asserted for the Accept header too, because that is the only
  // classification branch a non-`.md` path outside `/docs` could otherwise fall into.
  assert.deepEqual(pathInfo('/.well-known/mcp/server-card.json', true), ignored);
});

test('pathInfo: the home social card is ignored even with a markdown Accept', () => {
  // Same reasoning as the `.well-known` case above: `/opengraph-image-<hash>` sits outside `/docs`
  // and has no `.md` suffix, so the Accept branch is the only one it could otherwise fall into.
  assert.deepEqual(pathInfo('/opengraph-image-12gd74', true), ignored);
});

// --- pathInfo: everything else -----------------------------------------------------------------

test('pathInfo: static and metadata routes are ignored', () => {
  for (const path of [
    '/_next/static/chunk.js',
    '/img/logo.svg',
    '/favicon.ico',
    '/sitemap.xml',
    '/robots.txt',
    '/og/docs/get-started/image.png',
    '/api/search',
    // Well-known URIs (public/.well-known/). The MCP discovery card is a static JSON fetch, not a
    // markdown read, so it must never join the `llms_file_fetched` series.
    '/.well-known/mcp/server-card.json',
    // The home page's social card (app/(home)/opengraph-image.tsx), served from
    // `/opengraph-image-<hash>`. It is a PNG fetch, not a markdown read, so it must never join the
    // `llms_file_fetched` series.
    '/opengraph-image-12gd74',
  ]) {
    assert.deepEqual(pathInfo(path, false), ignored, path);
  }
});

// --- salt and hashing ---------------------------------------------------------------------------

test('dailySalt: returns a YYYY-MM-DD UTC date string', () => {
  assert.equal(dailySalt(new Date('2026-05-22T14:30:00Z')), '2026-05-22');
});

test('ipHash: deterministic for the same ip and salt', async () => {
  const a = await ipHash('203.0.113.42', '2026-05-22');
  const b = await ipHash('203.0.113.42', '2026-05-22');
  assert.equal(a, b);
});

test('ipHash: different salts give different hashes', async () => {
  const day1 = await ipHash('203.0.113.42', '2026-05-22');
  const day2 = await ipHash('203.0.113.42', '2026-05-23');
  assert.notEqual(day1, day2);
});

test('ipHash: different IPs give different hashes', async () => {
  const a = await ipHash('203.0.113.42', '2026-05-22');
  const b = await ipHash('198.51.100.10', '2026-05-22');
  assert.notEqual(a, b);
});

test('ipHash: returns 64-char hex (sha256)', async () => {
  assert.match(await ipHash('203.0.113.42', '2026-05-22'), /^[0-9a-f]{64}$/);
});

// --- buildTrackingPayload -----------------------------------------------------------------------

test('buildTrackingPayload: shape and fields', async () => {
  const payload = await buildTrackingPayload({
    trackedPath: '/llms-full.txt',
    fileType: 'index',
    userAgent: 'GPTBot/1.2',
    referrer: 'https://chatgpt.com/',
    ip: '203.0.113.42',
    posthogKey: 'phc_TEST',
    siteUrl: 'https://docs.arbitrum.io',
    now: new Date('2026-05-22T14:30:00Z'),
  });

  assert.equal(payload.api_key, 'phc_TEST');
  assert.equal(payload.event, 'llms_file_fetched');
  assert.match(payload.distinct_id, /^[0-9a-f]{64}$/);
  assert.equal(payload.properties.file, '/llms-full.txt');
  assert.equal(payload.properties.file_type, 'index');
  assert.equal(payload.properties.bot_category, 'gptbot');
  assert.equal(payload.properties.$current_url, 'https://docs.arbitrum.io/llms-full.txt');
  assert.equal(payload.properties.$user_agent, 'GPTBot/1.2');
  assert.equal(payload.properties.$referrer, 'https://chatgpt.com/');
});

test('buildTrackingPayload: $current_url is built from the site origin passed in', async () => {
  const payload = await buildTrackingPayload({
    trackedPath: '/docs/get-started.md',
    fileType: 'page',
    userAgent: 'GPTBot/1.0',
    referrer: '',
    ip: '203.0.113.42',
    posthogKey: 'phc_TEST',
    siteUrl: 'https://example.test',
    now: new Date('2026-05-22T14:30:00Z'),
  });

  assert.equal(payload.properties.$current_url, 'https://example.test/docs/get-started.md');
});

test('buildTrackingPayload: a human UA records bot_category=human', async () => {
  const payload = await buildTrackingPayload({
    trackedPath: '/docs/get-started.md',
    fileType: 'page',
    userAgent: 'Mozilla/5.0',
    referrer: '',
    ip: '203.0.113.42',
    posthogKey: 'phc_TEST',
    siteUrl: 'https://docs.arbitrum.io',
    now: new Date('2026-05-22T14:30:00Z'),
  });

  assert.match(payload.distinct_id, /^[0-9a-f]{64}$/);
  assert.equal(payload.properties.bot_category, 'human');
  assert.equal(payload.properties.$referrer, '');
});

test('buildTrackingPayload: the same ip on the same day gives the same distinct_id', async () => {
  const common = {
    userAgent: 'GPTBot/1.0',
    referrer: '',
    ip: '203.0.113.42',
    posthogKey: 'phc_TEST',
    siteUrl: 'https://docs.arbitrum.io',
  };
  const p1 = await buildTrackingPayload({
    ...common,
    trackedPath: '/llms.txt',
    fileType: 'index',
    now: new Date('2026-05-22T14:30:00Z'),
  });
  const p2 = await buildTrackingPayload({
    ...common,
    trackedPath: '/docs/get-started.md',
    fileType: 'page',
    now: new Date('2026-05-22T22:00:00Z'),
  });

  assert.equal(p1.distinct_id, p2.distinct_id);
});

test('buildTrackingPayload: a different day gives a different distinct_id for the same ip', async () => {
  const common: BuildPayloadInput = {
    trackedPath: '/llms.txt',
    fileType: 'index',
    userAgent: 'GPTBot/1.0',
    referrer: '',
    ip: '203.0.113.42',
    posthogKey: 'phc_TEST',
    siteUrl: 'https://docs.arbitrum.io',
  };
  const day1 = await buildTrackingPayload({ ...common, now: new Date('2026-05-22T14:30:00Z') });
  const day2 = await buildTrackingPayload({ ...common, now: new Date('2026-05-23T14:30:00Z') });

  assert.notEqual(day1.distinct_id, day2.distinct_id);
});

test('buildTrackingPayload: an absent ip gets a random id, not one shared bucket', async () => {
  // Hashing '' is a constant, so without this every request lacking x-forwarded-for would collapse
  // into a single PostHog person and read as one extraordinarily busy client.
  const common: BuildPayloadInput = {
    trackedPath: '/llms.txt',
    fileType: 'index',
    userAgent: 'GPTBot/1.0',
    referrer: '',
    ip: '',
    posthogKey: 'phc_TEST',
    siteUrl: 'https://docs.arbitrum.io',
    now: new Date('2026-05-22T14:30:00Z'),
  };
  const a = await buildTrackingPayload(common);
  const b = await buildTrackingPayload(common);

  assert.notEqual(a.distinct_id, b.distinct_id);
  // And specifically not the hash of the empty string, which is what a naive fallback produces.
  assert.notEqual(a.distinct_id, await ipHash('', dailySalt(common.now)));
});

test('buildTrackingPayload: the random-id fallback mints no PostHog person profile', async () => {
  // A unique id per request would otherwise create a profile per request, each one unrelatable to
  // anything by construction. The opt-out keeps the event countable without the profile.
  const payload = await buildTrackingPayload({
    trackedPath: '/llms.txt',
    fileType: 'index',
    userAgent: 'GPTBot/1.0',
    referrer: '',
    ip: '',
    posthogKey: 'phc_TEST',
    siteUrl: 'https://docs.arbitrum.io',
    now: new Date('2026-05-22T14:30:00Z'),
  });

  assert.equal(payload.properties.$process_person_profile, false);
});

test('buildTrackingPayload: a hashed ip keeps its person profile', async () => {
  // The daily hash exists precisely so one client collapses into one person for the day. Opting
  // out here would throw that away and leave the dashboards unable to count distinct crawlers.
  const payload = await buildTrackingPayload({
    trackedPath: '/llms.txt',
    fileType: 'index',
    userAgent: 'GPTBot/1.0',
    referrer: '',
    ip: '203.0.113.42',
    posthogKey: 'phc_TEST',
    siteUrl: 'https://docs.arbitrum.io',
    now: new Date('2026-05-22T14:30:00Z'),
  });

  assert.equal('$process_person_profile' in payload.properties, false);
});

test('buildTrackingPayload: the raw ip never appears anywhere in the payload', async () => {
  const payload = await buildTrackingPayload({
    trackedPath: '/llms.txt',
    fileType: 'index',
    userAgent: 'GPTBot/1.0',
    referrer: '',
    ip: '203.0.113.42',
    posthogKey: 'phc_TEST',
    siteUrl: 'https://docs.arbitrum.io',
    now: new Date('2026-05-22T14:30:00Z'),
  });

  assert.equal(JSON.stringify(payload).includes('203.0.113.42'), false);
});

// --- how the capture is scheduled ---------------------------------------------------------------

// These are source assertions rather than behavioural ones: `proxy.ts` imports through the `@/`
// alias, which plain node does not resolve, so it cannot be imported here. They exist because the
// failure they guard against is invisible at runtime and in every local test.
//
// `waitUntil` from `@vercel/functions` resolves the request context through
// `globalThis[Symbol.for('@vercel/request-context')]`. When that symbol is absent, its `getContext()`
// returns `{}` and the call becomes `undefined?.(promise)`: the promise is dropped with no error,
// no log, and no type error. Next 16 does not install that symbol (it installs
// `@next/request-context`), so on Vercel the capture would be at the mercy of whether the
// invocation happens to stay alive past the response.
//
// Nothing catches this locally, because the promise chain begins executing the moment it is built.
// In `next dev` the fetch completes either way, so an end-to-end check passes while production
// silently loses events. Hence a test on the wiring itself.

test('proxy schedules the capture with the NextFetchEvent Next provides', () => {
  const proxy = repoFile('proxy.ts');

  assert.match(proxy, /event\.waitUntil\(/, 'the capture must be scheduled via event.waitUntil()');
  assert.match(
    proxy,
    /NextFetchEvent/,
    'the proxy must take the NextFetchEvent Next passes as its second argument',
  );
});

test('proxy does not use @vercel/functions waitUntil, which no-ops under Next 16', () => {
  // Matches an import of the package, not a mention of it: the doc comment in proxy.ts names
  // @vercel/functions on purpose, to tell the next reader why it is not used.
  assert.equal(
    /(?:^|\n)\s*import[^\n;]*['"]@vercel\/functions['"]/.test(repoFile('proxy.ts')),
    false,
    'proxy.ts must not import @vercel/functions; its waitUntil silently drops the promise here',
  );
  assert.equal(
    JSON.parse(repoFile('package.json')).dependencies['@vercel/functions'],
    undefined,
    '@vercel/functions must not be a dependency; Next provides waitUntil natively',
  );
});
