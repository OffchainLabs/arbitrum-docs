/**
 * The six FAQ and troubleshooting pages whose body comes from the Notion "FAQ CMS" database.
 *
 * This is the only place the Notion slugs and the page paths are written. `scripts/faq-fetch.ts`
 * groups Notion rows by `notionSlug`, `scripts/generate-faq.ts` writes the partial for each `key`,
 * and `lib/faq.ts` looks a rendered page up by `page` to emit its FAQPage JSON-LD.
 */

/** The database that holds the "FAQs [Database]" inline table on the "FAQ CMS" page. */
export const faqDatabaseId = 'a8a9af20f33d4cc1b32bbd2be8459733';
/** The database's single data source; `dataSources.query` takes this id, not the database id. */
export const faqDataSourceId = 'a2a87b1e-7077-4e85-86e4-b67df34307d4';

export type FaqKey = 'users' | 'nodes' | 'building' | 'bridging' | 'arbitrum-chain' | 'stylus';

export interface FaqPage {
  key: FaqKey;
  /** The value of the Notion `Target document slugs` multi-select that routes a row here. */
  notionSlug: string;
  /** The docs page path under `content/docs/`, without extension, that includes the partial. */
  page: string;
}

export const faqPages: readonly FaqPage[] = [
  { key: 'users', notionSlug: 'troubleshooting-using-arbitrum', page: 'get-started/faq' },
  { key: 'nodes', notionSlug: 'troubleshooting-running-nodes', page: 'run-a-node/faq' },
  {
    key: 'building',
    notionSlug: 'troubleshooting-building',
    page: 'build-decentralized-apps/troubleshooting-building',
  },
  {
    key: 'bridging',
    notionSlug: 'troubleshooting-bridging',
    page: 'arbitrum-bridge/troubleshooting',
  },
  {
    key: 'arbitrum-chain',
    notionSlug: 'troubleshooting-building-orbit',
    page: 'launch-arbitrum-chain/overview/faq',
  },
  {
    key: 'stylus',
    notionSlug: 'troubleshooting-building-stylus',
    page: 'stylus/troubleshooting-building-stylus',
  },
];

export const partialPathFor = (key: FaqKey): string =>
  `content/partials/_troubleshooting-${key}-partial.mdx`;

export const snapshotPathFor = (key: FaqKey): string => `content/faq/${key}.json`;
