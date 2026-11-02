/**
 * The "API Refs" sidebar footer menu, derived from the generated `meta.json` of the JSON-RPC
 * reference folder: every entry but the `---label---` separators is a method page, in document
 * order. The method names carry their namespace, so the menu needs no group labels.
 */
export interface ApiRefsLink {
  text: string;
  url: string;
}

export function apiRefsLinks(meta: { pages: string[] }, baseUrl: string): ApiRefsLink[] {
  return meta.pages
    .filter((entry) => !/^---.*---$/.test(entry))
    .map((entry) => ({ text: entry, url: `${baseUrl}/${entry}` }));
}
