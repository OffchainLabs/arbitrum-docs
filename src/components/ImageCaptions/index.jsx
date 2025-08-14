import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function ImageWithCaption({ src, caption }) {
  return (
    <imageWithCaption style={{ padding: 20, display: 'block', color: 'gray' }}>
      <img src={useBaseUrl(src)} alt={caption} />
      <imgcaption>{`${caption}`}</imgcaption>
    </imageWithCaption>
  );
}
