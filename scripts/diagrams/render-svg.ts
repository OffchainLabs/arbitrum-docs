import type { Theme } from '../../components/widgets/FlowDiagram/model.ts';
import type { DiagramEdge, DiagramFlow, Part, ProjectConfig } from './types.ts';

/** Layout constants in canvas units before `svg.scale`. Brand floors: 21 title, 18 sub, 17 chip. */
const TITLE_SIZE = 21;
const SUB_SIZE = 18;
const CHIP_SIZE = 17;
const LINE_STEP = 25;
const BASELINE = 7;
const EM_PER_CHAR = 0.52;
const BOX_PADDING = 16;
const BOX_RADIUS = 10;
const BOX_STROKE = 1.5;
const ARROW_STROKE = 3;
const PORT_GAP = 30;
const CHIP_HEIGHT = 27;
const CHIP_PADDING = 18;
const CHIP_TEXT = 19;
const CHIP_RADIUS = 6;
const CHIP_OPACITY = 0.92;
const CHIP_CLEARANCE = 13;
const BAND = { side: 20, top: 90, bottom: 16, label: 12, radius: 14 };
const KEY = { top: 6, step: 28, swatch: 18, radius: 4, text: 28, baseline: 15 };
/** Corner radius of a rounded elbow, in final canvas units. */
const CORNER = 12;

type Point = [number, number];
type Side = 'left' | 'right' | 'top' | 'bottom';

interface Box {
  part: Part;
  col: number;
  row: number;
  x: number;
  y: number;
}

interface Band {
  top: number;
  bottom: number;
  rect: { x: number; y: number; width: number; height: number };
  fill: string;
  stroke: string;
  label: string;
}

interface Route {
  edge: DiagramEdge;
  points: Point[];
  /** `room` is the space for the chip along its edge. */
  chip?: { cx: number; top: number; room: number };
}

const esc = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const fmt = (value: number) => String(Number(value.toFixed(1)));

const textWidth = (text: string, size: number) => text.length * EM_PER_CHAR * size;

/** Greedy word wrap against the estimated width of each line. */
export function wrapTitle(title: string, width: number): string[] {
  const lines: string[] = [];
  for (const word of title.split(' ')) {
    const last = lines.at(-1);
    if (last !== undefined && textWidth(`${last} ${word}`, TITLE_SIZE) <= width) {
      lines[lines.length - 1] = `${last} ${word}`;
    } else {
      lines.push(word);
    }
  }
  return lines;
}

/** Maps canvas units to final SVG units: `v * scale + offset`, with no group transform. */
class Canvas {
  readonly #scale: number;
  readonly #offset: [number, number];
  constructor(config: ProjectConfig) {
    this.#scale = config.svg.scale;
    this.#offset = config.svg.offset;
  }
  x = (v: number) => v * this.#scale + this.#offset[0];
  y = (v: number) => v * this.#scale + this.#offset[1];
  size = (v: number) => fmt(v * this.#scale);
  /** `x`, `y`, `width`, `height` and `rx` attributes of a rect. */
  rect(x: number, y: number, width: number, height: number, radius: number): string {
    return (
      `x="${fmt(this.x(x))}" y="${fmt(this.y(y))}" width="${this.size(width)}" ` +
      `height="${this.size(height)}" rx="${this.size(radius)}"`
    );
  }
}

function requireStyle(flow: DiagramFlow, theme: Theme) {
  if (flow.alt === undefined) throw new Error(`${flow.file}: alt is required to render an SVG`);
  return { ink: theme.ink, chip: theme.chip, font: theme.font, alt: flow.alt };
}

function placeBoxes(flow: DiagramFlow, config: ProjectConfig): Map<string, Box> {
  const { cols, rows } = config.svg;
  const boxes = new Map<string, Box>();
  for (const part of flow.parts) {
    const pin = flow.static?.[part.id];
    if (!pin) throw new Error(`${flow.file}: part "${part.id}" has no static position`);
    const [col, row] = pin;
    const x = cols[col];
    const y = rows[row];
    if (x === undefined || y === undefined) {
      throw new Error(`${flow.file}: static position of "${part.id}" is outside svg.cols or rows`);
    }
    boxes.set(part.id, { part, col, row, x, y });
  }
  checkPlacement(flow, config, boxes);
  return boxes;
}

/** Keep boxes out of the reserved area and out of the key cell. */
function checkPlacement(flow: DiagramFlow, config: ProjectConfig, boxes: Map<string, Box>) {
  const { box, scale, offset, reserve, cols } = config.svg;
  const cells = new Map<string, string>();
  for (const { part, col, row, x, y } of boxes.values()) {
    const cell = `${col},${row}`;
    const other = cells.get(cell);
    if (other !== undefined) {
      throw new Error(
        `${flow.file}: parts "${other}" and "${part.id}" share cell [${col}, ${row}]`,
      );
    }
    cells.set(cell, part.id);
    if (col === cols.length - 1 && row === 0) {
      throw new Error(`${flow.file}: part "${part.id}" sits in the key cell, the top-right cell`);
    }
    if (!reserve) continue;
    const [x0, y0] = [x * scale + offset[0], y * scale + offset[1]];
    const [x1, y1] = [x0 + box[0] * scale, y0 + box[1] * scale];
    if (x0 < reserve.x[1] && x1 > reserve.x[0] && y0 < reserve.y[1] && y1 > reserve.y[0]) {
      throw new Error(`${flow.file}: part "${part.id}" overlaps the reserved area`);
    }
  }
}

/** The ids of placed boxes strictly between two cells of one row or one column. */
function boxesBetween(boxes: Map<string, Box>, s: Box, t: Box, row: number): string[] {
  const [lo, hi] = s.row === t.row || s.col !== t.col ? [s.col, t.col] : [s.row, t.row];
  const inRange = (v: number) => v > Math.min(lo, hi) && v < Math.max(lo, hi);
  return [...boxes.values()]
    .filter((b) =>
      s.col === t.col ? b.col === s.col && inRange(b.row) : b.row === row && inRange(b.col),
    )
    .map((b) => b.part.id);
}

function edgeSides(flow: DiagramFlow, edge: DiagramEdge, s: Box, t: Box): [Side, Side] {
  if (s === t) throw new Error(`${flow.file}: edge "${edge.id}" starts and ends on one part`);
  if (s.row === t.row || s.col !== t.col) {
    return s.col < t.col ? ['right', 'left'] : ['left', 'right'];
  }
  return s.row < t.row ? ['bottom', 'top'] : ['top', 'bottom'];
}

interface Endpoint {
  edge: number;
  end: 0 | 1;
  order: number;
}

/**
 * Spread the edge ends that share one side of a box, `PORT_GAP` apart around the centre.
 * Ends are sorted by the position of the far box along that side, then by edge order.
 */
function assignPorts(boxes: Map<string, Box>, sides: [Side, Side][], edges: DiagramEdge[]) {
  const groups = new Map<string, Endpoint[]>();
  edges.forEach((edge, i) => {
    const ends = [edge.source, edge.target];
    ([0, 1] as const).forEach((end) => {
      const side = sides[i]![end];
      const far = boxes.get(ends[1 - end]!)!;
      const order = side === 'left' || side === 'right' ? far.y : far.x;
      const key = `${ends[end]}:${side}`;
      groups.set(key, [...(groups.get(key) ?? []), { edge: i, end, order }]);
    });
  });
  const offset = new Map<string, number>();
  const count = new Map<string, number>();
  for (const group of groups.values()) {
    group.sort((a, b) => a.order - b.order || a.edge - b.edge);
    group.forEach((p, i) => {
      offset.set(`${p.edge}:${p.end}`, (i - (group.length - 1) / 2) * PORT_GAP);
      count.set(`${p.edge}:${p.end}`, group.length);
    });
  }
  return { offset: (i: number, end: 0 | 1) => offset.get(`${i}:${end}`)!, count };
}

function sidePoint(box: Box, side: Side, offset: number, size: [number, number]): Point {
  const [w, h] = size;
  if (side === 'left') return [box.x, box.y + h / 2 + offset];
  if (side === 'right') return [box.x + w, box.y + h / 2 + offset];
  if (side === 'top') return [box.x + w / 2 + offset, box.y];
  return [box.x + w / 2 + offset, box.y + h];
}

function gutter(config: ProjectConfig, s: Box, t: Box): number {
  const { cols, box } = config.svg;
  const left = s.col < t.col ? s.col : s.col - 1;
  return (cols[left]! + box[0] + cols[left + 1]!) / 2;
}

function chipFor(points: Point[], bands: Band[], boxWidth: number): Route['chip'] {
  const [a, b] = points.length === 2 ? points : [points[1]!, points[2]!];
  if (a![1] === b![1]) {
    const room = Math.abs(b![0] - a![0]);
    return { cx: (a![0] + b![0]) / 2, top: a![1] - CHIP_CLEARANCE - CHIP_HEIGHT, room };
  }
  let [from, to] = [a![1], b![1]];
  for (const band of bands) {
    for (const edge of [band.top, band.bottom]) {
      if ((from - edge) * (to - edge) < 0) from = edge;
    }
  }
  return { cx: a![0], top: (from + to) / 2 - CHIP_HEIGHT / 2, room: boxWidth };
}

function routeEdges(flow: DiagramFlow, config: ProjectConfig, boxes: Map<string, Box>) {
  const { edges } = flow;
  const size = config.svg.box;
  const ends = edges.map((e) => [boxes.get(e.source)!, boxes.get(e.target)!] as const);
  const sides = edges.map((e, i) => edgeSides(flow, e, ends[i]![0], ends[i]![1]));
  const ports = assignPorts(boxes, sides, edges);
  return ends.map(([s, t], i): Point[] => {
    const [ss, ts] = sides[i]!;
    const [blocker] = boxesBetween(boxes, s, t, t.row);
    if (blocker !== undefined) {
      throw new Error(`${flow.file}: edge "${edges[i]!.id}" passes through part "${blocker}"`);
    }
    if (s.row === t.row || s.col === t.col) {
      const busier = ports.count.get(`${i}:0`)! >= ports.count.get(`${i}:1`)! ? 0 : 1;
      const offset = ports.offset(i, busier);
      return [sidePoint(s, ss, offset, size), sidePoint(t, ts, offset, size)];
    }
    const from = sidePoint(s, ss, ports.offset(i, 0), size);
    const to = sidePoint(t, ts, ports.offset(i, 1), size);
    const gx = gutter(config, s, t);
    return [from, [gx, from[1]], [gx, to[1]], to];
  });
}

function laneBands(flow: DiagramFlow, config: ProjectConfig, boxes: Map<string, Box>): Band[] {
  if (!flow.showLanes) return [];
  const { cols, box } = config.svg;
  const left = cols[0]! - BAND.side;
  const right = cols.at(-1)! + box[0] + BAND.side;
  const bands: Band[] = [];
  for (const [id, lane] of Object.entries(config.lanes)) {
    const ys = [...boxes.values()].filter((b) => b.part.lane === id).map((b) => b.y);
    if (!lane.svg || ys.length === 0) continue;
    const top = Math.min(...ys) - BAND.top;
    if (top * config.svg.scale + config.svg.offset[1] < 0) {
      throw new Error(`${flow.file}: the band of lane "${id}" starts above the canvas top`);
    }
    const bottom = Math.max(...ys) + box[1] + BAND.bottom;
    bands.push({
      top,
      bottom,
      rect: { x: left, y: top, width: right - left, height: bottom - top },
      fill: lane.svg.fill,
      stroke: lane.svg.stroke,
      label: lane.svg.label ?? lane.label,
    });
  }
  return bands;
}

function roundedPath(points: Point[]): string {
  const at = (p: Point) => `${fmt(p[0])} ${fmt(p[1])}`;
  const parts = [`M${at(points[0]!)}`];
  for (let i = 1; i < points.length - 1; i++) {
    const [p0, p1, p2] = [points[i - 1]!, points[i]!, points[i + 1]!];
    const len0 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    const len2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const r = Math.min(CORNER, len0 / 2, len2 / 2);
    const before: Point = [
      p1[0] + ((p0[0] - p1[0]) / len0) * r,
      p1[1] + ((p0[1] - p1[1]) / len0) * r,
    ];
    const after: Point = [
      p1[0] + ((p2[0] - p1[0]) / len2) * r,
      p1[1] + ((p2[1] - p1[1]) / len2) * r,
    ];
    parts.push(`L${at(before)}`, `Q${at(p1)} ${at(after)}`);
  }
  parts.push(`L${at(points.at(-1)!)}`);
  return parts.join(' ');
}

function arrow(canvas: Canvas, route: Route, ink: string): string {
  const points = route.points.map(([x, y]): Point => [canvas.x(x), canvas.y(y)]);
  const elbow = points.length > 2;
  const join = elbow ? ' stroke-linejoin="round" stroke-linecap="round"' : '';
  const { style, both } = route.edge;
  let dash = style === 'dashed' ? ' stroke-dasharray="7 6"' : '';
  if (style === 'dotted') {
    dash = ` stroke-dasharray="0.1 8"${elbow ? '' : ' stroke-linecap="round"'}`;
  }
  const start = both ? ' marker-start="url(#arrow)"' : '';
  return (
    `<path d="${roundedPath(points)}" fill="none"${join} stroke="${ink}" ` +
    `stroke-width="${canvas.size(ARROW_STROKE)}"${dash}${start} marker-end="url(#arrow)"/>`
  );
}

function chip(canvas: Canvas, cx: number, top: number, label: string, style: Style): string[] {
  const width = textWidth(label, CHIP_SIZE) + CHIP_PADDING;
  const box = canvas.rect(cx - width / 2, top, width, CHIP_HEIGHT, CHIP_RADIUS);
  return [
    `<rect ${box} fill="${style.chip}" opacity="${CHIP_OPACITY}"/>`,
    `<text x="${fmt(canvas.x(cx))}" y="${fmt(canvas.y(top + CHIP_TEXT))}" text-anchor="middle" ` +
      `fill="${style.ink}" font-size="${canvas.size(CHIP_SIZE)}">${esc(label)}</text>`,
  ];
}

type Style = ReturnType<typeof requireStyle>;

function boxElements(file: string, canvas: Canvas, config: ProjectConfig, box: Box): string[] {
  const [w, h] = config.svg.box;
  const colours = config.kinds[box.part.kind]!.svg;
  const stroke = colours.stroke
    ? ` stroke="${colours.stroke}" stroke-width="${canvas.size(BOX_STROKE)}"`
    : '';
  const out = [
    `<rect ${canvas.rect(box.x, box.y, w, h, BOX_RADIUS)} fill="${colours.fill}"${stroke}/>`,
  ];
  const inner = w - 2 * BOX_PADDING;
  const lines = wrapTitle(box.part.label, inner);
  for (const line of lines) {
    if (textWidth(line, TITLE_SIZE) > inner) {
      throw new Error(`${file}: part "${box.part.id}" title line "${line}" is wider than the box`);
    }
  }
  const { tech } = box.part;
  if (tech !== undefined && textWidth(tech, SUB_SIZE) > w) {
    throw new Error(`${file}: part "${box.part.id}" sublabel "${tech}" is wider than the box`);
  }
  const count = lines.length + (tech === undefined ? 0 : 1);
  const top = box.y + h / 2 - ((count - 1) * LINE_STEP) / 2 + BASELINE;
  const cx = fmt(canvas.x(box.x + w / 2));
  const text = (i: number, fill: string, size: number, extra: string, value: string) =>
    `<text x="${cx}" y="${fmt(canvas.y(top + i * LINE_STEP))}" text-anchor="middle" ` +
    `fill="${fill}" font-size="${canvas.size(size)}"${extra}>${esc(value)}</text>`;
  lines.forEach((line, i) =>
    out.push(text(i, colours.title, TITLE_SIZE, ' font-weight="700"', line)),
  );
  if (tech !== undefined) out.push(text(lines.length, colours.sub, SUB_SIZE, '', tech));
  return out;
}

function keyElements(canvas: Canvas, config: ProjectConfig, flow: DiagramFlow, ink: string) {
  const used = new Set(flow.parts.map((p) => p.kind));
  const kinds = Object.entries(config.kinds).filter(([id]) => used.has(id));
  const x = config.svg.cols.at(-1)!;
  return kinds.flatMap(([, kind], i) => {
    const y = config.svg.rows[0]! + KEY.top + i * KEY.step;
    const stroke = kind.svg.stroke
      ? ` stroke="${kind.svg.stroke}" stroke-width="${canvas.size(BOX_STROKE)}"`
      : '';
    const swatch = canvas.rect(x, y, KEY.swatch, KEY.swatch, KEY.radius);
    const label = esc(kind.svg.key ?? kind.label);
    return [
      `<rect ${swatch} fill="${kind.svg.fill}"${stroke}/>`,
      `<text x="${fmt(canvas.x(x + KEY.text))}" y="${fmt(canvas.y(y + KEY.baseline))}" ` +
        `fill="${ink}" font-size="${canvas.size(CHIP_SIZE)}">${label}</text>`,
    ];
  });
}

/** The first column whose centre no vertical edge crosses at the band top. */
function bandLabelX(config: ProjectConfig, band: Band, routes: Route[]): number {
  const { cols, box } = config.svg;
  const half = (textWidth(band.label, CHIP_SIZE) + CHIP_PADDING) / 2;
  const crossings = routes.flatMap((r) =>
    r.points.slice(1).flatMap((p, i) => {
      const q = r.points[i]!;
      const crosses = p[0] === q[0] && (p[1] - band.top) * (q[1] - band.top) < 0;
      return crosses ? [p[0]] : [];
    }),
  );
  const centres = cols.map((c) => c + box[0] / 2);
  return centres.find((cx) => crossings.every((x) => Math.abs(x - cx) > half)) ?? centres[0]!;
}

function bandElements(
  canvas: Canvas,
  config: ProjectConfig,
  bands: Band[],
  routes: Route[],
  style: Style,
) {
  return bands.flatMap((band) => {
    const { x, y, width, height } = band.rect;
    return [
      `<rect ${canvas.rect(x, y, width, height, BAND.radius)} fill="${band.fill}" ` +
        `stroke="${band.stroke}" stroke-width="${canvas.size(BOX_STROKE)}"/>`,
      ...chip(canvas, bandLabelX(config, band, routes), band.top + BAND.label, band.label, style),
    ];
  });
}

/**
 * Render a flow with `static:` positions as a self-contained SVG on the given background.
 *
 * Layout limits, each checked with an error that names the flow file:
 * - Parts sit on grid cells only: a `static` pin is a [column, row] index into `svg.cols`
 *   and `svg.rows`. No box may overlap `svg.reserve`.
 * - The key takes the top-right cell (last column, row 0), so no part may sit there.
 * - A lane band reaches 90 units above its top row and 16 below its bottom row, so a banded
 *   lane in row 0 does not fit.
 * - A straight edge, and the last leg of an elbow, may not pass through another box.
 * - Text width is estimated at 0.52 em/char. A box title line must fit the box width minus
 *   32. A sublabel must fit the full box width, because the estimate overstates regular
 *   18-unit text. An edge label chip must fit the length of a horizontal edge or the box width.
 *
 * Args:
 *   flow: the flow; every part needs a `static` [column, row] pin, and `alt` is required.
 *   project: the project config.
 *   theme: the shared colors and font; the SVG reads `ink`, `chip` and `font`.
 *   background: an SVG fragment drawn first, under everything else.
 *
 * Returns:
 *   The SVG document text, ending with a newline.
 */
export function renderSvg(
  flow: DiagramFlow,
  project: ProjectConfig,
  theme: Theme,
  background: string,
): string {
  const style = requireStyle(flow, theme);
  const canvas = new Canvas(project);
  const boxes = placeBoxes(flow, project);
  const bands = laneBands(flow, project, boxes);
  const routes: Route[] = routeEdges(flow, project, boxes).map((points, i) => {
    const edge = flow.edges[i]!;
    if (edge.label === '') return { edge, points };
    const placed = chipFor(points, bands, project.svg.box[0])!;
    if (textWidth(edge.label, CHIP_SIZE) + CHIP_PADDING > placed.room) {
      throw new Error(`${flow.file}: the label of edge "${edge.id}" is wider than its edge`);
    }
    return { edge, points, chip: placed };
  });
  const elements = [
    ...bandElements(canvas, project, bands, routes, style),
    ...routes.map((route) => arrow(canvas, route, style.ink)),
    ...routes.flatMap((r) =>
      r.chip ? chip(canvas, r.chip.cx, r.chip.top, r.edge.label, style) : [],
    ),
    ...[...boxes.values()].flatMap((box) => boxElements(flow.file, canvas, project, box)),
    ...keyElements(canvas, project, flow, style.ink),
  ];
  const [width, height] = project.svg.canvas;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" ` +
      `height="${height}" role="img" aria-labelledby="t d">`,
    `<title id="t">${esc(flow.title)}</title>`,
    `<desc id="d">${esc(style.alt)}</desc>`,
    '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" ' +
      `markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" ` +
      `fill="${style.ink}"/></marker></defs>`,
    background.trim(),
    `<g font-family="${esc(style.font)}">`,
    ...elements,
    '</g>',
    '</svg>\n',
  ].join('\n');
}
