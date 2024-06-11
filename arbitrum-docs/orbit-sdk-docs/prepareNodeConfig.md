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

[src/prepareNodeConfig.ts:72](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/prepareNodeConfig.ts#L72)

## Functions

### prepareNodeConfig()

> **prepareNodeConfig**(`params`): [`NodeConfig`](types/NodeConfig-1.md#nodeconfig)

Prepares the configuration object for a node based on the provided parameters.

This function sets up various configurations such as chain information, parent chain details,
HTTP settings, node features like sequencer and batch poster, execution parameters, and data
availability settings if applicable.

#### Parameters

• **params**: [`PrepareNodeConfigParams`](prepareNodeConfig.md#preparenodeconfigparams)

The parameters for preparing the node configuration.

#### Returns

[`NodeConfig`](types/NodeConfig-1.md#nodeconfig)

- The prepared node configuration object.

#### Throws

Will throw an error if parentChainBeaconRpcUrl is not provided for L2 Orbit chains.

#### Example

```ts
const nodeConfig = prepareNodeConfig({
  chainName: 'MyChain',
  chainConfig: myChainConfig,
  coreContracts: myCoreContracts,
  batchPosterPrivateKey: '0xabc123',
  validatorPrivateKey: '0xdef456',
  parentChainId: mainnet.id,
  parentChainRpcUrl: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
  parentChainBeaconRpcUrl: 'https://beacon-mainnet.infura.io/v3/YOUR-PROJECT-ID',
});
console.log(nodeConfig);
```

#### Source

[src/prepareNodeConfig.ts:116](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/prepareNodeConfig.ts#L116)
