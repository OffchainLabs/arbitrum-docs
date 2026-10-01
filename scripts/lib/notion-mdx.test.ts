/**
 * Fixture-driven tests for the Notion block renderer. Each fixture mirrors the JSON the Notion API
 * returns for one block or rich-text item, so the tests pin the MDX shape without the network.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  type NotionBlock,
  type NotionRichText,
  RenderError,
  escapeMdxText,
  renderAnswer,
  renderBlocks,
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
    assert.equal(renderRichText(items), 'a **b** *c* ~~d~~` e<f>`');
  });

  it('keeps edge whitespace outside emphasis markers', () => {
    const items = [plain(' x ', { bold: true }), plain('y')];
    assert.equal(renderRichText(items), ' **x** y');
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

const rt = (content: string): NotionRichText[] => [plain(content)];

const block = (
  type: string,
  payload: Record<string, unknown>,
  children?: NotionBlock[],
): NotionBlock => ({
  id: `${type}-${Math.random().toString(36).slice(2, 8)}`,
  type,
  has_children: Boolean(children?.length),
  ...(children ? { children } : {}),
  [type]: payload,
});

const para = (text: string, children?: NotionBlock[]) =>
  block('paragraph', { rich_text: rt(text), color: 'default' }, children);

describe('renderBlocks', () => {
  it('renders paragraphs separated by one blank line', () => {
    assert.equal(renderBlocks([para('one'), para('two')]), 'one\n\ntwo');
  });

  it('skips an empty paragraph', () => {
    const empty = block('paragraph', { rich_text: [], color: 'default' });
    assert.equal(renderBlocks([para('one'), empty, para('two')]), 'one\n\ntwo');
  });

  it('demotes every heading level to h4', () => {
    const h = (level: 1 | 2 | 3, text: string) =>
      block(`heading_${level}`, { rich_text: rt(text), color: 'default', is_toggleable: false });
    assert.equal(renderBlocks([h(1, 'A'), h(2, 'B'), h(3, 'C')]), '#### A\n\n#### B\n\n#### C');
  });

  it('rejects a link inside a heading', () => {
    const h = block('heading_2', {
      rich_text: [linked('x', 'https://a.b')],
      color: 'default',
      is_toggleable: false,
    });
    assert.throws(() => renderBlocks([h]), /link not allowed/);
  });

  it('keeps list items tight and separates adjacent lists', () => {
    const li = (text: string, children?: NotionBlock[]) =>
      block('bulleted_list_item', { rich_text: rt(text), color: 'default' }, children);
    const ni = (text: string) =>
      block('numbered_list_item', { rich_text: rt(text), color: 'default' });
    assert.equal(
      renderBlocks([li('a'), li('b', [li('b1')]), ni('c'), ni('d')]),
      '- a\n- b\n  - b1\n\n1. c\n2. d',
    );
  });

  it('renders code with the Notion language as the fence info', () => {
    const code = block('code', { rich_text: rt('echo "<x>"'), caption: [], language: 'bash' });
    assert.equal(renderBlocks([code]), '```bash\necho "<x>"\n```');
  });

  it('renders quote, callout and divider', () => {
    const quote = block('quote', { rich_text: rt('q'), color: 'default' });
    const callout = block('callout', {
      rich_text: rt('note'),
      color: 'gray_background',
      icon: null,
    });
    const divider = block('divider', {});
    assert.equal(
      renderBlocks([quote, callout, divider]),
      '> q\n\n<Callout type="info">\n\nnote\n\n</Callout>\n\n---',
    );
  });

  it('renders a table with a header row and escaped pipes', () => {
    const row = (cells: string[]) => block('table_row', { cells: cells.map((c) => rt(c)) });
    const table = block(
      'table',
      { has_column_header: true, has_row_header: false, table_width: 2 },
      [row(['Flag', 'Meaning']), row(['--a', 'x | y'])],
    );
    assert.equal(renderBlocks([table]), '| Flag | Meaning |\n| --- | --- |\n| --a | x \\| y |');
  });

  it('rejects media and structural blocks by type with the block id', () => {
    for (const type of [
      'image',
      'video',
      'file',
      'embed',
      'bookmark',
      'link_to_page',
      'child_page',
      'synced_block',
      'toggle',
      'column_list',
    ]) {
      const b = block(type, {});
      assert.throws(() => renderBlocks([b]), new RegExp(`${type}.*${b.id}`));
    }
  });

  it('renders nested blocks in paragraph, quote and callout correctly', () => {
    const callout = block(
      'callout',
      { rich_text: rt('note'), color: 'gray_background', icon: null },
      [
        block('numbered_list_item', { rich_text: rt('a'), color: 'default' }),
        block('numbered_list_item', { rich_text: rt('b'), color: 'default' }),
      ],
    );
    assert.equal(
      renderBlocks([callout]),
      '<Callout type="info">\n\nnote\n\n1. a\n2. b\n\n</Callout>',
    );
  });

  it('renders quote with children preserving blank lines', () => {
    const quote = block('quote', { rich_text: rt('q'), color: 'default' }, [para('r')]);
    assert.equal(renderBlocks([quote]), '> q\n>\n> r');
  });

  it('renders code block with triple backticks using longer fence', () => {
    const code = block('code', { rich_text: rt('````'), caption: [], language: 'text' });
    assert.equal(renderBlocks([code]), '`````text\n````\n`````');
  });

  it('escapes leading Markdown syntax in paragraphs and list items', () => {
    const para1 = para('# not a heading');
    const li = block('bulleted_list_item', { rich_text: rt('- dash'), color: 'default' });
    assert.equal(renderBlocks([para1]), '\\# not a heading');
    assert.equal(renderBlocks([li]), '- \\- dash');
  });

  it('restarts numbered list at 1 after a paragraph', () => {
    const para1 = para('text');
    const ni1 = block('numbered_list_item', { rich_text: rt('a'), color: 'default' });
    const ni2 = block('numbered_list_item', { rich_text: rt('b'), color: 'default' });
    assert.equal(renderBlocks([ni1, ni2, para1, ni1, ni2]), '1. a\n2. b\n\ntext\n\n1. a\n2. b');
  });

  it('rejects a heading with children', () => {
    const h = block(
      'heading_2',
      {
        rich_text: rt('title'),
        color: 'default',
        is_toggleable: false,
      },
      [para('child')],
    );
    assert.throws(() => renderBlocks([h]), /heading_2.*children/);
  });

  it('rejects a divider with children', () => {
    const d = block('divider', {}, [para('child')]);
    assert.throws(() => renderBlocks([d]), /divider.*children/);
  });
});

describe('renderAnswer', () => {
  it('uses the body when present and the short answer otherwise', () => {
    assert.equal(renderAnswer([para('body')], rt('short')), 'body');
    assert.equal(renderAnswer([], rt('short')), 'short');
  });

  it('rejects an answer with neither', () => {
    assert.throws(() => renderAnswer([], []), /empty/);
  });
});
