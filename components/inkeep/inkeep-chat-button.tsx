'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { inkeepAiChatSettings, inkeepBaseSettings } from '@/lib/inkeep';

// Floating "Ask AI" button, mirroring the Docusaurus ChatButton. Browser-only
// so the widget bundle stays out of the server render path.
const ChatButton = dynamic(() => import('@inkeep/cxkit-react').then((m) => m.InkeepChatButton), {
  ssr: false,
});

/**
 * Milliseconds to wait before the idle callback fires anyway.
 *
 * `requestIdleCallback` can be starved indefinitely on a busy main thread, and the button is chrome
 * a reader may well want. The timeout bounds that: two seconds past the `load` event is well clear
 * of the Largest Contentful Paint on a throttled connection, while still putting the button on
 * screen inside the time it takes anyone to read a heading and decide they would rather ask a
 * question.
 */
const IDLE_TIMEOUT_MS = 2000;

/**
 * Renders the Inkeep chat widget, but not until the page has loaded and the browser is idle.
 *
 * The widget is the heaviest thing this site downloads. `@inkeep/cxkit-react` lands in a chunk that
 * transfers about 321 KiB, of which Lighthouse measured 190 KiB as unused on a page where nobody has
 * asked a question. It used to be requested during hydration on every page, which put a third of a
 * megabyte of bandwidth in direct contention with the Largest Contentful Paint on a throttled
 * connection, for a floating button that is worth nothing until it is clicked.
 *
 * Both halves of the gate are load-bearing. `requestIdleCallback` alone was not enough: hydration
 * finishes early, the main thread goes quiet while images and fonts are still in flight, and the
 * callback fired around 300 ms, back in the window it was supposed to stay out of (measured).
 * Waiting for `load` first is what actually puts the download after the critical resources; the idle
 * callback after it just avoids competing with whatever the page does next.
 *
 * This keeps the feature and the button's position identical and only moves the download later.
 * Nothing else on the page depends on it, and this is not the search path: Cmd-K search goes through
 * `components/inkeep/inkeep-search.tsx`, whose own dynamic import fires when Fumadocs opens the
 * dialog and is untouched by this.
 *
 * The flag starts `false` on the server and on the first client render, so hydration still matches.
 */
export function InkeepChatButton() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idleHandle: number | undefined;
    let timer: number | undefined;

    function scheduleIdle() {
      // Safari shipped `requestIdleCallback` only in 16.4, so fall back to a timer of the same
      // budget rather than leaving an older browser without the button entirely.
      if (typeof window.requestIdleCallback !== 'function') {
        timer = window.setTimeout(() => setReady(true), IDLE_TIMEOUT_MS);
        return;
      }
      idleHandle = window.requestIdleCallback(() => setReady(true), { timeout: IDLE_TIMEOUT_MS });
    }

    // `load` has already fired by the time a client-side navigation mounts this, and the event would
    // never come again, so check readyState rather than only listening.
    if (document.readyState === 'complete') {
      scheduleIdle();
      return () => {
        if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
        if (timer !== undefined) window.clearTimeout(timer);
      };
    }

    window.addEventListener('load', scheduleIdle, { once: true });
    return () => {
      window.removeEventListener('load', scheduleIdle);
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  if (!ready) return null;

  return <ChatButton baseSettings={inkeepBaseSettings} aiChatSettings={inkeepAiChatSettings} />;
}
