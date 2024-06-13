---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# prepareNodeConfig

## Type Aliases

### PrepareNodeConfigParams

> **PrepareNodeConfigParams**: `object`

#### Type declaration

##### batchPosterPrivateKey

> **batchPosterPrivateKey**: `string`

##### chainConfig

> **chainConfig**: [`ChainConfig`](types/ChainConfig.md#chainconfig)

##### chainName

> **chainName**: `string`

##### coreContracts

> **coreContracts**: [`CoreContracts`](types/CoreContracts.md#corecontracts)

##### parentChainBeaconRpcUrl?

> `optional` **parentChainBeaconRpcUrl**: `string`

##### parentChainId

> **parentChainId**: [`ParentChainId`](types/ParentChain.md#parentchainid)

##### parentChainRpcUrl

> **parentChainRpcUrl**: `string`

##### validatorPrivateKey

> **validatorPrivateKey**: `string`

#### Source

[prepareNodeConfig.ts:27](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/prepareNodeConfig.ts#L27)

## Functions

### prepareNodeConfig()

> **prepareNodeConfig**(`__namedParameters`): [`NodeConfig`](types/NodeConfig-1.md#nodeconfig)

#### Parameters

• **\_\_namedParameters**: [`PrepareNodeConfigParams`](prepareNodeConfig.md#preparenodeconfigparams)

#### Returns

[`NodeConfig`](types/NodeConfig-1.md#nodeconfig)

#### Source

[prepareNodeConfig.ts:46](https://github.com/offchainlabs/arbitrum-orbit-sdk/blob/fa20b8d23170b5196c4c9cdb5fc2dfefa349f1c8/src/prepareNodeConfig.ts#L46)
