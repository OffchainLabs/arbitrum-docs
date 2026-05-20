# Diagram Hover Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a general-purpose hover modal to DrawioReactFlow diagrams so any Draw.io cell annotated with `hoverContent` displays a floating modal with MDX partial content on hover.

**Architecture:** The Draw.io XML converter extracts `hoverContent` properties from cells and stores them on node/edge data. A new `DiagramHoverModal` component wraps hoverable elements using `@floating-ui/react`. Content is passed as React components via a `hoverContent` prop on the `DrawioReactFlow` component. A new custom edge type `HoverEdge` handles edge labels with hover content.

**Tech Stack:** React, ReactFlow, @floating-ui/react (already installed), SCSS, TypeScript

**Spec:** `docs/superpowers/specs/2026-04-07-diagram-hover-modal-design.md`

---

## File Structure

| File                                                        | Action | Responsibility                                                    |
| ----------------------------------------------------------- | ------ | ----------------------------------------------------------------- |
| `src/components/DrawioReactFlow/types.ts`                   | Modify | Add `hoverContentKey` to NodeData, `hoverContent` to DiagramProps |
| `src/components/DrawioReactFlow/utils/drawioToReactFlow.ts` | Modify | Extract `hoverContent` from cells, store on nodes/edges           |
| `src/components/DrawioReactFlow/DiagramHoverModal.tsx`      | Create | Shared hover modal using @floating-ui/react + MDXProvider         |
| `src/components/DrawioReactFlow/ClickableNode.tsx`          | Modify | Wrap label in hover trigger when hoverContentKey is set           |
| `src/components/DrawioReactFlow/HoverEdge.tsx`              | Create | Custom edge type with hoverable label                             |
| `src/components/DrawioReactFlow/NavigableDiagram.tsx`       | Modify | Thread hoverContent prop, register HoverEdge type                 |
| `src/components/DrawioReactFlow/index.tsx`                  | Modify | Pass hoverContent prop through                                    |
| `src/css/partials/_diagram-hover-modal.scss`                | Create | Modal styling (glassmorphic, dark mode, responsive)               |
| `src/css/custom.scss`                                       | Modify | Import new SCSS partial                                           |
| `static/diagrams/haw-transaction-lifecycle.drawio`          | Modify | Add hoverContent to Retryable ticket cell                         |
| `docs/test-interactive-diagrams.mdx`                        | Modify | Add hoverContent prop with test content                           |

---

### Task 1: Add types

**Files:**

- Modify: `src/components/DrawioReactFlow/types.ts`

- [ ] **Step 1: Add hoverContentKey to NodeData and update DiagramProps**

In `src/components/DrawioReactFlow/types.ts`, add `hoverContentKey` to `NodeData` and `hoverContent` to `DiagramProps`:

```typescript
// Add to NodeData interface (after onNavigate):
  hoverContentKey?: string;

// Add to DiagramProps interface (after className):
  hoverContent?: Record<string, React.ComponentType>;

// Add React import at top:
import React from 'react';
```

The full updated `NodeData`:

```typescript
export interface NodeData {
  label: string;
  shape: string;
  colors: {
    backgroundColor: string;
    borderColor: string;
  };
  link?: string;
  centerable?: boolean;
  navigateTo?: string;
  topAligned?: boolean;
  onNavigate?: (link: string) => void;
  hoverContentKey?: string;
}
```

The full updated `DiagramProps`:

```typescript
export interface DiagramProps {
  diagramFile?: string;
  manifest?: string;
  height?: string;
  className?: string;
  hoverContent?: Record<string, React.ComponentType>;
}
```

- [ ] **Step 2: Add EdgeData interface**

Add a new interface for edge data that can carry hover content:

```typescript
export interface EdgeData {
  hoverContentKey?: string;
}
```

- [ ] **Step 3: Run typecheck**

Run: `yarn typecheck`
Expected: PASS (no consumers use the new optional fields yet)

- [ ] **Step 4: Commit**

```shell
git add src/components/DrawioReactFlow/types.ts
git commit -m "feat: add hover content types to DrawioReactFlow"
```

---

### Task 2: Extract hoverContent from Draw.io XML

**Files:**

- Modify: `src/components/DrawioReactFlow/utils/drawioToReactFlow.ts`

- [ ] **Step 1: Update DrawioCell interface to include hoverContent**

In `drawioToReactFlow.ts`, add `hoverContent` to the `DrawioCell` interface:

```typescript
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
  hoverContent: string; // <-- add this
  x: number;
  y: number;
  width: number;
  height: number;
}
```

- [ ] **Step 2: Parse hoverContent from XML in parseCells**

In the `parseCells` function, extract `hoverContent` from either the cell's direct attributes or its parent `UserObject` element. Update the cell push inside the for-loop:

```typescript
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
      x: parseFloat(geo?.getAttribute('x') ?? '0'),
      y: parseFloat(geo?.getAttribute('y') ?? '0'),
      width: parseFloat(geo?.getAttribute('width') ?? '0'),
      height: parseFloat(geo?.getAttribute('height') ?? '0'),
    });
  }

  return cells;
}
```

- [ ] **Step 3: Store hoverContentKey on nodes in buildNodes**

In `buildNodes`, when creating `nodeData` for custom nodes (around line 368), add:

```typescript
const nodeData: NodeData = {
  label,
  shape,
  colors: {
    backgroundColor: fillColor,
    borderColor: strokeColor,
  },
  centerable: isBlinking || undefined,
  navigateTo: transitions?.find((t) => t.trigger === label)?.targetFile || undefined,
  topAligned: hasTopAlignedLabel(cell.value) || undefined,
  onNavigate,
  hoverContentKey: cell.hoverContent || undefined,
};
```

- [ ] **Step 4: Store hoverContentKey on edges in buildEdges**

In `buildEdges`, update the `findEdgeLabelText` function to also return the hoverContent if present on the edge label cell. Create a new helper:

```typescript
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
```

Then update the edge creation in `buildEdges` to use this and store data on the edge:

```typescript
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
```

- [ ] **Step 5: Run typecheck**

Run: `yarn typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```shell
git add src/components/DrawioReactFlow/utils/drawioToReactFlow.ts
git commit -m "feat: extract hoverContent property from Draw.io XML"
```

---

### Task 3: Create DiagramHoverModal component

**Files:**

- Create: `src/components/DrawioReactFlow/DiagramHoverModal.tsx`

- [ ] **Step 1: Create the DiagramHoverModal component**

Create `src/components/DrawioReactFlow/DiagramHoverModal.tsx`:

```tsx
import React, { useState } from 'react';
import {
  useFloating,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  offset,
  flip,
  shift,
  autoUpdate,
  useMergeRefs,
} from '@floating-ui/react';
import { MDXProvider } from '@mdx-js/react';

const mdxComponents = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="diagram-hover-modal__title">{children}</h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="diagram-hover-modal__subtitle">{children}</h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="diagram-hover-modal__heading3">{children}</h3>
  ),
  h4: ({ children }: { children: React.ReactNode }) => (
    <h4 className="diagram-hover-modal__heading4">{children}</h4>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="diagram-hover-modal__paragraph">{children}</p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="diagram-hover-modal__list">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="diagram-hover-modal__list">{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="diagram-hover-modal__list-item">{children}</li>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="diagram-hover-modal__strong">{children}</strong>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <code className="diagram-hover-modal__inline-code">{children}</code>
  ),
  a: ({ children, href }: { children: React.ReactNode; href?: string }) => (
    <a href={href} className="diagram-hover-modal__link" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

interface DiagramHoverModalProps {
  ContentComponent: React.ComponentType;
  children: React.ReactNode;
}

export function DiagramHoverModal({ ContentComponent, children }: DiagramHoverModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(10), flip({ fallbackAxisSideDirection: 'start' }), shift({ padding: 5 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    move: false,
    delay: { open: 150, close: 150 },
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'dialog' });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  const ref = useMergeRefs([refs.setReference]);

  return (
    <>
      <span ref={ref} className="diagram-hover-modal__trigger" {...getReferenceProps()}>
        {children}
      </span>

      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="diagram-hover-modal__content"
            {...getFloatingProps()}
          >
            <div className="diagram-hover-modal__header">
              <button
                className="diagram-hover-modal__close"
                onClick={() => setIsOpen(false)}
                aria-label="Close modal"
              >
                x
              </button>
            </div>
            <div className="diagram-hover-modal__body">
              <MDXProvider components={mdxComponents}>
                <ContentComponent />
              </MDXProvider>
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `yarn typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```shell
git add src/components/DrawioReactFlow/DiagramHoverModal.tsx
git commit -m "feat: add DiagramHoverModal component with floating-ui"
```

---

### Task 4: Create SCSS styling for hover modal

**Files:**

- Create: `src/css/partials/_diagram-hover-modal.scss`
- Modify: `src/css/custom.scss`

- [ ] **Step 1: Create the SCSS partial**

Create `src/css/partials/_diagram-hover-modal.scss`:

```scss
// Diagram Hover Modal — Arbitrum glassmorphic style
// Hover-triggered floating modal for diagram cell annotations

.diagram-hover-modal__trigger {
  border-bottom: 1px dotted rgba(18, 170, 255, 0.6);
  cursor: pointer;
  transition: border-color var(--arbitrum-transition-normal, 0.2s ease);

  &:hover {
    border-bottom-color: rgba(18, 170, 255, 1);
  }
}

.diagram-hover-modal__content {
  background: rgba(33, 49, 71, 0.95);
  border: 1px solid rgba(18, 170, 255, 0.3);
  border-radius: 0;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(18, 170, 255, 0.1);
  backdrop-filter: blur(12px);
  max-width: 500px;
  max-height: 60vh;
  min-width: 320px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--arbitrum-font-family, var(--ifm-font-family-base));
}

.diagram-hover-modal__header {
  display: flex;
  justify-content: flex-end;
  padding: 6px 10px 0;
  flex-shrink: 0;
}

.diagram-hover-modal__close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: rgba(157, 204, 237, 0.6);
  padding: 4px 8px;
  border-radius: 0;
  transition: all var(--arbitrum-transition-normal, 0.2s ease);
  font-family: var(--arbitrum-font-family, var(--ifm-font-family-base));

  &:hover {
    color: #ffffff;
    background: rgba(18, 170, 255, 0.15);
  }
}

.diagram-hover-modal__body {
  padding: 0 20px 20px;
  overflow-y: auto;
  flex: 1;
  color: #ffffff;
}

// MDX content elements
.diagram-hover-modal__title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #ffffff;
}

.diagram-hover-modal__subtitle {
  font-size: 17px;
  font-weight: 600;
  margin: 16px 0 8px 0;
  color: #9dcced;
}

.diagram-hover-modal__heading3 {
  font-size: 15px;
  font-weight: 600;
  margin: 14px 0 6px 0;
  color: #9dcced;
}

.diagram-hover-modal__heading4 {
  font-size: 14px;
  font-weight: 600;
  margin: 12px 0 6px 0;
  color: rgba(157, 204, 237, 0.8);
}

.diagram-hover-modal__paragraph {
  margin: 0 0 12px 0;
  line-height: 1.6;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}

.diagram-hover-modal__list {
  margin: 0 0 12px 0;
  padding-left: 18px;
}

.diagram-hover-modal__list-item {
  margin-bottom: 6px;
  line-height: 1.5;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}

.diagram-hover-modal__strong {
  font-weight: 600;
  color: #ffffff;
}

.diagram-hover-modal__inline-code {
  background: rgba(18, 170, 255, 0.1);
  border: 1px solid rgba(18, 170, 255, 0.2);
  padding: 1px 5px;
  border-radius: 0;
  font-family: var(--arbitrum-mono-font, var(--ifm-font-family-monospace));
  font-size: 0.85em;
  color: rgba(18, 170, 255, 0.9);
}

.diagram-hover-modal__link {
  color: rgba(18, 170, 255, 0.9);
  text-decoration: underline;
  text-decoration-color: rgba(18, 170, 255, 0.4);

  &:hover {
    color: #12aaff;
    text-decoration-color: #12aaff;
  }
}

// Scrollbar
.diagram-hover-modal__body::-webkit-scrollbar {
  width: 6px;
}

.diagram-hover-modal__body::-webkit-scrollbar-track {
  background: transparent;
}

.diagram-hover-modal__body::-webkit-scrollbar-thumb {
  background: rgba(18, 170, 255, 0.2);
  border-radius: 0;

  &:hover {
    background: rgba(18, 170, 255, 0.4);
  }
}

// Responsive
@media (max-width: 768px) {
  .diagram-hover-modal__content {
    min-width: 280px;
    max-width: calc(100vw - 32px);
    max-height: 50vh;
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .diagram-hover-modal__trigger,
  .diagram-hover-modal__close {
    transition: none;
  }
}
```

- [ ] **Step 2: Import in custom.scss**

In `src/css/custom.scss`, add after the `_drawio-reactflow.scss` import (line 16):

```scss
@use './partials/_diagram-hover-modal.scss';
```

- [ ] **Step 3: Commit**

```shell
git add src/css/partials/_diagram-hover-modal.scss src/css/custom.scss
git commit -m "style: add Arbitrum glassmorphic hover modal styling"
```

---

### Task 5: Update ClickableNode with hover support

**Files:**

- Modify: `src/components/DrawioReactFlow/ClickableNode.tsx`

- [ ] **Step 1: Add hover modal integration to ClickableNode**

Replace the full contents of `src/components/DrawioReactFlow/ClickableNode.tsx`:

```tsx
import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { NodeData } from './types';
import { DiagramHoverModal } from './DiagramHoverModal';

export function ClickableNode({ data }: NodeProps<NodeData>) {
  const {
    label,
    shape,
    colors,
    link,
    centerable,
    onNavigate,
    hoverContentKey,
    hoverContentComponent,
  } = data;
  const isClickable = !!link || !!centerable;

  const handleClick = () => {
    if (link && onNavigate) {
      onNavigate(link);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      if (link && onNavigate) {
        onNavigate(link);
      }
    }
  };

  const baseStyle: React.CSSProperties = {
    cursor: isClickable ? 'pointer' : 'default',
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    ...(data.topAligned ? { alignItems: 'flex-start', paddingTop: '4px' } : {}),
  };

  let shapeStyle: React.CSSProperties = {};
  if (shape === 'diamond') {
    shapeStyle = {
      transform: 'rotate(45deg)',
    };
  }

  const contentStyle: React.CSSProperties =
    shape === 'diamond' ? { transform: 'rotate(-45deg)' } : {};

  const labelContent = hoverContentComponent ? (
    <DiagramHoverModal ContentComponent={hoverContentComponent}>{label}</DiagramHoverModal>
  ) : (
    label
  );

  return (
    <div
      className={`custom-node ${isClickable ? 'node-clickable' : 'node-static'} shape-${shape}`}
      style={{ ...baseStyle, ...shapeStyle }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : -1}
      aria-label={isClickable ? `Navigate to ${link || label}` : label}
    >
      <Handle id="top-target" type="target" position={Position.Top} />
      <Handle id="top-source" type="source" position={Position.Top} />
      <Handle id="right-target" type="target" position={Position.Right} />
      <Handle id="right-source" type="source" position={Position.Right} />
      <Handle id="bottom-target" type="target" position={Position.Bottom} />
      <Handle id="bottom-source" type="source" position={Position.Bottom} />
      <Handle id="left-target" type="target" position={Position.Left} />
      <Handle id="left-source" type="source" position={Position.Left} />

      <div className="node-content" style={contentStyle}>
        {labelContent}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update NodeData type to include resolved component**

In `src/components/DrawioReactFlow/types.ts`, add `hoverContentComponent` to `NodeData`:

```typescript
export interface NodeData {
  label: string;
  shape: string;
  colors: {
    backgroundColor: string;
    borderColor: string;
  };
  link?: string;
  centerable?: boolean;
  navigateTo?: string;
  topAligned?: boolean;
  onNavigate?: (link: string) => void;
  hoverContentKey?: string;
  hoverContentComponent?: React.ComponentType;
}
```

- [ ] **Step 3: Run typecheck**

Run: `yarn typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```shell
git add src/components/DrawioReactFlow/ClickableNode.tsx src/components/DrawioReactFlow/types.ts
git commit -m "feat: add hover modal support to ClickableNode"
```

---

### Task 6: Create HoverEdge component

**Files:**

- Create: `src/components/DrawioReactFlow/HoverEdge.tsx`

- [ ] **Step 1: Create the HoverEdge component**

Create `src/components/DrawioReactFlow/HoverEdge.tsx`:

```tsx
import React from 'react';
import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer, MarkerType } from 'reactflow';
import { DiagramHoverModal } from './DiagramHoverModal';
import { EdgeData } from './types';

export function HoverEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  style = {},
  markerEnd,
  data,
}: EdgeProps<EdgeData>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const ContentComponent = data?.hoverContentComponent;

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={style}
        markerEnd={markerEnd as string}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="react-flow__edge-label nodrag nopan"
          >
            {ContentComponent ? (
              <DiagramHoverModal ContentComponent={ContentComponent}>
                <span className="diagram-hover-modal__trigger">{label}</span>
              </DiagramHoverModal>
            ) : (
              <span>{label}</span>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
```

- [ ] **Step 2: Update EdgeData type to include resolved component**

In `src/components/DrawioReactFlow/types.ts`, update `EdgeData`:

```typescript
export interface EdgeData {
  hoverContentKey?: string;
  hoverContentComponent?: React.ComponentType;
}
```

- [ ] **Step 3: Run typecheck**

Run: `yarn typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```shell
git add src/components/DrawioReactFlow/HoverEdge.tsx src/components/DrawioReactFlow/types.ts
git commit -m "feat: add HoverEdge custom edge type with hoverable labels"
```

---

### Task 7: Wire everything through NavigableDiagram and index

**Files:**

- Modify: `src/components/DrawioReactFlow/NavigableDiagram.tsx`
- Modify: `src/components/DrawioReactFlow/index.tsx`

- [ ] **Step 1: Update NavigableDiagram to thread hoverContent**

In `src/components/DrawioReactFlow/NavigableDiagram.tsx`, make these changes:

1. Import `HoverEdge`:

```typescript
import { HoverEdge } from './HoverEdge';
```

2. Update `DiagramFlow` props to include `hoverContent`:

```typescript
function DiagramFlow({
  flowData,
  nodeTypes,
  edgeTypes,
  defaultEdgeOptions,
  onDiagramNavigate,
  transitions,
  hoverContent,
}: {
  flowData: ReactFlowData;
  nodeTypes: Record<string, React.ComponentType<any>>;
  edgeTypes: Record<string, React.ComponentType<any>>;
  defaultEdgeOptions: Record<string, any>;
  onDiagramNavigate?: (diagramPath: string) => void;
  transitions?: TransitionConfig[];
  hoverContent?: Record<string, React.ComponentType>;
}) {
```

3. Add `edgeTypes` to the `ReactFlow` component props:

```tsx
      <ReactFlow
        nodes={flowData.nodes}
        edges={flowData.edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
```

4. In `NavigableDiagram`, add `edgeTypes` to the memos:

```typescript
const edgeTypes = useMemo(() => ({ hoverEdge: HoverEdge }), []);
```

5. After `setFlowData(data)` in the diagram loading effect (around line 209), resolve hover content components onto nodes and edges:

```typescript
if (!controller.signal.aborted) {
  // Resolve hover content components onto nodes and edges
  if (hoverContent) {
    for (const node of data.nodes) {
      const key = node.data?.hoverContentKey;
      if (key && hoverContent[key]) {
        node.data.hoverContentComponent = hoverContent[key];
      }
    }
    for (const edge of data.edges) {
      const key = (edge.data as any)?.hoverContentKey;
      if (key && hoverContent[key]) {
        (edge.data as any).hoverContentComponent = hoverContent[key];
      }
    }
  }
  setFlowData(data);
}
```

6. Pass `edgeTypes` and `hoverContent` to `DiagramFlow`:

```tsx
<DiagramFlow
  flowData={flowData}
  nodeTypes={nodeTypes}
  edgeTypes={edgeTypes}
  defaultEdgeOptions={defaultEdgeOptions}
  onDiagramNavigate={handleNavigate}
  transitions={currentTransitions}
  hoverContent={hoverContent}
/>
```

7. Add `hoverContent` to the `NavigableDiagram` destructuring and the `useEffect` dependency:

```typescript
export function NavigableDiagram({ diagramFile, manifest, height, className = '', hoverContent }: DiagramProps) {
```

And in the useEffect deps for diagram loading:

```typescript
  }, [currentDiagram, handleNavigate, manifestData, hoverContent]);
```

- [ ] **Step 2: Update index.tsx to pass hoverContent**

The `index.tsx` already spreads all props via `{...props}`, and `DrawioReactFlowProps` is aliased from `DiagramProps` which now includes `hoverContent`. No code change needed — verify this is the case:

```typescript
export default function DrawioReactFlow(props: DrawioReactFlowProps) {
  // ...
  return <NavigableDiagram {...props} />;
}
```

This already passes `hoverContent` through.

- [ ] **Step 3: Run typecheck**

Run: `yarn typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```shell
git add src/components/DrawioReactFlow/NavigableDiagram.tsx
git commit -m "feat: thread hoverContent through NavigableDiagram and register HoverEdge"
```

---

### Task 8: Annotate Draw.io diagram and update test page

**Files:**

- Modify: `static/diagrams/haw-transaction-lifecycle.drawio`
- Modify: `docs/test-interactive-diagrams.mdx`

- [ ] **Step 1: Add hoverContent attribute to the Retryable ticket edge label**

In `static/diagrams/haw-transaction-lifecycle.drawio`, find the cell with id `6NfKEzJwxauIzdHuD7z6-2` (the "Retryable ticket" edge label). Add `hoverContent="_retryable-tickets-partial"` as an attribute:

Change:

```xml
<mxCell id="6NfKEzJwxauIzdHuD7z6-2" connectable="0" parent="h0HYC7DYlS54HPNchKno-4" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" value="&lt;font style=&quot;font-size: 15px;&quot;&gt;Retryable ticket&lt;/font&gt;" vertex="1">
```

To:

```xml
<mxCell id="6NfKEzJwxauIzdHuD7z6-2" connectable="0" parent="h0HYC7DYlS54HPNchKno-4" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" value="&lt;font style=&quot;font-size: 15px;&quot;&gt;Retryable ticket&lt;/font&gt;" hoverContent="_retryable-tickets-partial" vertex="1">
```

- [ ] **Step 2: Update the test page to pass hoverContent**

In `docs/test-interactive-diagrams.mdx`, update:

```mdx
---
id: test-interactive-diagrams
title: 'Interactive Diagram Test'
description: 'Test page for click-through interactive diagrams'
---

import DrawioReactFlow from '@site/src/components/DrawioReactFlow';
import RetryableTicketsPartial from './how-arbitrum-works/partials/_retryable-tickets-partial.mdx';

This page demonstrates interactive diagrams rendered from Draw.io files. The diagram below shows the Arbitrum transaction lifecycle.

## Transaction Lifecycle

The diagram below shows how transactions flow through the Arbitrum system. Hover over "Retryable ticket" to see details.

<DrawioReactFlow
  manifest="/diagrams/haw-transaction-lifecycle.manifest.xml"
  hoverContent={{ '_retryable-tickets-partial': RetryableTicketsPartial }}
/>

## Features

- **Theme-aware**: Diagrams adapt to light/dark mode
- **Exact layout**: Positions and colors match the original Draw.io file
- **Responsive**: Zoom and pan to explore the diagram
- **Hover modals**: Hover over annotated elements to see detailed content
```

- [ ] **Step 3: Verify with dev server**

Run: `rm -rf .docusaurus && yarn start --no-open`

Open `http://localhost:3000/test-interactive-diagrams` and hover over the "Retryable ticket" edge label. A glassmorphic modal should appear with the partial content.

- [ ] **Step 4: Run typecheck**

Run: `yarn typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```shell
git add static/diagrams/haw-transaction-lifecycle.drawio docs/test-interactive-diagrams.mdx
git commit -m "feat: annotate Retryable ticket cell and wire up test page with hover content"
```
