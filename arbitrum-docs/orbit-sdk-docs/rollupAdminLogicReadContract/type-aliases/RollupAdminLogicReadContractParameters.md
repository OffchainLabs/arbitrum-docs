---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type RollupAdminLogicReadContractParameters<TFunctionName>: object & GetFunctionArgs<RollupAdminLogicAbi, TFunctionName>;
```

## Type declaration

| Member         | Type            |
| :------------- | :-------------- |
| `functionName` | `TFunctionName` |
| `rollup`       | `Address`       |

## Type parameters

| Type parameter                                                                              |
| :------------------------------------------------------------------------------------------ |
| `TFunctionName` _extends_ [`RollupAdminLogicFunctionName`](RollupAdminLogicFunctionName.md) |

## Source

[src/rollupAdminLogicReadContract.ts:18](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/rollupAdminLogicReadContract.ts#L18)
