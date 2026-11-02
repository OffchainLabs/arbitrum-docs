/**
 * The "API Refs" sidebar footer menu, derived from the generated `meta.json` of the JSON-RPC
 * reference folder: a `---label---` entry opens a group, every other entry is a method page.
 */
export interface ApiRefsGroup {
  label: string;
  items: { text: string; url: string }[];
}

export function apiRefsMenu(meta: { pages: string[] }, baseUrl: string): ApiRefsGroup[] {
  const groups: ApiRefsGroup[] = [];
  for (const entry of meta.pages) {
    const separator = /^---(.+)---$/.exec(entry);
    if (separator) {
      groups.push({ label: separator[1] as string, items: [] });
      continue;
    }
    const group = groups.at(-1);
    if (!group)
      throw new Error(`${baseUrl}/meta.json: "${entry}" comes before any ---group--- entry`);
    group.items.push({ text: entry, url: `${baseUrl}/${entry}` });
  }
  return groups;
}
