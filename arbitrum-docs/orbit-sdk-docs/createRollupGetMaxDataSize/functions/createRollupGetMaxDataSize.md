---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
function createRollupGetMaxDataSize(parentChainId: any): undefined | bigint
```

createRollupGetMaxDataSize calculates and returns the maximum data size
allowed for a given parent chain, based on the ParentChainId provided. It
determines the maximum data size for different chains such as mainnet,
testnet, and nitro-testnode, returning the appropriate value as a BigInt.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `parentChainId` | `any` |

## Returns

`undefined` \| `bigint`

## Source

[src/createRollupGetMaxDataSize.ts:19](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/cfcbd32d6879cf7817a33b24f062a0fd879ea257/src/createRollupGetMaxDataSize.ts#L19)
