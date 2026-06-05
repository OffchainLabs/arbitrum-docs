# FloatingHoverModal Component

The `FloatingHoverModal` component provides a hover-activated modal for displaying supplementary content in a floating overlay. It's particularly useful for showing detailed information about configuration options without requiring page navigation.

## Usage

```jsx
import { FloatingHoverModal } from '@site/src/components/FloatingHoverModal';

// In your MDX or React component:
<FloatingHoverModal href="/launch-arbitrum-chain/partials/config-custom-gas-token.mdx">
  Custom gas token
</FloatingHoverModal>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `href` | string | Yes | Path to the MDX partial file containing the modal content. Must match the pattern `/partials/{content-key}.mdx` |
| `children` | ReactNode | Yes | The trigger text that users hover over to display the modal |

## How It Works

1. The component extracts a content key from the `href` prop (e.g., `config-custom-gas-token` from `/launch-arbitrum-chain/partials/config-custom-gas-token.mdx`)
2. It maps this key to a statically imported MDX component
3. On hover (with a 300ms delay), it displays the content in a floating modal
4. The modal is positioned automatically using `@floating-ui/react` with smart placement

## Adding New Content

To add new hoverable content:

1. Create your MDX partial file in the appropriate directory (e.g., `/docs/launch-arbitrum-chain/partials/`)
2. Import the MDX file in `src/components/FloatingHoverModal/index.js`:
   ```javascript
   import ConfigYourContent from '@site/docs/launch-arbitrum-chain/partials/config-your-content.mdx';
   ```
3. Add the mapping to the `contentMap` object:
   ```javascript
   const contentMap = {
     // ... existing mappings
     'config-your-content': ConfigYourContent,
   };
   ```
4. Use the component in your documentation:
   ```jsx
   <FloatingHoverModal href="/launch-arbitrum-chain/partials/config-your-content.mdx">
     Your trigger text
   </FloatingHoverModal>
   ```

## Styling

The component comes with predefined styles in `styles.css` that:
- Display the trigger text with a dotted underline
- Show a styled modal with a close button
- Support dark mode automatically
- Include responsive design for mobile devices
- Style MDX content elements (headings, paragraphs, lists, tables, links, etc.)

## Features

- **Hover activation**: Modal appears on hover with a 300ms delay
- **Keyboard accessible**: Can be triggered via keyboard focus
- **Auto-positioning**: Automatically adjusts position to stay within viewport
- **Portal rendering**: Renders in a portal to avoid z-index issues
- **MDX support**: Full support for MDX content with custom component styling
- **Responsive**: Adapts to mobile viewports
- **Dark mode**: Automatically adapts to the site's theme

## Example

Here's how it's used in the configuration options page:

```jsx
<table>
  <tr>
    <td>Gas & Tokens</td>
    <td>
      <FloatingHoverModal href="/launch-arbitrum-chain/partials/config-custom-gas-token.mdx">
        Custom gas token
      </FloatingHoverModal> or{' '}
      <FloatingHoverModal href="/launch-arbitrum-chain/partials/config-native-eth.mdx">
        Native ETH gas
      </FloatingHoverModal>
    </td>
  </tr>
</table>
```

## Notes

- The component uses static imports to avoid CSP issues
- Content must be pre-imported and mapped in the component file
- The modal includes a close button (×) in the top-right corner
- The component is styled as a button to ensure proper accessibility
