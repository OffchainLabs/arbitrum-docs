---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function getDefaultConfirmPeriodBlocks(parentChainIdOrPublicClient: any): bigint
```

Returns the default number of confirmation blocks required for a transaction,
based on the parent chain provided.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `parentChainIdOrPublicClient` | `any` |

## Returns

`bigint`

## Source

[src/getDefaultConfirmPeriodBlocks.ts:10](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/getDefaultConfirmPeriodBlocks.ts#L10)
