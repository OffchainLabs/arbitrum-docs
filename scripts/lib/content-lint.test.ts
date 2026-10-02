import assert from 'node:assert/strict';
import { test } from 'node:test';

import { type RuleId, lintSource } from './content-lint.ts';

const rules = (source: string): RuleId[] => lintSource(source).map((f) => f.rule);
const lines = (...rows: string[]): string => rows.join('\n');

test('clean prose reports nothing', () => {
  assert.deepEqual(rules('## Heading\n\nSome [link](/x) and <Var name="a" />.\n'), []);
});

test('a ::: directive line is reported, and one inside a fence is not', () => {
  assert.deepEqual(rules(':::note\n\nBody\n\n:::\n'), [
    'docusaurus-directive',
    'docusaurus-directive',
  ]);
  assert.deepEqual(rules('```md\n:::note\n```\n'), []);
});

test('a <Var> inside a fence or an inline code span is reported with its line', () => {
  const found = lintSource(
    lines('Run `<Var name="a" />`.', '', '```bash', 'x <Var name="b" />', '```'),
  );
  assert.deepEqual(
    found.map((f) => [f.rule, f.line]),
    [
      ['var-in-code', 1],
      ['var-in-code', 4],
    ],
  );
});

test('a <Var> in a link destination or href is reported; in link text it is fine', () => {
  assert.deepEqual(rules('[x](https://h/<Var name="a" />)\n'), ['var-in-link']);
  assert.deepEqual(rules('<a href="https://h/<Var name="a" />">x</a>\n'), ['var-in-link']);
  assert.deepEqual(rules('[<Var name="a" />](/x)\n'), []);
  assert.deepEqual(rules('[x](https://h/{var:a})\n'), []);
});

test('a placeholder whose name is not an identifier is reported', () => {
  assert.deepEqual(rules('[x](https://h/{var:not a key})\n'), ['var-in-link']);
});

test('a link, <a> or bare URL in a heading is reported', () => {
  assert.deepEqual(rules('## See [x](/x)\n'), ['link-in-heading']);
  assert.deepEqual(rules('## See [x][ref]\n'), ['link-in-heading']);
  assert.deepEqual(rules('## See <a href="/x">x</a>\n'), ['link-in-heading']);
  assert.deepEqual(rules('## See https://example.com\n'), ['link-in-heading']);
});

test('an image, a custom id or inline code in a heading is fine', () => {
  assert.deepEqual(rules('## Logo ![x](/img/x.png)\n'), []);
  assert.deepEqual(rules('## Heading [#custom-id]\n'), []);
  assert.deepEqual(rules('## The `https://x` endpoint\n'), []);
});

test('a <tr> directly inside <table> is reported; inside <tbody> it is fine', () => {
  assert.deepEqual(rules('<table>\n  <tr><td>a</td></tr>\n</table>\n'), ['tr-in-table']);
  assert.deepEqual(
    rules('<table>\n  <tbody>\n    <tr><td>a</td></tr>\n  </tbody>\n</table>\n'),
    [],
  );
  assert.deepEqual(
    rules('<table>\n<thead><tr><th>h</th></tr></thead>\n<tr><td>a</td></tr>\n</table>\n'),
    ['tr-in-table'],
  );
});

test('a markdown image with a remote src is reported, inline or by reference', () => {
  assert.deepEqual(rules('![x](https://example.com/a.png)\n'), ['remote-image']);
  assert.deepEqual(rules('![x][logo]\n\n[logo]: https://example.com/a.png\n'), ['remote-image']);
  assert.deepEqual(rules('![x][]\n\n[x]: <https://example.com/a.png>\n'), ['remote-image']);
});

test('a local image, a JSX remote src or an image in code is fine', () => {
  assert.deepEqual(rules('![x](/img/a.png)\n'), []);
  assert.deepEqual(rules('<ImageZoom src="https://example.com/a.png" />\n'), []);
  assert.deepEqual(rules('```md\n![x](https://example.com/a.png)\n```\n'), []);
  assert.deepEqual(rules('![x][logo]\n\n[logo]: /img/a.png\n'), []);
});
