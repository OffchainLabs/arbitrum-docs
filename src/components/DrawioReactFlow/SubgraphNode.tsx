import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';

export function SubgraphNode({ data }: NodeProps) {
  return (
    <div className="subgraph-node" style={{ transform: 'none' }}>
      <Handle id="top-target" type="target" position={Position.Top} />
      <Handle id="top-source" type="source" position={Position.Top} />
      <Handle id="right-target" type="target" position={Position.Right} />
      <Handle id="right-source" type="source" position={Position.Right} />
      <Handle id="bottom-target" type="target" position={Position.Bottom} />
      <Handle id="bottom-source" type="source" position={Position.Bottom} />
      <Handle id="left-target" type="target" position={Position.Left} />
      <Handle id="left-source" type="source" position={Position.Left} />
      <div className="subgraph-header">
        <div className="subgraph-title">{data.label}</div>
      </div>
    </div>
  );
}
