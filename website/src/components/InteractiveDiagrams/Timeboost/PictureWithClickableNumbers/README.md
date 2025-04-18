# README

## PictureWithClickableNumbers

A React component library for creating interactive SVG diagrams with numbered elements that can be clicked to reveal detailed information in modal dialogs. This library is perfect for educational content, process explanations, and technical documentation where you need to break down complex concepts into digestible, step-by-step information.

### Overview

PictureWithClickableNumbers provides a framework for building interactive diagrams where users can click on numbered elements to learn more about specific parts of a process or system. The library is designed to work seamlessly with Docusaurus documentation sites and supports both light and dark themes.

### Features

- Interactive SVG diagrams with clickable numbered elements
- Animated number indicators to draw attention to interactive elements
- Modal dialogs with rich content support (MDX, code blocks, images)
- Syntax highlighting for code examples in multiple languages
- Smooth animations and transitions using React Spring
- Responsive design that works across device sizes
- Dark/light theme support via Docusaurus theming
- Accessible UI components using Radix UI

### Usage

#### Basic Implementation

```jsx
import React from 'react';
import PictureWithClickableNumbers from '@arbitrum/picture-with-clickable-numbers';

function MyDocPage() {
  return (
    <div className="my-diagram-container">
      <PictureWithClickableNumbers />
    </div>
  );
}
```

#### Custom Implementation

To create your own interactive diagram:

1. Create your SVG diagram background
2. Define coordinates for each numbered element
3. Create MDX content files for each modal
4. Configure the component with your custom settings

```jsx
import React from 'react';
import { Modal } from '@arbitrum/picture-with-clickable-numbers';
import MyCustomStep1Content from './my-custom-step-1.mdx';

function MyCustomDiagram() {
  return (
    <svg viewBox="0 0 1600 900" style={{ pointerEvents: 'none' }}>
      {/* Your SVG diagram background elements */}
      <rect x="100" y="100" width="1400" height="700" fill="#f0f0f0" />
      <path d="M200,300 L400,500" stroke="#333" strokeWidth="2" />
      
      {/* Interactive numbered elements */}
      <Modal number={1} customContent={MyCustomStep1Content} />
      <Modal number={2} />
      <Modal number={3} />
    </svg>
  );
}
```

### Components

#### Core Components

- `Modal`: Displays detailed content when a numbered element is clicked
- `NumberComponent`: Renders numbered circles that can be clicked to show more information
- `ButtonComponent`: Creates interactive hover effects for clickable elements

### Customization

#### Coordinates and Paths

Define the positions and shapes of your numbered elements:

```typescript
// constants.ts
export const CIRCLE_RADIUS = 20;

export const numberPaths = {
  1: 'M10 10v-3c2.5 0 3.6-.5 4-2.6h4v14.7h-4.4v-9h-3.6Z',
  2: 'M10 10c.8-1.1 1.5-1.6 3.9-2.9 2.1-1.1 2.6-1.6 2.6-2.6 0-.8-.5-1.4-1.4-1.4-1 0-1.6.7-1.6 2.1h-4.4c0-3.2 2.3-5.2 6.2-5.2 3.4 0 5.6 1.7 5.6 4.2 0 2.1-1 3.5-3.3 4.8l-.8.4c-2 1.1-2.7 1.5-2.8 2.5.7-.1 1.4-.1 2.2-.1h5.2v3.3h-12.5c0-2.5.4-3.9 1.2-5.1Z',
  // Add more number paths as needed
};

export const coordinates = {
  1: { 
    circle: { x: 416, y: 412 }, 
    path: { x: 412, y: 410 }, 
    offset: { x: -4, y: -2 } 
  },
  2: { 
    circle: { x: 588, y: 631 }, 
    path: { x: 583, y: 633 }, 
    offset: { x: -4, y: 1 } 
  },
  // Add more coordinates as needed
};
```

#### Modal Content

Create MDX files for each modal's content:

```mdx
// modal-step-1.mdx
# Step 1: Introduction

This is the first step in our process.

```javascript
// Example code
function example() {
  return "This is an example";
}
```

Key points:
- Point 1
- Point 2
- Point 3
```

### Props

#### PictureWithClickableNumbers

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| viewBox | string | "0 0 1600 900" | SVG viewBox dimensions |
| backgroundElements | ReactNode | undefined | Custom SVG background elements |
| numbers | Array<1\|2\|3\|4\|5> | [1,2,3,4,5] | Numbers to display |
| style | CSSProperties | undefined | Custom styles for SVG container |
| className | string | undefined | Custom class name for SVG container |

#### Modal

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| number | 1\|2\|3\|4\|5 | required | The step number to display |
| customContent | ComponentType | undefined | Custom content component to override default |

#### NumberComponent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| number | 1\|2\|3\|4\|5 | required | The number to display |
| animated | boolean | true for 2,3,4; false for 1,5 | Whether to animate the number |
| interactive | boolean | true for 2,3,4; false for 1,5 | Whether the number is clickable |

