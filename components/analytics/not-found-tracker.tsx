'use client';

import { useEffect } from 'react';

import { captureNotFoundEvent } from '@/lib/posthog-consent';

// Reports a 404 to PostHog as `404_error`, which shows inbound URLs the redirect map misses. It is
// sent with or without analytics consent; without it, lib/posthog-consent.ts drops the user agent,
// reduces the referrer to its origin and removes ad click ids.

export function NotFoundTracker() {
  useEffect(() => {
    // Snapshot the location now. PostHog may start up to a few seconds later (it waits for
    // CookieYes), and the event must still report the URL the reader landed on.
    captureNotFoundEvent({
      timestamp: new Date().toISOString(),
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      referrer: document.referrer,
      userAgent: window.navigator.userAgent,
    });
  }, []);

  return null;
}
