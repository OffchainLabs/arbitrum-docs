'use server';

import { type PageFeedback, pageFeedback } from '@/components/feedback/schema';

// Docs feedback sink. Upstream opens a GitHub Discussion per page, which needs a GitHub App and two
// secrets; this site captures to PostHog instead so feedback lands alongside the readership data
// already used for content-gap analysis.
//
// `'use server'` is at module scope rather than inside the function (upstream uses the in-function
// form in apps/docs/lib/github.ts, which it must, because that module also exports plain
// constants). Exporting nothing but the action makes file scope a compile-time guarantee: a
// non-async export here fails the build rather than quietly making this importable from a client
// component.
//
// Capture is server-side because the PostHog client SDK is not loaded in this app — the browser
// bridge in lib/inkeep.ts no-ops on `window.posthog`, so a client-side `capture()` would discard
// the submission silently.
//
// API: https://posthog.com/docs/api/capture

const POSTHOG_HOST = 'https://us.i.posthog.com';

/**
 * Records one page rating in PostHog.
 *
 * Never throws. Every failure path logs to the server console (visible in `vercel logs`) and
 * returns `false`, because an unhandled rejection here propagates out of the client's
 * `startTransition` and takes down the whole page render — a docs page must not break because an
 * analytics write failed.
 *
 * @returns whether the event reached PostHog.
 */
export async function onPageFeedbackAction(feedback: PageFeedback): Promise<boolean> {
  // A server action is a public endpoint — re-validate rather than trusting the caller.
  const parsed = pageFeedback.safeParse(feedback);
  if (!parsed.success) {
    console.error('[Feedback] rejected malformed payload:', parsed.error.issues);
    return false;
  }
  const { opinion, url, message } = parsed.data;

  // Read on the server despite the NEXT_PUBLIC_ prefix: that is PostHog's documented name for the
  // publishable `phc_` project token, which is write-only and safe to expose either way.
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) {
    console.error(
      '[Feedback] dropping submission: NEXT_PUBLIC_POSTHOG_KEY is unset. Set it to the PostHog ' +
        'project token (Project settings → Project API key) in .env.local, and on Vercel for ' +
        'both Preview and Production.',
    );
    return false;
  }

  try {
    const response = await fetch(`${POSTHOG_HOST}/i/v0/e/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        event: 'docs_feedback',
        // Feedback is anonymous, so the distinct_id is a throwaway. `$process_person_profile: false`
        // stops each submission from minting a PostHog person profile keyed to it.
        distinct_id: crypto.randomUUID(),
        properties: {
          $process_person_profile: false,
          $current_url: url,
          $pathname: new URL(url).pathname,
          opinion,
          message,
        },
      }),
    });

    if (!response.ok) {
      console.error(
        `[Feedback] PostHog rejected the event (${response.status}): ${await response.text()}`,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Feedback] could not reach PostHog:', error);
    return false;
  }
}
