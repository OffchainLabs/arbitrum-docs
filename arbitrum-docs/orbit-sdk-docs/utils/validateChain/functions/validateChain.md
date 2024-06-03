---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function validateChain(chainIdOrPublicClient: number | object): ChainId
```

Validates the provided chain ID or PublicClient and ensures that it is a
supported chain within the system. Returns a ChainId.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `chainIdOrPublicClient` | `number` \| `object` |

## Returns

`ChainId`

## Source

[src/utils/validateChain.ts:15](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/utils/validateChain.ts#L15)
