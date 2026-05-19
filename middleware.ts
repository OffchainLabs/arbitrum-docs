import { rewrite, next } from '@vercel/edge';

// Runs before Vercel's filesystem lookup, so we can serve the .md variant of a
// doc page when an agent requests `Accept: text/markdown`. The matcher excludes
// paths containing a dot (static assets, sitemap.xml, direct .md requests, etc.)
// so the rewrite only applies to clean-URL doc paths.
export const config = {
  matcher: '/((?!.*\\.).*)',
};

export default function middleware(request: Request) {
  const accept = request.headers.get('accept') ?? '';
  if (!accept.includes('text/markdown')) return next();

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '');
  url.pathname = path === '' ? '/index.md' : `${path}.md`;
  return rewrite(url);
}
