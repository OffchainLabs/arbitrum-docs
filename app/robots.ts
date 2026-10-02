import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/lib/shared';

/**
 * `/robots.txt`. No `Disallow` lines: Fumadocs generates no category index pages (the old
 * `/category/*` URLs redirect), and the hosted PDFs (`public/nitro-whitepaper.pdf` and the audit
 * reports in `public/audit-reports/`) are meant to be indexed, so there is nothing to keep crawlers
 * out of.
 *
 * `Content-Signal` goes through `other`. It is not part of RFC 9309 but
 * draft-romm-aipref-contentsignals (https://contentsignals.org/), and `other` is Next's escape
 * hatch for a non-standard directive: keys keep their casing and values pass through verbatim,
 * scoped to this rule's `User-Agent` block (Next 16.3.0+). The signal permits search indexing and
 * AI input and forbids training.
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
