import React, { useEffect } from 'react';
import useIsBrowser from '@docusaurus/useIsBrowser';
import { useLocation } from '@docusaurus/router';
import Tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';
import glossary from '../../../static/glossary.json';

export const Quicklooks = () => {
  // todo:qqq - document usage of this component for nontechnical content contributors
  const isBrowser = useIsBrowser();
  const location = useLocation();

  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    Tippy('a[data-quicklook-from]:not([data-quicklook-enabled])', {
      trigger: 'mouseenter',
      duration: [100, 200],
      theme: 'light-border',
      allowHTML: true,
      interactive: true,
      content: (reference) => {
        reference.setAttribute('data-quicklook-enabled', 'true');
        let contentSourceKey = reference.getAttribute('data-quicklook-from');
        let termItem = glossary[contentSourceKey];
        if (!termItem) {
          console.warn(`WARNING: No quicklook entry found for ${contentSourceKey}`);
          return undefined;
        }
        return termItem.text;
      },
    });
    // re-render tippys when location (page) changes
  }, [isBrowser, location]);

  return <></>;
};
