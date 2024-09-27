import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

export const ClickableDiagram = () => {
  return (
    <BrowserOnly>
      {() => (
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="180" height="180" fill="lightblue" />
          <text x="50" y="100" font-size="20" fill="black">
            Click Me!
          </text>
          <a href="https://example.com">
            <circle cx="100" cy="100" r="50" fill="green" />
          </a>
        </svg>
      )}
    </BrowserOnly>
  );
};
