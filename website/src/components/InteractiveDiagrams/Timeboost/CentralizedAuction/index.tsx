import React from 'react';
import { Modal } from './Modal';
import { coordinates, CIRCLE_RADIUS } from './constants';

export default function CentralizedAuction(): JSX.Element {
  return (
    <svg width="100%" height="100%" viewBox="0 0 1200 900">
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
