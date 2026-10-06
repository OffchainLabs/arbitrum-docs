/**
 * http-headers: the response headers next.config.ts sets through `headers()`.
 *
 * Next applies every rule whose `source` matches, in order, and a later rule wins for the same
 * key (node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/headers.md).
 * `source` matches the request path before rewrites, so `/docs/<slug>.md` is matched as written.
 *
 * The Content-Security-Policy ships as Report-Only. Pages are prerendered, so a nonce CSP is not
 * possible and `script-src` needs `'unsafe-inline'` for Next's inline flight scripts; Inkeep's
 * shadow roots and the layout emit inline `<style>`, so `style-src` needs it too. Enforce it only
 * after a report endpoint exists and a week of reports is clean. HSTS is left to Vercel, which
 * already sends it on the custom domain.
 *
 * Import-free, so scripts import it under `node --test`.
 */

export interface HeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}

/**
 * The discovery header master sent on `/` (origin/master:vercel.json), byte for byte, so agents
 * that look for `rel="service-doc"` still find the index.
 */
export const ROOT_LINK_HEADER =
  '</llms.txt>; rel="service-doc"; type="text/plain"; title="LLM-friendly site index", ' +
  '</sitemap.xml>; rel="sitemap"; type="application/xml"';

/**
 * The markdown and `llms*.txt` routes, as request paths: the same list `proxy.ts` tracks. Master
 * answered them with `Access-Control-Allow-Origin: *`, and browser-based tools fetch them
 * cross-origin. `/:path+\\.md` covers every page mirror, root-level or under /docs, and the
 * header has to be on the first answer whether that is the rewritten mirror or a redirect to it,
 * because a cross-origin fetch fails on a redirect that lacks it before following it.
 */
export const LLM_SURFACE_SOURCES: readonly string[] = [
  '/llms.txt',
  '/llms-full.txt',
  '/index.md',
  '/:path+\\.md',
  '/llms.mdx/:path*',
];

/**
 * The CSP, one directive per entry. `vercel.live` (the preview toolbar) is added off production.
 * No Google Fonts entries. Inkeep would request one unless `disableLoadingDefaultFont` is set in
 * lib/inkeep.ts (the Inkeep deferral change sets it); until then the request shows up as a
 * report-only violation, which is the point of listing nothing here.
 */
export function contentSecurityPolicy(isProduction: boolean): string {
  const toolbar = isProduction ? '' : ' https://vercel.live';
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' https://us-assets.i.posthog.com${toolbar}`,
    `style-src 'self' 'unsafe-inline'${toolbar}`,
    `font-src 'self' data:${toolbar}`,
    // Any https image: Inkeep answers can carry remote images, and a blocked image only reports.
    `img-src 'self' data: blob: https:`,
    'connect-src ' +
      "'self' https://us.i.posthog.com https://us-assets.i.posthog.com " +
      `https://api.inkeep.com https://api.io.inkeep.com${toolbar}`,
    "worker-src 'self' blob:",
    `frame-src 'self'${toolbar}`,
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

/** Every rule, in the order Next should apply them. */
export function siteHeaders({ isProduction }: { isProduction: boolean }): HeaderRule[] {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy(isProduction) },
        // Enforced now; the CSP's `frame-ancestors` only reports until the policy is enforced.
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        // `clipboard-write` stays at its default (`self`): the Copy Markdown button needs it.
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
    { source: '/', headers: [{ key: 'Link', value: ROOT_LINK_HEADER }] },
    ...LLM_SURFACE_SOURCES.map((source) => ({
      source,
      headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
    })),
  ];
}
