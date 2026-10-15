/**
 * link-preview: builds the JSON a hover card renders for one page. Pure data, no React and no
 * `lib/source` import, so a client component can import the `LinkPreview` type safely.
 */
import type { StructuredData } from 'fumadocs-core/mdx-plugins';

export interface LinkPreviewInput {
  title: string;
  description?: string | undefined;
  url: string;
  structuredData: StructuredData;
}

export interface LinkPreview {
  title: string;
  description?: string;
  url: string;
  /** The text before the page's first heading. */
  lead: string;
  /** The text under each heading, by heading id. */
  sections: Record<string, { heading: string; text: string }>;
}

const CLIP_LENGTH = 350;
const SENTENCE_END = /[.?!](?=\s|$)/g;

/**
 * Cut `text` to at most `cap` characters plus an ellipsis. Prefer the last sentence end in the
 * final third of the cap, so a card does not stop on a tiny first sentence; else the last space.
 */
function clip(text: string, cap: number): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= cap) return flat;
  const head = flat.slice(0, cap);
  let sentenceEnd = -1;
  for (const match of head.matchAll(SENTENCE_END)) sentenceEnd = match.index;
  if (sentenceEnd >= (cap * 2) / 3) return `${head.slice(0, sentenceEnd + 1)}…`;
  const space = head.lastIndexOf(' ');
  return `${space > 0 ? head.slice(0, space) : head}…`;
}

export function buildLinkPreview(input: LinkPreviewInput): LinkPreview {
  const { title, description, url, structuredData } = input;
  const byHeading = new Map<string | undefined, string[]>();
  for (const { heading, content } of structuredData.contents) {
    byHeading.set(heading, [...(byHeading.get(heading) ?? []), content]);
  }
  const joined = (id: string | undefined): string =>
    clip((byHeading.get(id) ?? []).join(' '), CLIP_LENGTH);

  const sections: LinkPreview['sections'] = {};
  for (const { id, content } of structuredData.headings) {
    sections[id] = { heading: content, text: joined(id) };
  }
  return {
    title,
    ...(description === undefined ? {} : { description }),
    url,
    lead: joined(undefined),
    sections,
  };
}
