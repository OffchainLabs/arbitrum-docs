import React from 'react';
import { NODE_POSITIONS, COLORS } from '../constants';

interface UserInboxProps {
  isActive: boolean;
}

export function UserInbox({ isActive }: UserInboxProps) {
  const position = NODE_POSITIONS.userInbox;
  const color = COLORS.blue;
  const activeClass = isActive ? 'transaction-lifecycle__node--active' : '';

  // Create 3 stacked envelope icons
  const envelopeHeight = 55;
  const envelopeWidth = position.width;
  const gap = 8;

  return (
    <g className={`transaction-lifecycle__node ${activeClass}`}>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x={position.x}
            y={position.y + i * (envelopeHeight + gap)}
            width={envelopeWidth}
            height={envelopeHeight}
            rx={6}
            ry={6}
            fill={color}
            className="transaction-lifecycle__node-rect"
          />
          {/* Envelope icon */}
          <EnvelopeIcon
            x={position.x + envelopeWidth / 2 - 15}
            y={position.y + i * (envelopeHeight + gap) + envelopeHeight / 2 - 12}
          />
        </g>
      ))}
    </g>
  );
}

function EnvelopeIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="0" y="4" width="30" height="20" rx="2" fill="none" stroke="white" strokeWidth="2" />
      <path d="M0 6 L15 16 L30 6" fill="none" stroke="white" strokeWidth="2" />
    </g>
  );
}
