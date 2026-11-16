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

  // `connect` does nothing off production.
  useEffect(() => tracking.connect(), [tracking]);

  useEffect(() => {
    tracking.trackPage(query ? `${pathname}?${query}` : pathname);
  }, [pathname, query, tracking]);

  return null;
}
