import React from 'react';
import { NODE_POSITIONS, COLORS } from '../constants';

interface SequencedTxsProps {
  isActive: boolean;
}

export function SequencedTxs({ isActive }: SequencedTxsProps) {
  const position = NODE_POSITIONS.sequencedTxs;
  const activeClass = isActive ? 'transaction-lifecycle__node--active' : '';

  // Create container and 3 numbered envelope icons
  const envelopeHeight = 55;
  const envelopeWidth = 70;
  const gap = 8;
  const containerPadding = 10;

  return (
    <g className={`transaction-lifecycle__node ${activeClass}`}>
      {/* Container rect */}
      <rect
        x={position.x}
        y={position.y}
        width={position.width}
        height={position.height}
        rx={8}
        ry={8}
        fill={COLORS.lightBlue}
        fillOpacity={0.3}
        stroke={COLORS.blue}
        strokeWidth={2}
        className="transaction-lifecycle__node-rect"
      />

      {/* Label */}
      <text
        x={position.x + position.width / 2}
        y={position.y + position.height - 15}
        textAnchor="middle"
        fill="white"
        fontSize="12"
        fontWeight="500"
      >
        Sequenced Txs
      </text>

      {/* 3 numbered envelopes */}
      {[1, 2, 3].map((num, i) => (
        <g key={num}>
          <rect
            x={position.x + (position.width - envelopeWidth) / 2}
            y={position.y + containerPadding + i * (envelopeHeight + gap)}
            width={envelopeWidth}
            height={envelopeHeight}
            rx={6}
            ry={6}
            fill={COLORS.blue}
          />
          {/* Number badge */}
          <circle
            cx={position.x + (position.width - envelopeWidth) / 2 + 15}
            cy={position.y + containerPadding + i * (envelopeHeight + gap) + 15}
            r={10}
            fill="white"
          />
          <text
            x={position.x + (position.width - envelopeWidth) / 2 + 15}
            y={position.y + containerPadding + i * (envelopeHeight + gap) + 15}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={COLORS.blue}
            fontSize="11"
            fontWeight="600"
          >
            {num}
          </text>
          {/* Envelope icon */}
          <EnvelopeIcon
            x={position.x + (position.width - envelopeWidth) / 2 + envelopeWidth / 2 - 8}
            y={position.y + containerPadding + i * (envelopeHeight + gap) + envelopeHeight / 2 - 8}
          />
        </g>
      ))}
    </g>
  );
}

function EnvelopeIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x="0"
        y="3"
        width="22"
        height="14"
        rx="2"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
      />
      <path d="M0 4 L11 12 L22 4" fill="none" stroke="white" strokeWidth="1.5" />
    </g>
  );
}
