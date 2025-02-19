import React, { useEffect } from 'react';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import type {Props} from '@theme/NotFound/Content';
import Heading from '@theme/Heading';
import { usePostHog } from 'posthog-js/react';

export default function NotFoundContent({className}: Props): JSX.Element {
  const posthog = usePostHog();

  useEffect(() => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('404_error', {
        timestamp: new Date().toISOString(),
        $current_url: window.location.href,
        referrer: document.referrer,
        userAgent: window.navigator.userAgent,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      });
    }
  }, [posthog]);

  return (
    <main className={clsx('container margin-vert--xl', className)}>
      <div className="row">
        <div className="col col--6 col--offset-3">
          <Heading as="h1" className="hero__title">
            <Translate
              id="theme.NotFound.title"
              description="The title of the 404 page">
              Page Not Found
            </Translate>
          </Heading>
          <p>
            <Translate
              id="theme.NotFound.p1"
              description="The first paragraph of the 404 page">
              We could not find what you were looking for.
            </Translate>
          </p>
          <p>
            <Translate
              id="theme.NotFound.p2"
              description="The 2nd paragraph of the 404 page">
              CONTENT
            </Translate>
          </p>
        </div>
      </div>
    </main>
  );
}
