# Modals-as-Pages Plugin for Docusaurus 3

A Docusaurus 3 plugin that enables MDX content to be loaded dynamically into modals throughout your documentation site. This plugin separates content from presentation, allowing content authors to focus on writing MDX without worrying about component implementation details.

## Overview

The modals-as-pages plugin transforms MDX files into "pages" that can be displayed within modal dialogs anywhere in your Docusaurus site. It's designed to work with any component that needs to display rich content in modals, not just interactive diagrams.

## Features

- 🧩 **Content-Component Separation**: Keep your MDX content separate from UI components
- 📁 **Flexible Content Organization**: Organize content by context, group, and ID
- 🔍 **Built-in Syntax Highlighting**: Code blocks are automatically highlighted
- 🌗 **Theme Support**: Compatible with Docusaurus dark/light themes
- 🔗 **Markdown Support**: Full support for markdown features and links
- 🔄 **Backward Compatibility**: Works with existing interactive diagrams

## How It Works

1. **Content Organization**: MDX files are organized in a directory structure that reflects your content hierarchy:
   ```
   content/
   ├── diagrams/                 # Context: diagrams
   │   └── transaction-flow/     # Group: transaction-flow
   │       ├── step-1.mdx        # Content: step-1
   │       └── step-2.mdx        # Content: step-2
   └── help/                     # Context: help
       └── faq/                  # Group: faq
           └── installation.mdx  # Content: installation
   ```

2. **Plugin Registration**: The plugin scans these directories and builds a registry that maps content identifiers to the actual content.

3. **Content Loading**: Components can then load content by specifying the context, group, and content IDs:
   ```jsx
   <ModalContentLoader
     contextId="diagrams"
     groupId="transaction-flow"
     contentId="step-1"
   />
   ```

## Installation

1. Register the plugin in your `docusaurus.config.js` file:

```javascript
module.exports = {
  plugins: [
    [
      require.resolve('./src/components/InteractiveDiagrams/modals-as-pages-plugin'),
      {
        contentDir: 'src/components/InteractiveDiagrams/content',
        // Optional configuration options
        filePattern: '**/*.mdx',
      },
    ],
  ],
};
```

2. Create your content directory structure and add MDX files.

## Basic Usage

```jsx
import { ModalContentLoader } from '@site/src/components/InteractiveDiagrams/modals-as-pages-plugin/exports';

function MyComponent() {
  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContentLoader
        contextId="diagrams"
        groupId="transaction-flow"
        contentId="step-1"
        fallback={<div>Content not found</div>}
      />
    </Modal>
  );
}
```

## Integration with PictureWithClickableNumbers

The plugin is designed to work seamlessly with the PictureWithClickableNumbers component, allowing you to keep diagram content separate from the presentation.

Example integration:

```jsx
import { FlowChart } from '@site/src/components/InteractiveDiagrams/PictureWithClickableNumbers';
import { ModalContentLoader } from '@site/src/components/InteractiveDiagrams/modals-as-pages-plugin/exports';

// Custom modal component that uses the content loader
function ContentModal({ number, isOpen, onClose, diagramId }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContentLoader
        contextId="diagrams"
        groupId={diagramId}
        contentId={`step-${number}`}
      />
    </Modal>
  );
}

// Diagram with content loaded from MDX files
function CentralizedAuctionDiagram() {
  return (
    <FlowChart
      id="centralized-auction"
      backgroundImagePath="/img/centralized-auction.svg"
      dynamicButtons={[1, 2, 3, 4]}
      animatedButtons={[1, 2, 3, 4]}
      renderModal={(props) => (
        <ContentModal {...props} diagramId="centralized-auction" />
      )}
    />
  );
}
```

## API Reference

### Components

#### `ModalContentLoader`

The main component for loading content from the registry.

```jsx
<ModalContentLoader
  contextId="diagrams"
  groupId="transaction-flow"
  contentId="step-1"
  fallback={<div>Content not found</div>}
  className="custom-modal-content"
/>
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| contextId | string | Yes | Top-level context identifier (e.g., 'diagrams', 'tutorials') |
| groupId | string | Yes | Group identifier within the context (e.g., 'transaction-flow') |
| contentId | string | Yes | Content identifier within the group (e.g., 'step-1') |
| fallback | ReactNode | No | Fallback content if the requested content is not found |
| className | string | No | CSS class name for the content container |

### Utility Hooks

#### `useContentRegistry()`

Returns the complete content registry object.

```jsx
const contentRegistry = useContentRegistry();
```

#### `useContent(contextId, groupId, contentId)`

Returns the content entry for the specified IDs, or null if not found.

```jsx
const content = useContent('diagrams', 'transaction-flow', 'step-1');
if (content) {
  console.log(content.content); // The content text
}
```

#### `useContentExists(contextId, groupId, contentId)`

Checks if content exists for the specified IDs.

```jsx
const exists = useContentExists('diagrams', 'transaction-flow', 'step-1');
if (exists) {
  // Content exists, show a button to open it
}
```

#### `useAvailableGroups(contextId)`

Returns an array of available group IDs for a specific context.

```jsx
const groups = useAvailableGroups('diagrams');
// ['transaction-flow', 'centralized-auction', ...]
```

#### `useAvailableContent(contextId, groupId)`

Returns an array of available content IDs for a specific context and group.

```jsx
const contentIds = useAvailableContent('diagrams', 'transaction-flow');
// ['step-1', 'step-2', 'step-3', ...]
```

### Helper Functions

#### `getDiagramContentParams(diagramId, stepNumber)`

Maps diagram ID and step number to content parameters.

```jsx
const params = getDiagramContentParams('transaction-flow', 1);
// { contextId: 'diagrams', groupId: 'transaction-flow', contentId: 'step-1' }
```

## Backward Compatibility

For backward compatibility with existing code, the plugin provides compatibility components:

### `DiagramContentLoader`

```jsx
<DiagramContentLoader
  diagramId="transaction-flow"
  stepNumber={1}
  fallback={<div>Content not found</div>}
/>
```

This maps to:

```jsx
<ModalContentLoader
  contextId="diagrams"
  groupId="transaction-flow"
  contentId="step-1"
  fallback={<div>Content not found</div>}
/>
```

## Plugin Configuration

### Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| contentDir | string \| string[] | 'src/components/InteractiveDiagrams/content' | Directory or directories containing content files |
| filePattern | string | '**/*.mdx' | Glob pattern to match content files |
| contentIdGenerator | function | (see below) | Function to generate content IDs from file paths |
| transformers | function[] | [] | Array of content transformer functions |

### Default contentIdGenerator

```javascript
function contentIdGenerator(filePath) {
  const parts = filePath.split('/');
  
  if (parts.length < 3) {
    return {
      contextId: 'default',
      groupId: path.dirname(filePath).replace(/\//g, '-'),
      contentId: path.basename(filePath, '.mdx')
    };
  }
  
  return {
    contextId: parts[0],
    groupId: parts[1],
    contentId: path.basename(parts[2], '.mdx')
  };
}
```

### Custom contentIdGenerator

You can provide a custom generator:

```javascript
{
  contentIdGenerator: (filePath) => {
    // Custom logic
    return {
      contextId: /* derived context ID */,
      groupId: /* derived group ID */,
      contentId: /* derived content ID */
    };
  }
}
```

### Content Transformers

Transformers allow you to modify content before it's registered:

```javascript
{
  transformers: [
    (content, { contextId, groupId, contentId }) => {
      // Replace variables, process custom markdown syntax, etc.
      return modifiedContent;
    }
  ]
}
```

## Benefits of the Plugin Approach

1. **Separation of Concerns**: Content and UI components are decoupled, making both easier to maintain.

2. **Better Content Authoring Experience**: Content authors can focus on writing MDX files directly, with proper editor support.

3. **Improved Performance**: Content is processed at build time, not runtime.

4. **Flexibility**: The plugin can be used for any modal content, not just diagrams.

5. **Scalability**: Easily manage hundreds of content files without cluttering component code.

## Use Cases

- Interactive diagrams with step explanations
- Product tours and walkthroughs
- Help tooltips and documentation
- Feature spotlights
- API documentation in modals
- Tutorial steps
- Any component that needs to display rich content in modals