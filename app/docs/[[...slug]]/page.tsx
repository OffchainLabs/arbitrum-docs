import { source } from '@/lib/source';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { VanillaAdmonition } from '@/src/components/VanillaAdmonition';

// Simple fallback for ImageZoom that renders regular img tags
function ImageZoom({ src, alt, className }: { src: string; alt?: string; className?: string }) {
  return <img src={src} alt={alt || ''} className={className} />;
}

interface Props {
  params: Promise<{ slug?: string[] }>;
}

const components = {
  Tab,
  Tabs,
  Step,
  Steps,
  Card,
  Cards,
  ImageZoom,
  VanillaAdmonition,
};

export default async function Page(props: Props) {
  const params = await props.params;
  const slug = params.slug?.join('/') || '';
  
  try {
    const page = source.getPage([slug]);
    
    if (!page || !page.data) {
      notFound();
    }

    const pageData = page.data as any;
    const MDX = pageData.default || pageData.body || pageData;

    return (
      <DocsPage toc={pageData.toc}>
        <DocsBody>
          {MDX && <MDX components={components} />}
        </DocsBody>
      </DocsPage>
    );
  } catch (error) {
    console.error('Error rendering page:', error);
    notFound();
  }
}

export function generateStaticParams() {
  try {
    return source.generateParams() || [];
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug?.join('/') || '';
  
  const page = source.getPage([slug]);
  
  if (!page || !page.data) return {};

  const pageData = page.data as any;

  return {
    title: pageData.title || 'Documentation',
    description: pageData.description || 'Arbitrum documentation',
  };
}