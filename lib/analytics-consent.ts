interface CookieYesConsent {
  activeLaw?: string;
  categories?: Record<string, boolean | undefined>;
  isUserActionCompleted?: boolean;
}

declare global {
  interface Window {
    getCkyConsent?: () => CookieYesConsent | undefined;
  }
}

// CookieYes picks the banner by visitor location: `ccpa` is the opt-out banner, `gdpr` the opt-in one.
export type ConsentLaw = 'gdpr' | 'ccpa';

export interface AnalyticsConsent {
  /** Undefined until CookieYes reports a known law, which waits on its geolocation lookup. */
  law?: ConsentLaw;
  accepted: boolean;
}

function readConsent(consent: CookieYesConsent | undefined): AnalyticsConsent {
  if (consent?.activeLaw === 'ccpa') {
    // Opt-out banner: analytics is on until the visitor opts out, without any banner action.
    return { law: 'ccpa', accepted: consent.categories?.analytics === true };
  }
  // Opt-in banner, or an unknown law: require an explicit acceptance.
  return {
    law: consent?.activeLaw === 'gdpr' ? 'gdpr' : undefined,
    accepted: consent?.isUserActionCompleted === true && consent.categories?.analytics === true,
  };
}

function getSavedConsent(): CookieYesConsent | undefined {
  try {
    return window.getCkyConsent?.();
  } catch {
    // If CookieYes is unavailable, treat analytics as not consented.
    return undefined;
  }
}

export function subscribeAnalyticsConsent(
  onConsent: (consent: AnalyticsConsent) => void,
): () => void {
  function onBannerLoad(event: Event) {
    onConsent(readConsent((event as CustomEvent<CookieYesConsent>).detail));
  }

  function onConsentUpdate() {
    // The event detail lacks the active law and whether the visitor acted (the opt-out banner fires
    // it for its defaults too). CookieYes saves consent before dispatching, so read it back instead.
    onConsent(readConsent(getSavedConsent()));
  }

  document.addEventListener('cookieyes_banner_load', onBannerLoad);
  document.addEventListener('cookieyes_consent_update', onConsentUpdate);

  // CookieYes may have fired its banner event before this script ran.
  onConsent(readConsent(getSavedConsent()));

  return () => {
    document.removeEventListener('cookieyes_banner_load', onBannerLoad);
    document.removeEventListener('cookieyes_consent_update', onConsentUpdate);
  };
}
