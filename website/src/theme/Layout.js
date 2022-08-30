import React from "react";
import OriginalLayout from "@theme-original/Layout";
import Head from "@docusaurus/Head";

export default function Layout(props) {
  return (
    <>
      <Head>
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@arbitrum" />
        <meta name="twitter:title" content="Arbitrum Docs!" />
        <meta
          name="twitter:description"
          content="Arbitrum Documentation Center"
        />
        <meta
          name="twitter:image"
          content="https://arbitrum.io/wp-content/uploads/2021/01/cropped-Arbitrum_Horizontal-Logo-Full-color-White-background-scaled-1.jpg"
        />
      </Head>
      <OriginalLayout {...props} />
    </>
  );
}
