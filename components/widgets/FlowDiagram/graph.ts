import type { ActorNodeType, NodeTrigger } from './ActorNode.tsx';
import type { BandNodeType } from './BandNode.tsx';
import type { RoutedEdgeType } from './RoutedEdge.tsx';
import { THEME } from './flows.ts';
import type { FlowLayout } from './layout.ts';
import type { Flow, Step } from './model.ts';

/**
 * React Flow nodes: one band per lane column behind the actors, then the actors that `layout`
 * places. `stepNumber`, when given, shows on the active nodes of a step that lights no edge.
 */
export function flowNodes(
  flow: Flow,
  layout: FlowLayout,
  step: Step,
  trigger?: NodeTrigger,
  stepNumber?: number,
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
  const actors: ActorNodeType[] = flow.actors
    .filter((actor) => actor.id in layout.nodes)
    .map((actor) => ({
      id: actor.id,
      type: 'actor',
      position: layout.nodes[actor.id]!,
      // React Flow sets pointer-events: none on a node that is not selectable or draggable, so a
      // mouse click would fall through to the pane. Only the trigger node takes clicks, and only
      // a node with a docs page takes the hover that opens its preview.
      ...((trigger && step.detail?.actor === actor.id) || actor.docs
        ? { style: { pointerEvents: 'all' } }
        : {}),
      data: {
        actor,
        active: step.actors.includes(actor.id),
        showChain: flow.showChains !== false,
        trigger: step.detail?.actor === actor.id ? trigger : undefined,
        stepNumber:
          step.edges.length === 0 && step.actors.includes(actor.id) ? stepNumber : undefined,
      },
      draggable: false,
      connectable: false,
    }));
  return [...bands, ...actors];
}

/**
 * React Flow edges that `layout` routes, with the step numbers that size their label boxes.
 */
export function flowEdges(
  flow: Flow,
  layout: FlowLayout,
  step: Step,
  stepNumbers: Record<string, number[]>,
): RoutedEdgeType[] {
  return flow.edges
    .filter((edge) => edge.id in layout.edges)
    .map((edge) => {
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
          color: active ? THEME.active : THEME.connector,
          width: 16,
          height: 16,
          markerUnits: 'userSpaceOnUse',
        },
        zIndex: active ? 1 : 0,
      };
    });
}
