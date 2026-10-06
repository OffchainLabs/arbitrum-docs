import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/lib/shared';
import { source } from '@/lib/source';

/**
 * `/sitemap.xml` serves one entry per routed page, derived from the same `source` every other
 * content consumer reads (see INTERNALS, "`source` is a choke point"). Adding a page to
 * `content/docs/` puts it in the sitemap; nothing here needs updating.
 *
 * There is nothing to exclude: partials (`content/partials/`) and the glossary
 * (`content/glossary/`) live outside the doc collection `dir`, so `source.getPages()` cannot
 * return them.
 *
 * Absolute URLs are required by the sitemap protocol. The origin comes from `getSiteUrl()` in
 * `lib/shared.ts`, the same helper behind `metadataBase` in `app/layout.tsx` and the docs page
 * canonical, so all three always agree and a production build with no `NEXT_PUBLIC_SITE_URL`
 * fails instead of shipping a sitemap full of localhost URLs.
 *
 * No `revalidate` export: a metadata route with no request-time input is already cached at build
 * time by default, so setting it would only restate the default.
 */
const siteUrl = getSiteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = source.getPages().map((page) => {
    // `lastModified` comes from the `lastModified` option on the docs collection in
    // `source.config.ts`, which is gated behind a full-git-history probe (see INTERNALS, "Last
    // modified dates"). In a shallow checkout it resolves to `undefined` for every page and the
    // sitemap omits `<lastmod>` entirely, which is valid.
    const { lastModified } = page.data;

    return {
      url: new URL(page.url, siteUrl).toString(),
      ...(lastModified ? { lastModified } : {}),
    };
  });

  // The root overview already contributes `/`, whose HTML is the home page.
  return pages;
}
