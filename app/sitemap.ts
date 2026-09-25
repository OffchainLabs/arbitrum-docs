import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/lib/shared';
import { source } from '@/lib/source';

/**
 * `/sitemap.xml` serves one entry per routed page, derived from the same `source` every other
 * content consumer reads (see INTERNALS, "`source` is a choke point"). Adding a page to
 * `content/docs/` puts it in the sitemap; nothing here needs updating.
 *
 * **Upstream's `nonCanonicalRoutePatterns` has no equivalent here.** Docusaurus routed everything
 * under `docs/`, including partials and auto-generated category pages, so its sitemap needed an
 * ignore list. In this repo partials live in `content/partials/`, archived versions in
 * `content/_versions/`, and the glossary in `content/glossary/`, all outside the doc collection
 * `dir`, so `source.getPages()` cannot return them. There is nothing to exclude.
 *
 * (`draft: true` pages are the one theoretical exception. Nothing in this app filters on `draft`
 * yet, and a draft page renders and appears in `llms.txt`, so filtering only here would make the
 * sitemap disagree with what the site actually serves. There are currently no draft pages.)
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

  // The marketing home page at `/` is not part of the doc collection, so it has to be added by
  // hand. It is the site root and the entry point every crawler starts from.
  return [{ url: new URL('/', siteUrl).toString() }, ...pages];
}
