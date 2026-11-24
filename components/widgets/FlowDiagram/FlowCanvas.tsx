import { ReactFlow, type ReactFlowInstance, type Viewport } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { type PointerEvent, useRef } from 'react';

import { ActorNode, type ActorNodeType } from './ActorNode.tsx';
import { BandNode, type BandNodeType } from './BandNode.tsx';
import { RoutedEdge, type RoutedEdgeType } from './RoutedEdge.tsx';

type FlowNode = ActorNodeType | BandNodeType;

const nodeTypes = { actor: ActorNode, band: BandNode };
const edgeTypes = { routed: RoutedEdge };

interface FlowCanvasProps {
  nodes: FlowNode[];
  edges: RoutedEdgeType[];
  onInit: (flow: ReactFlowInstance<FlowNode, RoutedEdgeType>) => void;
  onMove: (viewport: Viewport) => void;
  // A one-finger horizontal drag pans the graph sideways.
  panX?: boolean;
}

interface Drag {
  pointerId: number;
  clientX: number;
  viewportX: number;
}

/**
 * The React Flow graph, with dragging, panning, wheel or double-click zoom, key bindings and node
 * or edge focus turned off. With `panX`, a one-finger horizontal drag moves the graph sideways and
 * a vertical swipe still scrolls the page. React Flow's own `panOnDrag` cannot do this: its touch
 * handler cancels every touchmove, so a vertical swipe would stop scrolling the page.
 */
export function FlowCanvas({ nodes, edges, onInit, onMove, panX = false }: FlowCanvasProps) {
  const flow = useRef<ReactFlowInstance<FlowNode, RoutedEdgeType>>(null);
  const drag = useRef<Drag>(null);
  const onPointerDown = (event: PointerEvent) => {
    if (!panX || event.pointerType !== 'touch' || !event.isPrimary || !flow.current) return;
    const { x } = flow.current.getViewport();
    drag.current = { pointerId: event.pointerId, clientX: event.clientX, viewportX: x };
  };
  const onPointerMove = (event: PointerEvent) => {
    const start = drag.current;
    if (!start || start.pointerId !== event.pointerId || !flow.current) return;
    const viewport = flow.current.getViewport();
    void flow.current.setViewport({
      ...viewport,
      x: start.viewportX + event.clientX - start.clientX,
    });
  };
  const onPointerEnd = () => {
    drag.current = null;
  };
  // React Flow sets `touch-action: none` on its pane, which stops a one-finger swipe from
  // scrolling the page. With `panX` the browser keeps vertical swipes and pinch zoom, and leaves
  // horizontal drags to the handlers above. `!` because the utility layer loses to the unlayered
  // React Flow CSS.
  const touch = panX
    ? String.raw`[&_.react-flow\_\_pane]:[touch-action:pan-y_pinch-zoom]!`
    : String.raw`[&_.react-flow\_\_pane]:touch-manipulation!`;
  return (
    <div
      className={`absolute inset-0 ${touch}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={(instance) => {
          flow.current = instance;
          onInit(instance);
        }}
        onMove={(_, next) => onMove(next)}
        minZoom={0.1}
        // At the bottom right, the step bar covers it on phones.
        attributionPosition="top-right"
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        // React Flow listens for these keys on window and calls preventDefault, so Space would
        // not scroll the page.
        panActivationKeyCode={null}
        selectionKeyCode={null}
        multiSelectionKeyCode={null}
        deleteKeyCode={null}
        zoomActivationKeyCode={null}
        // No tab stop on nodes or edges: focusing one pans the camera off the step.
        nodesFocusable={false}
        edgesFocusable={false}
        disableKeyboardA11y
      />
    </div>
  );
}
