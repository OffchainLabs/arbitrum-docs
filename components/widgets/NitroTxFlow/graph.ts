import type { ActorNodeType } from './ActorNode.tsx';
import type { BandNodeType } from './BandNode.tsx';
import type { RoutedEdgeType } from './RoutedEdge.tsx';
import { BRAND } from './brand.ts';
import type { FlowLayout } from './layout.ts';
import type { Flow, Step } from './model.ts';

/** React Flow nodes: one band per chain run behind the actors, then the actors. */
export function flowNodes(
  flow: Flow,
  layout: FlowLayout,
  step: Step,
): (ActorNodeType | BandNodeType)[] {
  const bands: BandNodeType[] = layout.bands.map((band, i) => ({
    id: `band-${band.chain}-${i}`,
    type: 'band',
    position: { x: band.box.x, y: band.box.y },
    data: { band, active: band.chain === step.txChain },
    draggable: false,
    connectable: false,
    selectable: false,
    zIndex: -1,
    style: { pointerEvents: 'none' },
  }));
  const actors: ActorNodeType[] = flow.actors.map((actor) => ({
    id: actor.id,
    type: 'actor',
    position: layout.nodes[actor.id]!,
    data: { actor, active: step.actors.includes(actor.id) },
    draggable: false,
    connectable: false,
  }));
  return [...bands, ...actors];
}

/** React Flow edges, routed by the layout, with the step numbers that size their label boxes. */
export function flowEdges(
  flow: Flow,
  layout: FlowLayout,
  step: Step,
  stepNumbers: Record<string, number[]>,
): RoutedEdgeType[] {
  return flow.edges.map((edge) => {
    const active = step.edges.includes(edge.id);
    return {
      id: edge.id,
      type: 'routed',
      source: edge.source,
      target: edge.target,
      data: {
        label: edge.label,
        stepNumbers: stepNumbers[edge.id] ?? [],
        active,
        route: layout.edges[edge.id]!,
      },
      markerEnd: {
        type: 'arrowclosed',
        color: active ? BRAND.active : BRAND.connector,
        width: 16,
        height: 16,
        markerUnits: 'userSpaceOnUse',
      },
      zIndex: active ? 1 : 0,
    };
  });
}
