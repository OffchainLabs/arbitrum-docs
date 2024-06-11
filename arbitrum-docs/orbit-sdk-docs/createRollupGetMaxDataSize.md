---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# createRollupGetMaxDataSize

## Functions

### createRollupGetMaxDataSize()

> **createRollupGetMaxDataSize**(`parentChainId`): `undefined` \| `bigint`

Calculates and returns the maximum data size allowed for a given parent chain.

This function determines the maximum data size for different chains such as mainnet,
testnet, and nitro-testnode, returning the appropriate value as a BigInt.

#### Parameters

• **parentChainId**: `any`

The ID of the parent chain.

#### Returns

`undefined` \| `bigint`

- The maximum data size allowed for the specified parent chain.

#### Source

[src/createRollupGetMaxDataSize.ts:22](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/createRollupGetMaxDataSize.ts#L22)
