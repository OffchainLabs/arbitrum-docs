/**
 * strip-code. The one answer to "what counts as code" for every script that scans MDX source.
 *
 * Four independent implementations of this used to exist, one per gate, each with its own edge
 * cases (FS-2729). They are now one scanner with one contract, and each consumer selects the region
 * kinds it needs rather than bringing its own scanner:
 *
 *   - `content-lint.ts` and `partials.ts` call `stripCode`, which blanks fences, inline code and
 *     MDX `{/* … *\/}` comments. A rule that cannot tell documentation-about-syntax from syntax is
 *     noise, not a gate, and an `<include>` shown as an example is not a dependency.
 *   - `content-lint.ts` rule A6 calls `codeRegions`, because it needs to look *inside* code rather
 *     than past it. It used to carry its own copy of two fence regexes, which is exactly the shape
 *     that lets one gate drift away from another.
 *   - `doc-links.ts` calls `maskRegions`, which blanks fences, inline code, frontmatter and HTML
 *     comments, because a link written in either of those is not a link a reader can follow.
 *   - `remote-images.ts` calls `maskCode` with the default region set, fences and inline code only.
 *   - `content-lint.ts` rules A12 and A13 call `fenceDefects`, because they are about the fence
 *     boundary itself rather than about what is inside it. Same scan as everything above, so a rule
 *     about where a fence ends cannot disagree with the masking that acts on it.
 *
 * This module imports nothing, deliberately. `content-lint.ts` and `partials.ts` are pure string
 * tooling and the scanner is the thing they all agree on, so it must not drag `node:fs` or a docs
 * index behind it. That is also why the scanner lives here rather than in `doc-links.ts`, which
 * owns the filesystem walk.
 *
 * ## Contract
 *
 * `maskCode` output is the same length as its input and every surviving character keeps its index,
 * so a caller may match against the masked text and then read the matched span back out of the
 * original source at the same offsets. That is what lets `content-lint` read an attribute value
 * containing inline code, what lets `parseIncludes` return ranges a rewrite can splice, and what
 * keeps a `file:line` in any report true. Line count is preserved for the same reason.
 *
 * ## The scan
 *
 * Two phases, matching the order a markdown parser works in, so a block always wins over an inline
 * construct that would otherwise straddle it.
 *
 * **Phase 1, block level.** Frontmatter, when asked for, then a line-by-line fence scan. A line
 * whose first non-whitespace is a run of three or more backticks or tildes opens a fence. The fence
 * closes on a later line holding a run of the *same character*, *at least as long as the opener*,
 * indented no more than three columns past the opener, with nothing but whitespace after it. An
 * unclosed fence runs to the end of the file, which is what the page itself renders. Every one of
 * those clauses was checked against `mdast-util-from-markdown` rather than assumed. The scan itself
 * is `scanFences`, one generator, which `codeRegions` and `fenceDefects` both read.
 *
 * **Phase 2, inline level.** One left-to-right scan over everything phase 1 left, where whichever
 * delimiter opens first wins. An inline code span opens on a run of backticks and closes on the next
 * run of exactly the same length *within the same paragraph*, so a double-backtick span may contain
 * single backticks, a span may cross a newline but never a line that ends the paragraph, and a run
 * that never finds its match is literal text. `{/*` and `<!--`, when asked for, open a comment that
 * runs to its own closer, and a comment is deliberately not paragraph-bounded, because both forms
 * are block constructs in their own right and routinely span one.
 *
 * The paragraph bound is the one rule here that is line-level rather than character-level, and it is
 * load-bearing: without it a single stray backtick pairs with another one an arbitrary distance away
 * and blanks every line between, which is how a linter silently stops reading real prose. See
 * `endsParagraph`.
 *
 * First-opener-wins is the whole point of the single pass. Two separate passes cannot both be right:
 * whichever runs second breaks a delimiter the other needed. Comments before spans loses
 * `` `{/*` `` written as prose, which in MDX is a code span and never opens a comment. Spans before
 * comments loses a comment whose body holds an unbalanced backtick that straddles the comment's own
 * `*\/}`. Scanning once, opener first, gets both (FS-2729; both were live limits before).
 *
 * ## Known limits
 *
 * - A four-space-indented code block, the fenceless kind, is not modelled at all.
 * - A backtick inside a backtick fence's info string is not modelled. CommonMark forbids one, so
 *   ```` ```js `foo` ```` opens no fence at all; `FENCE_OPEN` accepts it and masks the line and
 *   everything after it. The direction is over-masking, and it behaves the same way at every one of
 *   the four helpers this module replaced.
 * - Fence opener indentation is unbounded, and the closer's allowance is measured against the
 *   opener rather than against the container block. CommonMark caps a top-level opener at three
 *   spaces and measures a nested one against its container; a scanner with no notion of containers
 *   cannot tell the two apart, and fences four or more columns deep inside a list item are ordinary
 *   in `content/`.
 * - The closer's three-column allowance is CommonMark's, not the MDX parser's. This site compiles
 *   with `remark-mdx`, which turns off indented code blocks and with them that cap, so a closer the
 *   masking here reads as fence body is a real closer to the renderer (FS-2743). The masking is
 *   deliberately left at the CommonMark reading, because widening it would change what every
 *   consumer sees; `fenceDefects` reports the disagreement instead, and A13 blocks it in `content/`,
 *   so no file in the tree relies on the difference.
 * - `endsParagraph` reads a block opener's indentation from column 0, capped at three the way
 *   CommonMark caps a top-level one. The same missing notion of containers applies: a block nested
 *   inside a list item sits four or more columns deep, and a span is not bounded there.
 * - A fence inside a blockquote is not a fence, because `FENCE_OPEN` does not strip a `>` prefix.
 *   Its body is therefore visible to every consumer, which is also true of all four helpers this
 *   module replaced, and no file in `content/` writes one. The direction is under-masking, so the
 *   cost is a false positive a writer can see rather than a rule that stops looking.
 */

/** Frontmatter, only ever at offset 0. */
const FRONTMATTER = /^---\r?\n[\s\S]*?\n---[ \t]*(?:\r?\n|$)/;

/** A line that opens a fence: any indentation, then three or more backticks or tildes. */
const FENCE_OPEN = /^[ \t]*(`{3,}|~{3,})/;

/** Every kind of region `codeRegions` can report. */
export type CodeRegionKind = 'frontmatter' | 'fence' | 'inlineCode' | 'mdxComment' | 'htmlComment';

/** A half-open `[start, end)` range into the source, tagged with what it is. */
export interface CodeRegion {
  kind: CodeRegionKind;
  start: number;
  end: number;
}

/**
 * Which region kinds `codeRegions` finds. Fences and inline code are on by default; the other three
 * are off, because a linter must keep seeing frontmatter and a link checker must keep seeing a
 * commented-out link.
 */
export interface CodeRegionOptions {
  fences?: boolean;
  inlineCode?: boolean;
  frontmatter?: boolean;
  htmlComments?: boolean;
  mdxComments?: boolean;
}

/** A fence closer the two parsers do not agree on. See `fenceDefects`. */
export interface FenceDefect {
  kind: 'unclosed' | 'indentedCloser';
  start: number;
  closerStart: number;
}

interface Fence {
  start: number;
  end: number;
  closerStart: number;
  looseCloserStart: number;
}

interface CommentForm {
  kind: 'mdxComment' | 'htmlComment';
  option: 'mdxComments' | 'htmlComments';
  open: string;
  close: string;
}

const COMMENTS: readonly CommentForm[] = [
  { kind: 'mdxComment', option: 'mdxComments', open: '{/*', close: '*/}' },
  { kind: 'htmlComment', option: 'htmlComments', open: '<!--', close: '-->' },
];

const lineEndFrom = (source: string, start: number): number => {
  const nl = source.indexOf('\n', start);
  return nl === -1 ? source.length : nl;
};

/**
 * Every fence in one source, in order, each with both readings of where it closes.
 *
 * The one fence scan in this repo. `codeRegions` takes `start` and `end` from it and nothing else;
 * `fenceDefects` takes the two closer offsets. Keeping them on one generator is the point: a second
 * fence regex somewhere else is exactly the drift FS-2729 removed.
 *
 * `closerStart` is the CommonMark reading. The closer repeats the opener's character at least as
 * many times, holds nothing else, and is indented no more than three columns past the opener.
 * CommonMark measures that three against the container block rather than the opener, but a scanner
 * with no notion of containers cannot see one, and the opener sits in the same container, so it is
 * the closest available proxy. Verified against `mdast-util-from-markdown` for the four shapes that
 * matter: a 2-space closer under an unindented opener closes, a 4-space one does not, a 4-space
 * closer under a 4-space opener inside a list item closes, and a closer carrying trailing text
 * never closes.
 *
 * `looseCloserStart` is the same line test with the indentation cap lifted, which is how the MDX
 * parser this site compiles with reads it: `remark-mdx` turns off indented code blocks, and with
 * them the cap. Measured over closer indents 0 to 6 on one input, `mdast-util-from-markdown` stops
 * closing at 4 while `remark-parse` plus `remark-mdx` keeps closing at 4, 5 and 6 (FS-2743). Where
 * the two readings disagree the page renders fine and every scanner-based gate goes blind over the
 * lines between, which is what `fenceDefects` reports and what rule A13 blocks.
 *
 * Masking deliberately keeps the CommonMark reading. Widening it here would change what every
 * consumer sees across the whole tree, so the source is made unambiguous instead.
 *
 * Both offsets are -1 when no such closer exists, in which case `end` is the end of the file, which
 * is what the page itself renders.
 *
 * @param source raw MDX
 * @param bodyStart offset to start scanning at, past frontmatter when it was consumed
 */
function* scanFences(source: string, bodyStart: number): Generator<Fence> {
  let cursor = bodyStart;
  while (cursor < source.length) {
    const lineEnd = lineEndFrom(source, cursor);
    const open = FENCE_OPEN.exec(source.slice(cursor, lineEnd));

    if (!open) {
      cursor = lineEnd + 1;
      continue;
    }

    const marker = open[1];
    const indent = open[0].length - marker.length;
    const closes = new RegExp(
      `^[ \\t]{0,${indent + 3}}\\${marker[0]}{${marker.length},}[ \\t\\r]*$`,
    );
    const closesAtAnyIndent = new RegExp(`^[ \\t]*\\${marker[0]}{${marker.length},}[ \\t\\r]*$`);

    let end = source.length;
    let closerStart = -1;
    let looseCloserStart = -1;
    let scan = lineEnd + 1;
    while (scan <= source.length) {
      const scanEnd = lineEndFrom(source, scan);
      const line = source.slice(scan, scanEnd);
      if (looseCloserStart === -1 && closesAtAnyIndent.test(line)) looseCloserStart = scan;
      if (closes.test(line)) {
        end = scanEnd;
        closerStart = scan;
        break;
      }
      if (scanEnd >= source.length) break;
      scan = scanEnd + 1;
    }

    yield { start: cursor, end, closerStart, looseCloserStart };
    cursor = end + 1;
  }
}

/**
 * Every fence whose closer the two parsers do not agree on, in source order.
 *
 * Two kinds, because the fixes are opposite:
 *
 * - `unclosed`: no closer at any indentation. The fence runs to the end of the file, so the page
 *   renders an empty code box (a stray trailing fence) or swallows its own tail (a real opener
 *   whose closer is missing). Reader-visible.
 * - `indentedCloser`: a closer indented more than three columns past its opener. MDX closes the
 *   fence there, so the page renders correctly and the reader sees nothing, but every gate reading
 *   this module's CommonMark masking treats the lines between as fence body and stops checking
 *   them. `closerStart` points at that closer, which is where the fix goes.
 *
 * @param source raw MDX
 */
export function fenceDefects(source: string): FenceDefect[] {
  const defects: FenceDefect[] = [];
  for (const { start, closerStart, looseCloserStart } of scanFences(source, 0)) {
    // The overwhelmingly common case: one line is both readings' closer.
    if (closerStart !== -1 && closerStart === looseCloserStart) continue;
    defects.push({
      kind: looseCloserStart === -1 ? 'unclosed' : 'indentedCloser',
      start,
      closerStart: looseCloserStart,
    });
  }
  return defects;
}

/**
 * Every code (and, on request, comment or frontmatter) region in one source, in source order and
 * non-overlapping.
 *
 * @param source raw MDX
 * @param options which region kinds to find. Fences and inline code are on by default; the other
 *        three are off, because a linter must keep seeing frontmatter and a link checker must keep
 *        seeing a commented-out link.
 * @returns half-open `[start, end)` ranges into `source`
 */
export function codeRegions(source: string, options: CodeRegionOptions = {}): CodeRegion[] {
  const {
    fences = true,
    inlineCode = true,
    frontmatter = false,
    htmlComments = false,
    mdxComments = false,
  } = options;

  const regions: CodeRegion[] = [];
  let bodyStart = 0;

  if (frontmatter) {
    const match = FRONTMATTER.exec(source);
    if (match && match.index === 0) {
      regions.push({ kind: 'frontmatter', start: 0, end: match[0].length });
      bodyStart = match[0].length;
    }
  }

  if (fences) {
    for (const fence of scanFences(source, bodyStart)) {
      regions.push({ kind: 'fence', start: fence.start, end: fence.end });
    }
  }

  const enabled = { mdxComments, htmlComments };
  const wanted = COMMENTS.filter((c) => enabled[c.option]);
  if (!inlineCode && wanted.length === 0) return regions.sort((a, b) => a.start - b.start);

  // Phase 2 reads the text with phase 1 already blanked, so no delimiter inside a fence or inside
  // frontmatter can open anything, and every offset still indexes `source`.
  const masked = blank(source, regions);
  const inline: CodeRegion[] = [];

  let i = bodyStart;
  while (i < masked.length) {
    if (inlineCode && masked[i] === '`') {
      let length = 1;
      while (masked[i + length] === '`') length += 1;

      const end = closingRun(masked, i + length, length);
      if (end !== -1) {
        inline.push({ kind: 'inlineCode', start: i, end });
        i = end;
      } else {
        i += length;
      }
      continue;
    }

    const comment = wanted.find((c) => masked.startsWith(c.open, i));
    if (comment) {
      const close = masked.indexOf(comment.close, i + comment.open.length);
      if (close !== -1) {
        inline.push({ kind: comment.kind, start: i, end: close + comment.close.length });
        i = close + comment.close.length;
        continue;
      }
    }

    i += 1;
  }

  return [...regions, ...inline].sort((a, b) => a.start - b.start);
}

/**
 * A line that ends the paragraph above it, read from column 0 with the usual three-column
 * allowance. In the order written: an ATX heading, a blockquote marker, a thematic break, a setext
 * heading underline (a run of `=` or `-`; the parser reads any run of `-` under a paragraph as a
 * setext heading, not a thematic break, and the bullet and thematic-break alternatives only cover
 * a run of one or of three and more), a bullet list marker, an
 * ordered list marker, a fence opener, and an HTML or JSX tag. Every one of these interrupts a
 * paragraph with no blank line before it, or, for the setext underline, closes it, which is exactly
 * why a blank line alone is not a sufficient bound. The two alternatives that must reach the end of
 * the line allow a trailing `\r`, so a CRLF file (which Prettier rejects, but `content-lint` reads
 * verbatim) bounds the same way an LF one does.
 *
 * The thematic-break alternative is written before the list-marker one because `---` and `***` are
 * both, and it is the one that has to reach the end of the line to match. A line indented four or
 * more columns is a lazy paragraph continuation at top level rather than a block, so the cap is
 * deliberate.
 *
 * The tag alternative needs `INLINE_ELEMENT` beside it, because not every tag at a line's start
 * opens a block. Measured against the MDX parser this repo compiles with: a self-closing `<Foo />`
 * and an unclosed `<Callout>` are flow elements and interrupt, while `<b>x</b>` and `<Foo>x</Foo>`,
 * which open and close on the one line, are inline elements and do not. One same-line closing tag
 * for the element the line opened is what separates them, and that is what `INLINE_ELEMENT` looks
 * for. No JSX parse is needed for the shapes that occur.
 */
const BLOCK_START =
  /^[ \t]{0,3}(?:#{1,6}(?:[ \t]|$)|>|([-*_])(?:[ \t]*\1){2,}[ \t\r]*$|(?:=+|-+)[ \t\r]*$|[-+*](?:[ \t]|$)|\d{1,9}[.)](?:[ \t]|$)|`{3,}|~{3,}|<[!?/A-Za-z])/;

/**
 * A line opening an element and closing that same element on the same line, which is inline and
 * interrupts nothing. `<!--`, `<?`, `</x>` and a self-closing tag all fail it, which is right: the
 * first three are block openers and the last is a flow element.
 */
const INLINE_ELEMENT = /^[ \t]{0,3}<([A-Za-z][\w.:-]*)(?=[\s/>])[^\n]*<\/\1[ \t]*>/;

/** Blank after a CR, which `content-lint` never strips, so a CRLF blank line reads as one. */
const BLANK_LINE = /^[ \t\r]*$/;

/**
 * Does this line, taken without its newline, end the paragraph above it?
 *
 * Frontmatter needs no case of its own: both of its delimiters are `---` lines, which the
 * thematic-break alternative already matches, so a backtick in a frontmatter value cannot pair with
 * one in the body even under `stripCode`, where frontmatter is left visible on purpose.
 */
function endsParagraph(line: string): boolean {
  if (BLANK_LINE.test(line)) return true;
  if (INLINE_ELEMENT.test(line)) return false;
  return BLOCK_START.test(line);
}

/**
 * The end offset of the next run of exactly `length` backticks at or after `from`, or -1.
 *
 * The search stops at the end of the paragraph the run opened in, because inline parsing is
 * confined to one block. `mdast-util-from-markdown` confirms both halves: a code span may cross a
 * newline, and it may cross neither a blank line nor any other line that starts a block. Without
 * that bound a stray backtick pairs with another one an arbitrary distance away and blanks every
 * line between, which is how a linter silently stops reading real prose. A blanked fence is a run
 * of all-space lines, which read as blank here, so a span cannot reach across one of those either.
 */
function closingRun(source: string, from: number, length: number): number {
  let i = from;
  while (i < source.length) {
    if (source[i] === '\n') {
      const lineEnd = lineEndFrom(source, i + 1);
      if (endsParagraph(source.slice(i + 1, lineEnd))) return -1;
      i += 1;
      continue;
    }
    if (source[i] !== '`') {
      i += 1;
      continue;
    }
    let run = 1;
    while (source[i + run] === '`') run += 1;
    if (run === length) return i + run;
    i += run;
  }
  return -1;
}

/** Replace every non-newline character inside `regions` with a space. */
function blank(source: string, regions: readonly CodeRegion[]): string {
  if (regions.length === 0) return source;

  // Spread by UTF-16 code unit, not by code point: regex indexes and string slices count both
  // halves of an emoji, so anything else would shift every offset after one.
  const chars = source.split('');
  for (const { start, end } of regions) {
    for (let i = start; i < end; i++) if (chars[i] !== '\n') chars[i] = ' ';
  }
  return chars.join('');
}

/**
 * Blank every region `codeRegions` finds, preserving length, offsets and line count.
 *
 * @param source raw MDX
 */
export function maskCode(source: string, options?: CodeRegionOptions): string {
  return blank(source, codeRegions(source, options));
}

/**
 * Fences, inline code and MDX comments. What the two linters over `content/` scan against, so
 * syntax *documented* in code is never mistaken for syntax.
 *
 * Frontmatter is deliberately left visible: a `.md` suffix or a `<Var>` in a `description` is a real
 * defect and A5 and A11 should keep reporting it.
 */
export function stripCode(source: string): string {
  return maskCode(source, { mdxComments: true });
}

/**
 * Fences, inline code, frontmatter and HTML comments. What `extractRefs` scans against, so a link
 * regex never matches inside one and every range still indexes the original source for splicing.
 *
 * MDX comments are deliberately left visible: `check-links` reports a commented-out link today and
 * `move-doc` rewrites one, and hiding them would silently drop a rewrite target.
 */
export function maskRegions(source: string): string {
  return maskCode(source, { frontmatter: true, htmlComments: true });
}
