import type { ElkNode } from 'elkjs/lib/elk-api';
import ELK from 'elkjs/lib/elk.bundled.js';

import { actors, edges, steps } from './model';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 72;
const LABEL_HEIGHT = 26;

const elk = new ELK();

export interface Point {
  x: number;
  y: number;
}

export interface Box extends Point {
  width: number;
  height: number;
}

export interface Band {
  chain: 'child' | 'parent';
  actors: string[];
  box: Box;
}

export interface Layout {
  nodes: Record<string, Point>;
  edges: Record<string, { points: Point[]; label: Box }>;
  bands: Band[];
}

const BAND_INSET = 16;
const BAND_EDGE = 32;
// Empty strip right of the graph for band headers. ELK draws nothing there, so a header never
// lands on an edge or an edge label at a chain boundary.
export const BAND_GUTTER = 240;

// One band per run of adjacent rows on the same chain. Rows follow first interaction, so a chain
// whose actors are not adjacent gets more than one band.
function computeBands(nodes: Record<string, Point>, width: number): Band[] {
  const rows = [...actors].sort((a, b) => nodes[a.id]!.y - nodes[b.id]!.y);
  const bands: Band[] = [];
  let i = 0;
  while (i < rows.length) {
    const chain = rows[i]!.chain;
    let j = i;
    while (j + 1 < rows.length && rows[j + 1]!.chain === chain) j++;
    if (chain === 'child' || chain === 'parent') {
      const firstTop = nodes[rows[i]!.id]!.y;
      const lastBottom = nodes[rows[j]!.id]!.y + NODE_HEIGHT;
      const prev = rows[i - 1];
      const next = rows[j + 1];
      const top = prev ? (nodes[prev.id]!.y + NODE_HEIGHT + firstTop) / 2 : firstTop - BAND_EDGE;
      const bottom = next ? (lastBottom + nodes[next.id]!.y) / 2 : lastBottom + BAND_EDGE;
      bands.push({
        chain,
        actors: rows.slice(i, j + 1).map((a) => a.id),
        box: {
          x: -BAND_INSET,
          y: top,
          width: width + 2 * BAND_INSET + BAND_GUTTER,
          height: bottom - top,
        },
      });
    }
    i = j + 1;
  }
  return bands;
}

export const STEP_NUMBERS: Record<string, number[]> = {};
steps.forEach((s, i) => {
  for (const id of s.edges) (STEP_NUMBERS[id] ??= []).push(i + 1);
});

// One row per actor, in the order each actor first takes part in a step.
function firstInteractionRank(): Record<string, number> {
  const rank: Record<string, number> = {};
  let next = 0;
  for (const step of steps) for (const id of step.actors) if (!(id in rank)) rank[id] = next++;
  return rank;
}

// Chip width estimate from the brand skill: 0.52 em/char at 12px, padding, one badge per step.
function labelWidth(text: string, badges: number): number {
  return Math.ceil(text.length * 0.52 * 12) + 16 + badges * 26;
}

export async function computeLayout(): Promise<Layout> {
  const rank = firstInteractionRank();
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
    children: actors.map((a) => ({
      id: a.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      layoutOptions: { 'elk.partitioning.partition': String(rank[a.id] ?? actors.length) },
    })),
    edges: edges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
      labels: [
        {
          id: `${e.id}-label`,
          text: e.label,
          width: labelWidth(e.label, STEP_NUMBERS[e.id]?.length ?? 0),
          height: LABEL_HEIGHT,
        },
      ],
    })),
  };
  const graph = await elk.layout(input);

  const layout: Layout = { nodes: {}, edges: {}, bands: [] };
  for (const child of graph.children ?? []) {
    layout.nodes[child.id] = { x: child.x ?? 0, y: child.y ?? 0 };
  }
  for (const edge of graph.edges ?? []) {
    const section = edge.sections?.[0];
    const label = edge.labels?.[0];
    if (!section || !label) throw new Error(`ELK returned no route or label for edge ${edge.id}`);
    layout.edges[edge.id] = {
      points: [section.startPoint, ...(section.bendPoints ?? []), section.endPoint],
      label: { x: label.x ?? 0, y: label.y ?? 0, width: label.width ?? 0, height: LABEL_HEIGHT },
    };
  }
  layout.bands = computeBands(layout.nodes, graph.width ?? 0);
  return layout;
}

export { NODE_HEIGHT, NODE_WIDTH };
