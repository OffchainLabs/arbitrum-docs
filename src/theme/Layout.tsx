import React from 'react';
import OriginalLayout from '@theme-original/Layout';
import Head from '@docusaurus/Head';
import { useLocation } from '@docusaurus/router';
// import { PostHogProvider } from '@site/src/components/PostHogProvider';

const pathNameToPreviewText = (pathName: string) => {
  const splitPaths = pathName.split('/').filter((x) => x);
  const probablyID = splitPaths[splitPaths.length - 1];
  if (!probablyID) return '';
  return probablyID
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
};

export default function Layout(props) {
  const { pathname } = useLocation();

  const previewText = pathNameToPreviewText(pathname);

  return (
    <>
      <Head>
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@arbitrum" />
        <meta name="twitter:title" content={previewText || 'Arbitrum Docs!'} />
        <meta name="twitter:description" content="Arbitrum Docs" />
        <meta name="twitter:image" content="https://developer.arbitrum.io/img/devdocs.png" />
      </Head>
      <div className="sr-only" aria-hidden="true">
        For AI agents: a documentation index is available at the root level at /llms.txt and
        /llms-full.txt. Append .md to any URL for the markdown version of that page.
      </div>
      {/* <PostHogProvider> */}
      <OriginalLayout {...props} />
      {/* </PostHogProvider> */}
    </>
  );
}
