import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';

import { BRAND, CHAIN_LABEL, KIND_STYLE } from './brand.ts';
import { NODE_HEIGHT, NODE_WIDTH } from './layout.ts';
import type { Actor } from './model.ts';

// SPIKE: `trigger` makes the node open a detail view. It blinks until first opened.
export interface NodeTrigger {
  label: string;
  blink: boolean;
  onOpen: () => void;
}

export type ActorNodeType = Node<
  { actor: Actor; active: boolean; showChain: boolean; trigger?: NodeTrigger | undefined },
  'actor'
>;

// React Flow needs a handle on each end to draw an edge. The handles stay hidden: the route comes
// from the layout, not from the handle positions.
const HIDDEN_HANDLE = { opacity: 0, pointerEvents: 'none' } as const;

export function ActorNode({ data }: NodeProps<ActorNodeType>) {
  const { actor, active, showChain, trigger } = data;
  const style = KIND_STYLE[actor.kind];
  return (
    <div
      role={trigger ? 'button' : undefined}
      tabIndex={trigger ? 0 : undefined}
      aria-label={trigger?.label}
      onClick={trigger?.onOpen}
      onKeyDown={(event) => {
        if (trigger && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          trigger.onOpen();
        }
      }}
      className={[
        'flex flex-col justify-center px-3.5',
        'motion-safe:transition-[opacity,box-shadow,border-color] motion-safe:duration-200',
        trigger ? 'cursor-pointer focus-visible:outline-[#eaf5ff]' : '',
        trigger?.blink ? 'motion-safe:animate-pulse' : '',
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
        {showChain ? `${actor.tech} · ${CHAIN_LABEL[actor.chain]}` : actor.tech}
      </div>
      <Handle type="source" position={Position.Bottom} style={HIDDEN_HANDLE} />
    </div>
  );
}
