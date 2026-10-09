/**
 * generate-faq: write the six FAQ partials from the committed Notion snapshots.
 *
 * Usage:
 *   pnpm faq:generate          # write content/partials/_troubleshooting-*-partial.mdx
 *   pnpm faq:check             # exit 1, with a diff summary, when a partial is stale
 *
 * Offline. The snapshots under content/faq/ are written by `pnpm faq:fetch`, which is the only
 * step that talks to Notion. This runner is wiring over `scripts/lib/faq-partial.ts`.
 */
import { generateFaq } from './lib/faq-partial.ts';
import { isCheckMode, runScript } from './lib/generated-partial.ts';

async function main(): Promise<void> {
  const check = isCheckMode();
  await generateFaq({ check, root: process.cwd() });
  console.log(check ? 'faq partials: up to date.' : 'faq partials: generated.');
}

runScript(main);
