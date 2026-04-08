import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { NodeData } from './types';
import { DiagramHoverModal } from './DiagramHoverModal';

export function ClickableNode({ data }: NodeProps<NodeData>) {
  const { label, shape, link, centerable, onNavigate, hoverContentComponent } = data;
  const isClickable = !!link || !!centerable;

  const handleClick = () => {
    if (link && onNavigate) {
      onNavigate(link);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      if (link && onNavigate) {
        onNavigate(link);
      }
    }
  };

  const baseStyle: React.CSSProperties = {
    cursor: isClickable ? 'pointer' : 'default',
    ...(data.topAligned ? { alignItems: 'flex-start', paddingTop: '4px' } : {}),
  };

  // Apply shape-specific transforms
  let shapeStyle: React.CSSProperties = {};
  if (shape === 'diamond') {
    shapeStyle = {
      transform: 'rotate(45deg)',
    };
  }

  const contentStyle: React.CSSProperties =
    shape === 'diamond' ? { transform: 'rotate(-45deg)' } : {};

  const labelContent = hoverContentComponent ? (
    <DiagramHoverModal ContentComponent={hoverContentComponent}>{label}</DiagramHoverModal>
  ) : (
    label
  );

  return (
    <div
      className={`custom-node ${isClickable ? 'node-clickable' : 'node-static'} shape-${shape}`}
      style={{ ...baseStyle, ...shapeStyle }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : -1}
      aria-label={isClickable ? `Navigate to ${link || label}` : label}
    >
      {/* Connection handles on all 4 sides for Draw.io edge routing */}
      <Handle id="top-target" type="target" position={Position.Top} />
      <Handle id="top-source" type="source" position={Position.Top} />
      <Handle id="right-target" type="target" position={Position.Right} />
      <Handle id="right-source" type="source" position={Position.Right} />
      <Handle id="bottom-target" type="target" position={Position.Bottom} />
      <Handle id="bottom-source" type="source" position={Position.Bottom} />
      <Handle id="left-target" type="target" position={Position.Left} />
      <Handle id="left-source" type="source" position={Position.Left} />

      <div className="node-content" style={contentStyle}>
        {labelContent}
      </div>
    </div>
  );
}
