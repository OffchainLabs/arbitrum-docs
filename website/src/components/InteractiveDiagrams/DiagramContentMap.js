import React from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import solidity from 'react-syntax-highlighter/dist/cjs/languages/prism/solidity';
import { useColorMode } from '@docusaurus/theme-common';

// Register languages for syntax highlighting
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('solidity', solidity);

// We'll use raw imports instead of MDX imports
// The actual content will be loaded via the plugin

// We'll use a simpler approach and render the content directly
// This is a placeholder for actual implementation
const MDX_CONTENT = {
  'centralized-auction': {
    1: `# Step 1: Deposit funds into the auction contract

Users must first deposit ERC-20 tokens into the auction contract to participate in bidding.

1. Call \`submitDeposit()\` on the IExpressLaneAuction contract
2. The contract emits a DepositSubmitted event with the bidder's address and amount
3. Funds are now available for bidding in future auction rounds

\`\`\`solidity
function submitDeposit(uint256 amount) external;
\`\`\``,
    2: `# Step 2: \`timeboost_submitBid()\`

Users submit bids through the auctioneer's RPC API for the upcoming round.

1. Create a bid with chain ID, round number, and bid amount
2. Sign the bid data with your private key
3. Submit the bid via timeboost_submitBid RPC method

\`\`\`javascript
{
  chain_id: "uint64",
  address: "0x...",
  round: "uint64",
  amount: "uint256",
  signature: "0x..."
}
\`\`\`

[Read comprehensive explanation](https://docs.arbitrum.io/run-arbitrum-node/how-to-use-timeboost#step-2-submit-bids)`,
    3: `# Step 3: Auctioneer Response

The auctioneer validates the bid and responds with success or failure.

1. Auctioneer verifies chain ID, round number, and signature
2. Checks if sender is a depositor with sufficient balance
3. Returns status OK or an error code if validation fails

\`\`\`javascript
{
  status: "OK" | "ERROR",
  error?: "MALFORMED_DATA" | "NOT_DEPOSITOR" | "WRONG_CHAIN_ID" | "WRONG_SIGNATURE" | "BAD_ROUND_NUMBER" | "INSUFFICIENT_BALANCE"
}
\`\`\`

[Read comprehensive explanation](https://docs.arbitrum.io/run-arbitrum-node/how-to-use-timeboost#step-3-find-out-the-winner-of-the-auction)`,
    4: `# Step 4: \`auctioneer_submitBidAuctionTransaction\`

The auctioneer submits the winning bids to resolve the auction.

1. Auctioneer collects and sorts all valid bids for the round
2. Identifies the two highest bids
3. Calls resolveAuction() with the winning bids

\`\`\`solidity
function resolveAuction(Bid calldata bid1, Bid calldata bid2) external;
\`\`\``,
  },
  // Add other diagrams as needed
};

/**
 * Component that maps diagram IDs and steps to their actual content
 * This simpler approach uses static markdown content instead of importing MDX files
 */
export default function DiagramContentMap({ diagramId, stepNumber, ...props }) {
  // Look up the content from our map
  const content = MDX_CONTENT[diagramId] && MDX_CONTENT[diagramId][stepNumber];

  if (!content) {
    return (
      <div className="diagram-content-error">
        <h2>Missing content</h2>
        <p>
          No content found for diagram "{diagramId}" step {stepNumber}.
        </p>
      </div>
    );
  }

  // We split the markdown content into parts to manually render it
  const parts = content.split('\n\n');

  // Simple markdown-to-react conversion for our limited use case
  return (
    <div className="diagram-content">
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

          // Get the current color mode
          const { isDarkTheme } = useColorMode();

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
                      useColorMode().isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
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
            `<code style="background: ${
              useColorMode().isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            };
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
