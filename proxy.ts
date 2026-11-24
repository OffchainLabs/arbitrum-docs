import { isMarkdownPreferred } from 'fumadocs-core/negotiation';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

import { buildTrackingPayload, pathInfo } from '@/lib/llms-tracking';
import { markdownTwinPath } from '@/lib/markdown-negotiation';
import { getSiteUrl } from '@/lib/shared';

const POSTHOG_HOST = 'https://us.i.posthog.com';

// Fumadocs also counts `text/plain` by default; the page matcher below only lets these two in.
const MARKDOWN_MEDIA_TYPES = ['text/markdown', 'text/x-markdown'];

// Every page URL, from `next.config.ts` at build.
const PAGES: ReadonlySet<string> = new Set(process.env.DOCS_PAGE_PATHS?.split('\n'));

/**
 * Serves a page as markdown when the `Accept` header prefers it, by rewriting the page path onto
 * its `.md` twin, and records markdown and `llms*.txt` fetches as PostHog `llms_file_fetched` events,
 * in production only. The capture goes through `event.waitUntil()` and every failure is logged and
 * swallowed. `waitUntil` from `@vercel/functions` drops the promise silently under Next 16, so it
 * is not used.
 */
export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  const twin = isMarkdownPreferred(request, { markdownMediaTypes: MARKDOWN_MEDIA_TYPES })
    ? markdownTwinPath(pathname, PAGES)
    : null;
  if (process.env.VERCEL_ENV === 'production') track(request, event, twin ?? pathname);
  // The mirror route sets `Vary` and CORS itself; Next drops a `Vary` set here.
  return twin ? NextResponse.rewrite(new URL(twin, request.nextUrl)) : NextResponse.next();
}

// The tracked paths, then any path when `Accept` names markdown, so a browser's page request never
// reaches the proxy. `/<slug>.md` is matched before the rewrite in next.config.ts maps it onto
// `/llms.mdx/`, so each request is counted once. Which paths are pages is decided by `PAGES`.
export const config = {
  matcher: [
    '/llms.txt',
    '/llms-full.txt',
    '/index.md',
    '/:path+\\.md',
    '/llms.mdx/:path*',
    {
      source: '/:path*',
      // Media types are case-insensitive and Next compiles this without flags, so each letter is a
      // class. The value must stay an inline literal: Next reads it statically.
      has: [
        {
          type: 'header',
          key: 'accept',
          value: '.*[tT][eE][xX][tT]/(?:[xX]-)?[mM][aA][rR][kK][dD][oO][wW][nN].*',
        },
      ],
    },
  ],
};

/** Longest header value forwarded to PostHog; a client controls both headers. */
const MAX_HEADER_LENGTH = 512;

function truncate(value: string | null): string {
  return (value ?? '').slice(0, MAX_HEADER_LENGTH);
}

function track(request: NextRequest, event: NextFetchEvent, pathname: string): void {
  const info = pathInfo(pathname);
  if (info.kind === 'ignored') return;
  // The path is copied into the event twice ($current_url and file), so it is bounded like the
  // headers. No page slug comes near this length; a longer path is not a page and is not counted.
  if (info.trackedPath.length > MAX_HEADER_LENGTH) return;

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
      userAgent: truncate(request.headers.get('user-agent')),
      referrer: truncate(request.headers.get('referer')),
      posthogKey,
      // The configured origin, so the `*.vercel.app` alias does not split a page into two series.
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
