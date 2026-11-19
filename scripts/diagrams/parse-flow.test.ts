import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { loadProject } from './load.ts';

const PROJECT = `lanes:
  l1: { label: Lane one }
  l2: { label: Lane two }
kinds:
  plain: { label: Plain, svg: { fill: '#ffffff', title: '#111111', sub: '#555555' } }
repos:
  core: { url: 'https://example.com/core' }
  extra: { url: 'https://example.com/extra' }
svg:
  theme: neutral
  canvas: [720, 300]
  cols: [130, 360, 590]
  rows: [48, 160, 260]
  box: [200, 80]
  scale: 1
  offset: [0, 0]
`;
const PARTS = `a: { label: Alpha, kind: plain, lane: l1 }
b: { label: Beta, kind: plain, lane: l2 }
`;
const HEADER = `---
title: Demo
parts: [a, b]
edges:
  ab: a -> b "calls"
---
`;

const made: string[] = [];
after(() => Promise.all(made.map((dir) => rm(dir, { recursive: true, force: true }))));

async function project(flows: Record<string, string>) {
  const dir = await mkdtemp(path.join(tmpdir(), 'diagrams-'));
  made.push(dir);
  await mkdir(path.join(dir, 'flows'));
  await writeFile(path.join(dir, 'project.yaml'), PROJECT);
  await writeFile(path.join(dir, 'parts.yaml'), PARTS);
  for (const [name, body] of Object.entries(flows)) {
    await writeFile(path.join(dir, 'flows', `${name}.md`), body);
  }
  return dir;
}

async function steps(body: string, name = 'demo') {
  const { flows } = await loadProject(await project({ [name]: HEADER + body }));
  return flows.get(name)!.steps;
}

const rejects = async (flows: Record<string, string>, pattern: RegExp) =>
  assert.rejects(
    async () => loadProject(await project(flows)),
    (error: Error) => {
      assert.match(error.message, pattern);
      return true;
    },
  );

const FULL = `
## Submit {#s1}

parts: a, b · edges: ab · lane: l1
flag: fast · finality: soft
code: core/a/b/x.go:12
cites: x.go:240, 249; core/c/y.go:41
docs: [Read more](/docs/page#frag)

First paragraph
on two lines.

Second paragraph.

### Failure

**Symptoms.** It stalls.

**Impact.** Users wait.

**Recovery.** Retry later.
`;

test('parses metadata, prose and failure', async () => {
  const [step] = await steps(FULL);
  assert.deepEqual(step, {
    id: 's1',
    title: 'Submit',
    text: 'First paragraph on two lines.\n\nSecond paragraph.',
    parts: ['a', 'b'],
    edges: ['ab'],
    flag: 'fast',
    code: { repo: 'core', path: 'a/b/x.go', line: 12 },
    cites: [
      { repo: 'core', path: 'a/b/x.go', line: 240 },
      { repo: 'core', path: 'a/b/x.go', line: 249 },
      { repo: 'core', path: 'c/y.go', line: 41 },
    ],
    finality: 'soft',
    lane: 'l1',
    docs: { href: '/docs/page#frag', label: 'Read more' },
    failure: { symptoms: 'It stalls.', impact: 'Users wait.', recovery: 'Retry later.' },
  });
});

test('keeps a colon paragraph as prose', async () => {
  const [step] = await steps('\n## One {#s1}\n\nlane: l1\n\nNote: the feed is fast.\n');
  assert.equal(step!.text, 'Note: the feed is fast.');
});

test('treats a first paragraph with no known key as prose', async () => {
  const body = '\n## One {#s1}\n\nNote: the feed is fast.\n';
  await rejects({ demo: HEADER + body }, /step "s1" is missing lane/);
});

test('keeps inline markup verbatim', async () => {
  const prose = 'Calls `eth_call` with {var:arbOneBlockGasLimit} gas.';
  const [step] = await steps(`\n## One {#s1}\n\nlane: l1\n\n${prose}\n`);
  assert.equal(step!.text, prose);
});

test('CRLF equals LF', async () => {
  const lf = await steps(FULL);
  const crlf = await steps(FULL.replaceAll('\n', '\r\n'), 'crlf');
  const spaced = await steps(FULL.replaceAll('\n', '  \n'), 'spaced');
  assert.deepEqual(crlf, lf);
  assert.deepEqual(spaced, lf);
});

test('expands cite shorthand', async () => {
  const [step] = await steps(
    '\n## One {#s1}\n\ncode: core/a/b/x.go\ncites: x.go:240, 249; core/c/y.go:41\nlane: l1\n\nText.\n',
  );
  assert.deepEqual(step!.cites, [
    { repo: 'core', path: 'a/b/x.go', line: 240 },
    { repo: 'core', path: 'a/b/x.go', line: 249 },
    { repo: 'core', path: 'c/y.go', line: 41 },
  ]);
});

test('keeps cite order and duplicates', async () => {
  const [step] = await steps(
    '\n## One {#s1}\n\ncode: core/x.go\ncites: x.go:2, x.go:2\nlane: l1\n\nText.\n',
  );
  assert.deepEqual(step!.cites, [
    { repo: 'core', path: 'x.go', line: 2 },
    { repo: 'core', path: 'x.go', line: 2 },
  ]);
});

test('parses detail', async () => {
  const flows = {
    demo: `${HEADER}\n## One {#s1}\n\nlane: l1 · detail: a -> inner\n\nText.\n`,
    inner: '---\ntitle: Inner\nparts: [a]\n---\n',
  };
  const { flows: loaded } = await loadProject(await project(flows));
  assert.deepEqual(loaded.get('demo')!.steps[0]!.detail, { part: 'a', flow: 'inner' });
});

const one = (meta: string) => `${HEADER}\n## One {#s1}\n\n${meta}\n\nText.\n`;

test('rejects a heading without an id', () =>
  rejects({ demo: `${HEADER}\n## One\n\nlane: l1\n\nText.\n` }, /demo\.md:8: .*missing \{#id\}/));

test('rejects an unknown repo in code', () =>
  rejects({ demo: one('lane: l1\ncode: nitr0/a.go') }, /demo\.md:11: .*unknown repo "nitr0"/));

test('rejects an unknown repo in a cite', () =>
  rejects({ demo: one('lane: l1\ncites: nitr0/a.go:1') }, /unknown repo "nitr0"/));

test('rejects a non-positive line', () =>
  rejects({ demo: one('lane: l1\ncode: core/a.go:0') }, /line must be a positive integer/));

test('rejects a bare cite without code', () =>
  rejects({ demo: one('lane: l1\ncites: x.go:1') }, /step "s1" cites.*code/));

test('rejects a line-only cite without a previous entry', () =>
  rejects({ demo: one('lane: l1\ncites: 249') }, /step "s1" cites.*previous/));

test('rejects an unknown edge', () =>
  rejects({ demo: one('lane: l1\nedges: zz') }, /demo\.md:11: step "s1" edge "zz"/));

test('rejects an unknown part', () =>
  rejects({ demo: one('lane: l1\nparts: zz') }, /step "s1" part "zz"/));

test('rejects an unknown lane', () =>
  rejects({ demo: one('lane: nope') }, /step "s1" has unknown lane "nope"/));

test('rejects an unknown metadata key', () =>
  rejects({ demo: one('lane: l1\ncolour: red') }, /demo\.md:11: .*unknown key "colour"/));

test('rejects a duplicate step id', () =>
  rejects(
    { demo: `${HEADER}\n## One {#s1}\n\nlane: l1\n\nA.\n\n## Two {#s1}\n\nlane: l1\n\nB.\n` },
    /duplicate step id "s1"/,
  ));

test('rejects a detail to a missing flow', () =>
  rejects(
    { demo: one('lane: l1\ndetail: a -> nope') },
    /demo\.md:11: .*detail flow "nope" not found/,
  ));

test('rejects a detail on a part the flow does not list', () =>
  rejects(
    {
      demo: one('lane: l1\ndetail: zz -> demo'),
    },
    /step "s1" detail part "zz"/,
  ));

test('rejects a detail cycle', () =>
  rejects(
    {
      a: `${HEADER}\n## One {#s1}\n\nlane: l1 · detail: a -> b\n\nText.\n`,
      b: `${HEADER}\n## One {#s1}\n\nlane: l1 · detail: a -> a\n\nText.\n`,
    },
    /detail cycle: a\.md -> b\.md -> a\.md/,
  ));

const SVG_HEADER = (extra: string) => `---
title: Demo
parts: [a, { b: { tech: ~ } }]
${extra}
---
`;

test('reads svg and alt, and a null tech removes the part tech', async () => {
  const { flows } = await loadProject(
    await project({ demo: SVG_HEADER('svg: demo-out\nalt: The whole picture.') }),
  );
  const demo = flows.get('demo')!;
  assert.equal(demo.svg, 'demo-out');
  assert.equal(demo.alt, 'The whole picture.');
  assert.equal('tech' in demo.parts[1]!, false);
});

test('rejects an svg name that is not a plain file name', () =>
  rejects({ demo: SVG_HEADER('svg: ../out\nalt: Alt.') }, /demo\.md:4: svg: /));

test('rejects svg without alt', () =>
  rejects({ demo: SVG_HEADER('svg: demo-out') }, /svg needs alt/));
