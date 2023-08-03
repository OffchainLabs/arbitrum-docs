const globalVars = {
  // Node versions
  latestNitroVersionTag: 'v2.0.14',

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
};

module.exports = globalVars;
