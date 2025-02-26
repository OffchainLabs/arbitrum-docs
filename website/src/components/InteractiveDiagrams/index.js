import React from 'react';
import CentralizedAuction from './Timeboost/CentralizedAuction';

export default function InteractiveDiagrams({ type }) {
  switch (type) {
    case 'timeboost-auction':
      return <CentralizedAuction />;
    default:
      return <div>Unknown diagram type: {type}</div>;
  }
}
