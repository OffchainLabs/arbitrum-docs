import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/lib/shared';

/**
 * `/robots.txt` ports upstream `static/robots.txt` from arbitrum-docs.
 *
 * Two differences from upstream, both deliberate:
 *
 * 1. **No `Disallow` lines.** Upstream disallowed `/category/` (Docusaurus' auto-generated category
 *    index pages) and `/hosted-pdfs/`. Neither route exists here: Fumadocs generates no category
 *    pages, and the one hosted PDF is served from `public/nitro-whitepaper.pdf`. Disallowing paths
 *    that 404 would be noise. Keep this list in sync with `app/sitemap.ts` if that ever changes.
 *
 * 2. **`Content-Signal` goes through `other`.** It is not part of RFC 9309; it is
 *    draft-romm-aipref-contentsignals (https://contentsignals.org/). Next's `Robots` object models
 *    only the standard directives, and `other` is its documented escape hatch for exactly this:
 *    keys keep their casing and values pass through verbatim, scoped to this rule's `User-Agent`
 *    block. Available since Next 16.3.0, so no separate `app/robots.txt/route.ts` handler is
 *    needed. The emitted line order differs from upstream's file (Next writes `Allow` before
 *    `other`); robots.txt directives are order-independent within a group, so the meaning is the
 *    same.
 *
 * The signal is permissive for reading and restrictive for training: the docs may be indexed for
 * search and used as input to AI assistants, but not used as training data.
 *
 * The sitemap URL is absolute and its origin comes from `getSiteUrl()` in `lib/shared.ts`, the
 * same helper `app/sitemap.ts` and `metadataBase` use, so a production build with no
 * `NEXT_PUBLIC_SITE_URL` fails rather than pointing crawlers at localhost.
 *
 * No `revalidate` export: a metadata route with no request-time input is already cached at build
 * time by default, so setting it would only restate the default.
 */
const siteUrl = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      other: {
        'Content-Signal': 'search=yes, ai-input=yes, ai-train=no',
      },
    },
    sitemap: new URL('/sitemap.xml', siteUrl).toString(),
  };
}
