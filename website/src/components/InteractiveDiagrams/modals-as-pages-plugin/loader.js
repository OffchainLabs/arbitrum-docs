import React from 'react';
import { usePluginData } from '@docusaurus/useGlobalData';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import solidity from 'react-syntax-highlighter/dist/cjs/languages/prism/solidity';
import { useColorMode } from '@docusaurus/theme-common';

// Register languages for syntax highlighting
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('solidity', solidity);

/**
 * Component that loads content from the modals-as-pages plugin registry.
 *
 * @param {object} props Component props
 * @param {string} props.contextId The context identifier (e.g., 'diagrams', 'tutorials')
 * @param {string} props.groupId The group identifier (e.g., 'transaction-flow', 'getting-started')
 * @param {string} props.contentId The content identifier (e.g., 'step-1', 'welcome')
 * @param {React.ReactNode} props.fallback Optional fallback content if the requested content is not found
 * @param {string} props.className Optional CSS class name for the content container
 * @returns {React.ReactElement} The content component
 */
export default function ModalContentLoader({
  contextId,
  groupId,
  contentId,
  fallback = null,
  className = '',
}) {
  // Access the content registry from plugin data
  const { contentRegistry = {} } = usePluginData('modals-as-pages-plugin') || {};

  // Check if content exists
  const hasContent = contentRegistry[contextId]?.[groupId]?.[contentId];

  if (!hasContent) {
    if (fallback) return fallback;
    return (
      <div className="modal-content-error">
        <h2>Missing content</h2>
        <p>
          Could not find content for context "{contextId}", group "{groupId}", content "{contentId}
          ".
        </p>
      </div>
    );
  }

  // Get the content
  const { content } = contentRegistry[contextId][groupId][contentId];

  // We split the markdown content into parts to manually render it
  const parts = content.split('\n\n');

  // Get the current color mode
  const { isDarkTheme } = useColorMode();

  // Simple markdown-to-react conversion for our limited use case
  return (
    <div className={`modal-content ${className}`}>
      {parts.map((part, i) => {
        // Title handling
        if (part.startsWith('# ')) {
          return (
            <h1 key={i} className="modal__title">
              {part.substring(2)}
            </h1>
          );
        }

        // Code block handling
        if (part.startsWith('```')) {
          const codeLines = part.split('\n');
          // Extract language from the first line, e.g. ```solidity => solidity
          const languageMatch = codeLines[0].match(/^```(\w+)$/);
          // Default to javascript if no language is specified
          const language = languageMatch ? languageMatch[1] : 'javascript';
          const codeContent = codeLines.slice(1, -1).join('\n');

          return (
            <div key={i} style={{ position: 'relative', margin: '1rem 0' }}>
              <SyntaxHighlighter
                language={language}
                style={isDarkTheme ? oneDark : oneLight}
                customStyle={{
                  margin: 0,
                  padding: '16px',
                  borderRadius: '4px',
                  backgroundColor: isDarkTheme ? 'rgb(41, 45, 62)' : 'rgb(246, 248, 250)',
                  fontSize: '0.9em',
                }}
              >
                {codeContent}
              </SyntaxHighlighter>
            </div>
          );
        }

        // List handling
        if (part.includes('\n1. ')) {
          const items = part.split('\n').filter((line) => line.match(/^\d+\./));
          return (
            <ol key={i} style={{ paddingLeft: '1.5rem', margin: '1rem 0' }}>
              {items.map((item, j) => {
                const content = item.replace(/^\d+\.\s+/, '');
                // Check if the content contains inline code
                const formattedContent = content.replace(
                  /`([^`]+)`/g,
                  (_, code) =>
                    `<code style="background: ${
                      isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                    };
                  padding: 2px 4px; border-radius: 3px; font-family: monospace;">${code}</code>`,
                );

                return (
                  <li
                    key={j}
                    style={{ margin: '0.5rem 0' }}
                    dangerouslySetInnerHTML={{ __html: formattedContent }}
                  />
                );
              })}
            </ol>
          );
        }

        // Regular paragraph with link and inline code handling
        let processedContent = part;

        // Handle inline code
        processedContent = processedContent.replace(
          /`([^`]+)`/g,
          (_, code) =>
            `<code style="background: ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
          padding: 2px 4px; border-radius: 3px; font-family: monospace;">${code}</code>`,
        );

        // Handle links [text](url)
        processedContent = processedContent.replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          (_, text, url) =>
            `<a href="${url}" target="_blank" rel="noopener noreferrer" 
             style="color: var(--ifm-link-color); text-decoration: none; font-weight: 500;">${text}</a>`,
        );

        return (
          <p
            key={i}
            style={{ margin: '1rem 0', lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        );
      })}
    </div>
  );
}
