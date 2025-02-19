import React from 'react';
import { PostHogProvider as BasePostHogProvider } from 'posthog-js/react';
import type { PostHogConfig } from 'posthog-js';

const options: Partial<PostHogConfig> = {
  api_host: 'https://app.posthog.com',
  autocapture: false,
  capture_pageview: false,
  persistence: 'memory',
  disable_session_recording: true,
  advanced_disable_decide: true,
  disable_persistence: true,
  disable_cookie: true,
};

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <BasePostHogProvider
      apiKey="phc_AscFTQ876SsPAVMgxMmLn0EIpxdcRRq0XmJWnpG1SHL"
      options={options}
    >
      {children}
    </BasePostHogProvider>
  );
} 