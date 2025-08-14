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
- Accessible by default
- Supports width presets via CSS classes

## Installation

The component requires the following dependencies:

```bash
npm install styled-components react-dom
# or
yarn add styled-components react-dom
```

## Usage

IMPORTANT: The component requires zoomed images to be stored in @site/static/img/ directory.

### Basic Usage in MDX:

```mdx
import { ImageZoom } from '@site/src/components/ImageZoom';

<ImageZoom src="/img/example.png" alt="A detailed diagram showing the system architecture" />
```

### Using Width Presets:

The component supports predefined width classes. Use the `className` prop to specify the width while keeping the `alt` text for accessibility:

```mdx
<ImageZoom
  src="/img/example.png"
  alt="A detailed diagram showing the system architecture"
  className="img-500px"
/>
```

Available width classes:

- `img-20px`
- `img-50px`
- `img-100px`
- `img-200px`
- `img-400px`
- `img-500px`
- `img-600px`
- `img-900px`

## Props

| Prop      | Type   | Required | Description                                     |
| --------- | ------ | -------- | ----------------------------------------------- |
| src       | string | Yes      | The source URL of the image                     |
| alt       | string | Yes      | Descriptive text for accessibility              |
| className | string | No       | CSS class for width control (e.g., "img-500px") |

## Accessibility

The component follows accessibility best practices:

- Requires descriptive alt text for screen readers
- Maintains keyboard navigation support
- Preserves semantic HTML structure
- Separates styling from accessibility concerns

## Behavior

1. Initial State:

   - Image is displayed at specified width (via className)
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

The component uses:

- styled-components for modal and zoom functionality
- CSS classes for width presets
- Dark overlay (rgba(0, 0, 0, 0.8))
- Proper z-indexing for modal layers
- Hover effects on interactive elements

## Browser Support

Works in all modern browsers that support:

- CSS Flexbox
- React Portals
- ES6 features
