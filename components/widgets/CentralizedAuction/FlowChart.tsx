import { AuctionStepMarker } from './AuctionStepMarker';

/**
 * The Timeboost centralized auction diagram.
 *
 * The artwork is brand illustration exported from a design tool, so it lives at
 * `public/img/timeboost-centralized-auction.svg` instead of inline. It carries no logic, and as an
 * asset a re-export replaces one file rather than producing a 2,300-line diff. Its colours stay as
 * authored rather than mapped onto theme tokens, because recolouring it per theme would repaint an
 * illustration, not a UI. The five numbered markers drawn over it are the interactive part and do
 * follow the theme.
 *
 * `role="group"`, not `img`: `img` is a leaf role, so the accessibility tree would drop the dialog
 * triggers inside. As a group, the SVG reports its label and the buttons it contains. The artwork
 * is `aria-hidden` because the prose around the diagram already explains the flow it illustrates.
 *
 * `pointer-events: none` keeps the artwork from swallowing clicks. The markers set
 * `pointer-events: all` in `styles.module.css`.
 */
export function FlowChart() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1600 900"
      role="group"
      aria-label="Timeboost centralized auction flow"
      style={{ pointerEvents: 'none' }}
    >
      <image
        href="/img/timeboost-centralized-auction.svg"
        width={1600}
        height={900}
        aria-hidden="true"
      />
      <AuctionStepMarker step={1} />
      <AuctionStepMarker step={2} interactive />
      <AuctionStepMarker step={3} interactive />
      <AuctionStepMarker step={4} interactive />
      <AuctionStepMarker step={5} />
    </svg>
  );
}
