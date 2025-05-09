import React from 'react';

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
          const codeContent = part.split('\n').slice(1, -1).join('\n');
          return (
            <pre key={i}>
              <code className="language-solidity">{codeContent}</code>
            </pre>
          );
        }

        // List handling
        if (part.includes('\n1. ')) {
          const items = part.split('\n').filter((line) => line.match(/^\d+\./));
          return (
            <ol key={i}>
              {items.map((item, j) => (
                <li key={j}>{item.replace(/^\d+\.\s+/, '')}</li>
              ))}
            </ol>
          );
        }

        // Regular paragraph
        return <p key={i} dangerouslySetInnerHTML={{ __html: part }} />;
      })}
    </div>
  );
}
