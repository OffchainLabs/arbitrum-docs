import assert from 'node:assert/strict';
import { test } from 'node:test';

import { loadProject, loadTheme } from './load.ts';
import { renderSvg } from './render-svg.ts';

const fixture = (name: string) => new URL(`./fixtures/${name}`, import.meta.url).pathname;
const BACKGROUND = '<g transform="scale(2)"><rect width="800" height="450" fill="#808080"/></g>';
const THEME = await loadTheme(fixture('static-render'));

async function render(name: string, flowId: string): Promise<string> {
  const { config, flows } = await loadProject(fixture(name));
  return renderSvg(flows.get(flowId)!, config, THEME, BACKGROUND);
}

const afterBackground = (svg: string) => svg.slice(svg.indexOf(BACKGROUND) + BACKGROUND.length);

const paths = (svg: string) => [...svg.matchAll(/<path d="([^"]+)"[^>]*\/>/g)].map((m) => m[0]);

test('renders one root svg element', async () => {
  const svg = await render('static-render', 'demo');
  assert.ok(svg.startsWith('<svg '));
  assert.ok(svg.endsWith('</svg>\n'));
  assert.ok(svg.includes('viewBox="0 0 1600 900"'));
  assert.equal(svg.match(/<svg/g)!.length, 1);
});

test('uses no group transform outside the background', async () => {
  const svg = await render('static-render', 'demo');
  assert.ok(svg.includes(BACKGROUND));
  assert.doesNotMatch(afterBackground(svg), /<g[^>]*transform/);
});

test('draws a dashed edge', async () => {
  const svg = await render('static-render', 'demo');
  const dashed = paths(svg).filter((p) => p.includes('stroke-dasharray="7 6"'));
  assert.equal(dashed.length, 1);
});

test('draws a dotted edge with round caps and a head at both ends', async () => {
  const svg = await render('static-render', 'demo');
  const [dotted] = paths(svg).filter((p) => p.includes('stroke-dasharray="0.1 8"'));
  assert.match(dotted!, /stroke-linecap="round"/);
  assert.match(dotted!, /marker-start="url\(#arrow\)"/);
});

test('renders the prysm-like fixture', async () => {
  const svg = await render('prysm-like', 'overview');
  assert.ok(svg.includes('Engine API'));
});

test('puts the title and alt text in title and desc', async () => {
  const svg = await render('static-render', 'demo');
  assert.ok(svg.includes('<title id="t">Static demo</title>'));
  assert.ok(svg.includes('<desc id="d">Alpha reads Beta, and Beta writes Delta.</desc>'));
});

const local = (final: number) => Math.round((final - 30) / 1.15);

test('scales coordinates without a transform', async () => {
  const svg = await render('static-render', 'demo');
  // Part e sits at cols[1], rows[1]: 295 * 1.15 + 47 = 386.25 and 200 * 1.15 + 30 = 260.
  assert.match(
    svg,
    /<rect x="386.3" y="260" width="241.5" height="96.6" rx="11.5" fill="#dddddd"\/>/,
  );
});

test('offsets two edges between the same parts by 15 px each way', async () => {
  const svg = await render('static-render', 'demo');
  const ys = paths(svg)
    .filter((p) => !p.includes('stroke-dasharray'))
    .map((p) => /d="M[-\d.]+ ([-\d.]+) L[-\d.]+ ([-\d.]+)"/.exec(p))
    .filter((m) => m !== null && m[1] === m[2])
    .map((m) => local(Number(m![1])));
  // Row 0 is at y 40 with boxes 84 high, so its centre line is y 82.
  assert.deepEqual(ys, [67, 97]);
});

test('takes the offset of the busier side for a straight edge', async () => {
  const svg = await render('static-render', 'demo');
  const [dotted] = paths(svg).filter((p) => p.includes('stroke-dasharray="0.1 8"'));
  const [, y1, y2] = /d="M[-\d.]+ ([-\d.]+) L[-\d.]+ ([-\d.]+)"/.exec(dotted!)!;
  // c right holds ce (to a part above) and cd, so cd takes +15 below the row 3 centre, 612.
  assert.deepEqual([local(Number(y1)), local(Number(y2))], [627, 627]);
});

test('routes an elbow through the gutter with rounded corners', async () => {
  const svg = await render('static-render', 'demo');
  const [dashed] = paths(svg).filter((p) => p.includes('stroke-dasharray="7 6"'));
  // The gutter between cols 0 and 1 is at (250 + 295) / 2 = 272.5, so x = 360.4.
  assert.match(dashed!, /L360.4 [\d.]+ Q360.4/);
  assert.match(dashed!, /stroke-linejoin="round"/);
});

test('wraps a long box title to two lines', async () => {
  const svg = await render('static-render', 'demo');
  assert.ok(svg.includes('>A rather long</text>'));
  assert.ok(svg.includes('>box title</text>'));
});

test('draws a band and a label for a lane with svg config only', async () => {
  const svg = await render('static-render', 'demo');
  assert.ok(svg.includes('fill="#555555" stroke="#999999"'));
  assert.ok(svg.includes('>Bottom</text>'));
  assert.ok(!svg.includes('>Top lane</text>'));
});

test('lists the kinds used in the key, with the svg key label', async () => {
  const svg = await render('static-render', 'demo');
  assert.ok(svg.includes('>Box</text>'));
  assert.ok(svg.includes('>Store</text>'));
  assert.ok(!svg.includes('>Unused</text>'));
});

test('rejects a part without a static position', async () => {
  const { config, flows } = await loadProject(fixture('static-render'));
  const flow = { ...flows.get('demo')!, static: { a: [0, 1] as [number, number] } };
  assert.throws(
    () => renderSvg(flow, config, THEME, BACKGROUND),
    /part "b" has no static position/,
  );
});

const PINS = { a: [0, 0], b: [2, 0], e: [1, 1], c: [0, 3], d: [2, 3] } as const;

async function renderWith(pins: Record<string, readonly [number, number]>, labels = {}) {
  const { config, flows } = await loadProject(fixture('static-render'));
  const demo = flows.get('demo')!;
  const flow = {
    ...demo,
    static: Object.fromEntries(Object.entries({ ...PINS, ...pins }).map(([k, v]) => [k, [...v]])),
    parts: demo.parts.map((p) => ({ ...p, ...(labels as Record<string, object>)[p.id] })),
  } as typeof demo;
  return () => renderSvg(flow, config, THEME, BACKGROUND);
}

test('rejects a box in the reserved area', async () => {
  // Row 4 is y 700: 700 * 1.15 + 30 = 835, inside y 810..900, and column 0 is inside x 0..330.
  assert.throws(await renderWith({ c: [0, 4] }), /demo\.md: part "c" overlaps the reserved area/);
});

test('rejects a band that starts above the canvas', async () => {
  const pins = { a: [0, 1], b: [2, 1], e: [1, 2], c: [0, 0], d: [2, 0] } as const;
  assert.throws(await renderWith(pins), /demo\.md: the band of lane "bottom" starts above/);
});

test('rejects a part in the key cell', async () => {
  assert.throws(await renderWith({ b: [4, 0] }), /demo\.md: part "b" sits in the key cell/);
});

test('rejects a straight edge through another box', async () => {
  assert.throws(await renderWith({ e: [1, 0] }), /demo\.md: edge "ab" passes through part "e"/);
});

test('rejects the last leg of an elbow through another box', async () => {
  // ce runs from c (0, 3) to e (2, 1); its last leg crosses column 1 of row 1, where a is.
  const fn = await renderWith({ a: [1, 1], b: [1, 0], e: [2, 1], d: [3, 3] });
  assert.throws(fn, /demo\.md: edge "ce" passes through part "a"/);
});

test('rejects a box title word wider than the box', async () => {
  const fn = await renderWith({}, { a: { label: 'Supercalifragilisticexpialidocious' } });
  assert.throws(fn, /demo\.md: part "a" title line "Supercalifragilisticexpialidocious"/);
});

test('rejects an edge label wider than its edge', async () => {
  // ab spans columns 0 to 2 in row 0: 550 - 250 = 300 units of room.
  const { config, flows } = await loadProject(fixture('static-render'));
  const demo = flows.get('demo')!;
  const long = 'a label that is far too long for the room it has';
  const flow = {
    ...demo,
    edges: demo.edges.map((e) => (e.id === 'ab' ? { ...e, label: long } : e)),
  };
  assert.throws(() => renderSvg(flow, config, THEME, BACKGROUND), /label of edge "ab" is wider/);
});

test('checks a sublabel against the full box width', async () => {
  // At 0.52 em/char and 18 units, 21 chars are 196.6: over the inner 178, under the full 210.
  assert.doesNotThrow(await renderWith({}, { a: { tech: 'from the parent chain' } }));
  const fn = await renderWith({}, { a: { tech: 'a sublabel far too long for any box' } });
  assert.throws(fn, /demo\.md: part "a" sublabel "a sublabel far too long for any box" is wider/);
});

test('rejects two parts pinned to one cell', async () => {
  const fn = await renderWith({ e: [0, 0] });
  assert.throws(fn, /demo\.md: parts "a" and "e" share cell \[0, 0\]/);
});
