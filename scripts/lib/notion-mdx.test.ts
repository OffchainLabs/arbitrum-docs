/**
 * Fixture-driven tests for the Notion block renderer. Each fixture mirrors the JSON the Notion API
 * returns for one block or rich-text item, so the tests pin the MDX shape without the network.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  type NotionRichText,
  RenderError,
  escapeMdxText,
  renderRichText,
  rewriteLink,
} from './notion-mdx.ts';

const plain = (
  content: string,
  extra: Partial<NotionRichText['annotations']> = {},
): NotionRichText => ({
  type: 'text',
  plain_text: content,
  href: null,
  annotations: {
    bold: false,
    italic: false,
    strikethrough: false,
    underline: false,
    code: false,
    color: 'default',
    ...extra,
  },
  text: { content, link: null },
});

const linked = (content: string, url: string): NotionRichText => ({
  ...plain(content),
  href: url,
  text: { content, link: { url } },
});

describe('escapeMdxText', () => {
  it('escapes MDX-significant characters in plain text', () => {
    assert.equal(escapeMdxText('set <chainName> in {config}'), 'set \\<chainName> in \\{config\\}');
    assert.equal(
      escapeMdxText('block_number * 2 [x] `y` ~z~ \\'),
      'block\\_number \\* 2 \\[x\\] \\`y\\` \\~z\\~ \\\\',
    );
  });
});

describe('rewriteLink', () => {
  it('turns a docs.arbitrum.io URL into a site-relative /docs path', () => {
    assert.equal(rewriteLink('https://docs.arbitrum.io/run-a-node/faq'), '/docs/run-a-node/faq');
    assert.equal(
      rewriteLink('https://docs.arbitrum.io/docs/run-a-node/faq#x'),
      '/docs/run-a-node/faq#x',
    );
    assert.equal(rewriteLink('https://docs.arbitrum.io/'), '/docs');
  });

  it('rejects a Notion URL', () => {
    assert.throws(() => rewriteLink('https://www.notion.so/abc'), RenderError);
    assert.throws(() => rewriteLink('https://app.notion.com/p/abc'), RenderError);
  });

  it('passes any other https URL through unchanged', () => {
    assert.equal(rewriteLink('https://arbiscan.io/tx/0x1'), 'https://arbiscan.io/tx/0x1');
  });
});

describe('renderRichText', () => {
  it('applies bold, italic, strikethrough and code', () => {
    const items = [
      plain('a ', {}),
      plain('b', { bold: true }),
      plain(' c', { italic: true }),
      plain(' d', { strikethrough: true }),
      plain(' e<f>', { code: true }),
    ];
    assert.equal(renderRichText(items), 'a **b**_ c_~~ d~~` e<f>`');
  });

  it('renders a link and rewrites its destination', () => {
    assert.equal(
      renderRichText([plain('see '), linked('the FAQ', 'https://docs.arbitrum.io/run-a-node/faq')]),
      'see [the FAQ](/docs/run-a-node/faq)',
    );
  });

  it('straightens curly quotes and drops underline and color', () => {
    const input = plain('“x” ‘y’', { underline: true, color: 'red' });
    const expected = '"x" \'y\'';
    assert.equal(renderRichText([input]), expected);
  });

  it('rejects a mention and a link when links are not allowed', () => {
    const mention = { ...plain('@someone'), type: 'mention' as const, text: undefined };
    assert.throws(() => renderRichText([mention]), /mention/);
    assert.throws(
      () => renderRichText([linked('x', 'https://a.b')], { allowLinks: false }),
      /link/,
    );
  });
});
