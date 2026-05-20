import React from 'react';
import Content from '@theme-original/DocItem/Content';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import { HeaderBadges } from '@site/src/components/HeaderBadges';
import { InteractiveTutorialShell } from '@site/src/components/InteractiveTutorials';

export default function ContentWrapper(props) {
  const { frontMatter } = useDoc();
  const isInteractiveTutorial = frontMatter.interactive_tutorial === true;
  const content = <Content {...props} />;

  return (
    <>
      <HeaderBadges />
      {isInteractiveTutorial ? (
        <InteractiveTutorialShell
          estimatedTime={frontMatter.estimated_time}
          tutorialKind={frontMatter.tutorial_kind}
        >
          {content}
        </InteractiveTutorialShell>
      ) : (
        content
      )}
    </>
  );
}

// This file was generated via `yarn swizzle @docusaurus/theme-classic DocItem/Content` - I selected `wrap` when prompted and then imported & injected the `HeaderBadges` widget. Lines :3 and :9 are the only additions I made.
// docs -> https://docusaurus.io/docs/next/swizzling#wrapping
// other docs -> https://docusaurus.io/docs/next/markdown-features/react#mdx-component-scope
// note that the "other docs" recommend wrapping `@theme/MDXComponents` but this is no longer possible as of docusaurus v2.
