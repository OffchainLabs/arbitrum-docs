import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { type TestContext, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { readVars } from '../lib/var-links.ts';
import { findBrokenAnchors } from './lib/doc-anchors.ts';
import {
  buildIndex,
  expandRefUrl,
  extractRefs,
  findBrokenLinks,
  findMissingIncludes,
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

// --- partials, glossary entries and missing includes ---------------------------------------------

const CHECK_LINKS = path.join(path.dirname(fileURLToPath(import.meta.url)), 'check-links.ts');

/** A throwaway repo root holding `files` (repo-relative path to content). */
function treeFixture(t: TestContext, files: Record<string, string>): string {
  const root = mkdtempSync(path.join(tmpdir(), 'check-links-shared-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    writeFileSync(path.join(root, rel), content);
  }
  return root;
}

const PAGE = '---\ntitle: Page\ndescription: A page.\n---\n\n';

test('a dead root-absolute link in a partial under content/partials is reported', (t) => {
  const root = treeFixture(t, {
    'content/docs/live.mdx': PAGE + '## Section\n',
    'content/partials/_note.mdx': [
      'See [live](/live) and [dead](/no-such-page).',
      '',
      'A relative [link](./somewhere) has no fixed URL and is skipped.',
    ].join('\n'),
  });
  assert.deepEqual(
    findBrokenLinks(buildIndex(root)).map((b) => `${b.rel}:${b.line} ${b.url}`),
    ['content/partials/_note.mdx:1 /no-such-page'],
  );
});

test('a dead link in a glossary entry is reported, path and fragment', async (t) => {
  const root = treeFixture(t, {
    'content/docs/live.mdx': PAGE + '## Section\n',
    'content/docs/glossary.mdx': PAGE + '<ReferenceList collection="glossary" />\n',
    'content/glossary/term.mdx': [
      '---',
      'id: term',
      "title: 'Term'",
      '---',
      '',
      'See [live](/live#section), [other](/glossary#other-term),',
      '[dead](/gone) and [bad anchor](/live#no-such-heading).',
    ].join('\n'),
    'content/glossary/other-term.mdx': "---\nid: other-term\ntitle: 'Other'\n---\n\nBody.\n",
  });
  const index = buildIndex(root);
  assert.deepEqual(
    findBrokenLinks(index).map((b) => `${b.rel}:${b.line} ${b.url}`),
    ['content/glossary/term.mdx:7 /gone'],
  );
  // `/glossary#other-term` resolves: the ReferenceList renders one section per entry id.
  assert.deepEqual(
    (await findBrokenAnchors(index)).map((b) => `${b.rel}:${b.line} ${b.url} ${b.page}`),
    ['content/glossary/term.mdx:7 /live#no-such-heading undefined'],
  );
});

test('a missing include is reported with its line, and every other broken link still is', (t) => {
  const root = treeFixture(t, {
    'content/docs/live.mdx': PAGE + '## Section\n',
    'content/docs/page.mdx':
      PAGE +
      [
        '<include cwd>content/partials/_does-not-exist.mdx</include>',
        '',
        '[dead](/does-not-exist) and [anchor](/live#no-such-heading)',
      ].join('\n'),
    'content/docs/other.mdx': PAGE + '<include cwd>content/partials/_outer.mdx</include>\n',
    'content/partials/_outer.mdx': 'Intro.\n\n<include>./_inner-missing.mdx</include>\n',
  });
  const run = spawnSync(process.execPath, [CHECK_LINKS], { cwd: root, encoding: 'utf8' });
  assert.equal(run.status, 1, run.stdout + run.stderr);
  const lines = run.stderr.split('\n').map((l) => l.trim());
  assert.ok(
    lines.includes(
      'content/docs/page.mdx:6: include target not found: content/partials/_does-not-exist.mdx',
    ),
    run.stderr,
  );
  assert.ok(
    lines.includes('content/partials/_outer.mdx:3: include target not found: ./_inner-missing.mdx'),
    run.stderr,
  );
  assert.ok(lines.includes('content/docs/page.mdx:8  ->  /does-not-exist'), run.stderr);
  // The page that holds the missing include cannot compile, so its own fragments go unchecked;
  // `findMissingIncludes` is what tells the writer why. Other pages are still compiled.
  assert.doesNotMatch(run.stderr, /Cannot validate anchors/);
});

test('findMissingIncludes ignores includes in code and a #section suffix on a real file', (t) => {
  const root = treeFixture(t, {
    'content/docs/page.mdx':
      PAGE +
      [
        '<include cwd>content/partials/_real.mdx#part</include>',
        '',
        '```mdx',
        '<include cwd>content/partials/_example.mdx</include>',
        '```',
      ].join('\n'),
    'content/partials/_real.mdx': '<section id="part">Part.</section>\n',
  });
  assert.deepEqual(findMissingIncludes(buildIndex(root)), []);
});
