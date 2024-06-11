---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# utils/isAnyTrustChainConfig

## Functions

### isAnyTrustChainConfig()

> **isAnyTrustChainConfig**(`chainConfig`): `boolean`

Checks if there is any trust chain configuration present in the given ChainConfig object.

#### Parameters

• **chainConfig**: [`ChainConfig`](../types/ChainConfig.md#chainconfig)

The chain configuration object to be checked.

#### Returns

`boolean`

- Returns true if there is a Data Availability Committee configuration, false otherwise.

#### Source

[src/utils/isAnyTrustChainConfig.ts:10](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/utils/isAnyTrustChainConfig.ts#L10)
