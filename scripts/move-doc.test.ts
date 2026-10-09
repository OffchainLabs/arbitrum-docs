/**
 * End-to-end tests for `move-doc.ts`: run the real CLI against a throwaway fixture repo and check
 * the files it leaves on disk.
 */
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { readVars } from '../lib/var-links.ts';

const MOVE_DOC = path.join(path.dirname(fileURLToPath(import.meta.url)), 'move-doc.ts');

/** A regex for one redirect entry, tolerant of Prettier wrapping it onto several lines. */
const entry = (source: string, destination: string): RegExp =>
  new RegExp(`source: '${source}',\\s*destination: '${destination}'`);

const PAGE_FRONTMATTER = [
  '---',
  "title: 'Old name'",
  "description: 'A fixture page.'",
  "content_type: 'concept'",
  "author: 'test'",
  "sme: 'test'",
  '---',
  '',
  'Body text.',
  '',
].join('\n');

const REDIRECTS_FIXTURE = `export const redirects = [
  // AUTO-GENERATED REDIRECTS START
  { source: '/example/older-name', destination: '/example/old-name', permanent: true },
  // AUTO-GENERATED REDIRECTS END

  // Legacy docs.arbitrum.io URLs
  { source: '/legacy/old-name', destination: '/example/old-name', permanent: false },
  {
    source: '/legacy/anchored',
    destination: '/example/old-name#a-section',
    permanent: false,
  },
  { source: '/legacy/unrelated', destination: '/example/unrelated', permanent: false },
];
`;

/** A throwaway repo with a docs tree and a `redirects.config.ts` in which an earlier move's entry
 * and two legacy entries point at the page under test. */
function fixtureRepo(): { root: string; redirectsPath: string; fromRel: string; toRel: string } {
  const root = mkdtempSync(path.join(tmpdir(), 'move-doc-e2e-'));
  // move-doc formats redirects.config.ts with the Prettier config it resolves from the file's location.
  writeFileSync(
    path.join(root, '.prettierrc.json'),
    '{"singleQuote": true, "trailingComma": "all", "printWidth": 100}',
  );
  const docsDir = path.join(root, 'content', 'docs', 'example');
  mkdirSync(docsDir, { recursive: true });
  writeFileSync(path.join(docsDir, 'old-name.mdx'), PAGE_FRONTMATTER);
  writeFileSync(
    path.join(docsDir, 'unrelated.mdx'),
    PAGE_FRONTMATTER.replace('Old name', 'Unrelated'),
  );
  writeFileSync(path.join(root, 'redirects.config.ts'), REDIRECTS_FIXTURE);

  return {
    root,
    redirectsPath: path.join(root, 'redirects.config.ts'),
    fromRel: 'content/docs/example/old-name.mdx',
    toRel: 'content/docs/example/new-name.mdx',
  };
}

for (const target of [
  'source',
  'destination directory',
  'dangling destination',
  'linked page',
  'source meta',
  'destination meta',
  'redirects',
] as const) {
  test(`move-doc rejects a symlink at ${target} before changing any files`, (t) => {
    const { root, redirectsPath, fromRel } = fixtureRepo();
    const outside = mkdtempSync(path.join(tmpdir(), 'move-doc-outside-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    t.after(() => rmSync(outside, { recursive: true, force: true }));
    const source = path.join(root, fromRel);
    const sourceMeta = path.join(path.dirname(source), 'meta.json');
    const destinationDir = path.join(root, 'content/docs/other');
    const destination = path.join(destinationDir, 'new-name.mdx');
    const destinationMeta = path.join(destinationDir, 'meta.json');
    const linker = path.join(root, 'content/docs/example/linker.mdx');
    mkdirSync(destinationDir);
    writeFileSync(sourceMeta, JSON.stringify({ pages: ['old-name', 'linker'] }));
    writeFileSync(destinationMeta, JSON.stringify({ pages: [] }));
    writeFileSync(linker, PAGE_FRONTMATTER + '\n[Old](/example/old-name)\n');
    const outsideFile = path.join(outside, 'outside.txt');

    if (target === 'destination directory') {
      rmSync(destinationDir, { recursive: true });
      symlinkSync(outside, destinationDir);
      writeFileSync(outsideFile, 'outside directory sentinel');
    } else if (target === 'dangling destination') {
      symlinkSync(path.join(outside, 'missing.mdx'), destination);
      writeFileSync(outsideFile, 'dangling destination sentinel');
    } else {
      const linked = {
        'source': source,
        'linked page': linker,
        'source meta': sourceMeta,
        'destination meta': destinationMeta,
        'redirects': redirectsPath,
      }[target]!;
      writeFileSync(outsideFile, readFileSync(linked));
      unlinkSync(linked);
      symlinkSync(outsideFile, linked);
    }

    const tracked = [source, linker, sourceMeta, destinationMeta, redirectsPath, outsideFile]
      .filter((file) => existsSync(file))
      .map((file) => ({ file, before: readFileSync(file, 'utf8') }));
    const run = spawnSync(
      process.execPath,
      [MOVE_DOC, fromRel, 'content/docs/other/new-name.mdx'],
      { cwd: root, encoding: 'utf8' },
    );
    assert.equal(run.status, 1, run.stderr);
    assert.match(run.stderr, /refusing symlink in repository path/);
    for (const { file, before } of tracked) {
      assert.equal(readFileSync(file, 'utf8'), before, `${file} must remain unchanged`);
    }
    assert.ok(existsSync(source), 'source must not move');
    assert.ok(!existsSync(destination), 'no destination file may be created');
    assert.ok(!existsSync(path.join(outside, 'missing.mdx')));
    assert.ok(!existsSync(path.join(outside, 'new-name.mdx')));
  });
}

test('move-doc moves the file and appends one redirect, leaving other entries as written', (t) => {
  const { root, redirectsPath, fromRel, toRel } = fixtureRepo();
  t.after(() => rmSync(root, { recursive: true, force: true }));

  execFileSync('node', [MOVE_DOC, fromRel, toRel], { cwd: root, encoding: 'utf8' });
  const after = readFileSync(redirectsPath, 'utf8');

  assert.match(after, entry('/example/old-name', '/example/new-name'));
  assert.match(after, entry('/example/older-name', '/example/old-name'));
  assert.match(after, entry('/legacy/old-name', '/example/old-name'));
  assert.ok(
    after.indexOf("source: '/example/old-name'") < after.indexOf('AUTO-GENERATED REDIRECTS END'),
    'the new entry lands inside the AUTO-GENERATED block',
  );
  assert.ok(existsSync(path.join(root, toRel)) && !existsSync(path.join(root, fromRel)));
});

test('move-doc --dry-run reports the redirect without writing it', (t) => {
  const { root, redirectsPath, fromRel, toRel } = fixtureRepo();
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const before = readFileSync(redirectsPath, 'utf8');
  const output = execFileSync('node', [MOVE_DOC, fromRel, toRel, '--dry-run'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(readFileSync(redirectsPath, 'utf8'), before, 'dry-run must not write');
  assert.ok(existsSync(path.join(root, fromRel)), 'dry-run must not move');
  assert.match(
    output,
    /redirect: \{ source: '\/example\/old-name', destination: '\/example\/new-name'/,
  );
});

test('move-doc writes a quote or dollar sequence in a file name as a string, not as code', (t) => {
  // Review 09.15: the entry was built by pasting the path between single quotes, so a `'` ended
  // the string and left the rest of the name as TypeScript in redirects.config.ts.
  const { root, redirectsPath, fromRel } = fixtureRepo();
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const toRel = "content/docs/example/it's-$&-new.mdx";
  execFileSync('node', [MOVE_DOC, fromRel, toRel], { cwd: root, encoding: 'utf8' });
  const after = readFileSync(redirectsPath, 'utf8');

  assert.ok(
    after.includes(`destination: "/example/it's-$&-new"`),
    `the destination is one string literal, with $& kept literally:\n${after}`,
  );
  assert.match(after, entry('/example/older-name', '/example/old-name'));
});

// --- `{var:name}` placeholder links ------------------------------------------------------------------

test('move-doc warns about a placeholder link to the moved page and never rewrites one', (t) => {
  const { root } = fixtureRepo();
  t.after(() => rmSync(root, { recursive: true, force: true }));

  // `readVars()` reads the real repo's vars.json, so the fixture borrows a real key whose value is a
  // path segment and derives every path from it, the way the check-links fixture does, so a change
  // to the value cannot break this test in a way that points nowhere.
  const segment = String(readVars().nitroRepositorySlug);
  const fromDir = path.join(root, 'content', 'docs', segment);
  mkdirSync(fromDir, { recursive: true });
  mkdirSync(path.join(root, 'content', 'docs', 'other'), { recursive: true });

  // Outbound: the moved page carries its own relative links, one through a placeholder and one
  // plain, both to a sibling that stays behind. Only the plain one may be re-based after the move.
  const outboundPlaceholder = `[Sibling](./{var:nitroRepositorySlug}-sibling.mdx)`;
  writeFileSync(path.join(fromDir, `${segment}-sibling.mdx`), PAGE_FRONTMATTER);
  writeFileSync(
    path.join(fromDir, 'old-name.mdx'),
    PAGE_FRONTMATTER +
      `${outboundPlaceholder}\n\nAnd plainly: [Sibling](./${segment}-sibling.mdx)\n`,
  );

  // Inbound: another page links to the moved page, once through a placeholder and once plainly.
  const linkerAbs = path.join(root, 'content', 'docs', 'example', 'linker.mdx');
  const inboundPlaceholder = '[Old](/{var:nitroRepositorySlug}/old-name)';
  writeFileSync(
    linkerAbs,
    PAGE_FRONTMATTER.replace('Old name', 'Linker') +
      `${inboundPlaceholder}\n\nAnd plainly: [Old](/${segment}/old-name)\n`,
  );

  const toRel = 'content/docs/other/new-name.mdx';
  const run = spawnSync('node', [MOVE_DOC, `content/docs/${segment}/old-name.mdx`, toRel], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(run.status, 0, run.stderr);

  // Inbound: the placeholder resolves to the moved page, so it is reported with the other links that
  // cannot be auto-rewritten, under the form the writer typed rather than an "(expression)" fallback.
  assert.match(run.stderr, /1 reference\(s\) resolve to the move but can't be auto-rewritten/);
  assert.match(run.stderr, /linker\.mdx: \/\{var:nitroRepositorySlug\}\/old-name/);
  const linker = readFileSync(linkerAbs, 'utf8');
  assert.ok(
    linker.includes(inboundPlaceholder),
    'inbound placeholder link left exactly as written',
  );
  assert.ok(linker.includes('[Old](/other/new-name)'), 'plain inbound link rewritten');
  assert.ok(!linker.includes(`/${segment}/old-name)`), 'no plain link still names the old page');

  // Outbound: re-basing the placeholder link would write the variable's current value into the file.
  const moved = readFileSync(path.join(root, toRel), 'utf8');
  assert.ok(
    moved.includes(outboundPlaceholder),
    'outbound placeholder link left exactly as written',
  );
  assert.ok(
    moved.includes(`[Sibling](../${segment}/${segment}-sibling.mdx)`),
    'plain outbound link re-based from the new directory',
  );
});

// --- meta.json, git, redirect chaining and the URL hint ---------------------------------------------

const readJson = (file: string): unknown => JSON.parse(readFileSync(file, 'utf8'));

/** `git init` a fixture and commit everything, so move-doc takes its `git mv` path. */
function gitInit(root: string): void {
  const git = (...args: string[]) =>
    execFileSync(
      'git',
      ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', ...args],
      { cwd: root },
    );
  git('init', '-q');
  git('add', '-A');
  git('commit', '-q', '-m', 'fixture');
}

test('a rename in place replaces the basename in meta.json and stages a git rename', (t) => {
  const { root, fromRel, toRel } = fixtureRepo();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const meta = path.join(root, 'content', 'docs', 'example', 'meta.json');
  writeFileSync(meta, JSON.stringify({ title: 'Example', pages: ['unrelated', 'old-name'] }));
  gitInit(root);

  const run = spawnSync('node', [MOVE_DOC, fromRel, toRel], { cwd: root, encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(readJson(meta), { title: 'Example', pages: ['unrelated', 'new-name'] });
  const status = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
  assert.match(
    status,
    /^R {2}content\/docs\/example\/old-name\.mdx -> content\/docs\/example\/new-name\.mdx$/m,
  );
  assert.doesNotMatch(run.stderr, /moved without git/);
});

test('a cross-directory move removes the page from one meta.json and appends it to the other', (t) => {
  const { root, fromRel } = fixtureRepo();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const srcMeta = path.join(root, 'content', 'docs', 'example', 'meta.json');
  const dstMeta = path.join(root, 'content', 'docs', 'other', 'meta.json');
  mkdirSync(path.dirname(dstMeta), { recursive: true });
  writeFileSync(srcMeta, JSON.stringify({ pages: ['old-name', 'unrelated'] }));
  writeFileSync(dstMeta, JSON.stringify({ pages: ['first'] }));
  writeFileSync(path.join(root, 'content', 'docs', 'other', 'first.mdx'), PAGE_FRONTMATTER);

  const run = spawnSync('node', [MOVE_DOC, fromRel, 'content/docs/other/moved.mdx'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(readJson(srcMeta), { pages: ['unrelated'] });
  assert.deepEqual(readJson(dstMeta), { pages: ['first', 'moved'] });
});

test('a move into a directory whose meta.json ends in "..." leaves that meta.json alone', (t) => {
  const { root, fromRel } = fixtureRepo();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const dstMeta = path.join(root, 'content', 'docs', 'rest', 'meta.json');
  mkdirSync(path.dirname(dstMeta), { recursive: true });
  const before = JSON.stringify({ pages: ['first', '...'] });
  writeFileSync(dstMeta, before);

  const run = spawnSync('node', [MOVE_DOC, fromRel, 'content/docs/rest/moved.mdx'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(readFileSync(dstMeta, 'utf8'), before);
  assert.match(run.stdout, /dest dir uses '\.\.\.' rest-glob; 'moved' auto-included/);
});

test('--dry-run names every existing redirect that would chain through the new one', (t) => {
  const { root, fromRel, toRel } = fixtureRepo();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const run = spawnSync('node', [MOVE_DOC, fromRel, toRel, '--dry-run'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stderr, /3 existing redirect\(s\) point at \/example\/old-name/);
  for (const source of ['/example/older-name', '/legacy/old-name', '/legacy/anchored']) {
    assert.ok(run.stderr.includes(`    ${source} -> /example/old-name`), source);
  }
  assert.ok(!run.stderr.includes('/legacy/unrelated'));
});

test('a site URL passed as a path gets a hint naming the file it is served from', (t) => {
  const { root } = fixtureRepo();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const run = spawnSync(
    'node',
    [MOVE_DOC, '/example/old-name', 'content/docs/example/new-name.mdx', '--dry-run'],
    { cwd: root, encoding: 'utf8' },
  );
  assert.equal(run.status, 1);
  assert.match(run.stderr, /e\.g\. 'content\/docs\/example\/old-name\.mdx'/);
});

test('a root-absolute link in a partial or glossary entry is rewritten by the move', (t) => {
  const { root, fromRel, toRel } = fixtureRepo();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const partial = path.join(root, 'content', 'partials', '_note.mdx');
  const entry = path.join(root, 'content', 'glossary', 'term.mdx');
  mkdirSync(path.dirname(partial), { recursive: true });
  mkdirSync(path.dirname(entry), { recursive: true });
  writeFileSync(partial, 'See [it](/example/old-name#a-section).\n');
  writeFileSync(entry, "---\nid: term\ntitle: 'Term'\n---\n\nSee [it](/example/old-name).\n");

  const run = spawnSync('node', [MOVE_DOC, fromRel, toRel], { cwd: root, encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(readFileSync(partial, 'utf8'), 'See [it](/example/new-name#a-section).\n');
  assert.match(readFileSync(entry, 'utf8'), /\[it\]\(\/example\/new-name\)/);
});
