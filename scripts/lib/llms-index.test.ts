import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { LLMS_SUMMARY, formatLlmsIndex } from '../../lib/llms-index.ts';

const raw = [
  '# Documentation',
  '',
  '- [Arbitrum docs](/): Documentation for Arbitrum chains.',
  '- Get started: Quickstarts.',
  '  - [Get started](/get-started): Find quickstarts.',
  '  - [MPP](/build-decentralized-apps/machine-payments-protocol#setup): Payments.',
  '- Build apps: Apps.',
  '  - [MPP](/build-decentralized-apps/machine-payments-protocol): Payments.',
  '  - [External](https://example.com/docs/x): Not ours.',
].join('\n');

test('the index opens with master title and summary', () => {
  const [title, blank, summary, blank2] = formatLlmsIndex(raw).split('\n');
  assert.equal(title, '# Arbitrum Documentation');
  assert.equal(summary, `> ${LLMS_SUMMARY}`);
  assert.equal(blank + blank2, '');
});

test('the summary is the line master published', () => {
  const master =
    '> Official documentation for the Arbitrum ecosystem: building apps, bridging tokens, running nodes, launching Arbitrum chains, and developing with Stylus.';
  assert.equal(`> ${LLMS_SUMMARY}`, master);
});

test('pages link their markdown mirror and appear once', () => {
  const out = formatLlmsIndex(raw);
  assert.match(out, /- \[Arbitrum docs\]\(\/index\.md\): Documentation/);
  assert.match(out, /- \[Get started\]\(\/get-started\.md\)/);
  assert.equal(out.match(/machine-payments-protocol\.md/g)?.length, 1);
  assert.doesNotMatch(out, /#setup/);
  assert.match(out, /\(https:\/\/example\.com\/docs\/x\)/);
  assert.match(out, /^- Build apps: Apps\.$/m);
});

test('the route uses the formatter', () => {
  const route = readFileSync(new URL('../../app/llms.txt/route.ts', import.meta.url), 'utf8');
  assert.match(route, /formatLlmsIndex\(/);
});
