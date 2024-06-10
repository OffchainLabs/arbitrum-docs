---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type RollupAdminLogicPrepareTransactionRequestParameters<TFunctionName>: Omit<RollupAdminLogicPrepareFunctionDataParameters<TFunctionName>, "abi"> & object;
```

## Type declaration

| Member | Type |
| :------ | :------ |
| `account` | `Address` |

## Type parameters

| Type parameter |
| :------ |
| `TFunctionName` *extends* [`RollupAdminLogicFunctionName`](RollupAdminLogicFunctionName.md) |

## Source

[src/rollupAdminLogicPrepareTransactionRequest.ts:71](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/rollupAdminLogicPrepareTransactionRequest.ts#L71)
