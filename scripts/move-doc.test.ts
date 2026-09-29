/**
 * End-to-end tests for `move-doc.ts`: run the real CLI against a throwaway fixture repo and check
 * the files it leaves on disk.
 */
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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
  { source: '/docs/example/older-name', destination: '/docs/example/old-name', permanent: true },
  // AUTO-GENERATED REDIRECTS END

  // Legacy docs.arbitrum.io URLs
  { source: '/legacy/old-name', destination: '/docs/example/old-name', permanent: false },
  {
    source: '/legacy/anchored',
    destination: '/docs/example/old-name#a-section',
    permanent: false,
  },
  { source: '/legacy/unrelated', destination: '/docs/example/unrelated', permanent: false },
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

test('move-doc moves the file and appends one redirect, leaving other entries as written', (t) => {
  const { root, redirectsPath, fromRel, toRel } = fixtureRepo();
  t.after(() => rmSync(root, { recursive: true, force: true }));

  execFileSync('node', [MOVE_DOC, fromRel, toRel], { cwd: root, encoding: 'utf8' });
  const after = readFileSync(redirectsPath, 'utf8');

  assert.match(after, entry('/docs/example/old-name', '/docs/example/new-name'));
  assert.match(after, entry('/docs/example/older-name', '/docs/example/old-name'));
  assert.match(after, entry('/legacy/old-name', '/docs/example/old-name'));
  assert.ok(
    after.indexOf("source: '/docs/example/old-name'") <
      after.indexOf('AUTO-GENERATED REDIRECTS END'),
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
    /redirect: \{ source: '\/docs\/example\/old-name', destination: '\/docs\/example\/new-name'/,
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
    after.includes(`destination: "/docs/example/it's-$&-new"`),
    `the destination is one string literal, with $& kept literally:\n${after}`,
  );
  assert.match(after, entry('/docs/example/older-name', '/docs/example/old-name'));
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
  const inboundPlaceholder = '[Old](/docs/{var:nitroRepositorySlug}/old-name)';
  writeFileSync(
    linkerAbs,
    PAGE_FRONTMATTER.replace('Old name', 'Linker') +
      `${inboundPlaceholder}\n\nAnd plainly: [Old](/docs/${segment}/old-name)\n`,
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
  assert.match(run.stderr, /linker\.mdx: \/docs\/\{var:nitroRepositorySlug\}\/old-name/);
  const linker = readFileSync(linkerAbs, 'utf8');
  assert.ok(
    linker.includes(inboundPlaceholder),
    'inbound placeholder link left exactly as written',
  );
  assert.ok(linker.includes('[Old](/docs/other/new-name)'), 'plain inbound link rewritten');
  assert.ok(
    !linker.includes(`/docs/${segment}/old-name)`),
    'no plain link still names the old page',
  );

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
