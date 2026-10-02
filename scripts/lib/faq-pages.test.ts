/**
 * The FAQ page mapping is the single place Notion slugs meet page paths. These tests pin the
 * invariants the fetch, the generator and the JSON-LD renderer all rely on.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { faqPages, partialPathFor, snapshotPathFor } from '../../lib/faq-pages.ts';

describe('faqPages', () => {
  it('has six entries with unique keys, slugs and pages', () => {
    assert.equal(faqPages.length, 6);
    for (const field of ['key', 'notionSlug', 'page'] as const) {
      const values = faqPages.map((p) => p[field]);
      assert.equal(new Set(values).size, values.length, `${field} values are unique`);
    }
  });

  it('derives the partial and snapshot paths from the key', () => {
    assert.equal(partialPathFor('nodes'), 'content/partials/_troubleshooting-nodes-partial.mdx');
    assert.equal(snapshotPathFor('nodes'), 'content/faq/nodes.json');
  });

  it('maps every page to a file that exists under content/docs', async () => {
    const fs = await import('node:fs');
    for (const p of faqPages) {
      assert.ok(fs.existsSync(`content/docs/${p.page}.mdx`), `${p.page}.mdx exists`);
    }
  });
});
