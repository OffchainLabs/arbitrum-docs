/**
 * The partial-versioning registry, plus the constants and types around it — every part of the
 * feature that does **not** need the compiled archive bodies.
 *
 * **This module imports nothing, and must keep importing nothing.** `lib/versions.ts` imports the
 * generated `collections/server` index, which eagerly imports every compiled MDX page, so importing
 * it from a `'use client'` component pulls the entire docs corpus into the browser bundle and
 * importing it from `proxy.ts` puts a 26.6 MB chunk on the request entry path (measured, see
 * INTERNALS, "Static routing under /docs"). `components/VersionSwitcher.tsx` and `proxy.ts` both
 * need registry facts and neither can afford that import, so the registry lives here and
 * `lib/versions.ts` reads it from this side.
 *
 * `scripts/lib/versions-registry.ts` text-parses `VERSIONED` out of this file (that module says
 * why). Keep the literal's shape simple.
 */

/** Dropdown label for the live page (the canonical, un-versioned URL). */
export const LATEST_LABEL = 'Latest';
/**
 * Search-param key that used to select an archived version (`?v=v1`).
 *
 * Archives are path segments now (`/docs/<slug>/v1`, FS-2698). The constant survives for the one
 * consumer that still has to understand the old shape: the legacy-URL redirect in `proxy.ts`.
 */
export const VERSION_PARAM = 'v';
/** The id representing the live page. */
export const LATEST_ID = 'latest';

/** A version option resolved for display in the switcher. */
export interface VersionOption {
  id: string;
  label: string;
}

export interface VersionSource {
  /** Stable id used as the archive's URL suffix (`/docs/<slug>/<id>`). */
  id: string;
  /** Virtual path of the archive entry in `docsVersions`; omitted for the live page. */
  archivePath?: string;
}

/**
 * Canonical slug (a page's `slugs` joined with `/`) → ordered versions, latest first.
 * Only a hand-picked set of pages is versioned; everything else always renders Latest.
 *
 * An archive id becomes a real URL segment under the live page, so it must not collide with a child
 * page of that page — `/docs/run-a-node/start-here/v1` cannot be both. `scripts/versions-routing.test.ts`
 * asserts no collision exists, so creating one is a reviewed act rather than a silently shadowed page.
 */
export const VERSIONED: Record<string, VersionSource[]> = {
  'run-a-node/start-here': [
    { id: LATEST_ID },
    { id: 'v1', archivePath: 'v1/run-a-node/start-here.mdx' },
  ],
  'run-a-node/run-batch-poster': [
    { id: LATEST_ID },
    { id: 'v1', archivePath: 'v1/run-a-node/run-batch-poster.mdx' },
  ],
  'run-a-node/nitro/build-nitro-locally': [
    { id: LATEST_ID },
    { id: 'v1', archivePath: 'v1/run-a-node/nitro/build-nitro-locally.mdx' },
  ],
};

/** Canonical slug for a page's slug segments. */
export function canonicalSlug(slug: string[] | undefined): string {
  return (slug ?? []).join('/');
}

/**
 * The versions registered for `slug`, or `undefined` when the page is not versioned.
 *
 * **Every lookup of `VERSIONED` by slug goes through here.** Slugs arrive from the URL, so a
 * request can name an `Object.prototype` key (`constructor`, `toString`, `valueOf`, `__proto__`),
 * and a plain `VERSIONED[slug]` resolves one of those up the prototype chain to a function, or to
 * the prototype itself. That value is truthy, so the caller's `?.find`, `?.some` or `.map` does
 * not short-circuit, and it throws a `TypeError`: an unhandled HTTP 500 where the answer is a 404.
 * The own-property check is the whole reason this accessor exists, and it lives in this module
 * rather than beside its callers because this module imports nothing, which makes it the only half
 * of the feature `node --test` can exercise directly (`scripts/versions-routing.test.ts`).
 */
export function versionSources(slug: string): VersionSource[] | undefined {
  return Object.hasOwn(VERSIONED, slug) ? VERSIONED[slug] : undefined;
}

/**
 * True when `id` names a registered archive of the page at `slug` — not Latest, and not an id this
 * registry has never heard of. `proxy.ts` asks this before turning a legacy `?v=<id>` into a path,
 * because an unregistered id has to keep falling back to Latest rather than 404 on a route that now
 * carries `dynamicParams = false`.
 */
export function isArchiveId(slug: string, id: string): boolean {
  return versionSources(slug)?.some((source) => source.id === id && source.archivePath) ?? false;
}

/**
 * Routed slug segments for every registered archive, for the docs route's `generateStaticParams`.
 * Three entries today; the count is the number of archives, not of versioned pages.
 */
export function archiveParams(): { slug: string[] }[] {
  return Object.entries(VERSIONED).flatMap(([slug, sources]) =>
    sources
      .filter((source) => source.archivePath)
      .map((source) => ({ slug: [...slug.split('/'), source.id] })),
  );
}
