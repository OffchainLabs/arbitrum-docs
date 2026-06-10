import React from 'react';
import { NodeProps } from 'reactflow';

interface ImageNodeData {
  imageUrl: string;
}

export function ImageNode({ data }: NodeProps<ImageNodeData>) {
  return (
    <div
      className="image-node"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <img
        src={data.imageUrl}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  );
}
