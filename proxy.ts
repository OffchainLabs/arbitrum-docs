import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

import { buildTrackingPayload, pathInfo } from '@/lib/llms-tracking';
import { getSiteUrl } from '@/lib/shared';

const POSTHOG_HOST = 'https://us.i.posthog.com';

/**
 * Records markdown and `llms*.txt` fetches as PostHog `llms_file_fetched` events, in production
 * only. The capture is handed to `event.waitUntil()` so the response is never delayed, and every
 * failure is logged and swallowed. `waitUntil` from `@vercel/functions` does not work here: Next 16
 * does not install the request context it reads, so it drops the promise silently.
 */
export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (process.env.VERCEL_ENV === 'production') track(request, event);
  return NextResponse.next();
}

// Only the tracked paths reach the proxy. `/docs/<slug>.md` is matched before the rewrite in
// next.config.ts maps it onto `/llms.mdx/`, so each request is counted once.
export const config = {
  matcher: ['/llms.txt', '/llms-full.txt', '/docs.md', '/docs/:path*\\.md', '/llms.mdx/:path*'],
};

function track(request: NextRequest, event: NextFetchEvent): void {
  const info = pathInfo(request.nextUrl.pathname);
  if (info.kind === 'ignored') return;

  // The publishable `phc_` project token, the same one `lib/posthog.ts` uses.
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!posthogKey) {
    console.error('[llms-tracking] dropping event: NEXT_PUBLIC_POSTHOG_KEY is unset');
    return;
  }

  try {
    const payload = buildTrackingPayload({
      trackedPath: info.trackedPath,
      fileType: info.fileType,
      userAgent: request.headers.get('user-agent') ?? '',
      referrer: request.headers.get('referer') ?? '',
      posthogKey,
      // The configured origin rather than the request's, so the `*.vercel.app` alias does not
      // split a page into two series.
      siteUrl: getSiteUrl(),
    });
    event.waitUntil(
      fetch(`${POSTHOG_HOST}/i/v0/e/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(async (response) => {
          // `fetch` resolves on an HTTP error, so a rejected token would otherwise go unnoticed.
          if (!response.ok) {
            console.error(
              `[llms-tracking] PostHog rejected the event (${response.status}): ${await response.text()}`,
            );
          }
        })
        .catch((error) => {
          console.error('[llms-tracking] could not reach PostHog:', error);
        }),
    );
  } catch (error) {
    console.error('[llms-tracking] could not schedule the capture:', error);
  }
}
