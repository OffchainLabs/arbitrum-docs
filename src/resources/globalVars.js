/**
 * ⚠️ IMPORTANT: After modifying any values in this file:
 * 1. Run `yarn update-variable-refs` to update all references in the docs
 * 2. Run `yarn generate-precompiles-ref-tables` if you modified any precompile-related values
 *
 * Without running update-variable-refs, your changes won't be reflected in the docs
 * due to Vercel's caching behavior.
 */

const L1_BLOCK_TIME_SECONDS = 12.1;

const arbOneDisputeWindowBlocks = 45818;
const novaDisputeWindowBlocks = 45818;
const goerliDisputeWindowBlocks = 20;
const sepoliaDisputeWindowBlocks = 20;

const arbOneForceIncludePeriodBlocks = 5760;
const novaForceIncludePeriodBlocks = 5760;
const goerliForceIncludePeriodBlocks = 5760;
const sepoliaForceIncludePeriodBlocks = 5760;

const globalVars = {
  // Node docker images
  latestNitroNodeImage: 'offchainlabs/nitro-node:v3.9.4-7f582c3',
  latestClassicNodeImage: 'offchainlabs/arb-node:v1.4.6-551a39b3',

  // Node snapshots (taken around April 20th, 2013)
  arbOneNitroGenesisSnapshot: 'https://snapshot.arbitrum.foundation/arb1/nitro-genesis.tar',
  arbOneNitroPrunedSnapshot: 'https://snapshot.arbitrum.foundation/arb1/nitro-pruned.tar',
  arbNovaPrunedSnapshot: 'https://snapshot.arbitrum.foundation/nova/nitro-pruned.tar',
  arbGoerliPrunedSnapshot: 'https://snapshot.arbitrum.foundation/goerli/nitro-pruned.tar',
  arbOneClassicSnapshot: 'https://snapshot.arbitrum.foundation/arb1/classic-export.tar',

  arbOneNitroArchiveSnapshot: 'https://snapshot.arbitrum.foundation/arb1/nitro-archive.tar',
  arbNovaArchiveSnapshot: 'https://snapshot.arbitrum.foundation/nova/nitro-archive.tar',
  arbGoerliArchiveSnapshot: 'https://snapshot.arbitrum.foundation/goerli/nitro-archive.tar',
  arbOneClassicArchiveSnapshot: 'https://snapshot.arbitrum.foundation/arb1/classic-archive.tar',

  // Nitro Github references
  nitroRepositorySlug: 'nitro',
  nitroVersionTag: 'v3.9.3',
  nitroPathToPrecompiles: 'precompiles',

  nitroContractsRepositorySlug: 'nitro-contracts',
  nitroContractsCommit: '5f61a6b0e9799d7ccc0b3811f3893c68a14e43bf',
  nitroContractsPathToPrecompilesInterface: 'src/node-interface',

  // Precompile interfaces repository
  nitroPrecompilesRepositorySlug: 'nitro-precompile-interfaces',
  nitroPrecompilesCommit: 'f49a4889b486fd804a7901203f5f663cfd1581c8',
  nitroPrecompilesPathToInterfaces: '',

  goEthereumCommit: 'ae34a6a9ef5af5079c8eef6571895d703023efef',

  nitroPathToArbos: 'arbos',
  nitroPathToArbosState: 'arbos/arbosState',
  nitroPathToStorage: 'arbos/storage',

  // gas floor
  arbOneGasFloorGwei: '0.01',
  novaGasFloorGwei: '0.01',
  goerliGasFloorGwei: '0.1',
  sepoliaGasFloorGwei: '0.1',

  // dispute window
  arbOneDisputeWindowBlocks,
  novaDisputeWindowBlocks,
  goerliDisputeWindowBlocks,
  sepoliaDisputeWindowBlocks,

  arbOneDisputeWindowDays: blocksToDays(arbOneDisputeWindowBlocks),
  novaDisputeWindowDays: blocksToDays(novaDisputeWindowBlocks),
  goerliDisputeWindowMinutes: blocksToMinutes(goerliDisputeWindowBlocks),
  sepoliaDisputeWindowMinutes: blocksToMinutes(sepoliaDisputeWindowBlocks),

  // base stake
  arbOneBaesStakeEth: 3600,
  novaBaesStakeEth: 1,
  goerliBaesStakeEth: 1,
  sepoliaBaesStakeEth: 1,

  // force include period

  arbOneForceIncludePeriodBlocks,
  novaForceIncludePeriodBlocks,
  goerliForceIncludePeriodBlocks,
  sepoliaForceIncludePeriodBlocks,

  arbOneForceIncludePeriodHours: secondsToHours(86400),
  novaForceIncludePeriodHours: secondsToHours(86400),
  goerliForceIncludePeriodHours: secondsToHours(86400),
  sepoliaForceIncludePeriodHours: secondsToHours(86400),

  // speed limit
  arbOneGasSpeedLimitGasPerSec: '7,000,000',
  novaGasSpeedLimitGasPerSec: '7,000,000',
  goerliGasSpeedLimitGasPerSec: '3,000,000',
  sepoliaGasSpeedLimitGasPerSec: '7,000,000',

  // block gas limit
  arbOneBlockGasLimit: '32,000,000',
  novaBlockGasLimit: '32,000,000',
  goerliBlockGasLimit: '20,000,000',
  sepoliaBlockGasLimit: '32,000,000',

  // portal application form
  portalApplicationForm:
    'https://docs.google.com/forms/d/e/1FAIpQLSc_v8j7sc4ffE6U-lJJyLMdBoIubf7OIhGtCqvK3cGPGoLr7w/viewform',
};

function blocksToMinutes(blocks) {
  return ((blocks * L1_BLOCK_TIME_SECONDS) / 60).toFixed(1);
}

function blocksToHours(blocks) {
  return ((blocks * L1_BLOCK_TIME_SECONDS) / (60 * 60)).toFixed(1);
}
function blocksToDays(blocks) {
  return ((blocks * L1_BLOCK_TIME_SECONDS) / (60 * 60 * 24)).toFixed(1);
}

function secondsToHours(seconds) {
  return seconds / (60 * 60);
}

module.exports = globalVars;
