---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: prepareChainConfig()

> **prepareChainConfig**(`params`): [`ChainConfig`](../../types/ChainConfig/type-aliases/ChainConfig.md)

Merges the default chain configuration with the provided parameters.

This function takes in specific configurations for the Clique and Arbitrum
consensus algorithms and returns a complete [ChainConfig](../../types/ChainConfig/type-aliases/ChainConfig.md) object with
the updated values.

## Parameters

• **params**: [`PrepareChainConfigParams`](../type-aliases/PrepareChainConfigParams.md)

The parameters to merge with defaults.

## Returns

[`ChainConfig`](../../types/ChainConfig/type-aliases/ChainConfig.md)

The complete chain configuration object.

## Example

```ts
const customConfig = prepareChainConfig({
  chainId: 42161,
  clique: { period: 15, epoch: 30000 },
  arbitrum: { InitialChainOwner: '0xYourAddressHere' },
});
```

## Source

[src/prepareChainConfig.ts:78](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/prepareChainConfig.ts#L78)
