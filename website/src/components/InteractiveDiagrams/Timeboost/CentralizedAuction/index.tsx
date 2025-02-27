import React from 'react';
import { Modal } from './Modal';
import { coordinates, CIRCLE_RADIUS } from './constants';

function CentralizedAuctionDiagram(): JSX.Element {
  return (
    <svg width="100%" height="100%" viewBox="0 0 1200 900">
      {/* Connection lines */}
      <path
        d="M416.59 412.69 L588.13 631.51"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M588.13 631.51 L586.23 776.88"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M586.23 776.88 L1055.6 597.98"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M1055.6 597.98 L1003.53 257.43"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />

      {/* Circles and numbers */}
      {Object.entries(coordinates).map(([number, coord]) => (
        <g key={number}>
          <circle
            cx={coord.circle.x}
            cy={coord.circle.y}
            r={CIRCLE_RADIUS}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="1"
          />
          <Modal number={parseInt(number)} />
        </g>
      ))}
    </svg>
  );
}

export const FlowChart = CentralizedAuctionDiagram;
export default CentralizedAuctionDiagram;
