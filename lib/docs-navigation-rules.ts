/**
 * Navigation-manifest rules, in one place, and the manifest's types.
 *
 * **Why this is a module of its own, next to the transformer it serves.** Two things have to apply
 * this rule and they run in different worlds. `lib/docs-navigation.ts` is app code compiled by
 * Next, and it throws so that a dev server fails loudly instead of rendering a wrong sidebar.
 * `scripts/lib/nav.ts` is run by Node directly, with its own type stripping, behind
 * `pnpm nav:check`, the blocking gate. One module imported by both means the enforcing copy and
 * the tested copy are the same copy. It is separate from `lib/docs-navigation.ts` because that file
 * imports `fumadocs-core` types and builds page-tree nodes, none of which the gate needs; this one
 * imports nothing, so the gate loads no more than the rule. Same shape, and for the same reasons,
 * as `lib/site-url.ts`.
 *
 * The manifest types live here rather than in `lib/docs-navigation.ts` for the same reason: both
 * callers need them, and `lib/docs-navigation.ts` importing them from this side keeps the import
 * one-way.
 *
 * Takes the manifest sections as an argument rather than reading the JSON, so both callers and the
 * tests pass their own.
 */

/** One entry in a section's `children`, as written in `lib/docs-navigation.json`. */
export interface NavigationEntry {
  name?: string;
  page?: string;
  href?: string;
  folder?: string;
  flatten?: boolean;
  defaultOpen?: boolean;
  children?: NavigationEntry[];
}

/** One top-level section of `lib/docs-navigation.json`. */
export interface NavigationSection {
  id: string;
  name: string;
  sourceFolders: string[];
  children: NavigationEntry[];
}

/** A URL `duplicateManifestPages` found claimed more than once, with every claiming entry's name. */
export interface DuplicateManifestPage {
  url: string;
  names: string[];
}

/** One `page` entry claiming a section landing, and the section that entry sits in. */
export interface LandingClaim {
  section: string;
  name: string;
}

/** A section landing URL claimed by at least one `page` entry. */
export interface SectionLandingClaim {
  url: string;
  section: string;
  claims: LandingClaim[];
}

/**
 * A section as the two rules accept it. Every field is optional because the rules read only `id`
 * and `children` and tolerate either being absent, so a caller can pass a partial fixture.
 */
export type ManifestSection = Partial<NavigationSection>;

/**
 * Every `page` URL the manifest claims more than once, with the entry names that claim it.
 *
 * A `page` entry is the canonical claim on a URL: it becomes the real page node that gives the
 * destination its sidebar root. Claiming one URL twice therefore always means one of the two
 * entries is naming a page it does not open, and the page it was meant to name falls through into
 * its section's "Additional guides" group. Nothing else catches it, because both entries name a URL
 * that exists (FS-2740).
 *
 * Two kinds of repeat are deliberately not reported:
 *
 * - `href`, which builds a display-only separator node claiming nothing. Repeating one is the
 *   documented way to pin a cross-section shortcut, and the manifest does it for sixteen URLs.
 * - `folder`, which expands against the real content tree. A static read of the manifest cannot
 *   say which pages a repeat would duplicate, so that question belongs to the transformer.
 *
 * @param sections Manifest sections, as in `lib/docs-navigation.json`.
 * @returns One entry per over-claimed URL, in manifest order.
 */
export function duplicateManifestPages(
  sections: readonly ManifestSection[],
): DuplicateManifestPage[] {
  const claims = new Map<string, string[]>();

  const walk = (items: readonly NavigationEntry[] | undefined): void => {
    for (const item of items ?? []) {
      if (typeof item?.page === 'string') {
        claims.set(item.page, [...(claims.get(item.page) ?? []), item.name ?? '(unnamed)']);
      }
      if (Array.isArray(item?.children)) walk(item.children);
    }
  };
  for (const section of sections ?? []) walk(section?.children);

  return [...claims]
    .filter(([, names]) => names.length > 1)
    .map(([url, names]) => ({ url, names }));
}

/**
 * Every `page` entry, in any section, that claims some section's landing URL.
 *
 * `buildDocsNavigation` derives a landing node for each section from the source folder's index, so
 * a `page` entry naming that same URL puts one page on two nodes while `duplicateManifestPages`
 * above stays silent: it walks `children` only and sees one claim there. The section landing is not
 * in `children` at all (FS-2749).
 *
 * **Every section's landings are checked against every section's `children`**, not each section
 * against its own. A `page` entry in Notices naming `/docs/get-started` builds the identical
 * two-node defect, and pairing each section with its own id was blind to it: measured, both static
 * rules returned empty while the transformer threw
 * `Navigation page on more than one node: /docs/get-started (Get started > (index) | Notices)`.
 *
 * The rule is exact, and needs no content tree to be exact: the landing node exists whenever
 * `/docs/<section id>` exists, because the transformer falls back from the folder's own `index` to
 * that URL. A `page` entry naming one is therefore always one node too many. The one case it judges
 * without knowing is a manifest that is already broken twice over, where the URL does not exist at
 * all: this rule runs ahead of the build, so it fires first and a contributor reads a
 * landing-flavoured message for what is really a nonexistent page. The build fails either way.
 *
 * @param sections Manifest sections.
 * @returns One entry per over-claimed landing: the URL, the section it is the landing of, and every
 *   entry claiming it with the section that entry sits in.
 */
export function sectionLandingClaims(sections: readonly ManifestSection[]): SectionLandingClaim[] {
  const landings = new Map<string, string>();
  for (const section of sections ?? []) {
    if (typeof section?.id === 'string') landings.set(`/docs/${section.id}`, section.id);
  }

  const claims = new Map<string, LandingClaim[]>();
  for (const section of sections ?? []) {
    const walk = (items: readonly NavigationEntry[] | undefined): void => {
      for (const item of items ?? []) {
        if (typeof item?.page === 'string' && landings.has(item.page)) {
          claims.set(item.page, [
            ...(claims.get(item.page) ?? []),
            { section: section?.id ?? '(unnamed)', name: item.name ?? '(unnamed)' },
          ]);
        }
        if (Array.isArray(item?.children)) walk(item.children);
      }
    };
    walk(section?.children);
  }

  return [...landings].flatMap(([url, section]) => {
    const found = claims.get(url);
    return found ? [{ url, section, claims: found }] : [];
  });
}
