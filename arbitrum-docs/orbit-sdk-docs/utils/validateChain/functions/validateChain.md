---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function validateChain(chainIdOrPublicClient: number | object): ChainId;
```

Validates the provided chain ID or PublicClient and ensures that it is a
supported chain within the system. Returns a ChainId.

## Parameters

| Parameter               | Type                 |
| :---------------------- | :------------------- |
| `chainIdOrPublicClient` | `number` \| `object` |

## Returns

`ChainId`

## Source

[src/utils/validateChain.ts:15](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/utils/validateChain.ts#L15)
