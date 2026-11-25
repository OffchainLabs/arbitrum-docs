import type { Box, Point } from './layout.ts';

const VERTICAL_TOLERANCE = 0.5;

interface Size {
  width: number;
  height: number;
}

interface Segment {
  from: Point;
  to: Point;
  length: number;
  vertical: boolean;
}

function segmentsOf(route: Point[]): Segment[] {
  const segments: Segment[] = [];
  for (let i = 1; i < route.length; i++) {
    const from = route[i - 1] as Point;
    const to = route[i] as Point;
    segments.push({
      from,
      to,
      length: Math.abs(to.x - from.x) + Math.abs(to.y - from.y),
      vertical: Math.abs(to.x - from.x) <= VERTICAL_TOLERANCE,
    });
  }
  return segments;
}

function longestFirst(segments: Segment[]): Segment[] {
  return [...segments].sort((a, b) => b.length - a.length);
}

function candidatesOn(segment: Segment, size: Size): Box[] {
  const { width, height } = size;
  if (segment.vertical) {
    const x = (segment.from.x + segment.to.x) / 2 - width / 2;
    const top = Math.min(segment.from.y, segment.to.y);
    const bottom = Math.max(segment.from.y, segment.to.y);
    const ys = [(top + bottom) / 2 - height / 2, top, bottom - height];
    return ys.map((y) => ({ x, y, width, height }));
  }
  const y = segment.from.y - height / 2;
  const left = Math.min(segment.from.x, segment.to.x);
  const right = Math.max(segment.from.x, segment.to.x);
  const xs = [(left + right) / 2 - width / 2, left, right - width];
  return xs.map((x) => ({ x, y, width, height }));
}

function overlaps(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

function candidatesFor(route: Point[], size: Size): Box[] {
  const segments = longestFirst(segmentsOf(route));
  const vertical = segments.filter((segment) => segment.vertical);
  const longest = segments.slice(0, 1);
  return [...vertical, ...longest].flatMap((segment) => candidatesOn(segment, size));
}

/**
 * Places each label chip on its own routed edge.
 *
 * Routes are processed in key order. A label goes on a vertical segment when the route has one,
 * and takes the first candidate that overlaps no obstacle and no label placed before it. If no
 * candidate fits, it takes the first candidate.
 *
 * @param routes Edge id to route points.
 * @param sizes Edge id to label size.
 * @param obstacles Boxes a label must not cover.
 * @returns Edge id to label box.
 * @throws Error when an edge has no label size or a route with fewer than 2 points.
 */
export function placeLabels(
  routes: Record<string, Point[]>,
  sizes: Record<string, Size>,
  obstacles: Box[],
): Record<string, Box> {
  const placed: Record<string, Box> = {};
  const taken: Box[] = [...obstacles];
  for (const [id, route] of Object.entries(routes)) {
    const size = sizes[id];
    if (!size) throw new Error(`placeLabels: no label size for edge "${id}"`);
    if (route.length < 2) {
      throw new Error(`placeLabels: route for edge "${id}" has fewer than 2 points`);
    }
    const candidates = candidatesFor(route, size);
    const chosen = candidates.find((box) => !taken.some((other) => overlaps(box, other)));
    const box = chosen ?? candidates[0];
    if (!box) throw new Error(`placeLabels: no label position for edge "${id}"`);
    placed[id] = box;
    taken.push(box);
  }
  return placed;
}
