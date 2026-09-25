import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';

import { MARKDOWN_PREFERENCE_HEADER } from './lib/markdown-routing.ts';
import { resolveSiteUrl } from './lib/site-url.ts';
import { redirects } from './redirects.config.ts';

/**
 * Fail a production build that has no usable `NEXT_PUBLIC_SITE_URL`.
 *
 * The rule lives in `lib/site-url.ts` and `getSiteUrl()` in lib/shared.ts applies the same one.
 * `next.config.ts` is the earliest thing a build evaluates, which makes it the check that always
 * fires, including for a build whose prerendered routes never reach `getSiteUrl()`. Without it the
 * misconfiguration surfaces as a site-wide 500 on the first request after promoting to production.
 * It imports the rule rather than restating it, so the copy that enforces is the copy the tests
 * cover. The return value is discarded; the throw is the point.
 */
resolveSiteUrl(process.env);

const withMDX = createMDX();

const config: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  /**
   * `fumadocs-twoslash` resolves type information by running the real TypeScript compiler, and from
   * v4 that is the native (Go) TypeScript 7 binary rather than a bundled JavaScript copy. Bundling
   * `typescript` into the server output would detach it from the platform binary it shells out to,
   * so Fumadocs requires it to stay external. Only MDX compilation touches it, so nothing ships to
   * the browser either way.
   */
  serverExternalPackages: ['typescript'],
  async redirects() {
    return redirects;
  },
  async rewrites() {
    return {
      // Proxy runs before beforeFiles rewrites. Resolve both explicit `.md` paths and the proxy's
      // parsed Accept preference here, before Next matches the `/docs/[[...slug]]` page. Rewriting
      // to the mirror directly from the proxy returns 404 under Next 16, and a proxy rewrite to
      // `.md` is not processed by beforeFiles again. The internal header is set only by proxy.ts.
      beforeFiles: [
        { source: '/docs.md', destination: '/llms.mdx/docs/content.md' },
        { source: '/docs/:path*\\.md', destination: '/llms.mdx/docs/:path*/content.md' },
        {
          source: '/docs',
          has: [{ type: 'header', key: MARKDOWN_PREFERENCE_HEADER, value: '1' }],
          destination: '/llms.mdx/docs/content.md',
        },
        {
          source: '/docs/:path*',
          has: [{ type: 'header', key: MARKDOWN_PREFERENCE_HEADER, value: '1' }],
          destination: '/llms.mdx/docs/:path*/content.md',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default withMDX(config);
