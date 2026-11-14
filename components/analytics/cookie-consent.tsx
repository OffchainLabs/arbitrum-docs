import Script from 'next/script';

// Scoped per Vercel environment: the production CookieYes website key for Production, the staging
// key for Preview and Development, so those never record consent against the production website.
// `NEXT_PUBLIC_*` is inlined at build time.
const websiteId = process.env.NEXT_PUBLIC_COOKIEYES_ID;

/** The CookieYes banner. Without a key there is no banner, no HubSpot, and PostHog stays cookieless. */
export function CookieConsent() {
  if (!websiteId) return null;

  // Loaded after hydration: CookieYes inserts its banner as soon as it runs, and React's hydration
  // recovery could remove that banner while CookieYes still considers itself initialized, leaving
  // the visitor unable to choose.
  return (
    <Script
      id="cookieyes"
      src={`https://cdn-cookieyes.com/client_data/${websiteId}/script.js`}
      strategy="afterInteractive"
    />
  );
}
