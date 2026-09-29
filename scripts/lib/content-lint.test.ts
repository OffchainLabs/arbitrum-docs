import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import {
  FUMADOCS_DEFAULT_COMPONENTS,
  type RuleId,
  lintSource,
  registeredComponents,
} from './content-lint.ts';

const rules = (source: string): RuleId[] => lintSource(source).map((f) => f.rule);
const lines = (...rows: string[]): string => rows.join('\n');

test('clean prose reports nothing', () => {
  assert.deepEqual(rules('## Heading\n\nSome [link](/docs/x) and <Var name="a" />.\n'), []);
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
  assert.deepEqual(rules('[<Var name="a" />](/docs/x)\n'), []);
  assert.deepEqual(rules('[x](https://h/{var:a})\n'), []);
});

test('a placeholder whose name is not an identifier is reported', () => {
  assert.deepEqual(rules('[x](https://h/{var:not a key})\n'), ['var-in-link']);
});

test('a link, <a> or bare URL in a heading is reported', () => {
  assert.deepEqual(rules('## See [x](/docs/x)\n'), ['link-in-heading']);
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

test('an @site or @theme import is reported; in a fence it is fine', () => {
  assert.deepEqual(rules("import X from '@site/docs/partials/_x.mdx';\n"), ['site-import']);
  assert.deepEqual(rules('import Tabs from "@theme/Tabs";\n'), ['site-import']);
  assert.deepEqual(rules("```js\nimport X from '@site/x';\n```\n"), []);
});

test('an unregistered component is reported unless the file imports or exports it', () => {
  const components = new Set(['Callout', 'Tabs']);
  const ids = (source: string) => lintSource(source, { components }).map((f) => f.rule);
  assert.deepEqual(ids('<Steps>\n\n<Step>a</Step>\n\n</Steps>\n'), [
    'unknown-component',
    'unknown-component',
  ]);
  assert.deepEqual(
    ids(
      "import { Step, Steps as Steps } from 'fumadocs-ui/components/steps';\n\n<Steps>\n\n<Step>a</Step>\n\n</Steps>\n",
    ),
    [],
  );
  assert.deepEqual(ids('export const Box = () => null;\n\n<Box />\n'), []);
  assert.deepEqual(ids('<Tabs items={[]}>\n</Tabs>\n\n`<Nope />` and <div>x</div>\n'), []);
});

test('the registry reader finds the capitalised keys of the component map', () => {
  const found = registeredComponents(
    'const merged = {\n  ...defaultMdxComponents,\n  Accordion,\n  AEL: AddressExplorerLink,\n  img: (p) => p,\n  Var,\n  ...components,\n};',
  );
  assert.deepEqual([...found].sort(), ['AEL', 'Accordion', 'Var']);
  const real = registeredComponents(
    readFileSync(new URL('../../components/mdx.tsx', import.meta.url), 'utf8'),
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
  const found = (source: string) => lintSource(source).map((f) => [f.rule, f.line]);
  assert.deepEqual(found('Intro.\n\n<Callout type="info">Note.</Callout>\nNext paragraph.\n'), [
    ['block-component-in-paragraph', 3],
  ]);
  assert.deepEqual(found('Text above.\n<Callout>Note.</Callout>\n'), [
    ['block-component-in-paragraph', 2],
  ]);
  assert.deepEqual(found('Text <Callout>Note.</Callout>\n'), [['block-component-in-paragraph', 1]]);
  assert.deepEqual(found('- item\n<Callout>Note.</Callout>\n'), [
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
