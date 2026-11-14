import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { consentUpdateDetail, cookieYesConsent } from './cookieyes.fixture.ts';

const posthog = vi.hoisted(() => ({
  init: vi.fn(),
  set_config: vi.fn(),
  opt_in_capturing: vi.fn(),
  opt_out_capturing: vi.fn(),
  has_opted_in_capturing: vi.fn(),
  has_opted_out_capturing: vi.fn(),
}));

vi.mock('posthog-js', () => ({ default: posthog }));

let connect: typeof import('./posthog-consent.ts').connectPosthogConsent;
let timeoutMs: number;
let cleanup: (() => void) | undefined;
let documentEvents: EventTarget;
let optedIn: boolean;

function dispatch(type: string, detail?: unknown) {
  documentEvents.dispatchEvent(new CustomEvent(type, { detail }));
}

// CookieYes saves consent before firing the update, so the stub changes first.
function update(consent: ReturnType<typeof cookieYesConsent>) {
  window.getCkyConsent = () => consent;
  dispatch('cookieyes_consent_update', consentUpdateDetail(consent));
}

function accept() {
  update(cookieYesConsent({ law: 'gdpr', analytics: true, acted: true }));
}

function optOutBanner(analytics: boolean) {
  update(cookieYesConsent({ law: 'ccpa', analytics: analytics, acted: true }));
}

// Consent turns autocapture on; replay, heatmaps and dead clicks stay off either way.
const cookieCaptureConfig = {
  autocapture: true,
  disable_session_recording: true,
  capture_heatmaps: false,
  capture_dead_clicks: false,
};

const cookielessCaptureConfig = {
  autocapture: false,
  disable_session_recording: true,
  capture_heatmaps: false,
  capture_dead_clicks: false,
};

const baseConfig = {
  api_host: 'https://us.i.posthog.com',
  defaults: '2026-08-30',
  disable_surveys: true,
  disable_product_tours: true,
  disable_conversations: true,
  persistence: 'cookie',
  disable_persistence: true,
  ...cookielessCaptureConfig,
  capture_pageview: { path: true, search: true },
  before_send: expect.any(Function),
  opt_out_capturing_by_default: true,
  opt_out_persistence_by_default: true,
  cookieless_mode: 'on_reject',
};

beforeEach(async () => {
  vi.resetModules();
  vi.resetAllMocks();
  optedIn = false;
  posthog.has_opted_in_capturing.mockImplementation(() => optedIn);
  posthog.has_opted_out_capturing.mockImplementation(() => !optedIn);
  posthog.opt_in_capturing.mockImplementation(() => {
    optedIn = true;
  });
  posthog.opt_out_capturing.mockImplementation(() => {
    optedIn = false;
  });
  documentEvents = new EventTarget();
  vi.stubGlobal('document', documentEvents);
  vi.stubGlobal('window', {
    location: { href: 'https://docs.arbitrum.io/' },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
  ({ connectPosthogConsent: connect, COOKIEYES_LAW_TIMEOUT_MS: timeoutMs } =
    await import('./posthog-consent.ts'));
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('PostHog CookieYes consent', () => {
  // With cookieless_mode 'on_reject', PostHog captures cookieless whenever it is not opted in.

  it.each([
    cookieYesConsent({ law: 'gdpr', analytics: false, acted: false }),
    cookieYesConsent({ law: 'gdpr', analytics: true, acted: false }),
    cookieYesConsent({ law: 'gdpr', analytics: false, acted: true }),
    cookieYesConsent({ law: 'ccpa', analytics: false, acted: true }),
  ])('starts cookieless without analytics consent: %j', (consent) => {
    window.getCkyConsent = () => consent;
    cleanup = connect('test-key');
    expect(posthog.init).toHaveBeenCalledWith('test-key', baseConfig);
    expect(posthog.opt_in_capturing).not.toHaveBeenCalled();
    expect(posthog.set_config).toHaveBeenLastCalledWith({
      disable_persistence: true,
      ...cookielessCaptureConfig,
      advanced_disable_flags: true,
    });
    expect(optedIn).toBe(false);
  });

  it('waits for CookieYes to report its law, then uses cookies on the opt-out banner', () => {
    cleanup = connect('test-key');
    // An empty law means CookieYes has not finished its geolocation lookup.
    const pending = cookieYesConsent({
      law: 'ccpa',
      analytics: true,
      acted: false,
    });
    window.getCkyConsent = () => ({ ...pending, activeLaw: '' });
    dispatch('cookieyes_consent_update', consentUpdateDetail(pending));
    expect(posthog.init).not.toHaveBeenCalled();
    dispatch(
      'cookieyes_banner_load',
      cookieYesConsent({ law: 'ccpa', analytics: true, acted: false }),
    );
    expect(posthog.init).toHaveBeenCalledWith('test-key', {
      ...baseConfig,
      disable_persistence: false,
      ...cookieCaptureConfig,
    });
    expect(optedIn).toBe(true);
    expect(posthog.opt_out_capturing).not.toHaveBeenCalled();
  });

  it.each([
    ['is missing', undefined],
    [
      'throws',
      () => {
        throw new Error('unavailable');
      },
    ],
  ])('starts cookieless after a timeout if CookieYes %s', (_, getCkyConsent) => {
    vi.useFakeTimers();
    window.getCkyConsent = getCkyConsent;
    cleanup = connect('test-key');
    vi.advanceTimersByTime(timeoutMs - 1);
    expect(posthog.init).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(posthog.init).toHaveBeenCalledWith('test-key', baseConfig);
    expect(optedIn).toBe(false);
  });

  it('switches to cookies when CookieYes reports the opt-out banner after the timeout', () => {
    vi.useFakeTimers();
    cleanup = connect('test-key');
    vi.advanceTimersByTime(timeoutMs);
    optOutBanner(true);
    expect(optedIn).toBe(true);
    expect(posthog.init).toHaveBeenCalledTimes(1);
  });

  it('cancels the pending timeout on cleanup', () => {
    vi.useFakeTimers();
    cleanup = connect('test-key');
    cleanup();
    cleanup = undefined;
    vi.advanceTimersByTime(timeoutMs);
    expect(posthog.init).not.toHaveBeenCalled();
  });

  it('opts out of an old PostHog opt-in that CookieYes does not confirm', () => {
    optedIn = true;
    window.getCkyConsent = () => cookieYesConsent({ law: 'gdpr', analytics: false, acted: false });
    cleanup = connect('test-key');
    expect(posthog.opt_out_capturing).toHaveBeenCalledTimes(1);
    expect(optedIn).toBe(false);
  });

  it('switches to cookies when the visitor accepts on the opt-in banner', () => {
    cleanup = connect('test-key');
    update(cookieYesConsent({ law: 'gdpr', analytics: false, acted: false }));
    expect(optedIn).toBe(false);
    accept();
    expect(optedIn).toBe(true);
    expect(posthog.set_config).toHaveBeenLastCalledWith({
      disable_persistence: false,
      ...cookieCaptureConfig,
      advanced_disable_flags: false,
    });
    expect(posthog.init).toHaveBeenCalledTimes(1);
  });

  it('restores saved consent when CookieYes loaded before hydration', () => {
    const saved = cookieYesConsent({
      law: 'gdpr',
      analytics: true,
      acted: true,
    });
    window.getCkyConsent = () => saved;
    cleanup = connect('test-key');
    expect(optedIn).toBe(true);
    expect(posthog.init).toHaveBeenCalledWith('test-key', {
      ...baseConfig,
      disable_persistence: false,
      ...cookieCaptureConfig,
    });
  });

  it('handles CookieYes loading after hydration and avoids duplicate opt-ins', () => {
    cleanup = connect('test-key');
    dispatch(
      'cookieyes_banner_load',
      cookieYesConsent({ law: 'gdpr', analytics: true, acted: true }),
    );
    accept();
    expect(posthog.init).toHaveBeenCalledTimes(1);
    expect(posthog.opt_in_capturing).toHaveBeenCalledTimes(1);
  });

  it('returns to cookieless on withdrawal and to cookies on reacceptance', () => {
    cleanup = connect('test-key');
    accept();
    update(cookieYesConsent({ law: 'gdpr', analytics: false, acted: true }));
    expect(optedIn).toBe(false);
    expect(posthog.set_config).toHaveBeenLastCalledWith({
      disable_persistence: true,
      ...cookielessCaptureConfig,
      advanced_disable_flags: true,
    });
    expect(posthog.opt_out_capturing).toHaveBeenCalledTimes(1);
    accept();
    expect(optedIn).toBe(true);
    expect(posthog.set_config).toHaveBeenLastCalledWith({
      disable_persistence: false,
      ...cookieCaptureConfig,
      advanced_disable_flags: false,
    });
    expect(posthog.init).toHaveBeenCalledTimes(1);
    expect(posthog.opt_in_capturing).toHaveBeenCalledTimes(2);
  });

  it('ignores the event detail and requires saved consent', () => {
    cleanup = connect('test-key');
    dispatch(
      'cookieyes_consent_update',
      consentUpdateDetail(cookieYesConsent({ law: 'gdpr', analytics: true, acted: true })),
    );
    expect(optedIn).toBe(false);
  });

  it('uses cookies by default on the opt-out banner', () => {
    cleanup = connect('test-key');
    optOutBanner(true);
    expect(optedIn).toBe(true);
  });

  it('switches to cookieless on opt-out and back to cookies when the opt-out is undone', () => {
    cleanup = connect('test-key');
    optOutBanner(true);
    optOutBanner(false);
    expect(optedIn).toBe(false);
    expect(posthog.opt_out_capturing).toHaveBeenCalledTimes(1);
    optOutBanner(true);
    expect(optedIn).toBe(true);
    expect(posthog.init).toHaveBeenCalledTimes(1);
  });

  it('cleans up listeners and preserves the singleton across effect remounts', () => {
    const saved = cookieYesConsent({
      law: 'gdpr',
      analytics: true,
      acted: true,
    });
    window.getCkyConsent = () => saved;
    cleanup = connect('test-key');
    cleanup();
    update(cookieYesConsent({ law: 'gdpr', analytics: false, acted: true }));
    expect(posthog.opt_out_capturing).not.toHaveBeenCalled();
    window.getCkyConsent = () => saved;
    cleanup = connect('test-key');
    expect(posthog.init).toHaveBeenCalledTimes(1);
    expect(posthog.opt_in_capturing).toHaveBeenCalledTimes(1);
  });
});
