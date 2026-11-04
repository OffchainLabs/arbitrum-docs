import { ReactFlow, type ReactFlowInstance, type Viewport } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

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
}

/** The React Flow graph, with dragging, panning and wheel or double-click zoom turned off. */
export function FlowCanvas({ nodes, edges, onInit, onMove }: FlowCanvasProps) {
  return (
    // React Flow sets `touch-action: none` on its pane, which stops a one-finger swipe from
    // scrolling the page. `!` because the utility layer loses to the unlayered React Flow CSS.
    <div className="absolute inset-0 [&_.react-flow\_\_pane]:touch-manipulation!">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={onInit}
        onMove={(_, next) => onMove(next)}
        minZoom={0.3}
        // At the bottom right, the step bar covers it on phones.
        attributionPosition="top-right"
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      />
    </div>
  );
}
