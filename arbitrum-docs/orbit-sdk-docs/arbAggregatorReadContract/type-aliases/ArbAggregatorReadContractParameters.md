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

[src/arbAggregatorReadContract.ts:9](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/arbAggregatorReadContract.ts#L9)
