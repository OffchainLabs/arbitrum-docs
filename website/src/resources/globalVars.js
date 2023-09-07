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
  latestNitroNodeImage: 'offchainlabs/nitro-node:v2.0.14-2baa834',
  latestClassicNodeImage: 'offchainlabs/arb-node:v1.4.5-e97c1a4',

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
  nitroVersionTag: 'v2.0.14',
  nitroPathToPrecompiles: 'precompiles',

  nitroContractsRepositorySlug: 'nitro',
  nitroContractsCommit: 'v2.0.14',
  nitroContractsPathToPrecompilesInterface: 'contracts/src/precompiles',

  // gas floor
  arbOneGasFloorGwei: '0.1',
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
  arbOneBaesStakeEth: 1,
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
