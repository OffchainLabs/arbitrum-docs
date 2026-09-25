import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/notebook/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { RequestUpdateLink } from '@/components/RequestUpdateLink';
import { VersionSwitcher } from '@/components/VersionSwitcher';
import { Feedback } from '@/components/feedback/client';
import { getMDXComponents } from '@/components/mdx';
import { onPageFeedbackAction } from '@/lib/posthog';
import { appName, getSiteUrl, gitConfig, socialHandle } from '@/lib/shared';
import {
  getArchiveMarkdownUrl,
  getPageImage,
  getPageMarkdownUrl,
  resolveDocsPath,
  source,
} from '@/lib/source';
import {
  LATEST_ID,
  archiveParams,
  archiveRepoPath,
  canonicalSlug,
  getVersions,
} from '@/lib/versions';
import type { ResolvedArchive } from '@/lib/versions';

/**
 * "September 11, 2026", matching upstream Docusaurus' `showLastUpdateTime` rendering.
 *
 * Fixed to `en-US` and UTC, not the server's locale or zone: the page is rendered once and cached,
 * so the output must not depend on where it was rendered. Git hands us a commit timestamp with its
 * author's offset, so a late-evening commit can read as the next day in UTC. That is an acceptable
 * one-day skew for a "last updated" line, and the machine-readable `dateTime` carries the exact
 * instant either way.
 */
const lastModifiedFormat = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

function formatLastModified(date: Date): string {
  return lastModifiedFormat.format(date);
}

interface ResolvedRequest {
  /** Always the live page: the archive borrows its URL, its OG image and its relative-link base. */
  page: (typeof source)['$inferPage'];
  /** The archived version to render in the live page's place, or `undefined` for Latest. */
  archive: ResolvedArchive | undefined;
  /** Version dropdown options, or `undefined` when the page is not versioned. */
  versions: ReturnType<typeof getVersions>;
  currentVersionId: string;
}

/**
 * Resolve a `/docs/**` path to the page to render, to the archived version when the last segment
 * names one (`/docs/run-a-node/start-here/v1`), and to the version dropdown around either.
 *
 * The page-or-archive half is `resolveDocsPath` in `lib/source.ts`, shared with the markdown route
 * so the two cannot disagree about what a path means. Everything added here is display state.
 *
 * Returns `undefined` for a path that is neither, which only `notFound()` can answer. With
 * `dynamicParams = false` that is unreachable from a request (an unknown slug still matches this
 * segment pattern, but its params are rejected and Next answers 404 before rendering starts), so in
 * practice it fires only at build time, for a `VERSIONED` key naming a page that no longer exists.
 */
function resolveRequest(slug: string[] | undefined): ResolvedRequest | undefined {
  const resolved = resolveDocsPath(slug);
  if (!resolved) return undefined;

  const { page, archive } = resolved;

  return {
    page,
    archive,
    versions: getVersions(canonicalSlug(archive ? archive.pageSlug : slug)),
    currentVersionId: archive ? archive.id : LATEST_ID,
  };
}

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const resolved = resolveRequest(slug);
  if (!resolved) notFound();

  const { page, archive, versions, currentVersionId } = resolved;

  const MDX = archive ? archive.entry.body : page.data.body;
  const title = archive ? archive.entry.title : page.data.title;
  const description = archive ? archive.entry.description : page.data.description;
  const toc = archive ? archive.entry.toc : page.data.toc;
  // An archived version carries the archive file's own date. `undefined` (a checkout without full
  // git history, see `hasFullGitHistory` in source.config.ts) renders no line at all rather than
  // a wrong one.
  const lastModified = archive ? archive.entry.lastModified : page.data.lastModified;
  // Copy and "view as markdown" point at the version on screen. An archive has its own mirror
  // (FS-2711); offering the live page's text under an archive URL is the mistake `?v=` used to make.
  const markdownUrl = archive
    ? getArchiveMarkdownUrl(page, archive.id).url
    : getPageMarkdownUrl(page).url;
  // For an archived version, point the "edit" link at the archive file (whose repo-relative path
  // depends on the storage strategy, so it comes from lib/versions.ts) rather than the live page.
  const repoPath = archive ? archiveRepoPath(archive.entry) : `content/docs/${page.path}`;

  return (
    // Tighter content gutters. Fumadocs' notebook Container puts
    // `px-4 md:px-6 xl:px-8` on the #nd-page article, which spends 32px per side
    // on desktop — the sidebar and the TOC already read as separate columns
    // without it. `cn` (cnfast) drops the conflicting classes, so this replaces
    // the md/xl padding rather than layering on top of it.
    <DocsPage toc={toc} full={page.data.full} className="md:px-4 xl:px-4">
      <DocsTitle className="font-medium">{title}</DocsTitle>
      <DocsDescription className="mb-0">{description}</DocsDescription>
      {lastModified ? (
        <p className="text-fd-muted-foreground text-sm">
          Last updated on{' '}
          <time dateTime={lastModified.toISOString()}>{formatLastModified(lastModified)}</time>
        </p>
      ) : null}
      <div className="flex flex-row flex-wrap gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`${gitConfig.url}/blob/${gitConfig.branch}/${repoPath}`}
        />
        <RequestUpdateLink pageUrl={page.url} />
        {versions ? (
          // `basePath` is the live page's URL, so the switcher can build both directions
          // (`basePath` for Latest, `basePath/<id>` for an archive) without importing the registry
          // into a client component or having to strip a version segment off `usePathname()`.
          <VersionSwitcher options={versions} current={currentVersionId} basePath={page.url} />
        ) : null}
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
      <Feedback onSendAction={onPageFeedbackAction} />
    </DocsPage>
  );
}

// The docs route is statically routable: every live page and every archived version is enumerated
// below, and `dynamicParams = false` makes Next answer 404 for any slug outside that list without
// rendering the page.
//
// Both exports are load-bearing, and for two different tickets:
//
//   - `generateStaticParams` returning real params prerenders all live docs pages plus their
//     archives (FS-2698). This became possible only when `?v=` moved off `searchParams` and onto a
//     path suffix in the same change: a page that awaits `searchParams` is dynamic by definition,
//     and a dynamic route prerenders nothing whatever it returns here.
//   - `dynamicParams = false` is what gives `/docs/<missing>` a server-rendered 404 body (FS-2688).
//     An unknown slug still matches this segment pattern, but its params are rejected, so the
//     request lands on the internal `/_not-found` entry and `app/not-found.tsx` renders as an
//     ordinary page with the status set before rendering starts. Left dynamic, the `notFound()`
//     above throws mid-flight-render and Next replaces the whole response with its hardcoded empty
//     `__next_error__` shell.
//
// The accepted cost is that a page added without a rebuild 404s rather than being merely stale, and
// that a failed build takes *new* pages offline. Existing pages keep serving the last good build.
// Full reasoning and measurements in INTERNALS.md, "Static routing under /docs".
export const dynamicParams = false;

export function generateStaticParams(): { slug?: string[] }[] {
  // `.map(({ slug }) => ({ slug }))` drops the `lang` key fumadocs' return type declares but never
  // populates without i18n, so the result matches this route's params exactly.
  return [...source.generateParams().map(({ slug }) => ({ slug })), ...archiveParams()];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resolved = resolveRequest(slug);
  if (!resolved) notFound();

  const { page, archive } = resolved;
  const title = archive ? archive.entry.title : page.data.title;
  const description = archive ? archive.entry.description : page.data.description;
  const image = getPageImage(page).url;
  // Same source the page body reads for the "Last updated on …" line: the archive file's own git
  // date for an archive, the live page's for Latest. `undefined` in a checkout without full git
  // history (see `hasFullGitHistory` in source.config.ts), in which case `article:modified_time`
  // is simply omitted below rather than emitted wrong.
  const lastModified = archive ? archive.entry.lastModified : page.data.lastModified;
  // Built absolute from `getSiteUrl()` rather than left relative for `metadataBase` to resolve,
  // so the value a wrong canonical would depend on is read through the one helper that refuses
  // to guess it in production. An archive canonicalizes to its live page: the two are versions of
  // one document, not two documents, and the live one is the copy a reader should land on.
  // One constant, used for both `alternates.canonical` and `openGraph.url` below, which are the
  // same claim addressed to two different readers and must never disagree.
  const canonical = new URL(page.url, getSiteUrl()).toString();

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    // Archives are reachable from the version switcher and from nothing else. These are
    // node-operator guides, so an outdated archive outranking its live page does not merely
    // confuse: it gets stale operational instructions followed in production. `follow` stays on so
    // the links out of an archive still count.
    ...(archive ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      // `siteName` matches the site root (`app/(home)/page.tsx`), from the same `appName` constant
      // so the two cannot drift. `type: 'article'` (not `website`, which the root uses for the site
      // as a whole) marks each docs page as one document rather than a site index, which is also
      // what lets `modifiedTime` below be a meaningful tag rather than a guess: there is no
      // `publishedTime` anywhere in the frontmatter or collection to pair it with, only git's
      // last-touched date, which is exactly what `lastModified` already is. Archives get the same
      // two tags: `noindex` controls crawling, not what kind of object the URL is, and an archive's
      // own `lastModified` is a real per-document date. The type is uniform across everything the
      // catch-all serves, `/docs` and the section indexes included: nothing in the collection marks
      // a page as an index, so the only alternative is a hand-kept list of URLs that silently goes
      // stale, and `og:type` drives no crawler behaviour that would pay for it.
      type: 'article',
      siteName: appName,
      // The OG object's own canonical URL, the same string `alternates.canonical` carries, so an
      // archive names its live page here too. The root has had this since FS-2713; a docs page
      // emitted none, which was the last hole in the root/docs parity this ticket closes.
      url: canonical,
      images: image,
      ...(lastModified ? { modifiedTime: lastModified.toISOString() } : {}),
    },
    // Next fills twitter:title/description/image from openGraph when they are absent, but the card
    // type and the site handle have no such default and are what X needs to render a large card.
    twitter: {
      card: 'summary_large_image',
      site: socialHandle,
      title,
      description,
      images: [image],
    },
  };
}
