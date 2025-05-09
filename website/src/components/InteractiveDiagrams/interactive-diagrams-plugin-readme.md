# Interactive Diagrams Plugin

## Overview

The `interactive-diagrams-plugin` is a Docusaurus plugin that enables dynamic loading of MDX content into interactive diagram modals. It creates a registry of MDX content files that can be referenced by diagram IDs and step numbers, allowing for a more maintainable and scalable approach to managing complex interactive documentation.

## How It Works

The plugin scans specified directories for MDX partial files that follow a naming convention tied to diagram IDs and step numbers. It then builds a registry that maps these relationships, making the content available to the InteractiveDiagrams component at runtime through Docusaurus's global data system.

```
Plugin Architecture:
┌─────────────────────────┐
│  MDX Content Files      │
│  /diagrams/             │
│    /centralized-auction │
│      _step-1.mdx        │
│      _step-2.mdx        │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  interactive-diagrams-  │
│  plugin (index.js)      │
│                         │
│  • Scans content files  │
│  • Builds registry      │
│  • Provides global data │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  DiagramContentLoader   │
│                         │
│  • Loads content by ID  │
│  • Renders in modals    │
└─────────────────────────┘
```

## Benefits of the Plugin Approach

### 1. Separation of Concerns

The plugin approach separates content from presentation, following best practices in software architecture. This makes the codebase more maintainable as content writers can focus on writing MDX without understanding the component implementation details.

> "Separation of concerns is a design principle for separating a computer program into distinct sections such that each section addresses a separate concern." - [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/App_structure#separation_of_concerns)

### 2. Better Developer Experience

Content can be authored in separate MDX files with proper syntax highlighting, linting, and editor support, rather than being embedded as strings within JavaScript files.

> "MDX allows you to use JSX in your markdown content. You can import components and use them right alongside your Markdown. This unlocks new workflows for developers and content authors alike." - [MDX Official Documentation](https://mdxjs.com/)

### 3. Runtime Performance

The plugin processes MDX content at build time rather than at runtime, which improves performance by avoiding unnecessary processing during user interactions.

> "Docusaurus optimizes builds by pre-rendering content at build time instead of on each request." - [Docusaurus Documentation](https://docusaurus.io/docs/3.6.3/advanced/architecture)

### 4. Scalability

As the number of interactive diagrams grows, managing embedded content in component files becomes unwieldy. The plugin approach scales better to handle dozens or hundreds of diagrams with multiple steps each.

> "One of the most important aspects of software architecture is managing complexity as your application grows." - [Martin Fowler, Software Architecture Guide](https://martinfowler.com/architecture/)

### 5. Built-in Plugin System

Docusaurus is designed with a plugin architecture, making this approach aligned with the framework's design philosophy.

> "Docusaurus has been designed from the ground up to be extensible through plugins." - [Docusaurus Plugin System](https://docusaurus.io/docs/3.6.3/api/plugins)

### 6. Improved Content Workflow

Content authors can create and update diagram content without touching React components:

1. Create a new MDX file in the appropriate directory
2. Follow the naming convention to associate with a diagram and step
3. Write content using full MDX capabilities
4. The plugin automatically includes the content in the registry

> "The best developer experience comes from tools that get out of your way and let you focus on what matters." - [Next.js Documentation](https://nextjs.org/docs)

## Implementation Details

### Plugin Registration

The plugin is registered in the Docusaurus configuration file:

```javascript
// docusaurus.config.js
module.exports = {
  // ... other configuration
  plugins: [
    // ... other plugins
    [
      'interactive-diagrams-plugin',
      {
        contentDir: 'src/components/InteractiveDiagrams/content',
        // Optional: custom file pattern for MDX content files
        filePattern: '**/_step-*.mdx',
      },
    ],
  ],
};
```

### Content Naming Convention

MDX content files follow a naming convention to associate them with diagrams and steps:

```
src/components/InteractiveDiagrams/content/
  ├── centralized-auction/
  │   ├── _step-1.mdx
  │   ├── _step-2.mdx
  │   ├── _step-3.mdx
  │   └── _step-4.mdx
  └── transaction-lifecycle/
      ├── _step-1.mdx
      ├── _step-2.mdx
      └── _step-3.mdx
```

### Registry Structure

The plugin builds a registry with this structure:

```javascript
{
  diagramRegistry: {
    'centralized-auction': {
      1: { relativePath: 'centralized-auction/_step-1.mdx', content: '...' },
      2: { relativePath: 'centralized-auction/_step-2.mdx', content: '...' },
      // Additional steps
    },
    'transaction-lifecycle': {
      1: { relativePath: 'transaction-lifecycle/_step-1.mdx', content: '...' },
      // Additional steps
    },
    // Additional diagrams
  }
}
```

### Content Loading

The `DiagramContentLoader` component accesses this registry through Docusaurus's global data system:

```javascript
import { usePluginData } from '@docusaurus/useGlobalData';

export default function DiagramContentLoader({ diagramId, stepNumber }) {
  const { diagramRegistry = {} } = usePluginData('interactive-diagrams-plugin') || {};
  
  // Check if content exists and render appropriately
  // ...
}
```

## Comparison with Alternatives

### Alternative 1: Hardcoded Content in Components

**Problems:**
- Mixes content with presentation code
- Difficult to maintain as content grows
- Poor authoring experience for content writers
- No separation between content and UI logic

### Alternative 2: Dynamic Imports of MDX Files

**Problems:**
- Requires complex webpack configuration
- Each import creates a separate chunk, leading to performance issues
- No centralized registry of available content
- Difficult to implement cross-referencing between diagrams

### Alternative 3: External CMS Integration

**Problems:**
- Adds external dependencies
- Requires internet connection for development
- More complex setup and maintenance
- Not integrated with the Git workflow

## Conclusion

The plugin-based approach to loading MDX content for interactive diagrams is superior to alternatives because it:

1. Follows the architectural principle of separation of concerns
2. Provides a better authoring experience for content writers
3. Leverages Docusaurus's built-in plugin system
4. Scales well as the number of diagrams and steps increases
5. Improves build-time optimization and runtime performance
6. Maintains a centralized registry for content discovery

By using this approach, the documentation system becomes more maintainable, scalable, and provides a better experience for both developers and content authors.

## References

1. Docusaurus Plugin System: https://docusaurus.io/docs/3.6.3/api/plugins
2. MDX Documentation: https://mdxjs.com/
3. Separation of Concerns: https://en.wikipedia.org/wiki/Separation_of_concerns
4. Webpack Code Splitting: https://webpack.js.org/guides/code-splitting/
5. Martin Fowler on Software Architecture: https://martinfowler.com/architecture/
6. React Documentation on Code Splitting: https://react.dev/reference/react/lazy