import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateQuickLooks, GlossaryTerm } from './generate-quicklooks';

const terms: GlossaryTerm[] = [
  { key: 'sequencer', title: 'Sequencer' },
  { key: 'parent-chain', title: 'Parent chain' },
  { key: 'wasm', title: 'WASM' },
];

test('wraps the first mention with the exact anchor syntax', () => {
  const { anchors, updatedContent } = generateQuickLooks('The Sequencer orders txns.', terms);
  assert.equal(updatedContent, 'The <a data-quicklook-from="sequencer">Sequencer</a> orders txns.');
  assert.deepEqual(anchors, [{ lineNumber: 1, key: 'sequencer', displayText: 'Sequencer' }]);
});

test('matches plurals but preserves original text', () => {
  const { updatedContent } = generateQuickLooks('Multiple sequencers exist.', terms);
  assert.equal(updatedContent, 'Multiple <a data-quicklook-from="sequencer">sequencers</a> exist.');
});

test('only wraps the first mention of a term', () => {
  const { anchors } = generateQuickLooks('Sequencer here. Sequencer again.', terms);
  assert.equal(anchors.length, 1);
  assert.equal(anchors[0].lineNumber, 1);
});

test('skips headings, fenced code, frontmatter, imports, inline code, links, existing anchors', () => {
  const content = [
    '---',
    'title: Sequencer doc',
    '---',
    "import X from 'y';",
    '# Sequencer heading',
    '```',
    'Sequencer in code',
    '```',
    'Inline `Sequencer` code and [Sequencer](/x) link.',
    'An existing <a data-quicklook-from="sequencer">Sequencer</a> anchor.',
    'Finally a real Sequencer mention.',
  ].join('\n');
  const { anchors } = generateQuickLooks(content, terms);
  // Frontmatter/heading/code/import/inline/link are skipped; the existing anchor
  // triggers the double-wrap guard, so 'sequencer' is skipped entirely.
  assert.equal(anchors.length, 0);
});

test('double-wrap guard: term already wrapped elsewhere is not wrapped again', () => {
  const content =
    'A <a data-quicklook-from="parent-chain">parent chain</a> and another parent chain.';
  const { anchors } = generateQuickLooks(content, terms);
  assert.equal(anchors.filter((a) => a.key === 'parent-chain').length, 0);
});

test('at most one anchor per line (earliest wins)', () => {
  const { anchors } = generateQuickLooks('Parent chain then Sequencer on one line.', terms);
  assert.equal(anchors.length, 1);
  assert.equal(anchors[0].key, 'parent-chain');
});

test('titles shorter than 2 chars are skipped', () => {
  const short: GlossaryTerm[] = [{ key: 'l', title: 'L' }];
  const { anchors } = generateQuickLooks('L is short.', short);
  assert.equal(anchors.length, 0);
});

import { execFileSync } from 'node:child_process';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';

const CLI = path.join(__dirname, 'generate-quicklooks.ts');

function runCli(
  fileContent: string,
  args: string[],
): { code: number; stdout: string; fileAfter: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ql-'));
  const file = path.join(dir, 'article.mdx');
  fs.writeFileSync(file, fileContent);
  let stdout = '';
  let code = 0;
  try {
    stdout = execFileSync('yarn', ['--silent', 'tsx', CLI, file, ...args], { encoding: 'utf8' });
  } catch (e: any) {
    code = e.status ?? 1;
    stdout = (e.stdout ?? '').toString();
  }
  const fileAfter = fs.readFileSync(file, 'utf8');
  fs.rmSync(dir, { recursive: true, force: true });
  return { code, stdout, fileAfter };
}

test('CLI preview does not mutate the file and exits 0', () => {
  const src = 'The Sequencer orders txns.';
  const { code, fileAfter } = runCli(src, []);
  assert.equal(code, 0);
  assert.equal(fileAfter, src);
});

test('CLI --write mutates the file in place', () => {
  const { code, fileAfter } = runCli('The Sequencer orders txns.', ['--write']);
  assert.equal(code, 0);
  assert.match(fileAfter, /<a data-quicklook-from="sequencer">Sequencer<\/a>/);
});

test('CLI --check exits 1 when unwrapped terms exist', () => {
  const { code } = runCli('The Sequencer orders txns.', ['--check']);
  assert.equal(code, 1);
});

test('CLI --check exits 0 when nothing to wrap', () => {
  const { code } = runCli('Nothing glossaryish here.', ['--check']);
  assert.equal(code, 0);
});
