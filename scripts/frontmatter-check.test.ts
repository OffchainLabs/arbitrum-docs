/** Runs `frontmatter-check.ts` against a throwaway tree and checks what it reports. */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { type TestContext, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { arbitrumPageSchema } from '../lib/page-schema.ts';

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

test('audience and reader goals survive parsing and remain optional', () => {
  const required = { title: 'Rotate keys', description: 'Keep node keys secure.' };
  const metadata = {
    target_audience: 'Chain operators',
    user_story: 'As a chain operator, I want to rotate node keys so I can keep my chain secure.',
  };
  assert.deepEqual(arbitrumPageSchema.parse({ ...required, ...metadata }), {
    ...required,
    ...metadata,
  });
  assert.equal(arbitrumPageSchema.safeParse(required).success, true);
});

test('the frontmatter gate rejects non-string authoring metadata', (t) => {
  const result = run(t, {
    'audience.mdx': GOOD.replace('content_type: how-to', 'target_audience: [operators]'),
    'goal.mdx': GOOD.replace('content_type: how-to', 'user_story: false'),
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /content\/docs\/audience\.mdx: target_audience:/);
  assert.match(result.stderr, /content\/docs\/goal\.mdx: user_story:/);
});

test('user_story is optional and survives schema parsing', () => {
  const metadata = { title: 'Good', description: 'A page.' };
  assert.ok(arbitrumPageSchema.safeParse(metadata).success);
  const user_story = 'As a developer, I want to deploy my first Stylus contract';
  assert.equal(arbitrumPageSchema.parse({ ...metadata, user_story }).user_story, user_story);
});

test('user_story must be a string when present', (t) => {
  const result = run(t, {
    'bad.mdx': GOOD.replace('content_type: how-to', 'user_story: 123'),
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /content\/docs\/bad\.mdx: user_story:/);
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
