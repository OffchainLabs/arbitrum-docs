import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { extractLocalImageSrcs, lintContent, lintSource, stripCode } from './content-lint.ts';

const rules = (src: string): string[] => lintSource(src).map((f) => f.rule);

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

test('A3 does NOT fire inside an inline code span', () => {
  // The contribute guide names the syntax it forbids, so both code forms have to stay quotable.
  assert.deepEqual(rules('Never write a `:::caution` directive here.'), []);
});

test('A3 does NOT fire inside an indented or tilde fence', () => {
  assert.deepEqual(rules('Text:\n\n  ```md\n  :::note\n  ```\n'), []);
  assert.deepEqual(rules('~~~md\n:::note\n~~~'), []);
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

test('A5 judges a destination after {var:…} expansion, not as written', () => {
  // `docsRepositoryUrl` holds an absolute URL, so this destination is external once expanded even
  // though it opens with a brace and reads as a relative path (FS-2733). A `.md` suffix on a file
  // in a git repository is correct, and flagging it would be telling the writer to break the link.
  assert.deepEqual(
    rules('[x]({var:docsRepositoryUrl}/blob/{var:docsRepositoryBranch}/CONTRIBUTE.md#types)'),
    [],
  );
  assert.deepEqual(rules('<a href="{var:docsRepositoryUrl}/blob/main/STYLE-GUIDE.md">x</a>'), []);
  // A placeholder that expands to nothing external leaves an internal target, still a defect.
  assert.deepEqual(rules('[x](/docs/{var:nitroRepositorySlug}/b.mdx)'), ['A5']);
});

test('findings carry 1-indexed line numbers', () => {
  const found = lintSource('line1\nline2\n:::note\n');
  assert.equal(found[0].line, 3);
});

test('A6 does NOT fire on a Var in prose', () => {
  assert.deepEqual(rules('The current release is <Var name="nitroVersionTag" />.'), []);
});

test('A6 fires on a Var in a fenced code block', () => {
  const found = lintSource('```shell\ndocker run <Var name="latestNitroNodeImage" /> keygen\n```');
  assert.deepEqual(
    found.map((f) => f.rule),
    ['A6'],
  );
  assert.match(found[0].message, /fenced code block/);
});

test('A6 fires on a Var in an inline code span', () => {
  const found = lintSource('The image: `<Var name="latestNitroNodeImage" />`');
  assert.deepEqual(
    found.map((f) => f.rule),
    ['A6'],
  );
  assert.match(found[0].message, /inline code span/);
});

test('A6 fires on a Var in a double-backtick span, which the old scanner missed', () => {
  assert.deepEqual(rules('a ``<Var name="x" /> and a ` tick`` b'), ['A6']);
});

test('A6 does NOT fire on a Var inside an MDX comment, which renders nothing at all', () => {
  assert.deepEqual(rules('{/* `<Var name="x" />` */}'), []);
});

test('A6 checks fenced blocks inside a partial too', () => {
  // Partials have no frontmatter and are consumed via <include>, but lintSource itself is
  // frontmatter-agnostic: it is only ever handed the raw text of one file, partial or page.
  const found = lintSource(
    '<include cwd>content/partials/_reference-nitro-cli.mdx</include>\n\n```shell\n<Var name="latestNitroNodeImage" />\n```',
  );
  assert.deepEqual(
    found.map((f) => f.rule),
    ['A6'],
  );
});

test('extractLocalImageSrcs finds an ImageZoom local src', () => {
  const found = extractLocalImageSrcs('<ImageZoom src="/img/a.png" alt="a" />');
  assert.deepEqual(found, [{ element: 'ImageZoom', src: '/img/a.png', line: 1 }]);
});

test('extractLocalImageSrcs handles a multi-line JSX opening tag', () => {
  // Line is where the tag opens, matching extractRemoteImages' own convention — not where `src=`
  // itself sits, which for a multi-line tag is a line later.
  const source = ['<ImageZoom', '  src="/img/a.svg"', '  alt="a"', '/>'].join('\n');
  const found = extractLocalImageSrcs(source);
  assert.deepEqual(found, [{ element: 'ImageZoom', src: '/img/a.svg', line: 1 }]);
});

test('extractLocalImageSrcs ignores a remote src', () => {
  assert.deepEqual(extractLocalImageSrcs('<ImageZoom src="https://example.com/a.png" />'), []);
});

test('extractLocalImageSrcs ignores a local src with no image extension', () => {
  assert.deepEqual(extractLocalImageSrcs('<a href="/docs/a">x</a>'), []);
});

test('extractLocalImageSrcs ignores a src inside a fenced code block', () => {
  assert.deepEqual(extractLocalImageSrcs('```mdx\n<ImageZoom src="/img/a.png" />\n```'), []);
});

test('extractLocalImageSrcs accepts every common image extension', () => {
  for (const ext of ['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp', 'avif']) {
    const found = extractLocalImageSrcs(`<ImageZoom src="/img/a.${ext}" />`);
    assert.equal(found.length, 1, ext);
  }
});

test('extractLocalImageSrcs strips a query string or fragment before matching the extension', () => {
  assert.deepEqual(extractLocalImageSrcs('<ImageZoom src="/img/a.png?v=2" />'), [
    { element: 'ImageZoom', src: '/img/a.png?v=2', line: 1 },
  ]);
});

test('A7 fires when a local image src has no file under public/', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'content-lint-'));
  try {
    mkdirSync(path.join(root, 'content'), { recursive: true });
    mkdirSync(path.join(root, 'public', 'img'), { recursive: true });
    writeFileSync(path.join(root, 'public', 'img', 'present.png'), 'x');

    const page = path.join(root, 'content', 'page.mdx');
    writeFileSync(
      page,
      [
        '<ImageZoom src="/img/present.png" alt="ok" />',
        '<ImageZoom src="/img/missing.png" alt="broken" />',
      ].join('\n'),
    );

    const found = lintContent(root);
    assert.deepEqual(
      found.map((f) => f.rule),
      ['A7'],
    );
    assert.equal(found[0].line, 2);
    assert.match(found[0].message, /missing\.png/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('A7 ignores a remote src and a non-image src', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'content-lint-'));
  try {
    mkdirSync(path.join(root, 'content'), { recursive: true });
    const page = path.join(root, 'content', 'page.mdx');
    writeFileSync(
      page,
      ['<ImageZoom src="https://example.com/a.png" />', '<a href="/docs/missing-page">x</a>'].join(
        '\n',
      ),
    );

    assert.deepEqual(lintContent(root), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('lintContent({ files }) lints only the given files, not the whole tree', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'content-lint-'));
  try {
    mkdirSync(path.join(root, 'content'), { recursive: true });
    const clean = path.join(root, 'content', 'clean.mdx');
    const dirty = path.join(root, 'content', 'dirty.mdx');
    writeFileSync(clean, 'nothing wrong here\n');
    writeFileSync(dirty, ':::caution\nbad\n:::\n');

    // Walking the whole tree finds both ::: lines in dirty.mdx, none in clean.mdx.
    assert.equal(lintContent(root).length, 2);

    // Restricting to one file (repo-root-relative) finds only that file's findings.
    const onlyClean = lintContent(root, { files: ['content/clean.mdx'] });
    assert.deepEqual(onlyClean, []);

    const onlyDirty = lintContent(root, { files: [dirty] });
    assert.equal(onlyDirty.length, 2);
    assert.ok(onlyDirty.every((f) => f.rel === 'content/dirty.mdx'));

    // A non-mdx path in `files` is silently skipped.
    const nonMdx = path.join(root, 'content', 'readme.txt');
    writeFileSync(nonMdx, ':::caution\n:::\n');
    assert.deepEqual(lintContent(root, { files: [nonMdx] }), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// A8, A9, A10: HTML the browser's parser has to restructure, which makes the
// hydrated client tree differ from the server tree (React error #418, FS-2714).
// ---------------------------------------------------------------------------

test('A8 fires on a markdown link in a heading', () => {
  const found = lintSource('### [`ReadyEVMForL2`](https://github.com/x/y/blob/sha/a.go#L47)\n');
  assert.deepEqual(
    found.map((f) => f.rule),
    ['A8'],
  );
  assert.match(found[0].message, /markdown link/);
});

test('A8 fires on a link that is only part of the heading text', () => {
  assert.deepEqual(rules('## Step 2. Clone the [nitro-testnode](https://example.com) repo\n'), [
    'A8',
  ]);
});

test('A8 handles a link label that contains brackets', () => {
  assert.deepEqual(rules('### [`#[storage]`](https://docs.rs/x)\n'), ['A8']);
});

test('A8 fires on a bare URL in a heading, which GFM autolinks', () => {
  const found = lintSource('### 1. Load Remix: https://remix.ethereum.org\n');
  assert.deepEqual(
    found.map((f) => f.rule),
    ['A8'],
  );
  assert.match(found[0].message, /bare URL/);
});

test('A8 fires on a raw <a> element in a heading', () => {
  const found = lintSource('## <a href="https://example.com">Venly</a>\n');
  assert.ok(found.some((f) => f.rule === 'A8' && /<a> element/.test(f.message)));
});

test('A8 fires on an angle autolink in a heading', () => {
  const found = lintSource('## See <https://example.com>\n');
  assert.deepEqual(
    found.map((f) => f.rule),
    ['A8'],
  );
  assert.match(found[0].message, /bare URL/);
});

test('A8 fires on a reference-style link in a heading', () => {
  assert.deepEqual(rules('## See [the docs][ref]\n\n[ref]: https://example.com\n'), ['A8']);
});

test('A8 fires on a collapsed reference link in a heading', () => {
  assert.deepEqual(rules('## See [the docs][]\n\n[the docs]: https://example.com\n'), ['A8']);
});

test('A8 does NOT fire on a plain heading, or on a link in body prose', () => {
  assert.deepEqual(rules('## Plain heading\n\nBody with a [link](https://example.com).\n'), []);
});

test('A8 does NOT fire on a URL inside an inline code span in a heading', () => {
  assert.deepEqual(rules('### Point the node at `https://example.com`\n'), []);
});

test('A8 does NOT fire on a heading shown inside a fenced code block', () => {
  assert.deepEqual(rules('```md\n### [text](https://example.com)\n```\n'), []);
});

test('A8 does NOT fire on an image in a heading, since <img> nests inside an anchor legally', () => {
  assert.deepEqual(rules('## ![logo](/img/logo.png)\n'), []);
});

// Fumadocs' `[#custom-id]` pins a heading's slug and is the escape hatch when a slug is
// load-bearing, so A8 has to stay silent on it. It is a lone bracket pair, which is also the
// shape of a shortcut reference link, which is why that one form is out of A8's reach.
test('A8 does NOT fire on a [#custom-id] slug override', () => {
  assert.deepEqual(rules('## Heading text [#custom-id]\n'), []);
});

test('A9 fires on a <p> whose children start on the next line', () => {
  const found = lintSource('<p>\n  Some prose.\n</p>\n');
  assert.deepEqual(
    found.map((f) => f.rule),
    ['A9'],
  );
  assert.match(found[0].message, /<p> inside <p>/);
});

test('A9 does NOT fire on an inline <p>, which renders a single paragraph', () => {
  assert.deepEqual(rules('<p>Some prose.</p>\n'), []);
});

test('A9 does NOT fire on a <p> inside a fenced code block', () => {
  assert.deepEqual(rules('```html\n<p>\n  Some prose.\n</p>\n```\n'), []);
});

test('A10 fires on every <tr> that is a direct child of <table>', () => {
  const found = lintSource(
    '<table className="small-table">\n  <tr>\n    <th>a</th>\n  </tr>\n  <tr>\n    <td>b</td>\n  </tr>\n</table>\n',
  );
  assert.deepEqual(
    found.map((f) => f.rule),
    ['A10', 'A10'],
  );
  assert.match(found[0].message, /direct child of <table>/);
});

test('A10 does NOT fire when the rows sit in a <thead>/<tbody>', () => {
  assert.deepEqual(
    rules(
      '<table>\n  <thead>\n    <tr>\n      <th>a</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>b</td>\n    </tr>\n  </tbody>\n</table>\n',
    ),
    [],
  );
});

test('A10 does NOT fire on a markdown table', () => {
  assert.deepEqual(rules('| a | b |\n| - | - |\n| 1 | 2 |\n'), []);
});

test('A10 does NOT fire on a table inside a fenced code block', () => {
  assert.deepEqual(rules('```html\n<table>\n  <tr>\n    <td>a</td>\n  </tr>\n</table>\n```\n'), []);
});

test('A11 fires on a <Var> inside a markdown link destination', () => {
  const found = lintSource(
    '[Interface](https://github.com/OffchainLabs/<Var name="nitroRepositorySlug" />/blob/x.sol)',
  );
  assert.deepEqual(
    found.map((f) => f.rule),
    ['A11'],
  );
  assert.match(found[0].message, /\{var:name\} placeholder/);
});

test('A11 fires once per broken destination, not once per <Var> in it', () => {
  // Three variables, one link, one fix: the finding is the link.
  const found = lintSource(
    '[Impl](https://github.com/OffchainLabs/<Var name="a" />/blob/<Var name="b" />/<Var name="c" />/x.go)',
  );
  assert.equal(found.length, 1);
  assert.equal(found[0].rule, 'A11');
});

test('A11 reports one finding per broken link on a line with several', () => {
  const found = lintSource(
    '[A](https://x/<Var name="a" />/1.sol) and [B](https://x/<Var name="b" />/2.go)',
  );
  assert.deepEqual(
    found.map((f) => f.rule),
    ['A11', 'A11'],
  );
});

test('A11 does NOT fire on a <Var> in the link text', () => {
  // The label is parsed as inline content, where a component does substitute.
  assert.deepEqual(rules('[<Var name="nitroVersionTag" />](/docs/run-a-node/start-here)'), []);
});

test('A11 does NOT fire on a placeholder destination, which is the fix', () => {
  assert.deepEqual(
    rules(
      '[Interface](https://github.com/OffchainLabs/{var:nitroRepositorySlug}/blob/{var:nitroVersionTag}/x.sol)',
    ),
    [],
  );
});

test('A11 does NOT fire inside a fenced code block', () => {
  // A6 still does, and should: it is the one rule that reads inside code, because a `<Var>` shipped
  // as a literal tag is the defect it looks for. A11 reads the code-stripped text like every other
  // rule, so a page documenting the broken form is never told to fix its own example.
  assert.deepEqual(
    rules('```mdx\n[Interface](https://x/<Var name="nitroVersionTag" />/y.sol)\n```\n'),
    ['A6'],
  );
});

test('A11 fires on a <Var> inside an href attribute', () => {
  const found = lintSource('<a href="https://x/<Var name="nitroVersionTag" />/y">link</a>');
  assert.deepEqual(
    found.map((f) => f.rule),
    ['A11'],
  );
  assert.match(found[0].message, /attribute value early/);
});

test('A11 fires on a malformed placeholder, which never expands', () => {
  const found = lintSource('[x](https://y/{var:two words}/z)');
  assert.deepEqual(
    found.map((f) => f.rule),
    ['A11'],
  );
  assert.match(found[0].message, /not a usable placeholder/);
});

test('A11 does NOT fire on a URL that documents a path template', () => {
  assert.deepEqual(rules('[API](https://api.example.com/v1/{chainId}/blocks)'), []);
});

test('A11 fires on a <Var> inside a src attribute, which the plugin also rewrites', () => {
  const found = lintSource('<ImageZoom src="https://x/<Var name="nitroVersionTag" />/i.png" />');
  assert.deepEqual(
    found.map((f) => f.rule),
    ['A11'],
  );
  assert.match(found[0].message, /attribute value early/);
});

test('A11 fires on a <Var> inside a markdown image destination', () => {
  // `![alt](…)` ends in the same `](` the link probe reads, so an image is covered by it.
  assert.deepEqual(rules('![a](https://x/<Var name="nitroVersionTag" />/i.png)'), ['A11']);
});

// --- A12 and A13: a fence whose closer the two parsers read differently (FS-2743) ---------------

test('A12 fires on a stray trailing fence, which renders an empty code box', () => {
  const found = lintSource('- a bullet list\n- and another\n```\n');
  assert.deepEqual(
    found.map((f) => f.rule),
    ['A12'],
  );
  assert.equal(found[0].line, 3);
  assert.match(found[0].message, /never closed/);
});

test('A12 fires on an opener whose closer is missing, which swallows the page tail', () => {
  assert.deepEqual(rules('# Title\n\n```js\nconst x = 1;\n\nmore prose\n'), ['A12']);
});

test('A12 does NOT fire on a closed fence', () => {
  assert.deepEqual(rules('```js\nconst x = 1;\n```\n'), []);
});

test('A13 fires on a closer indented four columns past an unindented opener', () => {
  const found = lintSource('```json\n{"a":1}\n    ```\n');
  assert.deepEqual(
    found.map((f) => f.rule),
    ['A13'],
  );
  // The closer's line, not the opener's: that is where the one-character fix goes.
  assert.equal(found[0].line, 3);
  assert.match(found[0].message, /indented more than three columns/);
});

test('A13 reports the over-indented closer, not the conforming one further down', () => {
  // The shape that actually occurred in `content/`. Every other A13 case here has no conforming
  // closer at all, so the strict offset is -1 and the line arithmetic on it lands on the asserted
  // line by coincidence; this input is the one that distinguishes the two readings, and reporting
  // the strict closer would send the writer to line 9 rather than to the line holding the defect.
  const found = lintSource(
    '```json\n{"a":1}\n    ```\n\nprose between the fences\n\n```js\nconst x = 1;\n```\n',
  );
  assert.deepEqual(
    found.map((f) => f.rule),
    ['A13'],
  );
  assert.equal(found[0].line, 3);
});

test('A13 does NOT fire inside the three columns CommonMark allows', () => {
  assert.deepEqual(rules('```json\n{"a":1}\n   ```\n'), []);
});

test('A13 does NOT fire on a fence nested in a list item and closed at its own indentation', () => {
  assert.deepEqual(rules('- item\n\n    ```js\n    x\n    ```\n'), []);
});

test('A13, not A12, fires when the only closer is over-indented and sits at end of file', () => {
  // The fence runs to EOF under the CommonMark reading, but a closer exists and the fix is to
  // dedent it, so reporting the id whose fix is to delete a line would send the writer the wrong
  // way.
  assert.deepEqual(rules('```js\nx\n    ```'), ['A13']);
});

test('A13 leaves the rest of the rule set reading the lines a bad closer used to hide', () => {
  // The masking still follows CommonMark, so the `:::note` below is inside the fence as far as A3
  // is concerned. A13 is what stops a page shipping in that state.
  const found = lintSource('```js\nx\n    ```\n\n:::note\n\n```\n');
  assert.ok(found.some((f) => f.rule === 'A13'));
});

test('A12 and A13 do not fire on a fence documented inside a longer fence', () => {
  assert.deepEqual(rules('````md\n```js\nx\n```\n````\n'), []);
});

// --- A14: title/sidebar_label/description whitespace (FS-2747) ---------------------------------

const fm = (lines: string[]): string => `---\n${lines.join('\n')}\n---\n\nbody\n`;

test('A14 fires on a trailing space in a quoted description', () => {
  const src = fm(["title: 'Clean title'", "description: 'Has a trailing space '"]);
  assert.deepEqual(rules(src), ['A14']);
  const [finding] = lintSource(src).filter((f) => f.rule === 'A14');
  assert.equal(finding.message, 'description: leading or trailing whitespace');
});

test('A14 does NOT fire on extra separator whitespace after an unquoted key, which is not part of the value', () => {
  // `[ \t]*` after the field name eats every space between the colon and the value, matching real
  // YAML: an unquoted scalar's leading whitespace is separator, not content, so `title:  x` and
  // `title: x` name the same value and neither is a defect.
  assert.deepEqual(rules(fm(['title:  Leading space is just separator'])), []);
});

test('A14 fires on trailing whitespace after an unquoted value, and names it as line noise', () => {
  // YAML ends a plain scalar at the last non-space character, so the value the page renders is
  // already clean. Nothing else removes the spaces (Prettier leaves them), so it is still worth a
  // finding, just not one that claims the value is wrong.
  const src = fm(['title: Trailing space title  ']);
  assert.deepEqual(rules(src), ['A14']);
  const [finding] = lintSource(src).filter((f) => f.rule === 'A14');
  assert.equal(finding.message, 'title: trailing whitespace on the line, outside the value');
});

test('A14 does NOT call whitespace after a closing quote a doubled internal space', () => {
  // Regression: the quoted test ran against the untrimmed line, so a clean quoted value followed
  // by spaces failed it, kept its own quotes inside `value`, and was reported as both leading or
  // trailing whitespace and a doubled internal space. The value here has neither.
  const src = fm(["description: 'Quoted then spaces'   "]);
  const [finding] = lintSource(src).filter((f) => f.rule === 'A14');
  assert.equal(finding.message, 'description: trailing whitespace on the line, outside the value');
});

test('A14 skips a folded or literal block scalar rather than reading the indicator as the value', () => {
  // Documented limitation: the text lives on the following indented lines, which this rule never
  // reads. No `title`/`sidebar_label`/`description` in content/ uses this form.
  assert.deepEqual(rules(fm(['description: >', '  Folded  text with a doubled space'])), []);
  assert.deepEqual(rules(fm(['description: |-', '  Literal text trailing  '])), []);
});

test('A14 does NOT fire on a file with no frontmatter at all', () => {
  // Every partial takes this path: `content/partials/**` carries no frontmatter by contract.
  assert.deepEqual(rules('A partial with a  doubled space and no frontmatter.\n'), []);
});

test('A14 fires on a doubled internal space in an unquoted value', () => {
  assert.deepEqual(rules(fm(['title: Two  spaces, unquoted'])), ['A14']);
});

test('A14 fires on a doubled internal space in sidebar_label', () => {
  const src = fm(["sidebar_label: 'Two  spaces here'"]);
  const [finding] = lintSource(src).filter((f) => f.rule === 'A14');
  assert.equal(finding.message, 'sidebar_label: a doubled internal space');
});

test('A14 reports both problems when a value has leading/trailing AND doubled whitespace', () => {
  const src = fm(["description: ' has  both issues '"]);
  const [finding] = lintSource(src).filter((f) => f.rule === 'A14');
  assert.equal(
    finding.message,
    'description: leading or trailing whitespace and a doubled internal space',
  );
});

test('A14 does NOT fire on clean title/sidebar_label/description values', () => {
  const src = fm([
    "title: 'A clean title'",
    "sidebar_label: 'A clean label'",
    "description: 'A clean, single-spaced description.'",
  ]);
  assert.deepEqual(rules(src), []);
});

test('A14 does NOT mistake a backtick-quoted code span inside a description for a doubled space', () => {
  // Regression: stripCode's inline-code masking has no notion of YAML quoting, so it blanks a
  // backtick pair inside a frontmatter string the same way it would inside prose. Reading A14 off
  // `text` (the stripCode output) instead of `source` turned that masked run of spaces into a
  // false "doubled internal space" finding. A14 must read the raw frontmatter from `source`.
  const src = fm(["description: 'Uses the `entrypoint` macro correctly.'"]);
  assert.deepEqual(rules(src), []);
});

test('A14 checks a double-quoted value too, and does not flag the quotes themselves', () => {
  assert.deepEqual(rules(fm(['title: "A clean title"'])), []);
  assert.deepEqual(rules(fm(['title: "A trailing space title "'])), ['A14']);
});

test('A14 does NOT fire on frontmatter fields it does not cover', () => {
  assert.deepEqual(rules(fm(["author: 'trailing space author '"])), []);
});
