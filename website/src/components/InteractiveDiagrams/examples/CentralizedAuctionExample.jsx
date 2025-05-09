import React from 'react';
import { FlowChart } from '../PictureWithClickableNumbers';
import { ModalWithPlugin } from '../PictureWithClickableNumbers/ModalWithPlugin';

/**
 * Example component that demonstrates how to use PictureWithClickableNumbers
 * with the modals-as-pages-plugin for content.
 * 
 * This component creates an interactive diagram of the centralized auction process
 * with clickable numbered points. When a point is clicked, a modal opens with
 * content loaded from the plugin registry.
 */
export default function CentralizedAuctionExample() {
  return (
    <div className="centralized-auction-diagram">
      <h2>Centralized Auction Process</h2>
      <p>Click on the numbered points to learn about each step in the process.</p>
      
      <FlowChart 
        id="centralized-auction"
        backgroundImagePath="/img/centralized-auction.svg"
        isSvgBackground={true}
        viewBox="0 0 800 600"
        numbers={[1, 2, 3, 4]}
        dynamicButtons={[1, 2, 3, 4]}
        animatedButtons={[1, 2, 3, 4]}
      >
        {/* Custom modal components that use the modals-as-pages-plugin */}
        <ModalWithPlugin 
          number={1} 
          diagramId="centralized-auction"
          usePlugin={true}
        />
        <ModalWithPlugin 
          number={2} 
          diagramId="centralized-auction"
          usePlugin={true}
        />
        <ModalWithPlugin 
          number={3} 
          diagramId="centralized-auction"
          usePlugin={true}
        />
        <ModalWithPlugin 
          number={4} 
          diagramId="centralized-auction"
          usePlugin={true}
        />
      </FlowChart>
      
      <div className="diagram-notes">
        <h3>Diagram Notes</h3>
        <p>
          This diagram illustrates the complete flow of the centralized auction process
          from deposit to transaction execution. The content for each step is stored in 
          MDX files and loaded dynamically via the modals-as-pages-plugin.
        </p>
        <p>
          Content files are located at:
          <code>content/diagrams/centralized-auction/step-{number}.mdx</code>
        </p>
      </div>
    </div>
  );
}