import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

export const HeaderBadges = () => {
  return (
    <BrowserOnly>
      {() => (
        <div className="header-badges">
          <a
            className="header-badge"
            href={`https://github.com/anegg0/arb-docs/issues/new?title=Docs update request: ${
              new URL(window.location.href).pathname
            }&body=Source: ${
              window.location.href
            }%0A%0ARequest: (how can we help?)%0A%0APsst, this issue will be closed with a templated response if it isn't a documentation update request.`}
          >
            <span className="badge-avatar emoji-avatar">✏️</span>
            <span className="badge-label">Request an update</span>
          </a>
        </div>
      )}
    </BrowserOnly>
  );
};

/*debt: some components and css (eg header badges) are duplicated between repos */
