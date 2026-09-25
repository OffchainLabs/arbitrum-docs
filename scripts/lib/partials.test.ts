/**
 * partials. The include/import parsers behind `partials-check`, the catalog generator and the
 * `used in N pages` counts. Every case here is about one thing: code is documentation about the
 * syntax, never a use of it (FS-2723).
 */
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { buildCatalog, parseIncludes, parsePartialImports } from './partials.ts';

const targets = (src: string): string[] => parseIncludes(src).map((i) => i.target);
const specifiers = (src: string): string[] => parsePartialImports(src).map((i) => i.specifier);

test('an include inside a fenced code block is not a directive', () => {
  assert.deepEqual(targets('```\n<include cwd>content/partials/_x.mdx</include>\n```'), []);
});

test('an include inside a fence with an info string is not a directive', () => {
  assert.deepEqual(targets('```mdx\n<include cwd>content/partials/_x.mdx</include>\n```'), []);
});

test('an include inside an indented fence is not a directive', () => {
  assert.deepEqual(
    targets('Text:\n\n  ```mdx\n  <include cwd>content/partials/_x.mdx</include>\n  ```\n'),
    [],
  );
});

test('an include inside a tilde fence is not a directive', () => {
  assert.deepEqual(targets('~~~mdx\n<include cwd>content/partials/_x.mdx</include>\n~~~'), []);
});

test('an include inside an inline code span is not a directive', () => {
  assert.deepEqual(targets('Write `<include>../_x.mdx</include>` in a partial.'), []);
});

test('a closing fence indented less than three spaces still closes an unindented opener', () => {
  const src = [
    '```',
    '<include cwd>content/partials/_x.mdx</include>',
    '  ```',
    '',
    '<include cwd>content/partials/_real.mdx</include>',
    '',
  ].join('\n');
  assert.deepEqual(targets(src), ['content/partials/_real.mdx']);
});

test('a fence indented four spaces still closes at its own indentation', () => {
  const src = [
    'Paste this into your page:',
    '',
    '    ```mdx',
    '    <include cwd>content/partials/_x.mdx</include>',
    '    ```',
    '',
    '<include cwd>content/partials/_real.mdx</include>',
    '',
  ].join('\n');
  assert.deepEqual(targets(src), ['content/partials/_real.mdx']);
});

test('a fence indented six spaces inside a nested list item still closes', () => {
  const src = [
    '- Step one:',
    '',
    '  1. Paste this:',
    '',
    '      ```mdx',
    '      <include cwd>content/partials/_x.mdx</include>',
    '      ```',
    '',
    '<include cwd>content/partials/_real.mdx</include>',
    '',
  ].join('\n');
  assert.deepEqual(targets(src), ['content/partials/_real.mdx']);
});

test('an include inside an MDX comment is not a directive', () => {
  assert.deepEqual(targets('{/* <include cwd>content/partials/_x.mdx</include> */}'), []);
});

test('a multi-line MDX comment is blanked without losing a following real include', () => {
  const src = [
    '{/*',
    '<include cwd>content/partials/_x.mdx</include>',
    '*/}',
    '',
    '<include cwd>content/partials/_real.mdx</include>',
    '',
  ].join('\n');
  assert.deepEqual(targets(src), ['content/partials/_real.mdx']);
});

test('backticked comment delimiters in prose do not swallow the content between them', () => {
  const src = [
    'Write `{/*` to open an MDX comment.',
    '',
    '<include cwd>content/partials/_real.mdx</include>',
    '',
    'Close it with `*/}`.',
    '',
  ].join('\n');
  assert.deepEqual(targets(src), ['content/partials/_real.mdx']);
});

test('an MDX comment containing an inline code span is still blanked whole', () => {
  const src = [
    '{/* the `<include>` form, shown here: <include cwd>content/partials/_x.mdx</include> */}',
    '',
    '<include cwd>content/partials/_real.mdx</include>',
    '',
  ].join('\n');
  assert.deepEqual(targets(src), ['content/partials/_real.mdx']);
});

test('a real include after a fence is still a directive, with a range into the original source', () => {
  const src = [
    '```mdx',
    '<include cwd>content/partials/_example.mdx</include>',
    '```',
    '',
    '<include cwd>content/partials/_real.mdx</include>',
    '',
  ].join('\n');
  const found = parseIncludes(src);
  assert.deepEqual(
    found.map((i) => i.target),
    ['content/partials/_real.mdx'],
  );
  assert.equal(src.slice(...found[0].range), 'content/partials/_real.mdx');
  assert.equal(found[0].cwd, true);
});

test('a file-relative include still parses as non-cwd', () => {
  const found = parseIncludes('<include>../_hardware-requirements.mdx</include>');
  assert.deepEqual(
    found.map((i) => [i.cwd, i.target]),
    [[false, '../_hardware-requirements.mdx']],
  );
});

test('a partial import inside a fence is not an import', () => {
  const src = [
    '```tsx',
    "import Example from '@/content/partials/_example.mdx';",
    '```',
    '',
    "import Real from '@/content/partials/_real.mdx';",
  ].join('\n');
  assert.deepEqual(specifiers(src), ['@/content/partials/_real.mdx']);
  const found = parsePartialImports(src);
  assert.equal(src.slice(...found[0].range), '@/content/partials/_real.mdx');
});

test('buildCatalog does not count a fenced include as a use', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'partials-catalog-'));
  try {
    mkdirSync(path.join(root, 'content', 'partials'), { recursive: true });
    mkdirSync(path.join(root, 'content', 'docs'), { recursive: true });
    writeFileSync(
      path.join(root, 'content', 'partials', '_note.mdx'),
      '## Note\n\nThe batch poster account must hold funds.\n',
    );
    writeFileSync(
      path.join(root, 'content', 'docs', 'teaching.mdx'),
      [
        'Paste this directive into your page:',
        '',
        '```mdx',
        '<include cwd>content/partials/_note.mdx</include>',
        '```',
        '',
      ].join('\n'),
    );
    writeFileSync(
      path.join(root, 'content', 'docs', 'using.mdx'),
      '<include cwd>content/partials/_note.mdx</include>\n',
    );

    const [entry] = buildCatalog(root);
    assert.equal(entry.path, 'content/partials/_note.mdx');
    assert.equal(entry.usedIn, 1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
