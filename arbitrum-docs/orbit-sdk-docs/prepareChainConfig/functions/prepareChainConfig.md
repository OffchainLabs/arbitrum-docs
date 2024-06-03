---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function prepareChainConfig(params: PrepareChainConfigParams): ChainConfig
```

PrepareChainConfig merges the default chain configuration with the provided
parameters, including specific configurations for the Clique and Arbitrum
consensus algorithms. It returns a ChainConfig object with the
updated values.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `params` | `PrepareChainConfigParams` |

## Returns

`ChainConfig`

## Source

[src/prepareChainConfig.ts:53](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/prepareChainConfig.ts#L53)
