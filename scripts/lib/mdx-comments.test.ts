/**
 * The processed markdown is stringified from the same mdast the page compile uses, so these tests
 * run the real `@mdx-js/mdx` processor with the real `remarkLLMs` behind the plugin, in the order
 * `fumadocs-mdx` composes them (`buildJSMDX`: remarkInclude, the site's plugins, then the
 * postprocess pass that calls `remarkLLMs`). What they assert is therefore the string a reader gets
 * at `/docs/<slug>.md`, not the shape of a tree.
 */
import { createProcessor } from '@mdx-js/mdx';
import { remarkLLMs } from 'fumadocs-core/mdx-plugins/remark-llms';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { VFile } from 'vfile';

import {
  isCommentOnlySource,
  isMdxComment,
  remarkStripMdxComments,
} from '../../lib/mdx-comments.ts';

/** The markdown `getText('processed')` would return for this source, with the plugin applied. */
async function mirror(source: string, { strip = true } = {}): Promise<string> {
  const processor = createProcessor({
    outputFormat: 'program',
    format: 'mdx',
    remarkPlugins: [...(strip ? [remarkStripMdxComments] : []), [remarkLLMs, { _data: true }]],
  });
  const file = new VFile({ value: source, path: 'test.mdx' });
  // `process` is parse, run and a final stringify. It used to be `parse` then `run`, which is the
  // same transform chain, but `@mdx-js/mdx` types `run` as taking the estree `Program` it produces
  // rather than the mdast `Root` it is actually handed, so that shape does not type-check.
  await processor.process(file);
  const { markdown } = file.data;
  assert.equal(typeof markdown, 'string', 'remarkLLMs attached no markdown to the file');
  return String(markdown);
}

test('the defect this closes: without the plugin the comment reaches the mirror', async () => {
  assert.match(
    await mirror('{/* maintainer note */}\n\nBody.\n', { strip: false }),
    /maintainer note/,
  );
});

test('a flow comment is gone and its neighbours stay separate blocks', async () => {
  const out = await mirror('First.\n\n{/* maintainer note */}\n\nSecond.\n');
  assert.equal(out.includes('{/*'), false);
  assert.equal(out.includes('maintainer note'), false);
  assert.match(out, /First\.\n\nSecond\./);
});

test('a run of consecutive comments is removed entirely', async () => {
  // The visitor has to revisit the index it spliced, or every second node survives.
  const out = await mirror('{/* one */}\n{/* two */}\n{/* three */}\n\nBody.\n');
  assert.equal(out.includes('{/*'), false);
  assert.match(out, /Body\./);
});

test('a multi-line comment is removed', async () => {
  const out = await mirror('{/* first line\n  second line */}\n\nBody.\n');
  assert.equal(out.includes('{/*'), false);
  assert.equal(out.includes('second line'), false);
});

test('a comment inside a JSX element’s children is removed, the element is not', async () => {
  const out = await mirror('<Tabs>\n  {/* pick one */}\n  <Tab value="a">x</Tab>\n</Tabs>\n');
  assert.equal(out.includes('pick one'), false);
  assert.match(out, /<Tabs>/);
  assert.match(out, /<Tab value="a">/);
});

test('an inline comment is removed and the prose around it survives', async () => {
  const out = await mirror('Before {/* note */} after.\n');
  assert.equal(out.includes('{/*'), false);
  assert.match(out, /Before\s+after\./);
});

test('a comment written inside a fenced block is left exactly as written', async () => {
  const out = await mirror('```js\n{/* this is sample code */}\n```\n');
  assert.match(out, /\{\/\* this is sample code \*\/\}/);
});

test('a comment written inside an inline code span is left exactly as written', async () => {
  const out = await mirror('Write `{/* a comment */}` to hide a note.\n');
  assert.match(out, /`\{\/\* a comment \*\/\}`/);
});

test('an expression that is not a comment is untouched', async () => {
  const out = await mirror('export const x = 1;\n\nValue: {x}\n');
  assert.match(out, /\{x\}/);
});

test('isMdxComment reads the parsed program, not the text', () => {
  const comment = {
    type: 'mdxFlowExpression',
    value: '/* note */',
    data: { estree: { type: 'Program', body: [], comments: [{ type: 'Block', value: ' note ' }] } },
  };
  assert.equal(isMdxComment(comment), true);
  assert.equal(
    isMdxComment({
      type: 'mdxTextExpression',
      value: 'x',
      data: { estree: { type: 'Program', body: [{ type: 'ExpressionStatement' }], comments: [] } },
    }),
    false,
  );
  assert.equal(isMdxComment({ type: 'paragraph', children: [] }), false);
  assert.equal(isMdxComment(undefined), false);
});

test('isMdxComment falls back to the source when no estree is attached', () => {
  assert.equal(isMdxComment({ type: 'mdxFlowExpression', value: '/* note */' }), true);
  assert.equal(isMdxComment({ type: 'mdxFlowExpression', value: 'someValue' }), false);
});

test('isCommentOnlySource does not match an expression that merely contains comment punctuation', () => {
  assert.equal(isCommentOnlySource('/* a */ // b'), true);
  assert.equal(isCommentOnlySource('"/*"'), false);
  assert.equal(isCommentOnlySource('1 /* trailing */'), false);
  assert.equal(isCommentOnlySource('   '), false);
  assert.equal(isCommentOnlySource(undefined), false);
});
