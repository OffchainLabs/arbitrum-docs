---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: prepareNodeConfig()

> **prepareNodeConfig**(`params`): [`NodeConfig`](../../types/NodeConfig.generated/type-aliases/NodeConfig.md)

Prepares the configuration object for a node based on the provided parameters.

This function sets up various configurations such as chain information, parent chain details,
HTTP settings, node features like sequencer and batch poster, execution parameters, and data
availability settings if applicable.

## Parameters

• **params**: [`PrepareNodeConfigParams`](../type-aliases/PrepareNodeConfigParams.md)

The parameters for preparing the node configuration.

## Returns

[`NodeConfig`](../../types/NodeConfig.generated/type-aliases/NodeConfig.md)

- The prepared node configuration object.

## Throws

Will throw an error if parentChainBeaconRpcUrl is not provided for L2 Orbit chains.

## Example

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

## Source

[src/prepareNodeConfig.ts:116](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/prepareNodeConfig.ts#L116)
