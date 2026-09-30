import { ogImageContentType, ogImageSize, renderOgImage } from '@/lib/og';
import { siteDescription, siteTitle } from '@/lib/shared';

/**
 * The home page's social card, through Next's `opengraph-image` file convention: the `app/og/`
 * route only serves docs pages. It sits in this route group so it does not apply to `/docs/**`.
 * The card itself is the one every docs page gets (lib/og.tsx).
 */
export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = siteTitle;

export default function Image() {
  return renderOgImage({ title: siteTitle, description: siteDescription });
}
