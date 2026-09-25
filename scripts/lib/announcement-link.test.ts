import assert from 'node:assert/strict';
import { test } from 'node:test';

import { type AnnouncementLinkIndex, checkAnnouncementLink } from './announcement-link.ts';

// Minimal stand-in for buildIndex()'s return value: `/docs/...` resolution reads `byUrl` only.
const index: AnnouncementLinkIndex = {
  byUrl: new Map([
    ['/docs/stylus/gentle-introduction', '/abs/content/docs/stylus/gentle-introduction.mdx'],
    ['/docs', '/abs/content/docs/index.mdx'],
  ]),
  urlByAbs: new Map(),
  byAbs: new Set(),
};

// No public/ directory under this path, so every asset probe misses.
const repoRoot = '/nonexistent-repo-root';

test('accepts an https URL', () => {
  assert.deepEqual(checkAnnouncementLink('https://arbitrum.io', index, repoRoot), { ok: true });
});

test('accepts an internal docs path', () => {
  assert.deepEqual(checkAnnouncementLink('/docs/stylus/gentle-introduction', index, repoRoot), {
    ok: true,
  });
});

test('accepts an internal docs path carrying an anchor', () => {
  assert.deepEqual(
    checkAnnouncementLink('/docs/stylus/gentle-introduction#activation', index, repoRoot),
    { ok: true },
  );
});

test('rejects an internal path with no page behind it', () => {
  const result = checkAnnouncementLink('/docs/stylus/does-not-exist', index, repoRoot);
  assert.equal(result.ok, false);
  assert.match(result.reason, /does not resolve/);
});

test('rejects plain http', () => {
  const result = checkAnnouncementLink('http://arbitrum.io', index, repoRoot);
  assert.equal(result.ok, false);
  assert.match(result.reason, /https/);
});

test('rejects a relative path, which has no stable meaning on a site-wide banner', () => {
  const result = checkAnnouncementLink('stylus/gentle-introduction', index, repoRoot);
  assert.equal(result.ok, false);
  assert.match(result.reason, /root-absolute/);
});

test('rejects an anchor-only href', () => {
  assert.equal(checkAnnouncementLink('#activation', index, repoRoot).ok, false);
});

test('rejects other protocols', () => {
  assert.equal(checkAnnouncementLink('mailto:docs@arbitrum.io', index, repoRoot).ok, false);
  assert.equal(checkAnnouncementLink('//example.com/x', index, repoRoot).ok, false);
});

test('rejects an empty or non-string value', () => {
  assert.equal(checkAnnouncementLink('', index, repoRoot).ok, false);
  assert.equal(checkAnnouncementLink('   ', index, repoRoot).ok, false);
  assert.equal(checkAnnouncementLink(undefined, index, repoRoot).ok, false);
  assert.equal(checkAnnouncementLink(42, index, repoRoot).ok, false);
});

test('rejects a {var:name} placeholder, which the banner would render literally', () => {
  const result = checkAnnouncementLink('/docs/{var:x}/gentle-introduction', index, repoRoot);
  assert.equal(result.ok, false);
  assert.match(result.reason, /placeholder/);
});
