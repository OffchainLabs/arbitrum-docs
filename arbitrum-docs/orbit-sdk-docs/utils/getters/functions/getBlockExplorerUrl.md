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

[src/utils/getters.ts:32](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/utils/getters.ts#L32)
