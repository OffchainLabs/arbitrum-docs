import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { NodeData } from './types';

export function ClickableNode({ data }: NodeProps<NodeData>) {
  const { label, shape, colors, link, onNavigate } = data;
  const hasLink = !!link;

  const handleClick = () => {
    if (hasLink && link && onNavigate) {
      onNavigate(link);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (hasLink && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      if (link && onNavigate) {
        onNavigate(link);
      }
    }
  };

  const baseStyle: React.CSSProperties = {
    padding: '12px 20px',
    fontFamily: 'var(--ifm-font-family-base)',
    fontSize: '14px',
    // Color is handled by CSS to support theme switching
    transition: 'all 0.2s ease',
    cursor: hasLink ? 'pointer' : 'default',
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
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

  return (
    <div
      className={`custom-node ${hasLink ? 'node-clickable' : 'node-static'} shape-${shape}`}
      style={{ ...baseStyle, ...shapeStyle }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={hasLink ? 'button' : undefined}
      tabIndex={hasLink ? 0 : -1}
      aria-label={hasLink ? `Navigate to ${link}` : label}
    >
      {/* Connection handles for edges */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <div className="node-content" style={contentStyle}>
        {label}
      </div>
    </div>
  );
}
