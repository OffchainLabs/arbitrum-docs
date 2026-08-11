import Card from '@site/src/components/Cards/Card';
import CustomDetails from '@site/src/components/CustomDetails';
import { FloatingHoverModal } from '@site/src/components/FloatingHoverModal';
import ImageWithCaption from '@site/src/components/ImageCaptions';
import ImageZoom from '@site/src/components/ImageZoom';
import {
  CommandBlock,
  SolidityLab,
  SolidityLabStep,
  TutorialChecklist,
  TutorialStep,
} from '@site/src/components/InteractiveTutorials';
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
  CommandBlock,
  SolidityLab,
  SolidityLabStep,
  TutorialChecklist,
  TutorialStep,
  VanillaAdmonition,
  img: (props) => {
    // Don't wrap images that are explicitly marked to not zoom
    if (props.className?.includes('no-zoom')) {
      return <img {...props} />;
    }
    return <ImageZoom {...props} />;
  },
  // Wide tables need a horizontally scrollable parent: `article` and `.markdown`
  // both set `overflow-x: hidden`, so an unwrapped table wider than the content
  // column has its trailing columns clipped and unreachable on narrow screens.
  // The `div:has(> table)` rules in _content-body.scss / _responsive.scss handle
  // the scrolling once the wrapper is present.
  table: (props) => (
    <div className="table-wrapper">
      <table {...props} />
    </div>
  ),
};
