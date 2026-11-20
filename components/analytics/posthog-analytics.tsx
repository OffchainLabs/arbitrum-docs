'use client';

import { useEffect } from 'react';

import { connectPosthogConsent, posthogProjectToken } from '@/lib/posthog-consent';

/** Starts PostHog under CookieYes consent. See lib/posthog-consent.ts and INTERNALS.md#analytics. */
export function PosthogAnalytics() {
  // Connected after hydration, alongside the CookieYes load, so the wait for the CookieYes law is
  // not spent before CookieYes has started.
  useEffect(() => {
    const token = posthogProjectToken();
    if (token) return connectPosthogConsent(token);
  }, []);

  return null;
}
