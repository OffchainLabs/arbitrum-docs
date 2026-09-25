'use client';

import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';

// Reports a 404 to PostHog, porting the capture in upstream
// src/theme/NotFound/Content/index.tsx. Feeds the inbound-404 monitoring that
// drives the legacy redirect map after cutover.
//
/**
 * Delay before each attempt, in milliseconds, measured from the attempt before it.
 *
 * A child effect can run before the provider's initialization effect. Keep the
 * original URL while retrying until the client is ready.
 */
const RETRY_DELAYS_MS = [0, 250, 500, 1000, 2000, 4000, 8000];

export function NotFoundTracker() {
  const posthog = usePostHog();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production' || !process.env.NEXT_PUBLIC_POSTHOG_KEY)
      return;

    // Snapshot the location now, not at capture time. A late attempt must still report the URL the
    // reader actually landed on.
    const properties = {
      timestamp: new Date().toISOString(),
      $current_url: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      referrer: document.referrer,
      userAgent: window.navigator.userAgent,
    };

    let attempt = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tryCapture = () => {
      if (posthog.__loaded) {
        posthog.capture('404_error', properties);
        return;
      }

      attempt += 1;
      if (attempt >= RETRY_DELAYS_MS.length) return;
      timer = setTimeout(tryCapture, RETRY_DELAYS_MS[attempt]);
    };

    timer = setTimeout(tryCapture, RETRY_DELAYS_MS[0]);

    return () => clearTimeout(timer);
  }, [posthog]);

  return null;
}
