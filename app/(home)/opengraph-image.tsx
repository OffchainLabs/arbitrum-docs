import { ogImageContentType, ogImageSize, renderOgImage } from '@/lib/og';
import { siteDescription, siteTitle } from '@/lib/shared';

/**
 * The home page's social card, at `/opengraph-image`.
 *
 * This is Next's `opengraph-image` file convention rather than another handler under `app/og/`,
 * because that route resolves its slug through `source.getPage()` and the site root is not a page
 * in the docs collection, so it cannot serve `/` at all. The convention buys two things a hand
 * written route would not: Next emits `og:image:width`, `og:image:height`, `og:image:type` and
 * `og:image:alt` beside the URL, and it scopes the image to this route group, which holds only
 * `/`. The card itself is the same one every docs page gets (see lib/og.tsx).
 *
 * Deliberately not `app/(home)/../opengraph-image.tsx` at the app root: there it would apply to
 * `/docs/**` too, where each page already generates a card carrying its own title.
 */
export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = siteTitle;

export default function Image() {
  return renderOgImage({ title: siteTitle, description: siteDescription });
}
