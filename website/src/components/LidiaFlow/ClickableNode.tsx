import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { ClickableNodeData } from './types';

const ClickableNode = memo(({ data, selected }: NodeProps<ClickableNodeData>) => {
  return (
    <div
      className={`lidia-flow-node ${data.isClickable ? 'lidia-flow-node-clickable' : ''} ${
        selected ? 'lidia-flow-node-selected' : ''
      }`}
      title={data.tooltip}
    >
      <Handle type="target" position={Position.Top} className="lidia-flow-handle" />
      <div className="lidia-flow-node-content">
        <div className="lidia-flow-node-label">{data.label}</div>
        {data.isClickable && <div className="lidia-flow-node-hint">Click to explore</div>}
      </div>
      <Handle type="source" position={Position.Bottom} className="lidia-flow-handle" />
    </div>
  );
});

ClickableNode.displayName = 'ClickableNode';

export default ClickableNode;
