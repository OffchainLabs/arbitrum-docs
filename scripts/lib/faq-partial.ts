/**
 * faq-partial: build a troubleshooting partial from a FAQ snapshot, and the generator core that
 * `scripts/generate-faq.ts` wraps. Reads snapshots and writes partials; no network.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Options as PrettierOptions } from 'prettier';

import { type FaqPage, faqPages, partialPathFor, snapshotPathFor } from '../../lib/faq-pages.ts';
import type { FaqSnapshot } from './faq-snapshot.ts';
import {
  StaleFileError,
  assertInertMdx,
  generatedMarker,
  writeOrCheck,
} from './generated-partial.ts';
import { diffSummary } from './line-diff.ts';
import { escapeMdxText } from './notion-mdx.ts';

export const FAQ_MARKER = generatedMarker('pnpm faq:generate', 'a faq:fetch');

/** Same options as the other MDX generators: Prettier must not rewrap the answers. */
export const MDX_FORMAT: PrettierOptions = {
  parser: 'mdx',
  printWidth: 9999,
  proseWrap: 'preserve',
  plugins: [],
};

function assertInertFaq(content: string, context: string): void {
  assertInertMdx(content, {
    context,
    allowedElements: ['Callout'],
    allowedElementAttributes: { Callout: { type: 'info' } },
  });
}

export function buildPartial(snapshot: FaqSnapshot, context = 'FAQ partial'): string {
  const sections = snapshot.items.map(
    (item) => `### ${escapeMdxText(item.question)}\n\n${item.answer.trim()}\n`,
  );
  const content = [`${FAQ_MARKER}\n`, ...sections].join('\n');
  assertInertFaq(content, context);
  return content;
}

export function readSnapshot(filePath: string): FaqSnapshot {
  const parsed: unknown = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !Array.isArray((parsed as { items?: unknown }).items)
  ) {
    throw new Error(`${filePath}: not a FAQ snapshot (no items array)`);
  }
  return parsed as FaqSnapshot;
}

export async function generateFaq({
  check,
  root,
  pages = faqPages,
}: {
  check: boolean;
  root: string;
  pages?: readonly FaqPage[];
}): Promise<void> {
  for (const page of pages) {
    const snapshotPath = path.join(root, snapshotPathFor(page.key));
    if (!fs.existsSync(snapshotPath)) {
      throw new Error(`${snapshotPathFor(page.key)} is missing. Run \`pnpm faq:fetch\` first.`);
    }
    const partialPath = path.join(root, partialPathFor(page.key));
    const content = buildPartial(readSnapshot(snapshotPath), partialPath);
    try {
      await writeOrCheck(partialPath, content, {
        check,
        overrides: MDX_FORMAT,
        validate: (formatted) => assertInertFaq(formatted, partialPath),
      });
    } catch (error) {
      if (error instanceof StaleFileError && error.formatted !== undefined) {
        const current = fs.existsSync(partialPath) ? fs.readFileSync(partialPath, 'utf-8') : '';
        console.error(diffSummary(current, error.formatted));
      }
      throw error;
    }
  }
}
