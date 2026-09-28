/**
 * announcement-link: validate `announcementLinkHref` in `content/vars.json`, which `app/layout.tsx`
 * renders into the banner on every page. A relative href is rejected, because the banner has no
 * single page to resolve it against.
 */
import {
  isExternalOrFragment,
  resolveRefToFile,
  resolvesToPublicAsset,
  splitSuffix,
} from './doc-links.ts';

/** The docs index `resolveRefToFile` reads. */
export type AnnouncementLinkIndex = Parameters<typeof resolveRefToFile>[2];

export type AnnouncementLinkResult = { ok: true } | { ok: false; reason: string };

/**
 * @param href The raw `announcementLinkHref` value.
 * @param index Docs index, for internal targets.
 * @param repoRoot Absolute repo root, for `public/` assets.
 */
export function checkAnnouncementLink(
  href: unknown,
  index: AnnouncementLinkIndex,
  repoRoot: string,
): AnnouncementLinkResult {
  if (typeof href !== 'string' || href.trim() === '') {
    return { ok: false, reason: 'must be a non-empty string' };
  }

  // The banner is not MDX, so a placeholder would render literally.
  if (href.includes('{var:')) {
    return {
      ok: false,
      reason: 'holds a {var:name} placeholder; the banner is not MDX, so it would render literally',
    };
  }

  if (href.startsWith('https://')) return { ok: true };

  if (href.startsWith('http://')) {
    return { ok: false, reason: 'is plain http; use https' };
  }

  const { pathPart } = splitSuffix(href);

  // Anchor-only, scheme-relative (`//host`), or any other protocol (`mailto:`, `ftp:`).
  if (isExternalOrFragment(pathPart)) {
    return { ok: false, reason: 'must be an https URL or a root-absolute internal path' };
  }

  if (!pathPart.startsWith('/')) {
    return {
      ok: false,
      reason:
        'is relative; the banner renders on every route, so it must be root-absolute (start with /)',
    };
  }

  if (resolveRefToFile(href, null, index)) return { ok: true };
  if (resolvesToPublicAsset(pathPart, repoRoot)) return { ok: true };

  return { ok: false, reason: 'does not resolve to a docs page or a file under public/' };
}
