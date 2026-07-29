import Card from '@site/src/components/Cards/Card';
import CustomDetails from '@site/src/components/CustomDetails';
import { FloatingHoverModal } from '@site/src/components/FloatingHoverModal';
import ImageWithCaption from '@site/src/components/ImageCaptions';
import ImageZoom from '@site/src/components/ImageZoom';
import { VanillaAdmonition } from '@site/src/components/VanillaAdmonition';
import MDXComponents from '@theme-original/MDXComponents';
import React from 'react';

export default {
  ...MDXComponents,
  Card,
  CustomDetails,
  FloatingHoverModal,
  ImageWithCaption,
  ImageZoom,
  VanillaAdmonition,
  img: (props) => {
    // Don't wrap images that are explicitly marked to not zoom
    if (props.className?.includes('no-zoom')) {
      return <img {...props} />;
    }
    return <ImageZoom {...props} />;
  },
};
