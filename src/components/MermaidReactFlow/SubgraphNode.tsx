import React from 'react';
import { NodeProps } from 'reactflow';

export function SubgraphNode({ data }: NodeProps) {
  return (
    <div className="subgraph-node" style={{ transform: 'none' }}>
      <div className="subgraph-header">
        <div className="subgraph-title">{data.label}</div>
      </div>
    </div>
  );
}
