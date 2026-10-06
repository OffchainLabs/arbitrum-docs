/**
 * notion-mdx: pure functions from Notion API block JSON to the MDX the FAQ partials carry.
 *
 * The input types mirror the JSON shapes `@notionhq/client` returns, narrowed to the fields read
 * here, so tests can use plain fixture objects and the fetch script can pass API responses as-is.
 * Anything this module cannot render throws {@link RenderError}; the fetch script collects those
 * per question and reports them with the Notion page URL. Nothing here touches the network or
 * the filesystem.
 */
import { docsRoute } from '../../lib/shared.ts';

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

/**
 * Escape each unescaped pipe in a rendered table cell. GFM consumes the backslash protecting a
 * pipe, including inside inline code. The pattern steps over every existing backslash pair as one
 * unit, so `\\`, `\{` and `\|` pass through unchanged: doubling a backslash would expose an MDX
 * brace or tag to the parser, and escaping an escaped pipe would split the cell.
 */
export function escapeTableCellPipes(cell: string): string {
  return cell.replace(/\\[\s\S]|\|/g, (match) => (match === '|' ? '\\|' : match));
}

const CURLY_QUOTES: Record<string, string> = { '“': '"', '”': '"', '‘': "'", '’': "'" };

const straightenQuotes = (s: string): string => s.replace(/[“”‘’]/g, (c) => CURLY_QUOTES[c] ?? c);

/**
 * A `docs.arbitrum.io` URL becomes a site path under `docsRoute` so `check-links` validates it; a
 * legacy `/docs` prefix is dropped. A Notion URL is rejected because readers cannot open it. Every
 * other HTTP(S) or mailto URL passes through. Other protocols are not publishable links.
 */
export function rewriteLink(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new RenderError(`link is not an absolute URL: ${url}`);
  }
  if (!['https:', 'http:', 'mailto:'].includes(parsed.protocol)) {
    throw new RenderError(`link has an unsupported protocol: ${parsed.protocol}`);
  }
  const host = parsed.hostname.toLowerCase();
  if (host === 'www.notion.so' || host === 'notion.so' || host === 'app.notion.com') {
    throw new RenderError(`link points at Notion, which readers cannot open: ${url}`);
  }
  if (host !== 'docs.arbitrum.io') return url;

  const pathname = parsed.pathname.replace(/^\/docs(?=\/|$)/, '').replace(/\/$/, '');
  const sitePath = `${docsRoute}${pathname}` || '/';
  return `${sitePath}${parsed.search}${parsed.hash}`;
}

/** Keep the destination inside its Markdown delimiters, even when a URL contains MDX syntax. */
function linkDestination(url: string): string {
  return rewriteLink(url).replace(/[\\\s()<>{}"`]/g, (c) =>
    Array.from(
      new TextEncoder().encode(c),
      (byte) => `%${byte.toString(16).padStart(2, '0')}`,
    ).join(''),
  );
}

/** A delimiter longer than every backtick run, padded so edge backticks cannot merge with it. */
function inlineCode(content: string): string {
  if (content === '') return '';
  const fence = '`'.repeat(longestBacktickRun(content) + 1);
  const pad =
    content.startsWith('`') ||
    content.endsWith('`') ||
    (content.startsWith(' ') && content.endsWith(' ') && /[^ ]/.test(content));
  return `${fence}${pad ? ' ' : ''}${content}${pad ? ' ' : ''}${fence}`;
}

/** Render a rich-text array to inline MDX. */
export function renderRichText(
  items: NotionRichText[],
  { allowLinks = true, tableCell = false }: { allowLinks?: boolean; tableCell?: boolean } = {},
): string {
  // Notion can split one code span across multiple rich-text items. Fence the combined value
  // once so neighbouring delimiters cannot merge into a different run of backticks.
  const spans: NotionRichText[] = [];
  const urlOf = (item: NotionRichText) => item.text?.link?.url ?? item.href;
  for (const item of items) {
    const previous = spans.at(-1);
    if (
      previous?.type === 'text' &&
      item.type === 'text' &&
      previous.annotations.code &&
      item.annotations.code &&
      urlOf(previous) === urlOf(item)
    ) {
      previous.plain_text += item.plain_text;
    } else {
      spans.push({ ...item });
    }
  }
  return spans
    .map((item) => {
      if (item.type !== 'text') {
        throw new RenderError(`unsupported rich text: ${item.type} "${item.plain_text}"`);
      }
      const { bold, italic, strikethrough, code } = item.annotations;
      const content = straightenQuotes(item.plain_text);

      let out: string;
      if (code) {
        // Check after coalescing: Notion can split the backslash and pipe across code items.
        if (tableCell && content.includes('\\|')) {
          throw new RenderError(
            `table cell code ${JSON.stringify(content)} contains a backslash directly before a pipe; ` +
              'GFM cannot preserve it in a table code span. Put the example outside the table.',
          );
        }
        out = inlineCode(content);
      } else {
        // Other formatting: extract whitespace and apply markers to core only
        const leadMatch = content.match(/^\s*/);
        const trailMatch = content.match(/\s*$/);
        const leadingWhitespace = leadMatch?.[0] ?? '';
        const trailingWhitespace = trailMatch?.[0] ?? '';
        const core = content.slice(
          leadingWhitespace.length,
          content.length - trailingWhitespace.length,
        );

        // Escape and apply formatting markers to core
        let formatted = escapeMdxText(core);
        if (core) {
          // Only apply markers if there's non-whitespace content
          if (bold) formatted = `**${formatted}**`;
          if (italic) formatted = `*${formatted}*`;
          if (strikethrough) formatted = `~~${formatted}~~`;
        }
        out = `${leadingWhitespace}${formatted}${trailingWhitespace}`;
      }

      const url = urlOf(item);
      if (url) {
        if (!allowLinks) throw new RenderError(`link not allowed here: ${url}`);
        out = `[${out}](${linkDestination(url)})`;
      }
      return out;
    })
    .join('');
}

/**
 * A block as the API returns it, with `children` attached by the fetch step for every block whose
 * `has_children` is true. The payload sits under the key named by `type`.
 */
export interface NotionBlock {
  id: string;
  type: string;
  has_children?: boolean;
  children?: NotionBlock[];
  [payload: string]: unknown;
}

const FAIL_BY_TYPE = new Set([
  'image',
  'video',
  'file',
  'pdf',
  'audio',
  'embed',
  'bookmark',
  'link_preview',
  'link_to_page',
  'child_page',
  'child_database',
  'synced_block',
  'toggle',
  'column_list',
  'column',
  'template',
  'breadcrumb',
  'table_of_contents',
  'equation',
  'to_do',
  'unsupported',
]);

type Payload = {
  rich_text?: NotionRichText[];
  language?: string;
  cells?: NotionRichText[][];
  has_column_header?: boolean;
};

const payloadOf = (b: NotionBlock): Payload => (b[b.type] as Payload | undefined) ?? {};
const textOf = (b: NotionBlock, opts?: { allowLinks?: boolean }): string =>
  renderRichText(payloadOf(b).rich_text ?? [], opts);
const indent = (s: string, by: string): string => s.replace(/^(?!$)/gm, by);

/**
 * Prefix every line (including blank ones) with the given string. Used for quote blocks where
 * blank lines must become `> ` (the prefix trimmed of trailing space), not remain blank.
 */
const prefixAllLines = (s: string, prefix: string): string => {
  const trimmedPrefix = prefix.trimEnd();
  return s
    .split('\n')
    .map((line) => (line === '' ? trimmedPrefix : prefix + line))
    .join('\n');
};

/** Blocks that print one line each and chain without blank lines between siblings of a kind. */
const LIST_TYPES = new Set(['bulleted_list_item', 'numbered_list_item']);

/**
 * Escape leading Markdown syntax in block text. After rendering text in a paragraph or list item,
 * if it starts with a character that would be interpreted as Markdown structure (`#`, `-`, `+`,
 * `*`, `>`, `|`, digit-period/paren, or the literal `---`), prefix a backslash. Already-escaped
 * characters (starting with `\`) are left alone.
 */
function escapeLeadingSyntax(text: string): string {
  if (!text.startsWith('\\') && /^(?:[#>|+-]|\d+[.)]|---)/.test(text)) {
    return '\\' + text;
  }
  return text;
}

/**
 * Text followed by rendered children, joined by one blank line. Extracts the common pattern for
 * paragraph, quote, and callout blocks.
 */
function renderTextWithChildren(text: string, children: NotionBlock[]): string {
  const childrenRendered = children.length ? renderBlocks(children) : '';
  return [text, childrenRendered].filter(Boolean).join('\n\n');
}

/**
 * Find the longest run so inline and block code can choose a delimiter longer than the content.
 */
function longestBacktickRun(content: string): number {
  return (content.match(/`+/g) ?? []).reduce((max, run) => Math.max(max, run.length), 0);
}

function renderOne(b: NotionBlock, ordinal: number): string | null {
  if (FAIL_BY_TYPE.has(b.type)) {
    throw new RenderError(`unsupported block ${b.type} (${b.id})`);
  }
  const children = b.children ?? [];
  switch (b.type) {
    case 'paragraph': {
      const text = escapeLeadingSyntax(textOf(b));
      if (text === '' && children.length === 0) return null;
      return renderTextWithChildren(text, children);
    }
    case 'heading_1':
    case 'heading_2':
    case 'heading_3':
      if (children.length) {
        throw new RenderError(`${b.type} block cannot have children (${b.id})`);
      }
      return `#### ${textOf(b, { allowLinks: false })}`;
    case 'bulleted_list_item':
    case 'numbered_list_item': {
      const marker = b.type === 'bulleted_list_item' ? '- ' : `${ordinal}. `;
      const body = escapeLeadingSyntax(textOf(b));
      const nested = children.length
        ? '\n' + indent(renderBlocks(children), ' '.repeat(marker.length))
        : '';
      return `${marker}${body}${nested}`;
    }
    case 'code': {
      const { language = '', rich_text = [] } = payloadOf(b);
      const raw = rich_text.map((r) => r.plain_text).join('');
      const fence = '`'.repeat(Math.max(3, longestBacktickRun(raw) + 1));
      return `${fence}${language}\n${raw}\n${fence}`;
    }
    case 'quote': {
      const inner = renderTextWithChildren(textOf(b), children);
      return prefixAllLines(inner, '> ');
    }
    case 'callout': {
      const inner = renderTextWithChildren(textOf(b), children);
      return `<Callout type="info">\n\n${inner}\n\n</Callout>`;
    }
    case 'divider':
      if (children.length) {
        throw new RenderError(`divider block cannot have children (${b.id})`);
      }
      return '---';
    case 'table': {
      const rows = children.filter((c) => c.type === 'table_row');
      const cells = rows.map((r) =>
        (payloadOf(r).cells ?? []).map((c) =>
          escapeTableCellPipes(renderRichText(c, { tableCell: true })),
        ),
      );
      if (cells.length === 0) return null;
      const width = Math.max(...cells.map((r) => r.length));
      const header = payloadOf(b).has_column_header
        ? cells.shift()!
        : Array<string>(width).fill('');
      const line = (r: string[]) => `| ${r.join(' | ')} |`;
      return [line(header), line(Array<string>(width).fill('---')), ...cells.map(line)].join('\n');
    }
    default:
      throw new RenderError(`unsupported block ${b.type} (${b.id})`);
  }
}

/** Render a sequence of sibling blocks to MDX, one blank line between non-list neighbours. */
export function renderBlocks(blocks: NotionBlock[]): string {
  const parts: string[] = [];
  let ordinal = 0;
  let previousType: string | null = null;
  for (const b of blocks) {
    ordinal =
      b.type === 'numbered_list_item' && previousType === 'numbered_list_item' ? ordinal + 1 : 1;
    const rendered = renderOne(b, ordinal);
    if (rendered === null) continue;
    const tight = LIST_TYPES.has(b.type) && previousType === b.type;
    parts.push((parts.length ? (tight ? '\n' : '\n\n') : '') + rendered);
    previousType = b.type;
  }
  return parts.join('');
}

/** The page body, or the `Short answer (HTML)` property when the body is empty. */
export function renderAnswer(blocks: NotionBlock[], shortAnswer: NotionRichText[]): string {
  const body = renderBlocks(blocks);
  if (body !== '') return body;
  const short = renderRichText(shortAnswer);
  if (short !== '') return short;
  throw new RenderError('answer is empty: no body blocks and no short answer');
}
