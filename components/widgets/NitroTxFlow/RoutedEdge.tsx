import { BaseEdge, type Edge, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';

import { BRAND, KIND_STYLE } from './brand.ts';
import type { EdgeLayout, Point } from './layout.ts';

export type RoutedEdgeType = Edge<
  { label: string; stepNumbers: number[]; active: boolean; route: EdgeLayout },
  'routed'
>;

const CORNER_RADIUS = 10;

function toward(from: Point, to: Point, distance: number): Point {
  const length = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  return {
    x: from.x + ((to.x - from.x) / length) * distance,
    y: from.y + ((to.y - from.y) / length) * distance,
  };
}

// Straight segments from the orthogonal route, with each 90-degree turn rounded by a quadratic
// curve no longer than half of either adjoining segment.
export function roundedPath(points: Point[]): string {
  const first = points[0]!;
  let path = `M ${first.x} ${first.y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]!;
    const corner = points[i]!;
    const next = points[i + 1]!;
    const radius = Math.min(
      CORNER_RADIUS,
      Math.hypot(corner.x - prev.x, corner.y - prev.y) / 2,
      Math.hypot(next.x - corner.x, next.y - corner.y) / 2,
    );
    const start = toward(corner, prev, radius);
    const end = toward(corner, next, radius);
    path += ` L ${start.x} ${start.y} Q ${corner.x} ${corner.y} ${end.x} ${end.y}`;
  }
  const last = points[points.length - 1]!;
  return `${path} L ${last.x} ${last.y}`;
}

const TRANSITION = 'motion-safe:transition-[opacity,stroke] motion-safe:duration-200';

export function RoutedEdge({ id, markerEnd, data }: EdgeProps<RoutedEdgeType>) {
  if (!data) return null;
  const { label, stepNumbers, active, route } = data;
  const box = route.label;
  return (
    <>
      <BaseEdge
        id={id}
        path={roundedPath(route.points)}
        markerEnd={markerEnd}
        className={TRANSITION}
        style={{
          stroke: active ? BRAND.active : BRAND.connector,
          strokeWidth: active ? 3 : 1.5,
          opacity: active ? 1 : BRAND.dimmed,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className={`nodrag nopan flex items-center gap-1.5 whitespace-nowrap ${TRANSITION}`}
          style={{
            position: 'absolute',
            transform:
              'translate(-50%, -50%) ' +
              `translate(${box.x + box.width / 2}px, ${box.y + box.height / 2}px)`,
            opacity: active ? 1 : BRAND.dimmed,
            padding: '2px 8px 2px 3px',
            borderRadius: 6,
            background: BRAND.chip,
            color: BRAND.chipText,
            fontFamily: BRAND.font,
            fontSize: 12,
          }}
        >
          {stepNumbers.map((n) => (
            <span
              key={n}
              className="inline-flex items-center justify-center"
              style={{
                minWidth: 20,
                height: 20,
                borderRadius: 10,
                background: KIND_STYLE.user.fill,
                color: KIND_STYLE.user.title,
                fontWeight: 700,
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
