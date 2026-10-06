'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { inkeepAiChatSettings, useInkeepBaseSettings } from '@/lib/inkeep';

// Floating "Ask AI" button. Browser-only so the widget bundle stays out of the server render.
const ChatButton = dynamic(() => import('@inkeep/cxkit-react').then((m) => m.InkeepChatButton), {
  ssr: false,
});

/** Upper bound on the idle wait, so a busy main thread cannot starve the button. */
const IDLE_TIMEOUT_MS = 2000;

/**
 * Renders the Inkeep chat widget after the `load` event and then an idle callback, so its large
 * chunk downloads after the resources that decide Largest Contentful Paint. Waiting for `load`
 * matters: the browser goes idle while images and fonts are still in flight. Search is separate
 * (`inkeep-search.tsx`). The flag starts `false`, so hydration matches.
 */
export function InkeepChatButton() {
  const baseSettings = useInkeepBaseSettings();
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

  return <ChatButton baseSettings={baseSettings} aiChatSettings={inkeepAiChatSettings} />;
}
