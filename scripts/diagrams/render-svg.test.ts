import assert from 'node:assert/strict';
import { test } from 'node:test';

import { loadProject } from './load.ts';
import { renderSvg } from './render-svg.ts';

const fixture = (name: string) => new URL(`./fixtures/${name}`, import.meta.url).pathname;
const BACKGROUND = '<g transform="scale(2)"><rect width="800" height="450" fill="#808080"/></g>';

async function render(name: string, flowId: string): Promise<string> {
  const { config, flows } = await loadProject(fixture(name));
  return renderSvg(flows.get(flowId)!, config, BACKGROUND);
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

test('keeps content out of the logo zone', async () => {
  const svg = afterBackground(await render('static-render', 'demo'));
  const tags = [...svg.matchAll(/<(rect|text) [^>]*>/g)].map((m) => m[0]);
  assert.ok(tags.length > 0);
  for (const tag of tags) {
    const x = Number(/ x="([-\d.]+)"/.exec(tag)![1]);
    const y = Number(/ y="([-\d.]+)"/.exec(tag)![1]);
    assert.ok(y < 810 || x >= 330, `in the logo zone: ${tag}`);
  }
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
  assert.throws(() => renderSvg(flow, config, BACKGROUND), /part "b" has no static position/);
});
