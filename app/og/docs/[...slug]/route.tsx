import { notFound } from 'next/navigation';

import { renderOgImage } from '@/lib/og';
import { getPageImage, source } from '@/lib/source';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/og/docs/[...slug]'>) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  // The card itself, colours and size included, lives in lib/og.tsx, shared with the home page's
  // `opengraph-image` so the two cannot drift apart.
  return renderOgImage({ title: page.data.title, description: page.data.description });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageImage(page).segments,
  }));
}
