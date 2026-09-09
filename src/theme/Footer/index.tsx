import { Quicklooks } from '@site/src/components/Quicklooks';
import Footer from '@theme-original/Footer';
import React from 'react';

export default function FooterWrapper(props: Record<string, unknown>) {
  return (
    <>
      <Quicklooks />
      <Footer {...props} />
    </>
  );
}
