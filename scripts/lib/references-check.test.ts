/**
 * Runs `scripts/references-check.ts` against throwaway trees. The script reads `process.cwd()` and
 * exports nothing, so each case is a fixture repo and a child process. R3 (no `<Term>` in a
 * partial) is being relaxed separately and is not asserted here.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { type TestContext, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'references-check.ts',
);

function run(t: TestContext, files: Record<string, string>) {
  const root = mkdtempSync(path.join(tmpdir(), 'references-check-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    writeFileSync(path.join(root, rel), content);
  }
  return spawnSync(process.execPath, [SCRIPT], { cwd: root, encoding: 'utf8' });
}

const entry = (id: string): string => `---\nid: ${id}\ntitle: '${id}'\n---\n\nDefinition.\n`;
const PAGE = '---\ntitle: Page\ndescription: A page.\n---\n\n';

test('terms that resolve pass', (t) => {
  const result = run(t, {
    'content/glossary/gas.mdx': entry('gas'),
    'content/docs/page.mdx': PAGE + 'Pay <Term id="gas">gas</Term>.\n',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /passed \(1 glossary\)/);
});

test('R1: a <Term id> with no glossary entry fails and names the file and id', (t) => {
  const result = run(t, {
    'content/glossary/gas.mdx': entry('gas'),
    'content/docs/page.mdx': PAGE + 'Pay <Term id="no-such-term">x</Term>.\n',
  });
  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /R1 content\/docs\/page\.mdx: no "glossary" entry for id "no-such-term"/,
  );
});

test('R1: a glossary entry with no id fails', (t) => {
  const result = run(t, { 'content/glossary/nameless.mdx': "---\ntitle: 'x'\n---\n" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /R1 content\/glossary\/nameless\.mdx: reference entry missing `id`/);
});

test('R4: two entries with one id fail and name both files', (t) => {
  const result = run(t, {
    'content/glossary/gas.mdx': entry('gas'),
    'content/glossary/gas-again.mdx': entry('gas'),
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /R4 duplicate id "gas" in content\/glossary/);
  assert.match(result.stderr, /gas-again\.mdx/);
});
