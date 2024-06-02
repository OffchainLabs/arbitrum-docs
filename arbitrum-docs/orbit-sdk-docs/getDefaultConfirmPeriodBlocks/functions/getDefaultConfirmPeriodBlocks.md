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

[src/getDefaultConfirmPeriodBlocks.ts:10](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/getDefaultConfirmPeriodBlocks.ts#L10)
