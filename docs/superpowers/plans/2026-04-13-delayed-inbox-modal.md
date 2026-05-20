# Delayed Inbox Modal Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the zoom-then-navigate behavior on the "Delayed Inbox" node with a modal that renders `haw-ticket-submission.drawio` as an interactive ReactFlow diagram in a centered overlay (90vw × 85vh), leaving the parent diagram dimmed and frozen behind it.

**Architecture:** Add an optional `mode="modal"` attribute on `<transition>` elements in manifest XML. When present, clicking the triggering node opens a portal-rendered modal containing a nested `ReactFlowProvider` + diagram for the target file. When absent, existing zoom/fade behavior stays intact. Close via Esc, backdrop click, or explicit close button; the parent viewport is never mutated so no restoration is needed.

**Tech Stack:** React 18, ReactFlow, Docusaurus 3.6, TypeScript, SCSS, motion/react (already used for fade transitions), native `DOMParser`.

---

## File Structure

- **Modify** `src/components/DrawioReactFlow/types.ts` — add `mode?: 'modal' | 'zoom'` to `TransitionConfig`.
- **Modify** `src/components/DrawioReactFlow/utils/parseManifest.ts` — parse the new `mode` attribute.
- **Modify** `static/diagrams/haw-transaction-lifecycle.manifest.xml` — set `mode="modal"` on the Delayed Inbox transition.
- **Create** `src/components/DrawioReactFlow/DiagramModal.tsx` — portal-based modal that renders a nested `ReactFlow` diagram loaded from a `.drawio` URL.
- **Modify** `src/components/DrawioReactFlow/NavigableDiagram.tsx` — branch on transition `mode` in `handleNodeClick`; render `<DiagramModal>` when active.
- **Modify** `src/css/partials/_drawio-reactflow.scss` — add `.diagram-modal-backdrop` and `.diagram-modal` styles with backdrop blur, centered sizing, and reduced-motion support.

This project has no automated test runner for these UI components (confirmed via repo scan — only `yarn typecheck`, `yarn build`, and manual dev-server verification). Each task ends with `yarn typecheck` + a manual browser check rather than unit tests, matching the existing project conventions in `CLAUDE.md`.

---

### Task 1: Extend TransitionConfig type with `mode`

**Files:**

- Modify: `src/components/DrawioReactFlow/types.ts:18-26`

- [ ] **Step 1: Add `mode` field to `TransitionConfig`**

Replace the existing `TransitionConfig` interface (lines 18-26) with:

```ts
export type TransitionMode = 'zoom' | 'modal';

export interface TransitionConfig {
  fromFile: string;
  trigger: string;
  targetDiagram: string;
  targetFile: string;
  mode: TransitionMode;
  zoom: ZoomConfig;
  pause: PauseConfig;
  fade: FadeConfig;
}
```

`mode` is required (not optional) so every code path handles it explicitly — the parser defaults to `'zoom'` when the attribute is absent.

- [ ] **Step 2: Run typecheck to surface expected breakages**

Run: `yarn typecheck`
Expected: FAIL with errors in `parseManifest.ts` (missing `mode` when constructing `TransitionConfig`). This confirms the type change is propagating; Task 2 fixes it.

- [ ] **Step 3: Commit**

```bash
git add src/components/DrawioReactFlow/types.ts
git commit -m "feat(diagrams): add mode field to TransitionConfig"
```

---

### Task 2: Parse `mode` attribute from manifest XML

**Files:**

- Modify: `src/components/DrawioReactFlow/utils/parseManifest.ts:13-43`

- [ ] **Step 1: Add mode parsing and default**

Replace the body of `parseTransition` (lines 13-43) with:

```ts
function parseTransition(el: Element, diagrams: Map<string, string>): TransitionConfig | null {
  const from = el.getAttribute('from') ?? '';
  const to = el.getAttribute('to') ?? '';
  const trigger = el.getAttribute('trigger') ?? '';
  const fromFile = diagrams.get(from) ?? '';
  const targetFile = diagrams.get(to) ?? '';

  if (!from || !to || !trigger || !fromFile || !targetFile) return null;

  const zoomEl = el.querySelector('zoom');
  const pauseEl = el.querySelector('pause');
  const fadeEl = el.querySelector('fade');

  const rawMode = el.getAttribute('mode');
  const mode: TransitionConfig['mode'] = rawMode === 'modal' ? 'modal' : 'zoom';

  return {
    fromFile,
    trigger,
    targetDiagram: to,
    targetFile,
    mode,
    zoom: {
      level: parseFloat2(zoomEl?.getAttribute('level') ?? null, DEFAULT_ZOOM.level),
      duration: parseFloat2(zoomEl?.getAttribute('duration') ?? null, DEFAULT_ZOOM.duration),
    },
    pause: {
      duration: parseFloat2(pauseEl?.getAttribute('duration') ?? null, DEFAULT_PAUSE.duration),
    },
    fade: {
      duration: parseFloat2(fadeEl?.getAttribute('duration') ?? null, DEFAULT_FADE.duration),
      easing: fadeEl?.getAttribute('easing') ?? DEFAULT_FADE.easing,
    },
  };
}
```

Unknown `mode` values (typos, future values) silently fall back to `'zoom'` — keep existing behavior on malformed input rather than throwing.

- [ ] **Step 2: Run typecheck**

Run: `yarn typecheck`
Expected: PASS (the errors surfaced in Task 1 Step 2 are now resolved).

- [ ] **Step 3: Commit**

```bash
git add src/components/DrawioReactFlow/utils/parseManifest.ts
git commit -m "feat(diagrams): parse mode attribute on transition elements"
```

---

### Task 3: Mark Delayed Inbox transition as modal in manifest

**Files:**

- Modify: `static/diagrams/haw-transaction-lifecycle.manifest.xml:16-24`

- [ ] **Step 1: Add `mode="modal"` to the transition**

Replace the existing `<transition>` block (lines 16-24) with:

```xml
  <transition
    from="transaction-lifecycle"
    to="ticket-submission"
    trigger="Delayed Inbox"
    mode="modal"
  >
    <zoom level="4" duration="1600" />
    <pause duration="200" />
    <fade duration="1500" easing="easeInOut" />
  </transition>
```

The nested `<zoom>`, `<pause>`, `<fade>` elements stay — they're ignored in modal mode but remain valid so the transition can be flipped back to zoom later without re-editing.

- [ ] **Step 2: Commit**

```bash
git add static/diagrams/haw-transaction-lifecycle.manifest.xml
git commit -m "feat(diagrams): configure Delayed Inbox transition as modal"
```

---

### Task 4: Create DiagramModal component

**Files:**

- Create: `src/components/DrawioReactFlow/DiagramModal.tsx`

- [ ] **Step 1: Write the DiagramModal component**

Create `src/components/DrawioReactFlow/DiagramModal.tsx` with:

```tsx
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ReactFlow, { ReactFlowProvider } from 'reactflow';
import { motion, AnimatePresence } from 'motion/react';
import { ClickableNode } from './ClickableNode';
import { SubgraphNode } from './SubgraphNode';
import { ImageNode } from './ImageNode';
import { HoverEdge } from './HoverEdge';
import { convertDrawioToReactFlow } from './utils/drawioToReactFlow';
import { ReactFlowData } from './types';

interface DiagramModalProps {
  diagramFile: string;
  title?: string;
  onClose: () => void;
}

const nodeTypes = { custom: ClickableNode, group: SubgraphNode, image: ImageNode };
const edgeTypes = { hoverEdge: HoverEdge };
const defaultEdgeOptions = {
  style: { strokeWidth: 1.5, stroke: 'rgba(18, 170, 255, 0.6)' },
  animated: false,
};

export function DiagramModal({ diagramFile, title, onClose }: DiagramModalProps) {
  const [flowData, setFlowData] = useState<ReactFlowData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(diagramFile, { signal: controller.signal });
        if (!response.ok) throw new Error(`Failed to load diagram: ${diagramFile}`);
        const xml = await response.text();
        // Nested navigation is disabled inside the modal — pass a no-op handler.
        const data = await convertDrawioToReactFlow(xml, () => undefined, undefined);
        if (!controller.signal.aborted) setFlowData(data);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [diagramFile]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    closeButtonRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="backdrop"
        className="diagram-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="presentation"
      >
        <motion.div
          key="modal"
          className="diagram-modal"
          role="dialog"
          aria-modal="true"
          aria-label={title ?? 'Diagram detail'}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div className="diagram-modal__header">
            {title && <h2 className="diagram-modal__title">{title}</h2>}
            <button
              ref={closeButtonRef}
              type="button"
              className="diagram-modal__close"
              onClick={onClose}
              aria-label="Close diagram"
            >
              ×
            </button>
          </div>
          <div className="diagram-modal__body">
            {loading && <div className="diagram-modal__status">Loading diagram…</div>}
            {error && (
              <div className="diagram-modal__status diagram-modal__status--error">
                Error: {error}
              </div>
            )}
            {!loading && !error && (
              <ReactFlowProvider>
                <ReactFlow
                  nodes={flowData.nodes}
                  edges={flowData.edges}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  defaultEdgeOptions={defaultEdgeOptions}
                  zoomOnScroll
                  zoomOnPinch
                  zoomOnDoubleClick
                  fitView
                  fitViewOptions={{
                    padding: 0.2,
                    includeHiddenNodes: false,
                    minZoom: 0.5,
                    maxZoom: 5,
                  }}
                  attributionPosition="bottom-right"
                />
              </ReactFlowProvider>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
```

Notes for the implementer:

- `createPortal` escapes the parent ReactFlow's transform/stacking context — without it, the modal inherits the parent's zoom.
- Setting `document.body.style.overflow = 'hidden'` prevents the page from scrolling while the modal is open. The previous value is restored on unmount.
- The nested diagram passes a no-op to `convertDrawioToReactFlow` so clicks inside the modal don't trigger further navigation. If you later want nested modals, extend this.

- [ ] **Step 2: Run typecheck**

Run: `yarn typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/DrawioReactFlow/DiagramModal.tsx
git commit -m "feat(diagrams): add DiagramModal component"
```

---

### Task 5: Branch NavigableDiagram on transition mode

**Files:**

- Modify: `src/components/DrawioReactFlow/NavigableDiagram.tsx:1-12` (imports)
- Modify: `src/components/DrawioReactFlow/NavigableDiagram.tsx:23-134` (DiagramFlow internal component)
- Modify: `src/components/DrawioReactFlow/NavigableDiagram.tsx:136-332` (NavigableDiagram wrapper)

- [ ] **Step 1: Update imports**

Replace lines 1-12 with:

```tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactFlow, { ReactFlowProvider, useReactFlow, Node as RFNode, Viewport } from 'reactflow';
import { useColorMode } from '@docusaurus/theme-common';
import { motion, AnimatePresence } from 'motion/react';
import 'reactflow/dist/style.css';
import { ClickableNode } from './ClickableNode';
import { SubgraphNode } from './SubgraphNode';
import { ImageNode } from './ImageNode';
import { HoverEdge } from './HoverEdge';
import { DiagramModal } from './DiagramModal';
import { convertDrawioToReactFlow } from './utils/drawioToReactFlow';
import { fetchAndParseManifest } from './utils/parseManifest';
import { ReactFlowData, DiagramProps, NodeData, ManifestData, TransitionConfig } from './types';
```

- [ ] **Step 2: Extend DiagramFlow props and surface modal requests**

Replace the `DiagramFlow` function signature and `handleNodeClick` (lines 23-85) with:

```tsx
function DiagramFlow({
  flowData,
  nodeTypes,
  edgeTypes,
  defaultEdgeOptions,
  onDiagramNavigate,
  onModalRequest,
  transitions,
  hoverContent,
}: {
  flowData: ReactFlowData;
  nodeTypes: Record<string, React.ComponentType<any>>;
  edgeTypes: Record<string, React.ComponentType<any>>;
  defaultEdgeOptions: Record<string, any>;
  onDiagramNavigate?: (diagramPath: string) => void;
  onModalRequest?: (transition: TransitionConfig) => void;
  transitions?: TransitionConfig[];
  hoverContent?: Record<string, React.ComponentType>;
}) {
  const { setCenter, setViewport, getViewport } = useReactFlow();
  const viewportHistory = useRef<Viewport[]>([]);
  const pendingNavTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    return () => {
      if (pendingNavTimer.current !== null) {
        clearTimeout(pendingNavTimer.current);
      }
    };
  }, []);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: RFNode<NodeData>) => {
      if (!node.data?.centerable) return;

      const transConfig = transitions?.find((t) => t.trigger === node.data?.label);

      if (transConfig?.mode === 'modal' && onModalRequest) {
        onModalRequest(transConfig);
        return;
      }

      viewportHistory.current.push(getViewport());
      setCanGoBack(true);

      const nodeWidth = (node.style?.width as number) || node.width || 100;
      const nodeHeight = (node.style?.height as number) || node.height || 50;
      const x = node.position.x + nodeWidth / 2;
      const y = node.position.y + nodeHeight / 2;

      const zoomLevel = transConfig?.zoom.level ?? 4;
      const zoomDuration = transConfig?.zoom.duration ?? 1600;
      const pauseDuration = transConfig?.pause.duration ?? 200;

      setCenter(x, y, { zoom: zoomLevel, duration: zoomDuration });

      if (pendingNavTimer.current !== null) {
        clearTimeout(pendingNavTimer.current);
        pendingNavTimer.current = null;
      }

      if (node.data?.navigateTo && onDiagramNavigate) {
        pendingNavTimer.current = setTimeout(() => {
          pendingNavTimer.current = null;
          onDiagramNavigate(node.data.navigateTo!);
        }, zoomDuration + pauseDuration);
      }
    },
    [setCenter, getViewport, onDiagramNavigate, onModalRequest, transitions],
  );
```

Keep the rest of the `DiagramFlow` body (`handleGoBack`, the JSX return) unchanged.

- [ ] **Step 3: Thread onModalRequest through the DiagramFlow render**

In the `<DiagramFlow ... />` element inside `NavigableDiagram`'s return (around line 318), add the new prop. Locate:

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

Replace with:

```tsx
<DiagramFlow
  flowData={flowData}
  nodeTypes={nodeTypes}
  edgeTypes={edgeTypes}
  defaultEdgeOptions={defaultEdgeOptions}
  onDiagramNavigate={handleNavigate}
  onModalRequest={handleModalRequest}
  transitions={currentTransitions}
  hoverContent={hoverContent}
/>
```

- [ ] **Step 4: Add modal state and render in NavigableDiagram**

Inside the `NavigableDiagram` function, after the existing `const [error, setError] = useState<string | null>(null);` (around line 149), add:

```tsx
const [modalTransition, setModalTransition] = useState<TransitionConfig | null>(null);

const handleModalRequest = useCallback((transition: TransitionConfig) => {
  setModalTransition(transition);
}, []);

const handleModalClose = useCallback(() => {
  setModalTransition(null);
}, []);
```

Then, inside the outer return block of `NavigableDiagram` (after the `</AnimatePresence>` closing tag, still inside the `.drawio-reactflow-container` div), add the modal render:

```tsx
{
  modalTransition && (
    <DiagramModal
      diagramFile={modalTransition.targetFile}
      title={modalTransition.trigger}
      onClose={handleModalClose}
    />
  );
}
```

The resulting closing structure of that return should look like:

```tsx
      <AnimatePresence mode="wait">
        <motion.div
          key={currentDiagram}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          style={{ width: '100%', height: '100%' }}
        >
          <ReactFlowProvider>
            <DiagramFlow
              flowData={flowData}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              onDiagramNavigate={handleNavigate}
              onModalRequest={handleModalRequest}
              transitions={currentTransitions}
              hoverContent={hoverContent}
            />
          </ReactFlowProvider>
        </motion.div>
      </AnimatePresence>
      {modalTransition && (
        <DiagramModal
          diagramFile={modalTransition.targetFile}
          title={modalTransition.trigger}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run typecheck**

Run: `yarn typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/DrawioReactFlow/NavigableDiagram.tsx
git commit -m "feat(diagrams): render DiagramModal for modal-mode transitions"
```

---

### Task 6: Add modal styles

**Files:**

- Modify: `src/css/partials/_drawio-reactflow.scss` (append after the existing `@media (prefers-reduced-motion: reduce)` block, end of file)

- [ ] **Step 1: Append modal CSS**

Append the following styles to the end of `src/css/partials/_drawio-reactflow.scss`:

```scss
// Diagram modal — full-screen overlay rendering a nested ReactFlow diagram
.diagram-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(8, 10, 22, 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  padding: 2vh 5vw;
}

.diagram-modal {
  position: relative;
  width: min(90vw, 1600px);
  height: 85vh;
  display: flex;
  flex-direction: column;
  background-color: #1a1a2e;
  background-image: url('/diagrams/diagram-background.svg');
  background-size: cover;
  background-position: center;
  border: 1px solid rgba(18, 170, 255, 0.35);
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.55);
  overflow: hidden;
}

.diagram-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 20px;
  background-color: rgba(18, 170, 255, 0.08);
  border-bottom: 1px solid rgba(18, 170, 255, 0.2);
}

.diagram-modal__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0.01em;
}

.diagram-modal__close {
  appearance: none;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  width: 32px;
  height: 32px;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 150ms ease, transform 150ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.18);
  }

  &:focus-visible {
    outline: 2px solid #12aaff;
    outline-offset: 2px;
  }
}

.diagram-modal__body {
  flex: 1 1 auto;
  position: relative;
  min-height: 0;

  .react-flow {
    width: 100%;
    height: 100%;
  }
}

.diagram-modal__status {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.diagram-modal__status--error {
  color: var(--ifm-color-danger);
}

// Responsive — smaller viewports get a tighter modal
@media (max-width: 768px) {
  .diagram-modal-backdrop {
    padding: 0;
  }

  .diagram-modal {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    border: none;
  }

  .diagram-modal__title {
    font-size: 14px;
  }
}

// Reduced motion — suppress backdrop blur animation
@media (prefers-reduced-motion: reduce) {
  .diagram-modal-backdrop,
  .diagram-modal {
    transition: none;
  }
}
```

- [ ] **Step 2: Run typecheck (sanity)**

Run: `yarn typecheck`
Expected: PASS (CSS changes don't affect TS but run anyway to confirm nothing else drifted).

- [ ] **Step 3: Commit**

```bash
git add src/css/partials/_drawio-reactflow.scss
git commit -m "feat(diagrams): style DiagramModal overlay and header"
```

---

### Task 7: Manual verification in dev server

**Files:** None — runtime verification only.

- [ ] **Step 1: Start the dev server**

Run: `yarn start --no-open`
Expected: "Docusaurus website is running at: http://localhost:3000/" without compile errors.

- [ ] **Step 2: Open the diagram page in a browser**

Navigate to the page that renders `haw-transaction-lifecycle.manifest.xml` (search the repo for `haw-transaction-lifecycle.manifest.xml` references in `.mdx` files if unclear). Confirm the transaction lifecycle diagram loads.

- [ ] **Step 3: Golden-path check — click Delayed Inbox**

Click the "Delayed Inbox" node.
Expected:

- Modal fades in (backdrop + scale) within ~250ms.
- `haw-ticket-submission.drawio` renders inside as an interactive ReactFlow diagram.
- Page body does not scroll when the mouse wheel is used over the backdrop.
- The parent diagram is visible but dimmed behind the blurred backdrop.
- No zoom/pan animation fires on the parent diagram.

- [ ] **Step 4: Close paths**

Verify all three close methods:

- Press `Esc` → modal closes, parent diagram unchanged.
- Click the backdrop (outside the modal card) → modal closes.
- Click the `×` button → modal closes.

After each close, the parent viewport should be exactly where it was before opening (no drift).

- [ ] **Step 5: Regression check — other transitions still zoom**

If the page has other nodes with transitions that do NOT use `mode="modal"` (none currently in `haw-transaction-lifecycle.manifest.xml`, but check any other manifest files in `static/diagrams/`), confirm they still zoom/fade as before.

Run: `ls static/diagrams/*.manifest.xml`
For each additional manifest, load the page that uses it and click a transition node.

- [ ] **Step 6: Shut down the dev server**

Kill the process on port 3000 (per project convention in `CLAUDE.md`).

- [ ] **Step 7: Commit (only if the manual test required a tweak)**

If verification exposed a bug and a fix was applied, commit it:

```bash
git add <fixed-files>
git commit -m "fix(diagrams): <describe the fix>"
```

Otherwise skip the commit — no code changed in this task.

---

## Self-Review Notes

- **Spec coverage:** Modal content (interactive ReactFlow) ✓ Task 4. All navigateTo transitions via mode attribute ✓ Tasks 1-3. Dimmed backdrop + frozen background ✓ Tasks 4, 6 (body overflow lock + backdrop blur). Manifest-driven ✓ Tasks 1-3. Close methods (Esc, backdrop, button) ✓ Task 4. Return to prior viewport ✓ Task 5 (modal never mutates the parent `setCenter`). 90vw × 85vh centered ✓ Task 6.
- **Placeholders:** None. Every code block is complete.
- **Type consistency:** `TransitionConfig.mode` required in types.ts; parser always sets it; consumer (`handleNodeClick`) reads `transConfig?.mode`. `DiagramModal` props (`diagramFile`, `title`, `onClose`) match the call site in `NavigableDiagram`.
- **Known limitation:** Nested modals are disabled inside the modal's ReactFlow (the `convertDrawioToReactFlow` callback is a no-op). If future diagrams need nested navigation, pass a real handler.
