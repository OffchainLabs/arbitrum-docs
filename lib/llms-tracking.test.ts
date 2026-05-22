import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { classifyUA, pathInfo } from './llms-tracking';

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
  // Defensive: a hypothetical multi-tag UA should pick the more specific OpenAI tag
  assert.equal(classifyUA('OAI-SearchBot GPTBot/1.0'), 'oai-searchbot');
});

test('classifyUA: anthropic-ai wins over ClaudeBot when both tokens present', () => {
  // Defensive: if Anthropic ships a UA combining both identifiers, anthropic-ai (the more
  // specific library fetcher) should take precedence over the generic ClaudeBot crawler tag.
  assert.equal(classifyUA('ClaudeBot/1.0 anthropic-ai/1.0'), 'anthropic');
});

test('pathInfo: /llms.txt is index, tracked as-is', () => {
  assert.deepEqual(pathInfo('/llms.txt', ''), {
    kind: 'llms-index',
    trackedPath: '/llms.txt',
    fileType: 'index',
  });
});

test('pathInfo: /llms-full.txt is index', () => {
  assert.deepEqual(pathInfo('/llms-full.txt', ''), {
    kind: 'llms-index',
    trackedPath: '/llms-full.txt',
    fileType: 'index',
  });
});

test('pathInfo: /foo/bar.md is markdown page', () => {
  assert.deepEqual(pathInfo('/foo/bar.md', ''), {
    kind: 'markdown-direct',
    trackedPath: '/foo/bar.md',
    fileType: 'page',
  });
});

test('pathInfo: /sdk/foo.md is excluded (auto-generated)', () => {
  assert.deepEqual(pathInfo('/sdk/foo.md', ''), {
    kind: 'ignored',
    trackedPath: null,
    fileType: null,
  });
});

test('pathInfo: /foo with Accept text/markdown is a negotiation rewrite', () => {
  assert.deepEqual(pathInfo('/foo', 'text/markdown'), {
    kind: 'markdown-negotiate',
    trackedPath: '/foo.md',
    fileType: 'page',
  });
});

test('pathInfo: root negotiation rewrites to /index.md', () => {
  assert.deepEqual(pathInfo('/', 'text/markdown'), {
    kind: 'markdown-negotiate',
    trackedPath: '/index.md',
    fileType: 'page',
  });
});

test('pathInfo: trailing slash stripped before .md suffix', () => {
  assert.deepEqual(pathInfo('/foo/bar/', 'text/markdown'), {
    kind: 'markdown-negotiate',
    trackedPath: '/foo/bar.md',
    fileType: 'page',
  });
});

test('pathInfo: clean URL without markdown accept is ignored', () => {
  assert.deepEqual(pathInfo('/foo/bar', 'text/html'), {
    kind: 'ignored',
    trackedPath: null,
    fileType: null,
  });
});

test('pathInfo: /llms.txt always wins regardless of accept', () => {
  assert.deepEqual(pathInfo('/llms.txt', 'text/markdown'), {
    kind: 'llms-index',
    trackedPath: '/llms.txt',
    fileType: 'index',
  });
});
