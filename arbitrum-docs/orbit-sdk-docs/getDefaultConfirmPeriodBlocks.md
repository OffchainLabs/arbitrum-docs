---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# getDefaultConfirmPeriodBlocks

## Functions

### getDefaultConfirmPeriodBlocks()

> **getDefaultConfirmPeriodBlocks**(`parentChainIdOrPublicClient`): `bigint`

Returns the default number of confirmation blocks required for a transaction,
based on the parent chain provided.

#### Parameters

• **parentChainIdOrPublicClient**: `any`

The parent chain ID or the public client instance.

#### Returns

`bigint`

- The default number of confirmation blocks.

#### Source

[src/getDefaultConfirmPeriodBlocks.ts:13](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/getDefaultConfirmPeriodBlocks.ts#L13)
