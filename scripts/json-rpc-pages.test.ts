/**
 * A JSON-RPC method page shows its description in the body, where `<Term>` tags render, and the
 * Nitro release the reference was generated from. The frontmatter keeps a plain copy of the
 * description for metadata, search and link previews. The folder's `meta.json` groups the
 * methods by namespace.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const DIR = 'content/docs/json-rpc-spike';
const STALE = 'stale page: run node scripts/generate-openapi-spike.ts';
const doc = JSON.parse(readFileSync('content/openapi/arbitrum-json-rpc.json', 'utf8'));
const operations = Object.values<{ post: { operationId: string; description: string } }>(
  doc.paths,
).map(({ post }) => post);
const { nitroVersionTag } = JSON.parse(readFileSync('content/vars.json', 'utf8'));

for (const { operationId, description } of operations) {
  test(`${operationId}: description in the body, plain text in the frontmatter`, () => {
    const page = readFileSync(`${DIR}/${operationId}.mdx`, 'utf8');
    const [, frontmatter = '', body = ''] = page.split(/^---$/m);
    assert.ok(body.includes(description), STALE);
    assert.doesNotMatch(frontmatter, /<Term/);
  });

  test(`${operationId}: names the Nitro release it was generated from`, () => {
    const page = readFileSync(`${DIR}/${operationId}.mdx`, 'utf8');
    assert.ok(page.includes(`\nGenerated from Nitro ${nitroVersionTag}.\n`), STALE);
  });
}

test('meta.json lists every method under its namespace, in document order', () => {
  const meta = JSON.parse(readFileSync(`${DIR}/meta.json`, 'utf8'));
  const groups = new Map<string, string[]>();
  for (const { operationId } of operations) {
    const namespace = operationId.slice(0, operationId.indexOf('_') + 1);
    groups.set(namespace, [...(groups.get(namespace) ?? []), operationId]);
  }
  const pages = [...groups].flatMap(([namespace, ids]) => [`---${namespace}---`, ...ids]);
  assert.equal(meta.root, true, 'the folder is its own sidebar section');
  assert.deepEqual(meta.pages, pages, STALE);
});

test('at least one method description links a glossary term', () => {
  assert.ok(operations.some(({ description }) => description.includes('<Term id="')));
});
