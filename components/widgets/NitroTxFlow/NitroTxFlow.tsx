'use client';

import {
  BaseEdge,
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
  Handle,
  MarkerType,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEffect, useMemo, useState } from 'react';

import {
  type Band,
  type Box,
  type Layout,
  NODE_HEIGHT,
  NODE_WIDTH,
  type Point,
  STEP_NUMBERS,
  computeLayout,
} from './layout';
import { type Actor, type Finality, actors, edges, steps } from './model';

// Brand palette and measured text colors: .claude/skills/arbitrum-brand-svg-diagrams/SKILL.md
const BRAND = {
  gradient: 'linear-gradient(180deg, #152c4e 0%, #1b4add 55%, #12aaff 100%)',
  connector: '#9dcced',
  active: '#eaf5ff',
  chip: '#152c4e',
  chipText: '#eaf5ff',
  font: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
};

const ROLE = {
  process: { fill: '#213147', title: '#ffffff', sub: '#c9dcef', key: 'Nitro process' },
  contract: { fill: '#e6007a', title: '#ffffff', sub: '#ffffff', key: 'Parent chain contract' },
  entity: { fill: '#12aaff', title: '#0b1b2e', sub: '#0b2438', key: 'User' },
};

const roleOf = (a: Actor) =>
  a.chain === 'parent' ? ROLE.contract : a.chain === 'offchain' ? ROLE.entity : ROLE.process;

const FINALITY_LABEL: Record<Finality, string> = {
  'soft': 'Soft finality',
  'batch-posted': 'Batch posted on parent chain',
  'parent-chain': 'Parent chain finality',
};

const CHAIN_LABEL = { child: 'child chain', parent: 'parent chain', offchain: 'off-chain' };

const DIMMED = 0.35;

const CORNER_RADIUS = 10;

// Straight segments from ELK's orthogonal route, with each 90-degree turn rounded.
function roundedPath(points: Point[]): string {
  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]!;
    const corner = points[i]!;
    const next = points[i + 1]!;
    const r = Math.min(
      CORNER_RADIUS,
      Math.hypot(corner.x - prev.x, corner.y - prev.y) / 2,
      Math.hypot(next.x - corner.x, next.y - corner.y) / 2,
    );
    const toward = (from: Point, to: Point) => {
      const len = Math.hypot(to.x - from.x, to.y - from.y) || 1;
      return { x: from.x + ((to.x - from.x) / len) * r, y: from.y + ((to.y - from.y) / len) * r };
    };
    const a = toward(corner, prev);
    const b = toward(corner, next);
    d += ` L ${a.x} ${a.y} Q ${corner.x} ${corner.y} ${b.x} ${b.y}`;
  }
  const last = points[points.length - 1]!;
  return `${d} L ${last.x} ${last.y}`;
}

type ActorNodeType = Node<{ actor: Actor; active: boolean }, 'actor'>;
type BandNodeType = Node<{ band: Band; active: boolean }, 'band'>;

const BAND_HEADER = {
  child: {
    text: 'Child chain · Arbitrum One',
    accent: '#9dcced',
    fill: ['rgba(18, 170, 255, 0.10)', 'rgba(18, 170, 255, 0.22)'],
    border: ['rgba(157, 204, 237, 0.45)', 'rgba(157, 204, 237, 0.95)'],
  },
  parent: {
    text: 'Parent chain · Ethereum',
    accent: '#e6007a',
    fill: ['rgba(230, 0, 122, 0.10)', 'rgba(230, 0, 122, 0.22)'],
    border: ['rgba(230, 0, 122, 0.5)', 'rgba(255, 120, 190, 0.95)'],
  },
};

function BandNode({ data }: NodeProps<BandNodeType>) {
  const { band, active } = data;
  const header = BAND_HEADER[band.chain];
  return (
    <div
      style={{
        width: band.box.width,
        height: band.box.height,
        borderRadius: 12,
        background: header.fill[active ? 1 : 0],
        border: `${active ? 2 : 1}px solid ${header.border[active ? 1 : 0]}`,
        transition: 'background 200ms, border-color 200ms',
        position: 'relative',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '3px 8px',
          borderRadius: 6,
          background: BRAND.chip,
          color: BRAND.chipText,
          fontFamily: BRAND.font,
          fontSize: 13,
          fontWeight: 600,
          opacity: active ? 1 : 0.8,
        }}
      >
        <span style={{ width: 4, height: 14, borderRadius: 2, background: header.accent }} />
        {header.text}
      </div>
    </div>
  );
}
type StepEdgeType = Edge<
  { label: string; numbers: number[]; active: boolean; points: Point[]; labelBox: Box },
  'step'
>;

function ActorNode({ data }: NodeProps<ActorNodeType>) {
  const { actor, active } = data;
  const role = roleOf(actor);
  return (
    <div
      style={{
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        background: role.fill,
        borderRadius: 10,
        border: `3px solid ${active ? BRAND.active : 'transparent'}`,
        boxShadow: active
          ? '0 0 0 5px rgba(18, 170, 255, 0.45), 0 8px 20px rgba(0,0,0,0.35)'
          : 'none',
        opacity: active ? 1 : DIMMED,
        transition: 'opacity 200ms, box-shadow 200ms, border-color 200ms',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 14px',
        fontFamily: BRAND.font,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div style={{ color: role.title, fontSize: 15, fontWeight: 600 }}>{actor.label}</div>
      <div style={{ color: role.sub, fontSize: 12 }}>
        {actor.tech} · {CHAIN_LABEL[actor.chain]}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

function StepEdge(props: EdgeProps<StepEdgeType>) {
  const { id, markerEnd } = props;
  const { label, numbers, active, points, labelBox } = props.data!;
  const path = roundedPath(points);
  const labelX = labelBox.x + labelBox.width / 2;
  const labelY = labelBox.y + labelBox.height / 2;
  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: active ? BRAND.active : BRAND.connector,
          strokeWidth: active ? 3 : 1.5,
          opacity: active ? 1 : DIMMED,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            opacity: active ? 1 : DIMMED,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 8px 3px 4px',
            borderRadius: 6,
            background: BRAND.chip,
            color: BRAND.chipText,
            fontFamily: BRAND.font,
            fontSize: 12,
            whiteSpace: 'nowrap',
          }}
        >
          {numbers.map((n) => (
            <span
              key={n}
              style={{
                minWidth: 20,
                height: 20,
                borderRadius: 10,
                background: ROLE.entity.fill,
                color: ROLE.entity.title,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {n}
            </span>
          ))}
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = { actor: ActorNode, band: BandNode };
const edgeTypes = { step: StepEdge };

function stepFromHash(): number {
  const match = /^#step-(\d+)$/.exec(window.location.hash);
  if (!match) return 0;
  return Math.min(Math.max(Number(match[1]) - 1, 0), steps.length - 1);
}

export default function NitroTxFlow() {
  const [layout, setLayout] = useState<Layout | null>(null);
  const [flow, setFlow] = useState<ReactFlowInstance | null>(null);
  const [index, setIndex] = useState(stepFromHash);
  const [showDetails, setShowDetails] = useState(false);
  const step = steps[index]!;

  useEffect(() => {
    computeLayout().then(setLayout);
  }, []);

  useEffect(() => {
    const onHash = () => setIndex(stepFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const cameraDuration = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500;

  // The camera frames the active step at a readable zoom instead of fitting the whole graph.
  useEffect(() => {
    if (!flow) return;
    const frame = requestAnimationFrame(() => {
      void flow.fitView({
        nodes: step.actors.map((id) => ({ id })),
        padding: 0.3,
        maxZoom: 1,
        duration: cameraDuration(),
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [flow, step]);

  const showAll = () => void flow?.fitView({ padding: 0.08, duration: cameraDuration() });

  const goTo = (next: number) => {
    setIndex(next);
    window.history.replaceState(null, '', `#step-${next + 1}`);
  };

  const rfNodes = useMemo<(ActorNodeType | BandNodeType)[]>(() => {
    if (!layout) return [];
    const bands: BandNodeType[] = layout.bands.map((band, i) => ({
      id: `band-${band.chain}-${i}`,
      type: 'band',
      position: { x: band.box.x, y: band.box.y },
      data: { band, active: band.actors.some((id) => step.actors.includes(id)) },
      draggable: false,
      connectable: false,
      selectable: false,
      zIndex: -1,
    }));
    const nodes: ActorNodeType[] = actors.map((actor) => ({
      id: actor.id,
      type: 'actor',
      position: layout.nodes[actor.id]!,
      data: { actor, active: step.actors.includes(actor.id) },
      draggable: false,
      connectable: false,
    }));
    return [...bands, ...nodes];
  }, [layout, step]);

  const rfEdges = useMemo<StepEdgeType[]>(() => {
    if (!layout) return [];
    return edges.map((e) => {
      const active = step.edges.includes(e.id);
      return {
        id: e.id,
        type: 'step',
        source: e.source,
        target: e.target,
        data: {
          label: e.label,
          numbers: STEP_NUMBERS[e.id] ?? [],
          active,
          points: layout.edges[e.id]!.points,
          labelBox: layout.edges[e.id]!.label,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: active ? BRAND.active : BRAND.connector,
          width: 18,
          height: 18,
        },
        zIndex: active ? 1 : 0,
      };
    });
  }, [layout, step]);

  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border border-fd-border">
      <div className="relative h-[720px] w-full" style={{ background: BRAND.gradient }}>
        <div
          className="absolute left-3 top-3 z-10 flex flex-col gap-1 rounded-md p-2 text-xs"
          style={{ background: BRAND.chip, color: BRAND.chipText, fontFamily: BRAND.font }}
        >
          {Object.values(ROLE).map((r) => (
            <span key={r.key} className="flex items-center gap-2">
              <span
                className="inline-block size-3 rounded-sm"
                style={{ background: r.fill, outline: `1px solid ${BRAND.connector}` }}
              />
              {r.key}
            </span>
          ))}
        </div>
        {layout && (
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onInit={setFlow}
            minZoom={0.3}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
          />
        )}
        <button
          type="button"
          onClick={showAll}
          className="absolute bottom-3 right-3 z-10 rounded-md px-3 py-1 text-xs"
          style={{ background: BRAND.chip, color: BRAND.chipText, fontFamily: BRAND.font }}
        >
          Show all
        </button>
      </div>

      <div className="border-t border-fd-border p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded border border-fd-border px-3 py-1 disabled:opacity-40"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
          >
            Back
          </button>
          <button
            type="button"
            className="rounded border border-fd-border px-3 py-1 disabled:opacity-40"
            disabled={index === steps.length - 1}
            onClick={() => goTo(index + 1)}
          >
            Next
          </button>
          <span className="text-sm text-fd-muted-foreground">
            Step {index + 1} of {steps.length}
          </span>
          {step.finality && (
            <span className="rounded-full bg-fd-primary/15 px-2 py-0.5 text-xs font-medium text-fd-primary">
              {FINALITY_LABEL[step.finality]}
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold">{step.title}</h3>
        <p className="mt-1">{step.text}</p>

        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showDetails}
            onChange={(e) => setShowDetails(e.target.checked)}
          />
          Show operator details
        </label>

        {showDetails && (
          <dl className="mt-3 grid gap-2 text-sm">
            {step.flag && <Detail term="Flag" value={<code>{step.flag}</code>} />}
            {step.code && (
              <Detail
                term="Code"
                value={
                  <a className="underline" href={step.code.url} target="_blank" rel="noreferrer">
                    {step.code.label}
                  </a>
                }
              />
            )}
            <Detail term="What the operator sees" value={step.failure.symptoms} />
            <Detail term="Impact on the transaction" value={step.failure.impact} />
            <Detail term="Recovery" value={step.failure.recovery} />
          </dl>
        )}
      </div>
    </div>
  );
}

function Detail({ term, value }: { term: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="font-medium">{term}</dt>
      <dd className="text-fd-muted-foreground">{value}</dd>
    </div>
  );
}
