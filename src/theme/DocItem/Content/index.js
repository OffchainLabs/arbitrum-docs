import React from 'react';
import Content from '@theme-original/DocItem/Content';
import { HeaderBadges } from '@site/src/components/HeaderBadges';

export default function ContentWrapper(props) {
  return (
    <>
      <HeaderBadges />
      <Content {...props} />
    </>
  );
}

// This file was generated via `yarn swizzle @docusaurus/theme-classic DocItem/Content` - I selected `wrap` when prompted and then imported & injected the `HeaderBadges` widget. Lines :3 and :9 are the only additions I made.
// docs -> https://docusaurus.io/docs/next/swizzling#wrapping
// other docs -> https://docusaurus.io/docs/next/markdown-features/react#mdx-component-scope
// note that the "other docs" recommend wrapping `@theme/MDXComponents` but this is no longer possible as of docusaurus v2.
