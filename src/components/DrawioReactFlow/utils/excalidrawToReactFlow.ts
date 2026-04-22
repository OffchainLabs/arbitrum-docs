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

function fixedPointToSide(fixedPoint: [number, number] | undefined): Position {
  if (!fixedPoint) return Position.Top;
  const [x, y] = fixedPoint;
  const distLeft = x;
  const distRight = 1 - x;
  const distTop = y;
  const distBottom = 1 - y;
  const min = Math.min(distLeft, distRight, distTop, distBottom);
  if (min === distLeft) return Position.Left;
  if (min === distRight) return Position.Right;
  if (min === distTop) return Position.Top;
  return Position.Bottom;
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

  // Map container element id -> bound text element (used for labels on shapes and arrows)
  const containerToText = new Map<string, ExcalidrawElement>();
  for (const el of elements) {
    if (el.type === 'text' && el.containerId) {
      containerToText.set(el.containerId, el);
    }
  }

  // Compute minX/minY across non-arrow elements for coordinate normalization
  let minX = Infinity;
  let minY = Infinity;
  for (const el of elements) {
    if (el.type === 'arrow' || el.type === 'line') continue;
    if (el.type === 'text' && el.containerId) continue; // bound text follows its container
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
  }
  if (!isFinite(minX)) minX = 0;
  if (!isFinite(minY)) minY = 0;

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  for (const el of elements) {
    // Text bound to a container is rendered as the container's label, not a separate node
    if (el.type === 'text' && el.containerId) continue;

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

      const sourcePosition = fixedPointToSide(el.startBinding.fixedPoint);
      const targetPosition = fixedPointToSide(el.endBinding.fixedPoint);

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
