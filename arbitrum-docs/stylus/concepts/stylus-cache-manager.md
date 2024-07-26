---
title: 'Stylus caching strategy'
description: 'A conceptual overview of the Stylus caching strategy and `CacheManager` contract, and explaining its functionality.'
sme: mahsa-moosavi
target_audience: 'Developers deploying smart contracts using Stylus.'
sidebar_position: 3
---

<a data-quicklook-from="stylus">Stylus</a> is designed for fast computation and efficiency. However,
the initialization process when entering a contract can be resource-intensive and time-consuming.

This initialization process, if repeated frequently, may lead to inefficiencies. To address this, we have implemented a caching strategy. By storing frequently accessed contracts in memory, we can avoid repeated initializations. This approach saves resources and time, significantly enhancing the speed and efficiency of contract execution.

**Note that Stylus smart contracts will need to be re-activated once per year (365 days) or whenever a upgrade to Stylus (which will always involve an ArbOS upgrade), even if they are in the cache. This re-activation can be done using [`cargo-stylus`](https://github.com/OffchainLabs/cargo-stylus), a cargo subcommand for building, verifying, and deploying Arbitrum Stylus WASM contracts in Rust.**



import PublicPreviewBannerPartial from '../partials/_stylus-public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

## CacheManager contract

The core component of our caching strategy is the [`CacheManager` contract](https://github.com/OffchainLabs/stylus-contracts/blob/c51ab1dc90f543caf579600162f77e053984b8cd/src/chain/`CacheManager`.sol). This smart contract manages the cache, interacts with precompiles, and determines which contracts should be cached. The `CacheManager` can hold approximately 4,000 contracts in memory.

The `CacheManager` defines how contracts remain in the cache and how they compete with other contracts for cache space. Its primary purpose is to reduce high initialization costs, ensuring efficient contract activation and usage. The contract includes methods for adding and removing cache entries, querying the status of cached contracts, and managing the lifecycle of cached data.

### Key features

The `CacheManager` plays a crucial role in our caching strategy by keeping a specific set of contracts in memory rather than retrieving them from disk. This significantly reduces the activation time for frequently accessed contracts. The `CacheManager` contract is an on-chain contract that accepts bids for inserting contract code into the cache. It then calls a precompile that loads or unloads the contracts in the `<a data-quicklook-from="arbos">ArbOS</a>` cache, which follows the on-chain cache but operates locally in the client and marks the contract as in or out of the cache in the `ArbOS` state.

The cache operates through an auction system where dApp developers submit bids to insert their contracts into the cache. If the cache is at capacity, lower bids are evicted to make space for higher bids. The cache maintains a minimum heap of bids for `codeHashes`, with bids encoded as `bid << 64 + index`, where `index` represents the position in the list of all bids. When an insertion exceeds the cache's maximum size, items are popped off the minimum heap and deleted until there is enough space to insert the new item. Contracts with equal bids will be popped in a random order, while the smallest bid is evicted first.

To ensure that developers periodically pay to maintain their position in the cache, we use a global decay parameter computed by `decay = block.timestamp * _decay`. This inflates the value of bids over time, making newer bids more valuable.

### Cache access and costs

During activation, we compute the contract's initialization costs for both non-cached and cached initialization. These costs take into account factors such as the number of functions, types, code size, data length, and memory usage. It's important to note that accessing an uncached contract does not automatically add it to the `CacheManager`'s cache. Only explicit calls to the `CacheManager` contract will add a contract to the cache. If a contract is removed from the cache, calling the contract becomes more expensive unless it is re-added.

To see how much gas contract initialization would cost, you need to call `programInitGas(address)` from the [ArbWasm precompile](https://github.com/OffchainLabs/nitro/blob/d906798140e562500beb9005d2503b0272852298/precompiles/ArbWasm.go). This function returns both the initialization cost when the contract is cached and when it is not.
