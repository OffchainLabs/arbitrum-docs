import { generate as DefaultImage } from 'fumadocs-ui/og';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';

import { appName } from '@/lib/shared';
import { getPageImage, source } from '@/lib/source';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/og/docs/[...slug]'>) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return new ImageResponse(
    <DefaultImage
      title={page.data.title}
      description={page.data.description}
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
    {
      width: 1200,
      height: 630,
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageImage(page).segments,
  }));
}
