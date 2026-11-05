import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';

import { BRAND, CHAIN_LABEL, KIND_STYLE } from './brand.ts';
import { NODE_HEIGHT, NODE_WIDTH } from './layout.ts';
import type { Actor } from './model.ts';

export type ActorNodeType = Node<{ actor: Actor; active: boolean }, 'actor'>;

// React Flow needs a handle on each end to draw an edge. The handles stay hidden: the route comes
// from the layout, not from the handle positions.
const HIDDEN_HANDLE = { opacity: 0, pointerEvents: 'none' } as const;

export function ActorNode({ data }: NodeProps<ActorNodeType>) {
  const { actor, active } = data;
  const style = KIND_STYLE[actor.kind];
  return (
    <div
      className={[
        'flex flex-col justify-center px-3.5',
        'motion-safe:transition-[opacity,box-shadow,border-color] motion-safe:duration-200',
      ].join(' ')}
      style={{
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        background: style.fill,
        borderRadius: 10,
        border: `3px solid ${active ? BRAND.active : 'transparent'}`,
        boxShadow: active ? BRAND.activeGlow : 'none',
        opacity: active ? 1 : BRAND.dimmed,
        fontFamily: BRAND.font,
      }}
    >
      <Handle type="target" position={Position.Top} style={HIDDEN_HANDLE} />
      <div style={{ color: style.title, fontSize: 15, fontWeight: 600 }}>{actor.label}</div>
      <div style={{ color: style.sub, fontSize: 12 }}>
        {actor.tech} · {CHAIN_LABEL[actor.chain]}
      </div>
      <Handle type="source" position={Position.Bottom} style={HIDDEN_HANDLE} />
    </div>
  );
}
