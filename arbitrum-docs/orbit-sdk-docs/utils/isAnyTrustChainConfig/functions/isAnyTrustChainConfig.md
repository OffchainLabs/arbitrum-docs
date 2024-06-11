---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: isAnyTrustChainConfig()

> **isAnyTrustChainConfig**(`chainConfig`): `boolean`

Checks if there is any trust chain configuration present in the given ChainConfig object.

## Parameters

• **chainConfig**: [`ChainConfig`](../../../types/ChainConfig/type-aliases/ChainConfig.md)

The chain configuration object to be checked.

## Returns

`boolean`

- Returns true if there is a Data Availability Committee configuration, false otherwise.

## Source

[src/utils/isAnyTrustChainConfig.ts:10](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/utils/isAnyTrustChainConfig.ts#L10)
