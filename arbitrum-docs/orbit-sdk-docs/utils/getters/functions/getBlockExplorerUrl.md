---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function getBlockExplorerUrl(chain: Chain<undefined | ChainFormatters>): undefined | string;
```

Returns the URL of the block explorer for a given Chain.

## Parameters

| Parameter | Type                                        |
| :-------- | :------------------------------------------ |
| `chain`   | `Chain`\<`undefined` \| `ChainFormatters`\> |

## Returns

`undefined` \| `string`

## Source

[src/utils/getters.ts:32](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/utils/getters.ts#L32)
