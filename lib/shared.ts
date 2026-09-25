import vars from '../content/vars.json' with { type: 'json' };
import { localSiteUrl, resolveSiteUrl } from './site-url.ts';

export const appName = 'Arbitrum docs';
/**
 * The site root's own title and description, for `app/(home)/page.tsx` and for the social card
 * `app/(home)/opengraph-image.tsx` renders from the same two strings.
 *
 * They live here, beside `appName`, so the page and its card cannot disagree, and they are
 * deliberately not the docs landing page's own title and description (`content/docs/index.mdx`,
 * "Arbitrum docs"). `/` and `/docs` are two separately indexable URLs, so giving them one title
 * would make each compete with the other for the same query.
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
 * This repository's own GitHub identity, for the edit link on every docs page and for the
 * "Request an update" issue link (`components/RequestUpdateLink.tsx`).
 *
 * The values are `content/vars.json`'s, not this file's (FS-2733). The contribute guide renders
 * the same URLs as `{var:docsRepositoryUrl}/blob/{var:docsRepositoryBranch}/…` link destinations,
 * and two owners for one string is what the ticket closes: `check-links` skips every external
 * destination, so a repository rename used to leave six dead links on that page with no gate
 * turning red. One value, `docsRepositoryUrl`, flips at cutover and takes the code and the content
 * with it.
 *
 * `url` rather than a `user`/`repo` pair because both call sites join the two immediately, so the
 * split only offered a way for the halves to disagree.
 *
 * The JSON is imported with an explicit `with { type: 'json' }` attribute, and `content/vars.ts`
 * is deliberately not imported instead. Two reasons, and both are load-bearing. `scripts/lib/shared.test.ts`
 * and `scripts/static-docs-http.test.ts` import this module as `.ts` under `node --test`, where
 * Node strips the types but still rejects a bare JSON import with `ERR_IMPORT_ATTRIBUTE_MISSING`;
 * and `content/vars.ts` pulls in Zod, which this module must keep away from the client bundle,
 * since `components/sidebar-resource-links.tsx` is a client component that imports from here.
 */
export const gitConfig = {
  url: vars.docsRepositoryUrl,
  branch: vars.docsRepositoryBranch,
};

/**
 * The cross-section links pinned in the sidebar footer on every docs page
 * (`components/sidebar-resource-links.tsx`). Kept here, not inline in that `.tsx` file, so
 * `scripts/lib/shared.test.ts` can assert each `url` still resolves to a real page under
 * `content/docs`. `check-links` walks MDX only, and `pnpm move-doc` does not retarget a `.tsx`
 * file, so without that test a deleted or renamed page would leave a silent 404 in every section
 * sidebar. Same ungated shape `announcementLinkHref` has, which earned its own `vars:check` rule.
 */
export const sidebarResourceLinks = [
  { text: 'Chain info', url: '/docs/chain-info' },
  { text: 'Glossary', url: '/docs/glossary' },
  { text: 'Contribute', url: '/docs/contribute' },
];

/**
 * The absolute origin this site is served from, for `metadataBase`, canonical URLs, and anything
 * else that must be absolute.
 *
 * The rule itself lives in `lib/site-url.ts`, because `next.config.ts` has to apply the same rule
 * before any app code is compiled (Next transpiles the config and the `.ts` files it imports on its
 * own). That module's comment explains why the split exists and why the config file is the copy
 * that enforces. This is the app-facing name for it, bound to `process.env`.
 *
 * Callers that want the failure at build time must call it at module scope, as `app/layout.tsx`
 * does. A call inside a request handler only fails that request, and by then the build is already
 * deployed, so `next.config.ts` is the real gate.
 *
 * Deliberately imports nothing but the rule, so `app/sitemap.ts` and `app/robots.ts` can adopt it
 * without dragging `lib/source` (and the compiled collection) anywhere near a client bundle.
 */
export function getSiteUrl(): string {
  return resolveSiteUrl(process.env);
}
