import assert from 'node:assert/strict';
import { test } from 'node:test';

import { lintSource, stripCode } from './content-lint.mjs';

const rules = (src) => lintSource(src).map((f) => f.rule);

test('stripCode blanks fenced blocks but preserves line count', () => {
  const src = 'a\n```js\n:::note\n```\nb';
  const out = stripCode(src);
  assert.equal(out.split('\n').length, src.split('\n').length);
  assert.ok(!out.includes(':::note'));
  assert.ok(out.startsWith('a\n'));
});

test('stripCode blanks inline code', () => {
  assert.ok(!stripCode('use `:::note` here').includes(':::note'));
});

test('A1 fires on an empty admonition body', () => {
  assert.deepEqual(
    rules('<VanillaAdmonition type="warning" title="Long stranded prose"></VanillaAdmonition>'),
    ['A1'],
  );
});

test('A1 fires on a self-closing admonition', () => {
  assert.deepEqual(rules('<VanillaAdmonition type="note" title="x" />'), ['A1']);
});

test('A1 fires when the body is only whitespace across lines', () => {
  assert.deepEqual(rules('<VanillaAdmonition type="note" title="x">\n\n</VanillaAdmonition>'), [
    'A1',
  ]);
});

test('A1 does not fire when the body has prose', () => {
  assert.deepEqual(
    rules('<VanillaAdmonition type="note" title="Heads up">\n\nReal body.\n\n</VanillaAdmonition>'),
    [],
  );
});

test('A2 fires on a type outside the component union', () => {
  const found = lintSource('<VanillaAdmonition type="caution">\n\nbody\n\n</VanillaAdmonition>');
  assert.deepEqual(
    found.map((f) => f.rule),
    ['A2'],
  );
  assert.match(found[0].message, /caution/);
});

test('A2 accepts every valid type', () => {
  for (const t of ['note', 'tip', 'info', 'warning', 'danger']) {
    assert.deepEqual(rules(`<VanillaAdmonition type="${t}">\n\nbody\n\n</VanillaAdmonition>`), []);
  }
});

test('A3 fires on an unconverted ::: directive', () => {
  const found = lintSource(':::info Resources\n\ntext\n\n:::');
  assert.deepEqual(
    found.map((f) => f.rule),
    ['A3', 'A3'],
  );
});

test('A3 does NOT fire inside a fenced code block', () => {
  // The regression that matters: partials-check R3 emits 208 warnings that are all inside fences.
  assert.deepEqual(rules('```md\n:::note\ntext\n:::\n```'), []);
});

test('A4 fires for a markdown link or inline code in title=', () => {
  assert.ok(
    lintSource(
      '<VanillaAdmonition type="note" title="see [docs](/docs/x)">\n\nb\n\n</VanillaAdmonition>',
    ).some((f) => f.rule === 'A4'),
  );
  assert.ok(
    lintSource('<VanillaAdmonition type="note" title="run `x`">\n\nb\n\n</VanillaAdmonition>').some(
      (f) => f.rule === 'A4',
    ),
  );
});

test('A4 does NOT fire on an HTML entity — JSX decodes those in attributes', () => {
  // `title="L1 fee &quot;baked in&quot;"` renders as `L1 fee "baked in"`, verified in a browser.
  assert.deepEqual(
    rules(
      '<VanillaAdmonition type="note" title="a &quot;b&quot;">\n\nbody\n\n</VanillaAdmonition>',
    ),
    [],
  );
});

test('A4 sees markup that follows an apostrophe in a double-quoted title', () => {
  // `["']([^"']*)["']` stops at the apostrophe and never reaches the backticks.
  assert.ok(
    lintSource(
      '<VanillaAdmonition type="note" title="it doesn\'t use `x`">\n\nb\n\n</VanillaAdmonition>',
    ).some((f) => f.rule === 'A4'),
  );
});

test('A4 does not fire on a plain title', () => {
  assert.deepEqual(
    rules('<VanillaAdmonition type="note" title="Plain title">\n\nbody\n\n</VanillaAdmonition>'),
    [],
  );
});

test('A1 does NOT fire when the body is only a fenced code block', () => {
  // The body is all spaces in the code-stripped text, so reading it from there reported a
  // populated admonition as empty.
  assert.deepEqual(
    rules('<VanillaAdmonition type="tip">\n\n```shell\ndocker run x\n```\n\n</VanillaAdmonition>'),
    [],
  );
});

test('A1 still fires on a genuinely empty body', () => {
  assert.deepEqual(
    rules('<VanillaAdmonition type="note" title="stranded prose here">\n\n</VanillaAdmonition>'),
    ['A1'],
  );
});

test('A5 fires on internal .md/.mdx link targets, in markdown and JSX', () => {
  assert.deepEqual(rules('see [x](/docs/a/b.mdx)'), ['A5']);
  assert.deepEqual(rules('see [x](../a/b.mdx#frag)'), ['A5']);
  assert.deepEqual(rules('<a href="/docs/a.md">x</a>'), ['A5']);
});

test('A5 ignores external and fragment targets', () => {
  assert.deepEqual(rules('[x](https://example.com/a.md)'), []);
  assert.deepEqual(rules('[x](#section)'), []);
  assert.deepEqual(rules('[x](/docs/a/b)'), []);
});

test('findings carry 1-indexed line numbers', () => {
  const found = lintSource('line1\nline2\n:::note\n');
  assert.equal(found[0].line, 3);
});
