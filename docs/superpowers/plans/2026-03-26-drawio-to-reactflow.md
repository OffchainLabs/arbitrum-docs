# Draw.io to ReactFlow Converter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Mermaid-based diagram pipeline with a Draw.io XML converter that preserves exact positions, colors, shapes, and groupings from Draw.io files.

**Architecture:** A new `drawioToReactFlow.ts` utility parses Draw.io XML, extracts vertex/edge mxCells with their geometry and styles, and produces ReactFlow `Node[]` and `Edge[]` with absolute positioning (no Dagre layout). The existing `NavigableDiagram` component is updated to load `.drawio` files instead of `.mmd` files. The component name stays `MermaidReactFlow` externally to avoid breaking MDX imports, but internals are fully replaced.

**Tech Stack:** TypeScript, ReactFlow 11.x, DOMParser (browser-native XML parsing), Docusaurus BrowserOnly

---

## File Structure

| Action       | File                                                          | Responsibility                                                                     |
| ------------ | ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Create       | `src/components/MermaidReactFlow/utils/drawioToReactFlow.ts`  | Parse Draw.io XML → ReactFlow nodes/edges with exact positions and styles          |
| Modify       | `src/components/MermaidReactFlow/types.ts`                    | Add `DrawioReactFlowProps` (replaces `MermaidReactFlowProps`)                      |
| Modify       | `src/components/MermaidReactFlow/NavigableDiagram.tsx`        | Load `.drawio` files, call `convertDrawioToReactFlow` instead of Mermaid converter |
| Modify       | `src/components/MermaidReactFlow/index.tsx`                   | Update props type                                                                  |
| Modify       | `docs/test-interactive-diagrams.mdx`                          | Point to `.drawio` file instead of `.mmd`                                          |
| Create       | `static/diagrams/haw-transaction-lifecycle.drawio`            | Copy the test Draw.io file into static assets                                      |
| Keep         | `src/components/MermaidReactFlow/ClickableNode.tsx`           | Reused as-is                                                                       |
| Keep         | `src/components/MermaidReactFlow/SubgraphNode.tsx`            | Reused as-is                                                                       |
| Delete later | `src/components/MermaidReactFlow/utils/mermaidToReactFlow.ts` | Removed after converter works                                                      |
| Delete later | `src/components/MermaidReactFlow/utils/linkParser.ts`         | Removed after converter works                                                      |

---

### Task 1: Copy Draw.io test file into static assets

**Files:**

- Create: `static/diagrams/haw-transaction-lifecycle.drawio`

- [ ] **Step 1: Copy the file**

```shell
cp ~/OCL/projects/interactive-diagrams-module/ID-haw-transaction-lifecycle.drawio static/diagrams/haw-transaction-lifecycle.drawio
```

- [ ] **Step 2: Verify the file exists**

```shell
ls -la static/diagrams/haw-transaction-lifecycle.drawio
```

Expected: File exists, ~5KB

- [ ] **Step 3: Commit**

```shell
git add static/diagrams/haw-transaction-lifecycle.drawio
git commit -m "feat: add Draw.io test diagram for transaction lifecycle"
```

---

### Task 2: Create drawioToReactFlow converter

**Files:**

- Create: `src/components/MermaidReactFlow/utils/drawioToReactFlow.ts`

This is the core converter. It parses Draw.io XML and produces ReactFlow elements.

- [ ] **Step 1: Create the converter file**

The converter must handle these Draw.io patterns found in the test file:

- **Vertices** (`vertex="1"`): rectangles with `value`, `style`, `mxGeometry` (x, y, width, height)
- **Edges** (`edge="1"`): connections with `source`, `target`, `style` (dashed, strokeColor, strokeWidth)
- **Groups**: cells with `parent` pointing to a non-root cell (parent-child nesting)
- **HTML values**: `<font>`, `<div>` tags in `value` attributes
- **Style strings**: semicolon-delimited key=value pairs like `fillColor=#E3066E;strokeColor=#FFFFFF;rounded=1`
- **Image cells** (`shape=image`): skip these (envelope icons)
- **Text-only cells** (`text;html=1`): labels like "Sequenced Txs" — render as label-only nodes
- **Process shapes** (`shape=process`): nodes with vertical divider lines (Sequencer, Batch and compress)

```typescript
// src/components/MermaidReactFlow/utils/drawioToReactFlow.ts
import { Node, Edge, MarkerType, Position } from 'reactflow';
import { ReactFlowData } from '../types';

interface DrawioCell {
  id: string;
  value: string;
  style: Record<string, string>;
  geometry: { x: number; y: number; width: number; height: number } | null;
  parent: string;
  isVertex: boolean;
  isEdge: boolean;
  source: string;
  target: string;
  edgePoints: Array<{ x: number; y: number }>;
}

function parseStyle(styleStr: string): Record<string, string> {
  const style: Record<string, string> = {};
  if (!styleStr) return style;

  styleStr.split(';').forEach((part) => {
    const eqIndex = part.indexOf('=');
    if (eqIndex > 0) {
      style[part.substring(0, eqIndex).trim()] = part.substring(eqIndex + 1).trim();
    } else if (part.trim()) {
      // Shape type as key-only value (e.g., "rounded", "text")
      style[part.trim()] = '1';
    }
  });

  return style;
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<div>/gi, '\n')
    .replace(/<\/div>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/\n+/g, '\n')
    .trim();
}

function parseCells(xmlDoc: Document): DrawioCell[] {
  const cells: DrawioCell[] = [];
  const mxCells = xmlDoc.querySelectorAll('mxCell');

  mxCells.forEach((cell) => {
    const id = cell.getAttribute('id') || '';
    // Skip root cells (id 0 and 1)
    if (id === '0' || id === '1') return;

    const value = cell.getAttribute('value') || '';
    const styleStr = cell.getAttribute('style') || '';
    const parent = cell.getAttribute('parent') || '1';
    const isVertex = cell.getAttribute('vertex') === '1';
    const isEdge = cell.getAttribute('edge') === '1';
    const source = cell.getAttribute('source') || '';
    const target = cell.getAttribute('target') || '';

    const style = parseStyle(styleStr);

    // Parse geometry
    let geometry: DrawioCell['geometry'] = null;
    const geo = cell.querySelector('mxGeometry');
    if (geo) {
      const x = parseFloat(geo.getAttribute('x') || '0');
      const y = parseFloat(geo.getAttribute('y') || '0');
      const width = parseFloat(geo.getAttribute('width') || '0');
      const height = parseFloat(geo.getAttribute('height') || '0');
      geometry = { x, y, width, height };
    }

    // Parse edge waypoints
    const edgePoints: Array<{ x: number; y: number }> = [];
    const pointsArray = cell.querySelector('Array[as="points"]');
    if (pointsArray) {
      pointsArray.querySelectorAll('mxPoint').forEach((point) => {
        edgePoints.push({
          x: parseFloat(point.getAttribute('x') || '0'),
          y: parseFloat(point.getAttribute('y') || '0'),
        });
      });
    }

    cells.push({
      id,
      value,
      style,
      geometry,
      parent,
      isVertex,
      isEdge,
      source,
      target,
      edgePoints,
    });
  });

  return cells;
}

function isImageCell(style: Record<string, string>): boolean {
  return style['shape'] === 'image';
}

function isGroupContainer(cell: DrawioCell, allCells: DrawioCell[]): boolean {
  // A cell is a group container if other non-image vertex cells have it as parent
  return allCells.some((c) => c.parent === cell.id && c.isVertex && !isImageCell(c.style));
}

function isTextLabel(style: Record<string, string>): boolean {
  return style['text'] === '1' || style['shape'] === 'text';
}

function getNodeShape(style: Record<string, string>): string {
  if (style['shape'] === 'process') return 'process';
  if (style['shape'] === 'rhombus') return 'diamond';
  if (style['ellipse'] === '1') return 'circle';
  if (style['rounded'] === '1') return 'round';
  return 'rect';
}

function resolveAbsolutePosition(
  cell: DrawioCell,
  cellMap: Map<string, DrawioCell>,
): { x: number; y: number } {
  if (!cell.geometry) return { x: 0, y: 0 };

  let x = cell.geometry.x;
  let y = cell.geometry.y;

  // Walk up parent chain to accumulate absolute position
  let parentId = cell.parent;
  while (parentId && parentId !== '0' && parentId !== '1') {
    const parentCell = cellMap.get(parentId);
    if (parentCell?.geometry) {
      x += parentCell.geometry.x;
      y += parentCell.geometry.y;
    }
    parentId = parentCell?.parent || '1';
  }

  return { x, y };
}

export async function convertDrawioToReactFlow(
  xmlString: string,
  onNavigate?: (link: string) => void,
): Promise<ReactFlowData> {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

  const cells = parseCells(xmlDoc);
  const cellMap = new Map(cells.map((c) => [c.id, c]));

  const reactFlowNodes: Node[] = [];
  const reactFlowEdges: Edge[] = [];

  // Identify group containers
  const groupIds = new Set<string>();
  cells.forEach((cell) => {
    if (cell.isVertex && isGroupContainer(cell, cells)) {
      groupIds.add(cell.id);
    }
  });

  // Find the global min position to normalize coordinates
  let globalMinX = Infinity;
  let globalMinY = Infinity;
  cells.forEach((cell) => {
    if (cell.isVertex && !isImageCell(cell.style)) {
      const absPos = resolveAbsolutePosition(cell, cellMap);
      globalMinX = Math.min(globalMinX, absPos.x);
      globalMinY = Math.min(globalMinY, absPos.y);
    }
  });
  // Add padding
  const offsetX = -globalMinX + 40;
  const offsetY = -globalMinY + 40;

  // Process group containers first (lower z-index)
  cells.forEach((cell) => {
    if (!cell.isVertex || !groupIds.has(cell.id)) return;
    if (isImageCell(cell.style)) return;
    if (!cell.geometry) return;

    const absPos = resolveAbsolutePosition(cell, cellMap);
    const label = stripHtml(cell.value);
    const fillColor = cell.style['fillColor'] || '#f0f4f8';
    const strokeColor = cell.style['strokeColor'] || '#cccccc';

    // Check if there's a text-only child that serves as the group label
    let groupLabel = label;
    cells.forEach((child) => {
      if (child.parent === cell.id && isTextLabel(child.style) && child.value) {
        groupLabel = stripHtml(child.value);
      }
    });

    reactFlowNodes.push({
      id: cell.id,
      type: 'group',
      position: {
        x: absPos.x + offsetX,
        y: absPos.y + offsetY,
      },
      data: {
        label: groupLabel,
        isSubgraph: true,
      },
      style: {
        backgroundColor: fillColor,
        border: `3px solid ${strokeColor}`,
        borderRadius: '12px',
        width: cell.geometry.width,
        height: cell.geometry.height,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transform: 'none',
        zIndex: -1,
      },
      selectable: true,
      draggable: false,
      connectable: false,
    });
  });

  // Process regular vertex nodes
  cells.forEach((cell) => {
    if (!cell.isVertex) return;
    if (groupIds.has(cell.id)) return; // Already handled as group
    if (isImageCell(cell.style)) return; // Skip envelope icons
    if (isTextLabel(cell.style)) return; // Skip standalone text labels
    if (!cell.geometry) return;
    if (cell.style['group'] === '1' || cell.style['connectable'] === '0') {
      // connectable=0 groups are layout containers, check if also a group
      if (!cell.value && !groupIds.has(cell.id)) return;
    }

    const label = stripHtml(cell.value);
    if (!label && !groupIds.has(cell.id)) return; // Skip empty non-group nodes

    const shape = getNodeShape(cell.style);
    const fillColor = cell.style['fillColor'] || '#f0f4f8';
    const strokeColor = cell.style['strokeColor'] || '#2d3748';

    // Determine if this node is inside a group
    let parentNode: string | undefined;
    let position: { x: number; y: number };

    if (groupIds.has(cell.parent)) {
      // Position relative to parent group
      parentNode = cell.parent;
      position = {
        x: cell.geometry.x,
        y: cell.geometry.y,
      };
    } else {
      // Absolute position
      const absPos = resolveAbsolutePosition(cell, cellMap);
      position = {
        x: absPos.x + offsetX,
        y: absPos.y + offsetY,
      };
    }

    let borderRadius = '8px';
    if (shape === 'circle') borderRadius = '50%';
    else if (shape === 'diamond') borderRadius = '0px';
    else if (cell.style['rounded'] === '1') borderRadius = '12px';

    reactFlowNodes.push({
      id: cell.id,
      type: 'custom',
      position,
      data: {
        label,
        shape,
        colors: {
          backgroundColor: fillColor,
          borderColor: strokeColor,
        },
        link: undefined, // Draw.io links can be added via style metadata later
        onNavigate,
      },
      style: {
        backgroundColor: fillColor,
        borderColor: strokeColor,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        width: cell.geometry.width,
        height: cell.geometry.height,
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      parentNode,
      draggable: false,
      zIndex: 1,
    });
  });

  // Process edges
  cells.forEach((cell, index) => {
    if (!cell.isEdge) return;
    if (!cell.source || !cell.target) return;

    // Check if source/target nodes exist in our ReactFlow nodes
    const sourceExists = reactFlowNodes.some((n) => n.id === cell.source);
    const targetExists = reactFlowNodes.some((n) => n.id === cell.target);

    // If source or target is a group container, find an appropriate child
    // or use the group ID directly
    const source = cell.source;
    const target = cell.target;

    if (!sourceExists && !groupIds.has(source)) return;
    if (!targetExists && !groupIds.has(target)) return;

    const isDashed = cell.style['dashed'] === '1';
    const strokeColor = cell.style['strokeColor'] || '#666666';
    const strokeWidth = parseFloat(cell.style['strokeWidth'] || '2');

    const edgeStyle: Record<string, unknown> = {
      stroke: strokeColor,
      strokeWidth,
    };

    if (isDashed) {
      edgeStyle.strokeDasharray = '6,4';
    }

    reactFlowEdges.push({
      id: `edge-${source}-${target}-${index}`,
      source,
      target,
      type: 'smoothstep',
      animated: !isDashed,
      style: edgeStyle,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: strokeColor,
      },
      zIndex: 0,
    });
  });

  return { nodes: reactFlowNodes, edges: reactFlowEdges };
}
```

- [ ] **Step 2: Verify file compiles**

```shell
yarn typecheck 2>&1 | grep -i "drawioToReactFlow" | head -5
```

Expected: No type errors

- [ ] **Step 3: Commit**

```shell
git add src/components/MermaidReactFlow/utils/drawioToReactFlow.ts
git commit -m "feat: add Draw.io XML to ReactFlow converter"
```

---

### Task 3: Update types

**Files:**

- Modify: `src/components/MermaidReactFlow/types.ts`

- [ ] **Step 1: Replace MermaidReactFlowProps with DrawioReactFlowProps**

Replace `MermaidReactFlowProps` with a new interface that takes a `.drawio` file path instead of a `.mmd` file. Keep the same property names so the MDX import stays compatible.

```typescript
// src/components/MermaidReactFlow/types.ts
import { Node, Edge } from 'reactflow';

export interface DiagramProps {
  diagramFile: string; // Path to .drawio file in static/
  height?: string;
  className?: string;
}

// Keep backward compat alias for existing MDX imports
export type MermaidReactFlowProps = DiagramProps;

export interface ReactFlowData {
  nodes: Node[];
  edges: Edge[];
}

export interface NavigationState {
  currentDiagram: string;
  history: string[];
}

export interface NodeData {
  label: string;
  shape: string;
  colors: {
    backgroundColor: string;
    borderColor: string;
  };
  link?: string;
  onNavigate?: (link: string) => void;
}
```

Note: `MermaidNode`, `MermaidEdge`, `SubgraphInfo` are removed since the Draw.io converter uses its own internal types.

- [ ] **Step 2: Verify no type errors**

```shell
yarn typecheck 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```shell
git add src/components/MermaidReactFlow/types.ts
git commit -m "refactor: replace Mermaid types with Draw.io diagram types"
```

---

### Task 4: Update NavigableDiagram to load Draw.io files

**Files:**

- Modify: `src/components/MermaidReactFlow/NavigableDiagram.tsx`

- [ ] **Step 1: Replace Mermaid loading with Draw.io loading**

Change the `useEffect` to fetch `.drawio` XML files and call `convertDrawioToReactFlow` instead of `convertMermaidToReactFlow`.

```typescript
// src/components/MermaidReactFlow/NavigableDiagram.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow from 'reactflow';
import { useColorMode } from '@docusaurus/theme-common';
import { motion, AnimatePresence } from 'motion/react';
import 'reactflow/dist/style.css';
import { ClickableNode } from './ClickableNode';
import { SubgraphNode } from './SubgraphNode';
import { convertDrawioToReactFlow } from './utils/drawioToReactFlow';
import { ReactFlowData, DiagramProps } from './types';

function useSafeColorMode() {
  try {
    const { colorMode } = useColorMode();
    return colorMode;
  } catch (error) {
    return 'light';
  }
}

export function NavigableDiagram({ diagramFile, height = '500px', className = '' }: DiagramProps) {
  const colorMode = useSafeColorMode();
  const [flowData, setFlowData] = useState<ReactFlowData>({ nodes: [], edges: [] });
  const [currentDiagram, setCurrentDiagram] = useState<string>(diagramFile);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const nodeTypes = useMemo(() => ({ custom: ClickableNode, group: SubgraphNode }), []);

  const defaultEdgeOptions = useMemo(
    () => ({
      style: { strokeWidth: 2, stroke: '#1976D2' },
      animated: false,
    }),
    [],
  );

  const handleNavigate = useCallback(
    (link: string) => {
      setHistory((prev) => [...prev, currentDiagram]);
      setCurrentDiagram(link);
    },
    [currentDiagram],
  );

  const handleBack = useCallback(() => {
    if (history.length > 0) {
      const previousDiagram = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setCurrentDiagram(previousDiagram);
    }
  }, [history]);

  useEffect(() => {
    const loadDiagram = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(currentDiagram);
        if (!response.ok) {
          throw new Error(`Failed to load diagram: ${currentDiagram}`);
        }

        const xmlString = await response.text();
        const data = await convertDrawioToReactFlow(xmlString, handleNavigate);
        setFlowData(data);
      } catch (err) {
        console.error('Error loading diagram:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadDiagram();
  }, [currentDiagram, handleNavigate]);

  if (loading) {
    return (
      <div
        className={`mermaid-reactflow-container ${className}`}
        style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div>Loading diagram...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`mermaid-reactflow-container ${className}`}
        style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div style={{ color: 'var(--ifm-color-danger)' }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div
      className={`mermaid-reactflow-container ${className}`}
      data-theme={colorMode}
      style={{ height, position: 'relative' }}
    >
      {history.length > 0 && (
        <div className="diagram-nav-controls">
          <button
            className="back-button"
            onClick={handleBack}
            aria-label="Go back to previous diagram"
          >
            <span className="back-icon">←</span>
            Back
          </button>
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentDiagram}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1.5, ease: 'easeInOut' },
            exit: { duration: 2.2, ease: 'easeOut' },
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <ReactFlow
            nodes={flowData.nodes}
            edges={flowData.edges}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            fitViewOptions={{
              padding: 0.2,
              includeHiddenNodes: false,
              minZoom: 0.5,
              maxZoom: 1.5,
            }}
            attributionPosition="bottom-right"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Verify no type errors**

```shell
yarn typecheck 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```shell
git add src/components/MermaidReactFlow/NavigableDiagram.tsx
git commit -m "refactor: switch NavigableDiagram from Mermaid to Draw.io loader"
```

---

### Task 5: Update test page to use Draw.io diagram

**Files:**

- Modify: `docs/test-interactive-diagrams.mdx`

- [ ] **Step 1: Update the diagram file path**

Change the `diagramFile` prop from the `.mmd` file to the `.drawio` file:

```mdx
<MermaidReactFlow diagramFile="/diagrams/haw-transaction-lifecycle.drawio" height="800px" />
```

Also update the descriptive text to match the new diagram content (transaction lifecycle instead of Stylus learning paths).

- [ ] **Step 2: Commit**

```shell
git add docs/test-interactive-diagrams.mdx
git commit -m "test: point test page to Draw.io transaction lifecycle diagram"
```

---

### Task 6: Verify in dev server

- [ ] **Step 1: Start dev server**

```shell
yarn start --no-open
```

- [ ] **Step 2: Open test page in browser**

Navigate to `http://localhost:3000/test-interactive-diagrams`

Verify:

- Diagram renders with nodes visible
- Node positions match the original Draw.io layout (left-to-right flow)
- Colors are correct: pink (#E3066E) for Sequencer/Batch/STF, blue (#12AAFF) for data nodes, orange (#FF7700) for Delayed Inbox
- Group containers (light blue #9DCCED) contain their child nodes
- Edges connect correctly between nodes
- Dashed edges appear for STF↔State connections
- "Sequenced Txs" label appears near the sequenced transactions group
- No console errors

- [ ] **Step 3: Kill dev server**

```shell
kill $(lsof -ti:3000) 2>/dev/null
```

- [ ] **Step 4: Commit any fixes if needed**

---

### Task 7: Remove Mermaid converter files

**Files:**

- Delete: `src/components/MermaidReactFlow/utils/mermaidToReactFlow.ts`
- Delete: `src/components/MermaidReactFlow/utils/linkParser.ts`

- [ ] **Step 1: Delete old converter files**

```shell
rm src/components/MermaidReactFlow/utils/mermaidToReactFlow.ts
rm src/components/MermaidReactFlow/utils/linkParser.ts
```

- [ ] **Step 2: Verify no remaining imports**

```shell
grep -r "mermaidToReactFlow\|linkParser" src/ --include="*.ts" --include="*.tsx"
```

Expected: No results

- [ ] **Step 3: Verify typecheck passes**

```shell
yarn typecheck 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```shell
git add -u src/components/MermaidReactFlow/utils/
git commit -m "chore: remove Mermaid converter files (replaced by Draw.io converter)"
```
