import React from 'react';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import type { Props } from '@theme/NotFound/Content';
import Heading from '@theme/Heading';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

const POSTHOG_API_KEY = 'phc_AscFTQ876SsPAVMgxMmLn0EIpxdcRRq0XmJWnpG1SHL';
const POSTHOG_API_HOST = 'https://app.posthog.com';

function Analytics() {
  React.useEffect(() => {
    if (ExecutionEnvironment.canUseDOM) {
      const payload = {
        api_key: POSTHOG_API_KEY,
        event: '404_error',
        properties: {
          distinct_id: 'docs-user',
          $current_url: window.location.href,
          referrer: document.referrer,
          userAgent: window.navigator.userAgent,
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash,
          timestamp: new Date().toISOString(),
        },
      };

      fetch(`${POSTHOG_API_HOST}/capture/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }).catch(() => {
        console.error('Failed to capture 404 error');
      });
    }
  }, []);

  return null;
}

export default function NotFoundContent({ className }: Props): JSX.Element {
  return (
    <main className={clsx('container margin-vert--xl', className)}>
      <BrowserOnly>{() => <Analytics />}</BrowserOnly>
      <div className="row">
        <div className="col col--6 col--offset-3">
          <Heading as="h1" className="hero__title">
            <Translate id="theme.NotFound.title" description="The title of the 404 page">
              Page Not Found
            </Translate>
          </Heading>
          <p>
            <Translate id="theme.NotFound.p1" description="The first paragraph of the 404 page">
              We could not find what you were looking for.
            </Translate>
          </p>
          <p>
            <Translate id="theme.NotFound.p2" description="The 2nd paragraph of the 404 page">
              Use the search feature in the upper right corner to find what you need, or join our
              Discord community.
            </Translate>
          </p>
        </div>
      </div>
    </main>
  );
}
