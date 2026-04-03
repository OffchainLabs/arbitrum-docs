# DrawioReactFlow — Interactive Diagram Navigation

Converts Draw.io (`.drawio`) diagrams into interactive React Flow visualizations with animated, manifest-driven navigation between diagrams.

## Overview

Contributors author diagrams in Draw.io's visual editor, then render them as interactive, click-navigable diagrams inside Arbitrum Docs. A manifest XML file defines which diagrams exist and how users transition between them (zoom, pause, fade).

## Features

- **Draw.io native**: Author diagrams in draw.io, render them pixel-accurate in React Flow
- **Manifest-driven navigation**: XML manifest defines diagram stories with animated transitions
- **Zoom-to-node transitions**: Click a highlighted node to zoom in, pause, then cross-fade to the next diagram
- **Subgroup support**: Draw.io groups render as labeled containers with styled borders
- **Embedded images**: Inline SVG/base64 images from Draw.io cells render as image nodes
- **Theme integration**: Adapts to Docusaurus light/dark mode via CSS variables
- **Keyboard accessible**: Tab to focus nodes, Enter/Space to activate
- **Responsive**: Works on mobile, tablet, and desktop
- **SSG compatible**: Uses Docusaurus `BrowserOnly` for static site generation

## Quick start

### 1. Create a Draw.io diagram

Create `.drawio` files in `static/diagrams/` using the [draw.io editor](https://app.diagrams.net). Node positions, sizes, colors, and connections are preserved exactly as authored.

Nodes with a fill color of `#FFB347` (pastel orange) are treated as **interactive trigger nodes** — they blink to signal clickability and zoom-navigate on click.

### 2. Create a manifest

Create a manifest XML file (e.g., `static/diagrams/my-story.manifest.xml`) that defines the diagram story:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<diagramStory
  id="my-story"
  title="My Diagram Story"
  entryDiagram="overview"
>
  <diagram id="overview" file="/diagrams/overview.drawio" />
  <diagram id="detail"   file="/diagrams/detail.drawio" />

  <transition from="overview" to="detail" trigger="Click Me">
    <zoom level="4" duration="1600" />
    <pause duration="200" />
    <fade duration="1500" easing="easeInOut" />
  </transition>
</diagramStory>
```

| Element          | Description                                                                            |
| ---------------- | -------------------------------------------------------------------------------------- |
| `<diagramStory>` | Root element. `entryDiagram` points to the first diagram `id`.                         |
| `<diagram>`      | Maps an `id` to a `.drawio` file path (relative to `static/`).                         |
| `<transition>`   | Defines a navigation. `trigger` matches the **node label text** in the `from` diagram. |
| `<zoom>`         | Zoom level and duration (ms) for the zoom-to-node animation.                           |
| `<pause>`        | Pause duration (ms) between zoom and cross-fade.                                       |
| `<fade>`         | Cross-fade duration (ms) and easing for the diagram swap.                              |

### 3. Use in MDX

```mdx
---
title: 'My Architecture'
---

import DrawioReactFlow from '@site/src/components/DrawioReactFlow';

<DrawioReactFlow manifest="/diagrams/my-story.manifest.xml" />
```

You can also render a single diagram without a manifest:

```mdx
<DrawioReactFlow diagramFile="/diagrams/standalone.drawio" height="400px" />
```

## Component API

### DrawioReactFlow props

| Prop          | Type     | Default                  | Description                                                                  |
| ------------- | -------- | ------------------------ | ---------------------------------------------------------------------------- |
| `manifest`    | `string` | —                        | Path to manifest XML (relative to `static/`). Enables multi-diagram stories. |
| `diagramFile` | `string` | —                        | Path to a single `.drawio` file. Used when no manifest is needed.            |
| `height`      | `string` | CSS `aspect-ratio: 16/9` | Container height. Overrides the default aspect ratio.                        |
| `className`   | `string` | `""`                     | Additional CSS classes on the container.                                     |

Provide either `manifest` or `diagramFile`, not both.

## Navigation behavior

1. **Initial load**: Fetches the manifest, parses it, loads the `entryDiagram`
2. **Draw.io XML parsing**: `convertDrawioToReactFlow()` extracts nodes, edges, groups, and images from the XML
3. **Trigger nodes**: Nodes with fill color `#FFB347` blink and are clickable. On click, the camera zooms to the node center.
4. **Transition**: After zoom + pause, the manifest's `<transition>` determines which diagram loads next. A cross-fade (via Framer Motion `AnimatePresence`) swaps the diagrams.
5. **Back button**: Appears after the first navigation. Returns to the previous diagram.
6. **Viewport history**: Within a single diagram, zoom-clicks are tracked in a viewport stack with their own back navigation.

## File structure

```
src/components/DrawioReactFlow/
├── index.tsx              Main export with BrowserOnly SSG wrapper
├── NavigableDiagram.tsx   Navigation state, transitions, ReactFlow rendering
├── ClickableNode.tsx      Custom node with shape variants and keyboard support
├── ImageNode.tsx          Renders embedded images from Draw.io cells
├── SubgraphNode.tsx       Group container with labeled header
├── types.ts               TypeScript interfaces (ManifestData, TransitionConfig, NodeData, etc.)
└── utils/
    ├── drawioToReactFlow.ts   Draw.io XML → ReactFlow nodes/edges conversion
    └── parseManifest.ts       Manifest XML → ManifestData parser

static/diagrams/               Diagram source files
├── *.drawio                   Draw.io diagram files
├── *.manifest.xml             Manifest story definitions
└── diagram-background.svg     Shared container background

src/css/partials/
└── _drawio-reactflow.scss     Theme-integrated styling
```

## How the converter works

`drawioToReactFlow.ts` performs these steps:

1. **Parse XML**: `DOMParser` extracts `<mxCell>` elements from the Draw.io XML
2. **Classify cells**: Each cell is categorized as vertex (node), edge (connection), group, image, or text-only
3. **Detect groups**: Explicit (`group=true` style) and implicit (parent cells with child vertices) groups are identified
4. **Build nodes**: Vertex cells become ReactFlow nodes with absolute positions computed by walking the parent chain. Groups become `SubgraphNode`s. Images become `ImageNode`s. Regular cells become `ClickableNode`s.
5. **Build edges**: Edge cells become ReactFlow edges with handle positions resolved from Draw.io's `exitX/exitY/entryX/entryY` metadata, falling back to geometric inference
6. **Filter**: Edges referencing missing nodes are removed

## Node types

| Type      | Component           | When used                                                      |
| --------- | ------------------- | -------------------------------------------------------------- |
| `custom`  | `ClickableNode`     | Regular nodes with labels, shapes, and optional click behavior |
| `group`   | `SubgraphNode`      | Draw.io groups with visible fill/border                        |
| `image`   | `ImageNode`         | Cells with `shape=image` style (inline SVG/base64)             |
| `default` | React Flow built-in | Text-only cells (`text=true` style)                            |

## Styling

### Container

The `.drawio-reactflow-container` uses a 16:9 aspect ratio with a custom SVG background (`diagram-background.svg`), rounded corners, and theme-aware borders.

### Node interactions

- **Trigger nodes** (`#FFB347` fill): Blink animation (`2s ease-in-out infinite`). Hover pauses the blink and turns the node green.
- **Clickable nodes**: `cursor: pointer`, `translateY(-2px)` hover lift, focus outline
- **Static nodes**: `cursor: default`, no hover effects

### Theme support

Light/dark mode is handled via `data-theme` attribute on the container:

- Light mode: standard box shadows, white node text
- Dark mode: reduced opacity backgrounds, inverted text colors, adjusted edge labels

### Accessibility

- **Keyboard**: Clickable nodes are focusable (`tabIndex={0}`), activated with Enter/Space
- **High contrast**: Increased border width via `prefers-contrast: high`
- **Reduced motion**: All transitions disabled via `prefers-reduced-motion: reduce`
- **ARIA**: Clickable nodes have `role="button"` and descriptive `aria-label`

## Dependencies

- **reactflow** (`^11.11.4`): Interactive node-based UI
- **dagre** (`^0.8.5`): Graph layout algorithm (available but not used in current Draw.io path — positions come from the XML)
- **motion/react** (Framer Motion): Cross-fade transitions between diagrams
- **@docusaurus/theme-common**: Theme integration (`useColorMode`)
- **@docusaurus/BrowserOnly**: SSG compatibility

## Testing

### Test page

Visit `/docs/test-interactive-diagrams` to see the system in action with the transaction lifecycle diagram story.

### Manual testing checklist

- [ ] Manifest loads and entry diagram renders
- [ ] Trigger nodes (orange `#FFB347`) blink
- [ ] Clicking a trigger node zooms to it, then fades to next diagram
- [ ] Back button appears after navigation and returns to previous diagram
- [ ] Theme switching updates colors (light/dark)
- [ ] Keyboard Tab focuses clickable nodes, Enter/Space activates
- [ ] Groups render with labels and styled borders
- [ ] Embedded images render correctly
- [ ] No console errors
- [ ] Mobile responsive

## Troubleshooting

### Diagram not loading

**Error**: "Failed to load diagram: /diagrams/xxx.drawio"

- Ensure the file exists in `static/diagrams/`
- Path must start with `/diagrams/` (not `static/diagrams/`)
- File extension must be `.drawio`

### Manifest not loading

**Error**: "Failed to load manifest" or "entryDiagram not found"

- Verify the manifest XML is well-formed
- Check that `entryDiagram` attribute matches a `<diagram id="...">` element
- Ensure all `<diagram file="...">` paths point to existing `.drawio` files

### Node not clickable

- Only nodes with fill color `#FFB347` are interactive trigger nodes
- Verify a `<transition>` exists in the manifest with a `trigger` matching the node's label text
- The `from` diagram in the transition must match the current diagram

### Build errors

**Error**: "Cannot find module 'reactflow'" — Run `yarn install`

**Error**: TypeScript errors — Check `types.ts` imports match component usage

## Contributing

When adding new interactive diagrams:

1. Create `.drawio` files in `static/diagrams/` using draw.io
2. Color trigger nodes with `#FFB347` (pastel orange)
3. Create a manifest XML defining the diagram story and transitions
4. Add an MDX page importing `DrawioReactFlow` with the manifest path
5. Test the full navigation flow on the dev server
6. Commit with a descriptive message
