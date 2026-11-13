'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { createHubspotTracking } from '@/lib/hubspot';

/** HubSpot tracking under CookieYes consent. See lib/hubspot.ts and INTERNALS.md#analytics. */
export function HubspotTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tracking] = useState(createHubspotTracking);
  const query = searchParams.toString();

  // The portal is production's, so previews and local builds never load the tracker. The same
  // gate as PostHog's (lib/posthog-consent.ts).
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') return tracking.connect();
  }, [tracking]);

  useEffect(() => {
    tracking.trackPage(query ? `${pathname}?${query}` : pathname);
  }, [pathname, query, tracking]);

  return null;
}
