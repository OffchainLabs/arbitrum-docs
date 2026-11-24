import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';

import { LinkPreview } from '@/components/LinkPreview';

import { PROJECT, THEME } from './flows.ts';
import { NODE_HEIGHT, NODE_WIDTH } from './layout.ts';
import type { Actor } from './model.ts';

// SPIKE: `trigger` makes the node open a detail view. It blinks until first opened.
export interface NodeTrigger {
  label: string;
  blink: boolean;
  onOpen: () => void;
}

export type ActorNodeType = Node<
  {
    actor: Actor;
    active: boolean;
    showChain: boolean;
    trigger?: NodeTrigger | undefined;
    // The step number, on an active node of a step that lights no edge to carry it.
    stepNumber?: number | undefined;
  },
  'actor'
>;

// React Flow needs a handle on each end to draw an edge. The handles stay hidden: the route comes
// from the layout, not from the handle positions.
const HIDDEN_HANDLE = { opacity: 0, pointerEvents: 'none' } as const;

export function ActorNode({ data }: NodeProps<ActorNodeType>) {
  const { actor, active, showChain, trigger, stepNumber } = data;
  const style = PROJECT.kinds[actor.kind]!.widget;
  // A lane whose short name is null (off-chain) shows no lane word.
  const lane = showChain ? PROJECT.lanes[actor.chain]!.short : null;
  const box = (
    <div
      data-preview-anchor=""
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
        'relative flex flex-col justify-center px-3.5',
        'motion-safe:transition-[opacity,box-shadow,border-color] motion-safe:duration-200',
        trigger ? 'cursor-pointer focus-visible:outline-(--flow-focus)' : '',
        trigger?.blink ? 'motion-safe:animate-trigger-pulse' : '',
      ].join(' ')}
      style={{
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        background: style.fill,
        borderRadius: 10,
        border: `3px solid ${active ? THEME.active : 'transparent'}`,
        boxShadow: active ? THEME.activeGlow : 'none',
        opacity: active ? 1 : THEME.dimmed,
        fontFamily: THEME.font,
      }}
    >
      <Handle type="target" position={Position.Top} style={HIDDEN_HANDLE} />
      {stepNumber !== undefined && (
        // The same badge as an edge label's, so every step number shows on the canvas.
        <span
          aria-hidden="true"
          className="absolute -top-3 -left-3 inline-flex items-center justify-center"
          style={{
            minWidth: 22,
            height: 22,
            borderRadius: 11,
            background: THEME.badge,
            color: THEME.badgeText,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {stepNumber}
        </span>
      )}
      {trigger && (
        // The node opens a detail view: say so, not only with the pulse, which reduced motion
        // turns off. The node itself is the button and carries the full label.
        <span
          aria-hidden="true"
          className="absolute -top-3 right-3 rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{ background: THEME.badge, color: THEME.badgeText }}
        >
          Look inside ›
        </span>
      )}
      <div style={{ color: style.title, fontSize: 15, fontWeight: 600 }}>{actor.label}</div>
      {/* The lane phrase does not break, so a long sub-line wraps after the dot. */}
      <div style={{ color: style.sub, fontSize: 12 }}>
        {actor.tech}
        {actor.tech && lane && ' · '}
        {lane && <span className="whitespace-nowrap">{lane}</span>}
      </div>
      <Handle type="source" position={Position.Bottom} style={HIDDEN_HANDLE} />
    </div>
  );
  // Mouse only, like a prose link preview. A click still opens the detail view on a trigger node.
  if (!actor.docs) return box;
  return (
    <LinkPreview previewUrl={actor.docs.previewUrl} reference="[data-preview-anchor]">
      {box}
    </LinkPreview>
  );
}
