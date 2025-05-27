import React from 'react';
import CentralizedAuction from './Timeboost/CentralizedAuction';

interface InteractiveDiagramsProps {
  type: string;
}

export default function InteractiveDiagrams({ type }: InteractiveDiagramsProps): JSX.Element {
  switch (type) {
    case 'timeboost-auction':
      return <CentralizedAuction />;
    default:
      return <div>Unknown diagram type: {type}</div>;
  }
}
