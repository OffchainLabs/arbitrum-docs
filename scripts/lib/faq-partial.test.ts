/**
 * The partial builder and the generator's write/check paths. The generator runs against a
 * temporary root so the test never touches the committed partials.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';

import { FAQ_MARKER, buildPartial, generateFaq, readSnapshot } from './faq-partial.ts';
import type { FaqSnapshot } from './faq-snapshot.ts';
import { StaleFileError } from './generated-partial.ts';

const snapshot: FaqSnapshot = {
  source: 'https://www.notion.so/db',
  items: [
    { id: 'a', question: 'First?', answer: 'One.' },
    { id: 'b', question: 'Second?', answer: '- x\n- y' },
  ],
};

describe('buildPartial', () => {
  it('opens with the marker and renders each item as a level-3 heading', () => {
    assert.equal(
      buildPartial(snapshot),
      `${FAQ_MARKER}\n\n### First?\n\nOne.\n\n### Second?\n\n- x\n- y\n`,
    );
  });

  it('escapes MDX-significant characters in the question', () => {
    const s: FaqSnapshot = {
      source: '',
      items: [{ id: 'a', question: 'Use <x> or {y}?', answer: 'z' }],
    };
    assert.match(buildPartial(s), /### Use \\<x> or \\{y\\}\?/);
  });
});

describe('generateFaq', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'faq-gen-'));
  after(() => fs.rmSync(root, { recursive: true, force: true }));
  const pages = [
    { key: 'nodes', notionSlug: 'troubleshooting-running-nodes', page: 'run-a-node/faq' },
  ] as const;

  it('writes the partial from the snapshot, then reports it current in check mode', async () => {
    fs.mkdirSync(path.join(root, 'content/faq'), { recursive: true });
    fs.writeFileSync(path.join(root, 'content/faq/nodes.json'), JSON.stringify(snapshot));
    await generateFaq({ check: false, root, pages });
    const written = fs.readFileSync(
      path.join(root, 'content/partials/_troubleshooting-nodes-partial.mdx'),
      'utf8',
    );
    assert.ok(written.startsWith(FAQ_MARKER));
    await generateFaq({ check: true, root, pages });
  });

  it('fails check mode when the partial was edited by hand', async () => {
    fs.appendFileSync(
      path.join(root, 'content/partials/_troubleshooting-nodes-partial.mdx'),
      '\nhand edit\n',
    );
    await assert.rejects(generateFaq({ check: true, root, pages }), StaleFileError);
  });

  it('names the fetch command when a snapshot is missing', async () => {
    const other = [{ key: 'stylus', notionSlug: 's', page: 'p' }] as const;
    await assert.rejects(generateFaq({ check: false, root, pages: other }), /pnpm faq:fetch/);
  });

  it('readSnapshot rejects a file without items', () => {
    const bad = path.join(root, 'bad.json');
    fs.writeFileSync(bad, '{"source":"x"}');
    assert.throws(() => readSnapshot(bad), /items/);
  });
});
