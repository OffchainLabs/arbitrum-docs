import { notFound } from 'next/navigation';

import { getLLMText, getPageMarkdownUrl, source } from '@/lib/source';

export const revalidate = false;
// Only the prerendered `<slug>/content.md` paths exist. Anything else 404s without rendering or
// writing a cache entry.
export const dynamicParams = false;

export async function GET(_req: Request, { params }: RouteContext<'/llms.mdx/docs/[[...slug]]'>) {
  const { slug } = await params;
  // Defence in depth: with `dynamicParams = false` only generated params reach the handler.
  if (slug?.at(-1) !== 'content.md') notFound();
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  // `proxy.ts` serves this body at the page's own URL when `Accept` prefers markdown, so that URL
  // has two representations. The HTML page cannot say so (Next replaces `Vary` on an app page);
  // declaring it here keeps a shared cache from handing the markdown to a browser. `headers()` in
  // next.config.ts matches the request path, so a page URL gets its CORS header only from here.
  return new Response(await getLLMText(page), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Vary': 'Accept',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({ slug: getPageMarkdownUrl(page).segments }));
}
