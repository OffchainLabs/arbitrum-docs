import type { ElkNode } from 'elkjs/lib/elk-api';
import ELK from 'elkjs/lib/elk.bundled.js';

import { PROJECT } from './flows.ts';
import { placeLabels } from './labels.ts';
import { type Actor, type Flow, type FlowEdge, type Step } from './model.ts';

export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 72;

const LABEL_HEIGHT = 24;
const COLUMN_GAP = 40;
const LANE_GAP = 72;
const BAND_MARGIN = 24;

export interface Point {
  x: number;
  y: number;
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The box a part's node fills when its top-left corner is at `point`. */
export function nodeBox(point: Point): Box {
  return { ...point, width: NODE_WIDTH, height: NODE_HEIGHT };
}

export interface EdgeLayout {
  points: Point[];
  label: Box;
}

export interface Band {
  // A lane with widget band colors.
  chain: string;
  actors: string[];
  box: Box;
}

export interface FlowLayout {
  nodes: Record<string, Point>;
  edges: Record<string, EdgeLayout>;
  bands: Band[];
  width: number;
  height: number;
}

const elk = new ELK();

// Chip width estimate from the brand skill: 0.52 em/char at 12px, 12px padding, 26px per badge.
export function labelWidth(edge: FlowEdge, badgeCount: number): number {
  return Math.ceil(edge.label.length * 0.52 * 12) + 12 + badgeCount * 26;
}

const LANE_ORDER = Object.keys(PROJECT.lanes);

const BASE_OPTIONS: Record<string, string> = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.edgeRouting': 'ORTHOGONAL',
  // One graph, so the time order holds across parts that share no edge.
  'elk.separateConnectedComponents': 'false',
  'elk.spacing.nodeNode': '40',
  'elk.spacing.edgeEdge': '24',
  'elk.layered.spacing.nodeNodeBetweenLayers': '80',
  'elk.layered.spacing.edgeNodeBetweenLayers': '24',
};

const PRESET_OPTIONS: Record<string, string> = {
  ...BASE_OPTIONS,
  'elk.layered.layering.strategy': 'INTERACTIVE',
  'elk.layered.crossingMinimization.strategy': 'INTERACTIVE',
  'elk.layered.nodePlacement.strategy': 'INTERACTIVE',
  'elk.layered.cycleBreaking.strategy': 'INTERACTIVE',
};

/**
 * The index of the first step that lists each part.
 *
 * @param steps The steps of one path.
 * @returns Part id to step index.
 */
export function firstStepIndex(steps: readonly Step[]): Record<string, number> {
  const first: Record<string, number> = {};
  steps.forEach((step, index) => {
    for (const id of step.actors) first[id] ??= index;
  });
  return first;
}

// The 1-based numbers of the steps that use each edge. The label chips show them as badges.
export function stepNumbersByEdge(steps: readonly Step[]): Record<string, number[]> {
  const numbers: Record<string, number[]> = {};
  steps.forEach((step, index) => {
    for (const id of step.edges) (numbers[id] ??= []).push(index + 1);
  });
  return numbers;
}

/**
 * One band per lane that has widget colors and holds a part: one column over the full graph
 * height, from the lane's leftmost part to its rightmost part, with a margin on each side.
 *
 * @param flow The flow whose actors give each part its lane.
 * @param nodes Part id to top-left position. Parts not in `nodes` are left out.
 * @param height The graph height.
 * @returns The bands in project lane order.
 */
export function computeBands(flow: Flow, nodes: Record<string, Point>, height: number): Band[] {
  const bands: Band[] = [];
  for (const chain of LANE_ORDER) {
    if (!PROJECT.lanes[chain]?.widget) continue;
    const actors = flow.actors.filter((actor) => actor.chain === chain && actor.id in nodes);
    if (actors.length === 0) continue;
    const xs = actors.map((actor) => nodes[actor.id]!.x);
    const left = Math.min(...xs) - BAND_MARGIN;
    const right = Math.max(...xs) + NODE_WIDTH + BAND_MARGIN;
    bands.push({
      chain,
      actors: actors.map((actor) => actor.id),
      box: { x: left, y: 0, width: right - left, height },
    });
  }
  return bands;
}

function seedPartitions(
  actors: Actor[],
  edges: FlowEdge[],
  first: Record<string, number>,
): Record<string, number> {
  const targets = new Set(edges.map((edge) => edge.target));
  const partition: Record<string, number> = {};
  for (const actor of actors) {
    if (!targets.has(actor.id)) partition[actor.id] = first[actor.id] ?? 0;
  }
  return partition;
}

// Decision 1a: a part that no edge points to takes its first step index. Every other part takes
// the largest partition of the parts that point to it, propagated until no partition changes.
function partitions(
  actors: Actor[],
  edges: FlowEdge[],
  first: Record<string, number>,
): Record<string, number> {
  const partition = seedPartitions(actors, edges, first);
  let changed = true;
  while (changed) {
    changed = false;
    for (const edge of edges) {
      const source = partition[edge.source];
      const target = partition[edge.target];
      if (source === undefined || (target !== undefined && target >= source)) continue;
      partition[edge.target] = source;
      changed = true;
    }
  }
  return partition;
}

function elkEdges(edges: FlowEdge[]) {
  return edges.map((edge) => ({ id: edge.id, sources: [edge.source], targets: [edge.target] }));
}

// Pass 1: each part's time row, as a y.
async function rowTops(
  actors: Actor[],
  edges: FlowEdge[],
  partition: Record<string, number>,
): Promise<Record<string, number>> {
  const graph = await elk.layout({
    id: 'root',
    layoutOptions: {
      ...BASE_OPTIONS,
      'elk.layered.layering.strategy': 'LONGEST_PATH_SOURCE',
      'elk.partitioning.activate': 'true',
    },
    children: actors.map((actor) => ({
      id: actor.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      layoutOptions: { 'elk.partitioning.partition': String(partition[actor.id] ?? 0) },
    })),
    edges: elkEdges(edges),
  });
  return Object.fromEntries((graph.children ?? []).map((child) => [child.id, child.y ?? 0]));
}

// Lanes are columns in project lane order. Inside a lane, each part takes the first column whose
// parts are all at least NODE_HEIGHT away in y.
function columnLefts(actors: Actor[], y: Record<string, number>): Record<string, number> {
  const x: Record<string, number> = {};
  let laneLeft = 0;
  for (const lane of LANE_ORDER) {
    const ids = actors
      .filter((actor) => actor.chain === lane)
      .map((actor) => actor.id)
      .sort((a, b) => y[a]! - y[b]!);
    if (ids.length === 0) continue;
    const columns: string[][] = [];
    for (const id of ids) {
      let column = columns.findIndex((parts) =>
        parts.every((other) => Math.abs(y[other]! - y[id]!) >= NODE_HEIGHT),
      );
      if (column < 0) column = columns.push([]) - 1;
      columns[column]!.push(id);
      x[id] = laneLeft + column * (NODE_WIDTH + COLUMN_GAP);
    }
    laneLeft += columns.length * (NODE_WIDTH + COLUMN_GAP) - COLUMN_GAP + LANE_GAP;
  }
  return x;
}

// Pass 2: ELK keeps the preset positions and routes the edges.
async function routeWithPresets(
  actors: Actor[],
  edges: FlowEdge[],
  x: Record<string, number>,
  y: Record<string, number>,
): Promise<ElkNode> {
  return elk.layout({
    id: 'root',
    layoutOptions: PRESET_OPTIONS,
    children: actors.map((actor) => ({
      id: actor.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      x: x[actor.id],
      y: y[actor.id],
    })),
    edges: elkEdges(edges),
  });
}

function routesOf(graph: ElkNode): Record<string, Point[]> {
  const routes: Record<string, Point[]> = {};
  for (const edge of graph.edges ?? []) {
    const section = edge.sections?.[0];
    if (!section) throw new Error(`ELK returned no route for edge ${edge.id}`);
    routes[edge.id] = [section.startPoint, ...(section.bendPoints ?? []), section.endPoint];
  }
  return routes;
}

/**
 * Lays out one path as vertical swimlanes: lanes are columns, time runs top to bottom.
 *
 * @param flow The flow that holds the parts and edges.
 * @param steps The steps of one path. Only the parts and edges they use are laid out.
 * @returns Node positions, edge routes with label boxes, bands and the graph size.
 */
export async function computeLayout(flow: Flow, steps: readonly Step[]): Promise<FlowLayout> {
  const usedActors = new Set(steps.flatMap((step) => step.actors));
  const usedEdges = new Set(steps.flatMap((step) => step.edges));
  const actors = flow.actors.filter((actor) => usedActors.has(actor.id));
  const edges = flow.edges.filter((edge) => usedEdges.has(edge.id));
  for (const edge of edges) {
    for (const end of [edge.source, edge.target]) {
      if (!usedActors.has(end)) {
        throw new Error(`Flow "${flow.id}" edge "${edge.id}" end "${end}" is in no step's parts`);
      }
    }
  }

  const y = await rowTops(actors, edges, partitions(actors, edges, firstStepIndex(steps)));
  const graph = await routeWithPresets(actors, edges, columnLefts(actors, y), y);

  const nodes: Record<string, Point> = {};
  for (const child of graph.children ?? []) nodes[child.id] = { x: child.x ?? 0, y: child.y ?? 0 };

  const routes = routesOf(graph);
  const badgeCounts = stepNumbersByEdge(steps);
  const sizes = Object.fromEntries(
    edges.map((edge) => [
      edge.id,
      { width: labelWidth(edge, badgeCounts[edge.id]?.length ?? 0), height: LABEL_HEIGHT },
    ]),
  );
  const nodeBoxes = Object.values(nodes).map(nodeBox);
  const labels = placeLabels(routes, sizes, nodeBoxes);

  const edgeLayouts: Record<string, EdgeLayout> = {};
  for (const [id, points] of Object.entries(routes)) {
    edgeLayouts[id] = { points, label: labels[id]! };
  }

  const height = graph.height ?? 0;
  return {
    nodes,
    edges: edgeLayouts,
    // A flow that hides its chains draws no bands, so the camera must not frame them.
    bands: flow.showChains === false ? [] : computeBands(flow, nodes, height),
    width: graph.width ?? 0,
    height,
  };
}

// The boxes the camera frames: active nodes and active edge labels.
export function activeBoxes(layout: FlowLayout, step: Step): Box[] {
  return [
    ...step.actors.map((id) => nodeBox(layout.nodes[id]!)),
    ...step.edges.map((id) => layout.edges[id]!.label),
  ];
}
