# Interactive Diagram Component

A React component for creating interactive SVG diagrams with numbered elements that can be clicked to reveal detailed information in modal dialogs. This component is designed for documentation sites to explain complex processes through step-by-step visual explanations.

## Overview

This component provides an interactive way to explore technical concepts by clicking on numbered elements within a diagram. It works seamlessly with Docusaurus, supporting both light and dark themes.

## Features

- Interactive SVG diagrams with clickable numbered points
- Support for external SVG files or embedded SVG content
- Animated number indicators to draw user attention
- Modal dialogs that display rich content
- Syntax highlighting for code examples in multiple languages
- Smooth animations and transitions using React Spring
- Dark/light theme compatibility via Docusaurus theming
- Accessible UI with Radix UI components

## Component Structure

- `index.tsx`: Main component export and SVG diagram definition
- `Modal.tsx`: Handles modal dialog display with content
- `NumberComponent.tsx`: Renders numbered circles that can be clicked
- `ButtonComponent.tsx`: Creates interactive hover effects for clickable elements
- `constants.ts`: Defines coordinates and SVG paths for numbered elements
- `types.ts`: TypeScript interface definitions

## Customization

The component uses several configuration objects in `constants.ts` to define:

- `coordinates`: Positioning information for each numbered element
- `numberPaths`: SVG path data for rendering each number
- `CIRCLE_RADIUS`: Size of the circular background for numbers

Modal content can be provided as React components or MDX files, allowing for rich formatting and code syntax highlighting.

## Usage

### Basic Usage (Default SVG)

```jsx
import PictureWithClickableNumbers from '@site/src/components/InteractiveDiagrams/PictureWithClickableNumbers';

function MyDocPage() {
  return (
    <div className="my-diagram-container">
      <PictureWithClickableNumbers id="my-diagram" />
    </div>
  );
}
```

### Using an External SVG File

```jsx
import PictureWithClickableNumbers from '@site/src/components/InteractiveDiagrams/PictureWithClickableNumbers';

function MyDocPage() {
  return (
    <div className="my-diagram-container">
      <PictureWithClickableNumbers 
        id="custom-diagram"
        svgFilePath="/img/my-custom-diagram.svg"
        viewBox="0 0 800 600"
        customCoordinates={{
          1: { circle: { x: 100, y: 200 }, path: { x: 96, y: 198 }, offset: { x: -4, y: -2 } },
          2: { circle: { x: 300, y: 150 }, path: { x: 296, y: 152 }, offset: { x: -4, y: 2 } },
          3: { circle: { x: 500, y: 250 }, path: { x: 501, y: 255 }, offset: { x: 1, y: 5 } },
          4: { circle: { x: 400, y: 400 }, path: { x: 394, y: 404 }, offset: { x: -6, y: 4 } },
          5: { circle: { x: 600, y: 350 }, path: { x: 601, y: 354 }, offset: { x: 1, y: 4 } },
        }}
      />
    </div>
  );
}
```

### With Custom Modal Content

```jsx
import PictureWithClickableNumbers from '@site/src/components/InteractiveDiagrams/PictureWithClickableNumbers';
import { Modal } from '@site/src/components/InteractiveDiagrams/PictureWithClickableNumbers/Modal';
import { NumberComponent } from '@site/src/components/InteractiveDiagrams/PictureWithClickableNumbers/NumberComponent';

function MyDocPage() {
  return (
    <div className="my-diagram-container">
      <PictureWithClickableNumbers id="diagram-with-custom-content">
        <Modal number={1} customContent={() => (
          <div>
            <h2>First Step</h2>
            <p>This is the first step in the process.</p>
          </div>
        )} />
        <Modal number={2} customContent={() => (
          <div>
            <h2>Second Step</h2>
            <p>This is the second step in the process.</p>
          </div>
        )} />
      </PictureWithClickableNumbers>
    </div>
  );
}
```

## Animation Behavior

By default, numbers 2, 3, and 4 have pulsing animations to indicate interactivity, while numbers 1 and 5 remain static. This behavior can be customized through the `NumberComponent` props:

```jsx
<NumberComponent number={1} animated={true} />
```

## Theming

The component adapts to Docusaurus light and dark themes, using different color schemes for each mode to ensure readability and consistent visual styling.

## Using SVG Files

When using external SVG files, you need to:

1. Provide an `svgFilePath` pointing to your SVG file (this should be in the `/static` directory or a public URL)
2. Provide `customCoordinates` that match the positions of elements in your SVG where you want the numbered indicators to appear
3. Optionally provide a custom `viewBox` if your SVG has different dimensions than the default

The component will load the SVG file and overlay the interactive numbered elements on top of it.

## Example Use Cases

- Explaining system architectures
- Illustrating workflow processes
- Creating step-by-step guides
- Visualizing complex technical concepts
- Documenting API interactions
- Explaining data flows
