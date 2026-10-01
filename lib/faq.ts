/**
 * FAQPage structured data for the six pages whose body comes from Notion.
 *
 * Reads the same snapshots the partials are generated from, so the visible Q&A and the JSON-LD
 * cannot disagree. Imported by the docs page renderer; imports nothing from `lib/source`.
 */
import arbitrumChain from '../content/faq/arbitrum-chain.json' with { type: 'json' };
import bridging from '../content/faq/bridging.json' with { type: 'json' };
import building from '../content/faq/building.json' with { type: 'json' };
import nodes from '../content/faq/nodes.json' with { type: 'json' };
import stylus from '../content/faq/stylus.json' with { type: 'json' };
import users from '../content/faq/users.json' with { type: 'json' };
import { type FaqKey, faqPages } from './faq-pages.ts';

interface Snapshot {
  items: { id: string; question: string; answer: string }[];
}

const snapshots: Record<FaqKey, Snapshot> = {
  'arbitrum-chain': arbitrumChain,
  bridging,
  building,
  nodes,
  stylus,
  users,
};

export interface FaqPageJsonLd {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  'mainEntity': {
    '@type': 'Question';
    'name': string;
    'acceptedAnswer': { '@type': 'Answer'; 'text': string };
  }[];
}

/** Markdown and the MDX the renderer emits, reduced to one line of plain text. */
export function stripMarkdown(md: string): string {
  return md
    .replace(/^```[^\n]*\n([\s\S]*?)^```\s*$/gm, '$1')
    .replace(/<\/?Callout[^>]*>/g, '')
    .replace(/^\|\s*-{3,}(\s*\|\s*-{3,})*\s*\|\s*$/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*(?:[-*]|\d+\.)\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__|~~)(.*?)\1/g, '$2')
    .replace(/(^|[^\\])[*_](.*?)[*_]/g, '$1$2')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\\([\\`*_{}[\]<~|])/g, '$1')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const keyByPage = new Map(faqPages.map((p) => [p.page, p.key]));

export function faqJsonLd(slugs: readonly string[] | undefined): FaqPageJsonLd | undefined {
  if (!slugs) return undefined;
  const key = keyByPage.get(slugs.join('/'));
  if (!key) return undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': snapshots[key].items.map((item) => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': { '@type': 'Answer', 'text': stripMarkdown(item.answer) },
    })),
  };
}
