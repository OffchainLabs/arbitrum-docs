import { generate as DefaultImage } from 'fumadocs-ui/og';
import { ImageResponse } from 'next/og';

import { appName } from '@/lib/shared';

/**
 * The one social card in the site, rendered for both the docs pages (`app/og/docs/[...slug]`) and
 * the home page (`app/(home)/opengraph-image.tsx`).
 *
 * It lives here rather than in either route because the two cards must look identical, and nothing
 * would catch them drifting apart: an OG image is only ever seen in somebody else's feed.
 */

/** 1200x630 is what both Open Graph and X render a large summary card at. */
export const ogImageSize = { width: 1200, height: 630 };

export const ogImageContentType = 'image/png';

export function renderOgImage({ title, description }: { title: string; description?: string }) {
  return new ImageResponse(
    <DefaultImage
      title={title}
      description={description}
      site={appName}
      // Arbitrum blue accent / teal site label. The generator hardcodes a
      // #0c0c0c background internally; matching Arbitrum's navy exactly would
      // require replacing DefaultImage with local JSX, which is out of scope.
      // The accents are literal hsl() strings rather than --color-fd-* tokens
      // because Satori (which next/og uses to rasterize) resolves no CSS custom
      // properties, so a token reference here would silently produce no colour.
      primaryColor="hsl(211 99% 45%)"
      primaryTextColor="hsl(188 100% 53%)"
    />,
    ogImageSize,
  );
}
