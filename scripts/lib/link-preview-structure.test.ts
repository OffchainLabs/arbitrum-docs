/**
 * Compiles MDX fixtures through `lib/preview-text.ts` and Fumadocs' `remarkStructure` with the
 * options from `lib/mdx-options.ts`, in the order fumadocs-mdx runs them, and checks the
 * structured data a link preview is built from.
 */
import { createProcessor } from '@mdx-js/mdx';
import { remarkGfm, remarkHeading, remarkStructure } from 'fumadocs-core/mdx-plugins';
import type { StructuredData } from 'fumadocs-core/mdx-plugins';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import remarkMath from 'remark-math';
import { VFile } from 'vfile';

import { mdxOptions } from '../../lib/mdx-options.ts';
import { remarkPreviewText } from '../../lib/preview-text.ts';

const siteOptions = mdxOptions.remarkStructureOptions;
assert.ok(siteOptions, 'mdxOptions must set remarkStructureOptions');
assert.ok(
  Array.isArray(mdxOptions.remarkPlugins) && mdxOptions.remarkPlugins.includes(remarkPreviewText),
  'mdxOptions.remarkPlugins must register remarkPreviewText',
);

async function structure(source: string): Promise<StructuredData> {
  const file = new VFile({ value: source, path: 'fixture.mdx' });
  await createProcessor({
    remarkPlugins: [
      remarkMath,
      remarkGfm,
      remarkHeading,
      [remarkPreviewText, { vars: { minBond: '3600' } }],
      [remarkStructure, siteOptions],
    ],
  }).process(file);
  return file.data.structuredData as StructuredData;
}

const texts = (data: StructuredData): string[] => data.contents.map((c) => c.content);

test('Var resolves to its value and Term flattens to its text', async () => {
  const data = await structure(
    'The bond is <Var name="minBond" /> ETH for a <Term id="sequencer">sequencer</Term>.\n',
  );
  assert.deepEqual(texts(data), ['The bond is 3600 ETH for a sequencer.']);
});

test('an unknown Var name keeps the tag, so the typo stays visible', async () => {
  const data = await structure('Value: <Var name="nope" />.\n');
  assert.deepEqual(texts(data), ['Value: <Var name="nope" />.']);
});

test('table cells and fenced code produce no entry', async () => {
  const data = await structure(
    'Intro.\n\n| A | B |\n| --- | --- |\n| cell one | cell two |\n\n```ts\nconst hidden = 1;\n```\n',
  );
  assert.deepEqual(texts(data), ['Intro.']);
});

test('headings carry ids and own the paragraphs after them', async () => {
  const data = await structure('Lead.\n\n## Fee model\n\nBody.\n');
  assert.deepEqual(data.headings, [{ id: 'fee-model', content: 'Fee model' }]);
  assert.deepEqual(data.contents, [
    { heading: undefined, content: 'Lead.' },
    { heading: 'fee-model', content: 'Body.' },
  ]);
});

test('heading text is stored without inline code or bold markers', async () => {
  const data = await structure('## Run `nitro` with **care**\n\nBody.\n');
  assert.deepEqual(data.headings, [{ id: 'run-nitro-with-care', content: 'Run nitro with care' }]);
});

test('bold, emphasis, strikethrough and inline code are stored without markers', async () => {
  const data = await structure('A **bold** and *soft* and ~~gone~~ and `code_here` word.\n');
  assert.deepEqual(texts(data), ['A bold and soft and gone and code_here word.']);
});

test('markdown-special characters in text are not escaped', async () => {
  const data = await structure('Use snake_case and 2 * 3 in [brackets].\n');
  assert.deepEqual(texts(data), ['Use snake_case and 2 * 3 in [brackets].']);
});

test('a hard break reads as a space', async () => {
  const data = await structure('line one\\\nline two\n');
  assert.deepEqual(texts(data), ['line one line two']);
});

test('a link reads as its text', async () => {
  const data = await structure('See [the guide](/guide) now.\n');
  assert.deepEqual(texts(data), ['See the guide now.']);
});

test('an image-only paragraph produces no entry', async () => {
  const data = await structure('Before.\n\n![alt](/img/x.png)\n\nAfter.\n');
  assert.deepEqual(texts(data), ['Before.', 'After.']);
});

test('a paragraph inside a Callout is included', async () => {
  const data = await structure('<Callout type="warn">\n  Careful here.\n</Callout>\n');
  assert.deepEqual(texts(data), ['Careful here.']);
});

test('a paragraph inside a list item is included', async () => {
  const data = await structure('1. Step with <Var name="minBond" /> ETH.\n');
  assert.deepEqual(texts(data), ['Step with 3600 ETH.']);
});

test('a blockquote block is not stored as a unit', async () => {
  const data = await structure('> quoted words\n');
  assert.deepEqual(texts(data), ['quoted words']);
});

test('inline maths reads as its source without the dollar signs', async () => {
  const data = await structure('The value $x$ grows.\n');
  assert.deepEqual(texts(data), ['The value x grows.']);
});

test('a string-literal expression reads as its text', async () => {
  const data = await structure('One{" "}two.\n');
  assert.deepEqual(texts(data), ['One two.']);
});
