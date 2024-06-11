---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

# Function: getDefaultConfirmPeriodBlocks()

> **getDefaultConfirmPeriodBlocks**(`parentChainIdOrPublicClient`): `bigint`

Returns the default number of confirmation blocks required for a transaction,
based on the parent chain provided.

## Parameters

• **parentChainIdOrPublicClient**: `any`

The parent chain ID or the public client instance.

## Returns

`bigint`

- The default number of confirmation blocks.

## Source

[src/getDefaultConfirmPeriodBlocks.ts:13](https://github.com/anegg0/arbitrum-orbit-sdk/blob/b24cbe9cd68eb30d18566196d2c909bd4086db10/src/getDefaultConfirmPeriodBlocks.ts#L13)
