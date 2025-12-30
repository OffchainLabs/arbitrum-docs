import React from 'react';

export const HeaderBadges = () => {
  const [href, setHref] = React.useState('');

  React.useEffect(() => {
    // Client-side only: build the GitHub issue URL
    const pathname = new URL(window.location.href).pathname;
    const url = window.location.href;
    setHref(
      `https://github.com/OffchainLabs/arbitrum-docs/issues/new?title=Docs update request: ${pathname}&body=Source: ${url}%0A%0ARequest: (how can we help?)%0A%0APsst, this issue will be closed with a templated response if it isn't a documentation update request.`,
    );
  }, []);

  // Always render the structure, just update href on client
  return (
    <div className="header-badges">
      <a
        className="header-badge"
        href={href || '#'}
        onClick={(e) => {
          if (!href) e.preventDefault();
        }}
      >
        <span className="badge-avatar emoji-avatar">✏️</span>
        <span className="badge-label">Request an update</span>
      </a>
    </div>
  );
};

/*debt: some components and css (eg header badges) are duplicated between repos */
