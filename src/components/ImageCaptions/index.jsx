import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function ImageWithCaption({ src, caption }) {
  return (
    <imageWithCaption style={{ padding: 20, display: 'block', color: 'gray', textAlign: 'center' }}>
      <img src={useBaseUrl(src)} alt={caption} style={{ borderRadius: '0.4rem' }} />
      <imgcaption style={{ display: 'block', marginTop: 8 }}>{`${caption}`}</imgcaption>
    </imageWithCaption>
  );
}
