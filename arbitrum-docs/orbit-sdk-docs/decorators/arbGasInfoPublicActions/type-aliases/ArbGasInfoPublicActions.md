---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type ArbGasInfoPublicActions<TChain>: object;
```

## Type parameters

| Type parameter                            | Value                  |
| :---------------------------------------- | :--------------------- |
| `TChain` _extends_ `Chain` \| `undefined` | `Chain` \| `undefined` |

## Type declaration

| Member                   | Type                                                                                                                                                                                                                                                                                                                              |
| :----------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `arbGasInfoReadContract` | \<`TFunctionName`\>(`args`: [`ArbGasInfoReadContractParameters`](../../../arbGasInfoReadContract/type-aliases/ArbGasInfoReadContractParameters.md)\<`TFunctionName`\>) => `Promise` \<[`ArbGasInfoReadContractReturnType`](../../../arbGasInfoReadContract/type-aliases/ArbGasInfoReadContractReturnType.md)\<`TFunctionName`\>\> |

## Source

[src/decorators/arbGasInfoPublicActions.ts:10](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/decorators/arbGasInfoPublicActions.ts#L10)
