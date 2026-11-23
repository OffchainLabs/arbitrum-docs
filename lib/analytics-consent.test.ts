import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type AnalyticsConsent, subscribeAnalyticsConsent } from './analytics-consent.ts';
import { consentUpdateDetail, cookieYesConsent } from './cookieyes.fixture.ts';

let documentEvents: EventTarget;
let received: AnalyticsConsent[];
let cleanup: (() => void) | undefined;

beforeEach(() => {
  documentEvents = new EventTarget();
  received = [];
  vi.stubGlobal('document', documentEvents);
  vi.stubGlobal('window', {});
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.unstubAllGlobals();
});

// The first report a subscriber gets is the saved consent.
function savedConsentAccepted(): boolean {
  const reports: AnalyticsConsent[] = [];
  subscribeAnalyticsConsent((consent) => reports.push(consent))();
  return reports[0].accepted;
}

describe('analytics consent', () => {
  it.each([
    // Opt-out banner: analytics is on until the visitor opts out, with or without banner action.
    [{ law: 'ccpa', analytics: true, acted: false }, true],
    [{ law: 'ccpa', analytics: true, acted: true }, true],
    [{ law: 'ccpa', analytics: false, acted: true }, false],
    // Opt-in banner: only an explicit acceptance counts.
    [{ law: 'gdpr', analytics: false, acted: false }, false],
    [{ law: 'gdpr', analytics: true, acted: false }, false],
    [{ law: 'gdpr', analytics: false, acted: true }, false],
    [{ law: 'gdpr', analytics: true, acted: true }, true],
  ] as const)('reads %j as accepted: %s', (options, accepted) => {
    window.getCkyConsent = () => cookieYesConsent(options);
    expect(savedConsentAccepted()).toBe(accepted);
  });

  it.each([
    // CookieYes returns an empty law and no categories when its banner config failed to load.
    [
      {
        ...cookieYesConsent({ law: 'ccpa', analytics: true, acted: false }),
        activeLaw: '',
      },
      false,
    ],
    [
      {
        ...cookieYesConsent({ law: 'gdpr', analytics: true, acted: true }),
        activeLaw: '',
      },
      true,
    ],
    [
      {
        ...cookieYesConsent({ law: 'ccpa', analytics: true, acted: false }),
        categories: {},
      },
      false,
    ],
    [undefined, false],
  ])('falls back to opt-in rules for degraded consent %j: %s', (consent, accepted) => {
    window.getCkyConsent = () => consent;
    expect(savedConsentAccepted()).toBe(accepted);
  });

  it.each([
    [undefined, undefined],
    [
      {
        ...cookieYesConsent({ law: 'gdpr', analytics: false, acted: false }),
        activeLaw: '',
      },
      undefined,
    ],
    [
      {
        ...cookieYesConsent({ law: 'gdpr', analytics: false, acted: false }),
        activeLaw: 'lgpd',
      },
      undefined,
    ],
    [cookieYesConsent({ law: 'gdpr', analytics: false, acted: false }), 'gdpr'],
    [cookieYesConsent({ law: 'ccpa', analytics: true, acted: false }), 'ccpa'],
  ])('reports the law only once CookieYes knows it: %j', (consent, law) => {
    window.getCkyConsent = () => consent;
    cleanup = subscribeAnalyticsConsent((value) => received.push(value));
    expect(received[0]?.law).toBe(law);
  });

  it('fails closed when CookieYes is missing or throws', () => {
    expect(savedConsentAccepted()).toBe(false);
    window.getCkyConsent = () => {
      throw new Error('unavailable');
    };
    expect(savedConsentAccepted()).toBe(false);
  });

  it('reports the law with saved consent, banner load, and updates', () => {
    window.getCkyConsent = () => undefined;
    cleanup = subscribeAnalyticsConsent((consent) => received.push(consent));
    documentEvents.dispatchEvent(
      new CustomEvent('cookieyes_banner_load', {
        detail: cookieYesConsent({
          law: 'ccpa',
          analytics: true,
          acted: false,
        }),
      }),
    );
    const optedOut = cookieYesConsent({
      law: 'ccpa',
      analytics: false,
      acted: true,
    });
    window.getCkyConsent = () => optedOut;
    documentEvents.dispatchEvent(
      new CustomEvent('cookieyes_consent_update', {
        detail: consentUpdateDetail(optedOut),
      }),
    );
    expect(received).toEqual([
      { law: undefined, accepted: false },
      { law: 'ccpa', accepted: true },
      { law: 'ccpa', accepted: false },
    ]);
  });

  it('reads saved consent rather than the update detail', () => {
    const pending = cookieYesConsent({
      law: 'gdpr',
      analytics: false,
      acted: false,
    });
    window.getCkyConsent = () => pending;
    cleanup = subscribeAnalyticsConsent((consent) => received.push(consent));
    documentEvents.dispatchEvent(
      new CustomEvent('cookieyes_consent_update', {
        detail: consentUpdateDetail(
          cookieYesConsent({ law: 'gdpr', analytics: true, acted: true }),
        ),
      }),
    );
    expect(received.at(-1)).toEqual({ law: 'gdpr', accepted: false });
  });

  it('stops listening after cleanup', () => {
    cleanup = subscribeAnalyticsConsent((consent) => received.push(consent));
    cleanup();
    documentEvents.dispatchEvent(new CustomEvent('cookieyes_consent_update'));
    expect(received).toHaveLength(1);
  });

  it.each([
    [{ analytics: true, advertisement: false }, true],
    [{ analytics: false, advertisement: true }, false],
  ])('reads only the analytics category: %j', (categories, accepted) => {
    window.getCkyConsent = () => ({
      ...cookieYesConsent({ law: 'gdpr', analytics: true, acted: true }),
      categories,
    });
    expect(savedConsentAccepted()).toBe(accepted);
  });
});
