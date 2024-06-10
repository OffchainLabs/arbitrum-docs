---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type ArbAggregatorActions<TChain>: object;
```

## Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TChain` *extends* `Chain` \| `undefined` | `Chain` \| `undefined` |

## Type declaration

| Member | Type |
| :------ | :------ |
| `arbAggregatorPrepareTransactionRequest` | \<`TFunctionName`\>(`args`: [`ArbAggregatorPrepareTransactionRequestParameters`](../../../arbAggregatorPrepareTransactionRequest/type-aliases/ArbAggregatorPrepareTransactionRequestParameters.md)\<`TFunctionName`\>) => `Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\> |
| `arbAggregatorReadContract` | \<`TFunctionName`\>(`args`: [`ArbAggregatorReadContractParameters`](../../../arbAggregatorReadContract/type-aliases/ArbAggregatorReadContractParameters.md)\<`TFunctionName`\>) => `Promise` \<[`ArbAggregatorReadContractReturnType`](../../../arbAggregatorReadContract/type-aliases/ArbAggregatorReadContractReturnType.md)\<`TFunctionName`\>\> |

## Source

[src/decorators/arbAggregatorActions.ts:15](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/27c24d61cdc7e62a81af29bd04f39d5a3549ecb3/src/decorators/arbAggregatorActions.ts#L15)
