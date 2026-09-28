import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/notebook/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { RequestUpdateLink } from '@/components/RequestUpdateLink';
import { Feedback } from '@/components/feedback/client';
import { getMDXComponents } from '@/components/mdx';
import { onPageFeedbackAction } from '@/lib/posthog';
import { appName, getSiteUrl, gitConfig, socialHandle } from '@/lib/shared';
import { getPageImage, getPageMarkdownUrl, source } from '@/lib/source';

// Fixed locale and zone, so a prerendered page reads the same wherever it was built.
const lastModifiedFormat = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const { lastModified } = page.data;
  const markdownUrl = getPageMarkdownUrl(page).url;

  return (
    // Narrower gutters than the notebook layout's default `px-4 md:px-6 xl:px-8`.
    <DocsPage toc={page.data.toc} full={page.data.full} className="md:px-4 xl:px-4">
      <DocsTitle className="font-medium">{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      {lastModified ? (
        <p className="text-fd-muted-foreground text-sm">
          Last updated on{' '}
          <time dateTime={lastModified.toISOString()}>
            {lastModifiedFormat.format(lastModified)}
          </time>
        </p>
      ) : null}
      <div className="flex flex-row flex-wrap gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`${gitConfig.url}/blob/${gitConfig.branch}/content/docs/${page.path}`}
        />
        <RequestUpdateLink pageUrl={page.url} />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
      <Feedback onSendAction={onPageFeedbackAction} />
    </DocsPage>
  );
}

// Every page is prerendered, and any other slug gets the prerendered 404 page instead of rendering.
export const dynamicParams = false;

export function generateStaticParams(): { slug?: string[] }[] {
  return source.generateParams().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const { title, description, lastModified } = page.data;
  const image = getPageImage(page).url;
  const canonical = new URL(page.url, getSiteUrl()).toString();

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      siteName: appName,
      url: canonical,
      images: image,
      ...(lastModified ? { modifiedTime: lastModified.toISOString() } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      site: socialHandle,
      title,
      description,
      images: [image],
    },
  };
}
