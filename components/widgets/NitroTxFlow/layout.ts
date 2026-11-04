import type { ElkNode } from 'elkjs/lib/elk-api';
import ELK from 'elkjs/lib/elk.bundled.js';

import type { Flow, FlowEdge } from './model.ts';

export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 72;

const LABEL_HEIGHT = 24;
const BAND_INSET = 16;
const BAND_EDGE = 32;

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

export interface EdgeLayout {
  points: Point[];
  label: Box;
}

export interface Band {
  chain: 'child' | 'parent';
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
export function labelWidth(edge: FlowEdge, stepNumbers: number[]): number {
  return Math.ceil(edge.label.length * 0.52 * 12) + 12 + stepNumbers.length * 26;
}

// One row per actor, ordered by the first step that lists it.
export function firstInteractionRank(flow: Flow): Record<string, number> {
  const rank: Record<string, number> = {};
  let next = 0;
  for (const step of flow.steps) {
    for (const id of step.actors) {
      if (!(id in rank)) rank[id] = next++;
    }
  }
  return rank;
}

function stepNumbersByEdge(flow: Flow): Record<string, number[]> {
  const numbers: Record<string, number[]> = {};
  flow.steps.forEach((step, index) => {
    for (const id of step.edges) (numbers[id] ??= []).push(index + 1);
  });
  return numbers;
}

// One band per run of adjacent rows on the same chain. A chain whose rows are not adjacent gets
// more than one band.
export function computeBands(flow: Flow, nodes: Record<string, Point>, width: number): Band[] {
  const rows = flow.actors
    .filter((actor) => actor.id in nodes)
    .sort((a, b) => nodes[a.id]!.y - nodes[b.id]!.y);
  const bands: Band[] = [];
  let start = 0;
  while (start < rows.length) {
    const chain = rows[start]!.chain;
    let end = start;
    while (end + 1 < rows.length && rows[end + 1]!.chain === chain) end++;
    if (chain === 'child' || chain === 'parent') {
      const firstTop = nodes[rows[start]!.id]!.y;
      const lastBottom = nodes[rows[end]!.id]!.y + NODE_HEIGHT;
      const prev = rows[start - 1];
      const next = rows[end + 1];
      const top = prev ? (nodes[prev.id]!.y + NODE_HEIGHT + firstTop) / 2 : firstTop - BAND_EDGE;
      const bottom = next ? (lastBottom + nodes[next.id]!.y) / 2 : lastBottom + BAND_EDGE;
      bands.push({
        chain,
        actors: rows.slice(start, end + 1).map((actor) => actor.id),
        box: { x: -BAND_INSET, y: top, width: width + 2 * BAND_INSET, height: bottom - top },
      });
    }
    start = end + 1;
  }
  return bands;
}

export async function computeLayout(flow: Flow): Promise<FlowLayout> {
  const rank = firstInteractionRank(flow);
  const stepNumbers = stepNumbersByEdge(flow);
  const input: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.partitioning.activate': 'true',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.edgeLabels.placement': 'CENTER',
      'elk.spacing.nodeNode': '60',
      'elk.spacing.edgeLabel': '6',
      'elk.spacing.edgeEdge': '24',
      'elk.layered.spacing.nodeNodeBetweenLayers': '60',
      'elk.layered.spacing.edgeNodeBetweenLayers': '24',
    },
    children: flow.actors.map((actor) => ({
      id: actor.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      layoutOptions: { 'elk.partitioning.partition': String(rank[actor.id]) },
    })),
    edges: flow.edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
      labels: [
        {
          id: `${edge.id}-label`,
          text: edge.label,
          width: labelWidth(edge, stepNumbers[edge.id] ?? []),
          height: LABEL_HEIGHT,
        },
      ],
    })),
  };
  const graph = await elk.layout(input);

  const nodes: Record<string, Point> = {};
  for (const child of graph.children ?? []) nodes[child.id] = { x: child.x ?? 0, y: child.y ?? 0 };

  const edges: Record<string, EdgeLayout> = {};
  for (const edge of graph.edges ?? []) {
    const section = edge.sections?.[0];
    const label = edge.labels?.[0];
    if (!section || !label) throw new Error(`ELK returned no route or label for edge ${edge.id}`);
    edges[edge.id] = {
      points: [section.startPoint, ...(section.bendPoints ?? []), section.endPoint],
      label: { x: label.x ?? 0, y: label.y ?? 0, width: label.width ?? 0, height: LABEL_HEIGHT },
    };
  }

  const width = graph.width ?? 0;
  return {
    nodes,
    edges,
    bands: computeBands(flow, nodes, width),
    width,
    height: graph.height ?? 0,
  };
}
