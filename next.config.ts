import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';

import { resolveSiteUrl } from './lib/site-url.ts';
import { redirects } from './redirects.config.ts';

// Fails a production build that has no usable `NEXT_PUBLIC_SITE_URL`. This file is the first thing
// a build evaluates, so the check fires even when no prerendered route calls `getSiteUrl()`.
resolveSiteUrl(process.env);

const withMDX = createMDX();

const config: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // `fumadocs-twoslash` shells out to the native TypeScript binary, so `typescript` must stay
  // external to the server bundle.
  serverExternalPackages: ['typescript'],
  async redirects() {
    return redirects;
  },
  async rewrites() {
    return [
      { source: '/docs.md', destination: '/llms.mdx/docs/content.md' },
      { source: '/docs/:path*\\.md', destination: '/llms.mdx/docs/:path*/content.md' },
    ];
  },
};

export default withMDX(config);
