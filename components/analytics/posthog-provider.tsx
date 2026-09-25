'use client';

import posthog from 'posthog-js';
import { PostHogProvider as ReactPostHogProvider } from 'posthog-js/react';
import type { ReactNode } from 'react';

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

export function PostHogProvider({ children }: { children: ReactNode }) {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production' || !posthogKey) {
    return <ReactPostHogProvider client={posthog}>{children}</ReactPostHogProvider>;
  }

  return (
    <ReactPostHogProvider
      apiKey={posthogKey}
      options={{
        api_host: 'https://us.i.posthog.com',
        defaults: '2026-08-30',
        cookieless_mode: 'always',
        persistence: 'memory',
        disable_session_recording: true,
        advanced_disable_flags: true,
        capture_pageview: { path: true, search: true },
      }}
    >
      {children}
    </ReactPostHogProvider>
  );
}
