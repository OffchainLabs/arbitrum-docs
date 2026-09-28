import vars from '../content/vars.json' with { type: 'json' };
import { localSiteUrl, resolveSiteUrl } from './site-url.ts';

export const appName = 'Arbitrum docs';
/**
 * The site root's own title and description, for `app/(home)/page.tsx` and its social card. Not the
 * docs index's "Arbitrum docs": `/` and `/docs` are separately indexable and should not compete.
 */
export const siteTitle = 'Arbitrum documentation';
export const siteDescription =
  'Arbitrum is the finance-native platform for applications, tokenization, and dedicated chains. These docs cover the protocols, chains, services, and SDKs.';
/** The brand's X handle, for the `twitter:site` card tag on every docs page. */
export const socialHandle = '@arbitrum';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export { localSiteUrl };

/**
 * This repository's GitHub identity, for the edit link and the "Request an update" issue link. Read
 * from `content/vars.json`, which the contribute guide also expands through `{var:…}`, so code and
 * content retarget together. `with { type: 'json' }` because tests import this under `node --test`.
 */
export const gitConfig = {
  url: vars.docsRepositoryUrl,
  branch: vars.docsRepositoryBranch,
};

/** Sidebar footer links; `scripts/lib/shared.test.ts` asserts each `url` is a real page. */
export const sidebarResourceLinks = [
  { text: 'Chain info', url: '/docs/chain-info' },
  { text: 'Glossary', url: '/docs/glossary' },
  { text: 'Contribute', url: '/docs/contribute' },
];

/**
 * The absolute origin this site is served from. The rule lives in `lib/site-url.ts` because
 * `next.config.ts` applies it too. Call it at module scope to fail the build rather than a request.
 * Imports nothing but the rule, so `app/sitemap.ts` and `app/robots.ts` stay clear of `lib/source`.
 */
export function getSiteUrl(): string {
  return resolveSiteUrl(process.env);
}
