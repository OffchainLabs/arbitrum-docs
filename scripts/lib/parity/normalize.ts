/**
 * The only differences the parity check forgives between a production (Docusaurus) block and its
 * Fumadocs counterpart. Every rule here is typographic or markup noise; a rule that could hide a
 * real wording change does not belong here.
 */

const ZERO_WIDTH = /[\u200B-\u200D\u2060\uFEFF\u00AD]/g;
const SINGLE_QUOTES = /[\u2018\u2019\u201A\u201B\u2032]/g;
const DOUBLE_QUOTES = /[\u201C\u201D\u201E\u201F\u2033]/g;
const SPACED_DASH = /\s*[\u2014\u2015]\s*|\s+[\u2013-]\s+/g;
const DASHES = /[\u2010-\u2015\u2212]/g;

/** Labels Docusaurus and Fumadocs print on a callout when the author gave it no title. */
export const DEFAULT_CALLOUT_LABELS: ReadonlySet<string> = new Set([
  'note',
  'info',
  'tip',
  'caution',
  'warning',
  'danger',
  'important',
]);

/**
 * Normalize prose for comparison. An em dash is punctuation between words whether or not it is
 * spaced, so it becomes a spaced hyphen, the form the Fumadocs content uses, as does a spaced en
 * dash. Any other dash (a range, a compound word) becomes a plain hyphen.
 */
export function normalizeText(text: string): string {
  return text
    .replace(ZERO_WIDTH, '')
    .replace(SINGLE_QUOTES, "'")
    .replace(DOUBLE_QUOTES, '"')
    .replace(SPACED_DASH, ' - ')
    .replace(DASHES, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize a code block. Code compares exactly, so only the invisible characters and the
 * trailing newline a highlighter may or may not emit are removed.
 */
export function normalizeCode(text: string): string {
  return text.replace(ZERO_WIDTH, '').replace(/\n+$/, '');
}

/** True when a callout title is only the default label for its type, in any case or with a trailing colon. */
export function isDefaultCalloutLabel(title: string): boolean {
  return DEFAULT_CALLOUT_LABELS.has(normalizeText(title).replace(/:$/, '').toLowerCase());
}

/** True when two texts differ only in whitespace. */
export function sameIgnoringWhitespace(a: string, b: string): boolean {
  return a.replace(/\s+/g, '') === b.replace(/\s+/g, '');
}

/**
 * The file name an image is compared by. Next serves images through `/_next/image?url=...` and
 * both bundlers may add a content hash (`name-1a2b3c4d.png`, `name.1a2b3c4d5e6f.png`); neither is
 * part of the content.
 */
export function imageName(src: string): string {
  let pathname = src;
  try {
    const url = new URL(src, 'https://parity.invalid');
    pathname = url.pathname === '/_next/image' ? (url.searchParams.get('url') ?? '') : url.pathname;
    pathname = new URL(pathname, 'https://parity.invalid').pathname;
  } catch {
    // An unparseable src is compared as written.
  }
  let base = pathname.split('/').pop() ?? pathname;
  try {
    base = decodeURIComponent(base);
  } catch {
    // Keep the encoded form.
  }
  return base.replace(/[-.][0-9a-f]{8,}(?=\.[a-z0-9]+$)/i, '');
}

/** Split normalized text into lowercase word tokens for similarity scoring. */
export function tokens(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu) ?? [];
}
