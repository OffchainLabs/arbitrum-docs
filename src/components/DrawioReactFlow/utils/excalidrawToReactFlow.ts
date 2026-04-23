import { Node, Edge, MarkerType, Position } from 'reactflow';
import {
  ReactFlowData,
  NodeData,
  NodeTextAlign,
  NodeVerticalAlign,
  TransitionConfig,
} from '../types';

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
  textAlign?: string;
  verticalAlign?: string;
  // image-specific
  fileId?: string;
  // arrow-specific
  points?: [number, number][];
  startBinding?: ExcalidrawBinding | null;
  endBinding?: ExcalidrawBinding | null;
  startArrowhead?: string | null;
  endArrowhead?: string | null;
  groupIds?: string[];
}

interface ExcalidrawFileEntry {
  mimeType?: string;
  dataURL?: string;
}

interface ExcalidrawFile {
  type?: string;
  version?: number;
  elements?: ExcalidrawElement[];
  files?: Record<string, ExcalidrawFileEntry>;
}

function remapFixedPoint(
  fp: [number, number],
  fromEl: ExcalidrawElement,
  toEl: ExcalidrawElement,
): [number, number] {
  if (toEl.width === 0 || toEl.height === 0) return fp;
  const absX = fromEl.x + fp[0] * fromEl.width;
  const absY = fromEl.y + fp[1] * fromEl.height;
  return [(absX - toEl.x) / toEl.width, (absY - toEl.y) / toEl.height];
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

function normalizeTextAlign(value: string | undefined): NodeTextAlign | undefined {
  if (value === 'left' || value === 'center' || value === 'right') return value;
  return undefined;
}

function normalizeVerticalAlign(value: string | undefined): NodeVerticalAlign | undefined {
  if (value === 'top' || value === 'middle' || value === 'bottom') return value;
  return undefined;
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

  // Top-level files dict maps fileId -> { dataURL } for image elements
  const filesMap = new Map<string, string>();
  if (parsed.files) {
    for (const [fileId, entry] of Object.entries(parsed.files)) {
      if (entry?.dataURL) filesMap.set(fileId, entry.dataURL);
    }
  }

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

  // Inverse map: text element id -> container shape id. Used to redirect arrows that
  // are bound to a text element (common when the author clicks on the visible text
  // overlay) to the underlying shape.
  const textToContainer = new Map<string, string>();
  for (const [shapeId, textEl] of containerToText.entries()) {
    textToContainer.set(textEl.id, shapeId);
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
      const textAlign = normalizeTextAlign(boundText?.textAlign);
      const verticalAlign = normalizeVerticalAlign(boundText?.verticalAlign);

      const nodeData: NodeData = {
        label,
        shape: determineShape(el.type),
        centerable: isBlinking || undefined,
        navigateTo: transitions?.find((t) => t.trigger === label)?.targetFile || undefined,
        colorToken,
        hoverContentKey: hoverKey,
        textAlign,
        verticalAlign,
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

    // Image nodes — resolve the data URL via fileId -> top-level files dict
    if (el.type === 'image') {
      if (!el.fileId) continue;
      const dataUrl = filesMap.get(el.fileId);
      if (!dataUrl) continue;
      nodes.push({
        id: el.id,
        type: 'image',
        position: { x: el.x - minX + PADDING, y: el.y - minY + PADDING },
        data: { imageUrl: dataUrl },
        style: { width: el.width, height: el.height },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });
      continue;
    }

    // Arrows — require both bindings to render as a ReactFlow edge
    if (el.type === 'arrow') {
      if (!el.startBinding?.elementId || !el.endBinding?.elementId) continue;

      const srcRawId = el.startBinding.elementId;
      const tgtRawId = el.endBinding.elementId;
      const srcShapeId = textToContainer.get(srcRawId) ?? srcRawId;
      const tgtShapeId = textToContainer.get(tgtRawId) ?? tgtRawId;

      const srcRawEl = elementById.get(srcRawId);
      const tgtRawEl = elementById.get(tgtRawId);
      const srcEl = elementById.get(srcShapeId);
      const tgtEl = elementById.get(tgtShapeId);
      if (!srcEl || !tgtEl) continue;

      // Remap fixedPoints from the bound element's coordinate space to the shape's,
      // so side resolution is computed relative to the actual rendered node geometry.
      const sfp =
        srcRawEl && srcRawEl !== srcEl && el.startBinding.fixedPoint
          ? remapFixedPoint(el.startBinding.fixedPoint, srcRawEl, srcEl)
          : el.startBinding.fixedPoint;
      const efp =
        tgtRawEl && tgtRawEl !== tgtEl && el.endBinding.fixedPoint
          ? remapFixedPoint(el.endBinding.fixedPoint, tgtRawEl, tgtEl)
          : el.endBinding.fixedPoint;

      const sourcePosition = fixedPointToSide(sfp, srcEl, tgtEl);
      const targetPosition = fixedPointToSide(efp, tgtEl, srcEl);

      const labelEl = containerToText.get(el.id);
      const label = labelEl?.text ?? '';
      const hoverKey = getCustomString(el.customData, 'hoverContent');

      const edge: Edge = {
        id: el.id,
        source: srcShapeId,
        target: tgtShapeId,
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
