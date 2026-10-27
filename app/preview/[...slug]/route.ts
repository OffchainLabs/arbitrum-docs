import { notFound } from 'next/navigation';

import { buildLinkPreview } from '@/lib/link-preview';
import { getPagePreviewUrl, source } from '@/lib/source';

export const revalidate = false;
// Only the prerendered `<slug>/preview.json` paths exist. Anything else 404s without rendering.
export const dynamicParams = false;

export async function GET(_req: Request, { params }: RouteContext<'/preview/[...slug]'>) {
  const { slug } = await params;
  if (slug.at(-1) !== 'preview.json') notFound();
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();
  // The docs collection is dynamic: structured data is a compiled export, behind `load()`.
  const { structuredData } = await page.data.load();

  return Response.json(
    buildLinkPreview({
      title: page.data.title,
      url: page.url,
      description: page.data.description,
      structuredData,
    }),
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({ slug: getPagePreviewUrl(page).segments }));
}
