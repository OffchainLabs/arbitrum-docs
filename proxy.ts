import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { NextRequest, NextResponse } from 'next/server';

import { docsContentRoute, docsRoute } from '@/lib/shared';
import { redirects } from '@/redirects.config.mjs';

/**
 * Legacy source -> destination, for `.md`-suffixed requests only.
 *
 * `next.config` redirects run before this proxy, and their sources are bare paths, so `/anytrust`
 * redirects but `/anytrust.md` matches nothing and falls through here as a 404. The suffix rewrite
 * below cannot help: it only matches paths already under `/docs`. Looking the bare path up in the
 * same table the redirect layer uses closes that hole and keeps the markdown intent — the reader
 * is sent to the destination's `.md`, not its HTML.
 *
 * Only internal destinations are eligible; an external one has no `.md` form.
 */
const legacyDestinations = new Map(
  redirects.filter((r) => r.destination.startsWith('/')).map((r) => [r.source, r.destination]),
);

const { rewrite: rewriteDocs } = rewritePath(
  `${docsRoute}{/*path}`,
  `${docsContentRoute}{/*path}/content.md`,
);
const { rewrite: rewriteSuffix } = rewritePath(
  `${docsRoute}{/*path}.md`,
  `${docsContentRoute}{/*path}/content.md`,
);

/**
 * Mark a response as varying by `Accept`.
 *
 * Steps 1 and 2 serve two representations of one URL — the HTML page and the markdown route they
 * rewrite to — so a shared cache keying on the URL alone can hand an agent's markdown to a browser.
 * The Docusaurus deployment set this header in `vercel.json`; that file is gone, so it is set here
 * and in `next.config.mjs` (which covers the routes the bypass list above returns early for).
 *
 * `append`, not `set`: Next puts its own RSC tokens in `Vary` on app router responses, and
 * overwriting them would break router-cache correctness.
 *
 * Known limit: this survives on the rewritten markdown responses (route handlers) but NOT on the
 * HTML page render — `base-server`'s `setVaryHeader` replaces `Vary` on the app-page path, and
 * neither middleware nor `headers()` can get ahead of it. That direction is currently harmless
 * because the docs page renders dynamically (`no-cache`), so no shared cache stores it. If the page
 * is ever made statically cacheable, re-check this.
 */
function varyOnAccept(response: NextResponse): NextResponse {
  response.headers.append('Vary', 'Accept');
  return response;
}

export default function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  // Routes served verbatim — skip markdown content-negotiation entirely.
  if (
    path.startsWith('/_next/') ||
    path.startsWith('/img/') ||
    path === '/favicon.ico' ||
    path === '/icon.png' ||
    path === '/apple-icon.png' ||
    path === '/nitro-whitepaper.pdf' ||
    path.startsWith('/audit-reports/') ||
    path === '/llms.txt' ||
    path === '/llms-full.txt' ||
    path.startsWith('/llms.mdx/') ||
    path.startsWith('/og/') ||
    path.startsWith('/api/')
  ) {
    return NextResponse.next();
  }

  // 0. `.md` on a legacy URL: redirect to the destination's `.md`. Must precede the suffix
  //    rewrite, which only recognises paths already under `/docs`.
  if (path.endsWith('.md') && !path.startsWith(`${docsRoute}/`)) {
    const destination = legacyDestinations.get(path.slice(0, -'.md'.length));
    if (destination) {
      return NextResponse.redirect(new URL(`${destination}.md`, request.nextUrl), 307);
    }
  }

  // 1. Explicit `.md` suffix: rewrite to the markdown route.
  const suffixResult = rewriteSuffix(request.nextUrl.pathname);
  if (suffixResult) {
    return varyOnAccept(NextResponse.rewrite(new URL(suffixResult, request.nextUrl)));
  }

  // 2. Content negotiation: `Accept: text/markdown` rewrites to the .md route.
  if (isMarkdownPreferred(request)) {
    const negResult = rewriteDocs(request.nextUrl.pathname);
    if (negResult) {
      return varyOnAccept(NextResponse.rewrite(new URL(negResult, request.nextUrl)));
    }
  }

  return varyOnAccept(NextResponse.next());
}
