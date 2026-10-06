/**
 * strip-code: which parts of an MDX source are code (or comments, or frontmatter), for every script
 * that scans MDX as text.
 *
 * Masking replaces each character in a region with a space and keeps newlines, so the output has
 * the same length, offsets and line count as the input. A caller matches against the masked text
 * and reads the match back out of the original at the same offsets, and a `file:line` stays true.
 *
 * The scan has two phases, in the order a markdown parser works:
 *
 * 1. Block level. Frontmatter (on request), then fences. A line whose first non-whitespace is three
 *    or more backticks or tildes opens a fence. It closes on a later line holding only a run of the
 *    same character at least as long, indented at most three columns past the opener. An unclosed
 *    fence runs to the end of the file.
 * 2. Inline level, one left-to-right pass over what phase 1 left, where the first opener wins. A
 *    backtick run opens a code span that closes on the next run of exactly the same length within
 *    the same paragraph (see `endsParagraph`); an unmatched run is literal. `{/*` and `<!--` (on
 *    request) open a comment that runs to its own closer, across paragraphs.
 *
 * Not modelled: four-space indented code blocks, fences inside blockquotes, and container-relative
 * indentation (an opener's own indentation stands in for its container's).
 */

const FRONTMATTER = /^---\r?\n[\s\S]*?\n---[ \t]*(?:\r?\n|$)/;

const FENCE_OPEN = /^[ \t]*(`{3,}|~{3,})/;

export type CodeRegionKind = 'frontmatter' | 'fence' | 'inlineCode' | 'mdxComment' | 'htmlComment';

/** A half-open `[start, end)` range into the source. */
export interface CodeRegion {
  kind: CodeRegionKind;
  start: number;
  end: number;
}

/** Fences and inline code are on by default; frontmatter and both comment forms are off. */
export interface CodeRegionOptions {
  fences?: boolean;
  inlineCode?: boolean;
  frontmatter?: boolean;
  htmlComments?: boolean;
  mdxComments?: boolean;
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

function* scanFences(source: string, bodyStart: number): Generator<{ start: number; end: number }> {
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
    const fence = marker.startsWith('~') ? '~' : '`';
    // CommonMark: a closing fence is the same character, at least as long as the opener, indented
    // at most three columns more, with only whitespace after it. Checked with string operations
    // rather than a RegExp built from the source, so no scanned text ever becomes a pattern.
    const closesFence = (line: string): boolean => {
      let column = 0;
      while (column < line.length && (line[column] === ' ' || line[column] === '\t')) column++;
      if (column > indent + 3) return false;
      let run = column;
      while (run < line.length && line[run] === fence) run++;
      if (run - column < marker.length) return false;
      return /^[ \t\r]*$/.test(line.slice(run));
    };

    let end = source.length;
    let scan = lineEnd + 1;
    while (scan <= source.length) {
      const scanEnd = lineEndFrom(source, scan);
      if (closesFence(source.slice(scan, scanEnd))) {
        end = scanEnd;
        break;
      }
      if (scanEnd >= source.length) break;
      scan = scanEnd + 1;
    }

    yield { start: cursor, end };
    cursor = end + 1;
  }
}

/** Every requested region in `source`, in source order and non-overlapping. */
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
    for (const fence of scanFences(source, bodyStart)) regions.push({ kind: 'fence', ...fence });
  }

  const enabled = { mdxComments, htmlComments };
  const wanted = COMMENTS.filter((c) => enabled[c.option]);
  if (!inlineCode && wanted.length === 0) return regions.sort((a, b) => a.start - b.start);

  // Phase 2 reads the text with phase 1 blanked, so nothing inside a fence or frontmatter opens
  // anything, and every offset still indexes `source`.
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
 * A line that interrupts or closes a paragraph, indented at most three columns: an ATX heading, a
 * blockquote, a thematic break, a setext underline, a bullet or ordered list marker, a fence
 * opener, or an HTML/JSX tag. Lines that must end at the line end allow a trailing `\r`.
 */
const BLOCK_START =
  /^[ \t]{0,3}(?:#{1,6}(?:[ \t]|$)|>|([-*_])(?:[ \t]*\1){2,}[ \t\r]*$|(?:=+|-+)[ \t\r]*$|[-+*](?:[ \t]|$)|\d{1,9}[.)](?:[ \t]|$)|`{3,}|~{3,}|<[!?/A-Za-z])/;

/** An element opened and closed on the same line is inline and interrupts nothing. */
const INLINE_ELEMENT = /^[ \t]{0,3}<([A-Za-z][\w.:-]*)(?=[\s/>])[^\n]*<\/\1[ \t]*>/;

const BLANK_LINE = /^[ \t\r]*$/;

function endsParagraph(line: string): boolean {
  if (BLANK_LINE.test(line)) return true;
  if (INLINE_ELEMENT.test(line)) return false;
  return BLOCK_START.test(line);
}

/** End offset of the next run of exactly `length` backticks in the same paragraph, or -1. */
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

/** Replace every non-newline character inside `regions` with a space, by UTF-16 code unit. */
function blank(source: string, regions: readonly CodeRegion[]): string {
  if (regions.length === 0) return source;
  const chars = source.split('');
  for (const { start, end } of regions) {
    for (let i = start; i < end; i++) if (chars[i] !== '\n') chars[i] = ' ';
  }
  return chars.join('');
}

export function maskCode(source: string, options?: CodeRegionOptions): string {
  return blank(source, codeRegions(source, options));
}

/** Fences, inline code and MDX comments; frontmatter stays visible. What content lint reads. */
export function stripCode(source: string): string {
  return maskCode(source, { mdxComments: true });
}

/**
 * Fences, inline code, frontmatter and HTML comments; MDX comments stay visible, so a link in one
 * is still checked and rewritten. What the link tooling reads.
 */
export function maskRegions(source: string): string {
  return maskCode(source, { frontmatter: true, htmlComments: true });
}
