// @vitest-environment jsdom
// @vitest-environment-options { "url": "https://docs.arbitrum.io/" }
// The production host, not jsdom's localhost: from `defaults` 2026-01-30 the SDK marks a localhost
// visitor as a test user during init, and that `$set` consumes the landing URL's campaign
// parameters before consent resets persistence, which no production visit does.
// Runs the real PostHog SDK, unlike posthog-consent.test.ts, to check what it writes to the
// browser. Consent defaults do not override a saved SDK opt-in, so a mocked SDK cannot catch
// analytics storage written during init().
import type { PostHog } from 'posthog-js';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cookieYesConsent } from './cookieyes.fixture.ts';

const KEY = 'phc_test';
const COOKIE = `ph_${KEY}_posthog`;
const COOKIELESS_ID = '$posthog_cookieless';

let posthog: PostHog;
let connect: typeof import('./posthog-consent.ts').connectPosthogConsent;
let cleanup: (() => void) | undefined;

type CookieYesConsent = ReturnType<NonNullable<Window['getCkyConsent']>>;

// The SDK reads a project's remote config from here when array.js has preloaded it.
const remoteConfigWindow = window as Window & {
  _POSTHOG_REMOTE_CONFIG?: Record<string, { config: object; siteApps: [] }>;
};

function setConsent(consent: CookieYesConsent) {
  window.getCkyConsent = () => consent;
}

function update(consent: CookieYesConsent) {
  setConsent(consent);
  document.dispatchEvent(new CustomEvent('cookieyes_consent_update'));
}

function analyticsStorage() {
  return {
    cookie: document.cookie.includes(COOKIE),
    session: Object.keys(sessionStorage).filter((key) => key.startsWith('ph_')),
  };
}

function watchChatEvents() {
  const events: NonNullable<ReturnType<PostHog['capture']>>[] = [];
  posthog.on('eventCaptured', (event) => {
    if (event.event.startsWith('inkeep_')) events.push(event);
  });
  return events;
}

// Every request the SDK made, whether by fetch or sendBeacon.
function requestedUrls() {
  return [
    ...vi.mocked(fetch).mock.calls.map(([url]) => String(url)),
    ...vi.mocked(navigator.sendBeacon).mock.calls.map(([url]) => String(url)),
  ];
}

// Sets the scroll position and page size PostHog reads for its scroll-depth properties.
function scrollTo(scrollY: number, viewportHeight: number, pageHeight: number) {
  vi.spyOn(window, 'scrollY', 'get').mockReturnValue(scrollY);
  vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(viewportHeight);
  vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(pageHeight);
  window.dispatchEvent(new Event('scroll'));
}

// `defaults` 2026-05-30 and later debounce persistence writes by 250ms, so storage and a reloaded
// SDK only see what was written once that time has passed.
function flushPersistence() {
  return vi.advanceTimersByTimeAsync(300);
}

function visibleBrowser() {
  vi.useFakeTimers();
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
    'Mozilla/5.0 Chrome/140.0.0.0 Safari/537.36',
  );
}

async function reloadSDK() {
  cleanup?.();
  cleanup = undefined;
  vi.clearAllTimers();
  vi.resetModules();
  for (const method of ['pushState', 'replaceState'] as const) {
    delete (window.history as Partial<History>)[method];
  }
  posthog = (await import('posthog-js')).default;
  connect = (await import('./posthog-consent.ts')).connectPosthogConsent;
}

beforeEach(async () => {
  vi.resetModules();
  // The SDK patches history methods on the instance, and a patch from an earlier test's SDK would
  // report navigation to that discarded singleton.
  for (const method of ['pushState', 'replaceState'] as const) {
    delete (window.history as Partial<History>)[method];
  }
  window.history.replaceState({}, '', '/');
  // The SDK writes its cookie to the parent domain (`.arbitrum.io`), which a host-only expiry
  // would not clear.
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    for (const domain of ['', '; domain=.arbitrum.io']) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    }
  }
  localStorage.clear();
  sessionStorage.clear();
  // Keep the SDK off the network.
  vi.stubGlobal(
    'fetch',
    vi.fn(() => new Promise(() => {})),
  );
  navigator.sendBeacon = vi.fn(() => true);
  posthog = (await import('posthog-js')).default;
  connect = (await import('./posthog-consent.ts')).connectPosthogConsent;
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  delete window.getCkyConsent;
  delete remoteConfigWindow._POSTHOG_REMOTE_CONFIG;
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('PostHog CookieYes consent with the real SDK', () => {
  it.each(['gdpr', 'ccpa', 'timeout', 'delayed'] as const)(
    'removes cookieless device details while preserving hash inputs after %s startup and consent changes',
    async (mode) => {
      visibleBrowser();
      await reloadSDK();
      // The opt-out banner is cookieless once the visitor opts out; the opt-in one until they accept.
      const law = mode === 'ccpa' ? 'ccpa' : 'gdpr';
      setConsent(
        mode === 'gdpr' || mode === 'ccpa'
          ? cookieYesConsent({ law, analytics: false, acted: mode === 'ccpa' })
          : undefined,
      );
      const views: NonNullable<ReturnType<PostHog['capture']>>[] = [];
      posthog.on('eventCaptured', (event) => {
        if (event.event === '$pageview') views.push(event);
      });
      cleanup = connect(KEY);
      if (mode === 'delayed') {
        window.history.pushState({}, '', '/contact');
        update(cookieYesConsent({ law: 'gdpr', analytics: false, acted: false }));
      }
      await vi.advanceTimersByTimeAsync(3010);

      expect(views).toHaveLength(mode === 'delayed' ? 2 : 1);
      for (const view of views) {
        expect(view.properties.$cookieless_mode).toBe(true);
        expect(view.properties.$raw_user_agent).toBe(navigator.userAgent);
        expect(view.properties.$host).toBe(window.location.host);
        expect(
          Object.keys(view.properties).filter((key) =>
            /^\$(timezone|device|os|browser|webview|screen|viewport)(_|$)|^\$prev_pageview_(last|max)_(scroll|content)/.test(
              key,
            ),
          ),
        ).toEqual([]);
      }

      const droppedProperties = {
        $timezone: 'Europe/London',
        $timezone_offset: 0,
        $device: 'Mac',
        $device_id: 'test-device',
        $device_type: 'Desktop',
        $device_model: 'MacBook Pro',
        $os: 'Mac OS X',
        $os_version: '10.15.7',
        $browser: 'Chrome',
        $browser_version: 140,
        $browser_type: 'browser',
        $browser_language: 'en-GB',
        $browser_language_prefix: 'en',
        $webview_app: 'example',
        $webview_app_version: '1',
        $screen_height: 900,
        $screen_width: 1440,
        $viewport_height: 800,
        $viewport_width: 1280,
        $prev_pageview_last_scroll: 1200,
        $prev_pageview_last_scroll_percentage: 0.28,
        $prev_pageview_max_scroll: 1200,
        $prev_pageview_max_scroll_percentage: 0.28,
        $prev_pageview_last_content: 2000,
        $prev_pageview_last_content_percentage: 0.4,
        $prev_pageview_max_content: 2000,
        $prev_pageview_max_content_percentage: 0.4,
      };
      const hashInputs = {
        $ip: '203.0.113.42',
        $raw_user_agent: 'unchanged test user agent',
      };
      function expectCookieless() {
        // Only pageviews and navigation leave while cookieless.
        expect(posthog.capture('cookieless_check', hashInputs)).toBeUndefined();
        const event = posthog.capture('$pageview', {
          ...droppedProperties,
          ...hashInputs,
        });
        expect(event?.properties).toMatchObject({
          ...hashInputs,
          $cookieless_mode: true,
          $host: window.location.host,
        });
        for (const property of Object.keys(droppedProperties)) {
          expect(event?.properties).not.toHaveProperty(property);
        }
      }
      expectCookieless();
      update(cookieYesConsent({ law, analytics: true, acted: true }));
      const consented = posthog.capture('consented_check', {
        ...droppedProperties,
        ...hashInputs,
      });
      expect(consented?.properties.$cookieless_mode).not.toBe(true);
      expect(consented?.properties).toMatchObject({
        ...droppedProperties,
        ...hashInputs,
      });
      update(cookieYesConsent({ law, analytics: false, acted: true }));
      expectCookieless();
    },
  );

  it.each(['gdpr', 'ccpa', 'timeout'] as const)(
    'loads feature flags only with consent after %s startup',
    async (mode) => {
      visibleBrowser();
      // Answer requests, so a finished flags load cannot mask a later one.
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response('{}', { status: 200 })),
      );
      // Without CompressionStream the SDK compresses synchronously, so each request reaches fetch
      // before the fake timers settle rather than after real stream I/O.
      vi.stubGlobal('CompressionStream', undefined);
      await reloadSDK();
      const law = mode === 'ccpa' ? 'ccpa' : 'gdpr';
      setConsent(
        mode === 'timeout' ? undefined : cookieYesConsent({ law, analytics: false, acted: true }),
      );
      const flagRequests = () => requestedUrls().filter((url) => url.includes('/flags')).length;
      // Remote config, reset and identify all reload flags through this path.
      async function reloadFlags() {
        posthog.reloadFeatureFlags();
        await vi.advanceTimersByTimeAsync(1000);
      }

      cleanup = connect(KEY);
      await vi.advanceTimersByTimeAsync(3010);
      await reloadFlags();
      // The /flags request bypasses before_send and always carries the timezone.
      expect(flagRequests()).toBe(0);

      update(cookieYesConsent({ law, analytics: true, acted: true }));
      await vi.advanceTimersByTimeAsync(1000);
      expect(flagRequests()).toBe(1);
      await reloadFlags();
      expect(flagRequests()).toBe(2);

      update(cookieYesConsent({ law, analytics: false, acted: true }));
      await reloadFlags();
      expect(flagRequests()).toBe(2);
    },
  );

  it.each(['gdpr', 'ccpa'] as const)(
    'drops scroll depth from cookieless navigation on the %s banner and keeps it with consent',
    async (law) => {
      visibleBrowser();
      await reloadSDK();
      setConsent(cookieYesConsent({ law, analytics: false, acted: true }));
      const views: NonNullable<ReturnType<PostHog['capture']>>[] = [];
      posthog.on('eventCaptured', (event) => {
        if (event.event === '$pageview' || event.event === '$pageleave') views.push(event);
      });
      cleanup = connect(KEY);
      await vi.advanceTimersByTimeAsync(1000);

      function lastView() {
        const view = views.at(-1);
        if (!view) throw new Error('No $pageview or $pageleave was captured');
        return view;
      }
      async function scrollAndNavigate(path: string) {
        scrollTo(1200, 777, 5000);
        window.history.pushState({}, '', path);
        await vi.advanceTimersByTimeAsync(1000);
        return lastView();
      }
      const scrollProperties = [
        '$prev_pageview_last_scroll',
        '$prev_pageview_last_scroll_percentage',
        '$prev_pageview_max_scroll',
        '$prev_pageview_max_scroll_percentage',
        '$prev_pageview_last_content',
        '$prev_pageview_last_content_percentage',
        '$prev_pageview_max_content',
        '$prev_pageview_max_content_percentage',
      ];
      function expectNoScrollDepth(
        event: NonNullable<ReturnType<PostHog['capture']>>,
        previousPath: string,
      ) {
        expect(event.properties.$cookieless_mode).toBe(true);
        // Navigation context other than scroll depth is kept.
        expect(event.properties.$prev_pageview_pathname).toBe(previousPath);
        expect(event.properties.$prev_pageview_duration).toEqual(expect.any(Number));
        for (const property of scrollProperties) {
          expect(event.properties).not.toHaveProperty(property);
        }
      }

      const cookieless = await scrollAndNavigate('/docs');
      expect(cookieless.event).toBe('$pageview');
      expectNoScrollDepth(cookieless, '/');

      update(cookieYesConsent({ law, analytics: true, acted: true }));
      await scrollAndNavigate('/consented');
      const consented = await scrollAndNavigate('/consented-again');
      expect(consented.properties.$cookieless_mode).not.toBe(true);
      expect(consented.properties).toMatchObject({
        $prev_pageview_pathname: '/consented',
        $prev_pageview_last_scroll: 1200,
        $prev_pageview_last_content: 1977,
      });

      update(cookieYesConsent({ law, analytics: false, acted: true }));
      await scrollAndNavigate('/withdrawn');
      const withdrawn = await scrollAndNavigate('/withdrawn-again');
      expectNoScrollDepth(withdrawn, '/withdrawn');

      window.dispatchEvent(new Event('pagehide'));
      const pageleave = lastView();
      expect(pageleave.event).toBe('$pageleave');
      expectNoScrollDepth(pageleave, '/withdrawn-again');
    },
  );

  it.each(['gdpr', 'ccpa', 'timeout'] as const)(
    'sends only pageviews and navigation while cookieless after %s startup, whatever the project enables',
    async (mode) => {
      visibleBrowser();
      // Project settings that add capture without any change here.
      remoteConfigWindow._POSTHOG_REMOTE_CONFIG = {
        [KEY]: {
          config: {
            autocaptureExceptions: true,
            capturePerformance: { web_vitals: true },
            surveys: true,
          },
          siteApps: [],
        },
      };
      await reloadSDK();
      const law = mode === 'ccpa' ? 'ccpa' : 'gdpr';
      setConsent(
        mode === 'timeout' ? undefined : cookieYesConsent({ law, analytics: false, acted: true }),
      );
      const events: string[] = [];
      posthog.on('eventCaptured', (event) => {
        events.push(
          event.properties.$cookieless_mode === true ? `${event.event} (cookieless)` : event.event,
        );
      });
      cleanup = connect(KEY);
      await vi.advanceTimersByTimeAsync(3010);
      // What the extensions and a survey would send, and anything else captured.
      function captureExtras() {
        posthog.captureException(new Error('Ask AI request failed'));
        posthog.capture('$web_vitals', { $web_vitals_LCP_value: 1 });
        posthog.capture('survey shown', { $survey_id: 's1' });
        posthog.capture('custom');
      }
      const extras = ['$exception', '$web_vitals', 'survey shown', 'custom'];

      captureExtras();
      window.history.pushState({}, '', '/docs');
      await vi.advanceTimersByTimeAsync(1000);
      expect(events).toEqual(['$pageview (cookieless)', '$pageview (cookieless)']);

      events.length = 0;
      update(cookieYesConsent({ law, analytics: true, acted: true }));
      captureExtras();
      expect(events).toEqual(expect.arrayContaining(extras));
      expect(events.filter((event) => event.endsWith('(cookieless)'))).toEqual([]);

      update(cookieYesConsent({ law, analytics: false, acted: true }));
      events.length = 0;
      captureExtras();
      expect(events).toEqual([]);
    },
  );

  it.each(['gdpr', 'ccpa', 'delayed'] as const)(
    'strips ad click IDs and the referrer query from cookieless events after %s startup and keeps them with consent',
    async (mode) => {
      visibleBrowser();
      window.history.replaceState(
        {},
        '',
        '/?utm_source=campaign&gclid=google-click&fbclid=fb-click',
      );
      vi.spyOn(document, 'referrer', 'get').mockReturnValue(
        'https://www.bing.com/search?q=secret+question',
      );
      // The SDK's click-id campaign parameters (posthog-js 1.438.2); it attaches every one, null
      // when absent, so an empty intersection proves the whole list is gone.
      const clickIds = [
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
        'ph_keyword',
      ];
      const law = mode === 'ccpa' ? 'ccpa' : 'gdpr';
      setConsent(
        mode === 'delayed' ? undefined : cookieYesConsent({ law, analytics: false, acted: true }),
      );
      const views: NonNullable<ReturnType<PostHog['capture']>>[] = [];
      posthog.on('eventCaptured', (event) => {
        if (event.event === '$pageview') views.push(event);
      });
      cleanup = connect(KEY);
      if (mode === 'delayed') {
        window.history.pushState({}, '', '/contact');
        update(cookieYesConsent({ law: 'gdpr', analytics: false, acted: false }));
      }
      await vi.advanceTimersByTimeAsync(10);
      const origin = window.location.origin;
      const landing = views[0];
      expect(landing.properties.$cookieless_mode).toBe(true);
      expect(Object.keys(landing.properties).filter((key) => clickIds.includes(key))).toEqual([]);
      expect(landing.properties).toMatchObject({
        utm_source: 'campaign',
        $current_url: `${origin}/?utm_source=campaign`,
        $referrer: 'https://www.bing.com/',
        $referring_domain: 'www.bing.com',
        $search_engine: 'bing',
      });
      if (mode === 'delayed') {
        // The manual landing view's session and $initial_* copies of the landing.
        expect(landing.properties).toMatchObject({
          $session_entry_url: `${origin}/?utm_source=campaign`,
          $session_entry_referrer: 'https://www.bing.com/',
        });
        expect(landing.$set_once).toMatchObject({
          $initial_current_url: `${origin}/?utm_source=campaign`,
          $initial_referrer: 'https://www.bing.com/',
        });
      }

      update(cookieYesConsent({ law, analytics: true, acted: true }));
      window.history.pushState({}, '', '/consented');
      await vi.advanceTimersByTimeAsync(10);
      // The referrer fields are recomputed per event, so they prove the gate opens. Click IDs are
      // read from the URL at the opt-in reset, after navigation here; "restores UTMs but not ad
      // click IDs" covers them on a consented landing.
      const consented = views.at(-1);
      expect(consented?.properties.$cookieless_mode).not.toBe(true);
      expect(consented?.properties).toMatchObject({
        ph_keyword: 'secret question',
        $referrer: 'https://www.bing.com/search?q=secret+question',
      });
    },
  );

  // Each sequence starts with the consent CookieYes reports at startup, which reaches init
  // directly, followed by the visitor's later choices.
  const bannerSequences = {
    // Cookieless until the visitor opts in.
    'an untouched opt-in banner': [
      { law: 'gdpr', analytics: false, acted: false },
      { law: 'gdpr', analytics: true, acted: true },
      { law: 'gdpr', analytics: false, acted: true },
      { law: 'gdpr', analytics: true, acted: true },
    ],
    'a saved opt-in': [
      { law: 'gdpr', analytics: true, acted: true },
      { law: 'gdpr', analytics: false, acted: true },
      { law: 'gdpr', analytics: true, acted: true },
    ],
    // Cookies by default until the visitor opts out.
    'an untouched opt-out banner': [
      { law: 'ccpa', analytics: true, acted: false },
      { law: 'ccpa', analytics: false, acted: true },
      { law: 'ccpa', analytics: true, acted: true },
    ],
    'a saved opt-out': [
      { law: 'ccpa', analytics: false, acted: true },
      { law: 'ccpa', analytics: true, acted: true },
      { law: 'ccpa', analytics: false, acted: true },
    ],
  } as const;

  it.each(
    Object.keys(bannerSequences).flatMap((start) =>
      [true, false].map((heatmaps) => [start as keyof typeof bannerSequences, heatmaps] as const),
    ),
  )(
    'gates clicks after starting with %s and keeps heatmaps off despite the project setting (%s)',
    async (start, heatmaps) => {
      visibleBrowser();
      remoteConfigWindow._POSTHOG_REMOTE_CONFIG = {
        [KEY]: { config: { autocapture_opt_out: false, heatmaps }, siteApps: [] },
      };
      await reloadSDK();
      const [initial, ...changes] = bannerSequences[start];
      setConsent(cookieYesConsent(initial));
      const events: string[] = [];
      posthog.on('eventCaptured', (event) => {
        // Consented interactions must also be cookie-backed, so label any that are not.
        if (event.event === '$autocapture' || event.event === '$$heatmap')
          events.push(
            event.properties.$cookieless_mode === true
              ? `${event.event} (cookieless)`
              : event.event,
          );
      });
      cleanup = connect(KEY);
      const button = document.createElement('button');
      button.textContent = 'Get started';
      document.body.append(button);
      // Heatmaps stay off even when the project enables them, so consent only adds clicks.
      const acceptedEvents = ['$autocapture'];
      // Clicks, then waits past the heatmap flush interval.
      async function expectClick(analytics: boolean) {
        events.length = 0;
        button.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 10, clientY: 10 }));
        await vi.advanceTimersByTimeAsync(6000);
        expect(events).toEqual(analytics ? acceptedEvents : []);
      }
      try {
        await expectClick(initial.analytics);
        for (const consent of changes) {
          update(cookieYesConsent(consent));
          await expectClick(consent.analytics);
        }
      } finally {
        button.remove();
      }
    },
  );

  it.each([
    ['an accepted opt-in banner', { law: 'gdpr', analytics: true, acted: true }],
    ['an untouched opt-out banner', { law: 'ccpa', analytics: true, acted: false }],
  ] as const)(
    'keeps AI chat message text out of autocapture with consent from %s',
    async (_, consent) => {
      visibleBrowser();
      remoteConfigWindow._POSTHOG_REMOTE_CONFIG = {
        [KEY]: { config: { autocapture_opt_out: false, heatmaps: false }, siteApps: [] },
      };
      await reloadSDK();
      setConsent(cookieYesConsent(consent));
      const clicked: unknown[] = [];
      posthog.on('eventCaptured', (event) => {
        if (event.event === '$autocapture') clicked.push(event.properties.$el_text);
      });
      cleanup = connect(KEY);
      // The conversation measures itself; jsdom has no ResizeObserver.
      vi.stubGlobal(
        'ResizeObserver',
        class {
          observe() {}
          unobserve() {}
          disconnect() {}
        },
      );
      // Render the real conversation container, which holds every question and answer, so the
      // test covers its markup rather than a copy of it.
      (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
      const { Conversation } = await import('../components/ai/chat/conversation.tsx');
      const container = document.createElement('div');
      const root = createRoot(container);
      // A link outside the chat proves autocapture is live, so an empty result for the message
      // link comes from the exclusion rather than a disabled SDK.
      const control = document.createElement('a');
      control.href = '#outside';
      control.textContent = 'Outside the chat';
      document.body.append(container, control);
      try {
        await act(async () => {
          root.render(
            createElement(
              Conversation,
              null,
              createElement('a', { href: '#guide' }, 'Smart Routing Address'),
            ),
          );
        });
        const link = container.querySelector('a[href="#guide"]');
        expect(link?.textContent).toBe('Smart Routing Address');
        link?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        control.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await vi.advanceTimersByTimeAsync(100);
        expect(clicked).toEqual(['Outside the chat']);
      } finally {
        await act(async () => root.unmount());
        container.remove();
        control.remove();
      }
    },
  );

  it.each([
    ['an accepted opt-in banner', { law: 'gdpr', analytics: true, acted: true }],
    ['an untouched opt-out banner', { law: 'ccpa', analytics: true, acted: false }],
  ] as const)(
    'keeps clicks inside the Inkeep dialog out of autocapture with consent from %s',
    async (_, consent) => {
      visibleBrowser();
      remoteConfigWindow._POSTHOG_REMOTE_CONFIG = {
        [KEY]: { config: { autocapture_opt_out: false, heatmaps: false }, siteApps: [] },
      };
      await reloadSDK();
      setConsent(cookieYesConsent(consent));
      const clicked: unknown[] = [];
      posthog.on('eventCaptured', (event) => {
        if (event.event === '$autocapture') clicked.push(event.properties.$el_text);
      });
      cleanup = connect(KEY);
      // cxkit renders the search and chat modal inside an open shadow root on a host whose id
      // starts with `inkeep-shadow`. Results and answers repeat the visitor's query, and PostHog
      // follows a click into an open shadow root through composedPath().
      const host = document.createElement('div');
      host.id = 'inkeep-shadow-test';
      const result = document.createElement('button');
      result.textContent = 'Ask AI about routing secrets';
      host.attachShadow({ mode: 'open' }).append(result);
      const control = document.createElement('button');
      control.textContent = 'Outside the dialog';
      document.body.append(host, control);
      try {
        result.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
        control.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await vi.advanceTimersByTimeAsync(100);
        expect(clicked).toEqual(['Outside the dialog']);
      } finally {
        host.remove();
        control.remove();
      }
    },
  );

  it('keeps a click PostHog recovers from the Inkeep dialog out of autocapture', async () => {
    visibleBrowser();
    remoteConfigWindow._POSTHOG_REMOTE_CONFIG = {
      [KEY]: { config: { autocapture_opt_out: false, heatmaps: false }, siteApps: [] },
    };
    await reloadSDK();
    setConsent(cookieYesConsent({ law: 'ccpa', analytics: true, acted: false }));
    const clicked: unknown[] = [];
    posthog.on('eventCaptured', (event) => {
      if (event.event === '$autocapture') clicked.push(event.properties.$el_text);
    });
    cleanup = connect(KEY);
    const host = document.createElement('div');
    host.id = 'inkeep-shadow-test';
    const result = document.createElement('button');
    result.textContent = 'Ask AI about routing secrets';
    host.attachShadow({ mode: 'open' }).append(result);
    const control = document.createElement('button');
    control.textContent = 'Outside the dialog';
    document.body.append(host, control);
    const pointer = {
      bubbles: true,
      composed: true,
      pointerId: 1,
      isPrimary: true,
      pointerType: 'mouse',
      button: 0,
      clientX: 10,
      clientY: 10,
      detail: 1,
    };
    // Pressed inside the dialog and released just outside it: the browser targets the click at
    // <body>, and PostHog recovers the pressed element as the click target.
    function pressAndRelease(pressed: Element, clickTarget: Element) {
      pressed.dispatchEvent(new PointerEvent('pointerdown', pointer));
      pressed.dispatchEvent(new PointerEvent('pointerup', pointer));
      clickTarget.dispatchEvent(new PointerEvent('click', pointer));
    }
    try {
      pressAndRelease(result, document.body);
      await vi.advanceTimersByTimeAsync(10);
      // The same sequence outside the dialog proves PostHog recovers the target, so the empty
      // result above comes from the exclusion.
      pressAndRelease(control, document.body);
      await vi.advanceTimersByTimeAsync(10);
      expect(clicked).toEqual(['Outside the dialog']);
    } finally {
      host.remove();
      control.remove();
    }
  });

  it.each([false, true])(
    'keeps the latest queued events and limits immediate bursts (consent: %s)',
    async (immediate) => {
      visibleBrowser();
      // Without consent, the burst arrives while CookieYes has not reported yet.
      setConsent(
        immediate ? cookieYesConsent({ law: 'gdpr', analytics: true, acted: true }) : undefined,
      );
      const { captureChatEvent } = await import('./ai/events.ts');
      const events = watchChatEvents();
      cleanup = connect(KEY);
      // Refill the SDK's burst allowance after startup.
      await vi.advanceTimersByTimeAsync(1000);
      const sources = Array.from({ length: 105 }, (_, i) => `https://docs.arbitrum.io/source-${i}`);
      for (const source_link of sources) {
        captureChatEvent('assistant_source_item_clicked', {
          component_type: 'ChatButton',
          source_link,
        });
      }
      if (!immediate) {
        expect(events).toHaveLength(0);
        update(cookieYesConsent({ law: 'gdpr', analytics: true, acted: true }));
      }
      expect(events.map((event) => event.properties.source_link)).toEqual(
        immediate ? sources.slice(0, 100) : sources.slice(-100),
      );
      update(cookieYesConsent({ law: 'gdpr', analytics: true, acted: true }));
      expect(events).toHaveLength(100);
    },
  );

  it('keeps early Ask AI events until the opt-in banner reports acceptance, including after the cookieless timeout', async () => {
    visibleBrowser();
    setConsent(undefined);
    const { captureChatEvent } = await import('./ai/events.ts');
    const events = watchChatEvents();
    const submittedAt = new Date();
    window.history.replaceState({}, '', '/get-started?topic=wallets');
    document.title = 'Get started';
    const submissionProperties: { component_type: 'SearchBar' | 'ChatButton' } = {
      component_type: 'SearchBar',
    };
    // The user can submit before the analytics effect connects.
    captureChatEvent('user_message_submitted', submissionProperties);
    submissionProperties.component_type = 'ChatButton';
    cleanup = connect(KEY);
    await vi.advanceTimersByTimeAsync(1000);
    const answeredAt = new Date();
    captureChatEvent('assistant_message_received', {
      component_type: 'SearchBar',
    });
    window.history.pushState({}, '', '/resources');
    document.title = 'Resources';
    await vi.advanceTimersByTimeAsync(2000);

    expect(posthog.__loaded).toBe(true);
    expect(posthog.get_distinct_id()).toBe(COOKIELESS_ID);
    expect(events).toHaveLength(0);
    update(cookieYesConsent({ law: 'gdpr', analytics: true, acted: true }));

    expect(events.map((event) => event.event)).toEqual([
      'inkeep_user_message_submitted',
      'inkeep_assistant_message_received',
    ]);
    expect(events.map((event) => event.timestamp)).toEqual([submittedAt, answeredAt]);
    for (const event of events) {
      expect(event.properties).toMatchObject({
        component_type: 'SearchBar',
        $current_url: `${window.location.origin}/get-started?topic=wallets`,
        $pathname: '/get-started',
        title: 'Get started',
        distinct_id: posthog.get_distinct_id(),
      });
      expect(event.properties.$cookieless_mode).not.toBe(true);
    }
    update(cookieYesConsent({ law: 'gdpr', analytics: true, acted: true }));
    cleanup();
    cleanup = connect(KEY);
    expect(events).toHaveLength(2);
  });

  it('drops Ask AI events once the opt-in banner reports without acceptance', async () => {
    visibleBrowser();
    setConsent(undefined);
    const { captureChatEvent } = await import('./ai/events.ts');
    const events = watchChatEvents();
    cleanup = connect(KEY);
    // Queued: CookieYes has not reported yet.
    captureChatEvent('user_message_submitted', {
      component_type: 'ChatButton',
    });
    // The banner is showing and the visitor has not acted.
    update(cookieYesConsent({ law: 'gdpr', analytics: false, acted: false }));
    captureChatEvent('assistant_message_received', {
      component_type: 'ChatButton',
    });
    // The visitor rejects.
    update(cookieYesConsent({ law: 'gdpr', analytics: false, acted: true }));
    captureChatEvent('assistant_source_item_clicked', {
      component_type: 'ChatButton',
    });
    expect(events).toHaveLength(0);
    // A later acceptance sends nothing from before it.
    update(cookieYesConsent({ law: 'gdpr', analytics: true, acted: true }));
    expect(events).toHaveLength(0);
    captureChatEvent('user_message_submitted', {
      component_type: 'ChatButton',
    });
    expect(events.map((event) => event.event)).toEqual(['inkeep_user_message_submitted']);
    expect(events[0]?.properties.$cookieless_mode).not.toBe(true);
  });

  it('flushes queued Ask AI events when the opt-out banner allows analytics by default', async () => {
    visibleBrowser();
    const { captureChatEvent } = await import('./ai/events.ts');
    const events = watchChatEvents();
    captureChatEvent('user_message_submitted', {
      component_type: 'ChatButton',
    });
    setConsent(cookieYesConsent({ law: 'ccpa', analytics: true, acted: false }));
    cleanup = connect(KEY);
    expect(events).toHaveLength(1);
    captureChatEvent('assistant_message_received', {
      component_type: 'ChatButton',
    });
    expect(events).toHaveLength(2);
    expect(events.every((event) => event.properties.$cookieless_mode !== true)).toBe(true);
  });

  it.each(['gdpr', 'ccpa'] as const)(
    'drops Ask AI events after withdrawal and resumes after reacceptance (%s)',
    async (law) => {
      visibleBrowser();
      const { captureChatEvent } = await import('./ai/events.ts');
      const events = watchChatEvents();
      // The opt-out banner allows analytics before the visitor acts.
      setConsent(cookieYesConsent({ law, analytics: true, acted: law === 'gdpr' }));
      cleanup = connect(KEY);
      captureChatEvent('user_message_submitted', {
        component_type: 'ChatButton',
      });
      expect(events).toHaveLength(1);
      update(cookieYesConsent({ law, analytics: false, acted: true }));
      captureChatEvent('assistant_message_received', {
        component_type: 'ChatButton',
      });
      expect(events).toHaveLength(1);
      expect(posthog.get_distinct_id()).toBe(COOKIELESS_ID);
      // Reacceptance in the preference center sends nothing from the withdrawn period.
      update(cookieYesConsent({ law, analytics: true, acted: true }));
      expect(events).toHaveLength(1);
      captureChatEvent('assistant_source_item_clicked', {
        component_type: 'ChatButton',
      });
      expect(events.map((event) => event.event)).toEqual([
        'inkeep_user_message_submitted',
        'inkeep_assistant_source_item_clicked',
      ]);
      expect(events[1]?.properties.$cookieless_mode).not.toBe(true);
    },
  );

  it.each([
    ['an untouched opt-in banner', { law: 'gdpr', analytics: false, acted: false }, true],
    ['an opt-out banner after opting out', { law: 'ccpa', analytics: false, acted: true }, true],
    ['an accepted opt-in banner', { law: 'gdpr', analytics: true, acted: true }, false],
  ] as const)('sends the 404 report with %s', async (_, consent, cookieless) => {
    visibleBrowser();
    window.history.replaceState({}, '', '/missing?gclid=google-click&ref=docs');
    setConsent(cookieYesConsent(consent));
    const { captureNotFoundEvent } = await import('./posthog-consent.ts');
    const reports: Record<string, unknown>[] = [];
    posthog.on('eventCaptured', (event) => {
      if (event.event === '404_error') reports.push(event.properties);
    });
    // The 404 page reports before PostHog has started; the report waits for it.
    captureNotFoundEvent({
      pathname: '/missing',
      search: window.location.search,
      referrer: 'https://www.google.com/search?q=secret+question',
      userAgent: 'Mozilla/5.0 Chrome/140.0.0.0 Safari/537.36',
    });
    cleanup = connect(KEY);
    await vi.advanceTimersByTimeAsync(10);

    expect(reports).toHaveLength(1);
    const [report] = reports;
    if (cookieless) {
      expect(report).toMatchObject({
        $cookieless_mode: true,
        $current_url: `${window.location.origin}/missing?ref=docs`,
        pathname: '/missing',
        search: '?ref=docs',
        referrer: 'https://www.google.com/',
      });
      expect(report).not.toHaveProperty('userAgent');
      expect(report).not.toHaveProperty('gclid');
    } else {
      expect(report).toMatchObject({
        $current_url: `${window.location.origin}/missing?gclid=google-click&ref=docs`,
        search: '?gclid=google-click&ref=docs',
        referrer: 'https://www.google.com/search?q=secret+question',
        userAgent: 'Mozilla/5.0 Chrome/140.0.0.0 Safari/537.36',
      });
      expect(report.$cookieless_mode).not.toBe(true);
    }
  });

  it('does not queue Ask AI events when the project token is absent', async () => {
    visibleBrowser();
    const { captureChatEvent } = await import('./ai/events.ts');
    const events = watchChatEvents();
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', '');
    captureChatEvent('user_message_submitted', {
      component_type: 'ChatButton',
    });
    vi.unstubAllEnvs();
    setConsent(cookieYesConsent({ law: 'gdpr', analytics: true, acted: true }));
    cleanup = connect(KEY);
    expect(events).toHaveLength(0);
  });

  it('captures delayed landing views before flushing Ask AI events in a hidden document', async () => {
    visibleBrowser();
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    const { captureChatEvent } = await import('./ai/events.ts');
    const events = watchChatEvents();
    const order: string[] = [];
    posthog.on('eventCaptured', (event) => {
      if (event.event === '$pageview' || event.event.startsWith('inkeep_')) order.push(event.event);
    });
    window.history.replaceState({}, '', '/?utm_source=campaign');
    setConsent(undefined);
    cleanup = connect(KEY);
    window.history.pushState({}, '', '/resources');
    captureChatEvent('assistant_message_received', {
      component_type: 'ChatButton',
    });
    update(cookieYesConsent({ law: 'gdpr', analytics: true, acted: true }));
    expect(events).toHaveLength(0);
    visibility.mockReturnValue('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(order).toEqual(['$pageview', '$pageview', 'inkeep_assistant_message_received']);
    expect(events[0]?.properties.$session_entry_url).toBe(
      `${window.location.origin}/?utm_source=campaign`,
    );
  });

  it('retains delayed landing attribution across a document reload in the same session', async () => {
    vi.useFakeTimers();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 Chrome/140.0.0.0 Safari/537.36',
    );
    window.history.replaceState({}, '', '/?utm_source=campaign&utm_campaign=launch');
    setConsent(undefined);
    cleanup = connect(KEY);
    window.history.pushState({}, '', '/contact');
    update(cookieYesConsent({ law: 'ccpa', analytics: true, acted: false }));
    const before = posthog.capture('before_reload');
    const entry = `${window.location.origin}/?utm_source=campaign&utm_campaign=launch`;
    expect(before?.properties.$session_entry_url).toBe(entry);
    await flushPersistence();
    await reloadSDK();
    cleanup = connect(KEY);
    const after = posthog.capture('after_reload');
    expect(after?.properties).toMatchObject({
      $session_id: before?.properties.$session_id,
      $session_entry_url: entry,
      $session_entry_utm_source: 'campaign',
      $session_entry_utm_campaign: 'launch',
    });
  });

  it("preserves an existing session's entry when a later document navigates before startup", async () => {
    vi.useFakeTimers();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 Chrome/140.0.0.0 Safari/537.36',
    );
    window.history.replaceState({}, '', '/?utm_source=campaign');
    setConsent(cookieYesConsent({ law: 'ccpa', analytics: true, acted: false }));
    cleanup = connect(KEY);
    const original = posthog.capture('original');
    await flushPersistence();
    window.history.replaceState({}, '', '/brand-kit');
    setConsent(undefined);
    await reloadSDK();
    cleanup = connect(KEY);
    window.history.pushState({}, '', '/contact');
    update(cookieYesConsent({ law: 'ccpa', analytics: true, acted: false }));
    const continued = posthog.capture('continued');
    expect(continued?.properties).toMatchObject({
      $session_id: original?.properties.$session_id,
      $session_entry_url: original?.properties.$session_entry_url,
      $session_entry_utm_source: 'campaign',
    });
  });

  it('uses the current page for the next session after a delayed startup session expires', async () => {
    vi.useFakeTimers();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 Chrome/140.0.0.0 Safari/537.36',
    );
    window.history.replaceState({}, '', '/?utm_source=campaign');
    setConsent(undefined);
    cleanup = connect(KEY);
    window.history.pushState({}, '', '/contact');
    update(cookieYesConsent({ law: 'ccpa', analytics: true, acted: false }));
    const original = posthog.capture('original');
    await vi.advanceTimersByTimeAsync(31 * 60 * 1000);
    const next = posthog.capture('next_session');
    expect(next?.properties.$session_id).not.toBe(original?.properties.$session_id);
    expect(next?.properties.$session_entry_url).toBe(`${window.location.origin}/contact`);
    expect(next?.properties.$session_entry_utm_source).toBeUndefined();
  });

  it.each(['ccpa', 'gdpr', 'timeout'] as const)(
    'preserves landing attribution after navigation before %s startup',
    async (mode) => {
      vi.useFakeTimers();
      vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
      vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
        'Mozilla/5.0 Chrome/140.0.0.0 Safari/537.36',
      );
      window.history.replaceState({}, '', '/?utm_source=campaign&utm_campaign=launch');
      document.title = 'Campaign landing';
      setConsent(undefined);
      const views: {
        url: unknown;
        source: unknown;
        campaign: unknown;
        cookieless: unknown;
        initial: unknown;
        initialSource: unknown;
        entryUrl: unknown;
        entrySource: unknown;
        title: unknown;
      }[] = [];
      posthog.on('eventCaptured', (event) => {
        if (event.event === '$pageview')
          views.push({
            url: event.properties.$current_url,
            source: event.properties.utm_source,
            campaign: event.properties.utm_campaign,
            cookieless: event.properties.$cookieless_mode === true,
            initial: event.$set_once?.$initial_current_url,
            initialSource: event.$set_once?.$initial_utm_source,
            entryUrl: event.properties.$session_entry_url,
            entrySource: event.properties.$session_entry_utm_source,
            title: event.properties.title,
          });
      });
      cleanup = connect(KEY);
      expect(analyticsStorage()).toEqual({ cookie: false, session: [] });
      window.history.pushState({}, '', '/contact');
      document.title = 'Contact';
      if (mode === 'timeout') {
        await vi.advanceTimersByTimeAsync(3000);
      } else {
        update(
          cookieYesConsent({
            law: mode,
            analytics: mode === 'ccpa',
            acted: false,
          }),
        );
        await vi.advanceTimersByTimeAsync(10);
      }
      const landing = `${window.location.origin}/?utm_source=campaign&utm_campaign=launch`;
      expect(views).toHaveLength(2);
      expect(views[0]).toMatchObject({
        url: landing,
        source: 'campaign',
        campaign: 'launch',
        cookieless: mode !== 'ccpa',
        initial: landing,
        initialSource: 'campaign',
        title: 'Campaign landing',
        entryUrl: landing,
        entrySource: 'campaign',
      });
      expect(views[1]).toMatchObject({
        url: `${window.location.origin}/contact`,
        source: 'campaign',
        campaign: 'launch',
        cookieless: mode !== 'ccpa',
        title: 'Contact',
        entryUrl: landing,
        entrySource: 'campaign',
      });
      if (mode !== 'ccpa') expect(analyticsStorage()).toEqual({ cookie: false, session: [] });
      // Consent updates and effect remounts must not replay either startup view.
      cleanup();
      cleanup = connect(KEY);
      update(cookieYesConsent({ law: 'ccpa', analytics: true, acted: true }));
      await vi.advanceTimersByTimeAsync(10);
      expect(views).toHaveLength(2);
      const continued = posthog.capture('after_startup');
      expect(continued?.properties.$session_entry_url).toBe(
        mode === 'ccpa' ? landing : `${window.location.origin}/contact`,
      );
      if (mode === 'ccpa') {
        update(cookieYesConsent({ law: 'ccpa', analytics: false, acted: true }));
        update(cookieYesConsent({ law: 'ccpa', analytics: true, acted: true }));
        expect(posthog.capture('after_reacceptance')?.properties.$session_entry_url).toBe(
          `${window.location.origin}/contact`,
        );
        expect(views).toHaveLength(2);
      }
    },
  );

  // The landing snapshot keeps utm_* only, in step with the sibling repositories. An immediate
  // start lets the SDK read every campaign parameter from the URL; a delayed start does not.
  it.each([
    ['immediate', { gclid: 'google-click', fbclid: 'fb-click' }],
    ['delayed', { gclid: undefined, fbclid: undefined }],
  ] as const)('restores UTMs but not ad click IDs on a %s startup', async (mode, clickIds) => {
    visibleBrowser();
    window.history.replaceState({}, '', '/?utm_source=campaign&gclid=google-click&fbclid=fb-click');
    const views: { source: unknown; gclid: unknown; fbclid: unknown }[] = [];
    posthog.on('eventCaptured', (event) => {
      if (event.event === '$pageview')
        views.push({
          source: event.properties.utm_source,
          gclid: event.properties.gclid,
          fbclid: event.properties.fbclid,
        });
    });
    const consent = cookieYesConsent({
      law: 'ccpa',
      analytics: true,
      acted: false,
    });
    if (mode === 'immediate') setConsent(consent);
    else setConsent(undefined);
    cleanup = connect(KEY);
    if (mode === 'delayed') {
      window.history.pushState({}, '', '/contact');
      update(consent);
    }
    await vi.advanceTimersByTimeAsync(10);
    expect(views[0]).toEqual({ source: 'campaign', ...clickIds });
  });

  it('preserves the landing across remounts and captures startup views only when visible', async () => {
    vi.useFakeTimers();
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 Chrome/140.0.0.0 Safari/537.36',
    );
    window.history.replaceState({}, '', '/?utm_source=campaign');
    setConsent(undefined);
    const views: unknown[] = [];
    posthog.on('eventCaptured', (event) => {
      if (event.event === '$pageview') views.push(event.properties.$current_url);
    });
    cleanup = connect(KEY);
    cleanup();
    window.history.pushState({}, '', '/contact');
    cleanup = connect(KEY);
    update(cookieYesConsent({ law: 'ccpa', analytics: true, acted: false }));
    await vi.advanceTimersByTimeAsync(10);
    expect(views).toEqual([]);
    cleanup();
    cleanup = connect(KEY);
    visibility.mockReturnValue('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    document.dispatchEvent(new Event('visibilitychange'));
    expect(views).toEqual([
      `${window.location.origin}/?utm_source=campaign`,
      `${window.location.origin}/contact`,
    ]);
    await vi.advanceTimersByTimeAsync(10);
    expect(views).toHaveLength(2);
  });

  it.each([
    ['without', false],
    ['after', true],
  ])('captures client-side navigation %s navigation before startup', async (_, navigateEarly) => {
    vi.useFakeTimers();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 Chrome/140.0.0.0 Safari/537.36',
    );
    setConsent(undefined);
    const views: unknown[] = [];
    posthog.on('eventCaptured', (event) => {
      if (event.event === '$pageview') views.push(event.properties.$current_url);
    });
    cleanup = connect(KEY);
    if (navigateEarly) window.history.pushState({}, '', '/contact');
    update(cookieYesConsent({ law: 'ccpa', analytics: true, acted: false }));
    await vi.advanceTimersByTimeAsync(10);
    window.history.pushState({}, '', '/about');
    await vi.advanceTimersByTimeAsync(1000);
    const origin = window.location.origin;
    expect(views).toEqual(
      navigateEarly
        ? [`${origin}/`, `${origin}/contact`, `${origin}/about`]
        : [`${origin}/`, `${origin}/about`],
    );
  });

  it.each([
    ['without', false],
    ['after', true],
  ])('captures query-only navigation %s navigation before startup', async (_, navigateEarly) => {
    vi.useFakeTimers();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 Chrome/140.0.0.0 Safari/537.36',
    );
    window.history.replaceState({}, '', '/docs?version=1');
    setConsent(undefined);
    const views: unknown[] = [];
    posthog.on('eventCaptured', (event) => {
      if (event.event === '$pageview') views.push(event.properties.$current_url);
    });
    cleanup = connect(KEY);
    if (navigateEarly) window.history.pushState({}, '', '/docs?version=2');
    update(cookieYesConsent({ law: 'ccpa', analytics: true, acted: false }));
    await vi.advanceTimersByTimeAsync(10);
    window.history.pushState({}, '', '/docs?version=3');
    await vi.advanceTimersByTimeAsync(10);
    window.history.replaceState({}, '', '/docs?version=4');
    await vi.advanceTimersByTimeAsync(10);
    window.history.pushState({}, '', '/docs?version=5');
    await vi.advanceTimersByTimeAsync(10);
    // Back navigation changes the URL, then fires popstate. jsdom traverses on a timer.
    const popstate = vi.fn();
    window.addEventListener('popstate', popstate, { once: true });
    window.history.back();
    await vi.advanceTimersByTimeAsync(10);
    expect(popstate).toHaveBeenCalledOnce();
    const origin = window.location.origin;
    expect(views).toEqual([
      `${origin}/docs?version=1`,
      ...(navigateEarly ? [`${origin}/docs?version=2`] : []),
      `${origin}/docs?version=3`,
      `${origin}/docs?version=4`,
      `${origin}/docs?version=5`,
      `${origin}/docs?version=4`,
    ]);
  });

  it('writes no analytics storage during init for a saved SDK opt-in without CookieYes consent', () => {
    localStorage.setItem(`__ph_opt_in_out_${KEY}`, '1');
    setConsent(cookieYesConsent({ law: 'gdpr', analytics: false, acted: false }));

    const init = posthog.init.bind(posthog);
    let duringInit: ReturnType<typeof analyticsStorage> | undefined;
    vi.spyOn(posthog, 'init').mockImplementation((...args) => {
      const instance = init(...args);
      duringInit = analyticsStorage();
      return instance;
    });

    cleanup = connect(KEY);

    expect(duringInit).toEqual({ cookie: false, session: [] });
    expect(analyticsStorage()).toEqual({ cookie: false, session: [] });
    expect(posthog.get_distinct_id()).toBe(COOKIELESS_ID);
  });

  it('uses cookies once CookieYes reports consent', async () => {
    vi.useFakeTimers();
    setConsent(cookieYesConsent({ law: 'gdpr', analytics: true, acted: true }));
    cleanup = connect(KEY);
    await flushPersistence();

    expect(analyticsStorage().cookie).toBe(true);
    expect(posthog.get_distinct_id()).not.toBe(COOKIELESS_ID);
  });

  it('removes all analytics storage and returns to cookieless on withdrawal', async () => {
    visibleBrowser();
    setConsent(cookieYesConsent({ law: 'ccpa', analytics: true, acted: false }));
    cleanup = connect(KEY);
    // The first pageview gives the SDK a window id to store.
    await flushPersistence();
    expect(analyticsStorage()).toEqual({
      cookie: true,
      session: expect.arrayContaining([`ph_${KEY}_window_id`]),
    });
    expect(localStorage.getItem(`__ph_opt_in_out_${KEY}`)).toBe('1');

    update(cookieYesConsent({ law: 'ccpa', analytics: false, acted: true }));
    // A debounced write pending at withdrawal must not bring the storage back.
    await flushPersistence();

    // Withdrawal leaves the browser as a never-consented visit would.
    expect(analyticsStorage()).toEqual({ cookie: false, session: [] });
    expect(localStorage.getItem(`__ph_opt_in_out_${KEY}`)).toBeNull();
    expect(posthog.get_distinct_id()).toBe(COOKIELESS_ID);

    update(cookieYesConsent({ law: 'ccpa', analytics: true, acted: true }));
    await flushPersistence();
    expect(analyticsStorage().cookie).toBe(true);
    expect(posthog.get_distinct_id()).not.toBe(COOKIELESS_ID);
  });

  it('sends one cookie-backed landing pageview when the opt-out banner reports late', async () => {
    // CookieYes reports an empty law until its geolocation lookup completes.
    setConsent({
      ...cookieYesConsent({ law: 'ccpa', analytics: true, acted: false }),
      activeLaw: '',
    });
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    // PostHog drops events from jsdom's user agent as bot traffic.
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    );

    const pageviews: { cookieless: boolean; distinctId: unknown }[] = [];
    posthog.on('eventCaptured', (event) => {
      if (event.event === '$pageview') {
        pageviews.push({
          cookieless: event.properties.$cookieless_mode === true,
          distinctId: event.properties.distinct_id,
        });
      }
    });

    cleanup = connect(KEY);
    // Give a cookieless pageview the chance to go out before CookieYes reports.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(posthog.__loaded).toBe(false);

    document.dispatchEvent(
      new CustomEvent('cookieyes_banner_load', {
        detail: cookieYesConsent({
          law: 'ccpa',
          analytics: true,
          acted: false,
        }),
      }),
    );
    // The SDK sends its automatic first pageview on a timer.
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(pageviews).toEqual([{ cookieless: false, distinctId: posthog.get_distinct_id() }]);
    expect(posthog.get_distinct_id()).not.toBe(COOKIELESS_ID);
  });
});
