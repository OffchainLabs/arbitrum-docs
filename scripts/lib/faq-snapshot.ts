/**
 * faq-snapshot: turn Notion FAQ rows into the per-page snapshots `content/faq/<key>.json` holds.
 *
 * Pure. The fetch script reads pages and blocks from the API, calls `rowFromPage` on each page,
 * `groupRows` once, renders each answer, then `buildSnapshot` per key. Every failure here names
 * the question so the person fixing it can find the row in Notion.
 */
import { type FaqKey, faqDatabaseId, faqPages } from '../../lib/faq-pages.ts';
import type { NotionRichText } from './notion-mdx.ts';

export interface FaqRow {
  id: string;
  url: string;
  question: string;
  slugs: string[];
  order: number | null;
  shortAnswer: NotionRichText[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqSnapshot {
  source: string;
  items: FaqItem[];
}

export const normalizeQuestion = (s: string): string => s.replace(/\s+/g, ' ').trim();

const keyBySlug = new Map(faqPages.map((p) => [p.notionSlug, p.key]));

/** Group mapped rows by page key, ordered by `FAQ order index`. Throws on anything ambiguous. */
export function groupRows(rows: FaqRow[]): Map<FaqKey, FaqRow[]> {
  const groups = new Map<FaqKey, FaqRow[]>();
  for (const row of rows) {
    for (const slug of row.slugs) {
      const key = keyBySlug.get(slug);
      if (!key) continue;
      if (row.order === null) {
        throw new Error(`"${row.question}" (${row.url}) has no FAQ order index`);
      }
      (groups.get(key) ?? groups.set(key, []).get(key)!).push(row);
    }
  }
  for (const [key, group] of groups) {
    group.sort((a, b) => (a.order as number) - (b.order as number));
    const seenQuestions = new Set<string>();
    for (let i = 0; i < group.length; i++) {
      const row = group[i]!;
      const next = group[i + 1];
      if (next && next.order === row.order) {
        throw new Error(
          `"${row.question}" and "${next.question}" have the same order index ${row.order} on ${key}`,
        );
      }
      const q = normalizeQuestion(row.question);
      if (seenQuestions.has(q))
        throw new Error(`duplicate question on ${key}: "${q}" (${row.url})`);
      seenQuestions.add(q);
    }
  }
  return groups;
}

export function buildSnapshot(rows: FaqRow[], answers: Map<string, string>): FaqSnapshot {
  return {
    source: `https://www.notion.so/${faqDatabaseId}`,
    items: rows.map((row) => {
      const answer = answers.get(row.id);
      if (answer === undefined)
        throw new Error(`no rendered answer for "${row.question}" (${row.url})`);
      return { id: row.id, question: normalizeQuestion(row.question), answer };
    }),
  };
}

type Props = Record<string, { type: string } & Record<string, unknown>>;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

/** Read the fields the pipeline needs from a page object as `dataSources.query` returns it. */
export function rowFromPage(page: unknown): FaqRow {
  if (
    !isRecord(page) ||
    !isRecord(page.properties) ||
    typeof page.id !== 'string' ||
    typeof page.url !== 'string'
  ) {
    throw new Error('not a full page object');
  }
  const props = page.properties as Props;
  const title = props['Question'];
  if (!title || !Array.isArray(title.title))
    throw new Error(`page ${page.url} has no Question title property`);
  const titleItems = title.title as NotionRichText[];
  if (titleItems.some((t) => t.href))
    throw new Error(`question has a link in its title: ${page.url}`);
  const question = titleItems.map((t) => t.plain_text).join('');

  const slugsProp = props['Target document slugs'];
  const slugs = Array.isArray(slugsProp?.multi_select)
    ? (slugsProp.multi_select as { name: string }[]).map((o) => o.name)
    : [];

  const orderProp = props['FAQ order index'];
  const order = typeof orderProp?.number === 'number' ? orderProp.number : null;

  const shortProp = props['Short answer (HTML)'];
  const shortAnswer = Array.isArray(shortProp?.rich_text)
    ? (shortProp.rich_text as NotionRichText[])
    : [];

  return { id: page.id, url: page.url, question, slugs, order, shortAnswer };
}
