import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { MermaidReactFlowProps } from './types';

export default function MermaidReactFlow(props: MermaidReactFlowProps) {
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
