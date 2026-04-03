# Codex Adversarial Review Fixes — DrawioReactFlow

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix three issues from the Codex adversarial review: stale navigation timers, unsequenced diagram fetches, and shape-name mismatches between the converter and CSS.

**Architecture:** All fixes are local to `src/components/DrawioReactFlow/`. Task 1 adds timer lifecycle management to `DiagramFlow`. Task 2 adds `AbortController` to the diagram-fetch effect in `NavigableDiagram`. Task 3 aligns shape names between `drawioToReactFlow.ts` and `_drawio-reactflow.scss`.

**Tech Stack:** React 18, ReactFlow 11.11.4, TypeScript, SCSS

---

### Task 1: Cancel stale navigation timers

**Problem:** `handleNodeClick` (NavigableDiagram.tsx:60) schedules `setTimeout` for diagram navigation but never cancels it. A second click, back navigation, or unmount leaves the old timer running, which can push state out of order.

**Files:**

- Modify: `src/components/DrawioReactFlow/NavigableDiagram.tsx:22-110` (the `DiagramFlow` component)

- [ ] **Step 1: Add a timeout ref and clear it on new clicks**

In `DiagramFlow`, add a ref to track the pending timer and clear it before scheduling a new one:

```tsx
// Inside DiagramFlow, after the existing refs:
const pendingNavTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
```

Then in `handleNodeClick`, before the `setTimeout` call at line 60, add:

```tsx
// Clear any pending navigation timer from a previous click
if (pendingNavTimer.current !== null) {
  clearTimeout(pendingNavTimer.current);
  pendingNavTimer.current = null;
}
```

And wrap the existing `setTimeout` to store the id:

```tsx
if (node.data?.navigateTo && onDiagramNavigate) {
  pendingNavTimer.current = setTimeout(() => {
    pendingNavTimer.current = null;
    onDiagramNavigate(node.data.navigateTo!);
  }, zoomDuration + pauseDuration);
}
```

- [ ] **Step 2: Clear the timer on back navigation**

In `handleGoBack`, add timer cleanup at the top of the callback:

```tsx
const handleGoBack = useCallback(() => {
  if (pendingNavTimer.current !== null) {
    clearTimeout(pendingNavTimer.current);
    pendingNavTimer.current = null;
  }
  const prev = viewportHistory.current.pop();
  if (prev) {
    setViewport(prev, { duration: 1600 });
  }
  setCanGoBack(viewportHistory.current.length > 0);
}, [setViewport]);
```

- [ ] **Step 3: Clear the timer on unmount**

Add an effect cleanup inside `DiagramFlow`:

```tsx
useEffect(() => {
  return () => {
    if (pendingNavTimer.current !== null) {
      clearTimeout(pendingNavTimer.current);
    }
  };
}, []);
```

- [ ] **Step 4: Verify — run typecheck**

Run: `yarn typecheck`
Expected: No errors

- [ ] **Step 5: Verify — manual test rapid clicks**

Run: `yarn start --no-open`

Open `http://localhost:3000/test-interactive-diagrams` and:

1. Click a blinking trigger node
2. Immediately click "Go back" before the zoom+pause completes
3. Confirm no stale navigation fires after you've already gone back

Kill the dev server after testing.

- [ ] **Step 6: Commit**

```bash
git add src/components/DrawioReactFlow/NavigableDiagram.tsx
git commit -m "fix: cancel stale navigation timers on re-click, back, and unmount"
```

---

### Task 2: Abort stale diagram fetches with AbortController

**Problem:** The `useEffect` at NavigableDiagram.tsx:174 starts an async `fetch` when `currentDiagram` changes but has no cancellation. If the user navigates quickly, an older slow response can resolve last and overwrite the correct diagram.

**Files:**

- Modify: `src/components/DrawioReactFlow/NavigableDiagram.tsx:174-195` (the diagram-loading effect)

- [ ] **Step 1: Add AbortController to the fetch effect**

Replace the existing `useEffect` (lines 174-195) with:

```tsx
useEffect(() => {
  if (!currentDiagram) return;

  const controller = new AbortController();

  const loadDiagram = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(currentDiagram, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Failed to load diagram: ${currentDiagram}`);
      }
      const xmlString = await response.text();
      const data = await convertDrawioToReactFlow(xmlString, handleNavigate, currentTransitions);
      if (!controller.signal.aborted) {
        setFlowData(data);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('Error loading diagram:', err);
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };
  loadDiagram();

  return () => {
    controller.abort();
  };
}, [currentDiagram, handleNavigate, manifestData]);
```

Key changes:

- `AbortController` created per effect run; previous request aborted on cleanup
- `signal` passed to `fetch()`
- State updates guarded by `!controller.signal.aborted` to prevent writes after abort
- `AbortError` caught and silently ignored (normal cancellation)

- [ ] **Step 2: Verify — run typecheck**

Run: `yarn typecheck`
Expected: No errors

- [ ] **Step 3: Verify — manual test rapid navigation**

Run: `yarn start --no-open`

Open `http://localhost:3000/test-interactive-diagrams` and:

1. Click a trigger node to navigate to a second diagram
2. Immediately click "Back" before it finishes loading
3. Confirm the first diagram restores cleanly without flicker from the aborted second diagram

Kill the dev server after testing.

- [ ] **Step 4: Commit**

```bash
git add src/components/DrawioReactFlow/NavigableDiagram.tsx
git commit -m "fix: abort stale diagram fetches on navigation change"
```

---

### Task 3: Align converter shape names with CSS classes

**Problem:** `determineShape()` (drawioToReactFlow.ts:198-201) returns `'rectangle'`, `'rounded'`, and `'process'`. The ClickableNode renders `shape-${shape}` as a CSS class. But the SCSS defines `.shape-rect` and `.shape-round` — not `.shape-rectangle`, `.shape-rounded`, or `.shape-process`. Shapes silently fall through to generic styling.

**Files:**

- Modify: `src/components/DrawioReactFlow/utils/drawioToReactFlow.ts:198-202` (the `determineShape` function)
- Modify: `src/css/partials/_drawio-reactflow.scss` (add `.shape-process` rule)

- [ ] **Step 1: Fix shape names in the converter**

Replace the `determineShape` function (lines 198-202) with:

```ts
function determineShape(styleProps: Record<string, string>): string {
  if (styleProps['shape'] === 'process') return 'process';
  if (styleProps['rounded'] === '1') return 'round';
  return 'rect';
}
```

This changes:

- `'rounded'` → `'round'` (matches `.shape-round` in CSS)
- `'rectangle'` → `'rect'` (matches `.shape-rect` in CSS)
- `'process'` stays `'process'` (CSS rule added in next step)

- [ ] **Step 2: Add `.shape-process` CSS rule**

In `src/css/partials/_drawio-reactflow.scss`, after the `.shape-diamond` block (line 237), add:

```scss
&.shape-process {
  border-radius: 0;
  border-left: 4px solid;
  border-right: 4px solid;
}
```

This mirrors the Draw.io "process" shape: a rectangle with emphasized left/right borders (the standard flowchart convention for a predefined process/subroutine).

- [ ] **Step 3: Verify — run typecheck**

Run: `yarn typecheck`
Expected: No errors

- [ ] **Step 4: Verify — visual check with dev server**

Run: `yarn start --no-open`

Open `http://localhost:3000/test-interactive-diagrams` and confirm:

1. Rectangular nodes have rounded corners (`.shape-rect` → `border-radius: 8px`)
2. Rounded nodes have pill-like corners (`.shape-round` → `border-radius: 15px`)
3. If any process-shaped nodes exist in the test diagrams, they render with emphasized side borders

Kill the dev server after testing.

- [ ] **Step 5: Commit converter fix**

```bash
git add src/components/DrawioReactFlow/utils/drawioToReactFlow.ts
git commit -m "fix: align converter shape names with CSS class expectations"
```

- [ ] **Step 6: Commit CSS addition**

```bash
git add src/css/partials/_drawio-reactflow.scss
git commit -m "feat: add shape-process CSS for Draw.io process/subroutine nodes"
```
