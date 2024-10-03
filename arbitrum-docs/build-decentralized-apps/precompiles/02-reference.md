---
title: 'Precompiles reference'
description: A reference page of all precompiles available on Arbitrum chains
user_story: As a developer, I want to understand the most useful precompiles available on Arbitrum chains and how to use them.
content_type: reference
---

ArbOS provides L2-specific precompiles with methods smart contracts can call the same way they can solidity functions. This reference page exhaustively documents the specific calls ArbOS makes available through precompiles. For a more conceptual description of what precompiles are and how they work, please refer to the [precompiles conceptual page](/build-decentralized-apps/precompiles/01-overview.md).

This reference page is divided into two sections. The first one lists all precompiles in a summary table with links to the reference of the specific precompile, along with the address where they live, their purpose and links to the go implementation and solidity interface. The second one details the methods available in each precompile with links to the specific implementation.

## General information of precompiles

This section is divided into two tables. We first list precompiles we expect users to most often use, and then the rest of precompiles. However, both tables display the same information: name and purpose of the precompile, address, and links to the solidity interface and the go implementation.

### Common precompiles

| Precompile                        | Address | Solidity interface                         | Go implementation                                    | Purpose                             |
| --------------------------------- | ------- | ------------------------------------------ | ---------------------------------------------------- | ----------------------------------- |
| [ArbAggregator](#arbaggregator)   | `0x6d`  | [Interface][arbaggregator_link_interface]  | [Implementation][arbaggregator_link_implementation]  | Configuring transaction aggregation |
| [ArbGasInfo](#arbgasinfo)         | `0x6c`  | [Interface][arbgasinfo_link_interface]     | [Implementation][arbgasinfo_link_implementation]     | Info about gas pricing              |
| [ArbRetryableTx](#arbretryabletx) | `0x6e`  | [Interface][arbretryabletx_link_interface] | [Implementation][arbretryabletx_link_implementation] | Managing retryables                 |
| [ArbSys](#arbsys)                 | `0x64`  | [Interface][arbsys_link_interface]         | [Implementation][arbsys_link_implementation]         | System-level functionality          |
| [ArbWasm](#arbwasm)               | `0x71`  | [Interface][arbwasm_link_interface]        | [Implementation][arbwasm_link_implementation]        | Manages Stylus contracts            |
| [ArbWasmCache](#arbwasmcache)     | `0x72`  | [Interface][arbwasmcache_link_interface]   | [Implementation][arbwasmcache_link_implementation]   | Manages Stylus cache                |

### Other precompiles

| Precompile                            | Address | Solidity interface                           | Go implementation                                      | Purpose                                            |
| ------------------------------------- | ------- | -------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------- |
| [ArbAddressTable](#arbaddresstable)   | `0x66`  | [Interface][arbaddresstable_link_interface]  | [Implementation][arbaddresstable_link_implementation]  | Supporting compression of addresses                |
| ArbBLS                                | -       | -                                            | -                                                      | **Disabled** (Former registry of BLS public keys)  |
| [ArbDebug](#arbdebug)                 | `0xff`  | [Interface][arbdebug_link_interface]         | [Implementation][arbdebug_link_implementation]         | Testing tools                                      |
| [ArbFunctionTable](#arbfunctiontable) | `0x68`  | [Interface][arbfunctiontable_link_interface] | [Implementation][arbfunctiontable_link_implementation] | No longer used                                     |
| [ArbInfo](#arbinfo)                   | `0x65`  | [Interface][arbinfo_link_interface]          | [Implementation][arbinfo_link_implementation]          | Info about accounts                                |
| [ArbOwner](#arbowner)                 | `0x70`  | [Interface][arbowner_link_interface]         | [Implementation][arbowner_link_implementation]         | Chain administration, callable only by chain owner |
| [ArbOwnerPublic](#arbownerpublic)     | `0x6b`  | [Interface][arbownerpublic_link_interface]   | [Implementation][arbownerpublic_link_implementation]   | Info about chain owners                            |
| [ArbosTest](#arbostest)               | `0x69`  | [Interface][arbostest_link_interface]        | [Implementation][arbostest_link_implementation]        | No longer used                                     |
| [ArbStatistics](#arbstatistics)       | `0x6f`  | [Interface][arbstatistics_link_interface]    | [Implementation][arbstatistics_link_implementation]    | Info about the pre-Nitro state                     |

<!-- For clarity in the code, we add here all links to github, using "link references" (First the interfaces, and below the implementations) -->

[arbaddresstable_link_interface]: https://github.com/OffchainLabs/@nitroContractsRepositorySlug@/blob/@nitroContractsCommit@/@nitroContractsPathToPrecompilesInterface@/ArbAddressTable.sol
[arbaggregator_link_interface]: https://github.com/OffchainLabs/@nitroContractsRepositorySlug@/blob/@nitroContractsCommit@/@nitroContractsPathToPrecompilesInterface@/ArbAggregator.sol
[arbdebug_link_interface]: https://github.com/OffchainLabs/@nitroContractsRepositorySlug@/blob/@nitroContractsCommit@/@nitroContractsPathToPrecompilesInterface@/ArbDebug.sol
[arbfunctiontable_link_interface]: https://github.com/OffchainLabs/@nitroContractsRepositorySlug@/blob/@nitroContractsCommit@/@nitroContractsPathToPrecompilesInterface@/ArbFunctionTable.sol
[arbgasinfo_link_interface]: https://github.com/OffchainLabs/@nitroContractsRepositorySlug@/blob/@nitroContractsCommit@/@nitroContractsPathToPrecompilesInterface@/ArbGasInfo.sol
[arbinfo_link_interface]: https://github.com/OffchainLabs/@nitroContractsRepositorySlug@/blob/@nitroContractsCommit@/@nitroContractsPathToPrecompilesInterface@/ArbInfo.sol
[arbowner_link_interface]: https://github.com/OffchainLabs/@nitroContractsRepositorySlug@/blob/@nitroContractsCommit@/@nitroContractsPathToPrecompilesInterface@/ArbOwner.sol
[arbownerpublic_link_interface]: https://github.com/OffchainLabs/@nitroContractsRepositorySlug@/blob/@nitroContractsCommit@/@nitroContractsPathToPrecompilesInterface@/ArbOwnerPublic.sol
[arbostest_link_interface]: https://github.com/OffchainLabs/@nitroContractsRepositorySlug@/blob/@nitroContractsCommit@/@nitroContractsPathToPrecompilesInterface@/ArbosTest.sol
[arbretryabletx_link_interface]: https://github.com/OffchainLabs/@nitroContractsRepositorySlug@/blob/@nitroContractsCommit@/@nitroContractsPathToPrecompilesInterface@/ArbRetryableTx.sol
[arbstatistics_link_interface]: https://github.com/OffchainLabs/@nitroContractsRepositorySlug@/blob/@nitroContractsCommit@/@nitroContractsPathToPrecompilesInterface@/ArbStatistics.sol
[arbsys_link_interface]: https://github.com/OffchainLabs/@nitroContractsRepositorySlug@/blob/@nitroContractsCommit@/@nitroContractsPathToPrecompilesInterface@/ArbSys.sol
[arbwasm_link_interface]: https://github.com/OffchainLabs/@nitroContractsRepositorySlug@/blob/@nitroContractsCommit@/@nitroContractsPathToPrecompilesInterface@/ArbWasm.sol
[arbwasmcache_link_interface]: https://github.com/OffchainLabs/@nitroContractsRepositorySlug@/blob/@nitroContractsCommit@/@nitroContractsPathToPrecompilesInterface@/ArbWasmCache.sol
[arbaddresstable_link_implementation]: https://github.com/OffchainLabs/@nitroRepositorySlug@/blob/@nitroVersionTag@/@nitroPathToPrecompiles@/ArbAddressTable.go
[arbaggregator_link_implementation]: https://github.com/OffchainLabs/@nitroRepositorySlug@/blob/@nitroVersionTag@/@nitroPathToPrecompiles@/ArbAggregator.go
[arbdebug_link_implementation]: https://github.com/OffchainLabs/@nitroRepositorySlug@/blob/@nitroVersionTag@/@nitroPathToPrecompiles@/ArbDebug.go
[arbfunctiontable_link_implementation]: https://github.com/OffchainLabs/@nitroRepositorySlug@/blob/@nitroVersionTag@/@nitroPathToPrecompiles@/ArbFunctionTable.go
[arbgasinfo_link_implementation]: https://github.com/OffchainLabs/@nitroRepositorySlug@/blob/@nitroVersionTag@/@nitroPathToPrecompiles@/ArbGasInfo.go
[arbinfo_link_implementation]: https://github.com/OffchainLabs/@nitroRepositorySlug@/blob/@nitroVersionTag@/@nitroPathToPrecompiles@/ArbInfo.go
[arbowner_link_implementation]: https://github.com/OffchainLabs/@nitroRepositorySlug@/blob/@nitroVersionTag@/@nitroPathToPrecompiles@/ArbOwner.go
[arbownerpublic_link_implementation]: https://github.com/OffchainLabs/@nitroRepositorySlug@/blob/@nitroVersionTag@/@nitroPathToPrecompiles@/ArbOwnerPublic.go
[arbostest_link_implementation]: https://github.com/OffchainLabs/@nitroRepositorySlug@/blob/@nitroVersionTag@/@nitroPathToPrecompiles@/ArbosTest.go
[arbretryabletx_link_implementation]: https://github.com/OffchainLabs/@nitroRepositorySlug@/blob/@nitroVersionTag@/@nitroPathToPrecompiles@/ArbRetryableTx.go
[arbstatistics_link_implementation]: https://github.com/OffchainLabs/@nitroRepositorySlug@/blob/@nitroVersionTag@/@nitroPathToPrecompiles@/ArbStatistics.go
[arbsys_link_implementation]: https://github.com/OffchainLabs/@nitroRepositorySlug@/blob/@nitroVersionTag@/@nitroPathToPrecompiles@/ArbSys.go
[arbwasm_link_implementation]: https://github.com/OffchainLabs/@nitroRepositorySlug@/blob/@nitroVersionTag@/@nitroPathToPrecompiles@/ArbWasm.go
[arbwasmcache_link_implementation]: https://github.com/OffchainLabs/@nitroRepositorySlug@/blob/@nitroVersionTag@/@nitroPathToPrecompiles@/ArbWasmCache.go

## Precompiles reference

### ArbAddressTable

ArbAddressTable ([Interface][arbaddresstable_link_interface] | [Implementation][arbaddresstable_link_implementation]) provides the ability to create short-hands for commonly used accounts.

Precompile address: `0x0000000000000000000000000000000000000066`

import ArbAddressTableRef from '../../for-devs/dev-tools-and-resources/partials/precompile-tables/_ArbAddressTable.md';

<ArbAddressTableRef />

### ArbAggregator

ArbAggregator ([Interface][arbaggregator_link_interface] | [Implementation][arbaggregator_link_implementation]) provides aggregators and their users methods for configuring how they participate in L1 aggregation. Arbitrum One's default aggregator is the Sequencer, which a user will prefer unless `SetPreferredAggregator` is invoked to change it.

Compression ratios are measured in basis points. Methods that are checkmarked are access-controlled and will revert if not called by the aggregator, its fee collector, or a chain owner.

Precompile address: `0x000000000000000000000000000000000000006D`

import ArbAggregatorRef from '../../for-devs/dev-tools-and-resources/partials/precompile-tables/_ArbAggregator.md';

<ArbAggregatorRef />

### ArbBLS

:::caution Disabled

This precompile has been disabled. It previously provided a registry of BLS public keys for accounts.

:::

### ArbDebug

ArbDebug ([Interface][arbdebug_link_interface] | [Implementation][arbdebug_link_implementation]) provides mechanisms useful for testing. The methods of `ArbDebug` are only available for chains with the `AllowDebugPrecompiles` chain parameter set. Otherwise, calls to this precompile will revert.

Precompile address: `0x00000000000000000000000000000000000000ff`

import ArbDebugRef from '../../for-devs/dev-tools-and-resources/partials/precompile-tables/_ArbDebug.md';

<ArbDebugRef />

### ArbFunctionTable

ArbFunctionTable ([Interface][arbfunctiontable_link_interface] | [Implementation][arbfunctiontable_link_implementation]) provides aggregators the ability to manage function tables, to enable one form of transaction compression. The Nitro aggregator implementation does not use these, so these methods have been stubbed and their effects disabled. They are kept for backwards compatibility.

Precompile address: `0x0000000000000000000000000000000000000068`

import ArbFunctionTableRef from '../../for-devs/dev-tools-and-resources/partials/precompile-tables/_ArbFunctionTable.md';

<ArbFunctionTableRef />

### ArbGasInfo

ArbGasInfo ([Interface][arbgasinfo_link_interface] | [Implementation][arbgasinfo_link_implementation]) provides insight into the cost of using the chain. These methods have been adjusted to account for Nitro's heavy use of calldata compression. Of note to end-users, we no longer make a distinction between non-zero and zero-valued calldata bytes.

Precompile address: `0x000000000000000000000000000000000000006C`

import ArbGasInfoRef from '../../for-devs/dev-tools-and-resources/partials/precompile-tables/_ArbGasInfo.md';

<ArbGasInfoRef />

### ArbInfo

ArbInfo ([Interface][arbinfo_link_interface] | [Implementation][arbinfo_link_implementation]) provides the ability to lookup basic info about accounts and contracts.

Precompile address: `0x0000000000000000000000000000000000000065`

import ArbInfoRef from '../../for-devs/dev-tools-and-resources/partials/precompile-tables/_ArbInfo.md';

<ArbInfoRef />

### ArbosTest

ArbosTest ([Interface][arbostest_link_interface] | [Implementation][arbostest_link_implementation]) provides a method of burning arbitrary amounts of gas, which exists for historical reasons. In Classic, `ArbosTest` had additional methods only the zero address could call. These have been removed since users don't use them and calls to missing methods revert.

Precompile address: `0x0000000000000000000000000000000000000069`

import ArbosTestRef from '../../for-devs/dev-tools-and-resources/partials/precompile-tables/_ArbosTest.md';

<ArbosTestRef />

### ArbOwner

ArbOwner ([Interface][arbowner_link_interface] | [Implementation][arbowner_link_implementation]) provides owners with tools for managing the rollup. Calls by non-owners will always revert.

Most of Arbitrum Classic's owner methods have been removed since they no longer make sense in Nitro:

- What were once chain parameters are now parts of ArbOS's state, and those that remain are set at genesis.
- ArbOS upgrades happen with the rest of the system rather than being independent
- Exemptions to address aliasing are no longer offered. Exemptions were intended to support backward compatibility for contracts deployed before aliasing was introduced, but no exemptions were ever requested.

Precompile address: `0x0000000000000000000000000000000000000070`

import ArbOwnerRef from '../../for-devs/dev-tools-and-resources/partials/precompile-tables/_ArbOwner.md';

<ArbOwnerRef />

### ArbOwnerPublic

ArbOwnerPublic ([Interface][arbownerpublic_link_interface] | [Implementation][arbownerpublic_link_implementation]) provides non-owners with info about the current chain owners.

Precompile address: `0x000000000000000000000000000000000000006b`

import ArbOwnerPublicRef from '../../for-devs/dev-tools-and-resources/partials/precompile-tables/_ArbOwnerPublic.md';

<ArbOwnerPublicRef />

### ArbRetryableTx

ArbRetryableTx ([Interface][arbretryabletx_link_interface] | [Implementation][arbretryabletx_link_implementation]) provides methods for managing retryables. The model has been adjusted for Nitro, most notably in terms of how retry transactions are scheduled. For more information on retryables, please see [the retryable documentation](/how-arbitrum-works/arbos/introduction.md#Retryables).

Precompile address: `0x000000000000000000000000000000000000006E`

import ArbRetryableTxRef from '../../for-devs/dev-tools-and-resources/partials/precompile-tables/_ArbRetryableTx.md';

<ArbRetryableTxRef />

### ArbStatistics

ArbStatistics ([Interface][arbstatistics_link_interface] | [Implementation][arbstatistics_link_implementation]) provides statistics about the chain as of just before the Nitro upgrade. In Arbitrum Classic, this was how a user would get info such as the total number of accounts, but there are better ways to get that info in Nitro.

Precompile address: `0x000000000000000000000000000000000000006F`

import ArbStatisticsRef from '../../for-devs/dev-tools-and-resources/partials/precompile-tables/_ArbStatistics.md';

<ArbStatisticsRef />

### ArbSys

ArbSys ([Interface][arbsys_link_interface] | [Implementation][arbsys_link_implementation]) provides system-level functionality for interacting with L1 and understanding the call stack.

Precompile address: `0x0000000000000000000000000000000000000064`

import ArbSysRef from '../../for-devs/dev-tools-and-resources/partials/precompile-tables/_ArbSys.md';

<ArbSysRef />

### ArbWasm

ArbWasm ([Interface][arbwasm_link_interface] | [Implementation][arbwasm_link_implementation]) provides helper methods for managing Stylus contracts

Precompile address: `0x0000000000000000000000000000000000000071`

import ArbWasmRef from '../../for-devs/dev-tools-and-resources/partials/precompile-tables/_ArbWasm.md';

<ArbWasmRef />

### ArbWasmCache

ArbWasmCache ([Interface][arbwasmcache_link_interface] | [Implementation][arbwasmcache_link_implementation]) provides helper methods for managing Stylus cache

Precompile address: `0x0000000000000000000000000000000000000072`

import ArbWasmCacheRef from '../../for-devs/dev-tools-and-resources/partials/precompile-tables/_ArbWasmCache.md';

<ArbWasmCacheRef />
