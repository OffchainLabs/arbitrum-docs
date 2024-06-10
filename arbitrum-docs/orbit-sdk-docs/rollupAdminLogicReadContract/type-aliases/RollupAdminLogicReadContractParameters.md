---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type RollupAdminLogicReadContractParameters<TFunctionName>: object & GetFunctionArgs<RollupAdminLogicAbi, TFunctionName>;
```

## Type declaration

| Member | Type |
| :------ | :------ |
| `functionName` | `TFunctionName` |
| `rollup` | `Address` |

## Type parameters

| Type parameter |
| :------ |
| `TFunctionName` *extends* [`RollupAdminLogicFunctionName`](RollupAdminLogicFunctionName.md) |

## Source

[src/rollupAdminLogicReadContract.ts:18](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/rollupAdminLogicReadContract.ts#L18)
