/** Tests for `lib/llms-tracking.ts`, imported directly under `node --test`. */
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  type BuildPayloadInput,
  buildTrackingPayload,
  classifyUA,
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

// --- pathInfo ----------------------------------------------------------------------------------

test('pathInfo: /llms.txt and /llms-full.txt are indexes, tracked as-is', () => {
  for (const path of ['/llms.txt', '/llms-full.txt']) {
    assert.deepEqual(pathInfo(path), { kind: 'llms-index', trackedPath: path, fileType: 'index' });
  }
});

test('pathInfo: /docs/<slug>.md is a markdown page, tracked as-is', () => {
  assert.deepEqual(pathInfo('/docs/get-started/faq.md'), {
    kind: 'markdown-direct',
    trackedPath: '/docs/get-started/faq.md',
    fileType: 'page',
  });
});

test('pathInfo: /docs.md is the docs-index markdown page', () => {
  assert.deepEqual(pathInfo('/docs.md'), {
    kind: 'markdown-direct',
    trackedPath: '/docs.md',
    fileType: 'page',
  });
});

test('pathInfo: the mirror route canonicalises to the /docs/<slug>.md form', () => {
  assert.deepEqual(pathInfo('/llms.mdx/docs/get-started/faq/content.md'), {
    kind: 'markdown-mirror',
    trackedPath: '/docs/get-started/faq.md',
    fileType: 'page',
  });
});

test('pathInfo: the mirror route for the docs index is /docs.md, not /docs/.md', () => {
  assert.equal(pathInfo('/llms.mdx/docs/content.md').trackedPath, '/docs.md');
});

test('pathInfo: both request shapes for one page agree on the tracked path', () => {
  assert.equal(
    pathInfo('/llms.mdx/docs/stylus/quickstart/content.md').trackedPath,
    pathInfo('/docs/stylus/quickstart.md').trackedPath,
  );
});

test('pathInfo: HTML pages, static files and .md outside /docs are ignored', () => {
  for (const path of [
    '/docs/get-started',
    '/docs',
    '/anytrust.md',
    '/_next/static/chunk.js',
    '/img/logo.svg',
    '/sitemap.xml',
    '/robots.txt',
    '/og/docs/get-started/image.png',
    '/.well-known/mcp/server-card.json',
    '/opengraph-image-12gd74',
  ]) {
    assert.deepEqual(pathInfo(path), ignored, path);
  }
});

// --- buildTrackingPayload -----------------------------------------------------------------------

const input: BuildPayloadInput = {
  trackedPath: '/llms-full.txt',
  fileType: 'index',
  userAgent: 'GPTBot/1.2',
  referrer: 'https://chatgpt.com/',
  posthogKey: 'phc_TEST',
  siteUrl: 'https://docs.arbitrum.io',
};

test('buildTrackingPayload: shape and fields', () => {
  const payload = buildTrackingPayload(input);

  assert.equal(payload.api_key, 'phc_TEST');
  assert.equal(payload.event, 'llms_file_fetched');
  assert.deepEqual(payload.properties, {
    $current_url: 'https://docs.arbitrum.io/llms-full.txt',
    file: '/llms-full.txt',
    file_type: 'index',
    bot_category: 'gptbot',
    $user_agent: 'GPTBot/1.2',
    $referrer: 'https://chatgpt.com/',
    $process_person_profile: false,
  });
});

test('buildTrackingPayload: every event gets its own random distinct_id', () => {
  const a = buildTrackingPayload(input).distinct_id;
  const b = buildTrackingPayload(input).distinct_id;

  assert.match(a, /^[0-9a-f-]{36}$/);
  assert.notEqual(a, b);
});

// --- how the capture is scheduled ---------------------------------------------------------------

// Source assertions: `proxy.ts` imports through the `@/` alias, which plain node does not resolve.
// `waitUntil` from `@vercel/functions` silently drops the promise under Next 16, and nothing shows
// that locally, so the wiring itself is what gets tested.

test('proxy schedules the capture with the NextFetchEvent Next provides', () => {
  const proxy = repoFile('proxy.ts');

  assert.match(proxy, /event\.waitUntil\(/);
  assert.match(proxy, /NextFetchEvent/);
});

test('proxy does not use @vercel/functions waitUntil', () => {
  assert.equal(
    /(?:^|\n)\s*import[^\n;]*['"]@vercel\/functions['"]/.test(repoFile('proxy.ts')),
    false,
  );
  assert.equal(JSON.parse(repoFile('package.json')).dependencies['@vercel/functions'], undefined);
});
