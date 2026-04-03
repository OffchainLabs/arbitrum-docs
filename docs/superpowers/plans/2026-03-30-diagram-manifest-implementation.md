# Diagram Story Manifest Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `navigateMap` prop with a manifest XML file that serves as single source of truth for multi-diagram transition stories.

**Architecture:** New `parseManifest.ts` utility fetches and parses manifest XML into typed data. `NavigableDiagram` gains a `manifest` prop; when provided, it fetches the manifest on mount, derives `entryDiagram`, `navigateMap`, and animation params, then feeds them into the existing transition system. `DiagramFlow` reads animation params from manifest data instead of hardcoded values.

**Tech Stack:** DOMParser (browser XML parsing), React state, existing ReactFlow + motion/react transition system.

---

### File Structure

| File                                                         | Action | Responsibility                                                                  |
| ------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------- |
| `src/components/MermaidReactFlow/types.ts`                   | Modify | Add manifest types, add `manifest` prop to `DiagramProps`, remove `navigateMap` |
| `src/components/MermaidReactFlow/utils/parseManifest.ts`     | Create | Fetch + parse manifest XML → typed `ManifestData`                               |
| `src/components/MermaidReactFlow/NavigableDiagram.tsx`       | Modify | Accept `manifest` prop, load manifest, derive navigate map + animation config   |
| `src/components/MermaidReactFlow/utils/drawioToReactFlow.ts` | Modify | Remove `navigateMap` param, accept `transitionConfig` instead                   |
| `docs/test-interactive-diagrams.mdx`                         | Modify | Switch from `navigateMap` to `manifest` prop                                    |

---

### Task 1: Add manifest types to types.ts

**Files:**

- Modify: `src/components/MermaidReactFlow/types.ts`

- [ ] **Step 1: Update types.ts**

Replace the current contents with:

```typescript
import { Node, Edge } from 'reactflow';

export interface ZoomConfig {
  level: number;
  duration: number;
}

export interface PauseConfig {
  duration: number;
}

export interface FadeConfig {
  duration: number;
  easing: string;
}

export interface TransitionConfig {
  fromFile: string;
  trigger: string;
  targetDiagram: string;
  targetFile: string;
  zoom: ZoomConfig;
  pause: PauseConfig;
  fade: FadeConfig;
}

export interface ManifestData {
  id: string;
  title: string;
  entryDiagramFile: string;
  diagrams: Map<string, string>;
  transitions: TransitionConfig[];
}

export interface DiagramProps {
  diagramFile?: string;
  manifest?: string;
  height?: string;
  className?: string;
}

// Backward compat alias so existing MDX imports still work
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
  centerable?: boolean;
  navigateTo?: string;
  topAligned?: boolean;
  onNavigate?: (link: string) => void;
}
```

Key changes: added `ZoomConfig`, `PauseConfig`, `FadeConfig`, `TransitionConfig`, `ManifestData`. Replaced `navigateMap` with `manifest` on `DiagramProps`. Made `diagramFile` optional (manifest provides it).

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -v NavigableDiagram`

Expected: errors in NavigableDiagram and drawioToReactFlow (they still reference `navigateMap`). That's expected — we'll fix them in subsequent tasks.

- [ ] **Step 3: Commit**

```shell
git add src/components/MermaidReactFlow/types.ts
HUSKY=0 git commit -m "feat: add manifest types, replace navigateMap with manifest prop"
```

---

### Task 2: Create manifest parser

**Files:**

- Create: `src/components/MermaidReactFlow/utils/parseManifest.ts`

- [ ] **Step 1: Create parseManifest.ts**

```typescript
import { ManifestData, TransitionConfig } from '../types';

const DEFAULT_ZOOM = { level: 4, duration: 1600 };
const DEFAULT_PAUSE = { duration: 200 };
const DEFAULT_FADE = { duration: 1500, easing: 'easeInOut' };

function parseFloat2(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

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

  return {
    fromFile,
    trigger,
    targetDiagram: to,
    targetFile,
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

export async function fetchAndParseManifest(manifestUrl: string): Promise<ManifestData> {
  const response = await fetch(manifestUrl);
  if (!response.ok) {
    throw new Error(`Failed to load manifest: ${manifestUrl} (${response.status})`);
  }

  const xmlString = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error(`Invalid manifest XML: ${parserError.textContent}`);
  }

  const root = doc.documentElement;
  const id = root.getAttribute('id') ?? '';
  const title = root.getAttribute('title') ?? '';
  const entryDiagramId = root.getAttribute('entryDiagram') ?? '';

  const diagrams = new Map<string, string>();
  for (const el of Array.from(root.querySelectorAll('diagram'))) {
    const diagId = el.getAttribute('id') ?? '';
    const file = el.getAttribute('file') ?? '';
    if (diagId && file) diagrams.set(diagId, file);
  }

  const entryDiagramFile = diagrams.get(entryDiagramId) ?? '';
  if (!entryDiagramFile) {
    throw new Error(`entryDiagram "${entryDiagramId}" not found in manifest diagrams`);
  }

  const transitions: TransitionConfig[] = [];
  for (const el of Array.from(root.querySelectorAll('transition'))) {
    const config = parseTransition(el, diagrams);
    if (config) transitions.push(config);
  }

  return { id, title, entryDiagramFile, diagrams, transitions };
}
```

- [ ] **Step 2: Commit**

```shell
git add src/components/MermaidReactFlow/utils/parseManifest.ts
HUSKY=0 git commit -m "feat: add manifest XML parser utility"
```

---

### Task 3: Update drawioToReactFlow to use TransitionConfig

**Files:**

- Modify: `src/components/MermaidReactFlow/utils/drawioToReactFlow.ts`

- [ ] **Step 1: Replace navigateMap with transitions array**

In the `buildNodes` function signature, replace `navigateMap?: Record<string, string>` with `transitions?: TransitionConfig[]`:

Change line ~209:

```typescript
// Before:
  onNavigate?: (link: string) => void,
  navigateMap?: Record<string, string>,

// After:
  onNavigate?: (link: string) => void,
  transitions?: TransitionConfig[],
```

Add the import at the top of the file:

```typescript
import { ReactFlowData, NodeData, TransitionConfig } from '../types';
```

In the nodeData construction (~line 372), replace:

```typescript
// Before:
navigateTo: navigateMap?.[label] || undefined,

// After:
navigateTo: transitions?.find((t) => t.trigger === label)?.targetFile || undefined,
```

In `convertDrawioToReactFlow` (~line 522), replace:

```typescript
// Before:
  onNavigate?: (link: string) => void,
  navigateMap?: Record<string, string>,
// ...
  const { nodes } = buildNodes(cells, cellMap, groupIds, onNavigate, navigateMap);

// After:
  onNavigate?: (link: string) => void,
  transitions?: TransitionConfig[],
// ...
  const { nodes } = buildNodes(cells, cellMap, groupIds, onNavigate, transitions);
```

- [ ] **Step 2: Commit**

```shell
git add src/components/MermaidReactFlow/utils/drawioToReactFlow.ts
HUSKY=0 git commit -m "refactor: replace navigateMap with TransitionConfig array in converter"
```

---

### Task 4: Update NavigableDiagram to load manifest

**Files:**

- Modify: `src/components/MermaidReactFlow/NavigableDiagram.tsx`

- [ ] **Step 1: Add manifest import and loading logic**

Add import:

```typescript
import { fetchAndParseManifest } from './utils/parseManifest';
import { ReactFlowData, DiagramProps, NodeData, ManifestData, TransitionConfig } from './types';
```

- [ ] **Step 2: Update DiagramFlow to accept transition config**

Change the `DiagramFlow` props and `handleNodeClick` to use `TransitionConfig`:

```typescript
function DiagramFlow({
  flowData,
  nodeTypes,
  defaultEdgeOptions,
  onDiagramNavigate,
  transitions,
}: {
  flowData: ReactFlowData;
  nodeTypes: Record<string, React.ComponentType<any>>;
  defaultEdgeOptions: Record<string, any>;
  onDiagramNavigate?: (diagramPath: string) => void;
  transitions?: TransitionConfig[];
}) {
  const { setCenter, setViewport, getViewport } = useReactFlow();
  const viewportHistory = useRef<Viewport[]>([]);
  const [canGoBack, setCanGoBack] = useState(false);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: RFNode<NodeData>) => {
      if (!node.data?.centerable) return;

      viewportHistory.current.push(getViewport());
      setCanGoBack(true);

      const nodeWidth = (node.style?.width as number) || node.width || 100;
      const nodeHeight = (node.style?.height as number) || node.height || 50;
      const x = node.position.x + nodeWidth / 2;
      const y = node.position.y + nodeHeight / 2;

      // Find transition config for this node (if any)
      const transConfig = transitions?.find((t) => t.trigger === node.data?.label);
      const zoomLevel = transConfig?.zoom.level ?? 4;
      const zoomDuration = transConfig?.zoom.duration ?? 1600;
      const pauseDuration = transConfig?.pause.duration ?? 200;

      setCenter(x, y, { zoom: zoomLevel, duration: zoomDuration });

      if (node.data?.navigateTo && onDiagramNavigate) {
        setTimeout(() => {
          onDiagramNavigate(node.data.navigateTo!);
        }, zoomDuration + pauseDuration);
      }
    },
    [setCenter, getViewport, onDiagramNavigate, transitions],
  );
```

- [ ] **Step 3: Update NavigableDiagram to load manifest and derive state**

Replace the `NavigableDiagram` function:

```typescript
export function NavigableDiagram({ diagramFile, manifest, height, className = '' }: DiagramProps) {
  const colorMode = useSafeColorMode();
  const [flowData, setFlowData] = useState<ReactFlowData>({ nodes: [], edges: [] });
  const [manifestData, setManifestData] = useState<ManifestData | null>(null);
  const [currentDiagram, setCurrentDiagram] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const nodeTypes = useMemo(
    () => ({ custom: ClickableNode, group: SubgraphNode, image: ImageNode }),
    [],
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      style: { strokeWidth: 2, stroke: '#1976D2' },
      animated: false,
    }),
    [],
  );

  // Filter transitions relevant to the current diagram
  const currentTransitions = useMemo(() => {
    if (!manifestData) return undefined;
    return manifestData.transitions.filter((t) => t.fromFile === currentDiagram);
  }, [manifestData, currentDiagram]);

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

  // Load manifest on mount (if provided)
  useEffect(() => {
    if (!manifest) {
      if (diagramFile) setCurrentDiagram(diagramFile);
      return;
    }

    const loadManifest = async () => {
      try {
        const data = await fetchAndParseManifest(manifest);
        setManifestData(data);
        setCurrentDiagram(data.entryDiagramFile);
      } catch (err) {
        console.error('Error loading manifest:', err);
        setError(err instanceof Error ? err.message : 'Failed to load manifest');
        setLoading(false);
      }
    };

    loadManifest();
  }, [manifest, diagramFile]);

  // Load diagram when currentDiagram changes
  useEffect(() => {
    if (!currentDiagram) return;

    const loadDiagram = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(currentDiagram);
        if (!response.ok) {
          throw new Error(`Failed to load diagram: ${currentDiagram}`);
        }

        const xmlString = await response.text();
        const data = await convertDrawioToReactFlow(
          xmlString,
          handleNavigate,
          currentTransitions,
        );
        setFlowData(data);
      } catch (err) {
        console.error('Error loading diagram:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadDiagram();
  }, [currentDiagram, handleNavigate, manifestData]);
```

Keep the rest of the JSX return the same, but pass `transitions` to `DiagramFlow`:

```typescript
<DiagramFlow
  flowData={flowData}
  nodeTypes={nodeTypes}
  defaultEdgeOptions={defaultEdgeOptions}
  onDiagramNavigate={handleNavigate}
  transitions={manifestData?.transitions}
/>
```

- [ ] **Step 4: Commit**

```shell
git add src/components/MermaidReactFlow/NavigableDiagram.tsx
HUSKY=0 git commit -m "feat: load manifest and derive navigate map + animation config"
```

---

### Task 5: Update test MDX to use manifest prop

**Files:**

- Modify: `docs/test-interactive-diagrams.mdx`

- [ ] **Step 1: Replace navigateMap with manifest**

```mdx
<MermaidReactFlow manifest="/diagrams/haw-transaction-lifecycle.manifest.xml" />
```

- [ ] **Step 2: Verify by running dev server**

```shell
yarn start --no-open
# Visit http://localhost:3000/test-interactive-diagrams
# Click Delayed Inbox → should zoom then fade to ticket submission
# Click Back → should return to transaction lifecycle
```

- [ ] **Step 3: Kill dev server and commit**

```shell
lsof -ti:3000 | xargs kill -9
git add docs/test-interactive-diagrams.mdx
HUSKY=0 git commit -m "feat: switch test page to manifest-driven diagram story"
```

---

### Task 6: Final typecheck and verification

- [ ] **Step 1: Run typecheck**

```shell
npx tsc --noEmit 2>&1 | grep -v "exit.*does not exist"
```

Expected: no new errors (only the pre-existing motion/react `exit` error).

- [ ] **Step 2: Start dev server and verify**

```shell
yarn start --no-open
# Visit http://localhost:3000/test-interactive-diagrams
# 1. Diagram loads from manifest entry point
# 2. Click Delayed Inbox → zoom (4x, 1600ms) → pause (200ms) → fade to ticket submission
# 3. Click Back → fade back to transaction lifecycle
```

- [ ] **Step 3: Kill dev server**

```shell
lsof -ti:3000 | xargs kill -9
```
