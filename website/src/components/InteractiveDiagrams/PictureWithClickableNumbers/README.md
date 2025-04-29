# PictureWithClickableNumbers Component

This component creates interactive SVG diagrams with numbered elements that can be clicked to reveal detailed information in modal dialogs. It's designed for documentation sites to explain complex processes through step-by-step visual explanations.

## Features

- Interactive SVG diagrams with clickable numbered points
- Support for external SVG files or embedded SVG content
- Animated number indicators to draw user attention
- Modal dialogs with rich content (text, code, images)
- Syntax highlighting for code examples
- Smooth animations using React Spring
- Dark/light theme compatibility via Docusaurus
- Accessible UI with Radix UI components

## Component Structure

- `index.tsx`: Main component with SVG diagram
- `Modal.tsx`: Handles modal dialog display
- `NumberComponent.tsx`: Renders clickable numbered circles
- `ButtonComponent.tsx`: Creates interactive hover effects
- `constants.ts`: Defines coordinates and SVG paths
- `types.ts`: TypeScript interface definitions
- `modal-*.mdx`: Content files for each step

## Usage

### Basic Usage

```jsx
import PictureWithClickableNumbers from '@site/src/components/InteractiveDiagrams/PictureWithClickableNumbers';

function MyDocPage() {
  return (
    <PictureWithClickableNumbers id="my-diagram" />
  );
}
```

### With External SVG

```jsx
import PictureWithClickableNumbers from '@site/src/components/InteractiveDiagrams/PictureWithClickableNumbers';

function MyDocPage() {
  return (
    <PictureWithClickableNumbers 
      id="custom-diagram"
      svgFilePath="/img/my-diagram.svg"
      viewBox="0 0 800 600"
      customCoordinates={{
        1: { 
          circle: { x: 100, y: 200 }, 
          path: { x: 96, y: 198 }, 
          offset: { x: -4, y: -2 } 
        },
        // Add coordinates for numbers 2-5
      }}
    />
  );
}
```

### With Custom Modal Content

```jsx
import PictureWithClickableNumbers from '@site/src/components/InteractiveDiagrams/PictureWithClickableNumbers';
import { Modal } from '@site/src/components/InteractiveDiagrams/PictureWithClickableNumbers/Modal';

function MyDocPage() {
  return (
    <PictureWithClickableNumbers id="custom-content-diagram">
      <Modal 
        number={2} 
        customContent={() => (
          <div>
            <h2>Custom Step Content</h2>
            <p>This replaces the default content for step 2.</p>
          </div>
        )} 
      />
    </PictureWithClickableNumbers>
  );
}
```

## Props

### PictureWithClickableNumbers Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| id | string | 'default' | Unique identifier for this diagram instance |
| svgFilePath | string | undefined | Path to SVG file to use as background |
| viewBox | string | '0 0 1600 900' | Custom SVG viewBox dimensions |
| backgroundElements | ReactNode | undefined | Custom background SVG elements |
| numbers | Array<1\|2\|3\|4\|5> | [1,2,3,4,5] | Custom numbered elements to display |
| style | CSSProperties | undefined | Custom styling for the SVG container |
| className | string | undefined | Custom class name for the SVG container |
| customCoordinates | object | undefined | Custom coordinates for numbered elements |

### Modal Props

| Prop | Type | Description |
|------|------|-------------|
| number | 1\|2\|3\|4\|5 | The step number for this modal |
| customContent | ComponentType | Optional custom content component |
| coordinates | object | Optional custom coordinates |
| children | ReactNode | Optional custom children elements |
| id | string | Unique identifier matching parent diagram |

### NumberComponent Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| number | 1\|2\|3\|4\|5 | - | The step number to display |
| animated | boolean | auto | Whether the number should be animated |
| interactive | boolean | auto | Whether the number should be interactive |
| coordinates | object | defaultCoordinates | Custom coordinates |
| id | string | 'default' | Unique identifier matching parent diagram |

## Customization

### Animation Behavior

By default, numbers 2, 3, and 4 have pulsing animations to indicate interactivity, while 1 and 5 remain static. This can be customized:

```jsx
<NumberComponent number={1} animated={true} interactive={true} />
```

### Coordinate System

The component uses coordinates defined in `constants.ts`:

```typescript
export const coordinates = {
  1: { 
    circle: { x: 416.59, y: 412.69 }, // Center of circle
    path: { x: 412.16, y: 410.7 },    // Position of number
    offset: { x: -4, y: -2 }          // Fine-tuning
  },
  // Coordinates for numbers 2-5
};
```

## Example Use Cases

- Explaining system architectures
- Illustrating workflow processes
- Creating step-by-step guides
- Visualizing technical concepts
- Documenting API interactions
