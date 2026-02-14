import React from 'react';
import CentralizedAuction from './Timeboost/CentralizedAuction';

interface InteractiveDiagramsProps {
  type: string;
}

export default function InteractiveDiagrams({
  type,
}: InteractiveDiagramsProps): React.ReactElement {
  switch (type) {
    case 'timeboost-auction':
      return <CentralizedAuction />;
    default:
      return <div>Unknown diagram type: {type}</div>;
  }
}
