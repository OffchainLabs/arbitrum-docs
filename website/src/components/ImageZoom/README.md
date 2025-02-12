# ImageZoom Component

A React component that adds a click-to-zoom feature to images with smooth animations and a modern UI.

## Features

- Click-to-zoom functionality
- Responsive sizing (max 90% of viewport)
- Dark overlay background
- Close on overlay click, escape key, or close button
- Mobile-friendly
- Loading state indicator
- Error handling
- Maintains image aspect ratio

## Installation

The component requires the following dependencies:

```bash
npm install styled-components react-dom
# or
yarn add styled-components react-dom
```

## Usage

### In MDX files:

```mdx
import { ImageZoom } from '@site/src/components/ImageZoom';

<ImageZoom
  src="path/to/your/image.png"
  alt="Description of the image"
  className="optional-custom-class"
/>
```

### In React components:

```tsx
import { ImageZoom } from '@site/src/components/ImageZoom';

function YourComponent() {
  return (
    <ImageZoom
      src="/images/example.png"
      alt="Example image"
      className="optional-styling"
    />
  );
}
```

## Props

| Prop      | Type     | Required | Description                                    |
|-----------|----------|----------|------------------------------------------------|
| src       | string   | Yes      | The source URL of the image                   |
| alt       | string   | No       | Alt text for accessibility                    |
| className | string   | No       | Additional CSS class name for custom styling  |

## Behavior

1. Initial State:
   - Image is displayed at normal size
   - Cursor changes to zoom-in on hover

2. On Click:
   - Dark overlay appears
   - Image is centered and scaled to fit viewport
   - Close button appears in top-right corner
   - Loading indicator shows while image loads

3. Closing:
   - Click overlay background
   - Click close button
   - Press Escape key

## Styling

The component uses styled-components and includes:
- Responsive image sizing
- Dark overlay (rgba(0, 0, 0, 0.8))
- Proper z-indexing for modal layers
- Hover effects on interactive elements

## Browser Support

Works in all modern browsers that support:
- CSS Flexbox
- React Portals
- ES6 features 