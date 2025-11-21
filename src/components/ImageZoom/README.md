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
- Optional image captions

## Installation

The component requires the following dependencies:

```bash
npm install react-dom
# or
yarn add react-dom
```

## Usage

IMPORTANT: The component requires zoomed images to be stored in @site/static/img/ directory.

The ImageZoom component is globally available in all MDX files via the MDXComponents configuration. You do not need to import it.

### Basic Usage in MDX:

```mdx
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

### Using Captions:

You can add an optional caption that displays below the image. There are two ways to add captions:

**Method 1: Using the `caption` prop (legacy support):**

```mdx
<ImageZoom
  src="/img/example.png"
  alt="A detailed diagram showing the system architecture"
  caption="Transaction lifecycle diagram showing the complete flow"
/>
```

**Method 2: Using children (recommended):**

```mdx
<ImageZoom src="/img/example.png" alt="A detailed diagram showing the system architecture">
  Transaction lifecycle diagram showing the complete flow
</ImageZoom>
```

You can combine width presets with captions:

```mdx
<ImageZoom
  src="/img/example.png"
  alt="A detailed diagram showing the system architecture"
  className="img-500px"
>
  Transaction lifecycle diagram showing the complete flow
</ImageZoom>
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

| Prop      | Type            | Required | Description                                                        |
| --------- | --------------- | -------- | ------------------------------------------------------------------ |
| src       | string          | Yes      | The source URL of the image                                        |
| alt       | string          | No       | Descriptive text for accessibility                                 |
| className | string          | No       | CSS class for width control (e.g., "img-500px")                    |
| caption   | string          | No       | Optional caption text displayed below the image (legacy support)   |
| children  | React.ReactNode | No       | Caption content passed as children (recommended over caption prop) |

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

- Inline styles for all styling (no styled-components dependency)
- Semantic HTML (`<figure>` and `<figcaption>`) for proper structure
- CSS classes for width presets
- Docusaurus CSS variables for theme-aware styling (`--ifm-color-emphasis-600`)
- Dark overlay (rgba(0, 0, 0, 0.8))
- Proper z-indexing for modal layers (99999 for modal, 100000 for close button)
- Hover effects on interactive elements
- Centered, italic captions with appropriate spacing (0.5rem top margin, 0.9rem font size)

## Browser Support

Works in all modern browsers that support:

- CSS Flexbox
- React Portals
- ES6 features
