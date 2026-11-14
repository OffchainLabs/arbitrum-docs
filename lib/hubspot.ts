import { subscribeAnalyticsConsent } from './analytics-consent.ts';

export type HubspotCommand =
  | ['setPath', string]
  | ['trackPageView']
  | ['doNotTrack']
  | ['doNotTrack', { track: true }]
  | (() => void);

export type HubspotConsentCommand = [
  'setHubSpotConsent',
  { analytics: boolean; advertisement: boolean; functionality: boolean },
];

declare global {
  interface Window {
    _hsq?: { push: (command: HubspotCommand) => unknown };
    _hsp?: { push: (command: HubspotConsentCommand) => unknown };
    disableHubSpotCookieBanner?: boolean;
  }
}

export function createHubspotTracking() {
  let previousConsent: boolean | undefined;
  let previousPath: string | undefined;
  let ready = false;
  const cookieConsent = {
    analytics: false,
    advertisement: false,
    functionality: false,
  };

  function applyConsent(accepted: boolean) {
    if (accepted === previousConsent) return;
    previousConsent = accepted;

    // CookieYes owns consent. HubSpot's own consent gate prevents cookie writes,
    // including when its privacy script initializes after a withdrawal.
    window.disableHubSpotCookieBanner = true;
    window._hsp ??= [] as HubspotConsentCommand[];
    // Queued commands share the latest choice so a late privacy script cannot
    // replay an acceptance that the visitor has already withdrawn.
    cookieConsent.analytics = accepted;
    window._hsp.push(['setHubSpotConsent', cookieConsent]);

    if (!accepted) {
      // This also queues opt-out if withdrawal happens while analytics loads.
      // HubSpot processes doNotTrack before its automatic initial pageview.
      window._hsq?.push(['doNotTrack']);
      return;
    }

    window._hsq ??= [] as HubspotCommand[];
    const queue = window._hsq;
    // Acceptance may follow navigation without consent. Update the current path
    // before enabling automatic capture, without replaying any rejected visits.
    queue.push(['setPath', window.location.pathname + window.location.search]);
    queue.push(['doNotTrack', { track: true }]);
    if (ready) {
      queue.push(['trackPageView']);
    } else {
      // The loader's load event precedes analytics initialization. HubSpot runs
      // queued callbacks after processing its automatic initial pageview.
      queue.push(() => {
        ready = true;
      });
    }

    if (!document.getElementById('hs-script-loader')) {
      // Do not render this as an async React script: React hoists it ahead of
      // CookieYes. Insert it only once CookieYes reports analytics consent.
      const script = document.createElement('script');
      script.id = 'hs-script-loader';
      script.async = true;
      // The Offchain Labs portal and the Arbitrum business unit, as arbitrum.io loads it.
      script.src = 'https://js.hs-scripts.com/50627473.js?businessUnitId=4314583';
      document.head.appendChild(script);
    }
  }

  function connect() {
    const unsubscribe = subscribeAnalyticsConsent(({ accepted }) => applyConsent(accepted));

    return () => {
      unsubscribe();
      // The vendor script outlives React effects, so disable it on disconnect too.
      applyConsent(false);
    };
  }

  function trackPage(path: string) {
    const isNavigation = previousPath !== undefined && previousPath !== path;
    previousPath = path;
    if (!previousConsent) return;

    // While loading, update the automatic first view's destination without
    // queuing additional pageviews. Repeated effects do not count as navigation.
    window._hsq?.push(['setPath', path]);
    if (isNavigation && ready) window._hsq?.push(['trackPageView']);
  }

  return { connect, trackPage };
}
