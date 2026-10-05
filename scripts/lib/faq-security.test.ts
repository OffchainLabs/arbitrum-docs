import { evaluate } from '@mdx-js/mdx';
import { remarkGfm } from 'fumadocs-core/mdx-plugins';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import prettier from 'prettier';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as runtime from 'react/jsx-runtime';
import remarkMath from 'remark-math';

import { MDX_FORMAT, buildPartial, generateFaq } from './faq-partial.ts';
import type { FaqSnapshot } from './faq-snapshot.ts';
import { type NotionBlock, type NotionRichText, renderAnswer, renderBlocks } from './notion-mdx.ts';

const text = (plain_text: string, code = false, href: string | null = null): NotionRichText => ({
  type: 'text',
  plain_text,
  href,
  annotations: {
    bold: false,
    italic: false,
    strikethrough: false,
    underline: false,
    code,
    color: 'default',
  },
});

const paragraph = (rich_text: NotionRichText[]): NotionBlock => ({
  id: 'fixture',
  type: 'paragraph',
  paragraph: { rich_text },
});
const snapshot = (answer: string, question = 'Fixture?'): FaqSnapshot => ({
  source: 'fixture',
  items: [{ id: 'fixture', question, answer }],
});

async function render(answer: string): Promise<string> {
  const mdx = await prettier.format(buildPartial(snapshot(answer)), MDX_FORMAT);
  const { default: Content } = await evaluate(mdx, {
    ...runtime,
    remarkPlugins: [remarkGfm, remarkMath],
  });
  return renderToStaticMarkup(createElement(Content));
}

const probe = 'globalThis.faqSecurityProbe = "executed"';

describe('FAQ imported text stays inert', () => {
  for (const content of [
    `x\`{${probe}}\`y`,
    '`edge`',
    '``two`` and `one`',
    ' leading and trailing ',
    '   ',
  ]) {
    it(`renders inline code literally: ${JSON.stringify(content)}`, async () => {
      const answer = renderBlocks([paragraph([text(content, true)])]);
      const html = await render(answer);
      assert.ok(html.includes(renderToStaticMarkup(createElement('code', null, content))), html);
      assert.equal(Reflect.get(globalThis, 'faqSecurityProbe'), undefined);
    });
  }

  for (const answer of [
    `export const reviewExport = ${probe}`,
    `import fs from 'node:fs'`,
    `{${probe}}`,
    `Text {${probe}} here.`,
    `<Callout type={${probe}}>x</Callout>`,
    '<Callout {...process.env}>x</Callout>',
    '<Callout type="info" onClick="run">x</Callout>',
    '<Callout type="error">x</Callout>',
    '<Callout>x</Callout>',
    '<include cwd>.env</include>',
    `| a |\n| - |\n| \`x\n{${probe}}\` |`,
    `[x](https://example.com) {${probe}}`,
  ]) {
    it(`rejects executable or unapproved snapshot MDX: ${JSON.stringify(answer)}`, () => {
      assert.throws(() => buildPartial(snapshot(answer)), /compile to code|not valid MDX/);
      assert.equal(Reflect.get(globalThis, 'faqSecurityProbe'), undefined);
    });
  }

  it('rejects ESM assembled across rich-text boundaries and in a short answer', () => {
    const items = [text('ex'), text('port const reviewExport = '), text(probe)];
    for (const answer of [renderBlocks([paragraph(items)]), renderAnswer([], items)]) {
      assert.throws(() => buildPartial(snapshot(answer)), /mdxjsEsm/);
    }
  });

  it('keeps executable-looking text inert across code and plain-text boundaries', async () => {
    const answer = renderBlocks([
      paragraph([text('x`', true), text(`{${probe}}`), text('`y', true)]),
    ]);
    const html = await render(answer);
    assert.ok(html.includes('faqSecurityProbe'), html);
    assert.equal(Reflect.get(globalThis, 'faqSecurityProbe'), undefined);
  });

  for (const parts of [
    ['a', 'b'],
    ['`', 'a'],
    ['x`', '`y'],
  ]) {
    it(`renders adjacent code items as one literal span: ${JSON.stringify(parts)}`, async () => {
      const items = parts.map((part) => text(part, true));
      const html = await render(renderBlocks([paragraph(items)]));
      assert.ok(
        html.includes(renderToStaticMarkup(createElement('code', null, parts.join('')))),
        html,
      );
      assert.deepEqual(
        items.map((item) => item.plain_text),
        parts,
        'must not mutate API data',
      );
    });
  }

  it('coalesces code items sharing a link and preserves separate link targets', async () => {
    const items = [
      text('`', true, 'https://example.com/a'),
      text('one', true, 'https://example.com/a'),
      text('two', true, 'https://example.com/b'),
    ];
    const html = await render(renderBlocks([paragraph(items)]));
    assert.ok(html.includes('<a href="https://example.com/a"><code>`one</code></a>'), html);
    assert.ok(html.includes('<a href="https://example.com/b"><code>two</code></a>'), html);
  });

  it('rejects an ESM line inserted through a multiline question', () => {
    assert.throws(
      () => buildPartial(snapshot('Answer.', `Question\n\nexport const reviewExport = ${probe}`)),
      /mdxjsEsm/,
    );
  });

  it('keeps a malicious link destination inside the link', async () => {
    const url = `https://example.com/) {${probe}} (`;
    const answer = renderBlocks([paragraph([text('link', false, url)])]);
    const html = await render(answer);
    assert.match(html, /<a href="https:\/\/example.com\//);
    assert.equal(Reflect.get(globalThis, 'faqSecurityProbe'), undefined);
  });

  for (const url of ['javascript:alert(1)', 'data:text/html,<script>run()</script>']) {
    it(`rejects an unsafe link scheme: ${url}`, () => {
      assert.throws(() => renderBlocks([paragraph([text('link', false, url)])]), /protocol/);
    });
  }

  it('rejects a table escape that exposes an MDX expression', () => {
    const table: NotionBlock = {
      id: 'table',
      type: 'table',
      table: { has_column_header: true },
      children: [
        { id: 'header', type: 'table_row', table_row: { cells: [[text('Header')]] } },
        {
          id: 'row',
          type: 'table_row',
          table_row: { cells: [[text(`x\n{${probe}}`, true)]] },
        },
      ],
    };
    assert.throws(() => buildPartial(snapshot(renderBlocks([table]))), /mdxTextExpression/);
  });

  it('preserves MDX escapes and code delimiters inside GFM table cells', async () => {
    const table: NotionBlock = {
      id: 'table',
      type: 'table',
      table: { has_column_header: true },
      children: [
        { id: 'header', type: 'table_row', table_row: { cells: [[text('Header')]] } },
        {
          id: 'row',
          type: 'table_row',
          table_row: { cells: [[text(`{${probe}} <T> | `), text('`code` | pipe', true)]] },
        },
      ],
    };
    const html = await render(renderBlocks([table]));
    assert.ok(html.includes('&lt;T&gt; | '), html);
    assert.ok(html.includes('<code>`code` | pipe</code>'), html);
    assert.equal(Reflect.get(globalThis, 'faqSecurityProbe'), undefined);
  });

  it('renders generated Callouts and fenced examples with executable-looking text', async () => {
    const answer = renderBlocks([
      { id: 'callout', type: 'callout', callout: { rich_text: [text('Note.')] } },
      {
        id: 'code',
        type: 'code',
        code: { language: 'js', rich_text: [text(`export const x = {${probe}};\n\`\`\``)] },
      },
    ]);
    const mdx = await prettier.format(buildPartial(snapshot(answer)), MDX_FORMAT);
    const { default: Content } = await evaluate(mdx, {
      ...runtime,
      remarkPlugins: [remarkGfm, remarkMath],
    });
    const html = renderToStaticMarkup(
      createElement(Content, {
        components: { Callout: ({ children }: { children?: React.ReactNode }) => children },
      }),
    );
    assert.ok(html.includes('Note.'), html);
    assert.ok(html.includes('export const x'), html);
    assert.equal(Reflect.get(globalThis, 'faqSecurityProbe'), undefined);
  });
});

describe('FAQ generator rejects unsafe content before writing or checking', () => {
  for (const check of [false, true]) {
    it(`leaves an existing partial untouched (check=${check})`, async (t) => {
      const root = fs.mkdtempSync(path.join(os.tmpdir(), 'faq-security-'));
      t.after(() => fs.rmSync(root, { recursive: true, force: true }));
      fs.mkdirSync(path.join(root, 'content/faq'), { recursive: true });
      fs.mkdirSync(path.join(root, 'content/partials'), { recursive: true });
      const partial = path.join(root, 'content/partials/_troubleshooting-nodes-partial.mdx');
      fs.writeFileSync(partial, 'Existing safe content.\n');
      fs.writeFileSync(
        path.join(root, 'content/faq/nodes.json'),
        JSON.stringify(snapshot(`export const reviewExport = ${probe}`)),
      );
      await assert.rejects(
        generateFaq({
          check,
          root,
          pages: [{ key: 'nodes', notionSlug: 'fixture', page: 'run-a-node/faq' }],
        }),
        /_troubleshooting-nodes-partial\.mdx:.*compile to code/,
      );
      assert.equal(fs.readFileSync(partial, 'utf8'), 'Existing safe content.\n');
    });
  }
});
