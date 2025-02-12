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
- Compatible with Docusaurus width presets

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

<ImageZoom
  src="path/to/your/image.png"
  alt="Description of the image"
/>
```

### Using Width Presets:

The component is compatible with Docusaurus width presets. Use the alt attribute for image descriptions and className for width:

```mdx
<ImageZoom
  src="/img/example.png"
  alt="My diagram"
  className="500px-img"
/>
```

Available width presets:
- 20px-img
- 50px-img
- 100px-img
- 200px-img
- 400px-img
- 500px-img
- 600px-img
- 900px-img

The component will respect Docusaurus width classes while maintaining the zoom functionality.

## Props

| Prop      | Type     | Required | Description                                    |
|-----------|----------|----------|------------------------------------------------|
| src       | string   | Yes      | The source URL of the image                   |
| alt       | string   | No       | Alt text for accessibility                    |
| className | string   | No       | Width preset class (e.g., "500px-img")       |

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
- Docusaurus SCSS classes for width presets
- Dark overlay (rgba(0, 0, 0, 0.8))
- Proper z-indexing for modal layers
- Hover effects on interactive elements

## Browser Support

Works in all modern browsers that support:
- CSS Flexbox
- React Portals
- ES6 features 
