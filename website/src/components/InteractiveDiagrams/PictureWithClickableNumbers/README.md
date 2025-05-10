# Interactive Diagram Component

This component creates interactive diagrams with numbered elements that can be clicked to reveal detailed information in modal dialogs. It supports both SVG and static image backgrounds, making it versatile for explaining complex processes through step-by-step visual explanations.

The main export is `FlowChart`, which is the component you should use directly for most cases. The default export `PictureWithClickableNumbers` is a wrapper around `FlowChart` for backward compatibility.

## Features

- Interactive diagrams with clickable numbered points
- Support for three background types:
  - Default SVG (built-in)
  - External SVG files
  - Static images from /website/static/img/
- Smooth color-cycling animations on numbered elements for visual emphasis
- Modal dialogs with rich content (text, code, images)
- Syntax highlighting for code examples
- Optimized animations using React Spring with consistent opacity
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
import { FlowChart } from '@site/src/components/InteractiveDiagrams/PictureWithClickableNumbers';

function MyDocPage() {
  return (
    <FlowChart 
      id="my-diagram"
      dynamicButtons={[2, 3, 4]}    // Make buttons 2, 3, and 4 dynamic (clickable)
      animatedButtons={[2, 3, 4]}   // Animate those same buttons
    />
  );
}
```

### With External SVG Background and Custom Dynamic Buttons

```jsx
import { FlowChart } from '@site/src/components/InteractiveDiagrams/PictureWithClickableNumbers';

function MyDocPage() {
  return (
    <FlowChart 
      id="custom-diagram"
      backgroundImagePath="/img/my-diagram.svg"
      isSvgBackground={true}
      viewBox="0 0 800 600"
      numbers={[1, 2, 3, 4]} // Show buttons 1-4 only
      // Specify which numbers should be dynamic (with circles and interactivity)
      dynamicButtons={[2, 3, 4]}
      // Specify which of the dynamic buttons should be animated
      animatedButtons={[2, 3]}
      customCoordinates={{
        1: { 
          circle: { x: 100, y: 200 }, 
          path: { x: 96, y: 198 }, 
          offset: { x: -4, y: -2 } 
        },
        // Add coordinates for numbers 2-4
      }}
    />
  );
}
```

### With Static Image Background

```jsx
import { FlowChart } from '@site/src/components/InteractiveDiagrams/PictureWithClickableNumbers';

function MyDocPage() {
  return (
    <FlowChart 
      id="image-diagram"
      backgroundImagePath="/img/my-architecture-diagram.png"
      isSvgBackground={false}
      viewBox="0 0 800 600"
      numbers={[1, 2, 3, 4, 5]}   // Show all five buttons
      dynamicButtons={[1, 3, 5]}  // Make only buttons 1, 3, and 5 dynamic
      animatedButtons={[3]}       // Only animate button 3
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
import { FlowChart } from '@site/src/components/InteractiveDiagrams/PictureWithClickableNumbers';
import { Modal } from '@site/src/components/InteractiveDiagrams/PictureWithClickableNumbers/Modal';

function MyDocPage() {
  return (
    <FlowChart 
      id="custom-content-diagram"
      dynamicButtons={[2]}  // Make button 2 dynamic so it can be clicked
      animatedButtons={[2]} // Also animate button 2
    >
      <Modal 
        number={2} 
        customContent={() => (
          <div>
            <h2>Custom Step Content</h2>
            <p>This replaces the default content for step 2.</p>
          </div>
        )} 
      />
    </FlowChart>
  );
}
```

## Props

### FlowChart Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| id | string | 'default' | Unique identifier for this diagram instance |
| backgroundImagePath | string | undefined | Path to SVG or image file to use as background |
| isSvgBackground | boolean | true | Whether the background is an SVG (true) or static image (false) |
| viewBox | string | '0 0 1600 900' | Custom SVG viewBox dimensions |
| backgroundElements | ReactNode | undefined | Custom background SVG elements |
| numbers | Array<1\|2\|3\|4\|5> | [1,2,3,4,5] | Numbered elements to display in the diagram |
| dynamicButtons | Array<1\|2\|3\|4\|5> | undefined | Which buttons should be dynamic (with circle backgrounds and interactivity) |
| animatedButtons | Array<1\|2\|3\|4\|5> | undefined | Which dynamic buttons should be animated with color transitions |
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

The animation cycles between orange and blue colors while maintaining full opacity. You configure which buttons are dynamic (with circle backgrounds) and which of those dynamic buttons are animated using the `dynamicButtons` and `animatedButtons` props:

```jsx
<FlowChart
  /* other props */
  numbers={[2, 3, 4]}         // Only include buttons 2, 3, and 4 in the diagram
  dynamicButtons={[2, 3, 4]}  // Make all included buttons dynamic (with clickable circles)
  animatedButtons={[2, 3, 4]} // Animate all dynamic buttons
/>
```

The animation uses React Spring for smooth transitions and is optimized to ensure the background never becomes transparent during animation cycles. Note that:

1. The `numbers` prop defines which numbered elements will be shown
2. The `dynamicButtons` prop determines which of those elements get circle backgrounds and interactivity
3. The `animatedButtons` prop specifies which dynamic buttons will have color-cycling animations

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
- Highlighting important elements in complex images

## Animation Details

The button animation system is designed for visual clarity and user guidance:

- Color transitions smoothly cycle between orange (`#ff7f2a`) and blue (`#3578e5`) 
- All animated elements maintain 100% opacity throughout the animation cycle
- Hovering over dynamic buttons increases brightness for additional visual feedback
- Animation is implemented with React Spring for smooth, performant transitions
- Dynamic buttons support both desktop mouse interactions and touch devices

### Button Configurations

The component supports different button configurations based on the combinations of the `numbers`, `dynamicButtons`, and `animatedButtons` props:

1. **Static Buttons (Default)**: 
   - Simple number display without circle background
   - Non-interactive (not clickable)
   - No animation effects
   - A button is static if it's in `numbers` but not in `dynamicButtons`

2. **Dynamic Buttons**:
   - Circle background with number overlay
   - Interactive (clickable)
   - Configurable with the `dynamicButtons` prop
   - A button is dynamic if it's in both `numbers` and `dynamicButtons`

3. **Animated Dynamic Buttons**:
   - Circle background with color transitions
   - Must be included in both `dynamicButtons` and `animatedButtons` props
   - Full interactivity and hover effects
   - A button is animated if it's in all three arrays: `numbers`, `dynamicButtons`, and `animatedButtons`

For example, to create a diagram with buttons 1-4 where 2 and 3 are dynamic and animated but 1 and 4 are static:

```jsx
<FlowChart
  numbers={[1, 2, 3, 4]}      // Show buttons 1, 2, 3, 4
  dynamicButtons={[2, 3]}     // Only buttons 2 and 3 will be dynamic
  animatedButtons={[2, 3]}    // Buttons 2 and 3 will be animated
  {...otherProps}
/>
```
