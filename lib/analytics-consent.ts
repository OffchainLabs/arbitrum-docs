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

export type ConsentCategory = 'analytics' | 'advertisement';

export interface AnalyticsConsent {
  /** Undefined until CookieYes reports a known law, which waits on its geolocation lookup. */
  law?: ConsentLaw;
  accepted: boolean;
}

function readConsent(
  consent: CookieYesConsent | undefined,
  category: ConsentCategory,
): AnalyticsConsent {
  if (consent?.activeLaw === 'ccpa') {
    // Opt-out banner: the category is on until the visitor opts out, without any banner action.
    return { law: 'ccpa', accepted: consent.categories?.[category] === true };
  }
  // Opt-in banner, or an unknown law: require an explicit acceptance.
  return {
    law: consent?.activeLaw === 'gdpr' ? 'gdpr' : undefined,
    accepted: consent?.isUserActionCompleted === true && consent.categories?.[category] === true,
  };
}

function getSavedConsent(): CookieYesConsent | undefined {
  try {
    return window.getCkyConsent?.();
  } catch {
    // If CookieYes is unavailable, treat the category as not consented.
    return undefined;
  }
}

export function hasAnalyticsConsent(category: ConsentCategory = 'analytics'): boolean {
  return readConsent(getSavedConsent(), category).accepted;
}

export function subscribeAnalyticsConsent(
  onConsent: (consent: AnalyticsConsent) => void,
  category: ConsentCategory = 'analytics',
): () => void {
  function onBannerLoad(event: Event) {
    onConsent(readConsent((event as CustomEvent<CookieYesConsent>).detail, category));
  }

  function onConsentUpdate() {
    // The event detail lacks the active law and whether the visitor acted (the opt-out banner fires
    // it for its defaults too). CookieYes saves consent before dispatching, so read it back instead.
    onConsent(readConsent(getSavedConsent(), category));
  }

  document.addEventListener('cookieyes_banner_load', onBannerLoad);
  document.addEventListener('cookieyes_consent_update', onConsentUpdate);

  // CookieYes may have fired its banner event before this script ran.
  onConsent(readConsent(getSavedConsent(), category));

  return () => {
    document.removeEventListener('cookieyes_banner_load', onBannerLoad);
    document.removeEventListener('cookieyes_consent_update', onConsentUpdate);
  };
}
