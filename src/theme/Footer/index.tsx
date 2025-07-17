import React from 'react';
import Footer from '@theme-original/Footer';
import { Quicklooks } from '@site/src/components/Quicklooks';

export default function FooterWrapper(props) {
  return (
    <>
      <Quicklooks />
      <Footer {...props} />
    </>
  );
}
