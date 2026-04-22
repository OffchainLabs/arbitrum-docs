import { Node, Edge, MarkerType, Position } from 'reactflow';
import { ReactFlowData, NodeData, TransitionConfig } from '../types';

const PADDING = 30;

interface ExcalidrawBinding {
  elementId: string;
  mode?: 'orbit' | 'inside';
  fixedPoint?: [number, number];
}

interface ExcalidrawElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isDeleted?: boolean;
  link?: string | null;
  customData?: Record<string, unknown>;
  boundElements?: Array<{ id: string; type: string }> | null;
  // text-specific
  text?: string;
  containerId?: string | null;
  fontSize?: number;
  // arrow-specific
  points?: [number, number][];
  startBinding?: ExcalidrawBinding | null;
  endBinding?: ExcalidrawBinding | null;
  startArrowhead?: string | null;
  endArrowhead?: string | null;
  groupIds?: string[];
}

interface ExcalidrawFile {
  type?: string;
  version?: number;
  elements?: ExcalidrawElement[];
}

function fixedPointToSide(
  fixedPoint: [number, number] | undefined,
  self: ExcalidrawElement,
  other: ExcalidrawElement | undefined,
): Position {
  if (!fixedPoint) return Position.Top;
  const [x, y] = fixedPoint;
  const distLeft = x;
  const distRight = 1 - x;
  const distTop = y;
  const distBottom = 1 - y;
  const min = Math.min(distLeft, distRight, distTop, distBottom);

  // Epsilon in normalized units — anchor points within this distance count as "tied"
  const TIE_EPS = 0.05;
  const tiedSides: Position[] = [];
  if (distLeft <= min + TIE_EPS) tiedSides.push(Position.Left);
  if (distRight <= min + TIE_EPS) tiedSides.push(Position.Right);
  if (distTop <= min + TIE_EPS) tiedSides.push(Position.Top);
  if (distBottom <= min + TIE_EPS) tiedSides.push(Position.Bottom);

  if (tiedSides.length === 1) return tiedSides[0];

  // Tie-break: pick the side of `self` that faces `other`. For a near-corner anchor,
  // this aligns the handle with the direction the arrow actually travels.
  if (other) {
    const sc = { x: self.x + self.width / 2, y: self.y + self.height / 2 };
    const oc = { x: other.x + other.width / 2, y: other.y + other.height / 2 };
    const dx = oc.x - sc.x;
    const dy = oc.y - sc.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? Position.Right : Position.Left;
    }
    return dy > 0 ? Position.Bottom : Position.Top;
  }

  // Fallback — prefer top/bottom over left/right, since most diagram flows are vertical
  if (min === distTop) return Position.Top;
  if (min === distBottom) return Position.Bottom;
  if (min === distLeft) return Position.Left;
  return Position.Right;
}

function determineShape(type: string): string {
  if (type === 'diamond') return 'diamond';
  if (type === 'ellipse') return 'circle';
  return 'rect';
}

function isArrowhead(value: string | null | undefined): boolean {
  if (!value) return false;
  return value === 'arrow' || value === 'triangle' || value === 'bar' || value === 'dot';
}

function getCustomString(
  data: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  if (!data) return undefined;
  const value = data[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export async function convertExcalidrawToReactFlow(
  jsonString: string,
  onNavigate?: (link: string) => void,
  transitions?: TransitionConfig[],
): Promise<ReactFlowData> {
  let parsed: ExcalidrawFile;
  try {
    parsed = JSON.parse(jsonString) as ExcalidrawFile;
  } catch (err) {
    throw new Error(
      `Failed to parse Excalidraw JSON: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const elements = (parsed.elements ?? []).filter((el) => !el.isDeleted);

  // Lookup by id (used for arrow side resolution below)
  const elementById = new Map<string, ExcalidrawElement>();
  for (const el of elements) {
    elementById.set(el.id, el);
  }

  // Map container element id -> bound text element (used for labels on shapes and arrows)
  const containerToText = new Map<string, ExcalidrawElement>();
  for (const el of elements) {
    if (el.type === 'text' && el.containerId) {
      containerToText.set(el.containerId, el);
    }
  }

  // Spatial auto-binding: floating text whose center lies inside a shape that has no bound label
  // is promoted to that shape's label. Matches the common authoring pattern of dropping text
  // over a box without explicitly binding it. Ties broken by choosing the smallest enclosing shape.
  const autoBoundTextIds = new Set<string>();
  const isShapeType = (t: string) => t === 'rectangle' || t === 'ellipse' || t === 'diamond';

  for (const text of elements) {
    if (text.type !== 'text' || text.containerId) continue;
    const tcx = text.x + text.width / 2;
    const tcy = text.y + text.height / 2;

    let bestShape: ExcalidrawElement | undefined;
    let bestArea = Infinity;
    for (const shape of elements) {
      if (!isShapeType(shape.type)) continue;
      if (containerToText.has(shape.id)) continue;
      const inside =
        tcx >= shape.x &&
        tcx <= shape.x + shape.width &&
        tcy >= shape.y &&
        tcy <= shape.y + shape.height;
      if (!inside) continue;
      const area = shape.width * shape.height;
      if (area < bestArea) {
        bestArea = area;
        bestShape = shape;
      }
    }

    if (bestShape) {
      containerToText.set(bestShape.id, text);
      autoBoundTextIds.add(text.id);
    }
  }

  // Compute minX/minY across non-arrow elements for coordinate normalization
  let minX = Infinity;
  let minY = Infinity;
  for (const el of elements) {
    if (el.type === 'arrow' || el.type === 'line') continue;
    if (el.type === 'text' && el.containerId) continue; // bound text follows its container
    if (el.type === 'text' && autoBoundTextIds.has(el.id)) continue; // auto-bound follows its shape
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
  }
  if (!isFinite(minX)) minX = 0;
  if (!isFinite(minY)) minY = 0;

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  for (const el of elements) {
    // Text bound (explicitly OR auto-bound) to a container is rendered as its label, not a node
    if (el.type === 'text' && el.containerId) continue;
    if (el.type === 'text' && autoBoundTextIds.has(el.id)) continue;

    // Shape nodes
    if (el.type === 'rectangle' || el.type === 'ellipse' || el.type === 'diamond') {
      const boundText = containerToText.get(el.id);
      const label = boundText?.text ?? '';
      const hoverKey = getCustomString(el.customData, 'hoverContent');
      const colorToken = getCustomString(el.customData, 'colorToken');
      const isManifestTrigger = !!transitions?.some((t) => t.trigger === label);
      const isBlinking = isManifestTrigger || el.customData?.blinking === true;

      const nodeData: NodeData = {
        label,
        shape: determineShape(el.type),
        centerable: isBlinking || undefined,
        navigateTo: transitions?.find((t) => t.trigger === label)?.targetFile || undefined,
        colorToken,
        hoverContentKey: hoverKey,
        onNavigate,
      };

      nodes.push({
        id: el.id,
        type: 'custom',
        position: { x: el.x - minX + PADDING, y: el.y - minY + PADDING },
        data: nodeData,
        style: { width: el.width, height: el.height },
        className: isBlinking ? 'node-blinking' : undefined,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });
      continue;
    }

    // Standalone floating text (not bound to any container) — rendered as a transparent text node
    if (el.type === 'text') {
      nodes.push({
        id: el.id,
        type: 'default',
        position: { x: el.x - minX + PADDING, y: el.y - minY + PADDING },
        data: { label: el.text ?? '' },
        style: {
          width: el.width,
          height: el.height,
          backgroundColor: 'transparent',
          border: 'none',
          color: '#ffffff',
          fontSize: `${el.fontSize ?? 14}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: 0,
        },
      });
      continue;
    }

    // Arrows — require both bindings to render as a ReactFlow edge
    if (el.type === 'arrow') {
      if (!el.startBinding?.elementId || !el.endBinding?.elementId) continue;

      const srcEl = elementById.get(el.startBinding.elementId);
      const tgtEl = elementById.get(el.endBinding.elementId);
      if (!srcEl || !tgtEl) continue;

      const sourcePosition = fixedPointToSide(el.startBinding.fixedPoint, srcEl, tgtEl);
      const targetPosition = fixedPointToSide(el.endBinding.fixedPoint, tgtEl, srcEl);

      const labelEl = containerToText.get(el.id);
      const label = labelEl?.text ?? '';
      const hoverKey = getCustomString(el.customData, 'hoverContent');

      const edge: Edge = {
        id: el.id,
        source: el.startBinding.elementId,
        target: el.endBinding.elementId,
        sourceHandle: `${sourcePosition}-source`,
        targetHandle: `${targetPosition}-target`,
        type: hoverKey ? 'hoverEdge' : 'smoothstep',
        animated: false,
        style: { strokeWidth: 1.5 },
      };

      if (isArrowhead(el.endArrowhead)) {
        edge.markerEnd = { type: MarkerType.ArrowClosed };
      }
      if (isArrowhead(el.startArrowhead)) {
        edge.markerStart = { type: MarkerType.ArrowClosed };
      }
      if (label) edge.label = label;
      if (hoverKey) edge.data = { hoverContentKey: hoverKey };

      edges.push(edge);
      continue;
    }
  }

  // Filter edges whose source or target didn't produce a node (e.g., deleted, or bound to a text)
  const nodeIds = new Set(nodes.map((n) => n.id));
  const filteredEdges = edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));

  return { nodes, edges: filteredEdges };
}
