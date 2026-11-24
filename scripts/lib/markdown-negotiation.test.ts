/** Tests for `lib/markdown-negotiation.ts`, imported directly under `node --test`. */
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { pathInfo } from '../../lib/llms-tracking.ts';
import { markdownTwinPath } from '../../lib/markdown-negotiation.ts';

// --- markdownTwinPath ---------------------------------------------------------------------------

const pages = new Set(['/', '/stylus/quickstart', '/oracles/DIA/dia']);

test('markdownTwinPath: a page path maps to its .md twin, which is also its tracked path', () => {
  for (const [path, twin] of [
    ['/stylus/quickstart', '/stylus/quickstart.md'],
    ['/oracles/DIA/dia', '/oracles/DIA/dia.md'],
    ['/', '/index.md'],
  ]) {
    assert.equal(markdownTwinPath(path, pages), twin, path);
    assert.equal(pathInfo(twin).trackedPath, twin, path);
  }
});

test('markdownTwinPath: a path that is not a page has no twin and is not tracked', () => {
  for (const path of [
    '/llms.txt',
    '/stylus/quickstart.md',
    '/img/logo.svg',
    '/llms.mdx/docs/stylus/quickstart/content.md',
    '/llms.mdx/docs/stylus',
  ]) {
    assert.equal(markdownTwinPath(path, pages), null, path);
  }
  // Without a twin the proxy tracks the request path, which for these is no fetch at all.
  for (const path of [
    '/opengraph-image-abc123',
    '/icon%2Epng',
    '/does-not-exist',
    '/stylus',
    '//stylus/quickstart',
  ]) {
    assert.equal(markdownTwinPath(path, pages), null, path);
    assert.equal(pathInfo(path).kind, 'ignored', path);
  }
});

// --- the page matcher -----------------------------------------------------------------------------

// Next compiles the page matcher's `has` value as `^value$`.
const acceptMatcher = new RegExp(
  `^${(readFileSync(new URL('../../proxy.ts', import.meta.url), 'utf8').match(/key: 'accept',\s*value: '([^']*)'/)?.[1] ?? '').replace(/\\\\/g, '\\')}$`,
);

test('page matcher: Accept naming markdown in any case reaches the proxy', () => {
  for (const accept of ['text/markdown', 'TEXT/MARKDOWN', 'text/html, Text/X-Markdown;q=0.9']) {
    assert.match(accept, acceptMatcher, accept);
  }
  for (const accept of ['text/html', '*/*', 'text/plain', 'text/x-mark']) {
    assert.doesNotMatch(accept, acceptMatcher, accept);
  }
});
