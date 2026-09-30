/**
 * Compiles MDX fixtures through Fumadocs' own `remarkLLMs` with the site's hook, the plugin
 * `postprocess.includeProcessedMarkdown` runs, and checks the markdown it stores.
 */
import { createProcessor } from '@mdx-js/mdx';
import { remarkGfm } from 'fumadocs-core/mdx-plugins';
import { remarkLLMs } from 'fumadocs-core/mdx-plugins/remark-llms';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { VFile } from 'vfile';

import { EXPLORER_ROOTS, createLlmsStringify, llmsStringify } from '../../lib/llms-markdown.ts';

const stringify = createLlmsStringify({ vars: { minBond: '3600', rpc: 'https://arb1.example' } });

async function mirror(source: string, hook = stringify): Promise<string> {
  const file = new VFile({ value: source, path: 'fixture.mdx' });
  await createProcessor({
    remarkPlugins: [remarkGfm, [remarkLLMs, { stringify: hook, _data: true }]],
  }).process(file);
  return String(file.data.markdown);
}

const NO_JSX = /<(Var|Term|Callout|AEL|Card|Cards|Accordion|Accordions|Tab|Tabs|ImageZoom|Step)\b/;

test('Var becomes its value, also inside a table cell', async () => {
  const out = await mirror(
    'The bond is <Var name="minBond" /> ETH.\n\n| Param | Value |\n| --- | --- |\n| Bond | <Var name="minBond" /> ETH |\n',
  );
  assert.match(out, /The bond is 3600 ETH\./);
  assert.match(out, /\| Bond {2}\| 3600 ETH \|/);
  assert.doesNotMatch(out, NO_JSX);
});

test('an unknown Var name keeps the tag, so the typo stays visible', async () => {
  assert.match(await mirror('Value: <Var name="nope" />.'), /<Var name="nope" \/>/);
});

test('Term becomes its text', async () => {
  const out = await mirror('A <Term id="sequencer">sequencer</Term> orders transactions.');
  assert.equal(out.trim(), 'A sequencer orders transactions.');
});

test('Callout becomes a blockquote opening with the bold title or the type label', async () => {
  const titled = await mirror(
    '<Callout type="warn" title="Back up your keys">\n  Lose them and the funds are gone. See <Term id="l1">L1</Term>.\n</Callout>\n',
  );
  assert.match(
    titled,
    /^> \*\*Back up your keys\*\*\n>\n> Lose them and the funds are gone\. See L1\./m,
  );
  const untitled = await mirror('<Callout type="info">\n  Plain note.\n</Callout>\n');
  assert.match(untitled, /^> \*\*Note\*\*\n>\n> Plain note\./m);
  assert.doesNotMatch(titled + untitled, NO_JSX);
});

test('Accordions and Tabs become headings with their bodies', async () => {
  const out = await mirror(
    [
      '<Accordions>',
      '  <Accordion title="What is BoLD?">',
      '    A dispute protocol.',
      '  </Accordion>',
      '</Accordions>',
      '',
      "<Tabs items={['S3', 'Local']}>",
      '  <Tab value="S3">',
      '    Use a bucket.',
      '  </Tab>',
      '  <Tab value="Local">',
      '    Use a directory.',
      '  </Tab>',
      '</Tabs>',
      '',
    ].join('\n'),
  );
  assert.match(out, /#### What is BoLD\?\n\nA dispute protocol\./);
  assert.match(out, /#### S3\n\nUse a bucket\.\n\n#### Local\n\nUse a directory\./);
  assert.doesNotMatch(out, NO_JSX);
});

test('Cards become a link list and a lone Card a link line', async () => {
  const out = await mirror(
    [
      '<Cards>',
      '  <Card title="Quickstart" description="Deploy in minutes." href="/docs/stylus/quickstart" />',
      '  <Card title="Venly Tools <> Arbitrum" href="/docs/third-party-docs/Venly/venly" />',
      '</Cards>',
      '',
      '<Card title="Alone" href="https://example.com" />',
      '',
    ].join('\n'),
  );
  assert.match(out, /^\* \[Quickstart\]\(\/docs\/stylus\/quickstart\): Deploy in minutes\.$/m);
  assert.match(
    out,
    /^\* \[Venly Tools \\?<> Arbitrum\]\(\/docs\/third-party-docs\/Venly\/venly\)$/m,
  );
  assert.match(out, /^\[Alone\]\(https:\/\/example\.com\)$/m);
  assert.doesNotMatch(out, NO_JSX);
});

test('AEL becomes an explorer link to the full address', async () => {
  const address = '0x5eF0D09d1E6204141B4d37530808eD19f60FBa35';
  const out = await mirror(
    `Rollup: <AEL address="${address}" chainID={42161} shortenAddress={true} />`,
  );
  assert.equal(out.trim(), `Rollup: [${address}](https://arbiscan.io/address/${address})`);
});

test('the explorer table matches the AddressExplorerLink component', () => {
  const component = readFileSync(
    new URL('../../components/mdx/AddressExplorerLink.tsx', import.meta.url),
    'utf8',
  );
  const pairs = Object.fromEntries(
    [...component.matchAll(/^\s*(\d+): '(https:[^']+)'/gm)].map((m) => [m[1], m[2]]),
  );
  assert.deepEqual(pairs, { ...EXPLORER_ROOTS });
});

test('ImageZoom becomes a markdown image, from its attributes or its img child', async () => {
  const wrapped = await mirror(
    '<ImageZoom>\n  <img src="https://cdn.example/a.png" alt="Overview" />\n</ImageZoom>\n',
  );
  assert.equal(wrapped.trim(), '![Overview](https://cdn.example/a.png)');
  const direct = await mirror('<ImageZoom src="/img/b.svg" alt="Flow" />\n');
  assert.equal(direct.trim(), '![Flow](/img/b.svg)');
});

test('other components unwrap, widgets vanish, HTML stays', async () => {
  const out = await mirror(
    [
      '<Steps>',
      '  <Step>',
      '    First step.',
      '  </Step>',
      '</Steps>',
      '',
      '<VendingMachine />',
      '',
      '<table><tbody><tr><td><Term id="x">cell</Term></td></tr></tbody></table>',
      '',
    ].join('\n'),
  );
  assert.match(out, /^First step\.$/m);
  assert.doesNotMatch(out, /VendingMachine|Steps|Step>/);
  assert.match(out, /<td>cell<\/td>/);
});

test('a string-literal expression reads as its text', async () => {
  assert.equal((await mirror('Chain{\' \'}<Term id="x">ID</Term>')).trim(), 'Chain ID');
});

test('fenced and inline code are left alone', async () => {
  const source = [
    'Use `<Var name="minBond" />` in prose.',
    '',
    '```mdx',
    '<Callout type="warn">',
    '  <Var name="minBond" />',
    '</Callout>',
    '```',
    '',
  ].join('\n');
  const out = await mirror(source);
  assert.match(out, /`<Var name="minBond" \/>`/);
  assert.match(out, /```mdx\n<Callout type="warn">\n {2}<Var name="minBond" \/>\n<\/Callout>\n```/);
});

test('the default hook reads content/vars.json', async () => {
  const vars = JSON.parse(
    readFileSync(new URL('../../content/vars.json', import.meta.url), 'utf8'),
  );
  const [name, value] = Object.entries(vars).find(([, v]) => typeof v === 'string') ?? [];
  assert.ok(name);
  assert.equal((await mirror(`<Var name="${name}" />`, llmsStringify)).trim(), value);
});
