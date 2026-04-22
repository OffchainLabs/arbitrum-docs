import { Node, Edge, MarkerType, Position } from 'reactflow';
import { ReactFlowData, NodeData, TransitionConfig } from '../types';

interface DrawioCell {
  id: string;
  value: string;
  style: string;
  vertex: boolean;
  edge: boolean;
  source: string;
  target: string;
  parent: string;
  connectable: string;
  hoverContent: string;
  colorToken: string;
  x: number;
  y: number;
  width: number;
  height: number;
  waypoints: { x: number; y: number }[];
}

const ROOT_IDS = new Set(['0', '1']);
const PADDING = 30;

function parseStyleString(style: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!style) return result;
  for (const part of style.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      result[trimmed] = 'true';
    } else {
      result[trimmed.slice(0, eqIndex)] = trimmed.slice(eqIndex + 1);
    }
  }
  return result;
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<div[^>]*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function hasTopAlignedLabel(html: string): boolean {
  if (!html) return false;
  // Detect Draw.io pattern: label text followed by empty <div><br></div> spacers
  return /<div>\s*<br\s*\/?>\s*<\/div>\s*$/.test(html);
}

function isImageCell(styleProps: Record<string, string>): boolean {
  return styleProps['shape'] === 'image';
}

function extractImageDataUri(rawStyle: string): string {
  const marker = 'image=data:';
  const startIdx = rawStyle.indexOf(marker);
  if (startIdx === -1) return '';

  const dataStart = startIdx + 'image='.length;
  const rest = rawStyle.slice(dataStart);

  // Match until we hit ;key=value (e.g. ";container=0") or end of string
  const endMatch = rest.search(/;[a-zA-Z]+=(?!\/)/);
  let uri = endMatch === -1 ? rest : rest.slice(0, endMatch);
  uri = uri.replace(/;$/, '');

  // Draw.io often stores base64 SVGs as "data:image/svg+xml,<base64>" without
  // the ";base64," segment. Detect and fix this so browsers decode correctly.
  const commaIdx = uri.indexOf(',');
  if (commaIdx !== -1 && !uri.includes(';base64,')) {
    const payload = uri.slice(commaIdx + 1);
    const looksBase64 = /^[A-Za-z0-9+/=]+$/.test(payload.slice(0, 64));
    if (looksBase64) {
      uri = uri.slice(0, commaIdx) + ';base64,' + payload;
    }
  }

  return uri;
}

function isTextOnlyCell(styleProps: Record<string, string>): boolean {
  return styleProps['text'] === 'true';
}

function isGroupCell(styleProps: Record<string, string>): boolean {
  return styleProps['group'] === 'true';
}

function parseCells(doc: Document): DrawioCell[] {
  const cellElements = doc.querySelectorAll('mxCell');
  const cells: DrawioCell[] = [];

  for (const el of Array.from(cellElements)) {
    const id = el.getAttribute('id') ?? '';
    const geo = el.querySelector('mxGeometry');

    // Check for hoverContent on the cell itself or parent UserObject
    let hoverContent = el.getAttribute('hoverContent') ?? '';
    if (!hoverContent) {
      const parentEl = el.parentElement;
      if (parentEl && parentEl.tagName === 'UserObject') {
        hoverContent = parentEl.getAttribute('hoverContent') ?? '';
      }
    }

    const colorToken = el.getAttribute('colorToken') ?? '';

    // Parse routing waypoints: <mxGeometry><Array as="points"><mxPoint x=.. y=../></Array></mxGeometry>
    const waypoints: { x: number; y: number }[] = [];
    if (geo) {
      const pointsArray = geo.querySelector('Array[as="points"]');
      if (pointsArray) {
        for (const pt of Array.from(pointsArray.querySelectorAll('mxPoint'))) {
          const px = parseFloat(pt.getAttribute('x') ?? '');
          const py = parseFloat(pt.getAttribute('y') ?? '');
          if (!isNaN(px) && !isNaN(py)) waypoints.push({ x: px, y: py });
        }
      }
    }

    cells.push({
      id,
      value: el.getAttribute('value') ?? '',
      style: el.getAttribute('style') ?? '',
      vertex: el.getAttribute('vertex') === '1',
      edge: el.getAttribute('edge') === '1',
      source: el.getAttribute('source') ?? '',
      target: el.getAttribute('target') ?? '',
      parent: el.getAttribute('parent') ?? '',
      connectable: el.getAttribute('connectable') ?? '',
      hoverContent,
      colorToken,
      x: parseFloat(geo?.getAttribute('x') ?? '0'),
      y: parseFloat(geo?.getAttribute('y') ?? '0'),
      width: parseFloat(geo?.getAttribute('width') ?? '0'),
      height: parseFloat(geo?.getAttribute('height') ?? '0'),
      waypoints,
    });
  }

  return cells;
}

function buildCellMap(cells: DrawioCell[]): Map<string, DrawioCell> {
  const map = new Map<string, DrawioCell>();
  for (const cell of cells) {
    map.set(cell.id, cell);
  }
  return map;
}

function findGroupIds(cells: DrawioCell[], cellMap: Map<string, DrawioCell>): Set<string> {
  const groupIds = new Set<string>();

  for (const cell of cells) {
    if (!cell.vertex || ROOT_IDS.has(cell.id)) continue;
    const styleProps = parseStyleString(cell.style);
    if (isGroupCell(styleProps)) {
      groupIds.add(cell.id);
    }
  }

  // Detect implicit groups: vertex cells that have child vertices
  for (const cell of cells) {
    if (!cell.vertex || ROOT_IDS.has(cell.id) || ROOT_IDS.has(cell.parent)) {
      continue;
    }
    const parentCell = cellMap.get(cell.parent);
    if (
      parentCell &&
      parentCell.vertex &&
      !ROOT_IDS.has(parentCell.id) &&
      !groupIds.has(parentCell.id)
    ) {
      groupIds.add(parentCell.id);
    }
  }

  return groupIds;
}

function getAbsolutePosition(
  cell: DrawioCell,
  cellMap: Map<string, DrawioCell>,
): { x: number; y: number } {
  let x = cell.x;
  let y = cell.y;
  let currentParentId = cell.parent;

  while (currentParentId && !ROOT_IDS.has(currentParentId)) {
    const parent = cellMap.get(currentParentId);
    if (!parent) break;
    x += parent.x;
    y += parent.y;
    currentParentId = parent.parent;
  }

  return { x, y };
}

function determineShape(styleProps: Record<string, string>): string {
  if (styleProps['shape'] === 'process') return 'process';
  if (styleProps['ellipse'] === 'true') return 'circle';
  if (styleProps['rounded'] === '1') return 'round';
  return 'rect';
}

function buildNodes(
  cells: DrawioCell[],
  cellMap: Map<string, DrawioCell>,
  groupIds: Set<string>,
  onNavigate?: (link: string) => void,
  transitions?: TransitionConfig[],
): { nodes: Node[]; minX: number; minY: number } {
  const nodes: Node[] = [];
  let minX = Infinity;
  let minY = Infinity;

  // First pass: compute min coordinates for normalization
  for (const cell of cells) {
    if (!cell.vertex || ROOT_IDS.has(cell.id)) continue;
    const styleProps = parseStyleString(cell.style);
    if (isImageCell(styleProps)) continue;

    const abs = getAbsolutePosition(cell, cellMap);
    minX = Math.min(minX, abs.x);
    minY = Math.min(minY, abs.y);
  }

  if (!isFinite(minX)) minX = 0;
  if (!isFinite(minY)) minY = 0;

  // Track which groups are skipped (pure layout containers)
  const skippedGroups = new Set<string>();

  // Second pass: create nodes
  for (const cell of cells) {
    if (!cell.vertex || ROOT_IDS.has(cell.id)) continue;

    const styleProps = parseStyleString(cell.style);

    // Skip edge label cells — they're handled in buildEdges
    if (styleProps['edgeLabel'] === 'true') continue;

    // Render image cells (e.g. envelope icons) as image nodes
    if (isImageCell(styleProps)) {
      const imageData = extractImageDataUri(cell.style);
      if (!imageData || cell.width === 0) continue;

      const hasNonRootParent =
        !ROOT_IDS.has(cell.parent) && groupIds.has(cell.parent) && !skippedGroups.has(cell.parent);

      let imgX: number;
      let imgY: number;
      if (hasNonRootParent) {
        imgX = cell.x;
        imgY = cell.y;
      } else {
        const abs = getAbsolutePosition(cell, cellMap);
        imgX = abs.x - minX + PADDING;
        imgY = abs.y - minY + PADDING;
      }

      const imgNode: Node = {
        id: cell.id,
        type: 'image',
        position: { x: imgX, y: imgY },
        data: { imageUrl: imageData },
        style: { width: cell.width, height: cell.height },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };

      if (hasNonRootParent) {
        imgNode.parentNode = cell.parent;
        imgNode.extent = 'parent';
      }

      nodes.push(imgNode);
      continue;
    }

    const label = stripHtml(cell.value);
    const isGroup = groupIds.has(cell.id);
    const isText = isTextOnlyCell(styleProps);

    // Skip cells with no label, no group, and no meaningful geometry (visual elements
    // like colored rectangles have no label but should still render)
    if (!label && !isGroup && !(cell.width > 0 && cell.height > 0)) continue;

    const fillColor = styleProps['fillColor'] ?? 'transparent';

    const hasNonRootParentGroup =
      !ROOT_IDS.has(cell.parent) && groupIds.has(cell.parent) && !skippedGroups.has(cell.parent);

    // Position: relative to parent group, or absolute normalized
    let posX: number;
    let posY: number;

    if (hasNonRootParentGroup) {
      posX = cell.x;
      posY = cell.y;
    } else {
      const abs = getAbsolutePosition(cell, cellMap);
      posX = abs.x - minX + PADDING;
      posY = abs.y - minY + PADDING;
    }

    if (isGroup) {
      // Skip pure layout groups (no fill, no visible border) — they're invisible containers
      if (isGroupCell(styleProps) && fillColor === 'transparent') {
        skippedGroups.add(cell.id);
        continue;
      }

      const abs = getAbsolutePosition(cell, cellMap);
      posX = abs.x - minX + PADDING;
      posY = abs.y - minY + PADDING;

      nodes.push({
        id: cell.id,
        type: 'group',
        position: { x: posX, y: posY },
        data: { label: label || '' },
        style: {
          width: cell.width,
          height: cell.height,
          padding: 0,
        },
      });
      continue;
    }

    if (isText && !cell.colorToken) {
      nodes.push({
        id: cell.id,
        type: 'default',
        position: { x: posX, y: posY },
        data: { label },
        style: {
          width: cell.width,
          height: cell.height,
          backgroundColor: 'transparent',
          border: 'none',
          color: '#ffffff',
          fontSize: '14px',
          lineHeight: '1.2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });
      continue;
    }

    const shape = determineShape(styleProps);

    const isManifestTrigger = transitions?.some((t) => t.trigger === label) ?? false;
    const isBlinking = isManifestTrigger || cell.hoverContent === 'blinking';

    const nodeData: NodeData = {
      label,
      shape,
      centerable: isBlinking || undefined,
      navigateTo: transitions?.find((t) => t.trigger === label)?.targetFile || undefined,
      topAligned: hasTopAlignedLabel(cell.value) || undefined,
      colorToken: cell.colorToken || undefined,
      hoverContentKey: cell.hoverContent || undefined,
      onNavigate,
    };

    const node: Node = {
      id: cell.id,
      type: 'custom',
      position: { x: posX, y: posY },
      data: nodeData,
      className: isBlinking ? 'node-blinking' : undefined,
      style: {
        width: cell.width,
        height: cell.height,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };

    if (hasNonRootParentGroup) {
      node.parentNode = cell.parent;
      node.extent = 'parent';
    }

    nodes.push(node);
  }

  return { nodes, minX, minY };
}

function resolveHandlePosition(entryX: string | undefined, entryY: string | undefined): Position {
  const x = entryX !== undefined ? parseFloat(entryX) : undefined;
  const y = entryY !== undefined ? parseFloat(entryY) : undefined;

  if (x !== undefined && y !== undefined) {
    if (x <= 0.1) return Position.Left;
    if (x >= 0.9) return Position.Right;
    if (y <= 0.1) return Position.Top;
    if (y >= 0.9) return Position.Bottom;
  }
  if (x !== undefined) {
    if (x <= 0.1) return Position.Left;
    if (x >= 0.9) return Position.Right;
  }
  if (y !== undefined) {
    if (y <= 0.1) return Position.Top;
    if (y >= 0.9) return Position.Bottom;
  }
  return Position.Bottom;
}

function sideFromWaypoint(
  waypoint: { x: number; y: number },
  cell: DrawioCell,
  cellMap: Map<string, DrawioCell>,
): Position {
  const abs = getAbsolutePosition(cell, cellMap);
  const right = abs.x + cell.width;
  const bottom = abs.y + cell.height;

  // Waypoint is outside the cell's bounding box → use the side it lies beyond.
  if (waypoint.x < abs.x) return Position.Left;
  if (waypoint.x > right) return Position.Right;
  if (waypoint.y < abs.y) return Position.Top;
  if (waypoint.y > bottom) return Position.Bottom;

  // Waypoint is inside the cell — fall back to the dominant axis from cell center.
  const centerX = abs.x + cell.width / 2;
  const centerY = abs.y + cell.height / 2;
  const dx = waypoint.x - centerX;
  const dy = waypoint.y - centerY;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? Position.Right : Position.Left;
  return dy > 0 ? Position.Bottom : Position.Top;
}

function inferConnectionSide(
  sourceCell: DrawioCell,
  targetCell: DrawioCell,
  cellMap: Map<string, DrawioCell>,
): { sourcePosition: Position; targetPosition: Position } {
  const sAbs = getAbsolutePosition(sourceCell, cellMap);
  const tAbs = getAbsolutePosition(targetCell, cellMap);

  const sCenterX = sAbs.x + sourceCell.width / 2;
  const sCenterY = sAbs.y + sourceCell.height / 2;
  const tCenterX = tAbs.x + targetCell.width / 2;
  const tCenterY = tAbs.y + targetCell.height / 2;

  const dx = tCenterX - sCenterX;
  const dy = tCenterY - sCenterY;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0
      ? { sourcePosition: Position.Right, targetPosition: Position.Left }
      : { sourcePosition: Position.Left, targetPosition: Position.Right };
  }
  return dy > 0
    ? { sourcePosition: Position.Bottom, targetPosition: Position.Top }
    : { sourcePosition: Position.Top, targetPosition: Position.Bottom };
}

function findEdgeLabelData(
  edgeId: string,
  cells: DrawioCell[],
): { text: string; hoverContentKey?: string } {
  for (const cell of cells) {
    if (cell.parent !== edgeId || !cell.vertex) continue;
    const styleProps = parseStyleString(cell.style);
    if (styleProps['edgeLabel'] !== 'true') continue;
    const text = stripHtml(cell.value);
    if (text) return { text, hoverContentKey: cell.hoverContent || undefined };
  }
  return { text: '' };
}

function buildEdges(cells: DrawioCell[], cellMap: Map<string, DrawioCell>): Edge[] {
  const edges: Edge[] = [];

  for (const cell of cells) {
    if (!cell.edge) continue;
    if (!cell.source || !cell.target) continue;

    const styleProps = parseStyleString(cell.style);
    const isDashed = styleProps['dashed'] === '1';
    const strokeColor = styleProps['strokeColor'] ?? '#FFFFFF';
    const resolvedStrokeColor = strokeColor === '#000000' ? '#cccccc' : strokeColor;
    const strokeWidth = parseFloat(styleProps['strokeWidth'] ?? '1');

    const sourceCell = cellMap.get(cell.source);
    const targetCell = cellMap.get(cell.target);

    // Determine connection sides from Draw.io entry/exit metadata
    let sourcePosition: Position;
    let targetPosition: Position;

    const hasExitMeta = styleProps['exitX'] !== undefined || styleProps['exitY'] !== undefined;
    const hasEntryMeta = styleProps['entryX'] !== undefined || styleProps['entryY'] !== undefined;
    const waypoints = cell.waypoints;
    const firstWaypoint = waypoints.length > 0 ? waypoints[0] : undefined;
    const lastWaypoint = waypoints.length > 0 ? waypoints[waypoints.length - 1] : undefined;

    if (hasExitMeta) {
      sourcePosition = resolveHandlePosition(styleProps['exitX'], styleProps['exitY']);
    } else if (firstWaypoint && sourceCell) {
      sourcePosition = sideFromWaypoint(firstWaypoint, sourceCell, cellMap);
    } else if (sourceCell && targetCell) {
      sourcePosition = inferConnectionSide(sourceCell, targetCell, cellMap).sourcePosition;
    } else {
      sourcePosition = Position.Bottom;
    }

    if (hasEntryMeta) {
      targetPosition = resolveHandlePosition(styleProps['entryX'], styleProps['entryY']);
    } else if (lastWaypoint && targetCell) {
      targetPosition = sideFromWaypoint(lastWaypoint, targetCell, cellMap);
    } else if (sourceCell && targetCell) {
      targetPosition = inferConnectionSide(sourceCell, targetCell, cellMap).targetPosition;
    } else {
      targetPosition = Position.Top;
    }

    const startArrow = styleProps['startArrow'];
    const hasStartArrow = !!startArrow && startArrow !== 'none';

    const edge: Edge = {
      id: cell.id,
      source: cell.source,
      target: cell.target,
      sourceHandle: `${sourcePosition}-source`,
      targetHandle: `${targetPosition}-target`,
      type: 'smoothstep',
      animated: true,
      style: {
        stroke: resolvedStrokeColor,
        strokeWidth,
        ...(isDashed ? { strokeDasharray: '5 5' } : {}),
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: resolvedStrokeColor,
      },
      ...(hasStartArrow
        ? {
            markerStart: {
              type: MarkerType.ArrowClosed,
              color: resolvedStrokeColor,
            },
          }
        : {}),
    };

    const labelData = findEdgeLabelData(cell.id, cells);
    const edgeLabel = stripHtml(cell.value) || labelData.text;
    const edgeHoverKey = cell.hoverContent || labelData.hoverContentKey;

    if (edgeLabel) {
      edge.label = edgeLabel;
    }

    if (edgeHoverKey) {
      edge.type = 'hoverEdge';
      edge.data = { hoverContentKey: edgeHoverKey };
    }

    edges.push(edge);
  }

  return edges;
}

export async function convertDrawioToReactFlow(
  xmlString: string,
  onNavigate?: (link: string) => void,
  transitions?: TransitionConfig[],
): Promise<ReactFlowData> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error(`Failed to parse Draw.io XML: ${parserError.textContent}`);
  }

  const cells = parseCells(doc);
  const cellMap = buildCellMap(cells);
  const groupIds = findGroupIds(cells, cellMap);

  const { nodes } = buildNodes(cells, cellMap, groupIds, onNavigate, transitions);
  const edges = buildEdges(cells, cellMap);

  // Filter edges that reference nodes not in our node set
  const nodeIds = new Set(nodes.map((n) => n.id));
  const validEdges = edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));

  return { nodes, edges: validEdges };
}
