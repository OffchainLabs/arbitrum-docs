import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { consentUpdateDetail, cookieYesConsent } from './cookieyes.fixture.ts';
import {
  type HubspotCommand,
  type HubspotConsentCommand,
  createHubspotTracking,
} from './hubspot.ts';

let tracking: ReturnType<typeof createHubspotTracking>;
let cleanup: (() => void) | undefined;
let documentEvents: EventTarget;
let scripts: HTMLScriptElement[];
let requests: Array<{ kind: string; path: string }>;
let optedOut: boolean;
let path: string;
let privacyReady: boolean;
let cookieConsent: boolean;
let cookieListeners: Array<(accepted: boolean) => void>;
let cookies: string[];
let cookieWrites: string[];

function executePrivacy(command: HubspotConsentCommand) {
  cookieConsent = command[1].analytics;
  for (const listener of cookieListeners) listener(cookieConsent);
}

function finishPrivacyLoading() {
  const queued = window._hsp as HubspotConsentCommand[];
  window._hsp = { push: executePrivacy };
  privacyReady = true;
  queued.forEach(executePrivacy);
}

function capture(kind: string) {
  if (!optedOut) requests.push({ kind, path });
}

function execute(command: HubspotCommand) {
  if (typeof command === 'function') command();
  else if (command[0] === 'setPath') path = command[1];
  else if (command[0] === 'doNotTrack') optedOut = !command[1]?.track;
  else if (command[0] === 'trackPageView') capture('pageview');
}

function finishLoading() {
  const queued = window._hsq as HubspotCommand[];
  window._hsq = { push: execute };
  // Model HubSpot's priority processing: paths and doNotTrack are applied before
  // the automatic first pageview, and callbacks run afterwards.
  queued.filter((command) => typeof command !== 'function').forEach(execute);
  // HubSpot's cookie lifecycle follows its privacy API, independently of doNotTrack.
  const saveCookies = (accepted: boolean) => {
    cookies = accepted ? ['hubspotutk', '__hstc', '__hssc', '__hssrc'] : [];
    cookieWrites.push(...cookies);
  };
  cookieListeners.push(saveCookies);
  if (privacyReady) saveCookies(cookieConsent);
  capture('pageview');
  queued.filter((command) => typeof command === 'function').forEach(execute);
}

// CookieYes saves consent before firing the update, so the saved consent changes first.
function setConsent(consent: ReturnType<typeof cookieYesConsent>) {
  window.getCkyConsent = () => consent;
  documentEvents.dispatchEvent(
    new CustomEvent('cookieyes_consent_update', {
      detail: consentUpdateDetail(consent),
    }),
  );
}

// Opt-in banner: the visitor has made an explicit choice.
function savedConsent(analytics: boolean) {
  const consent = cookieYesConsent({ law: 'gdpr', analytics, acted: true });
  window.getCkyConsent = () => consent;
}

function updateConsent(analytics: boolean) {
  setConsent(cookieYesConsent({ law: 'gdpr', analytics, acted: true }));
}

function optOutBanner(analytics: boolean, acted = true) {
  setConsent(cookieYesConsent({ law: 'ccpa', analytics, acted }));
}

function navigate(destination: string, track: (path: string) => void) {
  const url = new URL(destination, 'https://docs.arbitrum.io');
  Object.assign(window.location, {
    pathname: url.pathname,
    search: url.search,
  });
  track(destination);
}

beforeEach(() => {
  tracking = createHubspotTracking();
  scripts = [];
  requests = [];
  optedOut = false;
  path = '/';
  privacyReady = false;
  cookieConsent = false;
  cookieListeners = [];
  cookies = [];
  cookieWrites = [];
  documentEvents = new EventTarget();
  vi.stubGlobal(
    'document',
    Object.assign(documentEvents, {
      createElement: vi.fn(() => ({})),
      getElementById: (id: string) => scripts.find((script) => script.id === id),
      head: {
        appendChild: (script: HTMLScriptElement) => scripts.push(script),
      },
    }),
  );
  vi.stubGlobal('window', { location: { pathname: '/', search: '' } });
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.unstubAllGlobals();
});

describe('HubSpot tracking', () => {
  it.each(['privacy-first', 'analytics-first'])(
    'prevents late cookie writes after withdrawal with %s loading',
    (order) => {
      savedConsent(true);
      cleanup = tracking.connect();
      tracking.trackPage('/');
      updateConsent(false);
      if (order === 'privacy-first') {
        finishPrivacyLoading();
        finishLoading();
      } else {
        finishLoading();
        finishPrivacyLoading();
      }
      expect(window.disableHubSpotCookieBanner).toBe(true);
      expect(cookies).toEqual([]);
      expect(cookieWrites).toEqual([]);
      expect(requests).toEqual([]);
      updateConsent(true);
      expect(cookies).toContain('hubspotutk');
      // Acceptance after HubSpot has loaded counts the page the visitor is on.
      expect(requests).toEqual([{ kind: 'pageview', path: '/' }]);
      navigate('/contact', tracking.trackPage);
      expect(requests.at(-1)).toEqual({ kind: 'pageview', path: '/contact' });
      updateConsent(false);
      expect(cookies).toEqual([]);
      capture('click');
      expect(requests).toHaveLength(2);
    },
  );

  it('keeps advertising and functionality cookies disabled when analytics is accepted', () => {
    savedConsent(true);
    cleanup = tracking.connect();
    expect(window._hsp).toEqual([
      [
        'setHubSpotConsent',
        {
          analytics: true,
          advertisement: false,
          functionality: false,
        },
      ],
    ]);
  });

  it.each([
    undefined,
    cookieYesConsent({ law: 'gdpr', analytics: false, acted: false }),
    cookieYesConsent({ law: 'gdpr', analytics: true, acted: false }),
    cookieYesConsent({ law: 'gdpr', analytics: false, acted: true }),
    cookieYesConsent({ law: 'ccpa', analytics: false, acted: true }),
    {
      ...cookieYesConsent({ law: 'gdpr', analytics: true, acted: true }),
      categories: {},
    },
  ])('does not insert or initialize the loader without explicit consent: %j', (consent) => {
    window.getCkyConsent = () => consent;
    cleanup = tracking.connect();
    documentEvents.dispatchEvent(new CustomEvent('cookieyes_banner_load', { detail: consent }));
    tracking.trackPage('/');
    tracking.trackPage('/contact');
    expect(document.createElement).not.toHaveBeenCalled();
    expect(scripts).toEqual([]);
    expect(window._hsq).toBeUndefined();
  });

  it('fails closed when the saved-consent API is missing or throws', () => {
    cleanup = tracking.connect();
    expect(scripts).toEqual([]);
    cleanup();
    window.getCkyConsent = () => {
      throw new Error('unavailable');
    };
    cleanup = tracking.connect();
    expect(scripts).toEqual([]);
  });

  it('loads once for saved consent and clears an earlier HubSpot opt-out', () => {
    optedOut = true;
    savedConsent(true);
    cleanup = tracking.connect();
    expect(scripts).toHaveLength(1);
    expect(scripts[0]).toMatchObject({ id: 'hs-script-loader', async: true });
    finishLoading();
    updateConsent(true);
    expect(scripts).toHaveLength(1);
    expect(requests).toEqual([{ kind: 'pageview', path: '/' }]);
  });

  it('waits for CookieYes when the banner loads after hydration', () => {
    cleanup = tracking.connect();
    expect(scripts).toEqual([]);
    documentEvents.dispatchEvent(
      new CustomEvent('cookieyes_banner_load', {
        detail: cookieYesConsent({ law: 'gdpr', analytics: true, acted: true }),
      }),
    );
    expect(scripts).toHaveLength(1);
  });

  it('ignores unrelated categories and malformed consent updates', () => {
    cleanup = tracking.connect();
    for (const detail of [
      undefined,
      { accepted: 'analytics' },
      { accepted: ['advertisement'] },
      // Only saved consent counts: the detail lacks the law and whether the visitor acted.
      { accepted: ['necessary', 'analytics'] },
    ]) {
      documentEvents.dispatchEvent(new CustomEvent('cookieyes_consent_update', { detail }));
    }
    expect(scripts).toEqual([]);
  });

  it('stops automatic capture immediately on withdrawal without navigation and counts the page on reacceptance', () => {
    cleanup = tracking.connect();
    updateConsent(true);
    finishLoading();
    capture('click');
    expect(requests).toHaveLength(2);
    updateConsent(false);
    capture('click');
    expect(optedOut).toBe(true);
    expect(requests).toHaveLength(2);
    updateConsent(true);
    capture('click');
    expect(requests.slice(2)).toEqual([
      { kind: 'pageview', path: '/' },
      { kind: 'click', path: '/' },
    ]);
    expect(scripts).toHaveLength(1);
  });

  it('suppresses the automatic initial view when consent is withdrawn during loading', () => {
    cleanup = tracking.connect();
    updateConsent(true);
    updateConsent(false);
    finishLoading();
    capture('click');
    expect(optedOut).toBe(true);
    expect(requests).toEqual([]);
    updateConsent(true);
    capture('click');
    // The suppressed automatic view stays suppressed; reacceptance counts the current page once.
    expect(requests).toEqual([
      { kind: 'pageview', path: '/' },
      { kind: 'click', path: '/' },
    ]);
    expect(scripts).toHaveLength(1);
  });

  it('uses the latest consent when withdrawal and reacceptance both happen during loading', () => {
    cleanup = tracking.connect();
    updateConsent(true);
    updateConsent(false);
    updateConsent(true);
    finishLoading();
    expect(requests).toEqual([{ kind: 'pageview', path: '/' }]);
    expect(scripts).toHaveLength(1);
  });

  it('tracks routes and query changes without replaying visits made without consent', () => {
    const track = tracking.trackPage;
    cleanup = tracking.connect();
    navigate('/', track);
    navigate('/contact', track);
    updateConsent(true);
    // The accepted URL is set even though acceptance does not rerun a route effect.
    finishLoading();
    expect(requests).toEqual([{ kind: 'pageview', path: '/contact' }]);
    navigate('/build-app?topic=gaming', track);
    navigate('/build-app?topic=gaming', track);
    expect(requests.at(-1)).toEqual({
      kind: 'pageview',
      path: '/build-app?topic=gaming',
    });
    expect(requests).toHaveLength(2);
    updateConsent(false);
    navigate('/brand-kit', track);
    navigate('/integrations', track);
    capture('click');
    expect(requests).toHaveLength(2);
    updateConsent(true);
    capture('click');
    // Only the page the visitor is on when they accept again; /brand-kit is not replayed.
    expect(requests.slice(2)).toEqual([
      { kind: 'pageview', path: '/integrations' },
      { kind: 'click', path: '/integrations' },
    ]);
  });

  it('leaves the first view to HubSpot and tracks query-only changes and return visits', () => {
    savedConsent(true);
    cleanup = tracking.connect();
    finishLoading();
    tracking.trackPage('/');
    tracking.trackPage('/');
    expect(requests).toHaveLength(1);
    navigate('/build-app?topic=gaming', tracking.trackPage);
    navigate('/build-app?topic=finance', tracking.trackPage);
    navigate('/', tracking.trackPage);
    expect(requests).toEqual([
      { kind: 'pageview', path: '/' },
      { kind: 'pageview', path: '/build-app?topic=gaming' },
      { kind: 'pageview', path: '/build-app?topic=finance' },
      { kind: 'pageview', path: '/' },
    ]);
  });

  it('uses the latest route for the initial view when navigation happens during loading', () => {
    savedConsent(true);
    cleanup = tracking.connect();
    navigate('/', tracking.trackPage);
    navigate('/contact', tracking.trackPage);
    navigate('/build-app', tracking.trackPage);
    expect(requests).toEqual([]);
    finishLoading();
    expect(requests).toEqual([{ kind: 'pageview', path: '/build-app' }]);
    navigate('/build-app', tracking.trackPage);
    expect(requests).toHaveLength(1);
    navigate('/integrations', tracking.trackPage);
    expect(requests.at(-1)).toEqual({
      kind: 'pageview',
      path: '/integrations',
    });
  });

  it('does not duplicate the first view when React replays effects while loading', () => {
    savedConsent(true);
    cleanup = tracking.connect();
    tracking.trackPage('/');
    cleanup();
    cleanup = tracking.connect();
    tracking.trackPage('/');
    finishLoading();
    expect(scripts).toHaveLength(1);
    expect(requests).toEqual([{ kind: 'pageview', path: '/' }]);
    navigate('/contact', tracking.trackPage);
    expect(requests.at(-1)).toEqual({ kind: 'pageview', path: '/contact' });
  });

  it('disables capture on cleanup and reuses the loader across effect remounts', () => {
    savedConsent(true);
    cleanup = tracking.connect();
    finishLoading();
    cleanup();
    updateConsent(true);
    capture('click');
    expect(optedOut).toBe(true);
    expect(requests).toHaveLength(1);
    cleanup = tracking.connect();
    capture('click');
    expect(optedOut).toBe(false);
    expect(requests.slice(1)).toEqual([
      { kind: 'pageview', path: '/' },
      { kind: 'click', path: '/' },
    ]);
    expect(scripts).toHaveLength(1);
  });

  describe('opt-out banner', () => {
    it('loads by default before the visitor interacts with the banner', () => {
      cleanup = tracking.connect();
      optOutBanner(true, false);
      expect(scripts).toHaveLength(1);
      finishLoading();
      expect(requests).toEqual([{ kind: 'pageview', path: '/' }]);
    });

    it('stops tracking on opt-out and resumes on undo without reinserting the loader', () => {
      cleanup = tracking.connect();
      optOutBanner(true, false);
      finishLoading();
      optOutBanner(false);
      capture('click');
      navigate('/contact', tracking.trackPage);
      expect(optedOut).toBe(true);
      expect(requests).toHaveLength(1);
      optOutBanner(true);
      capture('click');
      expect(optedOut).toBe(false);
      expect(requests.at(-1)).toEqual({ kind: 'click', path: '/contact' });
      expect(scripts).toHaveLength(1);
    });

    it('does not load for a returning visitor who opted out until they undo it', () => {
      const optedOut = cookieYesConsent({
        law: 'ccpa',
        analytics: false,
        acted: true,
      });
      window.getCkyConsent = () => optedOut;
      cleanup = tracking.connect();
      tracking.trackPage('/');
      expect(scripts).toEqual([]);
      expect(window._hsq).toBeUndefined();
      optOutBanner(true);
      expect(scripts).toHaveLength(1);
    });
  });
});
