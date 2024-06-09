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

[src/arbAggregatorPrepareTransactionRequest.ts:66](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/arbAggregatorPrepareTransactionRequest.ts#L66)
