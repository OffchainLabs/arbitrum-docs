import type { ReactNode } from 'react';

export interface AuctionStep {
  /** Modal heading. */
  title: ReactNode;
  /** One-sentence summary of the step, shown above the list. */
  lead: string;
  /** What happens at this step, in order. */
  points: ReactNode[];
  /** The call or payload the step is about. */
  code: { lang: string; value: string };
  /**
   * Deeper explanation, when upstream linked one. Upstream pointed at `docs.arbitrum.io`; this repo
   * replaces that host and carries the same page, so these are site-relative.
   *
   * Nothing checks them automatically: `check-links` walks `content/docs/**` `.md(x)` only, and it
   * does not validate anchors even there. Both targets were confirmed by hand against the headings
   * in `content/docs/how-arbitrum-works/timeboost/how-to-use-timeboost.mdx`. Re-check them if that
   * page's headings are reworded.
   */
  readMore?: string;
}

/**
 * Content of the five auction steps, transcribed from the Docusaurus
 * `modal-centralized-auction-step-N.mdx` files.
 *
 * They are plain data rather than MDX modules: the text is a fixed part of this widget, not page
 * content a writer edits, and keeping it here means the diagram needs no MDX plumbing of its own.
 * Steps 2 to 4 are the ones the diagram makes clickable, matching upstream; 1 and 5 are numbered
 * markers whose story the surrounding page tells.
 */
export const AUCTION_STEPS: Record<number, AuctionStep> = {
  1: {
    title: 'Step 1: Deposit funds into the auction contract',
    lead: 'Users must first deposit ERC-20 tokens into the auction contract to participate in bidding.',
    points: [
      <>
        Call <code>submitDeposit()</code> on the IExpressLaneAuction contract
      </>,
      "The contract emits a DepositSubmitted event with the bidder's address and amount",
      'Funds are now available for bidding in future auction rounds',
    ],
    code: { lang: 'solidity', value: 'function submitDeposit(uint256 amount) external;' },
  },
  2: {
    title: (
      <>
        Step 2: <code>timeboost_submitBid()</code>
      </>
    ),
    lead: "Users submit bids through the auctioneer's RPC API for the upcoming round.",
    points: [
      'Create a bid with chain ID, round number, and bid amount',
      'Sign the bid data with your private key',
      'Submit the bid via timeboost_submitBid RPC method',
    ],
    code: {
      lang: 'javascript',
      value: `{
  chain_id: "uint64",
  address: "0x...",
  round: "uint64",
  amount: "uint256",
  signature: "0x..."
}`,
    },
    readMore: '/docs/how-arbitrum-works/timeboost/how-to-use-timeboost#step-2-submit-bids',
  },
  3: {
    title: 'Step 3: Auctioneer response',
    lead: 'The auctioneer validates the bid and responds with success or failure.',
    points: [
      'Auctioneer verifies chain ID, round number, and signature',
      'Checks if sender is a depositor with sufficient balance',
      'Returns status OK or an error code if validation fails',
    ],
    code: {
      lang: 'javascript',
      value: `{
  status: "OK" | "ERROR",
  error?: "MALFORMED_DATA" | "NOT_DEPOSITOR" | "WRONG_CHAIN_ID" | "WRONG_SIGNATURE" | "BAD_ROUND_NUMBER" | "INSUFFICIENT_BALANCE"
}`,
    },
    readMore:
      '/docs/how-arbitrum-works/timeboost/how-to-use-timeboost#step-3-find-out-the-winner-of-the-auction',
  },
  4: {
    title: (
      <>
        Step 4: <code>auctioneer_submitBidAuctionTransaction</code>
      </>
    ),
    lead: 'The auctioneer submits the winning bids to resolve the auction.',
    points: [
      'Auctioneer collects and sorts all valid bids for the round',
      'Identifies the two highest bids',
      <>
        Calls <code>resolveAuction()</code> with the winning bids
      </>,
    ],
    code: {
      lang: 'solidity',
      value: 'function resolveAuction(Bid calldata bid1, Bid calldata bid2) external;',
    },
  },
  5: {
    title: 'Step 5: Sequencer prioritizes the auction contract calls',
    lead: 'The sequencer ensures timely processing of auction-related transactions.',
    points: [
      'Auction resolution transactions get priority processing',
      'Winner is declared as express lane controller for the round',
      "Second-highest bid amount is deducted from winner's balance",
      'AuctionResolved event is emitted with the results',
    ],
    code: {
      lang: 'solidity',
      value: `event AuctionResolved(
    uint256 winningBidAmount,
    uint256 loserBidAmount,
    address indexed winningBidder,
    uint256 indexed winnerRound
);`,
    },
  },
};
