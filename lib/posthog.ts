'use server';

import { type PageFeedback, pageFeedback } from '@/components/feedback/schema';

// Docs feedback sink: page ratings are captured to PostHog server-side, so feedback also works
// locally and on previews, where the browser SDK is not initialized.
//
// `'use server'` is at module scope so that a non-async export here fails the build rather than
// making this importable from a client component.
//
// API: https://posthog.com/docs/api/capture

const POSTHOG_HOST = 'https://us.i.posthog.com';

/**
 * Records one page rating in PostHog. Never throws: an unhandled rejection here would propagate out
 * of the client's `startTransition` and take down the page render.
 */
export async function onPageFeedbackAction(feedback: PageFeedback): Promise<boolean> {
  // A server action is a public endpoint, so re-validate rather than trusting the caller.
  const parsed = pageFeedback.safeParse(feedback);
  if (!parsed.success) {
    console.error('[Feedback] rejected malformed payload:', parsed.error.issues);
    return false;
  }
  const { opinion, url, message } = parsed.data;

  // PostHog's name for the publishable, write-only `phc_` token; safe to read on the server.
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
        // Anonymous: a throwaway id, and no person profile is minted for it.
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
