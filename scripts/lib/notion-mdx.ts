/**
 * notion-mdx: pure functions from Notion API block JSON to the MDX the FAQ partials carry.
 *
 * The input types mirror the JSON shapes `@notionhq/client` returns, narrowed to the fields read
 * here, so tests can use plain fixture objects and the fetch script can pass API responses as-is.
 * Anything this module cannot render throws {@link RenderError}; the fetch script collects those
 * per question and reports them with the Notion page URL. Nothing here touches the network or
 * the filesystem.
 */

/** A block or rich-text item that has no faithful MDX rendering. */
export class RenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RenderError';
  }
}

export interface NotionRichText {
  type: 'text' | 'mention' | 'equation';
  plain_text: string;
  href: string | null;
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  text?: { content: string; link: { url: string } | null };
}

/**
 * Escape every character that MDX or CommonMark would otherwise interpret inside prose: JSX and
 * expression delimiters, emphasis and code markers, link brackets, and the backslash itself.
 */
export function escapeMdxText(s: string): string {
  return s.replace(/[\\`*_{}[\]<~]/g, (c) => `\\${c}`);
}

const CURLY_QUOTES: Record<string, string> = { '“': '"', '”': '"', '‘': "'", '’': "'" };

const straightenQuotes = (s: string): string => s.replace(/[“”‘’]/g, (c) => CURLY_QUOTES[c] ?? c);

/**
 * A `docs.arbitrum.io` URL becomes site-relative so `check-links` validates it. A Notion URL is
 * rejected because readers cannot open it. Every other URL passes through.
 */
export function rewriteLink(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new RenderError(`link is not an absolute URL: ${url}`);
  }
  const host = parsed.hostname.toLowerCase();
  if (host === 'www.notion.so' || host === 'notion.so' || host === 'app.notion.com') {
    throw new RenderError(`link points at Notion, which readers cannot open: ${url}`);
  }
  if (host !== 'docs.arbitrum.io') return url;

  const pathname = parsed.pathname.replace(/^\/docs(?=\/|$)/, '').replace(/\/$/, '');
  return `/docs${pathname}${parsed.search}${parsed.hash}`;
}

/** Render a rich-text array to inline MDX. */
export function renderRichText(
  items: NotionRichText[],
  { allowLinks = true }: { allowLinks?: boolean } = {},
): string {
  return items
    .map((item) => {
      if (item.type !== 'text') {
        throw new RenderError(`unsupported rich text: ${item.type} "${item.plain_text}"`);
      }
      const { bold, italic, strikethrough, code } = item.annotations;
      const content = straightenQuotes(item.plain_text);
      let out = code ? `\`${content}\`` : escapeMdxText(content);
      if (bold) out = `**${out}**`;
      if (italic) out = `_${out}_`;
      if (strikethrough) out = `~~${out}~~`;

      const url = item.text?.link?.url ?? item.href;
      if (url) {
        if (!allowLinks) throw new RenderError(`link not allowed here: ${url}`);
        out = `[${out}](${rewriteLink(url)})`;
      }
      return out;
    })
    .join('');
}
