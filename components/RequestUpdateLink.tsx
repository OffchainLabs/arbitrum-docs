import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { PencilLine } from 'lucide-react';

import { cn } from '@/lib/cn';
import { gitConfig } from '@/lib/shared';

/**
 * Ports the Docusaurus `HeaderBadges` widget: a "Request an update" link that opens a prefilled
 * GitHub issue for the page the reader is on.
 *
 * Upstream read `window.location` inside a `<BrowserOnly>` wrapper, which forced the whole badge to
 * be client-side. Here the page URL is already known on the server (`page.url` plus
 * `NEXT_PUBLIC_SITE_URL`), so this stays a server component: no `window`, no hydration, no extra
 * JavaScript on every docs page. Without `NEXT_PUBLIC_SITE_URL` the body falls back to the
 * site-relative path, which still tells a maintainer which page the report is about.
 */
export function RequestUpdateLink({ pageUrl, className }: { pageUrl: string; className?: string }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '');
  const sourceUrl = siteUrl ? `${siteUrl}${pageUrl}` : pageUrl;

  const query = new URLSearchParams({
    title: `Docs update request: ${pageUrl}`,
    body: [
      `Source: ${sourceUrl}`,
      'Request: (how can we help?)',
      "Psst, this issue will be closed with a templated response if it isn't a documentation update request.",
    ].join('\n\n'),
  });
  const href = `${gitConfig.url}/issues/new?${query}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        buttonVariants({ color: 'secondary', size: 'sm' }),
        'gap-2 [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground',
        className,
      )}
    >
      <PencilLine />
      Request an update
    </a>
  );
}
