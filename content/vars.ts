import { z } from 'zod';

import varsJson from './vars.json';

/**
 * Build-time global variables (replaces Docusaurus's `globalVars.js` +
 * `markdown-preprocessor.js` @@varName@@ substitution).
 *
 * Writers edit `vars.json` (pure JSON, no TypeScript knowledge required).
 * This module validates the JSON against the schema and exports typed values
 * consumed by the `<Var>` MDX component.
 *
 * On schema mismatch, `parse()` throws at module-load time with a precise
 * field-level error message — surfaces immediately in `pnpm dev` console and
 * in CI typecheck.
 *
 * `strictObject`, not `object`: a plain `z.object` SILENTLY STRIPS keys that are
 * present in `vars.json` but absent here, so `vars[name]` returns `undefined`
 * and `<Var>` renders the literal string "undefined" into the page. That is how
 * 27 variables came to render `undefined` across 85 sites. Strict mode turns
 * that into a module-load error instead. `pnpm vars:check` catches the inverse
 * case (a name used in MDX with no key at all), which no type system can see
 * because .mdx never passes through tsc.
 *
 * Values mirror upstream `arbitrum-docs/src/resources/globalVars.js`, which is
 * regenerated there by `yarn update-variable-refs` on every release. Keep them
 * in sync while that site is still live.
 */
const varsSchema = z.strictObject({
  arbOneChainId: z.number(),
  novaChainId: z.number(),
  nitroDocsRepo: z.url(),
  latestNitroNodeImage: z.string(),
  latestClassicNodeImage: z.string(),
  nitroVersionTag: z.string(),
  nitroRepositorySlug: z.string(),
  nitroPathToArbos: z.string(),
  nitroPathToArbosState: z.string(),
  nitroPathToPrecompiles: z.string(),
  nitroPathToStorage: z.string(),
  nitroPrecompilesRepositorySlug: z.string(),
  nitroPrecompilesCommit: z.string(),
  goEthereumCommit: z.string(),
  portalApplicationForm: z.url(),
  arbOneNitroArchiveSnapshot: z.url(),
  arbOneClassicArchiveSnapshot: z.url(),
  arbOneDisputeWindowBlocks: z.number(),
  arbOneDisputeWindowDays: z.string(),
  l2BlockTimeMs: z.string(),
  l1SlotTimeSeconds: z.string(),

  // Execution limits. Deliberately no `maxCodeSizeKb`: "24KB" names three different constants in
  // these docs — the EVM MaxCodeSize, EIP-170's Ethereum limit, and Stylus's compressed WASM limit
  // — so one variable would conflate them.
  maxCodeSizeBytes: z.string(),
  gasTargetSpeedLimit: z.string(),

  // Inbox message size limit, which differs by parent chain.
  maxDataSizeL2: z.string(),
  maxDataSizeL3: z.string(),

  // AnyTrust DA
  dasMaxStoreChunkBytes: z.string(),

  // Timeboost
  timeboostNonExpressDelayMs: z.string(),
  timeboostRoundSeconds: z.string(),
  timeboostAuctionClosingSeconds: z.string(),

  // Stylus toolchain. cargo-stylus (the CLI) and stylus-sdk (the crate) are separate products that
  // happen to share a version today — keep them apart so bumping one does not silently bump the
  // other in every Cargo.toml example.
  stylusRustToolchain: z.string(),
  stylusRustToolchainFull: z.string(),
  cargoStylusVersion: z.string(),
  stylusSdkVersion: z.string(),

  // Arbitrum Expansion Program revenue share
  aepRevenueSharePercent: z.string(),
  arbOneForceIncludePeriodBlocks: z.number(),
  arbOneForceIncludePeriodHours: z.number(),
  arbOneBaesStakeEth: z.number(),
  arbOneGasFloorGwei: z.string(),
  arbOneBlockGasLimit: z.string(),
  novaDisputeWindowBlocks: z.number(),
  novaDisputeWindowDays: z.string(),
  novaForceIncludePeriodBlocks: z.number(),
  novaForceIncludePeriodHours: z.number(),
  novaBaesStakeEth: z.number(),
  novaGasFloorGwei: z.string(),
  novaBlockGasLimit: z.string(),
  sepoliaDisputeWindowBlocks: z.number(),
  sepoliaDisputeWindowMinutes: z.string(),
  sepoliaForceIncludePeriodBlocks: z.number(),
  sepoliaForceIncludePeriodHours: z.number(),
  sepoliaBaesStakeEth: z.number(),
  sepoliaGasFloorGwei: z.string(),
  sepoliaBlockGasLimit: z.string(),
});

export const vars = varsSchema.parse(varsJson);

export type VarKey = keyof typeof vars;
