/**
 * The content rules, run through ESLint's `Linter` with the `docs` plugin and languages, on the
 * same fixtures the old `content-lint`, `vars-check`, `references-check` and `frontmatter-check`
 * gates were tested with.
 */
import { createProcessor } from '@mdx-js/mdx';
import { Linter } from 'eslint';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import docs, { CONTENT_RULES, type RuleId, rules as ruleModules } from './plugin.ts';
import { FUMADOCS_DEFAULT_COMPONENTS, registeredComponents } from './shared.ts';

const linter = new Linter();

/** The rules the old `content:lint` gate held; the three gate-derived rules are tested apart. */
const CONTENT_LINT: RuleId[] = CONTENT_RULES.filter(
  (id) => id !== 'unknown-var' && id !== 'unknown-term',
);

interface Finding {
  rule: string;
  line: number;
  message: string;
}

interface LintOptions {
  rules?: RuleId[];
  options?: Partial<Record<RuleId, unknown>>;
  file?: string;
}

function lint(
  source: string,
  { rules = CONTENT_LINT, options = {}, file = 'content/docs/page.mdx' }: LintOptions = {},
): Finding[] {
  const enabled: Linter.RulesRecord = Object.fromEntries(
    rules.map((id) => [`docs/${id}`, options[id] ? ['error', options[id]] : 'error']),
  );
  const config: Linter.Config[] = [
    { files: ['**/*.mdx'], plugins: { docs }, language: 'docs/mdx', rules: enabled },
    { files: ['**/*.md'], plugins: { docs }, language: 'docs/markdown', rules: enabled },
  ];
  return linter
    .verify(source, config, { filename: file })
    .map((m) => ({
      rule: m.ruleId?.replace(/^docs\//, '') ?? (m.fatal ? 'fatal' : 'unknown'),
      line: m.line,
      message: m.message,
    }))
    .sort((a, b) => a.line - b.line || a.rule.localeCompare(b.rule));
}

const rules = (source: string, options?: LintOptions): string[] =>
  lint(source, options).map((f) => f.rule);
const located = (source: string, options?: LintOptions): [string, number][] =>
  lint(source, options).map((f) => [f.rule, f.line]);
const lines = (...rows: string[]): string => rows.join('\n');

test('every rule is enabled for content, and frontmatter-schema only for pages', () => {
  assert.deepEqual([...CONTENT_RULES].sort(), [
    ...Object.keys(ruleModules)
      .filter((id) => id !== 'frontmatter-schema')
      .sort(),
  ]);
});

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
  assert.deepEqual(
    located(lines('Run `<Var name="a" />`.', '', '```bash', 'x <Var name="b" />', '```')),
    [
      ['var-in-code', 1],
      ['var-in-code', 4],
    ],
  );
});

test('a <Var> in a link destination is reported; in link text it is fine', () => {
  assert.deepEqual(rules('[x](https://h/<Var name="a" />)\n'), ['var-in-link']);
  assert.deepEqual(rules('[<Var name="a" />](/x)\n'), []);
  assert.deepEqual(rules('[x](https://h/{var:a})\n'), []);
});

test('a <Var> in an href is a syntax error the parser reports', () => {
  // The old text scan reported `var-in-link` here; the tag's quotes end the attribute early, so
  // the file no longer parses, which `next build` refuses as well.
  assert.deepEqual(rules('<a href="https://h/<Var name="a" />">x</a>\n'), ['fatal']);
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

test('a JSX component in a heading is reported', () => {
  assert.deepEqual(rules('## Wait (currently <Var name="x" /> hours)\n'), ['component-in-heading']);
  assert.deepEqual(rules('## A <Term id="dapp">dapp</Term> here\n'), ['component-in-heading']);
  assert.deepEqual(rules('## Fixed bytes (`FixedBytes<N>`)\n'), []);
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

test('a Docusaurus @@variable@@ token is reported; in code it is fine', () => {
  assert.deepEqual(rules('Run Nitro @@nitroVersionTag=v3.11.4@@ today.\n'), [
    'docusaurus-var-token',
  ]);
  assert.deepEqual(rules('Use @@nitroVersionTag@@.\n'), ['docusaurus-var-token']);
  assert.deepEqual(rules('`@@nitroVersionTag@@`\n'), []);
  assert.deepEqual(rules('An email a@@b is not a token.\n'), []);
});

test('a quicklook anchor is reported; in a fence it is fine', () => {
  assert.deepEqual(rules("<a data-quicklook-from='dapp'>dApp</a>\n"), ['quicklook-anchor']);
  assert.deepEqual(rules("```html\n<a data-quicklook-from='dapp'>dApp</a>\n```\n"), []);
});

test('a top-level import or export is reported with its line; in code it is fine', () => {
  assert.deepEqual(rules("import { Steps } from 'fumadocs-ui/components/steps';\n"), [
    'esm-in-page',
  ]);
  assert.deepEqual(rules('export const Box = () => null;\n'), ['esm-in-page']);
  assert.deepEqual(rules("```js\nimport X from '@site/x';\n```\n"), []);
  assert.deepEqual(rules("Run `import X from 'y'` first.\n"), []);
  const found = lint("# Title\n\nimport X from '@site/docs/partials/_x.mdx';\n");
  assert.deepEqual(
    found.map((f) => [f.rule, f.line]),
    [['esm-in-page', 3]],
  );
  assert.match(found[0].message, /^@site\/docs\/partials\/_x\.mdx is a Docusaurus alias/);
  assert.match(lint('export const a = 1;\n')[0].message, /cannot import or export/);
});

test('an unregistered component is reported even when the file imports or exports it', () => {
  const options = { 'unknown-component': { components: ['Callout', 'Tabs'] } };
  const ids = (source: string) => rules(source, { options });
  assert.deepEqual(ids('<Steps>\n\n<Step>a</Step>\n\n</Steps>\n'), [
    'unknown-component',
    'unknown-component',
  ]);
  assert.deepEqual(
    ids(
      "import { Step, Steps } from 'fumadocs-ui/components/steps';\n\n<Steps>\n\n<Step>a</Step>\n\n</Steps>\n",
    ),
    ['esm-in-page', 'unknown-component', 'unknown-component'],
  );
  assert.deepEqual(ids('export const Box = () => null;\n\n<Box />\n'), [
    'esm-in-page',
    'unknown-component',
  ]);
  assert.deepEqual(ids('<Tabs items={[]}>\n</Tabs>\n\n`<Nope />` and <div>x</div>\n'), []);
});

test('the registry reader finds the capitalised keys of the component map', () => {
  const found = registeredComponents(
    'const merged = {\n  ...defaultMdxComponents,\n  Accordion,\n  AEL: AddressExplorerLink,\n  img: (p) => p,\n  Var,\n  ...components,\n};',
  );
  assert.deepEqual([...found].sort(), ['AEL', 'Accordion', 'Var']);
  const real = registeredComponents(
    readFileSync(new URL('../components/mdx.tsx', import.meta.url), 'utf8'),
  );
  for (const name of ['Term', 'Var', 'Tabs', 'Accordion', 'ImageZoom'])
    assert.ok(real.has(name), name);
});

test('the Fumadocs default list matches the installed fumadocs-ui/mdx map', () => {
  const require = createRequire(import.meta.url);
  const dist = require.resolve('fumadocs-ui/mdx').replace(/mdx\.server\.js$/, 'mdx.js');
  const body = /const defaultMdxComponents = \{([\s\S]*?)\n\};/.exec(
    readFileSync(dist, 'utf8'),
  )?.[1];
  assert.ok(body, `no defaultMdxComponents map in ${dist}`);
  const names = [...body.matchAll(/^\t([A-Z]\w*)(?=[,:]|$)/gm)].map((m) => m[1]).sort();
  assert.deepEqual(names, [...FUMADOCS_DEFAULT_COMPONENTS].sort());
});

test('a Callout type outside the five house types is reported', () => {
  assert.deepEqual(rules('<Callout type="note">\n\nx\n\n</Callout>\n'), ['callout-type']);
  assert.deepEqual(rules("<Callout type='tip'>\n\nx\n\n</Callout>\n"), ['callout-type']);
  for (const type of ['info', 'warn', 'error', 'idea', 'success']) {
    assert.deepEqual(rules(`<Callout type="${type}">\n\nx\n\n</Callout>\n`), [], type);
  }
});

test('markdown in a Callout or Accordion title is reported; plain text and underscores are fine', () => {
  assert.deepEqual(rules('<Callout title="Bridging **USDC**?">\n\nx\n\n</Callout>\n'), [
    'markdown-in-title',
  ]);
  assert.deepEqual(rules('<Accordion title="Use `foo`">\n\nx\n\n</Accordion>\n'), [
    'markdown-in-title',
  ]);
  assert.deepEqual(rules('<Callout title="See [docs](/docs/x)">\n\nx\n\n</Callout>\n'), [
    'markdown-in-title',
  ]);
  assert.deepEqual(rules('<Callout title="An _emphasised_ word">\n\nx\n\n</Callout>\n'), [
    'markdown-in-title',
  ]);
  assert.deepEqual(rules('<Callout title="Set max_fee_per_gas">\n\nx\n\n</Callout>\n'), []);
  assert.deepEqual(rules('<Callout title="Plain title">\n\nx\n\n</Callout>\n'), []);
});

test('a single-line block component glued to text is reported with its line', () => {
  assert.deepEqual(located('Intro.\n\n<Callout type="info">Note.</Callout>\nNext paragraph.\n'), [
    ['block-component-in-paragraph', 3],
  ]);
  assert.deepEqual(located('Text above.\n<Callout>Note.</Callout>\n'), [
    ['block-component-in-paragraph', 2],
  ]);
  assert.deepEqual(located('Text <Callout>Note.</Callout>\n'), [
    ['block-component-in-paragraph', 1],
  ]);
  assert.deepEqual(located('- item\n<Callout>Note.</Callout>\n'), [
    ['block-component-in-paragraph', 2],
  ]);
});

test('a block component on its own lines, or two single-line ones together, is fine', () => {
  assert.deepEqual(rules('<Callout>Note.</Callout>\n\nNext.\n'), []);
  assert.deepEqual(rules('<Callout>\nNote.\n</Callout>\nNext.\n'), []);
  assert.deepEqual(rules('<Callout>a</Callout>\n<Callout>b</Callout>\n'), []);
  assert.deepEqual(rules('<Cards />\nNext.\n'), []);
  assert.deepEqual(rules('<Tabs items={["a"]}>\n<Tab value="a">x</Tab>\n</Tabs>\n'), []);
  assert.deepEqual(rules('## Heading\n<Callout>Note.</Callout>\n## Next\n'), []);
});

test('Tabs defaultValue={null} is reported, on one line or across lines', () => {
  assert.deepEqual(rules('<Tabs items={["a", "b"]} defaultValue={null}>\n</Tabs>\n'), [
    'tabs-null-default',
  ]);
  assert.deepEqual(rules('<Tabs\n  items={["a"]}\n  defaultValue={ null }\n>\n</Tabs>\n'), [
    'tabs-null-default',
  ]);
  assert.deepEqual(rules('<Tabs items={["a"]} defaultValue="a">\n</Tabs>\n'), []);
});

test('component-looking attribute strings are plain text, not JSX elements or props', () => {
  for (const title of [
    'Use <Example> as a placeholder',
    'Use <Tabs defaultValue={null}> syntax',
    "Use <Callout type='note'> syntax",
  ]) {
    assert.deepEqual(rules(`<Callout title="${title}">\n\nx\n\n</Callout>\n`), [], title);
  }
  assert.deepEqual(rules('<Callout title={"Use <Example />"} />\n'), []);
  assert.deepEqual(rules('<Callout title="Use defaultValue={null}" type="info" />\n'), []);
  assert.deepEqual(rules('<Callout title="Use type=\'note\'" type="info" />\n'), []);
  assert.deepEqual(rules('## <span title="Use <Example>">Heading</span>\n'), []);
});

test('inline JSX cannot hide text beside a block component', () => {
  for (const source of [
    'Text <Term id="dapp">dapp</Term> <Callout>Note.</Callout>\n',
    '<Callout>Note.</Callout> <Term id="dapp">dapp</Term> text.\n',
  ]) {
    assert.deepEqual(located(source), [['block-component-in-paragraph', 1]], source);
  }
});

test('real JSX in expressions still checks components and their attributes', () => {
  assert.deepEqual(rules('<Callout title={<Nope />} />\n'), ['unknown-component']);
  assert.deepEqual(rules('<Callout title={<Tabs defaultValue={null} />} />\n'), [
    'tabs-null-default',
  ]);
  assert.deepEqual(rules('{<Callout title="**Bold**" type="note" />}\n'), [
    'callout-type',
    'markdown-in-title',
  ]);
  assert.deepEqual(rules('Text {<Callout>Note.</Callout>} here.\n'), [
    'block-component-in-paragraph',
  ]);
});

test('component rules ignore code, comments, frontmatter and strings in expressions', () => {
  assert.deepEqual(
    rules(
      lines(
        '---',
        'title: <Example />',
        '---',
        '',
        '```mdx',
        '<Nope />',
        '<Tabs defaultValue={null} />',
        '```',
        '',
        '`<Nope />`',
        '',
        '{/* <Nope /> */}',
        '',
        '{"<Nope />"}',
      ),
    ),
    [],
  );
  assert.deepEqual(rules('const-looking text {"<Tabs defaultValue={null}>"}.\n'), []);
});

test('paragraph detection uses all contents, including code, links and nested JSX', () => {
  for (const source of [
    '`code` <Callout>Note.</Callout>\n',
    '[link](/x) <Callout>Note.</Callout>\n',
    '*Text <Callout>Note.</Callout>*\n',
    'Text <span><Callout>Note.</Callout></span>\n',
    '> Text <Term id="dapp">dapp</Term> <Callout>Note.</Callout>\n',
  ])
    assert.deepEqual(rules(source), ['block-component-in-paragraph'], source);

  for (const source of [
    '<Callout>Note.</Callout> <Term id="dapp">dapp</Term>\n',
    '<Callout>a</Callout> {<Callout>b</Callout>}\n',
    'Above.\n\n<Callout>Note.</Callout>\n\nBelow.\n',
  ])
    assert.deepEqual(rules(source), [], source);
});

test('component diagnostics preserve line offsets after frontmatter and code', () => {
  const source = lines(
    '---',
    'title: Page',
    '---',
    '',
    '```mdx',
    '<Nope />',
    '```',
    '',
    'Text <Term id="dapp">dapp</Term> <Callout>Note.</Callout>',
    '<Unknown />',
  );
  assert.deepEqual(located(source), [
    ['block-component-in-paragraph', 9],
    ['unknown-component', 10],
  ]);
});

test('MDX that cannot parse is one fatal finding, with its line', () => {
  assert.deepEqual(located(':::note\n\n<Callout>\n'), [['fatal', 3]]);
});

test('paragraph diagnostics match the compiled MDX paragraph wrapper', () => {
  for (const [source, wrapped] of [
    ['Text <Term id="dapp">dapp</Term> <Callout>Note.</Callout>\n', true],
    ['<Callout>Note.</Callout> <Term id="dapp">dapp</Term> text.\n', true],
    ['<Callout>Note.</Callout> <Term id="dapp">dapp</Term>\n', false],
    ['<Callout>a</Callout>\n<Callout>b</Callout>\n', false],
  ] as const) {
    const compiled = String(createProcessor().processSync(source));
    assert.equal(/_jsxs?\(_components\.p,/.test(compiled), wrapped, source);
    assert.equal(rules(source).includes('block-component-in-paragraph'), wrapped, source);
  }
});

test('a plain .md file is read as GFM, so an HTML comment is not a parse error', () => {
  const source = '<!-- note -->\n\n# Catalog\n\n:::note\n';
  assert.deepEqual(rules(source, { file: 'content/partials/CATALOG.md' }), [
    'docusaurus-directive',
  ]);
});

const vars = { nitroVersionTag: 'v3.11.4', docsRepositoryUrl: 'https://github.com/x/y' };
const varRule: LintOptions = { rules: ['unknown-var'], options: { 'unknown-var': { vars } } };

test('a known <Var> and {var:} placeholder pass', () => {
  assert.deepEqual(
    rules(
      'Run <Var name="nitroVersionTag" />, see [repo]({var:docsRepositoryUrl}/issues).\n',
      varRule,
    ),
    [],
  );
});

test('an unknown variable name is reported with its line and name', () => {
  // A placeholder belongs in a destination; in prose it is an expression and a parse error.
  const found = lint(
    'Intro.\n\nRun <Var name="noSuchKey" /> and [x](https://h/{var:alsoMissing}).\n',
    varRule,
  );
  assert.deepEqual(
    found.map((f) => [f.line, f.message]),
    [
      [3, '"noSuchKey" is not a key in content/vars.json'],
      [3, '"alsoMissing" is not a key in content/vars.json'],
    ],
  );
});

test('a <Var> tag split across lines is read, and reported on the line it opens', () => {
  const source = ['Intro.', '', 'Run <Var', '  name="noSuchKeyAnywhere"', '/> now.', ''].join('\n');
  assert.deepEqual(located(source, varRule), [['unknown-var', 3]]);
  const known = ['<Var', "  name='nitroVersionTag'", '/>'].join('\n');
  assert.deepEqual(rules(known, varRule), []);
});

test('a <Var> with no static name is reported', () => {
  assert.deepEqual(
    lint('<Var name={key} />\n', varRule).map((f) => f.message),
    ['<Var> without a static name'],
  );
});

const termRule: LintOptions = {
  rules: ['unknown-term'],
  options: { 'unknown-term': { collections: { glossary: ['gas'] } } },
};

test('a term that resolves passes; an unknown id or collection is reported', () => {
  assert.deepEqual(rules('Pay <Term id="gas">gas</Term>.\n', termRule), []);
  assert.deepEqual(
    lint('Pay <Term id="no-such-term">x</Term>.\n', termRule).map((f) => f.message),
    ['no "glossary" entry for id "no-such-term"'],
  );
  assert.deepEqual(
    lint('<Reference collection="people" id="gas" />\n', termRule).map((f) => f.message),
    ['unknown reference collection "people"'],
  );
});

const GOOD = "---\ntitle: 'Good'\ndescription: 'A page.'\ncontent_type: how-to\n---\n\nBody.\n";
const schemaRule: LintOptions = { rules: ['frontmatter-schema'] };

test('a page that matches the schema passes', () => {
  assert.deepEqual(rules(GOOD, schemaRule), []);
});

test('each broken frontmatter field is reported as field: message, on the frontmatter', () => {
  const field = (source: string) =>
    lint(source, schemaRule).map((f) => [f.line, f.message.split(': ')[0]]);
  assert.deepEqual(field("---\ntitle: 'Bad'\ncontent_type: howto\n---\n\nBody.\n"), [
    [1, 'description'],
    [1, 'content_type'],
  ]);
  assert.deepEqual(field("---\ntitle: '  '\ndescription: ''\n---\n"), [
    [1, 'title'],
    [1, 'description'],
  ]);
  assert.deepEqual(field('No frontmatter at all.\n'), [
    [1, 'title'],
    [1, 'description'],
  ]);
  assert.deepEqual(field(GOOD.replace('content_type: how-to', 'target_audience: [operators]')), [
    [1, 'target_audience'],
  ]);
  assert.deepEqual(field(GOOD.replace('content_type: how-to', 'user_story: 123')), [
    [1, 'user_story'],
  ]);
});
