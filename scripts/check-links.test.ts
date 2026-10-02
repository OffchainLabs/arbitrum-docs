import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { readVars } from '../lib/var-links.ts';
import {
  buildIndex,
  expandRefUrl,
  extractRefs,
  findBrokenLinks,
  resolveRefToFile,
  resolvesToPublicAsset,
} from './lib/doc-links.ts';

test('the root markdown mirror resolves to the overview but remains an invalid HTML content link', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'doc-links-root-mirror-'));
  const docsRoot = path.join(root, 'content', 'docs');
  mkdirSync(docsRoot, { recursive: true });
  const overview = path.join(docsRoot, 'index.mdx');
  writeFileSync(overview, '# Documentation\n');
  writeFileSync(path.join(docsRoot, 'article.mdx'), '[overview](/index.md)\n');
  const index = buildIndex(root);

  assert.equal(resolveRefToFile('/index.md', null, index), overview);
  assert.equal(resolveRefToFile('/index.md#overview', null, index), overview);
  assert.equal(resolveRefToFile('/', null, index), overview);
  assert.deepEqual(
    findBrokenLinks(index).map((link) => link.url),
    ['/index.md'],
  );
});

test('link extraction preserves source ranges after Unicode frontmatter and prose', () => {
  const source =
    '---\ntitle: "🦀 [not a link](./metadata)"\n---\n\n' +
    '🦀 [first](./first) and [second](./second).';
  const refs = extractRefs(source);
  assert.deepEqual(
    refs.map((ref) => ref.rawUrl),
    ['./first', './second'],
  );
  for (const ref of refs) {
    assert.ok(ref.range, 'a markdown link always carries a range');
    assert.equal(source.slice(...ref.range), ref.rawUrl);
  }
});

test('link extraction ignores nested fences and multi-backtick code spans', () => {
  const source = [
    '````markdown',
    '```rust',
    '```',
    '[fenced](./fenced)',
    '````',
    '',
    '``a `backtick` and [inline](./inline)``',
    '',
    '``a multiline',
    '[multiline](./multiline) span``',
    '',
    '[prose](./prose)',
  ].join('\n');
  assert.deepEqual(
    extractRefs(source).map((ref) => ref.rawUrl),
    ['./prose'],
  );
});

/** A throwaway repo root with a `public/` tree, so these tests never depend on repo state. */
function fixture(): string {
  const root = mkdtempSync(path.join(tmpdir(), 'doc-links-public-'));
  mkdirSync(path.join(root, 'public', 'audit-reports'), { recursive: true });
  writeFileSync(path.join(root, 'public', 'audit-reports', 'report.pdf'), '%PDF-1.4');
  writeFileSync(path.join(root, 'public', 'nitro-whitepaper.pdf'), '%PDF-1.4');
  writeFileSync(path.join(root, 'outside.txt'), 'not under public/');
  return root;
}

test('a root-absolute path resolves to an existing file under public/', () => {
  const root = fixture();
  assert.equal(resolvesToPublicAsset('/audit-reports/report.pdf', root), true);
  assert.equal(resolvesToPublicAsset('/nitro-whitepaper.pdf', root), true);
});

test('a root-absolute path with no matching file does not resolve', () => {
  const root = fixture();
  assert.equal(resolvesToPublicAsset('/audit-reports/does-not-exist.pdf', root), false);
});

test('a relative path never resolves to public/', () => {
  const root = fixture();
  // Relative links resolve against the page's own URL inside the docs route tree, not against the
  // static root, so `audit-reports/report.pdf` written on /audit-reports is a genuine 404 and
  // must keep being reported.
  assert.equal(resolvesToPublicAsset('audit-reports/report.pdf', root), false);
  assert.equal(resolvesToPublicAsset('./audit-reports/report.pdf', root), false);
});

test('traversal cannot escape public/', () => {
  const root = fixture();
  assert.equal(resolvesToPublicAsset('/../outside.txt', root), false);
  assert.equal(resolvesToPublicAsset('/audit-reports/../../outside.txt', root), false);
});

test('a directory is not a servable asset', () => {
  const root = fixture();
  assert.equal(resolvesToPublicAsset('/audit-reports', root), false);
});

/**
 * A throwaway repo root holding two doc pages, the second of them under a directory named after a
 * real variable value, so a link written with a placeholder has something to resolve to.
 */
function varFixture(segment: string): { root: string; fromAbs: string } {
  const root = mkdtempSync(path.join(tmpdir(), 'doc-links-vars-'));
  const docsRoot = path.join(root, 'content', 'docs');
  mkdirSync(path.join(docsRoot, segment), { recursive: true });
  writeFileSync(path.join(docsRoot, 'from.mdx'), '# from\n');
  writeFileSync(path.join(docsRoot, segment, 'target.mdx'), '# target\n');
  return { root, fromAbs: path.join(docsRoot, 'from.mdx') };
}

test('expandRefUrl substitutes a placeholder and leaves everything else alone', () => {
  const vars = readVars();
  assert.equal(expandRefUrl('/a/{var:nitroVersionTag}/b'), `/a/${vars.nitroVersionTag}/b`);
  assert.equal(expandRefUrl('/a/b'), '/a/b');
  // A URL documenting a path template keeps its braces: only the `var:` prefix is a placeholder.
  assert.equal(expandRefUrl('/a/{chainId}/b'), '/a/{chainId}/b');
  assert.equal(expandRefUrl('/a/{var:noSuchVariable}/b'), '/a/{var:noSuchVariable}/b');
});

test('an internal link written with a placeholder resolves to the page it expands to', () => {
  const segment = String(readVars().nitroRepositorySlug);
  const { root, fromAbs } = varFixture(segment);
  const index = buildIndex(root);
  const target = path.join(root, 'content', 'docs', segment, 'target.mdx');
  assert.equal(resolveRefToFile('/{var:nitroRepositorySlug}/target', fromAbs, index), target);
  // And an expansion that names no page is still reported, so the gate stays honest.
  assert.equal(resolveRefToFile('/{var:nitroRepositorySlug}/missing', fromAbs, index), null);
});
