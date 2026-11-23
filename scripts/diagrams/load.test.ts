import assert from 'node:assert/strict';
import { test } from 'node:test';

import { loadProject } from './load.ts';

const fixture = (name: string) => new URL(`./fixtures/${name}`, import.meta.url).pathname;

test('loads the minimal fixture', async () => {
  const { flows } = await loadProject(fixture('minimal'));
  const demo = flows.get('demo')!;
  assert.deepEqual(
    demo.parts.map((p) => p.id),
    ['a', 'b'],
  );
  assert.deepEqual(demo.edges[0], {
    id: 'ab',
    source: 'a',
    target: 'b',
    label: 'calls',
    both: false,
    style: 'solid',
  });
});

test('loads a Prysm-like vocabulary', async () => {
  const { flows, parts, config } = await loadProject(fixture('prysm-like'));
  const overview = flows.get('overview')!;
  const engine = overview.edges.find((e) => e.id === 'engine')!;
  assert.equal(engine.both, true);
  assert.equal(engine.label, 'Engine API');
  const api = overview.edges.find((e) => e.id === 'beacon-api')!;
  assert.deepEqual([api.source, api.target, api.both], ['validator-client', 'beacon-node', false]);
  assert.equal(parts.get('beacon-node')!.lane, 'consensus');
  assert.deepEqual(Object.keys(config.kinds).sort(), ['network', 'other', 'prysm']);
  assert.equal(config.repos['prysm']!.url, 'https://github.com/example/prysm');
  assert.equal(overview.parts.length, 5);
});

test('parses an arrow inside a quoted label', async () => {
  const { flows } = await loadProject(fixture('minimal'));
  const x = flows.get('extras')!.edges.find((e) => e.id === 'x')!;
  assert.equal(x.source, 'a');
  assert.equal(x.target, 'b');
  assert.equal(x.label, 'batch -> blob');
});

test('parses edge styles and a bidirectional arrow without a label', async () => {
  const { flows } = await loadProject(fixture('minimal'));
  const y = flows.get('extras')!.edges.find((e) => e.id === 'y')!;
  assert.deepEqual(y, {
    id: 'y',
    source: 'b',
    target: 'a',
    label: '',
    both: true,
    style: 'dashed',
  });
});

test('applies a local label override', async () => {
  const { flows, parts } = await loadProject(fixture('minimal'));
  const extras = flows.get('extras')!;
  assert.equal(extras.parts.find((p) => p.id === 'b')!.label, 'Bee');
  assert.equal(parts.get('b')!.label, 'Beta');
});

test('reads title, lanes flag, paths, card and static positions', async () => {
  const { flows } = await loadProject(fixture('minimal'));
  const extras = flows.get('extras')!;
  assert.equal(extras.title, 'Extras');
  assert.equal(extras.showLanes, true);
  assert.equal(flows.get('demo')!.showLanes, true);
  assert.deepEqual(extras.paths, [{ id: 'main', label: 'Main path', steps: ['one', 'two'] }]);
  assert.deepEqual(extras.card, { cta: 'Open the flow', compact: true });
  assert.deepEqual(extras.static, { a: [10, 20] });
  assert.equal(extras.file.endsWith('flows/extras.md'), true);
});

const rejects = (name: string, pattern: RegExp) =>
  assert.rejects(loadProject(fixture(name)), (error: Error) => {
    assert.match(error.message, pattern);
    return true;
  });

test('rejects a part with an unknown lane', () =>
  rejects('bad-lane', /parts\.yaml:1: .*lane "l2"/));

test('rejects a part with an unknown kind', () =>
  rejects('bad-kind', /parts\.yaml:1: .*kind "nope"/));

test('rejects an unknown part in a flow', () =>
  rejects('bad-part-ref', /demo\.md:3: unknown part "zz"/));

test('rejects an edge to an unlisted part', () =>
  rejects('bad-edge-target', /demo\.md:5: edge "ab".*"b"/));

test('rejects a duplicate edge id', () =>
  rejects('dup-edge', /demo\.md:6: duplicate edge id "ab"/));

test('rejects an edge written as a mapping', () =>
  rejects('bad-edge-shape', /demo\.md:5: edges\.ab: an edge must be a string/));

test('rejects a duplicate part id in parts.yaml', () =>
  rejects('dup-part', /parts\.yaml:2: duplicate key "a"/));

test('rejects a duplicate lane id in project.yaml', () =>
  rejects('dup-lane', /project\.yaml:5: duplicate key "l1"/));

test('rejects a part listed twice in a flow', () =>
  rejects('dup-flow-part', /demo\.md:3: part "a" is listed twice/));

test('reads a part docs link, and leaves it out when absent', async () => {
  const { parts } = await loadProject(fixture('minimal'));
  assert.equal(parts.get('a')!.docs, '/guide/alpha');
  assert.equal('docs' in parts.get('b')!, false);
});

test('rejects a part docs link that is not a root-absolute page path', () =>
  rejects('bad-docs', /parts\.yaml:1: .*docs.*must be a root-absolute page path/));
