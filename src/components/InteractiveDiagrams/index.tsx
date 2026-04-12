import React from 'react';
import CentralizedAuction from './Timeboost/CentralizedAuction';
import EdgeChallengeFlow from './Bold/EdgeChallengeFlow';

interface InteractiveDiagramsProps {
  type: string;
}

export default function InteractiveDiagrams({
  type,
}: InteractiveDiagramsProps): React.ReactElement {
  switch (type) {
    case 'timeboost-auction':
      return <CentralizedAuction />;
    case 'edge-challenge-flow':
      return <EdgeChallengeFlow />;
    default:
      return <div>Unknown diagram type: {type}</div>;
  }
}
