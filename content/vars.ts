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
 * Values started as a copy of the Docusaurus site's
 * `src/resources/globalVars.js`. That site is archived, so this file is the
 * only copy and there is nothing left to keep it in sync with.
 */
const varsSchema = z.strictObject({
  // --- This repository's own identity (FS-2733) ---------------------------
  // The single owner of the docs repository's GitHub URL, read from two sides.
  // `gitConfig` in `lib/shared.ts` composes the edit link and the "Request an
  // update" issue link from it, and the contribute guide writes its own links
  // as `{var:docsRepositoryUrl}/blob/{var:docsRepositoryBranch}/…`. Before
  // this, that guide hardcoded six URLs beside a comment asking a human to
  // retarget them by hand, and `check-links` skips every external destination,
  // so a rename would have left six dead links with no gate turning red.
  //
  // `docsRepositoryUrl` is the one value that flips at cutover, when this
  // repository takes over the `OffchainLabs/arbitrum-docs` name and URL.
  // Everything else that names the repository follows from it.
  //
  // The branch is `.min(1)` for the same reason `announcementId` carries a
  // pattern: an empty string passes every other gate and reaches the reader as
  // a broken link: `…/blob//CONTRIBUTE.md` redirects to `…/tree/CONTRIBUTE.md`
  // and ends at a GitHub 404, measured. Neither `vars:check` nor `check-links`
  // would see it, since the one only proves the key exists and the other skips
  // every external destination. A trailing slash on the URL is left alone by
  // contrast, because GitHub answers 200 on the doubled slash it produces.
  docsRepositoryUrl: z.url(),
  docsRepositoryBranch: z
    .string()
    .min(1, 'docsRepositoryBranch must name a branch, because it is spliced into a /blob/ URL'),
  // --- end repository identity --------------------------------------------

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
  l1SlotTimeSeconds: z.number(),
  l2BlockTimeMs: z.number(),
  maxCodeSizeBytes: z.string(),
  gasTargetSpeedLimit: z.string(),
  maxDataSizeL2: z.number(),
  maxDataSizeL3: z.number(),
  dasMaxStoreChunkBytes: z.number(),
  timeboostRoundSeconds: z.number(),
  timeboostAuctionClosingSeconds: z.number(),
  timeboostNonExpressDelayMs: z.number(),
  stylusRustToolchain: z.string(),
  stylusRustToolchainFull: z.string(),
  cargoStylusVersion: z.string(),
  stylusSdkVersion: z.string(),
  aepRevenueSharePercent: z.number(),

  // --- Announcement banner (FS-2667) -------------------------------------
  // Not `<Var>` substitutions: these are read by app/layout.tsx to render the
  // site-wide banner, so `pnpm vars:check` lists them as configured but
  // unreferenced in MDX. That warning is expected for this block.
  //
  // `announcementId` is the Fumadocs Banner id and doubles as the dismissal
  // key: a viewer who closes the banner never sees that id again, so changing
  // the message means changing the id too or the new text stays hidden from
  // everyone who dismissed the old one.
  //
  // The pattern is not cosmetic. Banner writes the id into the element's `id`
  // attribute and into a generated rule of the shape `.<key> #<id>{display:none}`.
  // The class half is base32-encoded and always safe; the `#<id>` half is the
  // raw value, so a space or a leading digit yields a selector that parses to
  // nothing. Dismissal would then appear to work and the banner would come back
  // on the next page load, with no error anywhere. Fail at module load instead.
  announcementEnabled: z.boolean(),
  announcementText: z.string(),
  announcementLinkText: z.string(),
  announcementLinkHref: z.string(),
  announcementId: z
    .string()
    .regex(
      /^[A-Za-z][A-Za-z0-9_-]*$/,
      'announcementId must start with a letter and contain only letters, digits, hyphens and underscores, because it is used verbatim as an HTML id and as a CSS #id selector',
    ),
  // --- end announcement banner -------------------------------------------
});

export const vars = varsSchema.parse(varsJson);

export type VarKey = keyof typeof vars;
