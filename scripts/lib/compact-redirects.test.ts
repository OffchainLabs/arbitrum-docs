import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { compactRedirects } from '../../lib/compact-redirects.ts';
import { siteHeaders } from '../../lib/http-headers.ts';
import { markdownTwins } from '../../lib/markdown-redirects.ts';
import { redirects } from '../../redirects.config.ts';
import { buildIndex } from './doc-links.ts';

const require = createRequire(import.meta.url);
const { match, pathToRegexp } = require('next/dist/compiled/path-to-regexp') as {
  match(source: string): (pathname: string) => false | { params: Record<string, string> };
  pathToRegexp(source: string): RegExp;
};
const { prepareDestination } = require('next/dist/shared/lib/router/utils/prepare-destination') as {
  prepareDestination(input: {
    destination: string;
    params: Record<string, string>;
    query: Record<string, string>;
    appendParamsToQuery: boolean;
  }): { newUrl: string; parsedDestination: { query: Record<string, string> } };
};
const entry = (source: string, destination = '/docs/target', permanent = false) => ({
  source,
  destination,
  permanent,
});
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const all = [...redirects, ...markdownTwins(redirects, new Set(buildIndex(repoRoot).byUrl.keys()))];
const compact = compactRedirects(all);
const compiled = compact.map((rule) => ({ rule, matches: match(rule.source) }));
const resolve = (pathname: string) => compiled.find(({ matches }) => matches(pathname))?.rule;

test('exact aliases combine only when destination and permanence both match', () => {
  const input = [
    entry('/a'),
    entry('/b'),
    entry('/c', '/docs/target', true),
    entry('/d', '/docs/other'),
  ];
  const snapshot = structuredClone(input);
  const output = compactRedirects(input);
  assert.deepEqual(output, [
    entry('/:legacy(a|b)'),
    entry('/c', '/docs/target', true),
    entry('/d', '/docs/other'),
  ]);
  assert.deepEqual(input, snapshot, 'the maintained list must not be mutated');
});

test('alternatives escape regex characters and do not match other paths', () => {
  const [rule] = compactRedirects([entry('/old/a.md'), entry('/old/a$'), entry('/old/a|b')]);
  const matches = match(rule.source);
  for (const pathname of ['/old/a.md', '/old/a$', '/old/a|b', '/old/a.md/']) {
    assert.ok(matches(pathname), pathname);
  }
  for (const pathname of ['/old/aXmd', '/old/a', '/old/b', '/old/a.md/extra', '/prefix/old/a.md']) {
    assert.equal(matches(pathname), false, pathname);
  }
});

test('patterns keep their parameters and priority over later literal aliases', () => {
  const pattern = entry('/old/:slug', '/docs/:slug');
  assert.deepEqual(compactRedirects([entry('/a'), pattern, entry('/old/a'), entry('/b')]), [
    entry('/a'),
    pattern,
    entry('/:legacy(old/a|b)'),
  ]);
  assert.deepEqual(compactRedirects([entry('/'), entry('/a/'), entry('/b')]), [
    entry('/'),
    entry('/a/'),
    entry('/b'),
  ]);
});

test("large alias groups split within Next's compiled regex limit", () => {
  const input = Array.from({ length: 200 }, (_, i) => entry(`/old/${'a'.repeat(80)}-${i}`));
  const output = compactRedirects(input);
  assert.ok(output.length > 1);
  assert.ok(output.length < input.length);
  for (const rule of output) assert.ok(pathToRegexp(rule.source).source.length <= 4096);
  const matchers = output.map((rule) => match(rule.source));
  for (const rule of input)
    assert.ok(
      matchers.some((matches) => matches(rule.source)),
      rule.source,
    );
});

test('every maintained HTML and markdown alias keeps its destination and status', () => {
  for (const rule of all.filter((rule) => !/[:()*+?{}\\]/.test(rule.source))) {
    for (const pathname of [rule.source, `${rule.source}/`]) {
      const resolved = resolve(pathname);
      assert.ok(resolved, pathname);
      assert.equal(resolved.destination, rule.destination, pathname);
      assert.equal(resolved.permanent, rule.permanent, pathname);
    }
  }
});

test('compacted routes leave live pages, mirrors and unknown URLs alone', () => {
  for (const url of buildIndex(repoRoot).byUrl.keys()) {
    assert.equal(resolve(url), undefined, url);
    assert.equal(resolve(`${url}.md`), undefined, `${url}.md`);
  }
  for (const url of ['/does-not-exist', '/docs/does-not-exist', '/old/does-not-exist.md']) {
    assert.equal(resolve(url), undefined, url);
  }
});

test('Next preserves query strings and fragments without leaking the grouping parameter', () => {
  for (const pathname of [
    '/how-arbitrum-works/deep-dives/parent-chain-pricing',
    '/how-arbitrum-works/deep-dives/parent-chain-pricing.md',
    '/how-arbitrum-works/reference/parent-chain-pricing',
    '/how-arbitrum-works/reference/parent-chain-pricing.md',
  ]) {
    const hit = compiled.find(({ matches }) => matches(pathname));
    assert.ok(hit);
    const matched = hit.matches(pathname);
    assert.ok(matched);
    const prepared = prepareDestination({
      destination: hit.rule.destination,
      params: matched.params,
      query: { utm_source: 'legacy' },
      appendParamsToQuery: false,
    });
    assert.equal(prepared.newUrl, hit.rule.destination);
    assert.deepEqual(prepared.parsedDestination.query, { utm_source: 'legacy' });
  }
});

test("custom routes stay below the warning threshold and all source regexes fit Next's limit", () => {
  const total = compact.length + siteHeaders({ isProduction: false }).length + 2;
  assert.ok(total <= 1000, `${total} custom routes exceed Next's 1000-route warning threshold`);
  for (const rule of compact) {
    assert.ok(pathToRegexp(rule.source).source.length <= 4096, rule.source);
  }
});
