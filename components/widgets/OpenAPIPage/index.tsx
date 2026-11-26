'use client';

import type { OpenAPIPageProps } from 'fumadocs-openapi/ui';
import dynamic from 'next/dynamic';

/**
 * Lazy boundary for the OpenAPI operation UI.
 *
 * `components/mdx.tsx` reaches every docs page, so anything it references statically lands in every
 * page's client bundle. `next/dynamic` keeps fumadocs-openapi's UI in its own chunk, loaded only by
 * pages that render it. Server rendering stays on. The docs page passes the preloaded schema
 * (`openapi.preloadOpenAPIPage`); this registry entry only makes the tag known.
 */
const OpenAPIPageImpl = dynamic(() => import('./OpenAPIPage').then((mod) => mod.OpenAPIPage));

export function OpenAPIPage(props: OpenAPIPageProps) {
  return <OpenAPIPageImpl {...props} />;
}
