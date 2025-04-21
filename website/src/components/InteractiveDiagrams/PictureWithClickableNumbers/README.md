# PictureWithClickableNumbers

A React component for creating interactive SVG diagrams with numbered elements that can be clicked to reveal detailed information in modal dialogs. This component is specifically designed for the Arbitrum documentation site to explain complex processes through step-by-step visual explanations.

## Overview

PictureWithClickableNumbers provides an interactive way to explore technical concepts by clicking on numbered elements within a diagram. The component is built to work seamlessly with Docusaurus, supporting both light and dark themes, and uses MDX files for modal content.

## Features

- Interactive SVG diagrams with clickable numbered points
- Animated number indicators to draw user attention
- Modal dialogs that display rich content from MDX files
- Syntax highlighting for code examples in multiple languages (JavaScript, Solidity)
- Smooth animations and transitions using React Spring
- Dark/light theme compatibility via Docusaurus theming
- Accessible UI with Radix UI components

## Component Structure

- `index.tsx`: Main component export and SVG diagram definition
- `Modal.tsx`: Handles modal dialog display with MDX content
- `NumberComponent.tsx`: Renders numbered circles that can be clicked
- `ButtonComponent.tsx`: Creates interactive hover effects for clickable elements
- `constants.ts`: Defines coordinates and SVG paths for numbered elements
- `types.ts`: TypeScript interface definitions
- `modal-centralized-auction-step-*.mdx`: Content files for each modal step

## Current Implementation

The component is currently implemented to display an interactive diagram of a centralized auction process with five numbered steps:

1. Deposit funds into the auction contract
2. Bidding starts when a new auction round begins
3. Highest bid wins when the auction round ends
4. Winning bid is processed by the sequencer
5. Settled transactions are executed on-chain

Each numbered step can be clicked to reveal a modal with detailed information, code examples, and explanations.

## Customization

The component uses several configuration objects in `constants.ts` to define:

- `coordinates`: Positioning information for each numbered element
- `numberPaths`: SVG path data for rendering each number
- `CIRCLE_RADIUS`: Size of the circular background for numbers

Modal content is loaded from MDX files, allowing for rich formatting and code syntax highlighting.

## Usage

```jsx
import PictureWithClickableNumbers from '@site/src/components/InteractiveDiagrams/PictureWithClickableNumbers';

function MyDocPage() {
  return (
    <div className="my-diagram-container">
      <PictureWithClickableNumbers />
    </div>
  );
}
```

## Animation Behavior

By default, numbers 2, 3, and 4 have pulsing animations to indicate interactivity, while numbers 1 and 5 remain static. This behavior can be customized through the `NumberComponent` props.

## Theming

The component adapts to Docusaurus light and dark themes, using different color schemes for each mode to ensure readability and consistent visual styling.