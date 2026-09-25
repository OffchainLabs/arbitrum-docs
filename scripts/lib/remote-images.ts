/**
 * Extract remotely hosted images from MDX source.
 *
 * "Remote" means an `http:` or `https:` src. The two syntaxes behave very differently once the page
 * renders, which is why every result carries its `syntax`:
 *
 *   - **markdown** (`![alt](https://…)`, and the reference-style `![alt][label]` spellings of it)
 *     resolves to `next/image`. With `remarkImageOptions.external: false` in `source.config.ts`
 *     nothing measures the image at build, so the component receives no `width`, and Next throws
 *     `Image with src "…" is missing required "width" property`. The page 500s. These must not
 *     reach `main`, which is what `--presence` guards.
 *   - **jsx** (`<ImageZoom src="https://…">`) resolves to `components/mdx/ImageZoom`, a plain
 *     `<img>`. A remote src renders fine. It can still rot, which is what the network mode reports.
 *
 * Pure string handling, no filesystem and no network, so it is cheap to unit test.
 *
 * **Known limit.** Everything here is literal-source matching, so a URL that only exists at runtime
 * is invisible: `<ImageZoom src={url} />`, or a src built from a variable or an import. Nothing
 * offline can resolve those, and `--presence` is a gate precisely because it is offline, so the
 * limit is deliberate rather than an oversight. It is narrow in practice: the syntax that 500s is
 * markdown, and markdown has no expressions. The JSX forms it cannot see are the forms that render.
 */
import { maskCode } from './strip-code.ts';

/**
 * One remote image. `element` is the JSX element's name, or `'markdown'` for markdown syntax;
 * `alt` is empty for JSX, where the alt text is not read.
 */
export interface RemoteImage {
  url: string;
  line: number;
  alt: string;
  element: string;
  syntax: 'markdown' | 'jsx';
}

const MARKDOWN_IMAGE = /!\[([^\]]*)\]\(\s*<?(https?:\/\/[^\s<>)]+)>?[^)]*\)/g;

/**
 * The definition half of a reference-style image: `[label]: https://… "optional title"`.
 * CommonMark lets the URL be wrapped in angle brackets, and the first definition of a label wins.
 */
const LINK_DEFINITION = /^[ \t]{0,3}\[([^\]\n]+)\]:[ \t]*(?:<([^>\n]+)>|(\S+))/gm;

/**
 * The use half: `![alt][label]` (full), `![label][]` (collapsed) and `![label]` (shortcut).
 *
 * These matter because they are the one form that reaches `next/image` without ever meeting
 * `remark-image`. mdast parses them to an `imageReference` node, and `remark-image` visits `image`
 * only, so the reference is left untouched until `mdast-util-to-hast` resolves it to a plain `img`
 * against the definition. No probe, no import, no `width`, so the page 500s exactly as an inline
 * remote image does, while matching none of the patterns that catch one.
 */
const IMAGE_REFERENCE = /!\[([^\]]*)\](?:\[([^\]]*)\])?/g;

/** Reference labels are case-insensitive and fold internal whitespace. */
function normalizeLabel(label: string): string {
  return label.trim().replace(/\s+/g, ' ').toLowerCase();
}

function linkDefinitions(source: string): Map<string, string> {
  const definitions = new Map<string, string>();

  for (const match of source.matchAll(LINK_DEFINITION)) {
    const label = normalizeLabel(match[1]);
    if (!definitions.has(label)) definitions.set(label, match[2] ?? match[3]);
  }

  return definitions;
}

/**
 * Any JSX element carrying a remote `src`, so an image alias nobody told this script about is still
 * found. `components/mdx.tsx` is the registry, and it grows: `ImageZoom`, `ImageWithCaption` and
 * whatever gets added next all take `src`.
 */
const JSX_SRC = /<([A-Za-z][\w.]*)\b[^>]*?\bsrc\s*=\s*["'{]\s*["']?(https?:\/\/[^"'\s{}]+)/g;

/**
 * Elements that take a `src` without being an image. They rot too, but they are not this script's
 * business and reporting them as images would be wrong.
 */
const NOT_IMAGES = new Set(['script', 'iframe', 'video', 'audio', 'source', 'track', 'embed']);

/**
 * Every remote image in one MDX file, in source order.
 *
 * @param source raw MDX
 */
export function extractRemoteImages(source: string): RemoteImage[] {
  // Fences and inline code only: a URL inside a shell or HTML sample is documentation, not an image
  // reference, and a false positive here fails a pull request for a page that renders perfectly.
  // Frontmatter and both comment forms stay visible, which is what this script has always scanned.
  const scannable: string = maskCode(source);
  const found: RemoteImage[] = [];

  const lineOf = (index: number): number => scannable.slice(0, index).split('\n').length;

  for (const match of scannable.matchAll(MARKDOWN_IMAGE)) {
    found.push({
      url: match[2],
      line: lineOf(match.index),
      alt: match[1],
      element: 'markdown',
      syntax: 'markdown',
    });
  }

  const definitions = linkDefinitions(scannable);

  for (const match of scannable.matchAll(IMAGE_REFERENCE)) {
    // `![alt](https://…)` is the inline form, already handled above.
    if (match[2] === undefined && scannable[match.index + match[0].length] === '(') continue;

    // `![alt][label]` names its label; `![label][]` and `![label]` reuse the text as the label.
    const label = normalizeLabel(match[2] ? match[2] : match[1]);
    const url = definitions.get(label);

    // A `![text]` with no matching definition is literal text, not an image.
    if (!url || !/^https?:\/\//i.test(url)) continue;

    found.push({
      url,
      line: lineOf(match.index),
      alt: match[1],
      element: 'markdown',
      syntax: 'markdown',
    });
  }

  for (const match of scannable.matchAll(JSX_SRC)) {
    if (NOT_IMAGES.has(match[1].toLowerCase())) continue;

    found.push({
      url: match[2],
      line: lineOf(match.index),
      alt: '',
      element: match[1],
      syntax: 'jsx',
    });
  }

  return found.sort((a, b) => a.line - b.line || a.url.localeCompare(b.url));
}

/**
 * Decide whether a probe result counts as reachable.
 *
 * Redirects count: image hosts routinely 302 to a CDN or a signed URL.
 */
export function isReachable(status: unknown): boolean {
  return typeof status === 'number' && status >= 200 && status < 400;
}
