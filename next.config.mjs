import { createMDX } from 'fumadocs-mdx/next';

import { redirects } from './redirects.config.mjs';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  devIndicators: false,
  async redirects() {
    return redirects;
  },
  // `proxy.ts` negotiates on `Accept: text/markdown`, so one URL serves two representations: the
  // HTML page and the markdown route it rewrites to. Without `Vary: Accept` a shared cache keys
  // both on the URL alone and can hand an agent's markdown response to a browser, or the reverse.
  // Carried over from the Docusaurus deployment's vercel.json, which set the same header.
  async headers() {
    return [{ source: '/:path*', headers: [{ key: 'Vary', value: 'Accept' }] }];
  },
};

export default withMDX(config);
