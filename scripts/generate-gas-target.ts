/**
 * generate-gas-target: regenerate the gas-target reference partial.
 *
 * Usage:
 *   pnpm gas-target:generate        # write content/partials/_reference-gas-target-partial.mdx
 *   pnpm gas-target:check           # exit 1, with a diff summary, when the partial is stale
 *
 * Offline. The snapshot scripts/data/gas-target.json is written by `pnpm gas-target:fetch`,
 * which is the only step that talks to a chain. This runner is wiring over
 * `scripts/lib/gas-target.ts`.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Options as PrettierOptions } from 'prettier';

import { chains } from './data/gas-target.data.ts';
import { SNAPSHOT_PATH, buildContent, validateSnapshot } from './lib/gas-target.ts';
import { StaleFileError, isCheckMode, runScript, writeOrCheck } from './lib/generated-partial.ts';
import { diffSummary } from './lib/line-diff.ts';

const OUTPUT_PATH = path.join('content', 'partials', '_reference-gas-target-partial.mdx');

/** Same options as the other MDX generators; see `generate-contract-addresses.ts`. */
const MDX_FORMAT: PrettierOptions = {
  parser: 'mdx',
  printWidth: 9999,
  proseWrap: 'preserve',
  plugins: [],
};

async function main(): Promise<void> {
  const check = isCheckMode();

  if (!fs.existsSync(SNAPSHOT_PATH)) {
    throw new Error(`${SNAPSHOT_PATH} is missing. Run \`pnpm gas-target:fetch\` first.`);
  }
  const snapshot = validateSnapshot(JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf-8')), chains);
  const content = buildContent(snapshot, chains, OUTPUT_PATH);

  try {
    await writeOrCheck(OUTPUT_PATH, content, { check, overrides: MDX_FORMAT });
  } catch (error) {
    // "The file is stale" does not say whether a target moved or only whitespace did, which is
    // exactly what a reviewer of the regenerated file needs to know. `writeOrCheck` hands back
    // the text it formatted, so this prints the diff without formatting it again.
    if (error instanceof StaleFileError && error.formatted !== undefined) {
      const current = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, 'utf-8') : '';
      console.error(diffSummary(current, error.formatted));
    }
    throw error;
  }

  console.log(
    check ? 'gas targets: up to date.' : `gas targets: rendered ${chains.length} chain(s).`,
  );
}

runScript(main);
