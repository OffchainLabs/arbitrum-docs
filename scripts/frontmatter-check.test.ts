/** Runs `frontmatter-check.ts` against a throwaway tree and checks what it reports. */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { type TestContext, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'frontmatter-check.ts');

function run(t: TestContext, pages: Record<string, string>) {
  const root = mkdtempSync(path.join(tmpdir(), 'frontmatter-check-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [rel, content] of Object.entries(pages)) {
    const abs = path.join(root, 'content', 'docs', rel);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, content);
  }
  return spawnSync(process.execPath, [SCRIPT], { cwd: root, encoding: 'utf8' });
}

const GOOD = "---\ntitle: 'Good'\ndescription: 'A page.'\ncontent_type: how-to\n---\n\nBody.\n";

test('a page that matches the schema passes', (t) => {
  const result = run(t, { 'good.mdx': GOOD });
  assert.equal(result.status, 0, result.stderr);
});

test('each broken field is reported as path: field: message, and the run fails', (t) => {
  const result = run(t, {
    'good.mdx': GOOD,
    'section/bad.mdx': "---\ntitle: 'Bad'\ncontent_type: howto\n---\n\nBody.\n",
    'empty.mdx': "---\ntitle: '  '\ndescription: ''\n---\n",
    'none.mdx': 'No frontmatter at all.\n',
  });
  assert.equal(result.status, 1);
  const lines = result.stderr.split('\n').map((l) => l.trim());
  for (const [file, field] of [
    ['content/docs/section/bad.mdx', 'description'],
    ['content/docs/section/bad.mdx', 'content_type'],
    ['content/docs/empty.mdx', 'title'],
    ['content/docs/empty.mdx', 'description'],
    ['content/docs/none.mdx', 'title'],
    ['content/docs/none.mdx', 'description'],
  ]) {
    assert.ok(
      lines.some((l) => l.startsWith(`${file}: ${field}: `)),
      `${file}: ${field}\n${result.stderr}`,
    );
  }
  assert.doesNotMatch(result.stderr, /good\.mdx/);
});
