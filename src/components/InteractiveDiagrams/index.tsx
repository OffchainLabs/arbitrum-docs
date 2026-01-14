import React from 'react';
import CentralizedAuction from './Timeboost/CentralizedAuction';
import TransactionLifecycle from './TransactionLifecycle';

interface InteractiveDiagramsProps {
  type: string;
}

export default function InteractiveDiagrams({ type }: InteractiveDiagramsProps): JSX.Element {
  switch (type) {
    case 'timeboost-auction':
      return <CentralizedAuction />;
    case 'transaction-lifecycle':
      return <TransactionLifecycle />;
    default:
      return <div>Unknown diagram type: {type}</div>;
  }
}
