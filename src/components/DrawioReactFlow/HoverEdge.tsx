// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';
import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer } from 'reactflow';
import { DiagramHoverModal } from './DiagramHoverModal';
import { EdgeData } from './types';

export function HoverEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  style = {},
  markerEnd,
  data,
}: EdgeProps<EdgeData>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const ContentComponent = data?.hoverContentComponent;

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={style}
        markerEnd={markerEnd as string}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="react-flow__edge-label nodrag nopan"
          >
            {ContentComponent ? (
              <DiagramHoverModal ContentComponent={ContentComponent}>
                <span className="diagram-hover-modal__trigger">{label}</span>
              </DiagramHoverModal>
            ) : (
              <span>{label}</span>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
