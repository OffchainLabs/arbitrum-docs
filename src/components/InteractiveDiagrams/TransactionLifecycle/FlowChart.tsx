import React from 'react';
import { Modal } from './Modal';
import { UserInbox } from './components/UserInbox';
import { SequencedTxs } from './components/SequencedTxs';
import { L2Blocks } from './components/L2Blocks';
import { DiagramNode } from './components/DiagramNode';
import { VIEWBOX, COLORS, NODE_POSITIONS, FLOW_PATHS } from './constants';
import type { NodeId } from './types';

interface FlowChartProps {
  activeNodes: NodeId[];
  activeFlowPaths: string[];
}

export function FlowChart({ activeNodes, activeFlowPaths }: FlowChartProps) {
  const isActive = (nodeId: NodeId) => activeNodes.includes(nodeId);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      className="transaction-lifecycle__svg"
      style={{ pointerEvents: 'none' }}
    >
      <defs>
        {/* Background gradient */}
        <linearGradient id="tl-bg-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={COLORS.gradientTop} />
          <stop offset="50%" stopColor={COLORS.gradientMid} />
          <stop offset="100%" stopColor={COLORS.gradientBottom} />
        </linearGradient>

        {/* Arrow marker */}
        <marker
          id="tl-arrow"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={COLORS.white} />
        </marker>

        {/* Glow filter for active nodes */}
        <filter id="tl-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width={VIEWBOX.width} height={VIEWBOX.height} fill="url(#tl-bg-gradient)" />

      {/* Decorative circuit lines (like CentralizedAuction) */}
      <g className="transaction-lifecycle__decorative" opacity="0.1">
        <line x1="0" y1="100" x2="150" y2="100" stroke="white" strokeWidth="1" />
        <line x1="850" y1="50" x2="1000" y2="50" stroke="white" strokeWidth="1" />
        <line x1="900" y1="500" x2="1000" y2="500" stroke="white" strokeWidth="1" />
        <circle cx="150" cy="100" r="3" fill="white" />
        <circle cx="850" cy="50" r="3" fill="white" />
      </g>

      {/* Flow paths (connections between nodes) */}
      <g className="transaction-lifecycle__paths">
        {FLOW_PATHS.map((path) => {
          const isPathActive = activeFlowPaths.includes(path.id);
          const pathClass = isPathActive
            ? 'transaction-lifecycle__path transaction-lifecycle__path--active'
            : 'transaction-lifecycle__path';

          // Build the path string
          const pathD = path.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

          return (
            <path
              key={path.id}
              d={pathD}
              fill="none"
              stroke={COLORS.white}
              strokeWidth="2"
              strokeDasharray={path.dashed ? '5,5' : undefined}
              markerEnd="url(#tl-arrow)"
              className={pathClass}
              opacity={0.6}
            />
          );
        })}
      </g>

      {/* Nodes */}
      <g className="transaction-lifecycle__nodes">
        {/* User Inbox - special component with stacked envelopes */}
        <Modal nodeId="userInbox">
          <UserInbox isActive={isActive('userInbox')} />
        </Modal>

        {/* Delayed Inbox */}
        <Modal nodeId="delayedInbox">
          <DiagramNode nodeId="delayedInbox" isActive={isActive('delayedInbox')} />
        </Modal>

        {/* Sequencer */}
        <Modal nodeId="sequencer">
          <DiagramNode nodeId="sequencer" isActive={isActive('sequencer')} />
        </Modal>

        {/* Sequencer Feed */}
        <Modal nodeId="sequencerFeed">
          <DiagramNode nodeId="sequencerFeed" isActive={isActive('sequencerFeed')} />
        </Modal>

        {/* Batch and Compress */}
        <Modal nodeId="batchCompress">
          <DiagramNode nodeId="batchCompress" isActive={isActive('batchCompress')} />
        </Modal>

        {/* Sequenced Txs - special component with numbered envelopes */}
        <Modal nodeId="sequencedTxs">
          <SequencedTxs isActive={isActive('sequencedTxs')} />
        </Modal>

        {/* STF */}
        <Modal nodeId="stf">
          <DiagramNode nodeId="stf" isActive={isActive('stf')} />
        </Modal>

        {/* State */}
        <Modal nodeId="state">
          <DiagramNode nodeId="state" isActive={isActive('state')} />
        </Modal>

        {/* L2 Blocks - special component with stacked blocks */}
        <Modal nodeId="l2Blocks">
          <L2Blocks isActive={isActive('l2Blocks')} />
        </Modal>

        {/* L1 Chain */}
        <Modal nodeId="l1Chain">
          <DiagramNode nodeId="l1Chain" isActive={isActive('l1Chain')} />
        </Modal>
      </g>

      {/* Arbitrum Logo */}
      <g transform="translate(20, 520)">
        <ArbitrumLogo />
      </g>
    </svg>
  );
}

function ArbitrumLogo() {
  return (
    <g fill="white" opacity="0.8">
      <path d="M10.5 0L0 18h4.2l6.3-10.9L16.8 18H21L10.5 0z" />
      <text x="25" y="14" fontSize="14" fontWeight="600" fill="white">
        ARBITRUM
      </text>
    </g>
  );
}
