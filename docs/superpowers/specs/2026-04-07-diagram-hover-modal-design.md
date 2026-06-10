# Diagram Hover Modal Design Spec

**Date:** 2026-04-07
**Status:** Approved

## Summary

Add a general-purpose hover modal mechanism to DrawioReactFlow diagrams. Any Draw.io cell (node or edge label) annotated with a `hoverContent` custom property displays a floating modal on hover, rendering MDX partial content passed as a prop from the consuming MDX page.

## Data Flow

```
Draw.io cell (hoverContent="_retryable-tickets-partial")
  -> drawioToReactFlow.ts reads property, stores in NodeData/EdgeData
  -> ClickableNode wraps label in hover trigger when hoverContentKey is set
  -> HoverEdge (custom edge type) wraps edge label in hover trigger
  -> FloatingPortal renders modal with resolved React component from hoverContent prop
```

## Draw.io Annotation Format

Authors add a custom property on any cell in Draw.io:

```
hoverContent=_retryable-tickets-partial
```

This can be set via Draw.io's "Edit Style" dialog or as a UserObject attribute in the XML:

```xml
<UserObject label="Retryable ticket" hoverContent="_retryable-tickets-partial" ...>
```

## MDX Usage

```jsx
import DrawioReactFlow from '@site/src/components/DrawioReactFlow';
import RetryableTicketsPartial from '../partials/_retryable-tickets-partial.mdx';

<DrawioReactFlow
  manifest="/diagrams/haw-transaction-lifecycle.manifest.xml"
  hoverContent={{ '_retryable-tickets-partial': RetryableTicketsPartial }}
/>;
```

The `hoverContent` prop is a `Record<string, React.ComponentType>` mapping content keys to MDX components. Each page controls its own content — no shared component code changes needed.

## Component Changes

### `types.ts`

- Add `hoverContentKey?: string` to `NodeData`
- Add `hoverContent?: Record<string, React.ComponentType>` to `DiagramProps`

### `drawioToReactFlow.ts`

- Extract `hoverContent` from cell style properties or UserObject attributes
- For vertex cells: store as `NodeData.hoverContentKey`
- For edge label cells: store on the edge as `data.hoverContentKey`

### `ClickableNode.tsx`

- If `data.hoverContentKey` is set and a matching component exists in the content map, wrap the node label in a hover trigger that opens the floating modal
- If not set, render unchanged (no regression)
- Nodes with both `hoverContent` and click-to-navigate: hover shows modal, click navigates (distinct gestures)

### New: `HoverEdge.tsx`

- Custom ReactFlow edge type for edges that have hover-enabled labels
- Uses `EdgeLabelRenderer` with a `<foreignObject>` to render the label as HTML
- Wraps the label text in the hover trigger
- Registered in `NavigableDiagram.tsx` as a custom edge type
- Edges without `hoverContentKey` use the default edge type (no change)

### `NavigableDiagram.tsx`

- Accept `hoverContent` prop, thread it through to `DiagramFlow`
- Pass content map to nodes by attaching resolved components to node data during render
- Register `HoverEdge` in `edgeTypes`
- In `drawioToReactFlow`, set `type: 'hoverEdge'` on edges that have `hoverContentKey`

### `index.tsx`

- Pass `hoverContent` prop through the `BrowserOnly` wrapper to `NavigableDiagram`

## Hover Modal Component

Uses `@floating-ui/react` directly (not the existing `FloatingHoverModal` component) because the diagram context (ReactFlow SVG canvas, portals, z-index) differs from standard MDX pages.

**Positioning:** `offset(10)`, `flip()`, `shift({ padding: 5 })`, `autoUpdate`
**Interactions:** `useHover` (150ms open/close delay), `useFocus`, `useDismiss`, `useRole('dialog')`
**Rendering:** `FloatingPortal` to escape ReactFlow's transform context

The modal renders the resolved MDX component wrapped in an `MDXProvider` with custom component mappings for styled headings, paragraphs, lists, links, tables, and code blocks.

## Styling

### New: `src/css/partials/_diagram-hover-modal.scss`

Imported in `custom.scss` alongside `_drawio-reactflow.scss`. Diagram-specific class names:

- `.diagram-hover-modal__trigger` — dotted underline, pointer cursor
- `.diagram-hover-modal__content` — modal container (glassmorphic to match diagram aesthetic)
- `.diagram-hover-modal__header` — close button row
- `.diagram-hover-modal__close` — close (x) button
- `.diagram-hover-modal__body` — scrollable content area, max-height 80vh
- `.diagram-hover-modal__title`, `__subtitle`, `__paragraph`, `__list`, `__list-item`, `__link`, `__inline-code`, `__table`, `__th`, `__td`, `__strong` — MDX element styling

All visual properties (colors, borders, shadows, backdrop blur, typography) live in this SCSS file. Dark mode support via `[data-theme='dark']`. Responsive breakpoints for mobile.

### Visual indicators for hoverable elements

- **Nodes:** dotted underline on the label text (not the whole node border)
- **Edge labels:** dotted underline on the text

## Interaction Rules

| Cell type  | hoverContent | link/navigateTo | Hover behavior | Click behavior |
| ---------- | ------------ | --------------- | -------------- | -------------- |
| Node       | set          | set             | Shows modal    | Navigates      |
| Node       | set          | not set         | Shows modal    | None           |
| Node       | not set      | set             | None           | Navigates      |
| Node       | not set      | not set         | None           | None           |
| Edge label | set          | n/a             | Shows modal    | None           |
| Edge label | not set      | n/a             | None           | None           |

## Files Created/Modified

| File                                                        | Action                                               |
| ----------------------------------------------------------- | ---------------------------------------------------- |
| `src/components/DrawioReactFlow/types.ts`                   | Modify — add hoverContentKey, hoverContent prop      |
| `src/components/DrawioReactFlow/utils/drawioToReactFlow.ts` | Modify — extract hoverContent property               |
| `src/components/DrawioReactFlow/ClickableNode.tsx`          | Modify — conditional hover wrapper                   |
| `src/components/DrawioReactFlow/HoverEdge.tsx`              | Create — custom edge type with hover label           |
| `src/components/DrawioReactFlow/DiagramHoverModal.tsx`      | Create — shared hover modal using @floating-ui/react |
| `src/components/DrawioReactFlow/NavigableDiagram.tsx`       | Modify — thread hoverContent, register edge type     |
| `src/components/DrawioReactFlow/index.tsx`                  | Modify — pass hoverContent prop                      |
| `src/css/partials/_diagram-hover-modal.scss`                | Create — modal styling                               |
| `src/css/custom.scss`                                       | Modify — import new partial                          |
| `static/diagrams/haw-transaction-lifecycle.drawio`          | Modify — add hoverContent to Retryable ticket cell   |
| `docs/test-interactive-diagrams.mdx`                        | Modify — add hoverContent prop with test partial     |
