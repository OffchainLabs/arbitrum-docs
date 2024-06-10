---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type ArbGasInfoReadContractParameters<TFunctionName>: object & GetFunctionArgs<ArbGasInfoAbi, TFunctionName>;
```

## Type declaration

| Member | Type |
| :------ | :------ |
| `functionName` | `TFunctionName` |

## Type parameters

| Type parameter |
| :------ |
| `TFunctionName` *extends* [`ArbGasInfoFunctionName`](ArbGasInfoFunctionName.md) |

## Source

[src/arbGasInfoReadContract.ts:9](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/arbGasInfoReadContract.ts#L9)
