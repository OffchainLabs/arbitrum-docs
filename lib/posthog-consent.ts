import posthog from 'posthog-js';

import { type AnalyticsConsent, subscribeAnalyticsConsent } from './analytics-consent.ts';

// How long to wait for CookieYes to report its law before counting the visit cookieless.
export const COOKIEYES_LAW_TIMEOUT_MS = 3000;

// Device, locale and viewport properties the SDK attaches to events, dropped while cookieless.
// `$ip` and `$raw_user_agent` stay: PostHog's server-side cookieless hash needs them.
const COOKIELESS_DROPPED_PROPERTIES = [
  '$timezone',
  '$timezone_offset',
  '$device',
  // Null while cookieless, but still attached to some events.
  '$device_id',
  '$device_type',
  '$device_model',
  '$os',
  '$os_version',
  '$browser',
  '$browser_version',
  '$browser_type',
  '$browser_language',
  '$browser_language_prefix',
  '$webview_app',
  '$webview_app_version',
  '$screen_height',
  '$screen_width',
  '$viewport_height',
  '$viewport_width',
  // Scroll depth on $pageview and $pageleave: content minus scroll is the viewport height, and the
  // percentages give the page and viewport heights too.
  '$prev_pageview_last_scroll',
  '$prev_pageview_last_scroll_percentage',
  '$prev_pageview_max_scroll',
  '$prev_pageview_max_scroll_percentage',
  '$prev_pageview_last_content',
  '$prev_pageview_last_content_percentage',
  '$prev_pageview_max_content',
  '$prev_pageview_max_content_percentage',
];

// The SDK's ad click identifiers, read from the landing URL at init (posthog-js 1.438.2's list).
// Each is unique to one ad click and joined to a person on the ad platform, so they leave
// cookieless events, both as properties and inside the URLs below. `utm_*` labels stay.
const CLICK_ID_PARAMETERS = [
  'gclid',
  'gclsrc',
  'dclid',
  'gbraid',
  'wbraid',
  'fbclid',
  'msclkid',
  'twclid',
  'li_fat_id',
  'igshid',
  'ttclid',
  'rdt_cid',
  'epik',
  'qclid',
  'sccid',
  'oppref',
  'irclid',
  '_kx',
];
const COOKIELESS_URL_PROPERTIES = ['$current_url', '$session_entry_url'];
// Reduced to the referrer's origin while cookieless: the SDK parses a search engine referrer's
// query into `ph_keyword`, which is text the visitor typed. `$referring_domain` and
// `$search_engine` are labels and stay.
// `referrer` is the 404 report's own copy of `document.referrer`.
const COOKIELESS_REFERRER_PROPERTIES = ['$referrer', '$session_entry_referrer', 'referrer'];

// The 404 report, sent through `captureNotFoundEvent` rather than the consent queue: it is how
// broken inbound links are found, so it also leaves without consent, minus these properties.
export const NOT_FOUND_EVENT = '404_error';
const NOT_FOUND_DROPPED_PROPERTIES = ['userAgent'];

// Only pageviews, navigation and the 404 report leave without consent. Everything else is
// dropped, whatever the project's remote config enables (exception autocapture, web vitals,
// surveys) and whatever a future SDK extension captures.
const COOKIELESS_EVENTS = ['$pageview', '$pageleave', NOT_FOUND_EVENT];

/**
 * The browser SDK runs only on production deployments with a project token, so previews and local
 * builds send nothing. Read on every call: tests stub the env between module loads.
 */
export function posthogProjectToken(): string | undefined {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production') return undefined;
  return process.env.NEXT_PUBLIC_POSTHOG_KEY || undefined;
}

function withoutClickIds(url: unknown): unknown {
  if (typeof url !== 'string') return url;
  try {
    const parsed = new URL(url);
    if (!CLICK_ID_PARAMETERS.some((key) => parsed.searchParams.has(key))) return url;
    for (const key of CLICK_ID_PARAMETERS) parsed.searchParams.delete(key);
    return parsed.href;
  } catch {
    return url;
  }
}

function referrerOrigin(referrer: unknown): unknown {
  if (typeof referrer !== 'string' || referrer === '$direct') return referrer;
  try {
    const { protocol, host } = new URL(referrer);
    return `${protocol}//${host}/`;
  } catch {
    return referrer;
  }
}

function stripCookielessProperties(properties: Record<string, unknown>) {
  for (const property of [
    ...COOKIELESS_DROPPED_PROPERTIES,
    ...CLICK_ID_PARAMETERS,
    ...NOT_FOUND_DROPPED_PROPERTIES,
    'ph_keyword',
  ]) {
    delete properties[property];
  }
  for (const property of COOKIELESS_URL_PROPERTIES) {
    if (property in properties) properties[property] = withoutClickIds(properties[property]);
  }
  for (const property of COOKIELESS_REFERRER_PROPERTIES) {
    if (property in properties) properties[property] = referrerOrigin(properties[property]);
  }
  // The 404 report's own copy of `location.search`.
  if (typeof properties.search === 'string' && properties.search) {
    properties.search = new URL(
      withoutClickIds(`https://search.invalid/${properties.search}`) as string,
    ).search;
  }
}

// The Inkeep search and chat modal (cxkit) renders inside an open shadow root on a host whose id
// starts with `inkeep-shadow`, and its results and answers repeat what the visitor typed. PostHog
// autocapture follows a click into an open shadow root through `composedPath()`, but its
// `ph-no-capture` check walks `parentNode` and stops at the shadow root, so no class on the host can
// exclude the dialog. A capture-phase listener on `window` runs before PostHog's own on `document`
// for the same DOM event, and `before_send` (called synchronously from `capture`) drops the
// autocapture events that event produces.
// A pointer pressed inside the dialog and released just outside it yields a click targeted at
// <html> or <body>, which PostHog attributes back to the pressed element. That click's path no
// longer passes through the host, so the exclusion carries over from an Inkeep pointer-down.
const INKEEP_HOST_ID_PREFIX = 'inkeep-shadow';
const AUTOCAPTURE_EVENTS = ['$autocapture', '$rageclick', '$copy_autocapture'];
// Every DOM event PostHog's autocapture listens to.
const AUTOCAPTURE_DOM_EVENTS = [
  'click',
  'change',
  'submit',
  'pointerdown',
  'pointermove',
  'pointerup',
  'pointercancel',
  'copy',
  'cut',
  'paste',
];
let inkeepInteraction = false;
let inkeepPointerDown = false;

function trackInkeepInteraction(event: Event) {
  inkeepInteraction = event
    .composedPath()
    .some((node) => node instanceof Element && node.id.startsWith(INKEEP_HOST_ID_PREFIX));
  if (event.type === 'pointerdown') {
    inkeepPointerDown = inkeepInteraction;
  } else if (event.type === 'pointercancel') {
    inkeepPointerDown = false;
  } else if (event.type === 'click') {
    // PostHog recovers only an <html> or <body> target, and forgets the pointer-down at any click.
    if (
      inkeepPointerDown &&
      (event.target === document.documentElement || event.target === document.body)
    ) {
      inkeepInteraction = true;
    }
    inkeepPointerDown = false;
  }
}

// Client-side navigation pageviews. `'history_change'` means `{ path: true }` in the SDK, which
// would skip a navigation that changes only the query string.
const NAVIGATION_PAGEVIEWS = { path: true, search: true };

// Keep the singleton initialized across React effect remounts.
let initialized = false;
let landing:
  | {
      url: URL;
      title: string;
      referrer: string;
      campaigns: Record<string, string>;
    }
  | undefined;
let pendingStartupViews = false;
let manualStartupViews = false;
let analyticsEventConsent = false;
// Keep a bounded, in-memory queue for explicit events awaiting analytics consent.
// Nothing is persisted across document reloads. The queue covers only the wait for CookieYes to
// report: once it reports a known law without analytics consent (the opt-in banner not accepted,
// the opt-out banner opted out, or a withdrawal), the queue is emptied and later events are
// dropped, so nothing from a refused period is sent on a later acceptance.
let eventsRefused = false;
const MAX_PENDING_EVENTS = 100;
type PendingEvent = {
  name: string;
  properties: Record<string, unknown>;
  timestamp: Date;
};
const pendingEvents: PendingEvent[] = [];
// Events sent with or without consent (only the 404 report). They wait only for PostHog to start,
// and `before_send` strips them like a pageview when there is no consent.
const pendingUnconsentedEvents: PendingEvent[] = [];

function pendingEvent(name: string, properties: Record<string, unknown>): PendingEvent {
  return {
    name,
    properties: {
      ...properties,
      $current_url: window.location.href,
      $host: window.location.host,
      $pathname: window.location.pathname,
      title: document.title,
    },
    timestamp: new Date(),
  };
}

function flushPendingEvents() {
  if (!initialized || pendingStartupViews) return;
  for (const event of pendingUnconsentedEvents.splice(0)) {
    posthog.capture(event.name, event.properties, { timestamp: event.timestamp });
  }
  if (!analyticsEventConsent || !posthog.has_opted_in_capturing()) return;

  const events = pendingEvents.splice(0);
  for (const event of events) {
    posthog.capture(event.name, event.properties, {
      timestamp: event.timestamp,
      // The bounded backlog shares the SDK's burst allowance with startup events.
      skip_client_rate_limiting: events.length > 1,
    });
  }
}

export function captureConsentedPosthogEvent(
  name: string,
  properties: Record<string, unknown>,
): void {
  if (!posthogProjectToken() || eventsRefused) return;

  pendingEvents.push(pendingEvent(name, properties));
  if (pendingEvents.length > MAX_PENDING_EVENTS) pendingEvents.shift();
  flushPendingEvents();
}

/**
 * Sends the 404 report once PostHog has started, whatever the visitor's consent. Without consent it
 * goes cookieless, with the user agent dropped, the referrer reduced to its origin and ad click ids
 * removed (see `before_send`).
 */
export function captureNotFoundEvent(properties: Record<string, unknown>): void {
  if (!posthogProjectToken()) return;

  pendingUnconsentedEvents.push(pendingEvent(NOT_FOUND_EVENT, properties));
  if (pendingUnconsentedEvents.length > MAX_PENDING_EVENTS) pendingUnconsentedEvents.shift();
  flushPendingEvents();
}

function landingProperties() {
  const snapshot = landing!;
  return {
    ...snapshot.campaigns,
    $current_url: snapshot.url.href,
    $host: snapshot.url.host,
    $pathname: snapshot.url.pathname,
    $referrer: snapshot.referrer || '$direct',
    $referring_domain: snapshot.referrer ? new URL(snapshot.referrer).host : '$direct',
  };
}

function cookieCaptureConfig(accepted: boolean) {
  return {
    autocapture: accepted,
    disable_session_recording: true,
    capture_heatmaps: false,
    capture_dead_clicks: false,
  };
}

function start(apiKey: string, accepted: boolean) {
  const snapshot = landing!;
  pendingStartupViews = window.location.href !== snapshot.url.href;
  const correctStartupLanding = pendingStartupViews;
  let firstView = true;
  const sessionProperties = Object.fromEntries(
    Object.entries(landingProperties()).map(([key, value]) => [
      `$session_entry_${key === '$current_url' ? 'url' : key.replace(/^\$/, '')}`,
      value,
    ]),
  );
  // The opt-out defaults do not override a stored SDK opt-in. Gate persistence during
  // initialization too, before the SDK can write cookies or session storage.
  posthog.init(apiKey, {
    api_host: 'https://us.i.posthog.com',
    // Pinned so an SDK upgrade cannot change what is captured.
    defaults: '2026-08-30',
    // Surveys, product tours and conversations load remote scripts configured from the PostHog
    // dashboard, outside code review. The site uses none of them.
    disable_surveys: true,
    disable_product_tours: true,
    disable_conversations: true,
    persistence: 'cookie',
    disable_persistence: !accepted,
    ...cookieCaptureConfig(accepted),
    capture_pageview: pendingStartupViews ? false : NAVIGATION_PAGEVIEWS,
    ...(pendingStartupViews && {
      // Own startup views when navigation occurred during the wait; the SDK's automatic view
      // would otherwise use the destination as the landing page.
      capture_pageleave: true,
    }),
    before_send: (event) => {
      if (!event) return event;
      if (inkeepInteraction && AUTOCAPTURE_EVENTS.includes(event.event)) return null;
      if (event.properties.$cookieless_mode === true) {
        if (!COOKIELESS_EVENTS.includes(event.event)) return null;
        stripCookielessProperties(event.properties);
        if (event.$set_once) {
          // The manual landing view's $initial_* copy. The server discards person updates for
          // cookieless events, but the payload still travels.
          event.$set_once.$initial_current_url = withoutClickIds(
            event.$set_once.$initial_current_url,
          );
          event.$set_once.$initial_referrer = referrerOrigin(event.$set_once.$initial_referrer);
        }
      }
      if (correctStartupLanding && firstView && event.event === '$pageview') {
        event.properties.title = snapshot.title;
        firstView = false;
        const sessionId = event.properties.$session_id;
        if (typeof sessionId === 'string' && sessionId !== existingSessionId) {
          // Use the SDK's compact session source so reloads retain the correction and
          // later sessions reset it. The real-SDK tests cover this storage contract.
          posthog.register({
            $client_session_props: {
              sessionId,
              props: {
                r: snapshot.referrer || '$direct',
                u: snapshot.url.href,
              },
            },
          });
          Object.assign(event.properties, sessionProperties);
        }
      }
      return event;
    },
    opt_out_capturing_by_default: true,
    opt_out_persistence_by_default: true,
    cookieless_mode: 'on_reject',
  });
  const existingSessionId: unknown = posthog.persistence?.props.$client_session_props?.sessionId;
  initialized = true;
}

function syncConsent(apiKey: string, accepted: boolean) {
  posthog.set_config({
    disable_persistence: !accepted,
    ...cookieCaptureConfig(accepted),
    // The /flags request bypasses before_send and always sends the visitor's timezone, so flags
    // load only with consent. This runs straight after init, before any debounced flags load
    // fires, and before opting in or out, whose reset reloads flags. Flags are not set in init:
    // the SDK would then ignore this toggle, and they would also turn off remote config.
    advanced_disable_flags: !accepted,
  });
  // The SDK still considers its own first view unsent after manual startup views, and opting in or
  // out would send it. Pause automatic pageviews around the switch.
  if (manualStartupViews) posthog.set_config({ capture_pageview: false });

  if (accepted) {
    if (!posthog.has_opted_in_capturing()) {
      // The first event must carry landing attribution, rather than the current URL's
      // person properties from an automatic $opt_in event.
      if (pendingStartupViews) posthog.opt_in_capturing({ captureEventName: false });
      else posthog.opt_in_capturing();
    }
  } else if (!posthog.has_opted_out_capturing()) {
    // Withdrawal removes analytics storage (see the persistence option above) and
    // returns to cookieless capture.
    posthog.opt_out_capturing();
    // The SDK leaves its window id and its own opt-out flag behind. Neither is needed:
    // CookieYes is re-read at every startup, and the SDK defaults to opted out. Nothing of
    // PostHog's should outlive withdrawal. Storage access can throw in private windows.
    for (const [storage, key] of [
      ['sessionStorage', `ph_${apiKey}_window_id`],
      ['localStorage', `__ph_opt_in_out_${apiKey}`],
    ] as const) {
      try {
        window[storage].removeItem(key);
      } catch {}
    }
  }

  if (manualStartupViews) posthog.set_config({ capture_pageview: NAVIGATION_PAGEVIEWS });
}

function captureStartupViews() {
  if (!pendingStartupViews || document.visibilityState !== 'visible') return;
  pendingStartupViews = false;
  const snapshot = landing!;
  const properties = landingProperties();
  const cookielessSessionProperties = posthog.sessionManager
    ? undefined
    : Object.fromEntries(
        Object.entries(properties).map(([key, value]) => [
          `$session_entry_${key === '$current_url' ? 'url' : key.replace(/^\$/, '')}`,
          value,
        ]),
      );
  const initialProperties = Object.fromEntries(
    Object.entries(properties).map(([key, value]) => [`$initial_${key.replace(/^\$/, '')}`, value]),
  );
  posthog.register_for_session(snapshot.campaigns);
  posthog.capture(
    '$pageview',
    { ...properties, ...cookielessSessionProperties },
    {
      send_instantly: true,
      $set_once: initialProperties,
    },
  );
  if (window.location.href !== snapshot.url.href) {
    posthog.capture('$pageview', cookielessSessionProperties, {
      send_instantly: true,
    });
  }
  // Startup views replace the SDK's first view, so client-side navigation tracking starts after them.
  manualStartupViews = true;
  posthog.set_config({ capture_pageview: NAVIGATION_PAGEVIEWS });
  flushPendingEvents();
}

export function connectPosthogConsent(apiKey: string): () => void {
  if (!landing) {
    const url = new URL(window.location.href);
    landing = {
      url,
      title: document.title,
      referrer: document.referrer,
      // Only UTMs are restored when the visitor navigates before PostHog starts. The SDK's
      // other campaign parameters (gclid, fbclid, msclkid and the rest) are read from the URL
      // at init, so a delayed start sends them only on an immediate landing, and then only
      // with consent (see `stripCookielessProperties`). Deliberate, to stay in step with
      // the other Offchain Labs sites; the real-SDK test "restores UTMs but not ad click IDs" locks
      // it in.
      campaigns: Object.fromEntries(
        [...url.searchParams].filter(([key]) => key.startsWith('utm_')),
      ),
    };
  }
  let accepted = false;
  let fallback: ReturnType<typeof setTimeout> | undefined;

  function startAndSync() {
    clearTimeout(fallback);
    fallback = undefined;
    if (!initialized) start(apiKey, accepted);
    syncConsent(apiKey, accepted);
    captureStartupViews();
    flushPendingEvents();
  }

  function applyConsent(consent: AnalyticsConsent) {
    accepted = consent.accepted;
    analyticsEventConsent = accepted;
    if (accepted) eventsRefused = false;
    else if (consent.law !== undefined) {
      eventsRefused = true;
      pendingEvents.length = 0;
    }

    if (!initialized && consent.law === undefined && !accepted) {
      // CookieYes reports its law only after a geolocation lookup. Starting before then would
      // send the landing pageview cookieless to opt-out banner visitors, who default to cookies.
      // If CookieYes never reports (blocked or failed), count the visit cookieless.
      fallback ??= setTimeout(startAndSync, COOKIEYES_LAW_TIMEOUT_MS);
      return;
    }

    startAndSync();
  }

  document.addEventListener('visibilitychange', captureStartupViews);
  for (const type of AUTOCAPTURE_DOM_EVENTS) {
    window.addEventListener(type, trackInkeepInteraction, { capture: true, passive: true });
  }
  const unsubscribe = subscribeAnalyticsConsent(applyConsent);

  return () => {
    analyticsEventConsent = false;
    unsubscribe();
    document.removeEventListener('visibilitychange', captureStartupViews);
    for (const type of AUTOCAPTURE_DOM_EVENTS) {
      window.removeEventListener(type, trackInkeepInteraction, { capture: true });
    }
    clearTimeout(fallback);
    fallback = undefined;
  };
}
