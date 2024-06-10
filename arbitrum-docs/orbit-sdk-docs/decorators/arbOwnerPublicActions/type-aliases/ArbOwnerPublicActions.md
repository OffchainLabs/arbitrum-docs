---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
type ArbOwnerPublicActions<TChain>: object;
```

## Type parameters

| Type parameter | Value |
| :------ | :------ |
| `TChain` *extends* `Chain` \| `undefined` | `Chain` \| `undefined` |

## Type declaration

| Member | Type |
| :------ | :------ |
| `arbOwnerPrepareTransactionRequest` | \<`TFunctionName`\>(`args`: [`ArbOwnerPrepareTransactionRequestParameters`](../../../arbOwnerPrepareTransactionRequest/type-aliases/ArbOwnerPrepareTransactionRequestParameters.md)\<`TFunctionName`\>) => `Promise`\<`PrepareTransactionRequestReturnType`\<`TChain`\> & `object`\> |
| `arbOwnerReadContract` | \<`TFunctionName`\>(`args`: [`ArbOwnerReadContractParameters`](../../../arbOwnerReadContract/type-aliases/ArbOwnerReadContractParameters.md)\<`TFunctionName`\>) => `Promise` \<[`ArbOwnerReadContractReturnType`](../../../arbOwnerReadContract/type-aliases/ArbOwnerReadContractReturnType.md)\<`TFunctionName`\>\> |

## Source

[src/decorators/arbOwnerPublicActions.ts:15](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/decorators/arbOwnerPublicActions.ts#L15)
