/**
 * generate-contract-addresses: regenerate the contract-address reference partial.
 *
 * Usage:
 *   pnpm contracts:generate          # write content/partials/_reference-arbitrum-contract-addresses-partial.mdx
 *   pnpm contracts:check             # exit 1, with a diff summary, when the committed partial is stale
 *
 * Sources of truth:
 * - `@arbitrum/sdk` for protocol-core and token-bridge addresses (rollup, inbox, sequencerInbox,
 *   bridge, outbox, classic outboxes, gateways, WETH, proxy admins, multicall). These follow
 *   automatically when the SDK devDependency is bumped, which is the whole point of the port:
 *   the partial used to be a static file that nothing kept honest.
 * - `scripts/data/contract-addresses.data.ts` for what the SDK does not expose (core proxy
 *   admin, fraud-proof contracts, resource constraint manager, canonical factories) and for the
 *   constant precompile addresses.
 *
 * Unlike `generate-precompile-tables.ts` this makes no network calls: the SDK ships its network
 * registry as data, so a run is offline and deterministic.
 *
 * Ported from arbitrum-docs `scripts/generate-contract-addresses.ts`.
 */
import { getArbitrumNetwork } from '@arbitrum/sdk';
import fs from 'node:fs';
import path from 'node:path';
import type { Options as PrettierOptions } from 'prettier';

import * as data from './data/contract-addresses.data.ts';
import { buildContent } from './lib/contract-addresses.ts';
import { StaleFileError, isCheckMode, runScript, writeOrCheck } from './lib/generated-partial.ts';
import { diffSummary } from './lib/line-diff.ts';

const OUTPUT_PATH = path.join(
  'content',
  'partials',
  '_reference-arbitrum-contract-addresses-partial.mdx',
);

/**
 * Prettier options for the generated `.mdx` partial, matching `generate-precompile-tables.ts`.
 *
 * `.prettierignore` excludes `**\/*.mdx` from `pnpm format`, so nothing else reformats this file
 * and the generator owns its shape. `printWidth: 9999` keeps each `<AEL>` tag on one line, which
 * is what the committed partial already looks like, so regenerating produces no formatting churn.
 * Prettier is also what aligns the table columns, so the generator emits loose pipes and lets the
 * formatter settle on one canonical width.
 */
const MDX_FORMAT: PrettierOptions = {
  parser: 'mdx',
  printWidth: 9999,
  proseWrap: 'preserve',
  plugins: [],
};

async function main(): Promise<void> {
  const check = isCheckMode();

  const { chains } = data;
  const networks = Object.fromEntries(chains.map((c) => [c.key, getArbitrumNetwork(c.childId)]));
  const content = buildContent({ chains, networks, data });

  try {
    await writeOrCheck(OUTPUT_PATH, content, { check, overrides: MDX_FORMAT });
  } catch (error) {
    // "The file is stale" does not say whether an address moved or only whitespace did, which is
    // exactly what a reviewer of the weekly upstream-refresh PR needs to know. `writeOrCheck`
    // hands back the text it formatted, so this prints the diff without formatting it again.
    if (error instanceof StaleFileError && error.formatted !== undefined) {
      const current = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, 'utf-8') : '';
      console.error(diffSummary(current, error.formatted));
    }
    throw error;
  }

  console.log(
    check
      ? 'contract addresses: up to date.'
      : `contract addresses: rendered ${data.chains.length} chain column(s).`,
  );
}

runScript(main);
