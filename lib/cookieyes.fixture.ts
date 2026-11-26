// Test fixtures shaped like CookieYes's real `getCkyConsent()` result and consent update event
// detail, so tests exercise the same objects the CDN banner hands us.

const CATEGORIES = [
  'necessary',
  'functional',
  'analytics',
  'performance',
  'advertisement',
  'other',
] as const;

interface ConsentOptions {
  /** `gdpr` is the opt-in banner, `ccpa` the opt-out banner. */
  law: 'gdpr' | 'ccpa';
  analytics: boolean;
  /** Whether the visitor has interacted with the banner (`isUserActionCompleted`). */
  acted: boolean;
}

export function cookieYesConsent({ law, analytics, acted }: ConsentOptions) {
  return {
    activeLaw: law,
    categories: Object.fromEntries(
      CATEGORIES.map((category) => [category, category === 'necessary' || analytics]),
    ),
    isUserActionCompleted: acted,
    consentID: 'test-consent-id',
    languageCode: 'en',
  };
}

export function consentUpdateDetail(consent: ReturnType<typeof cookieYesConsent>) {
  const entries = Object.entries(consent.categories);
  return {
    accepted: entries.filter(([, granted]) => granted).map(([category]) => category),
    rejected: entries.filter(([, granted]) => !granted).map(([category]) => category),
  };
}
