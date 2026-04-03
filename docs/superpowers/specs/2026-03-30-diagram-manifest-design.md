# Diagram Story Manifest — Design Spec

## Purpose

Define an XML manifest format that describes multi-diagram transition stories for the Draw.io-to-ReactFlow interactive diagram system. The manifest serves as both human-readable documentation and machine-consumed configuration — single source of truth.

## XML Schema

```xml
<?xml version="1.0" encoding="UTF-8"?>
<diagramStory
  id="unique-story-id"
  title="Human-readable story title"
  entryDiagram="diagram-id-to-load-first"
>
  <diagram id="diagram-id" file="/diagrams/filename.drawio" />
  <diagram id="another-id" file="/diagrams/another.drawio" />

  <transition from="diagram-id" to="another-id" trigger="Node Label Text">
    <zoom level="4" duration="1600" />
    <pause duration="200" />
    <fade duration="1500" easing="easeInOut" />
  </transition>
</diagramStory>
```

### Elements

| Element        | Parent         | Required | Description                                 |
| -------------- | -------------- | -------- | ------------------------------------------- |
| `diagramStory` | root           | yes      | Container for the entire story              |
| `diagram`      | `diagramStory` | yes (1+) | Declares a diagram in the story             |
| `transition`   | `diagramStory` | no       | Describes a navigation between two diagrams |
| `zoom`         | `transition`   | no       | Zoom-to-node animation step                 |
| `pause`        | `transition`   | no       | Delay between animation steps               |
| `fade`         | `transition`   | no       | Crossfade between diagrams                  |

### Attributes

**`diagramStory`**

- `id` (required): Unique identifier for the story
- `title` (required): Human-readable title
- `entryDiagram` (required): `id` of the diagram to load first

**`diagram`**

- `id` (required): Unique identifier referenced by transitions
- `file` (required): Path to the `.drawio` file (relative to `/static/`)

**`transition`**

- `from` (required): Source diagram `id`
- `to` (required): Target diagram `id`
- `trigger` (required): Node label text that triggers this transition on click

**`zoom`** (defaults if omitted: level=4, duration=1600)

- `level`: Zoom multiplier (e.g. 4 = 4x zoom)
- `duration`: Animation duration in milliseconds

**`pause`** (defaults if omitted: duration=200)

- `duration`: Wait time in milliseconds after zoom completes

**`fade`** (defaults if omitted: duration=1500, easing=easeInOut)

- `duration`: Crossfade duration in milliseconds
- `easing`: CSS easing function name

### Animation Sequence

Steps within a `<transition>` execute in document order:

1. `zoom` — camera zooms to the trigger node
2. `pause` — brief hold at zoomed view
3. `fade` — crossfade from current diagram to target diagram

All steps are optional. If no animation children are present, the transition uses defaults for all three steps.

## Component Integration

### MDX Usage

```jsx
<MermaidReactFlow manifest="/diagrams/haw-story.manifest.xml" />
```

The `manifest` prop replaces both `diagramFile` and `navigateMap`. The component:

1. Fetches and parses the manifest XML
2. Loads the `entryDiagram` file
3. Derives the navigate map from `<transition>` elements
4. Applies animation parameters from the manifest

### Backward Compatibility

The `diagramFile` prop continues to work for standalone diagrams without a manifest. When `manifest` is provided, it takes precedence.

## Back Navigation

- Back button reverses to the previous diagram via fade (no reverse zoom)
- Existing history stack mechanism is unchanged
- The manifest does not describe back transitions — they are implicit

## File Convention

Manifest files live alongside diagram files in `static/diagrams/` with the naming pattern:

```
<story-id>.manifest.xml
```
