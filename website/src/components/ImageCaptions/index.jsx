import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function ImageWithCaption({ src, caption }) {
  console.log('src', src);
  return (
    <div style={{ padding: 20, display: 'block', color: 'gray' }}>
      <img src={src} alt={caption} />
      <figcaption>{`${caption}`}</figcaption>
    </div>
  );
}
