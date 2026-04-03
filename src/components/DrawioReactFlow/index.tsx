import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { DrawioReactFlowProps } from './types';

export default function DrawioReactFlow(props: DrawioReactFlowProps) {
  return (
    <BrowserOnly
      fallback={
        <div
          style={{
            height: props.height || '500px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Loading diagram...
        </div>
      }
    >
      {() => {
        const { NavigableDiagram } = require('./NavigableDiagram');
        return <NavigableDiagram {...props} />;
      }}
    </BrowserOnly>
  );
}
