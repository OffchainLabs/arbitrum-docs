import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { type TestContext, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { createAnchorCompiler, findBrokenAnchors } from './doc-anchors.ts';
import { buildIndex } from './doc-links.ts';

function fixture(t: TestContext, files: Record<string, string>): string {
  const root = mkdtempSync(path.join(tmpdir(), 'doc-anchors-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [rel, content] of Object.entries(files)) {
    const file = path.join(root, rel);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, content);
  }
  return root;
}

test('real MDX transforms handle includes in place, duplicate headings and explicit ids', async (t) => {
  const root = fixture(t, {
    'content/docs/page.mdx': [
      '---',
      'title: Not a heading',
      '---',
      '## Repeat',
      '<include cwd>content/partials/_outer.mdx</include>',
      '## Repeat',
      '## Repeat [#custom]',
      '## Repeat',
      'Setext heading',
      '--------------',
      '## **Bold** `validation_*` <Term id="gas">Gas</Term>',
      '## Café',
      '```md',
      '## Fake',
      '[fake](#missing)',
      '```',
      '```ts twoslash',
      '// ## Not a heading either; highlighting is skipped by the checker',
      'const answer: number = 42;',
      '```',
      '<div id="native-anchor" />',
      '<Term id="not-a-dom-id">Term</Term>',
    ].join('\n'),
    'content/partials/_outer.mdx': '## Repeat\n\n<include>./_inner.mdx</include>',
    'content/partials/_inner.mdx': '## Repeat',
  });
  const compile = await createAnchorCompiler(root);
  const { ids, links } = await compile(path.join(root, 'content/docs/page.mdx'));
  assert.deepEqual(
    [...ids],
    [
      'repeat',
      'repeat-1',
      'repeat-2',
      'repeat-3',
      'custom',
      'repeat-4',
      'setext-heading',
      'bold-validation_-gas',
      'café',
      'native-anchor',
    ],
  );
  assert.deepEqual(links, []);
});

test('fragment URLs use browser resolution and preserve case and percent encoding', async (t) => {
  const root = fixture(t, {
    'content/docs/group/source.mdx': [
      '## Here',
      '[local](#here)',
      '[query](?search=x#here)',
      '[top](#top)',
      '[empty](#)',
      '[text](#:~:text=anything)',
      '[text with id](#here:~:text=anything)',
      '[relative](../target?search=x#caf%C3%A9)',
      '[absolute](/docs/target/#CaseSensitive)',
      '[reference][ref]',
      '[ref]: /docs/target#caf%C3%A9',
      '[ref]: /docs/target#ignored-duplicate-definition',
      '<a href="/docs/target#native">HTML</a>',
      '<Card href="/docs/target#CaseSensitive">JSX</Card>',
      '[external](https://example.com/docs/no-page#no-id)',
      '[scheme-relative](//example.com/#no-id)',
      '[asset](/report.pdf#page=3)',
      '[bad local](#missing)',
      '[bad case](/docs/target#casesensitive)',
      '[bad escape](/docs/target#%ZZ)',
    ].join('\n'),
    'content/docs/target.mdx': '## Café\n\n## Named [#CaseSensitive]\n\n<div id="native" />',
  });
  const broken = await findBrokenAnchors(buildIndex(root));
  assert.deepEqual(
    broken.map(({ url }) => url),
    ['#missing', '/docs/target#casesensitive', '/docs/target#%ZZ'],
  );
});

test('partial links are checked per containing page, with their actual source line', async (t) => {
  const root = fixture(t, {
    'content/docs/one.mdx': '## Present\n\n<include cwd>content/partials/_shared.mdx</include>',
    'content/docs/two.mdx': '## Different\n\n<include cwd>content/partials/_shared.mdx</include>',
    'content/partials/_shared.mdx': '---\ntitle: Partial\n---\n\n[local](#present)',
  });
  const broken = await findBrokenAnchors(buildIndex(root));
  assert.equal(broken.length, 1);
  assert.equal(broken[0].rel, 'content/partials/_shared.mdx');
  assert.equal(broken[0].line, 5);
  assert.equal(broken[0].page, '/docs/two');
});

test('section includes and repeated includes follow the Fumadocs include plugin', async (t) => {
  const root = fixture(t, {
    'content/docs/page.mdx': [
      '<include cwd>content/partials/_sections.mdx#selected</include>',
      '<include cwd>content/partials/_repeat.mdx</include>',
      '<include cwd>content/partials/_repeat.mdx</include>',
    ].join('\n\n'),
    'content/partials/_sections.mdx': '## Omitted\n\n## Selected\n\n### Child\n\n## Also omitted',
    'content/partials/_repeat.mdx': '## Repeated',
  });
  const compile = await createAnchorCompiler(root);
  const { ids } = await compile(path.join(root, 'content/docs/page.mdx'));
  // Fumadocs ends a heading selection at the next heading, including a deeper one.
  assert.deepEqual([...ids], ['selected', 'repeated', 'repeated-1']);
});

test('check-links blocks missing fragments, keeps JSON mode, and fails on compilation errors', (t) => {
  const root = fixture(t, { 'content/docs/page.mdx': '## Existing\n\n[bad](#missing)' });
  const cli = fileURLToPath(new URL('../check-links.ts', import.meta.url));
  const run = (...args: string[]) =>
    spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8' });
  const broken = run();
  assert.equal(broken.status, 1);
  assert.match(broken.stderr, /content\/docs\/page.mdx:3.*#missing.*missing anchor/);
  const json = run('--json');
  assert.equal(json.status, 0);
  assert.deepEqual(JSON.parse(json.stdout), [
    { rel: 'content/docs/page.mdx', line: 3, url: '#missing' },
  ]);
  writeFileSync(path.join(root, 'content/docs/page.mdx'), '## Existing\n\n[good](#existing)');
  assert.equal(run().status, 0);
  writeFileSync(path.join(root, 'content/docs/page.mdx'), '<include>./missing.mdx</include>');
  const invalid = run('--json');
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /Cannot validate anchors in content\/docs\/page.mdx/);
});
