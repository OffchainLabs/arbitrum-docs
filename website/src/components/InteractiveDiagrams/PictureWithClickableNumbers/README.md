# PictureWithClickableNumbers Component

This component creates interactive diagrams with numbered elements that can be clicked to reveal detailed information in modal dialogs. It supports both SVG and static image backgrounds, making it versatile for explaining complex processes through step-by-step visual explanations.

## Features

- Interactive diagrams with clickable numbered points
- Support for three background types:
  - Default SVG (built-in)
  - External SVG files
  - Static images from /website/static/img/
- Animated number indicators to draw user attention
- Modal dialogs with rich content (text, code, images)
- Syntax highlighting for code examples
- Smooth animations using React Spring
- Dark/light theme compatibility via Docusaurus
- Accessible UI with Radix UI components

## Component Structure

- `index.tsx`: Main component with diagram rendering logic
- `Modal.tsx`: Handles modal dialog display
- `Button.tsx`: Renders interactive clickable numbered elements
- `DefaultBackground.tsx`: Provides the default SVG background
- `constants.ts`: Defines coordinates and SVG paths
- `types.ts`: TypeScript interface definitions
- `modal-*.mdx`: Content files for each step

## Usage

### Basic Usage (Default Background)

```jsx
import PictureWithClickableNumbers from '@site/src/components/InteractiveDiagrams/PictureWithClickableNumbers';

function MyDocPage() {
  return (
    <PictureWithClickableNumbers id="my-diagram" />
  );
}
```

### With External SVG Background

```jsx
import PictureWithClickableNumbers from '@site/src/components/InteractiveDiagrams/PictureWithClickableNumbers';

function MyDocPage() {
  return (
    <PictureWithClickableNumbers 
      id="custom-diagram"
      backgroundImagePath="/img/my-diagram.svg"
      isSvgBackground={true}
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

### With Static Image Background

```jsx
import PictureWithClickableNumbers from '@site/src/components/InteractiveDiagrams/PictureWithClickableNumbers';

function MyDocPage() {
  return (
    <PictureWithClickableNumbers 
      id="image-diagram"
      backgroundImagePath="/img/my-architecture-diagram.png"
      isSvgBackground={false}
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
| backgroundImagePath | string | undefined | Path to SVG or image file to use as background |
| isSvgBackground | boolean | true | Whether the background is an SVG (true) or static image (false) |
| viewBox | string | '0 0 1600 900' | Custom SVG viewBox dimensions |
| backgroundElements | ReactNode | undefined | Custom background SVG elements |
| numbers | Array<1\|2\|3\|4\|5> | [1,2,3,4,5] | Custom numbered elements to display |
| style | CSSProperties | undefined | Custom styling for the container |
| className | string | undefined | Custom class name for the container |
| customCoordinates | object | undefined | Custom coordinates for numbered elements |

### Modal Props

| Prop | Type | Description |
|------|------|-------------|
| number | 1\|2\|3\|4\|5 | The step number for this modal |
| customContent | ComponentType | Optional custom content component |
| coordinates | object | Optional custom coordinates |
| children | ReactNode | Optional custom children elements |
| id | string | Unique identifier matching parent diagram |

### Button Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| number | 1\|2\|3\|4\|5 | - | The step number to display |
| type | 'static' \| 'dynamic' | 'static' | Whether the number is static or dynamic |
| animated | boolean | auto | Whether the number should be animated |
| interactive | boolean | auto | Whether the number should be interactive |
| coordinates | object | defaultCoordinates | Custom coordinates |
| id | string | 'default' | Unique identifier matching parent diagram |
| onHover | function | undefined | Callback fired when hover state changes |

## Customization

### Animation Behavior

By default, numbers 2, 3, and 4 have pulsing animations to indicate interactivity, while 1 and 5 remain static. This can be customized:

```jsx
<Button number={1} type="dynamic" animated={true} interactive={true} />
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
- Adding interactivity to static diagrams
