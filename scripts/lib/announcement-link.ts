/**
 * announcement-link: validate the announcement banner's link target.
 *
 * `content/vars.json` holds `announcementLinkHref`, which `app/layout.tsx` renders into the banner
 * above the navbar on every page of the site. Nothing else checks it: `check-links` walks MDX only,
 * and the value never appears in any `.mdx` file, so a typo here ships the single most visible
 * broken link the site can have and every gate stays green.
 *
 * A relative href is rejected outright rather than resolved. The banner renders on every route, so
 * `../foo` would point somewhere different on each page, and there is no "current page" to resolve it
 * against.
 */
import {
  isExternalOrFragment,
  resolveRefToFile,
  resolvesToPublicAsset,
  splitSuffix,
} from './doc-links.ts';

/**
 * The docs index an internal target is resolved against: whatever `resolveRefToFile` accepts, so
 * this follows `doc-links` rather than restating its shape. `vars-check` passes `buildIndex()`'s
 * return value; the unit test passes a stand-in holding only the maps resolution reads.
 */
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

  // The banner is not MDX: `app/layout.tsx` renders this string as-is, so the `{var:name}`
  // placeholder that link destinations in content may use would reach the reader as literal
  // braces. `resolveRefToFile` expands placeholders, so without this check such an href would pass
  // the gate whenever the expansion happened to name a real page.
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
