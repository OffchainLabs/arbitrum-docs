import React from 'react';
import { NODE_POSITIONS, COLORS } from '../constants';

interface L2BlocksProps {
  isActive: boolean;
}

export function L2Blocks({ isActive }: L2BlocksProps) {
  const position = NODE_POSITIONS.l2Blocks;
  const color = COLORS.blue;
  const activeClass = isActive ? 'transaction-lifecycle__node--active' : '';

  // Two stacked blocks
  const blockHeight = 55;
  const blockWidth = position.width;
  const gap = 10;

  return (
    <g className={`transaction-lifecycle__node ${activeClass}`}>
      {[0, 1].map((i) => (
        <g key={i}>
          <rect
            x={position.x}
            y={position.y + i * (blockHeight + gap)}
            width={blockWidth}
            height={blockHeight}
            rx={6}
            ry={6}
            fill={color}
            className="transaction-lifecycle__node-rect"
          />
          <text
            x={position.x + blockWidth / 2}
            y={position.y + i * (blockHeight + gap) + blockHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="12"
            fontWeight="500"
          >
            <tspan x={position.x + blockWidth / 2} dy="-6">
              L2
            </tspan>
            <tspan x={position.x + blockWidth / 2} dy="14">
              block
            </tspan>
          </text>
        </g>
      ))}
    </g>
  );
}
