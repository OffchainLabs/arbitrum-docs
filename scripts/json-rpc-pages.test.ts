/**
 * A JSON-RPC method page shows its description in the body, where `<Term>` tags render. The
 * frontmatter keeps a plain copy for metadata, search and link previews.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const DIR = 'content/docs/json-rpc-spike';
const doc = JSON.parse(readFileSync('content/openapi/arbitrum-json-rpc.json', 'utf8'));
const operations = Object.values<{ post: { operationId: string; description: string } }>(
  doc.paths,
).map(({ post }) => post);

for (const { operationId, description } of operations) {
  test(`${operationId}: description in the body, plain text in the frontmatter`, () => {
    const page = readFileSync(`${DIR}/${operationId}.mdx`, 'utf8');
    const [, frontmatter = '', body = ''] = page.split(/^---$/m);
    assert.ok(body.includes(description), 'stale page: run node scripts/generate-openapi-spike.ts');
    assert.doesNotMatch(frontmatter, /<Term/);
  });
}

test('at least one method description links a glossary term', () => {
  assert.ok(operations.some(({ description }) => description.includes('<Term id="')));
});
