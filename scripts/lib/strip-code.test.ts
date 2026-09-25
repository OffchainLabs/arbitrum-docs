/**
 * strip-code. The shared suite for the one scanner every content gate now uses (FS-2729).
 *
 * It carries the 29-case matrix the FS-2723 review built against the old regex `stripCode`, the two
 * limits that review documented rather than fixed (both marked below, both now passing), and the
 * cases the three replaced helpers used to own. Where a case asserts a rule of CommonMark, the
 * expectation was checked against `mdast-util-from-markdown` rather than reasoned about.
 *
 * Every case also asserts the contract: same length in and out, same line count, so a `file:line` in
 * any report stays true and a range still slices the original source.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  type CodeRegionOptions,
  codeRegions,
  fenceDefects,
  maskCode,
  maskRegions,
  stripCode,
} from './strip-code.ts';

/** Strip, asserting the length and line-count invariant on the way through. */
function strip(source: string, options?: CodeRegionOptions): string {
  const out = options === undefined ? stripCode(source) : maskCode(source, options);
  assert.equal(out.length, source.length, 'length must be preserved');
  assert.equal(out.split('\n').length, source.split('\n').length, 'line count must be preserved');
  return out;
}

const blanked = (source: string, needle: string, options?: CodeRegionOptions): boolean =>
  !strip(source, options).includes(needle);
const kept = (source: string, needle: string, options?: CodeRegionOptions): boolean =>
  strip(source, options).includes(needle);

const lines = (...rows: string[]): string => rows.join('\n');

// --- Fences: run length ------------------------------------------------------------------------

test('a closing run longer than the opening run closes the fence', () => {
  const src = lines('```', 'HIDDEN', '````', 'SHOWN', '');
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(kept(src, 'SHOWN'));
});

test('a closing run shorter than the opening run does not close the fence', () => {
  // FS-2723 residual limit A, which the regex scanner could not express. It now passes.
  const src = lines('````', 'HIDDEN_A', '```', 'HIDDEN_B', '````', 'SHOWN', '');
  assert.ok(blanked(src, 'HIDDEN_A'));
  assert.ok(blanked(src, 'HIDDEN_B'));
  assert.ok(kept(src, 'SHOWN'));
});

test('a tilde run does not close a backtick fence', () => {
  const src = lines('```', '~~~', 'HIDDEN', '```', 'SHOWN', '');
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(kept(src, 'SHOWN'));
});

test('a backtick run does not close a tilde fence', () => {
  const src = lines('~~~', '```', 'HIDDEN', '~~~', 'SHOWN', '');
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(kept(src, 'SHOWN'));
});

test('a backtick run inside a four-backtick fence is not a closer', () => {
  const src = lines('````markdown', '```js', 'HIDDEN', '```', 'STILL_HIDDEN', '````', 'SHOWN', '');
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(blanked(src, 'STILL_HIDDEN'));
  assert.ok(kept(src, 'SHOWN'));
});

// --- Fences: indentation -----------------------------------------------------------------------

test('a three-space indented fence closes at its own indentation', () => {
  const src = lines('   ```mdx', '   HIDDEN', '   ```', 'SHOWN', '');
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(kept(src, 'SHOWN'));
});

test('a two-space indented closer closes an unindented opener', () => {
  const src = lines('```', 'HIDDEN', '  ```', 'SHOWN', '');
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(kept(src, 'SHOWN'));
});

test('a four-space indented closer does not close an unindented opener', () => {
  // Checked against mdast-util-from-markdown: a closer more than three columns past its container
  // is content, not a closer. `content/docs/launch-arbitrum-chain/integrations/…` writes one.
  const src = lines('```json', 'HIDDEN', '    ```', 'STILL_HIDDEN', '```', 'SHOWN', '');
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(blanked(src, 'STILL_HIDDEN'));
  assert.ok(kept(src, 'SHOWN'));
});

test('a zero-indent closer closes a two-space opener', () => {
  const src = lines('  ```', '  HIDDEN', '```', 'SHOWN', '');
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(kept(src, 'SHOWN'));
});

test('a fence indented four spaces closes at its own indentation', () => {
  const src = lines('Paste this:', '', '    ```mdx', '    HIDDEN', '    ```', '', 'SHOWN', '');
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(kept(src, 'SHOWN'));
});

test('a fence indented six spaces inside a nested list item closes', () => {
  const src = lines(
    '- Step one:',
    '',
    '  1. Paste this:',
    '',
    '      ```mdx',
    '      HIDDEN',
    '      ```',
    '',
    'SHOWN',
    '',
  );
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(kept(src, 'SHOWN'));
});

test('a tab-indented opener and closer pair', () => {
  const src = lines('\t```', '\tHIDDEN', '\t```', 'SHOWN', '');
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(kept(src, 'SHOWN'));
});

// --- Fences: info strings, closers and the unterminated case -----------------------------------

test('an info string and meta on the opener are blanked with the fence', () => {
  const src = lines('```mdx title="x.mdx"', 'HIDDEN', '```', 'SHOWN', '');
  assert.ok(blanked(src, 'title="x.mdx"'));
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(kept(src, 'SHOWN'));
});

test('a line carrying trailing text after its run does not close a fence', () => {
  // Checked against mdast-util-from-markdown. This is what keeps a ```json line inside an open
  // fence from being read as that fence's closer.
  const src = lines('```js', 'HIDDEN', '``` trailing', 'STILL_HIDDEN', '```', 'SHOWN', '');
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(blanked(src, 'STILL_HIDDEN'));
  assert.ok(kept(src, 'SHOWN'));
});

test('an unterminated fence runs to the end of the file', () => {
  // A behaviour change from the regex scanner, which blanked nothing at all here and left the rest
  // of the file readable. CommonMark, and the rendered page, put everything after the opener inside
  // the code block. `content/docs/stylus/how-tos/trait-based-composition.mdx` ends on one.
  const src = lines('SHOWN', '```', 'HIDDEN', 'ALSO_HIDDEN', '');
  assert.ok(kept(src, 'SHOWN'));
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(blanked(src, 'ALSO_HIDDEN'));
});

test('a backtick in a backtick fence info string is not modelled', () => {
  // A documented limit. CommonMark forbids a backtick in a backtick fence's info string, so mdast
  // reads this as a paragraph and no fence opens at all. The scanner opens one and masks to EOF,
  // which over-masks. Every helper this module replaced did the same. Pinned, not asserted correct.
  assert.ok(blanked(lines('```js `foo`', 'HIDDEN', ''), 'HIDDEN'));
});

test('a fence inside a blockquote is not modelled', () => {
  // A documented limit, and the same at `fork/main`: `FENCE_OPEN` does not strip a `>` prefix, so
  // the body stays visible. Pinned because the paragraph bound is what removed an accidental mask
  // here: an unbounded span used to pair the two backtick runs and cover roughly the same range.
  assert.ok(kept(lines('> ```md', '> SHOWN', '> ```', ''), 'SHOWN'));
});

test('a four-space indented code block is not modelled', () => {
  // A documented limit, pinned so a later change to it is deliberate.
  assert.ok(kept(lines('Text:', '', '    SHOWN', ''), 'SHOWN'));
});

test('prose between two fences survives', () => {
  const src = lines('```', 'HIDDEN_A', '```', '', 'SHOWN', '', '```', 'HIDDEN_B', '```', '');
  assert.ok(blanked(src, 'HIDDEN_A'));
  assert.ok(blanked(src, 'HIDDEN_B'));
  assert.ok(kept(src, 'SHOWN'));
});

// --- Inline code spans -------------------------------------------------------------------------

test('an inline code span is blanked', () => {
  assert.ok(blanked('use `HIDDEN` here', 'HIDDEN'));
});

test('a double-backtick span blanks its body, single backticks included', () => {
  const src = 'a ``HIDDEN with a ` tick`` SHOWN';
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(kept(src, 'SHOWN'));
});

test('a run closes only on a run of exactly the same length', () => {
  // `a` is inside the double-backtick span; the lone run of one never opens anything.
  const src = 'x ``HIDDEN`` y `SHOWN_NOT_A_SPAN';
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(kept(src, 'SHOWN_NOT_A_SPAN'));
});

test('a longer run does not close a shorter opener, it is skipped over', () => {
  // The discriminating case for `run === length` against `run >= length`; the fixture above cannot
  // tell the two apart. Checked against mdast-util-from-markdown: one span over offsets 2 to 25, so
  // the run of one opens, the run of two is passed over, and the second run of one closes it.
  const src = 'a `HIDDEN`` STILL_HIDDEN` SHOWN';
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(blanked(src, 'STILL_HIDDEN'));
  assert.ok(kept(src, 'SHOWN'));
});

test('an unmatched backtick run is literal text', () => {
  const src = lines('SHOWN and a stray ` backtick', '');
  assert.ok(kept(src, 'SHOWN'));
  assert.ok(kept(src, 'backtick'));
});

test('a code span may cross a newline', () => {
  assert.ok(blanked(lines('a `HIDDEN', 'STILL_HIDDEN` b', ''), 'HIDDEN'));
  assert.ok(blanked(lines('a `HIDDEN', 'STILL_HIDDEN` b', ''), 'STILL_HIDDEN'));
});

test('a code span does not cross a blank line', () => {
  // Checked against mdast-util-from-markdown: inline parsing is confined to one block. Without this
  // a stray backtick pairs with one paragraphs away and hides every line between, which is what
  // `content/docs/how-arbitrum-works/bold/bold-technical-deep-dive.mdx` triggers.
  const src = lines('a `SHOWN_A', '', 'SHOWN_B ` c', '');
  assert.ok(kept(src, 'SHOWN_A'));
  assert.ok(kept(src, 'SHOWN_B'));
});

test('a backtick inside a fence never opens a span', () => {
  const src = lines('```', 'HIDDEN `', '```', '', 'SHOWN ` and more SHOWN_TOO', '');
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(kept(src, 'SHOWN_TOO'));
});

// --- The paragraph bound -----------------------------------------------------------------------
//
// Each of these is a line that ends a paragraph in CommonMark with no blank line before it, so a
// stray backtick above it must not pair with one below. Every expectation was checked against
// mdast-util-from-markdown, which finds zero inlineCode nodes in all of them. The direction matters:
// pairing here blanks real prose, and `content:lint` then reports nothing on a page that 404s.

const straddles = (middle: string): string =>
  lines('Prose with a stray ` tick', middle, 'More SHOWN_PROSE with a ` tick', '');

test('a span does not cross an ATX heading that interrupts the paragraph', () => {
  const src = straddles('## SHOWN_HEADING');
  assert.ok(kept(src, 'SHOWN_HEADING'));
  assert.ok(kept(src, 'SHOWN_PROSE'));
});

test('a span does not cross a list marker that interrupts the paragraph', () => {
  for (const marker of ['- SHOWN_ITEM', '* SHOWN_ITEM', '+ SHOWN_ITEM', '1. SHOWN_ITEM']) {
    const src = straddles(marker);
    assert.ok(kept(src, 'SHOWN_ITEM'), marker);
    assert.ok(kept(src, 'SHOWN_PROSE'), marker);
  }
});

test('a span does not cross a blockquote marker that interrupts the paragraph', () => {
  const src = straddles('> SHOWN_QUOTE');
  assert.ok(kept(src, 'SHOWN_QUOTE'));
  assert.ok(kept(src, 'SHOWN_PROSE'));
});

test('a span does not cross a thematic break that interrupts the paragraph', () => {
  for (const rule of ['***', '___', '- - -']) {
    const src = straddles(rule);
    assert.ok(kept(src, 'SHOWN_PROSE'), rule);
  }
});

test('a span does not cross an HTML block opener that interrupts the paragraph', () => {
  const src = straddles('<!-- SHOWN_COMMENT -->');
  assert.ok(kept(src, 'SHOWN_COMMENT'));
  assert.ok(kept(src, 'SHOWN_PROSE'));
});

test('a span does not cross a fence opener that interrupts the paragraph', () => {
  const src = lines('Prose with a stray ` tick', '```', 'HIDDEN', '```', 'SHOWN_PROSE ` tick', '');
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(kept(src, 'SHOWN_PROSE'));
});

test('a CRLF blank line bounds a span the way an LF one does', () => {
  const crlf = 'para `x\r\n\r\nSHOWN_ONE\r\nSHOWN_TWO\r\n\r\nmore y` tail\r\n';
  assert.ok(kept(crlf, 'SHOWN_ONE'));
  assert.ok(kept(crlf, 'SHOWN_TWO'));
  // A CRLF whitespace-only line is blank too; `content-lint` reads files verbatim and strips no CR.
  assert.ok(kept('para `x\r\n \t\r\nSHOWN_THREE\r\n\r\nmore y` tail\r\n', 'SHOWN_THREE'));
});

test('a span does not cross a setext heading underline', () => {
  // `Title\n===` is a heading, so the paragraph the span opened in ends at the underline. The `-`
  // form is a heading too, at any run length; one and three-plus hyphens were already bounds (bullet
  // and thematic break), exactly two matched neither. A mixed run such as `--=` is neither an
  // underline nor a break and must let the span run.
  const src = lines('para `x', 'SHOWN_SETEXT', '===', 'body y` tail', '');
  assert.ok(kept(src, 'body y'));
  assert.ok(kept(src, 'SHOWN_SETEXT'));
  assert.ok(
    kept(lines('para `x', 'Heading', '=', 'SHOWN_ONE_EQUALS y` tail', ''), 'SHOWN_ONE_EQUALS'),
  );
  assert.ok(
    kept(lines('para `x', 'Heading', '--', 'SHOWN_TWO_HYPHENS y` tail', ''), 'SHOWN_TWO_HYPHENS'),
  );
  assert.ok(blanked(lines('para `x', '--=', 'HIDDEN_MIXED y` tail', ''), 'HIDDEN_MIXED'));
});

test('a thematic break and a frontmatter fence bound a span on CRLF input too', () => {
  // `content-lint` reads files verbatim, so a `---\r` line must still end the paragraph. Prettier
  // rejects CRLF, so this cannot reach content/, but the scanner should not depend on that.
  assert.ok(kept('para `x\r\n---\r\nSHOWN_AFTER_BREAK y` tail\r\n', 'SHOWN_AFTER_BREAK'));
  assert.ok(kept('para `x\r\n* * *\r\nSHOWN_AFTER_STARS y` tail\r\n', 'SHOWN_AFTER_STARS'));
  const fm = '---\r\ntitle: a `b\r\n---\r\nSHOWN_BODY prose\r\nmore `c` end\r\n';
  assert.ok(kept(fm, 'SHOWN_BODY'));
});

test('a hash that is not a heading does not bound a span', () => {
  // `#hashtag` and `#5` have no space after the hashes, so CommonMark reads them as prose and the
  // span keeps running.
  for (const row of ['#hashtag HIDDEN_TAG', '#5 HIDDEN_TAG', '#######  HIDDEN_TAG']) {
    assert.ok(blanked(lines('para `x', row, 'more y` tail', ''), 'HIDDEN_TAG'), row);
  }
});

test('a tag closed on the same line by a different element still opens a block', () => {
  // `INLINE_ELEMENT` requires the closing tag to name the element the line opened. `<Foo>x</Bar>`
  // fails that, so the scanner treats the line as a block and stops the span. MDX itself does not:
  // the mismatched tag makes its JSX flow attempt fail and it falls back to paragraph text, so the
  // parser keeps the span running. The scanner's reading is pinned anyway because it under-masks
  // (exposure, never loss) and a mismatched closing tag is a content defect in its own right.
  const src = lines('para `x', '<Foo>SHOWN_MISMATCH</Bar>', 'more y` tail', '');
  assert.ok(kept(src, 'SHOWN_MISMATCH'));
  assert.ok(kept(src, 'more y'));
});

test('a backtick in frontmatter cannot pair with one in the body under stripCode', () => {
  // `stripCode` leaves frontmatter visible on purpose, so the closing `---` is what has to stop the
  // search. It does, being a thematic break. No blank line after it, which is the shape that breaks.
  const src = lines('---', 'title: a `b', '---', 'SHOWN_BODY prose', 'more `c` end', '');
  assert.ok(kept(src, 'SHOWN_BODY'));
});

test('an element opening and closing on one line does not bound a span', () => {
  // Measured against the MDX parser: `<b>x</b>` and `<Foo>x</Foo>` are inline elements that
  // interrupt nothing, so the span really does run past them and the scanner must not stop there.
  for (const tag of ['<b>x</b>', '<Foo>x</Foo>', '<em>x</em> and more']) {
    assert.ok(blanked(lines('para `HIDDEN', tag, 'more HIDDEN_TOO` tail', ''), 'HIDDEN_TOO'), tag);
  }
});

test('a self-closing or unclosed element does bound a span', () => {
  // The other half, also measured: both are flow elements in MDX and split the paragraph in two.
  for (const tag of ['<Foo />', '<Callout type="note">', '</Tab>']) {
    assert.ok(kept(lines('para `x', tag, 'more SHOWN_PROSE `y tail', ''), 'SHOWN_PROSE'), tag);
  }
});

test('a block opener indented four or more does not bound a span', () => {
  // A documented limit: indentation is read from column 0 and capped at three, the way CommonMark
  // caps a top-level block, so a block nested inside a list item is not seen as one. Pinned so a
  // later change to it is deliberate.
  const src = lines('Prose with a stray ` tick', '    ## not seen as a heading', 'tail ` tick', '');
  assert.ok(blanked(src, 'not seen as a heading'));
});

// --- MDX comments ------------------------------------------------------------------------------

test('a single-line MDX comment is blanked', () => {
  assert.ok(blanked('{/* HIDDEN */}', 'HIDDEN'));
});

test('a multi-line MDX comment is blanked without losing what follows', () => {
  const src = lines('{/*', 'HIDDEN', '*/}', '', 'SHOWN', '');
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(kept(src, 'SHOWN'));
});

test('an MDX comment containing an inline code span is blanked whole', () => {
  const src = lines('{/* the `x` form: HIDDEN */}', '', 'SHOWN', '');
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(kept(src, 'SHOWN'));
});

test('an unbalanced backtick straddling a comment closer still closes the comment', () => {
  // FS-2723 residual limit B. Two ordered passes could not get this and backticked delimiters in
  // prose both right; one left-to-right scan gets both. It now passes.
  const src = lines('{/* HIDDEN `a */} b`', '', 'SHOWN', '');
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(kept(src, 'SHOWN'));
});

test('backticked comment delimiters in prose do not swallow the content between them', () => {
  const src = lines('Write `{/*` to open one.', '', 'SHOWN', '', 'Close it with `*/}`.', '');
  assert.ok(kept(src, 'SHOWN'));
});

test('an MDX comment opener inside a fence opens nothing', () => {
  const src = lines('```', '{/*', '```', '', 'SHOWN', '');
  assert.ok(kept(src, 'SHOWN'));
});

test('a stray comment closer with no opener blanks nothing', () => {
  const src = lines('SHOWN */} still SHOWN_TOO', '');
  assert.ok(kept(src, 'SHOWN_TOO'));
});

test('two complete comments leave the content between them', () => {
  const src = lines('{/* HIDDEN_A */}', '', 'SHOWN', '', '{/* HIDDEN_B */}', '');
  assert.ok(blanked(src, 'HIDDEN_A'));
  assert.ok(blanked(src, 'HIDDEN_B'));
  assert.ok(kept(src, 'SHOWN'));
});

test('a complete MDX comment beside a JSX element is blanked', () => {
  const src = lines('<Foo bar={1} /> {/* HIDDEN */}', '', 'SHOWN', '');
  assert.ok(blanked(src, 'HIDDEN'));
  assert.ok(kept(src, 'SHOWN'));
});

test('a JavaScript comment inside a JSX expression is not an MDX comment', () => {
  // `{/*` opens only against `*/}`. Here the expression closes with `*/ 1}`, so nothing pairs and
  // nothing is blanked, which is the conservative direction.
  const src = lines('<Foo bar={/* SHOWN_A */ 1} />', '', 'SHOWN_B', '');
  assert.ok(kept(src, 'SHOWN_A'));
  assert.ok(kept(src, 'SHOWN_B'));
});

test('an unclosed MDX comment blanks nothing', () => {
  assert.ok(kept('{/* SHOWN', 'SHOWN'));
});

// --- Region sets per consumer ------------------------------------------------------------------

test('stripCode leaves frontmatter and HTML comments visible', () => {
  const src = lines('---', 'title: SHOWN_TITLE', '---', '', '<!-- SHOWN_COMMENT -->', '');
  assert.ok(kept(src, 'SHOWN_TITLE'));
  assert.ok(kept(src, 'SHOWN_COMMENT'));
});

test('maskRegions blanks frontmatter and HTML comments and leaves MDX comments visible', () => {
  const src = lines(
    '---',
    'title: HIDDEN_TITLE',
    '---',
    '',
    '<!-- HIDDEN -->',
    '{/* SHOWN */}',
    '',
  );
  const out = maskRegions(src);
  assert.equal(out.length, src.length);
  assert.equal(out.split('\n').length, src.split('\n').length);
  assert.ok(!out.includes('HIDDEN_TITLE'));
  assert.ok(!out.includes('HIDDEN'));
  assert.ok(out.includes('SHOWN'));
});

test('the default region set is fences and inline code only', () => {
  const src = lines('---', 'title: SHOWN_A', '---', '', '<!-- SHOWN_B -->', '{/* SHOWN_C */}', '');
  const out = maskCode(src);
  assert.ok(out.includes('SHOWN_A'));
  assert.ok(out.includes('SHOWN_B'));
  assert.ok(out.includes('SHOWN_C'));
});

test('a backtick inside frontmatter cannot pair with one in the body', () => {
  const src = lines('---', 'title: a ` tick', '---', '', 'SHOWN and a ` tick', '');
  const out = maskRegions(src);
  assert.ok(out.includes('SHOWN'));
});

test('an HTML comment whose closer sits inside a code span is still blanked', () => {
  const src = lines('<!-- HIDDEN `a --> b` -->', '', 'SHOWN', '');
  const out = maskRegions(src);
  assert.ok(!out.includes('HIDDEN'));
  assert.ok(out.includes('SHOWN'));
});

// --- Regions ------------------------------------------------------------------------------------

test('codeRegions returns ranges that slice the original source', () => {
  const src = lines('a `span` b', '', '```js', 'const x = 1;', '```', '');
  const found = codeRegions(src, { mdxComments: true });
  assert.deepEqual(
    found.map((r) => [r.kind, src.slice(r.start, r.end)]),
    [
      ['inlineCode', '`span`'],
      ['fence', '```js\nconst x = 1;\n```'],
    ],
  );
});

test('codeRegions is in source order and non-overlapping', () => {
  const src = lines('`a`', '', '```', 'x', '```', '', '{/* c */}', '`b`', '');
  const found = codeRegions(src, { mdxComments: true });
  for (let i = 1; i < found.length; i++) assert.ok(found[i].start >= found[i - 1].end);
});

// --- The contract, on shapes that used to be handled by three different helpers -----------------

test('the contract holds over an emoji, whose two halves both count', () => {
  const src = 'a 🚀 `code` b';
  const out = strip(src);
  assert.equal(out.indexOf('b'), src.indexOf('b'));
});

test('the contract holds over a fence, which the images helper used to collapse', () => {
  const src = lines('a', '```js', 'const x = 1;', '```', 'b', '');
  strip(src, {});
});

test('the contract holds over an inline span across lines', () => {
  strip(lines('a `x` b', 'c `d` e', ''), {});
});

// --- fenceDefects: where the CommonMark scanner and the MDX renderer disagree (FS-2743) ---------
//
// The expectations below were checked against both parsers, not reasoned about: closer indents 0 to
// 6 on one input, `mdast-util-from-markdown` versus `remark-parse` plus `remark-mdx`. CommonMark
// stops closing at 4; MDX keeps closing at 4, 5 and 6, because `remark-mdx` turns off indented code
// blocks and with them the cap.

test('fenceDefects is silent on a fence both parsers close the same way', () => {
  assert.deepEqual(fenceDefects(lines('```js', 'const x = 1;', '```', '')), []);
});

test('fenceDefects allows the three columns CommonMark allows', () => {
  for (const indent of ['', ' ', '  ', '   ']) {
    assert.deepEqual(
      fenceDefects(lines('```js', 'x', indent + '```', '')),
      [],
      `indent ${indent.length}`,
    );
  }
});

test('fenceDefects reports a closer indented four columns past its opener', () => {
  const src = lines('```js', 'x', '    ```', '');
  assert.deepEqual(
    fenceDefects(src).map((d) => [d.kind, src.slice(0, d.closerStart).split('\n').length]),
    [['indentedCloser', 3]],
  );
});

test('fenceDefects measures the allowance against the opener, not column 0', () => {
  // A fence four columns deep inside a list item, closed at its own indentation. Ordinary in
  // `content/`, and both parsers close it, so it must not be reported.
  assert.deepEqual(fenceDefects(lines('- item', '', '    ```js', '    x', '    ```', '')), []);
});

test('fenceDefects reports a fence with no closer at all', () => {
  const src = lines('text', '', '```js', 'const x = 1;', '');
  const found = fenceDefects(src);
  assert.deepEqual(
    found.map((d) => d.kind),
    ['unclosed'],
  );
  assert.equal(found[0].closerStart, -1);
  assert.equal(src.slice(0, found[0].start).split('\n').length, 3);
});

test('fenceDefects reports a stray trailing fence, the shape that renders an empty code box', () => {
  assert.deepEqual(
    fenceDefects(lines('- a bullet list', '- and another', '```', '')).map((d) => d.kind),
    ['unclosed'],
  );
});

test('fenceDefects calls an over-indented closer at end of file indentedCloser, not unclosed', () => {
  // The fence still runs to EOF under the CommonMark reading, but a closer exists and the fix is to
  // dedent it, so it must not be reported as the id whose fix is to delete a line.
  assert.deepEqual(
    fenceDefects(lines('```js', 'x', '    ```')).map((d) => d.kind),
    ['indentedCloser'],
  );
});

test('fenceDefects matches the marker character and length, so ``` never closes ~~~', () => {
  assert.deepEqual(
    fenceDefects(lines('~~~js', 'x', '```', '')).map((d) => d.kind),
    ['unclosed'],
  );
});

test('fenceDefects does not see a fence documented inside a longer fence', () => {
  assert.deepEqual(fenceDefects(lines('````md', '```js', 'x', '```', '````', '')), []);
});

test('fenceDefects and codeRegions read the same fences', () => {
  const src = lines('```js', 'x', '```', '', '```sh', 'y', '');
  const fences = codeRegions(src).filter((r) => r.kind === 'fence');
  assert.equal(fences.length, 2);
  assert.deepEqual(
    fenceDefects(src).map((d) => d.start),
    [fences[1].start],
  );
});
