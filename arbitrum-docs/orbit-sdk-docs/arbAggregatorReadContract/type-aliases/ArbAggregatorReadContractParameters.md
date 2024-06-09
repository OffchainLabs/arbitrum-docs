---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type ArbAggregatorReadContractParameters<TFunctionName>: object & GetFunctionArgs<ArbAggregatorAbi, TFunctionName>;
```

## Type declaration

| Member | Type |
| :------ | :------ |
| `functionName` | `TFunctionName` |

## Type parameters

| Type parameter |
| :------ |
| `TFunctionName` *extends* [`ArbAggregatorFunctionName`](ArbAggregatorFunctionName.md) |

## Source

[src/arbAggregatorReadContract.ts:9](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/arbAggregatorReadContract.ts#L9)
