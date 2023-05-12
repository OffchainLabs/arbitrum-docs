const globalVars = {
    // Node docker images
    latestNitroNodeImage: 'offchainlabs/nitro-node:v2.0.14-2baa834',
    latestClassicNodeImage: 'offchainlabs/arb-node:v1.4.5-e97c1a4',

    // Node snapshots (taken around April 20th, 2013)
    arbOneNitroGenesisSnapshot: 'https://snapshot.arbitrum.foundation/arb1/nitro-genesis.tar',
    arbOneNitroPrunedSnapshot: 'https://snapshot.arbitrum.foundation/arb1/nitro-pruned.tar',
    arbOneClassicArchiveSnapshot: 'https://snapshot.arbitrum.foundation/arb1/classic-archive.tar',
}

module.exports = globalVars;