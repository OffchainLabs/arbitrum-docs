/**
 * faq-fetch: read the publishable FAQ rows from the Notion "FAQ CMS" database and write one
 * snapshot per docs page to content/faq/<key>.json.
 *
 * Usage:
 *   pnpm faq:fetch             # needs NOTION_TOKEN in the environment or in .env
 *
 * This is the only step that talks to Notion. It never writes a partial; run `pnpm faq:generate`
 * afterwards. Every question that cannot be rendered is reported with its Notion URL, and the
 * run exits 1 after reporting all of them. A run with no content change writes nothing.
 */
import { Client, collectPaginatedAPI, isFullBlock, isFullPage } from '@notionhq/client';
import fs from 'node:fs';
import path from 'node:path';

import { faqDataSourceId, snapshotPathFor } from '../lib/faq-pages.ts';
import { buildIndex } from './lib/doc-links.ts';
import { findUnresolvedLinks } from './lib/faq-links.ts';
import { type FaqRow, buildSnapshot, groupRows, rowFromPage } from './lib/faq-snapshot.ts';
import { runScript, writeOrCheck } from './lib/generated-partial.ts';
import { type NotionBlock, RenderError, renderAnswer } from './lib/notion-mdx.ts';

function loadToken(): string {
  if (!process.env.NOTION_TOKEN && fs.existsSync('.env')) process.loadEnvFile('.env');
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error('NOTION_TOKEN is not set. Put it in the environment or in .env.');
  return token;
}

async function queryRows(client: Client): Promise<FaqRow[]> {
  const rows: FaqRow[] = [];
  let cursor: string | undefined;
  do {
    const page = await client.dataSources.query({
      data_source_id: faqDataSourceId,
      ...(cursor ? { start_cursor: cursor } : {}),
      filter: {
        and: [
          { property: 'Publishable?', select: { equals: 'Publishable' } },
          { property: 'Status', status: { equals: '4 - Continuously publishing' } },
        ],
      },
    });
    if (page.request_status?.type === 'incomplete') {
      throw new Error(
        `Notion returned an incomplete result: ${page.request_status.incomplete_reason}`,
      );
    }
    for (const result of page.results) {
      if (isFullPage(result)) rows.push(rowFromPage(result));
    }
    cursor = page.has_more && page.next_cursor ? page.next_cursor : undefined;
  } while (cursor);
  return rows;
}

async function fetchBlocks(client: Client, blockId: string): Promise<NotionBlock[]> {
  const blocks = await collectPaginatedAPI(client.blocks.children.list, { block_id: blockId });
  const out: NotionBlock[] = [];
  for (const b of blocks) {
    if (!isFullBlock(b)) continue;
    const node = b as unknown as NotionBlock;
    if (b.has_children) node.children = await fetchBlocks(client, b.id);
    out.push(node);
  }
  return out;
}

async function main(): Promise<void> {
  const client = new Client({ auth: loadToken(), retry: { maxRetries: 3 } });
  const index = buildIndex(process.cwd());

  const groups = groupRows(await queryRows(client));
  const answers = new Map<string, string>();
  const errors: string[] = [];

  const uniqueRows = new Map<string, FaqRow>();
  for (const group of groups.values()) for (const row of group) uniqueRows.set(row.id, row);

  for (const row of uniqueRows.values()) {
    try {
      const answer = renderAnswer(await fetchBlocks(client, row.id), row.shortAnswer);
      for (const url of findUnresolvedLinks(answer, index, process.cwd())) {
        errors.push(`${row.url}  "${row.question}": link does not resolve: ${url}`);
      }
      answers.set(row.id, answer);
    } catch (error) {
      if (!(error instanceof RenderError)) throw error;
      errors.push(`${row.url}  "${row.question}": ${error.message}`);
    }
  }

  if (errors.length > 0) {
    console.error(`faq-fetch: ${errors.length} question(s) cannot be published:`);
    for (const line of errors) console.error(`  ${line}`);
    process.exit(1);
  }

  let written = 0;
  for (const [key, rows] of groups) {
    const snapshot = buildSnapshot(rows, answers);
    const changed = await writeOrCheck(
      path.join(process.cwd(), snapshotPathFor(key)),
      JSON.stringify(snapshot, null, 2) + '\n',
      { check: false },
    );
    if (changed) written++;
  }
  console.log(
    `faq-fetch: ${uniqueRows.size} question(s) across ${groups.size} page(s); ${written} snapshot(s) changed.`,
  );
}

runScript(main);
