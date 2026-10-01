import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';

import { siteHeaders } from './lib/http-headers.ts';
import { markdownTwins } from './lib/markdown-redirects.ts';
import { resolveSiteUrl } from './lib/site-url.ts';
import { redirects } from './redirects.config.ts';
import { buildIndex } from './scripts/lib/doc-links.ts';

// Fails a production build that has no usable `NEXT_PUBLIC_SITE_URL`. This file is the first thing
// a build evaluates, so the check fires even when no prerendered route calls `getSiteUrl()`.
resolveSiteUrl(process.env);

const withMDX = createMDX();

const config: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  poweredByHeader: false,
  async headers() {
    return siteHeaders({ isProduction: process.env.VERCEL_ENV === 'production' });
  },
  // Only real documentation destinations receive markdown twins, excluding public files.
  async redirects() {
    return [
      ...redirects,
      ...markdownTwins(redirects, new Set(buildIndex(process.cwd()).byUrl.keys())),
    ];
  },
  async rewrites() {
    return [
      { source: '/index.md', destination: '/llms.mdx/docs/content.md' },
      // Direct machine mirrors already own `/llms.mdx/**`; leave their dynamic route intact.
      { source: '/:path((?!llms\\.mdx/).+)\\.md', destination: '/llms.mdx/docs/:path/content.md' },
    ];
  },
};

export default withMDX(config);
