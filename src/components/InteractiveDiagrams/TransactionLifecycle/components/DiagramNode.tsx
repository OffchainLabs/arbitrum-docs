import React from 'react';
import type { NodeId } from '../types';
import { NODE_POSITIONS, NODE_COLORS, NODE_LABELS } from '../constants';

interface DiagramNodeProps {
  nodeId: NodeId;
  isActive: boolean;
}

export function DiagramNode({ nodeId, isActive }: DiagramNodeProps) {
  const position = NODE_POSITIONS[nodeId];
  const color = NODE_COLORS[nodeId];
  const label = NODE_LABELS[nodeId];

  const activeClass = isActive ? 'transaction-lifecycle__node--active' : '';

  return (
    <g className={`transaction-lifecycle__node ${activeClass}`}>
      <rect
        x={position.x}
        y={position.y}
        width={position.width}
        height={position.height}
        rx={8}
        ry={8}
        fill={color}
        className="transaction-lifecycle__node-rect"
      />
      <text
        x={position.x + position.width / 2}
        y={position.y + position.height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="12"
        fontWeight="500"
        className="transaction-lifecycle__node-text"
      >
        {label.split('\n').map((line, i) => (
          <tspan key={i} x={position.x + position.width / 2} dy={i === 0 ? 0 : 14}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}
