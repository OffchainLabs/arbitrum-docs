---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type ArbAggregatorPrepareTransactionRequestParameters<TFunctionName>: Omit<ArbAggregatorPrepareFunctionDataParameters<TFunctionName>, "abi"> & object;
```

## Type declaration

| Member | Type |
| :------ | :------ |
| `account` | `Address` |

## Type parameters

| Type parameter |
| :------ |
| `TFunctionName` *extends* [`ArbAggregatorPrepareTransactionRequestFunctionName`](ArbAggregatorPrepareTransactionRequestFunctionName.md) |

## Source

[src/arbAggregatorPrepareTransactionRequest.ts:66](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/arbAggregatorPrepareTransactionRequest.ts#L66)
