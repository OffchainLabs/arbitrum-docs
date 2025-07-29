import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import ImageZoom from '@site/src/components/ImageZoom';

export default {
  ...MDXComponents,
  img: (props) => {
    // Don't wrap images that are explicitly marked to not zoom
    if (props.className?.includes('no-zoom')) {
      return <img {...props} />;
    }
    return <ImageZoom {...props} />;
  },
};
