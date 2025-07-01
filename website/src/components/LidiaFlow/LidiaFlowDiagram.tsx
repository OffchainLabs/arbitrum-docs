import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  NodeMouseHandler,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '../../css/lidia-flow.css';

import { useLidiaFlowState } from './hooks/useLidiaFlowState';
import ClickableNode from './ClickableNode';
import type { LidiaFlowConfig } from './types';

const nodeTypes = {
  clickable: ClickableNode,
};

interface LidiaFlowDiagramProps {
  config: LidiaFlowConfig;
}

function LidiaFlowDiagramInner({ config }: LidiaFlowDiagramProps) {
  const { currentState, navigateToState, goBack, canGoBack } = useLidiaFlowState(config);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Update nodes and edges when state changes
  useEffect(() => {
    if (currentState) {
      setNodes(currentState.nodes);
      setEdges(currentState.edges);
    }
  }, [currentState, setNodes, setEdges]);

  const onNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      if (isTransitioning) return;

      const clickableArea = currentState?.clickableAreas.find((area) => area.nodeId === node.id);

      if (clickableArea && clickableArea.nextStateId) {
        setIsTransitioning(true);
        setTimeout(() => {
          navigateToState(clickableArea.nextStateId);
          setIsTransitioning(false);
        }, 300);
      }
    },
    [currentState, navigateToState, isTransitioning],
  );

  const handleBackClick = useCallback(() => {
    if (!isTransitioning && canGoBack) {
      setIsTransitioning(true);
      setTimeout(() => {
        goBack();
        setIsTransitioning(false);
      }, 300);
    }
  }, [goBack, canGoBack, isTransitioning]);

  if (!currentState) {
    return <div className="lidia-flow-error">Error: Invalid diagram state</div>;
  }

  return (
    <div className="lidia-flow-container">
      <div className="lidia-flow-header">
        <h3 className="lidia-flow-title">{config.title}</h3>
        {canGoBack && (
          <button
            className="lidia-flow-back-button"
            onClick={handleBackClick}
            aria-label="Go back to previous state"
            disabled={isTransitioning}
          >
            ← Back
          </button>
        )}
      </div>
      <div className={`lidia-flow-wrapper ${isTransitioning ? 'lidia-flow-fade-exit-active' : ''}`}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#e5e7eb" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const clickableArea = currentState.clickableAreas.find(
                (area) => area.nodeId === node.id,
              );
              return clickableArea ? '#3b82f6' : '#9ca3af';
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function LidiaFlowDiagram(props: LidiaFlowDiagramProps) {
  return (
    <ReactFlowProvider>
      <LidiaFlowDiagramInner {...props} />
    </ReactFlowProvider>
  );
}
