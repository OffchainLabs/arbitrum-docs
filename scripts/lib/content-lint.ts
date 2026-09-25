/**
 * content-lint — structural defects in MDX that no existing gate can see.
 *
 * Every rule ignores fenced and inline code. That is not optional: `partials-check` R3 currently emits
 * 208 warnings that are all component-looking text inside code fences, and a rule that cannot tell
 * documentation-about-syntax from syntax is noise, not a gate.
 *
 * Rules:
 *   A1  VanillaAdmonition with an empty body — the `:::type`→component codemod moved body prose into
 *       `title=`, leaving the box blank and the prose styled as a heading.
 *   A2  VanillaAdmonition `type` outside the component's union (note|tip|info|warning|danger); anything
 *       else indexes `styles[type]` as undefined and renders unstyled.
 *   A3  Unconverted Docusaurus `:::` directive — renders as literal `:::caution` text to readers.
 *   A4  Markdown syntax inside a `title=` attribute — `title` is a plain string prop, so
 *       `[text](/docs/x)` renders literally and the link is unclickable. HTML entities are not
 *       flagged: JSX decodes those in attribute values, so they render as intended.
 *   A5  Internal link target keeping a `.md`/`.mdx` suffix — 404s at runtime.
 *   A6  `<Var>` inside a fenced code block or inline code span. MDX does not evaluate components
 *       inside code, so the reader sees the literal `<Var name="…" />` tag instead of its value.
 *       Coverage matches the shared scanner in `strip-code.ts`, which models backtick and tilde
 *       fences and run-paired inline spans: a `<Var>` inside a four-space-indented block is not
 *       flagged, that being the one code form nothing here models. Widening A6 alone would make it
 *       disagree with A1..A5 about what "code" is, so the two move together or not at all.
 *   A7  A JSX/component `src` pointing at a local (site-relative) image with no file under
 *       `public/`. `<ImageZoom src="/img/…">` is a plain `<img>`, so this is the one image path
 *       nothing else validates: `pnpm images:presence` only blocks a *remote* src on *markdown*
 *       syntax, `remarkImageOptions.useImport` only fails the build on a *local* src on *markdown*
 *       syntax, and `check-links` walks MDX links, not component props. A dead `src` here renders a
 *       broken `<img>` and every gate stays green (FS-2700). Restricted to common image extensions
 *       so a `src` pointing at a route rather than an asset is never mistaken for a missing file.
 *
 * A8, A9 and A10 are one family: HTML the browser's parser has to restructure before it can build a
 * tree. React then hydrates a client tree that does not match the server tree, throws error #418, and
 * discards and re-renders the whole subtree. Eighteen of 350 routes did this and every gate stayed
 * green, because each page still returns HTTP 200 and compiles (FS-2714). They are three ids rather
 * than one because the report groups by id and each shape has its own fix; a single "invalid nesting"
 * id would print one count covering three unrelated edits.
 *
 *   A8  A link inside a heading. Fumadocs wraps every heading's content in its own `<a href="#slug">`
 *       anchor, so a heading that already contains a link renders `<a><a>…</a></a>`, which no HTML
 *       parser can represent. Covers a markdown inline link, a reference link (`[text][ref]` and
 *       `[text][]`), a bare URL or angle autolink (GFM anchors both), and a raw `<a>` element. A
 *       markdown *image* in a heading is fine and is not flagged: `<img>` nests inside an anchor
 *       legally, and nor is `[#custom-id]`, which is how a heading pins its slug.
 *   A9  A hand-written `<p>` whose children start on the next line. MDX parses a JSX element's
 *       children as *flow* content when they are on their own lines, so remark wraps the prose in a
 *       paragraph of its own and the element becomes `<p><p>…</p></p>`. Written inline
 *       (`<p>text</p>`) the children are phrasing content, remark adds nothing, and one paragraph is
 *       rendered, verified in the built HTML, so that form is not flagged. The generated precompile
 *       partials use it (`content/partials/precompile-tables/_ArbAggregator.mdx`), and flagging it
 *       would make this rule demand an edit to a generated file (written by
 *       generate-precompile-tables.ts from fetched sources) for markup that renders correctly.
 *   A10 A `<tr>` sitting directly inside a `<table>`. The parser inserts the `<tbody>` the source
 *       omitted, so the client tree gains an element the server tree does not have. Put every row in
 *       a `<thead>`, `<tbody>` or `<tfoot>`.
 *   A11 `<Var>` inside a link destination, which never substitutes. An unbracketed CommonMark
 *       destination may not contain a space and `<Var name="…" />` holds two, so the resource fails
 *       to parse and the construct falls back to literal `[text](…)` text, with only the URL prefix
 *       before the first `<Var>` autolinked by GFM. Seventy-three links shipped that way (FS-2725)
 *       with every gate green: `vars:check` only proves the key exists, `check-links` skips external
 *       destinations, and A6 reads code fences and spans, not destinations. The fix is a
 *       `{var:name}` placeholder, which holds no space and so parses; `lib/var-links.ts` expands
 *       it. The `href=`/`to=` attribute form is flagged too, where the `<Var>` tag's own quotes end
 *       the attribute value early and truncate the URL, and so is a placeholder whose name is not an
 *       identifier: that one is left unexpanded by design and reaches the reader as literal braces.
 *
 * A12 and A13 are a pair: a fence whose closer this repo's two markdown parsers do not agree on.
 * Both are invisible to the writer and both were found by the FS-2729 sweep with every gate green.
 * They are two ids rather than one because the report groups by id and the fixes are opposite, the
 * same reasoning that keeps A8, A9 and A10 apart.
 *
 *   A12 A fence with no closer at any indentation, so it runs to the end of the file. Reader
 *       visible either way: a stray trailing fence renders an empty code box with a copy button,
 *       and a real opener whose closer went missing swallows the rest of the page into it. Fix by
 *       deleting the stray line, or by writing the closer that is missing.
 *   A13 A closer indented more than three columns past its opener. `remark-mdx` turns off indented
 *       code blocks and with them CommonMark's three-column cap on a closing fence, so the site's
 *       parser ends the fence at that line and `strip-code.ts`, which models the CommonMark
 *       column, does not. Every gate reading MDX through it (A1 to A11 here, `check-links`,
 *       `partials:check`, `images:presence`) therefore treats the lines between as fence body and
 *       stops checking them. One stray indent switched eighteen lines of a page off from all of
 *       them (FS-2743). Fix by aligning the closer with its opener, the one form both parsers read
 *       alike. The message deliberately does **not** promise the page renders correctly: on a
 *       fence that was meant to stay open past that line (an opener whose own closer is missing, or
 *       an outer fence documenting an indented inner one) MDX has already ended it early and the
 *       fix is higher up, so the message sends the writer to the rendered page before dedenting.
 *       The scanner is line-based and cannot tell those apart from the source alone.
 *
 *   A14 A `title`, `sidebar_label` or `description` frontmatter value with leading or trailing
 *       whitespace, or a doubled internal space. `description` reaches the reader verbatim in a
 *       `<meta name="description">` tag and the OG/Twitter card `generateMetadata` builds from it
 *       (`app/docs/[[...slug]]/page.tsx`), so a doubled space there is a doubled space in a search
 *       result or a social card, and `title`/`sidebar_label` reach the `<title>` tag and the
 *       sidebar tree the same way. A Zod `.trim()` in the frontmatter schema (`source.config.ts`)
 *       would repair the leading/trailing case silently; this rule reports it instead, on the
 *       theory that a generated page's whitespace defect belongs fixed at its generator (so
 *       regeneration doesn't reintroduce it) rather than papered over at read time, and a doubled
 *       internal space, which `.trim()` never touches, needs reporting either way. Checked against
 *       the raw frontmatter block, not the code-stripped `text` most rules read, because a value
 *       quoted with `'` or `"` needs to be unwrapped before whitespace inside it means anything,
 *       and nothing else in this file needs the frontmatter block for that.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { MALFORMED_VAR_PLACEHOLDER, expandVarPlaceholders, readVars } from '../../lib/var-links.ts';
import { toPosix, walk } from './partials.ts';
import { codeRegions, fenceDefects, stripCode } from './strip-code.ts';

/** Every rule id this file can report. `scripts/content-lint.ts` keys its title table on it. */
export type RuleId =
  | 'A1'
  | 'A2'
  | 'A3'
  | 'A4'
  | 'A5'
  | 'A6'
  | 'A7'
  | 'A8'
  | 'A9'
  | 'A10'
  | 'A11'
  | 'A12'
  | 'A13'
  | 'A14';

/** One defect in one source string. `line` is 1-indexed. */
export interface Finding {
  rule: RuleId;
  line: number;
  message: string;
}

/** A finding located in a file, `rel` being its repo-root-relative POSIX path. */
export interface FileFinding extends Finding {
  rel: string;
}

export interface LintContentOptions {
  /** Directory to walk, relative to the repo root. Ignored when `files` is given. */
  dir?: string;
  /** Lint only these paths (absolute or repo-root-relative) instead of walking `dir`. */
  files?: readonly string[];
}

/** A local image `src` found on a JSX element, with the element's name and 1-indexed line. */
export interface LocalImageSrc {
  element: string;
  src: string;
  line: number;
}

export const ADMONITION_TYPES: ReadonlySet<string> = new Set([
  'note',
  'tip',
  'info',
  'warning',
  'danger',
]);
const isMdx = (p: string): boolean => /\.mdx?$/i.test(p);

// Re-exported so this file stays the import site every rule and test already uses. The definition
// moved to `strip-code.ts` (FS-2723) because the partials tooling needs the same answer to "what
// counts as code", and `content-lint.ts` imports `partials.ts`, so it cannot be the shared home.
export { stripCode };

const lineOf = (source: string, index: number): number => source.slice(0, index).split('\n').length;

/**
 * `content/vars.json`, read once on the first rule that needs it and kept.
 *
 * Lazy rather than read at module load, because `lintSource` is the unit every test drives and a
 * file read at import time would run in each of them for a rule most of them never reach.
 */
let varsCache: Record<string, unknown> | undefined;
const vars = (): Record<string, unknown> => (varsCache ??= readVars());

export function lintSource(source: string): Finding[] {
  const findings: Finding[] = [];
  const text: string = stripCode(source);
  const add = (rule: RuleId, index: number, message: string) =>
    findings.push({ rule, line: lineOf(text, index), message });

  // A1 + A2 + A4 — walk every admonition opening tag.
  //
  // Match against the code-stripped text so admonitions *documented inside* a fence are ignored, but
  // read attribute values from the original source at the same offsets: `stripCode` blanks characters
  // 1:1, so offsets are identical, and an inline-code span inside `title=` would otherwise be erased
  // before A4 could see it.
  for (const m of text.matchAll(/<VanillaAdmonition\b([^>]*?)(\/?)>/g)) {
    const [full, , selfClose] = m;
    const attrs = source.slice(m.index, m.index + full.length);
    const type = attrs.match(/\btype\s*=\s*["']([^"']*)["']/)?.[1];

    if (type !== undefined && !ADMONITION_TYPES.has(type)) {
      add('A2', m.index, `type="${type}" is not one of ${[...ADMONITION_TYPES].join('|')}`);
    }

    let body: string | null = null;
    if (selfClose === '/') body = '';
    else {
      // Locate the closer in the code-stripped text (so a closer inside a fence is ignored) but
      // read the body from `source`: a body consisting only of a fenced code block is all spaces
      // in `text`, which used to report a populated admonition as empty.
      const close = text.indexOf('</VanillaAdmonition>', m.index + full.length);
      if (close !== -1) body = source.slice(m.index + full.length, close);
    }
    if (body !== null && body.trim() === '') {
      add('A1', m.index, 'admonition body is empty — body prose likely moved into title=');
    }

    // A4 — `title` is a plain string prop, so markdown in it is printed verbatim.
    //
    // Match the closing quote to the opening one: `["']([^"']*)["']` stops at the first apostrophe
    // inside a double-quoted value ("…doesn't…"), truncating the title and hiding any markup after
    // it — that under-reported A4 by 4 findings.
    //
    // HTML entities are deliberately NOT flagged: JSX decodes them in attribute values, so
    // `title="L1 fee &quot;baked in&quot;"` renders as `L1 fee "baked in"` (verified in a browser).
    const title = attrs.match(/\btitle\s*=\s*(["'])((?:(?!\1).)*)\1/)?.[2];
    if (title) {
      const problems: string[] = [];
      if (/\]\(/.test(title)) problems.push('markdown link');
      if (/`/.test(title)) problems.push('inline code');
      if (problems.length) {
        add('A4', m.index, `title= contains ${problems.join(' + ')} which renders literally`);
      }
    }
  }

  // A3 — a line beginning with ::: outside code.
  for (const m of text.matchAll(/^[ \t]*:::+[^\n]*/gm)) {
    add('A3', m.index, `unconverted Docusaurus directive: ${m[0].trim().slice(0, 60)}`);
  }

  // A5 — internal link targets that keep a .md/.mdx suffix.
  //
  // The destination is judged after `{var:name}` expansion, the way `check-links` judges one
  // (`expandRefUrl` in `doc-links.ts`). A destination that opens with a placeholder holding an
  // absolute URL is external once expanded, and reads as a relative path before: the contribute
  // guide's links to this repository's own `CONTRIBUTE.md` and `STYLE-GUIDE.md` are exactly that
  // shape (FS-2733). Judging the written string would flag a `.md` suffix that is correct, since
  // the destination is a file in a git repository and not a route on this site.
  const internal = (t: string) => t && !/^(?:[a-z]+:|\/\/|#)/i.test(t);
  const resolved = (t: string): string => expandVarPlaceholders(t, vars());
  for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    const target = resolved(m[1]);
    if (internal(target) && /\.mdx?(?:#[^)]*)?$/i.test(target)) {
      add('A5', m.index, `link target keeps a .md/.mdx suffix: ${m[1]}`);
    }
  }
  for (const m of text.matchAll(/\b(?:href|to)\s*=\s*["']([^"']+)["']/g)) {
    const target = resolved(m[1]);
    if (internal(target) && /\.mdx?(?:#[^"']*)?$/i.test(target)) {
      add('A5', m.index, `link target keeps a .md/.mdx suffix: ${m[1]}`);
    }
  }

  // A6: `<Var>` used inside code. MDX does not evaluate components inside a fenced block or an
  // inline code span, so the reader sees the literal `<Var name="…" />` tag, not its value.
  //
  // This is the one rule that looks *inside* code rather than past it, so it asks the shared scanner
  // for the regions themselves instead of the masked text. Same scanner as every other rule, so A6
  // cannot drift from A1..A5 about what "code" is (FS-2729); it used to carry its own copy of two
  // fence regexes, which is exactly how that drift happens.
  const varRe = /<Var\b[^>]*\/?>/g;
  const where: Record<'fence' | 'inlineCode', string> = {
    fence: 'a fenced code block',
    inlineCode: 'an inline code span',
  };
  for (const region of codeRegions(source, { mdxComments: true })) {
    if (region.kind !== 'fence' && region.kind !== 'inlineCode') continue;
    for (const vm of source.slice(region.start, region.end).matchAll(varRe)) {
      add(
        'A6',
        region.start + vm.index,
        `<Var> inside ${where[region.kind]} renders as a literal tag, not its value`,
      );
    }
  }

  // A11: `<Var>` inside a link destination. Read from the code-stripped text like every rule but
  // A6, so a page documenting the broken form inside a fence is not flagged for it.
  //
  // The markdown probe stops at the first `)` or newline, which is where a destination ends, so a
  // `<Var>` in the link *text* (`[<Var name="x" />](/docs/y)`) is outside the match and stays legal:
  // the label is parsed as inline content, where a component does substitute.
  for (const m of text.matchAll(/\]\([^)\n]*<Var\b/g)) {
    add(
      'A11',
      m.index,
      '<Var> inside a link destination: the destination holds a space, so the link never parses and ships as literal [text](…). Use a {var:name} placeholder instead',
    );
  }
  // The attribute form. The value class excludes both quote characters, so the match ends at the
  // `<Var>` tag's own `name="` quote, which is precisely why this shape is broken.
  for (const m of text.matchAll(/\b(?:href|to|src)\s*=\s*(["'])[^"'<>]*<Var\b/g)) {
    add(
      'A11',
      m.index,
      '<Var> inside an href/to/src attribute: its quotes end the attribute value early, truncating the URL. Use a {var:name} placeholder instead',
    );
  }
  // A placeholder whose name is not an identifier. `expandVarPlaceholders` leaves it alone by
  // design, so it reaches the reader as literal braces inside a URL, the same silent shape as the
  // two probes above, reached by a typo rather than by the old syntax.
  for (const m of text.matchAll(MALFORMED_VAR_PLACEHOLDER)) {
    add('A11', m.index, `${m[0]} is not a usable placeholder; the name must be a variable key`);
  }

  // A12 + A13: a fence whose closer the CommonMark scanner and the MDX renderer read differently.
  //
  // Asks the shared scanner about the fence boundary itself rather than about what is inside it, so
  // a rule about where a fence ends cannot disagree with the masking every other rule acts on. Read
  // from `source`, not `text`: a fence is exactly what `stripCode` blanks, so the masked text has
  // nothing left to look at.
  for (const defect of fenceDefects(source)) {
    if (defect.kind === 'unclosed') {
      add(
        'A12',
        defect.start,
        'fenced code block is never closed, so it runs to the end of the file: a stray trailing fence renders an empty code box, and a real opener swallows the rest of the page',
      );
    } else {
      add(
        'A13',
        defect.closerStart,
        "fence closer indented more than three columns past its opener. The site's MDX parser ends the fence at this line; CommonMark, and every gate that masks code through strip-code.ts, does not, so all of them read the lines between as fence body and stop checking them. Align this closer with its opener. If the fence was meant to stay open past this line, read the rendered page before dedenting: MDX has ended it here already, so the real fix is a missing or too-short fence delimiter higher up (the opener as well as the closer, when an outer fence documents an inner one)",
      );
    }
  }

  // A14: a title/sidebar_label/description frontmatter value with leading/trailing whitespace or a
  // doubled internal space. Read from `source`, not `text`: `stripCode`'s inline-code masking
  // scans the whole file for backtick pairs with no notion of a YAML string's quoting, so a
  // frontmatter value like `` description: 'a minimal `entrypoint` function' `` comes back from
  // `stripCode` with `` `entrypoint` `` blanked to spaces, which this rule would misread as a
  // doubled space of its own. Line numbers still line up: `stripCode` blanks 1:1, never changing
  // length or newline positions, so an offset found in `source` is valid against `text` too. A
  // quoted value ('…' or "…") has its quotes stripped before the whitespace check runs, so the
  // quote characters themselves are never mistaken for the reported whitespace. The `[ \t]*` right
  // after the field name absorbs every space between the colon and the value on purpose: in real
  // YAML that run is separator, not content, so `title:  x` and `title: x` name the same value and
  // neither is a defect (only *trailing* whitespace, and any doubled run in the middle, is real).
  //
  // Whitespace at the *end of the line* is separator too, and comes off before the quote test for
  // the same reason: YAML ends a scalar at the last non-space character of the line, so
  // `description: 'Clean'` followed by two spaces holds the value `Clean`, and so does
  // `description: Clean` followed by two spaces (measured, against js-yaml and against Prettier,
  // which normalizes neither). Judging the untrimmed line instead failed the quote test (the line
  // no longer ends in a quote), kept the quote characters inside the value, and reported a
  // "doubled internal space" that was neither internal nor in the value. It is still reported, as
  // its own problem with its own wording, because nothing else in the toolchain removes it. The
  // doubled-space probe reads the trimmed value for the same naming reason: a run at the end is
  // already reported as trailing whitespace, and calling it internal sends the writer looking in
  // the middle of a string for a space that is not there.
  //
  // Not covered: a folded or literal block scalar (`description: >` or `| `, with the text on the
  // following indented lines). The value is not on this line at all, so the rule skips it rather
  // than reading the indicator as the value. There are none in `content/` today, and the
  // frontmatter contract gives no reason to reach for one; see INTERNALS.md for the note.
  const fmMatch = source.match(/^---\r?\n[\s\S]*?\n---[ \t]*(?:\r?\n|$)/);
  if (fmMatch) {
    const fmBlock = fmMatch[0];
    for (const m of fmBlock.matchAll(/^(title|sidebar_label|description):[ \t]*(.*)$/gm)) {
      const [, field] = m;
      const line = m[2].replace(/\r$/, '');
      const raw = line.replace(/[ \t]+$/, '');
      if (/^[|>][0-9+-]*$/.test(raw)) continue;
      const quoted = /^(['"])[\s\S]*\1$/.test(raw);
      const value = quoted ? raw.slice(1, -1) : raw;
      const problems: string[] = [];
      if (/^\s|\s$/.test(value)) problems.push('leading or trailing whitespace');
      if (/ {2,}/.test(value.trim())) problems.push('a doubled internal space');
      if (raw !== line) problems.push('trailing whitespace on the line, outside the value');
      if (problems.length) {
        add('A14', m.index, `${field}: ${problems.join(' and ')}`);
      }
    }
  }

  // A8: a link inside an ATX heading, which Fumadocs renders as an anchor inside its own anchor.
  //
  // Read the heading from the code-stripped text, so a heading shown inside a fence is skipped and
  // an inline code span in the heading (`### `https://x``) cannot be mistaken for an autolink.
  //
  // When a heading's slug is load-bearing, the escape hatch is Fumadocs' `[#custom-id]` syntax:
  // drop the link, then pin the old anchor with `## Heading text [#old-slug]`. That form is a lone
  // bracket pair, so no probe below fires on it, and there is a test pinning that.
  //
  // Known gap: a *shortcut* reference link (`[ref]` with its definition elsewhere in the file) is
  // character-for-character the shape of `[#custom-id]` and cannot be told apart without resolving
  // definitions, so it is not probed. The full and collapsed forms (`[text][ref]`, `[text][]`) are.
  for (const m of text.matchAll(/^#{1,6}[ \t]+([^\n]*)$/gm)) {
    const heading = m[1];
    const problems: string[] = [];

    // An inline or reference link, but not an image: `<img>` nests inside an anchor legally. The
    // alternation in the label allows one level of nested brackets, which is what
    // `[`#[storage]`](…)` needs.
    if (/(?<!!)\[(?:[^[\]]|\[[^[\]]*\])*\](?:\([^)]*\)|\[[^[\]]*\])/.test(heading)) {
      problems.push('a markdown link');
    }
    if (/<a[\s>]/i.test(heading)) problems.push('an <a> element');

    // Whatever is left once every link (and its destination) is removed. GFM turns a bare URL in
    // text into an anchor, so it nests exactly the same way a written-out link does. The tag strip
    // requires a real element name (letters, then an attribute list or the closer), so an angle
    // autolink such as `<https://x>` is not mistaken for a tag and erased: its `:` ends the name.
    const withoutLinks = heading
      .replace(/!?\[(?:[^[\]]|\[[^[\]]*\])*\](?:\([^)]*\)|\[[^[\]]*\])/g, ' ')
      .replace(/<\/?[A-Za-z][A-Za-z0-9.-]*(?:\s[^>]*)?\/?>/g, ' ');
    if (/(?:https?:\/\/|\bwww\.)\S/i.test(withoutLinks)) problems.push('a bare URL');

    if (problems.length) {
      add(
        'A8',
        m.index,
        `heading contains ${problems.join(' + ')}; Fumadocs wraps heading content in its own anchor, so this nests <a> inside <a>`,
      );
    }
  }

  // A9: a hand-written <p> whose opening tag ends its line, so its children are flow content and
  // remark wraps them in a paragraph of its own. See the header comment for why the inline form
  // (`<p>text</p>`) is left alone.
  for (const m of text.matchAll(/<p\b[^>]*>[ \t]*(?=\r?\n)/g)) {
    add(
      'A9',
      m.index,
      'hand-written <p> around block content; markdown wraps that prose in a paragraph already, so this renders <p> inside <p>',
    );
  }

  // A10: a <tr> that is a direct child of <table>, with no <thead>/<tbody>/<tfoot> between them.
  // Tracked with a depth counter rather than a regex, because the sections may appear in any order
  // and a table may hold several of them.
  for (const table of text.matchAll(/<table[\s>][\s\S]*?<\/table>/g)) {
    let depth = 0;
    for (const tok of table[0].matchAll(/<(\/?)(thead|tbody|tfoot|tr)\b/gi)) {
      const [, closing, name] = tok;
      if (name.toLowerCase() === 'tr') {
        if (depth === 0 && !closing) {
          add(
            'A10',
            table.index + tok.index,
            '<tr> is a direct child of <table>; the browser inserts the missing <tbody>, so put every row in a <thead>, <tbody> or <tfoot>',
          );
        }
        continue;
      }
      depth += closing ? -1 : 1;
    }
  }

  return findings.sort((a, b) => a.line - b.line || a.rule.localeCompare(b.rule));
}

/**
 * A JSX element's `src` attribute, when it is a local (site-relative) path to a common image
 * format. Mirrors `extractRemoteImages`' `JSX_SRC` in `remote-images.ts` (any element, either
 * quote style, tolerant of a `{'…'}` wrapper), restricted by extension rather than by an
 * element allowlist so a new image-taking component needs no update here — the allowlist would
 * only need to grow, never shrink, and a missed entry would silently exempt a component.
 *
 * Markdown-syntax local images are deliberately not this function's business:
 * `remarkImageOptions.useImport` already fails the build on those.
 */
const JSX_LOCAL_IMAGE_SRC = /<([A-Za-z][\w.]*)\b[^>]*?\bsrc\s*=\s*["'{]\s*["']?(\/[^"'\s{}]+)/g;
const LOCAL_IMAGE_EXT = /\.(?:png|jpe?g|svg|gif|webp|avif)(?:[?#][^"'\s{}]*)?$/i;

export function extractLocalImageSrcs(source: string): LocalImageSrc[] {
  const text: string = stripCode(source);
  const found: LocalImageSrc[] = [];
  for (const m of text.matchAll(JSX_LOCAL_IMAGE_SRC)) {
    if (!LOCAL_IMAGE_EXT.test(m[2])) continue;
    found.push({ element: m[1], src: m[2], line: lineOf(text, m.index) });
  }
  return found;
}

/**
 * A7 findings for one file's source: every local image `src` with no counterpart under
 * `public/`. Needs `repoRoot` to resolve the file on disk, which is why this lives beside
 * `lintContent` rather than inside the pure, fs-free `lintSource`.
 */
function lintLocalImages(repoRoot: string, source: string): Finding[] {
  return extractLocalImageSrcs(source).flatMap(({ element, src, line }): Finding[] => {
    const clean = src.split(/[?#]/)[0];
    if (existsSync(path.join(repoRoot, 'public', clean))) return [];
    return [{ rule: 'A7', line, message: `${element} src="${src}" has no file at public${clean}` }];
  });
}

/**
 * Lint every MDX file under `content/`, newest-defect-first by rule then path.
 *
 * Pass `files` (absolute or repo-root-relative paths) to lint only those files instead of
 * walking `dir` — used by the pre-commit hook (lint-staged) so a single-file commit does not
 * pay for a full-tree walk. Non-MDX paths in `files` are silently skipped, matching the walk's
 * own `isMdx` filter.
 */
export function lintContent(
  repoRoot: string,
  { dir = 'content', files }: LintContentOptions = {},
): FileFinding[] {
  const out: FileFinding[] = [];
  const targets: string[] = files
    ? files.map((f) => (path.isAbsolute(f) ? f : path.resolve(repoRoot, f))).filter(isMdx)
    : walk(path.join(repoRoot, dir), isMdx);
  for (const abs of targets) {
    const rel: string = toPosix(path.relative(repoRoot, abs));
    const source = readFileSync(abs, 'utf8');
    const findings = [...lintSource(source), ...lintLocalImages(repoRoot, source)].sort(
      (a, b) => a.line - b.line || a.rule.localeCompare(b.rule),
    );
    for (const f of findings) out.push({ rel, ...f });
  }
  return out;
}
